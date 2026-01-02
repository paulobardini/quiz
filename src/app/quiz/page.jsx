"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizCard from "@/components/QuizCard";
import {
  getNextQuestion,
  submitAnswer,
  completeSession,
} from "@/lib/api";
import {
  getSessionId,
  getResultId,
  setResultId,
  incrementHomeRedirectCount,
  checkAndClearStorageIfNeeded,
  clearQuizStorage,
} from "@/lib/storage";

// Importar getResultId para verificação

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

export default function QuizPage() {
  const router = useRouter();
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [progress, setProgress] = useState({ answered: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuestion = async () => {
      // Verifica e limpa o storage se necessário
      // Mas NÃO limpa se já existe um resultId (resultado já foi gerado)
      const existingResultId = getResultId();
      if (!existingResultId && checkAndClearStorageIfNeeded()) {
        router.push("/");
        return;
      }
      
      // Se existe resultId, redireciona para resultado em vez de limpar
      if (existingResultId) {
        router.push("/result");
        return;
      }

      const sessionId = getSessionId();
      if (!sessionId) {
        incrementHomeRedirectCount();
        router.push("/");
        return;
      }

      try {
        const data = await getNextQuestion({ sessionId });

        if (data.done) {
          await handleComplete(sessionId);
          return;
        }

        if (data.question && data.options) {
          setQuestion(data.question);
          setOptions(data.options);
          setProgress(data.progress || { answered: 0, total: 0 });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Tratamento silencioso para erro 409
        if (errorMessage.includes("409") || errorMessage.includes("Sessão não está em progresso")) {
          // Verifica se o storage deve ser limpo (5 redirecionamentos ou 1 hora)
          if (checkAndClearStorageIfNeeded()) {
            // Se limpou, redireciona para home para permitir novo teste
            router.push("/");
            return;
          }
          
          // Primeiro verifica se já existe um resultado
          const resultId = getResultId();
          if (resultId) {
            router.push("/result");
            return;
          }
          
          // Se não existe resultado, tenta completar a sessão para obter o resultado
          if (sessionId) {
            try {
              const response = await completeSession({ sessionId });
              if (response.resultId) {
                setResultId(response.resultId);
                router.push("/result");
                return;
              }
            } catch (completeError) {
              // Se falhar ao completar, incrementa contador e redireciona para home
              incrementHomeRedirectCount();
              clearQuizStorage();
              router.push("/");
              return;
            }
          }
          
          // Se não conseguiu completar, incrementa contador e redireciona para home
          incrementHomeRedirectCount();
          clearQuizStorage();
          router.push("/");
          return;
        }
        
        // Para outros erros, incrementa contador e redireciona para home
        incrementHomeRedirectCount();
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestion();
  }, [router]);

  const handleComplete = async (sessionId) => {
    try {
      console.log("Completando sessão:", sessionId);
      const response = await completeSession({ sessionId });
      console.log("Resposta do completeSession:", response);
      
      // Verifica se response existe e tem resultId
      const resultId = response?.resultId;
      
      if (resultId && typeof resultId === 'string' && resultId.length > 0) {
        console.log("Salvando resultId:", resultId);
        // Salva o resultId ANTES de redirecionar
        setResultId(resultId);
        
        // Verifica se foi salvo (com múltiplas tentativas)
        let savedResultId = getResultId();
        let attempts = 0;
        while (!savedResultId && attempts < 5) {
          await new Promise(resolve => setTimeout(resolve, 50));
          savedResultId = getResultId();
          attempts++;
        }
        
        console.log("ResultId salvo no storage:", savedResultId);
        
        if (savedResultId === resultId) {
          // Sucesso: redireciona para resultado
          router.push("/result");
        } else {
          console.error("Falha ao salvar resultId no storage");
          // Mesmo assim tenta redirecionar, pois o resultId pode estar no backend
          router.push("/result");
        }
      } else {
        console.error("Resposta não contém resultId válido:", response);
        // Se não retornou resultId, incrementa contador e redireciona
        incrementHomeRedirectCount();
        clearQuizStorage();
        router.push("/");
      }
    } catch (error) {
      console.error("Erro ao completar sessão:", error);
      // Erro silencioso: incrementa contador e redireciona para home
      incrementHomeRedirectCount();
      clearQuizStorage();
      router.push("/");
    }
  };

  const handleAnswer = async (optionId) => {
    if (isSubmitting || !question) return;

    const sessionId = getSessionId();
    if (!sessionId) {
      incrementHomeRedirectCount();
      router.push("/");
      return;
    }

    setIsSubmitting(true);

    try {
      // Enviar resposta primeiro (sem delay desnecessário)
      await submitAnswer({
        sessionId,
        questionId: question.id,
        optionId,
      });

      // Buscar próxima pergunta imediatamente após enviar
      const nextData = await getNextQuestion({ sessionId });

      if (nextData.done) {
        await handleComplete(sessionId);
        return;
      }

      if (nextData.question && nextData.options) {
        setQuestion(nextData.question);
        setOptions(nextData.options);
        setProgress(nextData.progress || { answered: 0, total: 0 });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Tratamento silencioso para erro 409
      if (errorMessage.includes("409") || errorMessage.includes("Sessão não está em progresso")) {
        // Verifica se o storage deve ser limpo (5 redirecionamentos ou 1 hora)
        if (checkAndClearStorageIfNeeded()) {
          // Se limpou, redireciona para home para permitir novo teste
          router.push("/");
          return;
        }
        
        const resultId = getResultId();
        if (resultId) {
          router.push("/result");
          return;
        }
        
        // Tenta completar a sessão para obter o resultado
        try {
          const response = await completeSession({ sessionId });
          if (response.resultId) {
            setResultId(response.resultId);
            router.push("/result");
            return;
          }
        } catch (completeError) {
          // Se falhar, incrementa contador e redireciona para home
          incrementHomeRedirectCount();
          clearQuizStorage();
          router.push("/");
          return;
        }
        
        // Se não conseguiu completar, incrementa contador e redireciona para home
        incrementHomeRedirectCount();
        clearQuizStorage();
        router.push("/");
        return;
      }
      
      // Para outros erros, incrementa contador e redireciona para home
      incrementHomeRedirectCount();
      router.push("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="page-root">
        <div
          className="page-bg"
          style={{ backgroundImage: `url(${LP_BG_URL})` }}
        />
        <div className="page-overlay" />
        <section className="page-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </section>
      </main>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <main className="page-root">
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <section className="page-center">
        <div style={{ width: "100%", maxWidth: "680px", position: "relative", zIndex: 2, padding: "0 4px", boxSizing: "border-box" }}>
          <QuizCard
            question={question}
            options={options}
            progress={progress}
            onAnswer={handleAnswer}
            isSubmitting={isSubmitting}
          />
        </div>
      </section>
    </main>
  );
}

