-- ============================================
-- SQL para verificar conteúdo de todos os perfis
-- ============================================

-- 1. Verificar quais perfis têm conteúdo premium_report_content
SELECT 
  qp.id as profile_id,
  qp.key as profile_key,
  qp.name as profile_name,
  qd.key as domain_key,
  qd.name as domain_name,
  CASE 
    WHEN prc.profile_id IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as tem_premium_report_content,
  CASE 
    WHEN prc.blocks IS NOT NULL AND jsonb_typeof(prc.blocks::jsonb) = 'array' 
    THEN jsonb_array_length(prc.blocks::jsonb)
    ELSE 0
  END as quantidade_blocos_premium,
  prc.version as versao_premium
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
LEFT JOIN premium_report_content prc ON prc.profile_id = qp.id
ORDER BY qd.key, qp.order_index;

-- 2. Verificar quais perfis têm conteúdo paid_deepdive e paid_plan
SELECT 
  qp.id as profile_id,
  qp.key as profile_key,
  qp.name as profile_name,
  qd.key as domain_key,
  qd.name as domain_name,
  CASE 
    WHEN qpc_deepdive.profile_id IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as tem_paid_deepdive,
  CASE 
    WHEN qpc_plan.profile_id IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as tem_paid_plan,
  qpc_deepdive.body IS NOT NULL AND LENGTH(qpc_deepdive.body) > 0 as deepdive_tem_conteudo,
  qpc_plan.body IS NOT NULL AND LENGTH(qpc_plan.body) > 0 as plan_tem_conteudo
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
LEFT JOIN quiz_profile_content qpc_deepdive ON qpc_deepdive.profile_id = qp.id 
  AND qpc_deepdive.content_type = 'paid_deepdive' 
  AND qpc_deepdive.is_active = true
LEFT JOIN quiz_profile_content qpc_plan ON qpc_plan.profile_id = qp.id 
  AND qpc_plan.content_type = 'paid_plan' 
  AND qpc_plan.is_active = true
ORDER BY qd.key, qp.order_index;

-- 3. RESUMO: Perfis que NÃO têm conteúdo premium_report_content E não têm paid_deepdive/paid_plan
SELECT 
  qp.id as profile_id,
  qp.key as profile_key,
  qp.name as profile_name,
  qd.key as domain_key,
  qd.name as domain_name,
  CASE 
    WHEN prc.profile_id IS NOT NULL THEN 'TEM premium_report_content'
    WHEN qpc_deepdive.profile_id IS NOT NULL OR qpc_plan.profile_id IS NOT NULL THEN 'TEM paid_deepdive/paid_plan (fallback)'
    ELSE 'SEM CONTEÚDO - PRECISA CRIAR'
  END as status_conteudo,
  -- Campos que precisam ser criados
  CASE 
    WHEN prc.profile_id IS NULL AND qpc_deepdive.profile_id IS NULL AND qpc_plan.profile_id IS NULL 
    THEN 'premium_report_content OU (paid_deepdive + paid_plan)'
    WHEN prc.profile_id IS NULL AND (qpc_deepdive.profile_id IS NULL OR qpc_plan.profile_id IS NULL)
    THEN 'premium_report_content OU completar paid_deepdive/paid_plan'
    ELSE 'OK'
  END as campos_necessarios
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
LEFT JOIN premium_report_content prc ON prc.profile_id = qp.id
LEFT JOIN quiz_profile_content qpc_deepdive ON qpc_deepdive.profile_id = qp.id 
  AND qpc_deepdive.content_type = 'paid_deepdive' 
  AND qpc_deepdive.is_active = true
LEFT JOIN quiz_profile_content qpc_plan ON qpc_plan.profile_id = qp.id 
  AND qpc_plan.content_type = 'paid_plan' 
  AND qpc_plan.is_active = true
WHERE prc.profile_id IS NULL 
  AND (qpc_deepdive.profile_id IS NULL OR qpc_plan.profile_id IS NULL)
ORDER BY qd.key, qp.order_index;

-- 4. Estrutura necessária para criar conteúdo premium_report_content
-- Esta query mostra a estrutura esperada dos blocos
SELECT 
  'ESTRUTURA ESPERADA' as tipo,
  jsonb_pretty('[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3", "parágrafo 4", "parágrafo 5"]
    }
  ]'::jsonb) as estrutura_exemplo;

-- 5. Listar perfis que precisam de conteúdo (resumo final)
SELECT 
  qd.key as domain_key,
  qd.name as domain_name,
  COUNT(*) FILTER (WHERE prc.profile_id IS NULL AND (qpc_deepdive.profile_id IS NULL OR qpc_plan.profile_id IS NULL)) as perfis_sem_conteudo,
  COUNT(*) FILTER (WHERE prc.profile_id IS NOT NULL) as perfis_com_premium_content,
  COUNT(*) FILTER (WHERE prc.profile_id IS NULL AND qpc_deepdive.profile_id IS NOT NULL AND qpc_plan.profile_id IS NOT NULL) as perfis_com_fallback,
  COUNT(*) as total_perfis
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
LEFT JOIN premium_report_content prc ON prc.profile_id = qp.id
LEFT JOIN quiz_profile_content qpc_deepdive ON qpc_deepdive.profile_id = qp.id 
  AND qpc_deepdive.content_type = 'paid_deepdive' 
  AND qpc_deepdive.is_active = true
LEFT JOIN quiz_profile_content qpc_plan ON qpc_plan.profile_id = qp.id 
  AND qpc_plan.content_type = 'paid_plan' 
  AND qpc_plan.is_active = true
GROUP BY qd.key, qd.name
ORDER BY qd.key;

