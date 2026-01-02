-- ============================================
-- SEED PARA RESULTADO GRATUITO
-- ============================================
-- Este arquivo popula as tabelas com dados mínimos
-- para suportar o resultado gratuito

-- ============================================
-- PARTE 1: DOMÍNIOS
-- ============================================
INSERT INTO public.quiz_domains (key, name, short_label)
VALUES
  ('clareza', 'Clareza', 'Clareza'),
  ('constancia', 'Constância', 'Constância'),
  ('emocional', 'Emocional', 'Emocional'),
  ('prosperidade', 'Prosperidade', 'Prosperidade')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- PARTE 2: PERFIS (20 perfis: 4 domínios × 5 níveis)
-- ============================================

-- Perfis de Clareza (5 níveis)
INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'clareza_muito_baixa', 'Clareza Muito Baixa', 1
FROM public.quiz_domains d WHERE d.key = 'clareza'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'clareza_baixa', 'Clareza Baixa', 2
FROM public.quiz_domains d WHERE d.key = 'clareza'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'clareza_media', 'Clareza Média', 3
FROM public.quiz_domains d WHERE d.key = 'clareza'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'clareza_alta', 'Clareza Alta', 4
FROM public.quiz_domains d WHERE d.key = 'clareza'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'clareza_muito_alta', 'Clareza Muito Alta', 5
FROM public.quiz_domains d WHERE d.key = 'clareza'
ON CONFLICT (domain_id, key) DO NOTHING;

-- Perfis de Constância (5 níveis)
INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'constancia_muito_baixa', 'Constância Muito Baixa', 1
FROM public.quiz_domains d WHERE d.key = 'constancia'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'constancia_baixa', 'Constância Baixa', 2
FROM public.quiz_domains d WHERE d.key = 'constancia'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'constancia_media', 'Constância Média', 3
FROM public.quiz_domains d WHERE d.key = 'constancia'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'constancia_alta', 'Constância Alta', 4
FROM public.quiz_domains d WHERE d.key = 'constancia'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'constancia_muito_alta', 'Constância Muito Alta', 5
FROM public.quiz_domains d WHERE d.key = 'constancia'
ON CONFLICT (domain_id, key) DO NOTHING;

-- Perfis Emocionais (5 níveis)
INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'emocional_muito_baixo', 'Emocional Muito Baixo', 1
FROM public.quiz_domains d WHERE d.key = 'emocional'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'emocional_baixo', 'Emocional Baixo', 2
FROM public.quiz_domains d WHERE d.key = 'emocional'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'emocional_medio', 'Emocional Médio', 3
FROM public.quiz_domains d WHERE d.key = 'emocional'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'emocional_alto', 'Emocional Alto', 4
FROM public.quiz_domains d WHERE d.key = 'emocional'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'emocional_muito_alto', 'Emocional Muito Alto', 5
FROM public.quiz_domains d WHERE d.key = 'emocional'
ON CONFLICT (domain_id, key) DO NOTHING;

-- Perfis de Prosperidade (5 níveis)
INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'prosperidade_muito_baixa', 'Prosperidade Muito Baixa', 1
FROM public.quiz_domains d WHERE d.key = 'prosperidade'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'prosperidade_baixa', 'Prosperidade Baixa', 2
FROM public.quiz_domains d WHERE d.key = 'prosperidade'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'prosperidade_media', 'Prosperidade Média', 3
FROM public.quiz_domains d WHERE d.key = 'prosperidade'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'prosperidade_alta', 'Prosperidade Alta', 4
FROM public.quiz_domains d WHERE d.key = 'prosperidade'
ON CONFLICT (domain_id, key) DO NOTHING;

INSERT INTO public.quiz_profiles (domain_id, key, name, order_index)
SELECT d.id, 'prosperidade_muito_alta', 'Prosperidade Muito Alta', 5
FROM public.quiz_domains d WHERE d.key = 'prosperidade'
ON CONFLICT (domain_id, key) DO NOTHING;

-- ============================================
-- PARTE 3: CONTEÚDO DE PERFIL (free_summary e free_impact)
-- ============================================
-- Reutiliza dados de quiz_profile_texts existentes
-- e cria placeholders onde necessário

INSERT INTO public.quiz_profile_content (profile_id, content_type, title, body, version, is_active)
SELECT 
  p.id,
  'free_summary',
  pt.title,
  COALESCE(pt.free_summary, 'Este perfil reflete características específicas em seu domínio. Explore mais detalhes no relatório completo.'),
  1,
  true
FROM public.quiz_profiles p
LEFT JOIN public.quiz_profile_texts pt ON pt.profile_key = p.key AND pt.content_version = 'v1'
ON CONFLICT (profile_id, content_type, version) DO NOTHING;

INSERT INTO public.quiz_profile_content (profile_id, content_type, title, body, version, is_active)
SELECT 
  p.id,
  'free_impact',
  NULL,
  COALESCE(
    CASE 
      WHEN pt.free_summary IS NOT NULL THEN 
        'Este padrão influencia suas decisões e ações de forma significativa. Compreender melhor essas dinâmicas pode trazer clareza prática para seu dia a dia.'
      ELSE 
        'Este padrão tem impacto direto em suas escolhas. Aprofundar esse entendimento pode oferecer insights valiosos para seu desenvolvimento.'
    END,
    'Este padrão influencia suas decisões e ações. Aprofundar esse entendimento pode trazer clareza prática para seu desenvolvimento.'
  ),
  1,
  true
FROM public.quiz_profiles p
LEFT JOIN public.quiz_profile_texts pt ON pt.profile_key = p.key AND pt.content_version = 'v1'
ON CONFLICT (profile_id, content_type, version) DO NOTHING;

-- ============================================
-- PARTE 4: CÓPIAS DE UI
-- ============================================
INSERT INTO public.quiz_ui_copy (key, value, is_active)
VALUES
  ('result_title', 'Seu Resultado', true),
  ('result_subtitle', 'Descubra o padrão que mais influencia suas decisões', true),
  ('free_limit_text', 'Este é um resumo gratuito do seu perfil. Para uma análise completa com recomendações personalizadas e plano de ação detalhado, acesse o relatório premium.', true),
  ('cta_report_label', 'Ver Relatório Completo', true),
  ('cta_report_microcopy', 'Análise profunda, recomendações personalizadas e plano de 7 dias', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, is_active = EXCLUDED.is_active;

