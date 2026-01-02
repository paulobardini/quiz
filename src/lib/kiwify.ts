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
  const trackingParams = getTrackingParams();
  
  // s1 sempre será o quiz_session_id
  if (sessionId) {
    trackingParams.s1 = sessionId;
  }

  // Se productUrl já é uma URL completa, usar diretamente
  if (productUrl.startsWith('http://') || productUrl.startsWith('https://')) {
    const url = new URL(productUrl);
    Object.entries(trackingParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  // Se é um slug, construir URL do checkout Kiwify
  // Suporta tanto kiwify.me quanto pay.kiwify.com.br
  const baseUrl = productUrl.startsWith('/')
    ? `https://pay.kiwify.com.br${productUrl}`
    : `https://pay.kiwify.com.br/${productUrl}`;

  const url = new URL(baseUrl);
  Object.entries(trackingParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
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
  const checkoutUrl = buildKiwifyCheckoutUrl(sessionId, productUrl);
  window.location.href = checkoutUrl;
}

