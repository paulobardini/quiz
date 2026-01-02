"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResult } from "@/lib/api";
import { 
  getResultId, 
  checkAndClearStorageIfNeeded,
  incrementHomeRedirectCount,
  clearQuizStorage,
} from "@/lib/storage";

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

// Texto fixo de contexto (hardcoded)
const CONTEXT_TEXT = "Você acabou de responder a um desafio rápido sobre decisões do dia a dia. Ele não mede inteligência e não faz diagnóstico. Ele observa padrões de escolha.";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Adicionar classe ao body e html para permitir scroll
    const html = document.documentElement;
    const body = document.body;
    
    html.classList.add("result-page-active");
    body.classList.add("result-page-active");
    
    // Forçar remoção de position fixed
    body.style.position = "relative";
    body.style.overflow = "auto";
    body.style.height = "auto";
    html.style.overflow = "auto";
    html.style.height = "auto";
    
    // Remover classe ao desmontar
    return () => {
      html.classList.remove("result-page-active");
      body.classList.remove("result-page-active");
      body.style.position = "";
      body.style.overflow = "";
      body.style.height = "";
      html.style.overflow = "";
      html.style.height = "";
    };
  }, []);

  useEffect(() => {
    const loadResult = async () => {
      const resultId = getResultId();
      
      if (!resultId) {
        incrementHomeRedirectCount();
        if (checkAndClearStorageIfNeeded()) {
          router.push("/");
          return;
        }
        router.push("/");
        return;
      }

      try {
        const data = await getResult(resultId);
        setResult(data);
      } catch (error) {
        console.error("Erro ao carregar resultado:", error);
        incrementHomeRedirectCount();
        clearQuizStorage();
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [router]);

  const handleViewReport = (e) => {
    console.log('[RESULT] ===== Botão "Acessar a leitura completa" clicado =====');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[RESULT] Redirecionando para /paywall...');
    router.push("/paywall");
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

  if (!result) {
    return null;
  }

  // Validar estrutura mínima
  if (!result.dominant || !result.dominant.domain || !result.dominant.profile) {
    return (
      <main className="page-root">
        <div
          className="page-bg"
          style={{ backgroundImage: `url(${LP_BG_URL})` }}
        />
        <div className="page-overlay" />
        <section className="page-center">
          <div className="page-card" style={{ maxWidth: "560px", borderRadius: "26px", padding: "48px 40px" }}>
            <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
              Dados de perfil não disponíveis
            </h1>
            <p className="text-white/70 mb-8">
              Os dados do perfil ainda não foram configurados no sistema.
            </p>
            <button
              onClick={() => router.push("/")}
              className="page-button"
              style={{ maxWidth: "200px" }}
            >
              Voltar ao Início
            </button>
          </div>
        </section>
      </main>
    );
  }

  const { dominant, freeText } = result;

  return (
    <main className="page-root result-page">
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <section className="page-center">
        <div className="page-card result-narrative">
          
          {/* 1. Texto fixo de contexto (hardcoded) */}
          <p className="result-narrative-context">
            {CONTEXT_TEXT}
          </p>

          {/* 2. Nome do perfil dominante + domínio */}
          <h1 className="result-narrative-profile">
            {dominant.profile.name}
          </h1>
          <p className="result-narrative-domain">
            {dominant.domain.shortLabel || dominant.domain.name}
          </p>

          {/* 3. Texto principal do padrão (free_summary) */}
          {freeText?.summary && (
            <p className="result-narrative-summary">
              {freeText.summary}
            </p>
          )}

          {/* 4. Leitura cruzada implícita dos outros domínios (parte do texto, sem visual) */}
          {/* Esta parte será incluída no próprio free_summary ou free_impact pelo backend */}
          {/* Não renderizamos visualmente os domínios aqui */}

          {/* 5. Texto de tensão e promessa (free_impact) */}
          {freeText?.impact && (
            <p className="result-narrative-impact">
              {freeText.impact}
            </p>
          )}

          {/* 6. CTA para relatório premium */}
          <div className="result-narrative-cta">
            <button
              onClick={(e) => {
                console.log('[RESULT] ===== BOTÃO CLICADO (onClick) =====');
                handleViewReport(e);
              }}
              onMouseDown={() => console.log('[RESULT] Mouse down no botão')}
              onMouseUp={() => console.log('[RESULT] Mouse up no botão')}
              className="result-narrative-button"
              type="button"
            >
              Acessar a leitura completa
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}
