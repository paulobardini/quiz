-- Seed de exemplo para validar o pipeline de montagem de relatórios
-- Este arquivo contém dados dummy para testar a estrutura
--
-- IMPORTANTE: Execute primeiro o arquivo quiz_report_content_schema.sql
-- para criar as tabelas necessárias antes de executar este seed.
--
-- Ordem de execução:
-- 1. quiz_report_content_schema.sql (cria as tabelas)
-- 2. quiz_report_content_seed_example.sql (este arquivo, insere dados de exemplo)

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

