-- ============================================
-- MIGRAÇÃO DE DADOS EXISTENTES
-- ============================================
-- Este script migra dados de quiz_session_results para quiz_results
-- e popula quiz_result_domain_scores com níveis calculados

-- Migrar resultados existentes para nova estrutura
INSERT INTO public.quiz_results (id, session_id, created_at, scores_json, is_complete)
SELECT 
  id,
  session_id,
  created_at,
  scores::jsonb,
  true
FROM public.quiz_session_results
WHERE NOT EXISTS (
  SELECT 1 FROM public.quiz_results r WHERE r.id = quiz_session_results.id
);

-- Identificar e atualizar domínio e perfil dominantes
UPDATE public.quiz_results r
SET 
  dominant_domain_id = d.id,
  dominant_profile_id = p.id
FROM (
  SELECT 
    qsr.id,
    qsr.scores,
    qsr.primary_profile as domain_key,
    qpr.profile_key
  FROM public.quiz_session_results qsr
  LEFT JOIN public.quiz_profile_rules qpr ON 
    qpr.domain = qsr.primary_profile 
    AND qpr.algorithm_version = 'v1'
    AND (qsr.scores->>qsr.primary_profile)::int >= qpr.min_score
    AND (qsr.scores->>qsr.primary_profile)::int <= qpr.max_score
  WHERE EXISTS (SELECT 1 FROM public.quiz_results qr WHERE qr.id = qsr.id)
) src
LEFT JOIN public.quiz_domains d ON d.key = src.domain_key
LEFT JOIN public.quiz_profiles p ON p.key = src.profile_key
WHERE r.id = src.id
  AND (r.dominant_domain_id IS NULL OR r.dominant_profile_id IS NULL);

-- Popular scores por domínio com níveis calculados
INSERT INTO public.quiz_result_domain_scores (result_id, domain_id, score, level, rank)
SELECT 
  r.id as result_id,
  d.id as domain_id,
  CASE 
    WHEN d.key = 'clareza' THEN (r.scores_json->>'clareza')::int
    WHEN d.key = 'constancia' THEN (r.scores_json->>'constancia')::int
    WHEN d.key = 'emocional' THEN (r.scores_json->>'emocional')::int
    WHEN d.key = 'prosperidade' THEN (r.scores_json->>'prosperidade')::int
    ELSE 0
  END as score,
  public.map_score_to_level(
    CASE 
      WHEN d.key = 'clareza' THEN (r.scores_json->>'clareza')::int
      WHEN d.key = 'constancia' THEN (r.scores_json->>'constancia')::int
      WHEN d.key = 'emocional' THEN (r.scores_json->>'emocional')::int
      WHEN d.key = 'prosperidade' THEN (r.scores_json->>'prosperidade')::int
      ELSE 0
    END
  ) as level,
  ROW_NUMBER() OVER (
    PARTITION BY r.id 
    ORDER BY 
      CASE 
        WHEN d.key = 'clareza' THEN (r.scores_json->>'clareza')::int
        WHEN d.key = 'constancia' THEN (r.scores_json->>'constancia')::int
        WHEN d.key = 'emocional' THEN (r.scores_json->>'emocional')::int
        WHEN d.key = 'prosperidade' THEN (r.scores_json->>'prosperidade')::int
        ELSE 0
      END DESC
  ) as rank
FROM public.quiz_results r
CROSS JOIN public.quiz_domains d
WHERE r.scores_json IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM public.quiz_result_domain_scores rds 
    WHERE rds.result_id = r.id AND rds.domain_id = d.id
  );

