-- ============================================
-- SQL para verificar e corrigir todos os perfis faltantes
-- ============================================

-- 1. Verificar quais perfis estão faltando por domínio
WITH missing_profiles AS (
  SELECT DISTINCT
    qpr.profile_key,
    qpr.domain,
    qd.id as domain_id,
    qd.key as domain_key,
    qd.name as domain_name,
    qpr.min_score,
    qpr.max_score
  FROM quiz_profile_rules qpr
  INNER JOIN quiz_domains qd ON qd.key = qpr.domain
  LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key AND qp.domain_id = qd.id
  WHERE qpr.algorithm_version = 'v1'
    AND qp.id IS NULL
  ORDER BY qd.key, qpr.min_score
)
SELECT 
  domain_key,
  domain_name,
  profile_key,
  min_score,
  max_score,
  'FALTANDO' as status
FROM missing_profiles;

-- 2. Verificar quantos perfis faltam por domínio
SELECT 
  qd.key as domain_key,
  qd.name as domain_name,
  COUNT(DISTINCT qpr.profile_key) FILTER (WHERE qp.id IS NULL) as perfis_faltantes,
  COUNT(DISTINCT qpr.profile_key) FILTER (WHERE qp.id IS NOT NULL) as perfis_existentes,
  COUNT(DISTINCT qpr.profile_key) as total_regras
FROM quiz_profile_rules qpr
INNER JOIN quiz_domains qd ON qd.key = qpr.domain
LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key AND qp.domain_id = qd.id
WHERE qpr.algorithm_version = 'v1'
GROUP BY qd.key, qd.name
ORDER BY qd.key;

-- 3. Criar perfis faltantes baseado nas regras com nomes corretos
-- NOTA: Execute esta query apenas se quiser criar os perfis automaticamente
INSERT INTO quiz_profiles (key, name, domain_id, order_index)
SELECT DISTINCT
  qpr.profile_key as key,
  -- Mapear nomes corretos para cada perfil
  CASE qpr.profile_key
    -- CLAREZA
    WHEN 'clareza_muito_baixa' THEN 'Clareza Bloqueada'
    WHEN 'clareza_baixa' THEN 'Clareza Embaçada'
    WHEN 'clareza_media' THEN 'Clareza em Construção'
    WHEN 'clareza_alta' THEN 'Clareza Estável'
    WHEN 'clareza_muito_alta' THEN 'Clareza Direcionada'
    -- CONSTÂNCIA
    WHEN 'constancia_muito_baixa' THEN 'Constância Fragmentada'
    WHEN 'constancia_baixa' THEN 'Constância Irregular'
    WHEN 'constancia_media' THEN 'Constância Oscilante'
    WHEN 'constancia_alta' THEN 'Constância Funcional'
    WHEN 'constancia_muito_alta' THEN 'Constância Sustentada'
    -- EMOCIONAL
    WHEN 'emocional_muito_baixo' THEN 'Emoção Reprimida'
    WHEN 'emocional_baixo' THEN 'Emoção Contida'
    WHEN 'emocional_medio' THEN 'Emoção Regulada'
    WHEN 'emocional_alto' THEN 'Emoção Intensa'
    WHEN 'emocional_muito_alto' THEN 'Emoção Dominante'
    -- PROSPERIDADE
    WHEN 'prosperidade_muito_baixa' THEN 'Prosperidade Bloqueada'
    WHEN 'prosperidade_baixa' THEN 'Prosperidade Limitada'
    WHEN 'prosperidade_media' THEN 'Prosperidade Instável'
    WHEN 'prosperidade_alta' THEN 'Prosperidade Funcional'
    WHEN 'prosperidade_muito_alta' THEN 'Prosperidade Direcionada'
    -- Fallback (não deveria acontecer)
    ELSE INITCAP(REPLACE(qpr.profile_key, '_', ' '))
  END as name,
  qd.id as domain_id,
  -- Calcular order_index baseado no min_score (perfis com score menor vêm primeiro)
  ROW_NUMBER() OVER (PARTITION BY qd.id ORDER BY qpr.min_score ASC) as order_index
FROM quiz_profile_rules qpr
INNER JOIN quiz_domains qd ON qd.key = qpr.domain
LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key AND qp.domain_id = qd.id
WHERE qpr.algorithm_version = 'v1'
  AND qp.id IS NULL
ON CONFLICT (key, domain_id) DO NOTHING
RETURNING 
  id,
  key,
  name,
  domain_id,
  order_index;

-- 4. Verificar resultado final - todos os perfis devem existir agora
SELECT 
  qd.key as domain_key,
  qd.name as domain_name,
  qpr.profile_key,
  qpr.min_score,
  qpr.max_score,
  CASE 
    WHEN qp.id IS NOT NULL THEN 'EXISTE'
    ELSE 'FALTANDO'
  END as status,
  qp.id as profile_id,
  qp.name as profile_name
FROM quiz_profile_rules qpr
INNER JOIN quiz_domains qd ON qd.key = qpr.domain
LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key AND qp.domain_id = qd.id
WHERE qpr.algorithm_version = 'v1'
ORDER BY qd.key, qpr.min_score;

-- 5. Resumo final por domínio
SELECT 
  qd.key as domain_key,
  qd.name as domain_name,
  COUNT(DISTINCT qpr.profile_key) FILTER (WHERE qp.id IS NOT NULL) as perfis_criados,
  COUNT(DISTINCT qpr.profile_key) FILTER (WHERE qp.id IS NULL) as perfis_faltantes,
  COUNT(DISTINCT qpr.profile_key) as total_esperado
FROM quiz_profile_rules qpr
INNER JOIN quiz_domains qd ON qd.key = qpr.domain
LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key AND qp.domain_id = qd.id
WHERE qpr.algorithm_version = 'v1'
GROUP BY qd.key, qd.name
ORDER BY qd.key;

