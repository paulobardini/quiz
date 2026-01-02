-- ============================================
-- SQL para verificar se os perfis emocionais existem
-- ============================================

-- Verificar todos os perfis do domínio emocional
SELECT 
  qp.id,
  qp.key,
  qp.name,
  qp.domain_id,
  qd.key as domain_key,
  qd.name as domain_name
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
WHERE qd.key = 'emocional'
ORDER BY qp.key;

-- Verificar se os perfis das regras existem
SELECT 
  qpr.profile_key,
  qpr.domain,
  qpr.min_score,
  qpr.max_score,
  CASE 
    WHEN qp.id IS NOT NULL THEN 'EXISTE'
    ELSE 'NÃO EXISTE'
  END as status_perfil,
  qp.id as profile_id,
  qp.name as profile_name,
  qp.domain_id as profile_domain_id
FROM quiz_profile_rules qpr
LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key
WHERE qpr.domain = 'emocional'
  AND qpr.algorithm_version = 'v1'
ORDER BY qpr.min_score;

-- Verificar qual é o ID do domínio emocional
SELECT 
  id,
  key,
  name
FROM quiz_domains
WHERE key = 'emocional';

