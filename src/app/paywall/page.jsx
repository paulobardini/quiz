"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getSessionId, 
  getResultId, 
  checkAndClearStorageIfNeeded,
  incrementHomeRedirectCount,
} from "@/lib/storage";
import { redirectToKiwifyCheckout } from "@/lib/kiwify";

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

// Variável de ambiente precisa estar disponível no build
const KIWIFY_PRODUCT_URL =
  process.env.NEXT_PUBLIC_KIWIFY_PRODUCT_URL || "";

// Log para debug (será removido em produção se necessário)
if (typeof window !== 'undefined') {
  console.log('[PAYWALL] KIWIFY_PRODUCT_URL carregada:', KIWIFY_PRODUCT_URL ? 'SIM' : 'NÃO');
}

export default function PaywallPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = getSessionId();
    const resultId = getResultId();
    
    if (!sessionId && !resultId) {
      // Incrementa o contador antes de verificar se deve limpar
      incrementHomeRedirectCount();
      // Verifica e limpa o storage se necessário (após incrementar)
      if (checkAndClearStorageIfNeeded()) {
        router.push("/");
        return;
      }
      router.push("/");
      return;
    }

    // Verifica e limpa o storage se necessário (mesmo com sessionId ou resultId válido)
    if (checkAndClearStorageIfNeeded()) {
      router.push("/");
      return;
    }
  }, [router]);

  const handleCheckout = () => {
    console.log('[PAYWALL] ===== handleCheckout CHAMADO =====');
    const sessionId = getSessionId();
    
    console.log('[PAYWALL] Iniciando checkout...');
    console.log('[PAYWALL] SessionId:', sessionId);
    console.log('[PAYWALL] KIWIFY_PRODUCT_URL:', KIWIFY_PRODUCT_URL);
    console.log('[PAYWALL] Tipo de KIWIFY_PRODUCT_URL:', typeof KIWIFY_PRODUCT_URL);
    console.log('[PAYWALL] Tamanho de KIWIFY_PRODUCT_URL:', KIWIFY_PRODUCT_URL?.length);
    
    if (!KIWIFY_PRODUCT_URL || KIWIFY_PRODUCT_URL.trim() === '') {
      console.error("[PAYWALL] ❌ KIWIFY_PRODUCT_URL não configurado ou vazio");
      alert("Erro: URL do checkout não configurada. Entre em contato com o suporte.");
      return;
    }

    try {
      // Redireciona para o checkout da Kiwify com tracking
      console.log('[PAYWALL] ✅ Redirecionando para checkout...');
      redirectToKiwifyCheckout(sessionId, KIWIFY_PRODUCT_URL);
    } catch (error) {
      console.error("[PAYWALL] ❌ Erro ao redirecionar para checkout:", error);
      console.error("[PAYWALL] Stack trace:", error instanceof Error ? error.stack : 'N/A');
      alert("Erro ao redirecionar para o checkout. Tente novamente.");
    }
  };

  return (
    <main className="page-root">
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <section className="page-center">
        <div className="page-card" style={{ maxWidth: "640px", borderRadius: "26px", padding: "48px 40px" }}>
          <div className="mb-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10" style={{ backdropFilter: "blur(8px)" }}>
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="page-title" style={{ fontSize: "38px", marginBottom: "12px" }}>
              Relatório Premium
            </h1>
            <p className="text-white/80 text-lg mb-0">
              Desbloqueie insights profundos sobre seu perfil
            </p>
          </div>

          <div className="mb-10 space-y-5 text-left">
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-white/10">
                <svg
                  className="w-4 h-4 text-white"
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
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Análise Detalhada
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Entenda profundamente cada aspecto do seu perfil com análises detalhadas
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-white/10">
                <svg
                  className="w-4 h-4 text-white"
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
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Plano de Ação Personalizado
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Receba um plano de 7 dias personalizado para desenvolver seus pontos fortes
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-white/10">
                <svg
                  className="w-4 h-4 text-white"
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
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Recomendações Específicas
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Acesse recomendações práticas e específicas para seu perfil único
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              console.log('[PAYWALL] ===== BOTÃO CLICADO =====');
              e.preventDefault();
              e.stopPropagation();
              console.log('[PAYWALL] Evento capturado, chamando handleCheckout...');
              handleCheckout();
            }}
            onMouseDown={() => console.log('[PAYWALL] Mouse down no botão')}
            onMouseUp={() => console.log('[PAYWALL] Mouse up no botão')}
            className="page-button"
            type="button"
            style={{ zIndex: 1000, position: 'relative' }}
          >
            Desbloquear Relatório
          </button>

          <p className="mt-6 text-xs text-white/50">
            Sem compromisso. Acesso imediato após desbloqueio.
          </p>
        </div>
      </section>
    </main>
  );
}

