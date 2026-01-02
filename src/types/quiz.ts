export interface StartSessionRequest {
  questionCount?: number;
}

export interface StartSessionResponse {
  sessionId: string;
  total: number;
}

export interface NextQuestionRequest {
  sessionId: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  position?: number;
}

export interface Question {
  id: string;
  domain: string;
  prompt: string;
  weight: number;
}

export interface Progress {
  answered: number;
  total: number;
}

export interface NextQuestionResponse {
  done: boolean;
  question?: Question;
  options?: QuestionOption[];
  progress?: Progress;
  debug?: {
    questionIndex: number;
  };
}

export interface AnswerRequest {
  sessionId: string;
  questionId: string;
  optionId: string;
}

export interface AnswerResponse {
  ok: boolean;
}

export interface CompleteRequest {
  sessionId: string;
}

export interface CompleteResponse {
  ok: true;
  resultId?: string;
}

export interface ResultResponse {
  resultId: string;
  dominant: {
    domain: {
      id: string;
      key: string;
      name: string;
      shortLabel?: string;
    };
    profile: {
      id: string;
      key: string;
      name: string;
    };
  };
  freeText: {
    summary: string;
    impact: string;
  };
  domains: Array<{
    domain: {
      id: string;
      key: string;
      name: string;
      shortLabel?: string;
    };
    level: string;
    rank: number;
  }>;
  uiCopy: {
    resultIntro: string;
    resultTransition: string;
    freeLimitText: string;
    ctaReportLabel: string;
    ctaReportMicrocopy: string;
  };
}

export interface ReportResponse {
  reportType: "free" | "paid";
  content: Record<string, unknown>;
}

export interface PremiumReportResponse {
  resultId: string;
  dominant: {
    domain: {
      id: string;
      key: string;
      name: string;
      shortLabel?: string;
    };
    profile: {
      id: string;
      key: string;
      name: string;
    };
  };
  paidContent: {
    deepdive: string;
    plan: string;
  };
  domains: Array<{
    domain: {
      id: string;
      key: string;
      name: string;
      shortLabel?: string;
    };
    level: string;
    rank: number;
    interpretativeText?: string;
  }>;
  uiCopy: {
    title: string;
    subtitle: string;
    ethicalNote: string;
    recap: string;
    closingText: string;
  };
}

