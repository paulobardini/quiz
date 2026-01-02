import type {
  StartSessionRequest,
  StartSessionResponse,
  NextQuestionRequest,
  NextQuestionResponse,
  AnswerRequest,
  AnswerResponse,
  CompleteRequest,
  CompleteResponse,
  ResultResponse,
  ReportResponse,
  PremiumReportResponse,
} from "@/types/quiz";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");

function getApiUrl(endpoint: string): string {
  if (API_BASE_URL) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
  }
  return endpoint;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
        const isCorsError = error.message.includes("CORS") || 
                           (API_BASE_URL && url.startsWith("http"));
        
        let errorMessage = "";
        if (isCorsError) {
          errorMessage = `Erro de CORS ao acessar ${url}. A API na Vercel precisa permitir requisições do localhost. Para desenvolvimento local, recomendo deixar NEXT_PUBLIC_API_BASE_URL vazio no .env.local para usar URLs relativas (frontend e backend no mesmo servidor).`;
        } else if (API_BASE_URL) {
          errorMessage = `Não foi possível conectar com a API em ${url}. Verifique se o servidor está acessível. Se estiver em desenvolvimento local, considere deixar NEXT_PUBLIC_API_BASE_URL vazio no .env.local para usar URLs relativas.`;
        } else {
          errorMessage = "Erro de conexão. Configure NEXT_PUBLIC_API_BASE_URL no arquivo .env.local ou deixe vazio para usar URLs relativas em desenvolvimento local.";
        }
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
}

export async function startSession(
  data: StartSessionRequest
): Promise<StartSessionResponse> {
  return fetchAPI<StartSessionResponse>("/api/session/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getNextQuestion(
  data: NextQuestionRequest
): Promise<NextQuestionResponse> {
  return fetchAPI<NextQuestionResponse>("/api/session/next-question", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitAnswer(
  data: AnswerRequest
): Promise<AnswerResponse> {
  return fetchAPI<AnswerResponse>("/api/session/answer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeSession(
  data: CompleteRequest
): Promise<CompleteResponse> {
  return fetchAPI<CompleteResponse>("/api/session/complete", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getResult(
  resultId: string
): Promise<ResultResponse> {
  return fetchAPI<ResultResponse>(`/api/result/${resultId}`, {
    method: "GET",
  });
}

export async function getReport(
  sessionId: string,
  type: "free" | "paid"
): Promise<ReportResponse> {
  return fetchAPI<ReportResponse>("/api/session/report", {
    method: "POST",
    body: JSON.stringify({ sessionId, type }),
  });
}

export async function getPremiumReport(
  resultId: string
): Promise<PremiumReportResponse> {
  return fetchAPI<PremiumReportResponse>(`/api/report/${resultId}`, {
    method: "GET",
  });
}

