"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResultId, getSessionId } from "@/lib/storage";

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'approved' | 'pending' | 'error'>('checking');
  const [message, setMessage] = useState('Verificando pagamento...');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Habilitar scroll
    const html = document.documentElement;
    const body = document.body;
    
    html.classList.add("paywall-page-active");
    body.classList.add("paywall-page-active");
    
    body.style.position = "relative";
    body.style.overflow = "auto";
    body.style.height = "auto";
    body.style.top = "auto";
    body.style.left = "auto";
    body.style.right = "auto";
    body.style.bottom = "auto";
    html.style.overflow = "auto";
    html.style.height = "auto";

    const redirectToReport = async () => {
      try {
        // Obter parâmetros da URL diretamente
        const urlParams = new URLSearchParams(window.location.search);
        const s1 = urlParams.get('s1');
        
        console.log('[PAYMENT SUCCESS] Parâmetros recebidos:', { s1 });
        
        // Tentar obter sessionId ou resultId do storage
        const sessionId = getSessionId();
        const resultId = getResultId();
        
        console.log('[PAYMENT SUCCESS] SessionId do storage:', sessionId);
        console.log('[PAYMENT SUCCESS] ResultId do storage:', resultId);
        
        // Usar s1 da URL se disponível, senão usar sessionId do storage
        const trackingSessionId = s1 || sessionId;
        
        setStatus('approved');
        setMessage('Pagamento aprovado! Redirecionando para o relatório...');
        
        console.log('[PAYMENT SUCCESS] ✅ Redirecionando para relatório...');
        console.log('[PAYMENT SUCCESS] ResultId:', resultId);
        console.log('[PAYMENT SUCCESS] SessionId:', trackingSessionId);
        
        // Redirecionar para o relatório após um pequeno delay
        setTimeout(async () => {
          console.log('[PAYMENT SUCCESS] Executando redirecionamento...');
          if (resultId) {
            console.log('[PAYMENT SUCCESS] Redirecionando para /report com resultId:', resultId);
            window.location.href = `/report?resultId=${resultId}`;
          } else if (trackingSessionId) {
            // Se não tem resultId, tentar buscar pelo sessionId
            console.log('[PAYMENT SUCCESS] Buscando resultId pelo sessionId:', trackingSessionId);
            try {
              const resultResponse = await fetch(`/api/session/result-id?sessionId=${trackingSessionId}`);
              if (resultResponse.ok) {
                const resultData = await resultResponse.json();
                if (resultData.resultId) {
                  console.log('[PAYMENT SUCCESS] ResultId encontrado:', resultData.resultId);
                  window.location.href = `/report?resultId=${resultData.resultId}`;
                  return;
                }
              }
            } catch (err) {
              console.error('[PAYMENT SUCCESS] Erro ao buscar resultId:', err);
            }
            // Se não encontrou resultId, redirecionar para /report mesmo assim
            console.log('[PAYMENT SUCCESS] Redirecionando para /report sem resultId');
            window.location.href = '/report';
          } else {
            console.log('[PAYMENT SUCCESS] Redirecionando para /report sem parâmetros');
            window.location.href = '/report';
          }
        }, 1000);
      } catch (error) {
        console.error('[PAYMENT SUCCESS] Erro ao redirecionar:', error);
        setStatus('error');
        setMessage('Erro ao redirecionar. Por favor, entre em contato com o suporte.');
      }
    };

    redirectToReport();

    // Cleanup
    return () => {
      html.classList.remove("paywall-page-active");
      body.classList.remove("paywall-page-active");
      if (!html.classList.contains("result-page-active")) {
        body.style.position = "";
        body.style.overflow = "";
        body.style.height = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.bottom = "";
        html.style.overflow = "";
        html.style.height = "";
      }
    };
  }, [router, mounted]);

  // Não renderizar até estar montado no cliente
  if (!mounted) {
    return (
      <main className="page-root paywall-page" style={{ overflowY: 'auto', height: 'auto', minHeight: '100vh' }}>
        <div className="page-bg" style={{ backgroundImage: `url(${LP_BG_URL})` }} />
        <div className="page-overlay" />
        <section className="page-center paywall-center" style={{ padding: '24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
          <div className="page-card" style={{ maxWidth: "640px", borderRadius: "26px", padding: "48px 40px", margin: 'auto' }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 animate-spin">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
              </div>
              <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
                Carregando...
              </h1>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-root paywall-page" style={{ overflowY: 'auto', height: 'auto', minHeight: '100vh' }}>
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <section className="page-center paywall-center" style={{ padding: '24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
        <div className="page-card" style={{ maxWidth: "640px", borderRadius: "26px", padding: "48px 40px", margin: 'auto' }}>
          <div className="text-center">
            {status === 'checking' && (
              <>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 animate-spin">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
                </div>
                <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
                  Verificando Pagamento
                </h1>
                <p className="text-white/80 text-lg">
                  {message}
                </p>
              </>
            )}

            {status === 'approved' && (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
                  Pagamento Aprovado!
                </h1>
                <p className="text-white/80 text-lg">
                  {message}
                </p>
              </>
            )}

            {status === 'pending' && (
              <>
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30 animate-pulse">
                  <svg
                    className="w-8 h-8 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
                  Processando Pagamento
                </h1>
                <p className="text-white/80 text-lg">
                  {message}
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
                  Erro ao Verificar Pagamento
                </h1>
                <p className="text-white/80 text-lg mb-8">
                  {message}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="page-button"
                  style={{ maxWidth: "200px" }}
                >
                  Voltar ao Início
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
