"use client";

import { useEffect } from "react";
import { getResultId, getSessionId } from "@/lib/storage";

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Habilitar scroll
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      
      html.classList.add("paywall-page-active");
      body.classList.add("paywall-page-active");
      
      body.style.position = "relative";
      body.style.overflow = "auto";
      body.style.height = "auto";
      html.style.overflow = "auto";
      html.style.height = "auto";
    }

    const redirect = async () => {
      try {
        // Pequeno delay para garantir que a página carregou
        await new Promise(resolve => setTimeout(resolve, 500));

        if (typeof window === 'undefined') return;

        // Obter parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const s1 = urlParams.get('s1');
        
        // Tentar obter IDs do storage
        const sessionId = getSessionId();
        const resultId = getResultId();
        
        // Usar s1 da URL se disponível, senão usar sessionId do storage
        const trackingSessionId = s1 || sessionId;
        
        // Se tem resultId, redirecionar direto
        if (resultId) {
          window.location.replace(`/report?resultId=${resultId}`);
          return;
        }
        
        // Se tem sessionId, buscar resultId
        if (trackingSessionId) {
          try {
            const response = await fetch(`/api/session/result-id?sessionId=${trackingSessionId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.resultId) {
                window.location.replace(`/report?resultId=${data.resultId}`);
                return;
              }
            }
          } catch (err) {
            // Erro silencioso
          }
        }
        
        // Fallback: redirecionar para /report sem parâmetros
        window.location.replace('/report');
      } catch (error) {
        // Erro silencioso, redirecionar mesmo assim
        // Em caso de erro, redirecionar mesmo assim
        if (typeof window !== 'undefined') {
          window.location.replace('/report');
        }
      }
    };

    redirect();

    // Cleanup
    return () => {
      if (typeof document !== 'undefined') {
        const html = document.documentElement;
        const body = document.body;
        html.classList.remove("paywall-page-active");
        body.classList.remove("paywall-page-active");
      }
    };
  }, []);

  return (
    <main className="page-root paywall-page" style={{ overflowY: 'auto', height: 'auto', minHeight: '100vh' }}>
      <div className="page-bg" style={{ backgroundImage: `url(${LP_BG_URL})` }} />
      <div className="page-overlay" />
      <section className="page-center paywall-center" style={{ padding: '24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="page-card" style={{ maxWidth: "640px", borderRadius: "26px", padding: "48px 40px", margin: 'auto' }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
              Pagamento Aprovado!
            </h1>
            <p className="text-white/80 text-lg">
              Redirecionando para o relatório...
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
