-- Script para limpar e recriar os dados de quiz_profile_rules e quiz_profile_texts
-- Este script remove dados antigos e insere os 20 perfis corretos (5 por domínio)

-- ============================================
-- LIMPEZA DOS DADOS ANTIGOS
-- ============================================

-- Limpar regras antigas (versão v1)
DELETE FROM public.quiz_profile_rules WHERE algorithm_version = 'v1';

-- Limpar textos antigos (versão v1)
DELETE FROM public.quiz_profile_texts WHERE content_version = 'v1';

-- ============================================
-- INSERÇÃO DAS REGRAS CORRETAS (20 perfis: 4 domínios × 5 níveis)
-- ============================================

-- Regras para clareza (5 níveis)
INSERT INTO public.quiz_profile_rules (domain, min_score, max_score, profile_key, algorithm_version)
VALUES
  ('clareza', 0, 20, 'clareza_muito_baixa', 'v1'),
  ('clareza', 21, 40, 'clareza_baixa', 'v1'),
  ('clareza', 41, 60, 'clareza_media', 'v1'),
  ('clareza', 61, 80, 'clareza_alta', 'v1'),
  ('clareza', 81, 100, 'clareza_muito_alta', 'v1');

-- Regras para constancia (5 níveis)
INSERT INTO public.quiz_profile_rules (domain, min_score, max_score, profile_key, algorithm_version)
VALUES
  ('constancia', 0, 20, 'constancia_muito_baixa', 'v1'),
  ('constancia', 21, 40, 'constancia_baixa', 'v1'),
  ('constancia', 41, 60, 'constancia_media', 'v1'),
  ('constancia', 61, 80, 'constancia_alta', 'v1'),
  ('constancia', 81, 100, 'constancia_muito_alta', 'v1');

-- Regras para emocional (5 níveis)
INSERT INTO public.quiz_profile_rules (domain, min_score, max_score, profile_key, algorithm_version)
VALUES
  ('emocional', 0, 20, 'emocional_muito_baixo', 'v1'),
  ('emocional', 21, 40, 'emocional_baixo', 'v1'),
  ('emocional', 41, 60, 'emocional_medio', 'v1'),
  ('emocional', 61, 80, 'emocional_alto', 'v1'),
  ('emocional', 81, 100, 'emocional_muito_alto', 'v1');

-- Regras para prosperidade (5 níveis)
INSERT INTO public.quiz_profile_rules (domain, min_score, max_score, profile_key, algorithm_version)
VALUES
  ('prosperidade', 0, 20, 'prosperidade_muito_baixa', 'v1'),
  ('prosperidade', 21, 40, 'prosperidade_baixa', 'v1'),
  ('prosperidade', 41, 60, 'prosperidade_media', 'v1'),
  ('prosperidade', 61, 80, 'prosperidade_alta', 'v1'),
  ('prosperidade', 81, 100, 'prosperidade_muito_alta', 'v1');

-- ============================================
-- INSERÇÃO DOS TEXTOS CORRETOS (20 perfis)
-- ============================================

-- Textos para clareza (5 níveis)
INSERT INTO public.quiz_profile_texts (profile_key, title, free_summary, paid_deep_dive, action_plan, content_version)
VALUES 
  ('clareza_muito_baixa', 'Perfil de Clareza Muito Baixa', 'Você está no início do desenvolvimento de clareza. Com dedicação e prática, pode melhorar significativamente sua capacidade de definir objetivos claros.', 'Análise profunda: Indivíduos com clareza muito baixa frequentemente enfrentam dificuldades significativas para definir objetivos. Trabalhar na definição de metas claras é fundamental para o progresso.', '{"tasks": ["Definir 1 objetivo específico para esta semana", "Escrever um plano de ação simples", "Buscar orientação sobre definição de objetivos"]}'::jsonb, 'v1'),
  ('clareza_baixa', 'Perfil de Clareza Baixa', 'Você está desenvolvendo sua capacidade de definir objetivos claros. Com foco e prática, pode melhorar significativamente sua clareza mental e tomada de decisão.', 'Análise profunda: Indivíduos com clareza baixa enfrentam dificuldades para definir objetivos específicos e mensuráveis. Trabalhar na definição de metas claras pode aumentar a produtividade.', '{"tasks": ["Definir 3 objetivos específicos para o próximo mês", "Escrever um plano de ação detalhado", "Revisar objetivos semanalmente"]}'::jsonb, 'v1'),
  ('clareza_media', 'Perfil de Clareza Moderada', 'Você possui uma boa base de clareza em seus objetivos. Com algumas estratégias adicionais, pode elevar ainda mais sua capacidade de definir e alcançar metas.', 'Análise profunda: Indivíduos com clareza moderada conseguem definir objetivos, mas podem se beneficiar de técnicas de planejamento mais estruturadas e de revisão regular de progresso.', '{"tasks": ["Refinar objetivos existentes com métricas específicas", "Criar sistema de acompanhamento de progresso", "Compartilhar objetivos com alguém de confiança"]}'::jsonb, 'v1'),
  ('clareza_alta', 'Perfil de Clareza Alta', 'Você demonstra alta clareza em seus objetivos e decisões. Sua capacidade de definir metas claras e seguir em direção a elas é uma força significativa.', 'Análise profunda: Indivíduos com alta clareza possuem uma visão bem definida do que desejam alcançar. Esta característica permite tomadas de decisão mais rápidas e eficientes.', '{"tasks": ["Revisar objetivos trimestrais", "Documentar decisões importantes", "Compartilhar visão com equipe"]}'::jsonb, 'v1'),
  ('clareza_muito_alta', 'Perfil de Clareza Muito Alta', 'Você demonstra clareza excepcional em seus objetivos e decisões. Sua capacidade de definir e executar metas é uma força distintiva.', 'Análise profunda: Indivíduos com clareza muito alta possuem uma visão excepcionalmente clara e bem estruturada. Esta característica permite liderança eficaz e tomadas de decisão estratégicas.', '{"tasks": ["Mentorear outros no desenvolvimento de clareza", "Documentar e compartilhar metodologias", "Aplicar clareza em projetos complexos"]}'::jsonb, 'v1');

-- Textos para constancia (5 níveis)
INSERT INTO public.quiz_profile_texts (profile_key, title, free_summary, paid_deep_dive, action_plan, content_version)
VALUES 
  ('constancia_muito_baixa', 'Perfil de Constância Muito Baixa', 'Você está no início do desenvolvimento de consistência. Com dedicação e prática, pode melhorar significativamente sua capacidade de manter rotinas.', 'Análise profunda: Indivíduos com constância muito baixa enfrentam desafios significativos para manter rotinas. Estabelecer sistemas básicos de apoio é fundamental.', '{"tasks": ["Estabelecer uma rotina diária muito simples", "Usar lembretes constantes", "Celebrar cada pequena vitória"]}'::jsonb, 'v1'),
  ('constancia_baixa', 'Perfil de Constância Baixa', 'Você está trabalhando para desenvolver maior consistência em suas ações. Com disciplina e rotinas bem definidas, pode melhorar significativamente sua constância.', 'Análise profunda: Indivíduos com constância baixa enfrentam desafios para manter rotinas e hábitos. Desenvolver sistemas de apoio e lembretes pode ajudar a construir consistência.', '{"tasks": ["Estabelecer uma rotina diária básica", "Usar lembretes e calendários", "Celebrar pequenas vitórias de consistência"]}'::jsonb, 'v1'),
  ('constancia_media', 'Perfil de Constância Moderada', 'Você demonstra uma boa base de consistência. Com algumas estratégias adicionais, pode elevar ainda mais sua capacidade de manter rotinas e hábitos.', 'Análise profunda: Indivíduos com constância moderada conseguem manter algumas rotinas, mas podem se beneficiar de sistemas mais robustos de acompanhamento.', '{"tasks": ["Refinar rotinas existentes", "Criar sistema de acompanhamento de hábitos", "Desenvolver estratégias para lidar com interrupções"]}'::jsonb, 'v1'),
  ('constancia_alta', 'Perfil de Constância Alta', 'Você demonstra alta consistência em suas ações e rotinas. Sua capacidade de manter hábitos e seguir através de compromissos é uma força significativa.', 'Análise profunda: Indivíduos com alta constância possuem uma capacidade excepcional de manter rotinas e hábitos. Esta característica permite progresso consistente em direção a objetivos de longo prazo.', '{"tasks": ["Revisar e otimizar rotinas existentes", "Compartilhar estratégias com outros", "Estabelecer novos desafios de consistência"]}'::jsonb, 'v1'),
  ('constancia_muito_alta', 'Perfil de Constância Muito Alta', 'Você demonstra consistência excepcional em suas ações e rotinas. Sua capacidade de manter hábitos é uma força distintiva.', 'Análise profunda: Indivíduos com constância muito alta possuem uma capacidade excepcional de manter rotinas complexas. Esta característica permite progresso acelerado e resultados excepcionais.', '{"tasks": ["Mentorear outros no desenvolvimento de constância", "Documentar e compartilhar metodologias", "Aplicar constância em projetos de longo prazo"]}'::jsonb, 'v1');

-- Textos para emocional (5 níveis)
INSERT INTO public.quiz_profile_texts (profile_key, title, free_summary, paid_deep_dive, action_plan, content_version)
VALUES 
  ('emocional_muito_baixo', 'Perfil Emocional Muito Baixo', 'Você está no início do desenvolvimento de inteligência emocional. Com autoconhecimento e prática, pode melhorar significativamente sua gestão emocional.', 'Análise profunda: Indivíduos com inteligência emocional muito baixa enfrentam desafios significativos para identificar e gerenciar emoções. Desenvolver habilidades básicas de autoconhecimento é fundamental.', '{"tasks": ["Praticar identificação de emoções básicas", "Buscar recursos sobre inteligência emocional", "Considerar apoio profissional"]}'::jsonb, 'v1'),
  ('emocional_baixo', 'Perfil Emocional Baixo', 'Você está trabalhando para desenvolver maior inteligência emocional. Com autoconhecimento e prática, pode melhorar significativamente sua gestão emocional.', 'Análise profunda: Indivíduos com inteligência emocional baixa enfrentam desafios para identificar e gerenciar emoções. Desenvolver habilidades de autoconhecimento e regulação emocional pode trazer benefícios significativos.', '{"tasks": ["Praticar identificação de emoções diariamente", "Desenvolver técnicas de regulação emocional", "Buscar apoio profissional se necessário"]}'::jsonb, 'v1'),
  ('emocional_medio', 'Perfil Emocional Moderado', 'Você demonstra uma boa base de inteligência emocional. Com algumas estratégias adicionais, pode elevar ainda mais sua capacidade de gerenciar emoções.', 'Análise profunda: Indivíduos com inteligência emocional moderada conseguem identificar e gerenciar emoções básicas, mas podem se beneficiar de técnicas mais avançadas de regulação e de desenvolvimento de empatia.', '{"tasks": ["Refinar técnicas de regulação emocional", "Desenvolver habilidades de empatia", "Praticar comunicação emocional"]}'::jsonb, 'v1'),
  ('emocional_alto', 'Perfil de Alta Inteligência Emocional', 'Você demonstra alta inteligência emocional. Sua capacidade de identificar, entender e gerenciar emoções é uma força significativa.', 'Análise profunda: Indivíduos com alta inteligência emocional possuem uma capacidade excepcional de gerenciar emoções próprias e entender as emoções dos outros. Esta característica facilita relacionamentos saudáveis e tomadas de decisão equilibradas.', '{"tasks": ["Mentorear outros no desenvolvimento emocional", "Aplicar inteligência emocional em liderança", "Continuar desenvolvendo habilidades avançadas"]}'::jsonb, 'v1'),
  ('emocional_muito_alto', 'Perfil de Inteligência Emocional Excepcional', 'Você demonstra inteligência emocional excepcional. Sua capacidade de gerenciar emoções é uma força distintiva.', 'Análise profunda: Indivíduos com inteligência emocional muito alta possuem uma capacidade excepcional de gerenciar emoções complexas e facilitar o desenvolvimento emocional de outros. Esta característica permite liderança emocional eficaz.', '{"tasks": ["Mentorear outros em inteligência emocional", "Aplicar habilidades em contextos complexos", "Contribuir para desenvolvimento de equipes"]}'::jsonb, 'v1');

-- Textos para prosperidade (5 níveis)
INSERT INTO public.quiz_profile_texts (profile_key, title, free_summary, paid_deep_dive, action_plan, content_version)
VALUES 
  ('prosperidade_muito_baixa', 'Perfil de Prosperidade Muito Baixa', 'Você está no início do desenvolvimento de prosperidade. Com planejamento e ação consistente, pode melhorar significativamente sua prosperidade em diferentes áreas.', 'Análise profunda: Indivíduos com prosperidade muito baixa enfrentam desafios significativos para equilibrar diferentes áreas da vida. Estabelecer fundamentos básicos de planejamento é fundamental.', '{"tasks": ["Definir 1 objetivo de prosperidade para esta semana", "Criar plano básico de ação", "Buscar orientação sobre prosperidade"]}'::jsonb, 'v1'),
  ('prosperidade_baixa', 'Perfil de Prosperidade Baixa', 'Você está trabalhando para desenvolver maior prosperidade em diferentes áreas da vida. Com planejamento e ação consistente, pode melhorar significativamente sua prosperidade.', 'Análise profunda: Indivíduos com prosperidade baixa enfrentam desafios para equilibrar diferentes áreas da vida. Desenvolver estratégias de planejamento financeiro, pessoal e profissional pode trazer benefícios significativos.', '{"tasks": ["Definir objetivos de prosperidade em diferentes áreas", "Criar plano de ação para prosperidade financeira", "Desenvolver hábitos que promovam prosperidade geral"]}'::jsonb, 'v1'),
  ('prosperidade_media', 'Perfil de Prosperidade Moderada', 'Você demonstra uma boa base de prosperidade. Com algumas estratégias adicionais, pode elevar ainda mais sua prosperidade em diferentes áreas da vida.', 'Análise profunda: Indivíduos com prosperidade moderada conseguem equilibrar algumas áreas da vida, mas podem se beneficiar de estratégias mais integradas e de planejamento de longo prazo.', '{"tasks": ["Refinar estratégias de prosperidade existentes", "Criar plano integrado de prosperidade", "Desenvolver sistemas de acompanhamento"]}'::jsonb, 'v1'),
  ('prosperidade_alta', 'Perfil de Alta Prosperidade', 'Você demonstra alta prosperidade em diferentes áreas da vida. Sua capacidade de equilibrar e promover crescimento em múltiplas dimensões é uma força significativa.', 'Análise profunda: Indivíduos com alta prosperidade possuem uma capacidade excepcional de equilibrar e promover crescimento em diferentes áreas da vida. Esta característica permite uma vida mais plena e satisfatória.', '{"tasks": ["Mentorear outros no desenvolvimento de prosperidade", "Compartilhar estratégias que funcionam", "Continuar expandindo prosperidade em novas áreas"]}'::jsonb, 'v1'),
  ('prosperidade_muito_alta', 'Perfil de Prosperidade Excepcional', 'Você demonstra prosperidade excepcional em diferentes áreas da vida. Sua capacidade de equilibrar e promover crescimento é uma força distintiva.', 'Análise profunda: Indivíduos com prosperidade muito alta possuem uma capacidade excepcional de equilibrar e promover crescimento em múltiplas dimensões simultaneamente. Esta característica permite uma vida excepcionalmente plena.', '{"tasks": ["Mentorear outros em prosperidade", "Documentar e compartilhar metodologias", "Aplicar prosperidade em projetos transformadores"]}'::jsonb, 'v1');

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar contagem de regras (deve retornar 20)
SELECT COUNT(*) as total_regras FROM quiz_profile_rules WHERE algorithm_version = 'v1';

-- Verificar contagem de textos (deve retornar 20)
SELECT COUNT(*) as total_textos FROM quiz_profile_texts WHERE content_version = 'v1';

-- Verificar por domínio
SELECT 
  domain,
  COUNT(*) as total_perfis
FROM quiz_profile_rules 
WHERE algorithm_version = 'v1'
GROUP BY domain
ORDER BY domain;

