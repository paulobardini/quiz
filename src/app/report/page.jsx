"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPremiumReport } from "@/lib/api";
import { 
  getResultId, 
  setResultId,
  checkAndClearStorageIfNeeded,
  incrementHomeRedirectCount,
  clearQuizStorage,
} from "@/lib/storage";
import { ReportOpening } from "@/components/report/ReportOpening";
import { PatternFormation } from "@/components/report/PatternFormation";
import { PatternRepetition } from "@/components/report/PatternRepetition";
import { PatternImpact } from "@/components/report/PatternImpact";
import { DomainReading } from "@/components/report/DomainReading";
import { PatternCross } from "@/components/report/PatternCross";
import { PracticalAdjustment } from "@/components/report/PracticalAdjustment";
import { ReportClosing } from "@/components/report/ReportClosing";

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
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
    const loadReport = async () => {
      // Tentar obter resultId da URL primeiro, depois do storage
      const urlParams = new URLSearchParams(window.location.search);
      let resultId = urlParams.get('resultId') || getResultId();
      
      console.log('[REPORT] ResultId da URL:', urlParams.get('resultId'));
      console.log('[REPORT] ResultId do storage:', getResultId());
      console.log('[REPORT] ResultId final:', resultId);
      
      if (!resultId) {
        incrementHomeRedirectCount();
        if (checkAndClearStorageIfNeeded()) {
          router.push("/");
          return;
        }
        router.push("/");
        return;
      }
      
      // Salvar resultId no storage se veio da URL
      if (urlParams.get('resultId') && urlParams.get('resultId') !== getResultId()) {
        setResultId(urlParams.get('resultId'));
      }

      // Verifica e limpa o storage se necessário (mesmo com resultId válido)
      if (checkAndClearStorageIfNeeded()) {
        router.push("/");
        return;
      }

      try {
        const data = await getPremiumReport(resultId);
        setReport(data);
      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
        
        // Se o erro for 402 (Payment Required), redirecionar para paywall
        const errorStatus = error?.status;
        const errorData = error?.data;
        if (errorStatus === 402 || errorData?.requiresPayment) {
          console.log('[REPORT] Pagamento não aprovado, redirecionando para paywall');
          router.push('/paywall');
          return;
        }
        
        // Para outros erros, redirecionar para home
        incrementHomeRedirectCount();
        clearQuizStorage();
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [router]);

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

  if (!report) {
    return null;
  }

  return (
    <main className="page-root result-page">
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <section className="page-center">
        <div className="page-card report-card">
          
          {/* 1. Abertura — Reposicionamento Mental */}
          <ReportOpening
            title={report.uiCopy.title}
            subtitle={report.uiCopy.subtitle}
            ethicalNote={report.uiCopy.ethicalNote}
          />

          {/* 2. CAUSA — Por que o padrão se forma */}
          <PatternFormation
            dominant={report.dominant}
            deepdive={report.paidContent.deepdive}
          />

          {/* 3. REPETIÇÃO — Por que continua se repetindo */}
          <PatternRepetition
            deepdive={report.paidContent.deepdive}
          />

          {/* 4. IMPACTO — Onde realmente trava */}
          <PatternImpact
            deepdive={report.paidContent.deepdive}
          />

          {/* 5. Leitura dos Domínios (com significado) */}
          <DomainReading
            domains={report.domains}
            dominantProfile={report.dominant.profile}
          />

          {/* 6. Padrões Cruzados */}
          <PatternCross
            domains={report.domains}
          />

          {/* 7. AJUSTE — O que muda tudo */}
          <PracticalAdjustment
            plan={report.paidContent.plan}
          />

          {/* 8. Fechamento — Autonomia */}
          <ReportClosing
            closingText={report.uiCopy.closingText}
          />

        </div>
      </section>
    </main>
  );
}
