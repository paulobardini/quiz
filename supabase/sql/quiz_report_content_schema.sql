-- Tabela de regras de perfil por domínio e faixa de score
CREATE TABLE IF NOT EXISTS public.quiz_profile_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('clareza', 'constancia', 'emocional', 'prosperidade')),
  min_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  profile_key TEXT NOT NULL,
  algorithm_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(domain, min_score, max_score, algorithm_version)
);

-- Tabela de textos de perfil
CREATE TABLE IF NOT EXISTS public.quiz_profile_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key TEXT NOT NULL,
  title TEXT NOT NULL,
  free_summary TEXT NOT NULL,
  paid_deep_dive TEXT NOT NULL,
  action_plan JSONB NOT NULL,
  content_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_key, content_version)
);

-- Tabela de templates de relatório
CREATE TABLE IF NOT EXISTS public.quiz_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('free', 'paid')),
  template JSONB NOT NULL,
  content_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(report_type, content_version)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quiz_profile_rules_domain ON public.quiz_profile_rules(domain);
CREATE INDEX IF NOT EXISTS idx_quiz_profile_rules_version ON public.quiz_profile_rules(algorithm_version);
CREATE INDEX IF NOT EXISTS idx_quiz_profile_texts_key ON public.quiz_profile_texts(profile_key);
CREATE INDEX IF NOT EXISTS idx_quiz_profile_texts_version ON public.quiz_profile_texts(content_version);
CREATE INDEX IF NOT EXISTS idx_quiz_report_templates_type ON public.quiz_report_templates(report_type);
CREATE INDEX IF NOT EXISTS idx_quiz_report_templates_version ON public.quiz_report_templates(content_version);

