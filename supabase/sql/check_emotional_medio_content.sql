-- ============================================
-- SQL para verificar conteúdo do perfil emocional_medio
-- ============================================

-- 1. Verificar se o perfil emocional_medio existe
SELECT 
  qp.id as profile_id,
  qp.key as profile_key,
  qp.name as profile_name,
  qp.domain_id,
  qd.key as domain_key,
  qd.name as domain_name
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
WHERE qp.key = 'emocional_medio';

-- 2. Verificar se há conteúdo premium para emocional_medio
SELECT 
  prc.profile_id,
  prc.title,
  prc.version,
  CASE 
    WHEN prc.blocks IS NOT NULL AND jsonb_typeof(prc.blocks::jsonb) = 'array' 
    THEN jsonb_array_length(prc.blocks::jsonb)
    ELSE 0
  END as quantidade_blocos,
  qp.key as profile_key,
  qp.name as profile_name
FROM premium_report_content prc
LEFT JOIN quiz_profiles qp ON prc.profile_id = qp.id
WHERE qp.key = 'emocional_medio'
ORDER BY prc.version DESC;

-- 3. Verificar se há conteúdo paid_deepdive e paid_plan para emocional_medio
SELECT 
  qpc.profile_id,
  qpc.content_type,
  qpc.title,
  qpc.body IS NOT NULL as tem_conteudo,
  LENGTH(qpc.body) as tamanho_conteudo,
  qpc.is_active,
  qpc.version,
  qp.key as profile_key
FROM quiz_profile_content qpc
LEFT JOIN quiz_profiles qp ON qpc.profile_id = qp.id
WHERE qp.key = 'emocional_medio'
  AND qpc.content_type IN ('paid_deepdive', 'paid_plan')
ORDER BY qpc.content_type, qpc.version DESC;

-- 4. Verificar estrutura dos blocos do premium_report_content (se existir)
SELECT 
  prc.profile_id,
  prc.title,
  prc.version,
  jsonb_array_length(prc.blocks::jsonb) as total_blocos,
  jsonb_pretty(prc.blocks::jsonb) as blocos_json
FROM premium_report_content prc
LEFT JOIN quiz_profiles qp ON prc.profile_id = qp.id
WHERE qp.key = 'emocional_medio'
ORDER BY prc.version DESC
LIMIT 1;

