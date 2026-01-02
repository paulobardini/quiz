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
  if (!productUrl || productUrl.trim() === '') {
    throw new Error('ProductUrl não pode ser vazio');
  }

  const trackingParams = getTrackingParams();
  
  // s1 sempre será o quiz_session_id
  if (sessionId) {
    trackingParams.s1 = sessionId;
  }

  let finalUrl: string;

  // Se productUrl já é uma URL completa, usar diretamente
  if (productUrl.startsWith('http://') || productUrl.startsWith('https://')) {
    finalUrl = productUrl;
  } else {
    // Se é um slug, construir URL do checkout Kiwify
    // Suporta tanto kiwify.me quanto pay.kiwify.com.br
    const baseUrl = productUrl.startsWith('/')
      ? `https://pay.kiwify.com.br${productUrl}`
      : `https://pay.kiwify.com.br/${productUrl}`;
    finalUrl = baseUrl;
  }

  const url = new URL(finalUrl);
  Object.entries(trackingParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // Adicionar URL de retorno após o pagamento
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    const returnUrl = `${baseUrl}/payment/success`;
    url.searchParams.set('return_url', returnUrl);
  }

  const finalUrlString = url.toString();
  
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
  try {
    const checkoutUrl = buildKiwifyCheckoutUrl(sessionId, productUrl);
    
    if (typeof window === 'undefined') {
      throw new Error('window não está disponível');
    }
    
    if (!window.location) {
      throw new Error('window.location não está disponível');
    }
    
    // Forçar o redirecionamento
    window.location.href = checkoutUrl;
    
    // Fallback: tentar também com replace após um pequeno delay
    setTimeout(() => {
      if (window.location.href !== checkoutUrl) {
        window.location.replace(checkoutUrl);
      }
    }, 100);
    
  } catch (error) {
    throw error;
  }
}

