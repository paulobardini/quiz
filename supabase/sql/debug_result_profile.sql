-- ============================================
-- SQL para debugar qual perfil deve ser retornado
-- Result ID: 43228633-2c73-4966-8d9b-4066d988bd93
-- ============================================

-- Verificar dados brutos do resultado
SELECT 
  'quiz_results' as tabela,
  qr.id,
  qr.session_id,
  qr.dominant_domain_id,
  qr.dominant_profile_id,
  qr.scores_json::text as scores_json,
  qr.is_complete,
  qr.created_at
FROM quiz_results qr
WHERE qr.id = '43228633-2c73-4966-8d9b-4066d988bd93'

UNION ALL

SELECT 
  'quiz_session_results' as tabela,
  qsr.id,
  qsr.session_id,
  NULL as dominant_domain_id,
  NULL as dominant_profile_id,
  qsr.scores::text as scores_json,
  NULL as is_complete,
  qsr.created_at
FROM quiz_session_results qsr
WHERE qsr.id = '43228633-2c73-4966-8d9b-4066d988bd93';

-- Verificar scores e qual domínio tem maior score
WITH result_scores AS (
  SELECT 
    COALESCE(qr.scores_json, qsr.scores::jsonb) as scores,
    qsr.primary_profile
  FROM quiz_results qr
  FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
  WHERE COALESCE(qr.id, qsr.id) = '43228633-2c73-4966-8d9b-4066d988bd93'
)
SELECT 
  scores->>'clareza' as score_clareza,
  scores->>'constancia' as score_constancia,
  scores->>'emocional' as score_emocional,
  scores->>'prosperidade' as score_prosperidade,
  primary_profile as primary_profile_salvo,
  CASE 
    WHEN (scores->>'emocional')::numeric > (scores->>'clareza')::numeric 
     AND (scores->>'emocional')::numeric > (scores->>'constancia')::numeric 
     AND (scores->>'emocional')::numeric > (scores->>'prosperidade')::numeric 
    THEN 'emocional'
    WHEN (scores->>'clareza')::numeric > (scores->>'constancia')::numeric 
     AND (scores->>'clareza')::numeric > (scores->>'prosperidade')::numeric 
    THEN 'clareza'
    WHEN (scores->>'constancia')::numeric > (scores->>'prosperidade')::numeric 
    THEN 'constancia'
    ELSE 'prosperidade'
  END as dominio_calculado_maior_score
FROM result_scores;

-- Verificar qual perfil deveria ser retornado baseado no score do domínio emocional
WITH result_scores AS (
  SELECT 
    COALESCE(qr.scores_json, qsr.scores::jsonb) as scores,
    qsr.primary_profile
  FROM quiz_results qr
  FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
  WHERE COALESCE(qr.id, qsr.id) = '43228633-2c73-4966-8d9b-4066d988bd93'
),
emocional_score AS (
  SELECT 
    (scores->>'emocional')::numeric as score
  FROM result_scores
),
emocional_domain AS (
  SELECT id FROM quiz_domains WHERE key = 'emocional'
)
SELECT 
  es.score as score_emocional,
  qpr.profile_key,
  qpr.min_score,
  qpr.max_score,
  ed.id as domain_id,
  qp.id as profile_id,
  qp.key as profile_key_final,
  qp.name as profile_name,
  qp.domain_id as profile_domain_id
FROM emocional_score es
CROSS JOIN emocional_domain ed
CROSS JOIN quiz_profile_rules qpr
LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key AND qp.domain_id = ed.id
WHERE qpr.domain = 'emocional'
  AND qpr.algorithm_version = 'v1'
  AND es.score >= qpr.min_score
  AND es.score <= qpr.max_score
ORDER BY qpr.min_score;

-- Verificar se o perfil emocional_medio existe e está vinculado ao domínio emocional
SELECT 
  qp.id,
  qp.key,
  qp.name,
  qp.domain_id,
  qd.key as domain_key,
  qd.name as domain_name
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qp.domain_id = qd.id
WHERE qp.key = 'emocional_medio';

-- Verificar todas as regras do domínio emocional
SELECT 
  qpr.profile_key,
  qpr.min_score,
  qpr.max_score,
  qpr.domain,
  qpr.algorithm_version,
  qp.id as profile_exists,
  qp.name as profile_name
FROM quiz_profile_rules qpr
LEFT JOIN quiz_profiles qp ON qp.key = qpr.profile_key
WHERE qpr.domain = 'emocional'
  AND qpr.algorithm_version = 'v1'
ORDER BY qpr.min_score;

