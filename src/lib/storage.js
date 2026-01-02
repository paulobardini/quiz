// Utilitários para gerenciar localStorage e limpeza automática

const STORAGE_KEYS = {
  SESSION_ID: "quiz_session_id",
  RESULT_ID: "quiz_result_id",
  SESSION_STARTED_AT: "quiz_session_started_at",
  HOME_REDIRECT_COUNT: "quiz_home_redirect_count",
};

const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hora em milissegundos
const MAX_HOME_REDIRECTS = 3;

/**
 * Limpa todos os dados do quiz do localStorage
 */
export function clearQuizStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Verifica se deve limpar o storage baseado em tempo ou tentativas
 * @returns {boolean} true se deve limpar, false caso contrário
 */
export function shouldClearStorage() {
  // NÃO limpar se existe um resultId válido (resultado já foi gerado)
  const resultId = localStorage.getItem(STORAGE_KEYS.RESULT_ID);
  if (resultId) {
    // Só limpar se passou muito tempo (24 horas) desde que o resultado foi gerado
    // Isso permite que o usuário acesse o resultado mesmo depois de 1 hora
    return false; // Preservar resultado por mais tempo
  }

  const startedAt = localStorage.getItem(STORAGE_KEYS.SESSION_STARTED_AT);
  const redirectCount = parseInt(
    localStorage.getItem(STORAGE_KEYS.HOME_REDIRECT_COUNT) || "0",
    10
  );

  // Se passou 1 hora desde o início
  if (startedAt) {
    const startTime = parseInt(startedAt, 10);
    const now = Date.now();
    if (now - startTime > ONE_HOUR_MS) {
      return true;
    }
  }

  // Se redirecionou para home 3 vezes ou mais
  if (redirectCount >= MAX_HOME_REDIRECTS) {
    return true;
  }

  return false;
}

/**
 * Incrementa o contador de redirecionamentos para home
 */
export function incrementHomeRedirectCount() {
  const currentCount = parseInt(
    localStorage.getItem(STORAGE_KEYS.HOME_REDIRECT_COUNT) || "0",
    10
  );
  localStorage.setItem(
    STORAGE_KEYS.HOME_REDIRECT_COUNT,
    String(currentCount + 1)
  );
}

/**
 * Salva o timestamp de início da sessão
 */
export function setSessionStartTime() {
  localStorage.setItem(STORAGE_KEYS.SESSION_STARTED_AT, String(Date.now()));
  // Reseta o contador de redirecionamentos quando inicia nova sessão
  localStorage.setItem(STORAGE_KEYS.HOME_REDIRECT_COUNT, "0");
}

/**
 * Verifica e limpa o storage se necessário
 * @returns {boolean} true se limpou, false caso contrário
 */
export function checkAndClearStorageIfNeeded() {
  if (shouldClearStorage()) {
    clearQuizStorage();
    return true;
  }
  return false;
}

/**
 * Obtém o sessionId do localStorage
 */
export function getSessionId() {
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
}

/**
 * Obtém o resultId do localStorage
 */
export function getResultId() {
  return localStorage.getItem(STORAGE_KEYS.RESULT_ID);
}

/**
 * Salva o sessionId no localStorage
 */
export function setSessionId(sessionId) {
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  // Remove resultId quando inicia nova sessão para permitir novo teste
  localStorage.removeItem(STORAGE_KEYS.RESULT_ID);
  setSessionStartTime();
}

/**
 * Salva o resultId no localStorage
 */
export function setResultId(resultId) {
  localStorage.setItem(STORAGE_KEYS.RESULT_ID, resultId);
}

