export type StartResponse = {
  sessionId: string;
  total: number;
};

export type NextQuestionResponse =
  | {
      done: false;
      question: {
        id: string;
        domain: string;
        prompt: string;
        weight: number;
      };
      options: Array<{
        id: string;
        label: string;
        position: number;
      }>;
      progress: {
        answered: number;
        total: number;
      };
      debug?: {
        questionIndex: number;
      };
    }
  | {
      done: true;
      progress: {
        answered: number;
        total: number;
      };
    };

export type AnswerResponse = {
  ok: true;
};

export type CompleteResponse = {
  ok: true;
};

export type ResultResponse = {
  scores: {
    clareza: number;
    constancia: number;
    emocional: number;
    prosperidade: number;
  };
  primaryDomain: string;
  secondaryDomain: string | null;
  primaryProfile: {
    key: string;
    title: string;
    freeSummary: string;
  } | null;
  secondaryProfile: {
    key: string;
    title: string;
  } | null;
};

export type ReportResponse = {
  reportType: 'free' | 'paid';
  content: unknown;
};

