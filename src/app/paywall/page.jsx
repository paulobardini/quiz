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

// Habilitar scroll IMEDIATAMENTE quando o módulo carregar
if (typeof window !== 'undefined') {
  const html = document.documentElement;
  const body = document.body;
  
  html.classList.add("paywall-page-active");
  body.classList.add("paywall-page-active");
  
  // Forçar remoção de bloqueios de scroll IMEDIATAMENTE
  body.style.position = "relative";
  body.style.overflow = "auto";
  body.style.height = "auto";
  body.style.top = "auto";
  body.style.left = "auto";
  body.style.right = "auto";
  body.style.bottom = "auto";
  html.style.overflow = "auto";
  html.style.height = "auto";
}

export default function PaywallPage() {
  const router = useRouter();

  useEffect(() => {
    // Garantir que scroll está habilitado (pode já estar habilitado pelo código no topo)
    const html = document.documentElement;
    const body = document.body;
    
    // Adicionar classes se ainda não estiverem
    if (!html.classList.contains("paywall-page-active")) {
      html.classList.add("paywall-page-active");
    }
    if (!body.classList.contains("paywall-page-active")) {
      body.classList.add("paywall-page-active");
    }
    
    // Forçar remoção de bloqueios de scroll (garantir que está aplicado)
    body.style.position = "relative";
    body.style.overflow = "auto";
    body.style.height = "auto";
    body.style.top = "auto";
    body.style.left = "auto";
    body.style.right = "auto";
    body.style.bottom = "auto";
    html.style.overflow = "auto";
    html.style.height = "auto";
    
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

    // Verificar se o botão está no DOM após um pequeno delay e adicionar listener direto
    setTimeout(() => {
      const button = document.querySelector('.page-button');
      if (button) {
        // Adicionar event listener direto no DOM como fallback
        const handleClickDirect = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCheckout();
        };
        
        // Remover listener anterior se existir
        button.removeEventListener('click', handleClickDirect);
        // Adicionar novo listener
        button.addEventListener('click', handleClickDirect, { capture: true, passive: false });
        
        // Também adicionar para touch events
        const handleTouchDirect = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCheckout();
        };
        
        button.removeEventListener('touchend', handleTouchDirect);
        button.addEventListener('touchend', handleTouchDirect, { capture: true, passive: false });
      }
    }, 100);
    
    // Cleanup ao desmontar - restaurar estado padrão
    return () => {
      html.classList.remove("paywall-page-active");
      body.classList.remove("paywall-page-active");
      // Restaurar estilos padrão apenas se não estiver em outra página que precisa de scroll
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
  }, [router]);

  const handleCheckout = () => {
    const sessionId = getSessionId();
    
    if (!KIWIFY_PRODUCT_URL || KIWIFY_PRODUCT_URL.trim() === '') {
      alert("Erro: URL do checkout não configurada. Entre em contato com o suporte.");
      return;
    }

    try {
      // Redireciona para o checkout da Kiwify com tracking
      redirectToKiwifyCheckout(sessionId, KIWIFY_PRODUCT_URL);
    } catch (error) {
      alert("Erro ao redirecionar para o checkout. Tente novamente.");
    }
  };

  return (
    <main className="page-root paywall-page" style={{ overflowY: 'auto', height: 'auto', minHeight: '100vh' }}>
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <section className="page-center paywall-center" style={{ padding: '24px', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'visible' }}>
        <div className="page-card" style={{ maxWidth: "640px", borderRadius: "26px", padding: "48px 40px", margin: '40px auto' }}>
          <div className="mb-12" style={{ textAlign: 'center' }}>
            <h1 className="page-title" style={{ fontSize: "38px", marginBottom: "16px", fontWeight: 600, lineHeight: 1.2, color: "#FFFFFF" }}>
              Acesso Premium ao Seu Mapa de Decisão
            </h1>
            <p className="text-white/80" style={{ fontSize: "18px", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto", fontWeight: 400 }}>
              Compreenda como seus padrões funcionam na prática e ajuste decisões com mais clareza, método e economia de energia.
            </p>
          </div>

          <div className="mb-10" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 className="font-semibold text-white mb-2" style={{ fontSize: "17px", fontWeight: 600 }}>
                Entendimento Profundo do Seu Funcionamento
              </h3>
              <p className="text-white/70" style={{ fontSize: "15px", lineHeight: 1.6 }}>
                Acesse uma explicação estruturada sobre como seus padrões de decisão se organizam, por que certos comportamentos se repetem e como isso impacta escolhas, constância e direção.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2" style={{ fontSize: "17px", fontWeight: 600 }}>
                Direcionamento Prático e Aplicável
              </h3>
              <p className="text-white/70" style={{ fontSize: "15px", lineHeight: 1.6 }}>
                Conteúdo orientado à ação, com ajustes possíveis para o dia a dia. Sem teoria excessiva, sem promessas irreais.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2" style={{ fontSize: "17px", fontWeight: 600 }}>
                Plano Guiado de 7 Dias
              </h3>
              <p className="text-white/70" style={{ fontSize: "15px", lineHeight: 1.6 }}>
                Um roteiro simples para transformar entendimento em movimento real, respeitando ritmo, clareza e sustentabilidade.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2" style={{ fontSize: "17px", fontWeight: 600 }}>
                Conteúdo Personalizado ao Seu Perfil
              </h3>
              <p className="text-white/70" style={{ fontSize: "15px", lineHeight: 1.6 }}>
                Todo o conteúdo é gerado a partir das suas respostas. Não é genérico, não é igual para todos e não depende de interpretação subjetiva.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '24px', position: 'relative', zIndex: 1000 }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCheckout();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCheckout();
              }}
              className="page-button"
              type="button"
              style={{ 
                zIndex: 1001, 
                position: 'relative',
                width: '100%',
                marginTop: '16px',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              Desbloquear Conteúdo Premium
            </button>
          </div>

          <p className="mt-6" style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255, 255, 255, 0.65)", textAlign: "center", maxWidth: "520px", margin: "24px auto 0 auto" }}>
            Acesso imediato ao conteúdo digital personalizado.
            <br />
            Material orientativo e educativo.
            <br />
            Não substitui avaliação profissional nem possui caráter diagnóstico.
          </p>
        </div>
      </section>
    </main>
  );
}

