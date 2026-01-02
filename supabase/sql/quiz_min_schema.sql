-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela de perguntas do quiz
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('clareza', 'constancia', 'emocional', 'prosperidade')),
  prompt TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de sessões do quiz
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
  question_count INTEGER NOT NULL DEFAULT 25,
  question_ids UUID[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Tabela de respostas do quiz
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE RESTRICT,
  answer_value INTEGER NOT NULL CHECK (answer_value >= 0 AND answer_value <= 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session ON public.quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON public.quiz_questions(is_active);

