-- Tabela de resultados do quiz
CREATE TABLE IF NOT EXISTS public.quiz_session_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  primary_profile TEXT NOT NULL,
  secondary_profile TEXT,
  algorithm_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de relatórios do quiz
CREATE TABLE IF NOT EXISTS public.quiz_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('free', 'paid')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, report_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quiz_session_results_session ON public.quiz_session_results(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_reports_session ON public.quiz_reports(session_id);

