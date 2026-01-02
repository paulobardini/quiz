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

    const checkPayment = async () => {
      try {
        // Obter parâmetros da URL diretamente
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id') || urlParams.get('orderId');
        const s1 = urlParams.get('s1');
        
        console.log('[PAYMENT SUCCESS] Parâmetros recebidos:', { orderId, s1 });
        
        if (!orderId && !s1) {
          console.warn('[PAYMENT SUCCESS] Nenhum parâmetro de identificação encontrado');
          setStatus('error');
          setMessage('Não foi possível identificar o pedido. Verifique seu e-mail ou entre em contato com o suporte.');
          return;
        }

        // Tentar obter sessionId ou resultId do storage
        const sessionId = getSessionId();
        const resultId = getResultId();
        
        console.log('[PAYMENT SUCCESS] SessionId do storage:', sessionId);
        console.log('[PAYMENT SUCCESS] ResultId do storage:', resultId);
        
        // Usar s1 da URL se disponível, senão usar sessionId do storage
        const trackingSessionId = s1 || sessionId;
        
        if (!trackingSessionId && !resultId) {
          console.warn('[PAYMENT SUCCESS] Nenhum ID de sessão encontrado');
          setStatus('error');
          setMessage('Não foi possível identificar sua sessão. Por favor, refaça o quiz.');
          return;
        }

        // Verificar pagamento no backend
        const checkUrl = new URL('/api/payment/check', window.location.origin);
        if (orderId) {
          checkUrl.searchParams.set('order_id', orderId);
        }
        if (trackingSessionId) {
          checkUrl.searchParams.set('session_id', trackingSessionId);
        }
        if (resultId) {
          checkUrl.searchParams.set('result_id', resultId);
        }

        console.log('[PAYMENT SUCCESS] Verificando pagamento em:', checkUrl.toString());
        
        const response = await fetch(checkUrl.toString(), {
          method: 'GET',
          cache: 'no-store',
        });

        console.log('[PAYMENT SUCCESS] Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[PAYMENT SUCCESS] Erro na resposta:', response.status, errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          
          // Se for erro 500, tentar novamente após alguns segundos
          if (response.status === 500) {
            setStatus('pending');
            setMessage('Erro temporário ao verificar pagamento. Tentando novamente...');
            setTimeout(() => {
              checkPayment();
            }, 3000);
            return;
          }
          
          setStatus('error');
          setMessage(errorData.message || errorData.error || 'Erro ao verificar pagamento. Tente novamente mais tarde.');
          return;
        }

        const data = await response.json();
        console.log('[PAYMENT SUCCESS] Resposta da verificação:', data);

        if (data.approved) {
          setStatus('approved');
          setMessage('Pagamento aprovado! Redirecionando para o relatório...');
          
          // Redirecionar para o relatório após um pequeno delay
          setTimeout(() => {
            if (resultId) {
              router.push(`/report?resultId=${resultId}`);
            } else {
              router.push('/report');
            }
          }, 1500);
        } else if (data.pending) {
          setStatus('pending');
          setMessage('Pagamento em processamento. Você receberá um e-mail quando for aprovado. Verificando novamente em alguns segundos...');
          
          // Tentar novamente após 5 segundos
          setTimeout(() => {
            checkPayment();
          }, 5000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Pagamento não encontrado ou ainda não foi processado. Verifique seu e-mail ou aguarde alguns minutos.');
        }
      } catch (error) {
        console.error('[PAYMENT SUCCESS] Erro ao verificar pagamento:', error);
        setStatus('error');
        setMessage('Erro ao verificar o pagamento. Por favor, entre em contato com o suporte.');
      }
    };

    checkPayment();

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
