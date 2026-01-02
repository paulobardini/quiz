-- ============================================
-- SQL para verificar se há conteúdo premium para cada perfil
-- ============================================

-- Verificar quantos perfis existem
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT domain_id) as total_domains
FROM quiz_profiles;

-- Verificar quantos perfis têm conteúdo premium
SELECT 
  COUNT(DISTINCT profile_id) as profiles_with_content,
  COUNT(*) as total_content_records
FROM premium_report_content;

-- Listar todos os perfis e se têm conteúdo premium
SELECT 
  qp.id as profile_id,
  qp.key as profile_key,
  qp.name as profile_name,
  qd.key as domain_key,
  qd.name as domain_name,
  CASE 
    WHEN prc.profile_id IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as tem_conteudo_premium,
  prc.version as versao_conteudo,
  CASE 
    WHEN prc.blocks IS NOT NULL AND jsonb_typeof(prc.blocks::jsonb) = 'array' 
    THEN jsonb_array_length(prc.blocks::jsonb)
    ELSE 0
  END as quantidade_blocos
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
LEFT JOIN premium_report_content prc ON qp.id = prc.profile_id
ORDER BY qd.key, qp.key;

-- Listar apenas perfis SEM conteúdo premium (precisam de conteúdo)
SELECT 
  qp.id as profile_id,
  qp.key as profile_key,
  qp.name as profile_name,
  qd.key as domain_key,
  qd.name as domain_name
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
LEFT JOIN premium_report_content prc ON qp.id = prc.profile_id
WHERE prc.profile_id IS NULL
ORDER BY qd.key, qp.key;

-- Verificar estrutura de um conteúdo premium existente (exemplo)
SELECT 
  profile_id,
  version,
  title,
  jsonb_array_length(blocks::jsonb) as total_blocos,
  jsonb_pretty(blocks::jsonb) as blocos_json
FROM premium_report_content
LIMIT 1;

