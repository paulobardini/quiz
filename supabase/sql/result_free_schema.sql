-- ============================================
-- SCHEMA PARA RESULTADO GRATUITO
-- ============================================
-- Este arquivo cria as tabelas necessárias para suportar
-- o resultado gratuito na página /result

-- Tabela de domínios
CREATE TABLE IF NOT EXISTS public.quiz_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de perfis (subperfis por domínio)
CREATE TABLE IF NOT EXISTS public.quiz_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.quiz_domains(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(domain_id, key)
);

-- Tabela de resultados (substitui/estende quiz_session_results)
-- Mantém compatibilidade com estrutura existente
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dominant_domain_id UUID REFERENCES public.quiz_domains(id),
  dominant_profile_id UUID REFERENCES public.quiz_profiles(id),
  scores_json JSONB,
  is_complete BOOLEAN NOT NULL DEFAULT true
);

-- Tabela de scores por domínio com níveis
CREATE TABLE IF NOT EXISTS public.quiz_result_domain_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.quiz_results(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.quiz_domains(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  level TEXT NOT NULL CHECK (level IN ('Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto')),
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(result_id, domain_id)
);

-- Tabela de conteúdo de perfil
CREATE TABLE IF NOT EXISTS public.quiz_profile_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.quiz_profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('free_summary', 'free_impact', 'paid_deepdive', 'paid_plan')),
  title TEXT,
  body TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, content_type, version)
);

-- Tabela de cópias de UI
CREATE TABLE IF NOT EXISTS public.quiz_ui_copy (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_quiz_profiles_domain ON public.quiz_profiles(domain_id);
CREATE INDEX IF NOT EXISTS idx_quiz_profiles_key ON public.quiz_profiles(key);
CREATE INDEX IF NOT EXISTS idx_quiz_results_session ON public.quiz_results(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_dominant_domain ON public.quiz_results(dominant_domain_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_dominant_profile ON public.quiz_results(dominant_profile_id);
CREATE INDEX IF NOT EXISTS idx_quiz_result_domain_scores_result ON public.quiz_result_domain_scores(result_id);
CREATE INDEX IF NOT EXISTS idx_quiz_result_domain_scores_domain ON public.quiz_result_domain_scores(domain_id);
CREATE INDEX IF NOT EXISTS idx_quiz_result_domain_scores_rank ON public.quiz_result_domain_scores(result_id, rank);
CREATE INDEX IF NOT EXISTS idx_quiz_profile_content_profile ON public.quiz_profile_content(profile_id);
CREATE INDEX IF NOT EXISTS idx_quiz_profile_content_type ON public.quiz_profile_content(profile_id, content_type, is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_ui_copy_active ON public.quiz_ui_copy(is_active);

-- ============================================
-- FUNÇÃO PARA MAPEAR SCORE PARA LEVEL
-- ============================================
CREATE OR REPLACE FUNCTION public.map_score_to_level(score_value INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE
    WHEN score_value >= 0 AND score_value <= 19 THEN RETURN 'Muito Baixo';
    WHEN score_value >= 20 AND score_value <= 39 THEN RETURN 'Baixo';
    WHEN score_value >= 40 AND score_value <= 59 THEN RETURN 'Médio';
    WHEN score_value >= 60 AND score_value <= 79 THEN RETURN 'Alto';
    WHEN score_value >= 80 AND score_value <= 100 THEN RETURN 'Muito Alto';
    ELSE RETURN 'Médio';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

