/**
 * Utilitários para integração com Kiwify
 */

/**
 * Obtém parâmetros de tracking da URL atual
 */
export function getTrackingParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  const trackingParams: Record<string, string> = {};

  // Parâmetros de tracking que devem ser preservados
  const trackingKeys = [
    'afid',
    'src',
    'sck',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    's1',
    's2',
    's3',
  ];

  trackingKeys.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      trackingParams[key] = value;
    }
  });

  return trackingParams;
}

/**
 * Constrói a URL do checkout da Kiwify com parâmetros de tracking
 * @param sessionId - ID da sessão do quiz (será usado como s1)
 * @param productUrl - URL do produto Kiwify (pode ser slug ou URL completa)
 * @returns URL completa do checkout com parâmetros de tracking
 */
export function buildKiwifyCheckoutUrl(
  sessionId: string | null,
  productUrl: string
): string {
  console.log('[KIWIFY] Construindo URL do checkout...');
  console.log('[KIWIFY] SessionId:', sessionId);
  console.log('[KIWIFY] ProductUrl:', productUrl);
  
  if (!productUrl || productUrl.trim() === '') {
    throw new Error('ProductUrl não pode ser vazio');
  }

  const trackingParams = getTrackingParams();
  console.log('[KIWIFY] Parâmetros de tracking da URL:', trackingParams);
  
  // s1 sempre será o quiz_session_id
  if (sessionId) {
    trackingParams.s1 = sessionId;
    console.log('[KIWIFY] s1 definido como sessionId:', sessionId);
  }

  let finalUrl: string;

  // Se productUrl já é uma URL completa, usar diretamente
  if (productUrl.startsWith('http://') || productUrl.startsWith('https://')) {
    console.log('[KIWIFY] URL completa detectada, usando diretamente');
    finalUrl = productUrl;
  } else {
    // Se é um slug, construir URL do checkout Kiwify
    // Suporta tanto kiwify.me quanto pay.kiwify.com.br
    const baseUrl = productUrl.startsWith('/')
      ? `https://pay.kiwify.com.br${productUrl}`
      : `https://pay.kiwify.com.br/${productUrl}`;
    console.log('[KIWIFY] Construindo URL a partir do slug:', baseUrl);
    finalUrl = baseUrl;
  }

  const url = new URL(finalUrl);
  Object.entries(trackingParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const finalUrlString = url.toString();
  console.log('[KIWIFY] URL final do checkout:', finalUrlString);
  
  return finalUrlString;
}

/**
 * Redireciona para o checkout da Kiwify
 * @param sessionId - ID da sessão do quiz
 * @param productUrl - URL do produto Kiwify
 */
export function redirectToKiwifyCheckout(
  sessionId: string | null,
  productUrl: string
): void {
  console.log('[KIWIFY] ===== redirectToKiwifyCheckout CHAMADO =====');
  console.log('[KIWIFY] SessionId:', sessionId);
  console.log('[KIWIFY] ProductUrl:', productUrl);
  console.log('[KIWIFY] typeof window:', typeof window);
  console.log('[KIWIFY] window.location existe?', typeof window !== 'undefined' && !!window.location);
  
  try {
    const checkoutUrl = buildKiwifyCheckoutUrl(sessionId, productUrl);
    console.log('[KIWIFY] ✅ URL construída com sucesso:', checkoutUrl);
    console.log('[KIWIFY] Tentando redirecionar...');
    
    if (typeof window === 'undefined') {
      console.error('[KIWIFY] ❌ window não está disponível (SSR)');
      throw new Error('window não está disponível');
    }
    
    if (!window.location) {
      console.error('[KIWIFY] ❌ window.location não está disponível');
      throw new Error('window.location não está disponível');
    }
    
    console.log('[KIWIFY] ✅ window.location disponível, fazendo redirect...');
    console.log('[KIWIFY] URL atual:', window.location.href);
    console.log('[KIWIFY] URL destino:', checkoutUrl);
    
    // Forçar o redirecionamento
    window.location.href = checkoutUrl;
    
    console.log('[KIWIFY] ✅ window.location.href definido');
    
    // Fallback: tentar também com replace após um pequeno delay
    setTimeout(() => {
      if (window.location.href !== checkoutUrl) {
        console.warn('[KIWIFY] ⚠️ Redirect não funcionou, tentando com replace...');
        window.location.replace(checkoutUrl);
      }
    }, 100);
    
  } catch (error) {
    console.error('[KIWIFY] ❌ Erro ao redirecionar:', error);
    if (error instanceof Error) {
      console.error('[KIWIFY] Stack trace:', error.stack);
    }
    throw error;
  }
}

