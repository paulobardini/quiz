-- Arquivo combinado: Schema + Seed de exemplo
-- Execute este arquivo para criar as tabelas e inserir dados de exemplo de uma vez

-- ============================================
-- PARTE 1: CRIAR TABELAS (SCHEMA)
-- ============================================

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

-- ============================================
-- PARTE 2: INSERIR DADOS DE EXEMPLO (SEED)
-- ============================================

-- Regras de perfil para o domínio 'clareza'
INSERT INTO public.quiz_profile_rules (domain, min_score, max_score, profile_key, algorithm_version)
VALUES
  ('clareza', 0, 40, 'clareza_baixa', 'v1'),
  ('clareza', 41, 70, 'clareza_media', 'v1'),
  ('clareza', 71, 100, 'clareza_alta', 'v1')
ON CONFLICT (domain, min_score, max_score, algorithm_version) DO NOTHING;

-- Textos de perfil para profile_key 'clareza_alta'
INSERT INTO public.quiz_profile_texts (profile_key, title, free_summary, paid_deep_dive, action_plan, content_version)
VALUES (
  'clareza_alta',
  'Perfil de Clareza Alta',
  'Você demonstra alta clareza em seus objetivos e decisões. Sua capacidade de definir metas claras e seguir em direção a elas é uma força significativa.',
  'Análise profunda: Indivíduos com alta clareza possuem uma visão bem definida do que desejam alcançar. Esta característica permite tomadas de decisão mais rápidas e eficientes, reduzindo a procrastinação e aumentando a produtividade. A clareza mental também facilita a comunicação de objetivos para outras pessoas, criando alinhamento em equipes e relacionamentos.',
  '{"tasks": ["Revisar objetivos trimestrais", "Documentar decisões importantes", "Compartilhar visão com equipe"]}'::jsonb,
  'v1'
)
ON CONFLICT (profile_key, content_version) DO NOTHING;

-- Template para relatório free
INSERT INTO public.quiz_report_templates (report_type, template, content_version)
VALUES (
  'free',
  '{
    "header": "Relatório Gratuito",
    "sections": ["summary", "scores", "primaryProfile"]
  }'::jsonb,
  'v1'
)
ON CONFLICT (report_type, content_version) DO NOTHING;

-- Template para relatório paid
INSERT INTO public.quiz_report_templates (report_type, template, content_version)
VALUES (
  'paid',
  '{
    "header": "Relatório Completo",
    "sections": ["summary", "scores", "allProfiles", "deepDive", "actionPlan"],
    "formatting": {
      "includeCharts": true,
      "includeRecommendations": true
    }
  }'::jsonb,
  'v1'
)
ON CONFLICT (report_type, content_version) DO NOTHING;

