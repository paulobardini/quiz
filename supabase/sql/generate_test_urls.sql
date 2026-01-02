-- SQL para gerar URLs de teste
-- 20 resultados de testes gratuitos e 20 de testes pagos
-- Garante que cada resultado tenha scores e perfil válidos

-- ============================================
-- 20 TESTES GRATUITOS (sem pagamento aprovado)
-- ============================================
WITH free_results AS (
  SELECT DISTINCT
    COALESCE(qr.id, qsr.id) as result_id,
    COALESCE(qr.session_id, qsr.session_id) as session_id,
    COALESCE(qr.dominant_profile_id::text, qsr.primary_profile) as profile_key,
    COALESCE(qr.created_at, qsr.created_at) as created_at,
    -- Verificar se tem scores válidos
    CASE 
      WHEN qr.scores_json IS NOT NULL THEN true
      WHEN qsr.scores IS NOT NULL AND jsonb_typeof(qsr.scores::jsonb) = 'object' THEN true
      ELSE false
    END as has_scores,
    -- Verificar se tem perfil
    CASE 
      WHEN qr.dominant_profile_id IS NOT NULL THEN true
      WHEN qsr.primary_profile IS NOT NULL AND qsr.primary_profile != '' THEN true
      ELSE false
    END as has_profile
  FROM quiz_results qr
  FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
  WHERE NOT EXISTS (
    -- Excluir resultados que têm pagamento aprovado
    SELECT 1
    FROM kiwify_orders ko
    WHERE (
      ko.s1 = COALESCE(qr.session_id::text, qsr.session_id::text)
      OR ko.s1 = COALESCE(qr.id::text, qsr.id::text)
    )
    AND (
      ko.status IN ('paid', 'approved', 'completed')
      OR ko.approved_date IS NOT NULL
    )
  )
  AND COALESCE(qr.id, qsr.id) IS NOT NULL
  -- Filtrar apenas resultados que têm scores E perfil
  AND (
    (qr.scores_json IS NOT NULL OR (qsr.scores IS NOT NULL AND jsonb_typeof(qsr.scores::jsonb) = 'object'))
    AND (qr.dominant_profile_id IS NOT NULL OR (qsr.primary_profile IS NOT NULL AND qsr.primary_profile != ''))
  )
  ORDER BY COALESCE(qr.created_at, qsr.created_at) DESC
),
free_results_filtered AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY profile_key ORDER BY created_at DESC) as rn_per_profile
  FROM free_results
  WHERE has_scores = true AND has_profile = true
),
free_results_ranked AS (
  SELECT *,
    -- Priorizar: primeiro de cada perfil (rn_per_profile = 1) vem primeiro
    CASE WHEN rn_per_profile = 1 THEN 1 ELSE 2 END as priority,
    ROW_NUMBER() OVER (ORDER BY 
      CASE WHEN rn_per_profile = 1 THEN 1 ELSE 2 END,
      created_at DESC
    ) as final_rank
  FROM free_results_filtered
)
SELECT 
  'GRATUITO' as tipo,
  final_rank as numero,
  result_id,
  session_id,
  profile_key,
  created_at,
  CONCAT('https://quiz-lilac-seven.vercel.app/result?resultId=', result_id) as url_relatorio,
  CONCAT('https://quiz-lilac-seven.vercel.app/payment/success?s1=', session_id) as url_payment_success
FROM free_results_ranked
WHERE final_rank <= 20
ORDER BY final_rank;

-- ============================================
-- 20 TESTES PAGOS (com pagamento aprovado)
-- ============================================
WITH paid_results AS (
  SELECT DISTINCT
    COALESCE(qr.id, qsr.id) as result_id,
    COALESCE(qr.session_id, qsr.session_id) as session_id,
    COALESCE(qr.dominant_profile_id::text, qsr.primary_profile) as profile_key,
    ko.order_id,
    ko.status as payment_status,
    ko.approved_date,
    COALESCE(qr.created_at, qsr.created_at) as created_at,
    -- Verificar se tem scores válidos
    CASE 
      WHEN qr.scores_json IS NOT NULL THEN true
      WHEN qsr.scores IS NOT NULL AND jsonb_typeof(qsr.scores::jsonb) = 'object' THEN true
      ELSE false
    END as has_scores,
    -- Verificar se tem perfil
    CASE 
      WHEN qr.dominant_profile_id IS NOT NULL THEN true
      WHEN qsr.primary_profile IS NOT NULL AND qsr.primary_profile != '' THEN true
      ELSE false
    END as has_profile
  FROM kiwify_orders ko
  LEFT JOIN quiz_results qr ON (
    ko.s1 = qr.session_id::text 
    OR ko.s1 = qr.id::text
  )
  LEFT JOIN quiz_session_results qsr ON (
    ko.s1 = qsr.session_id::text 
    OR ko.s1 = qsr.id::text
  )
  WHERE (
    ko.status IN ('paid', 'approved', 'completed')
    OR ko.approved_date IS NOT NULL
  )
  AND COALESCE(qr.id, qsr.id) IS NOT NULL
  -- Filtrar apenas resultados que têm scores E perfil
  AND (
    (qr.scores_json IS NOT NULL OR (qsr.scores IS NOT NULL AND jsonb_typeof(qsr.scores::jsonb) = 'object'))
    AND (qr.dominant_profile_id IS NOT NULL OR (qsr.primary_profile IS NOT NULL AND qsr.primary_profile != ''))
  )
  ORDER BY ko.approved_date DESC NULLS LAST, COALESCE(qr.created_at, qsr.created_at) DESC
),
paid_results_filtered AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY profile_key ORDER BY approved_date DESC NULLS LAST, created_at DESC) as rn_per_profile
  FROM paid_results
  WHERE has_scores = true AND has_profile = true
),
paid_results_ranked AS (
  SELECT *,
    -- Priorizar: primeiro de cada perfil (rn_per_profile = 1) vem primeiro
    CASE WHEN rn_per_profile = 1 THEN 1 ELSE 2 END as priority,
    ROW_NUMBER() OVER (ORDER BY 
      CASE WHEN rn_per_profile = 1 THEN 1 ELSE 2 END,
      approved_date DESC NULLS LAST,
      created_at DESC
    ) as final_rank
  FROM paid_results_filtered
)
SELECT 
  'PAGO' as tipo,
  final_rank as numero,
  result_id,
  session_id,
  profile_key,
  order_id,
  payment_status,
  approved_date,
  created_at,
  CONCAT('https://quiz-lilac-seven.vercel.app/report?resultId=', result_id) as url_relatorio,
  CONCAT('https://quiz-lilac-seven.vercel.app/payment/success?s1=', session_id) as url_payment_success
FROM paid_results_ranked
WHERE final_rank <= 20
ORDER BY final_rank;

-- ============================================
-- RESUMO GERAL
-- ============================================
SELECT 
  'RESUMO' as tipo,
  COUNT(DISTINCT COALESCE(qr.id, qsr.id)) FILTER (
    WHERE NOT EXISTS (
      SELECT 1
      FROM kiwify_orders ko
      WHERE (
        ko.s1 = COALESCE(qr.session_id::text, qsr.session_id::text)
        OR ko.s1 = COALESCE(qr.id::text, qsr.id::text)
      )
      AND (
        ko.status IN ('paid', 'approved', 'completed')
        OR ko.approved_date IS NOT NULL
      )
    )
  ) as total_gratuitos,
  COUNT(DISTINCT COALESCE(qr.id, qsr.id)) FILTER (
    WHERE EXISTS (
      SELECT 1
      FROM kiwify_orders ko
      WHERE (
        ko.s1 = COALESCE(qr.session_id::text, qsr.session_id::text)
        OR ko.s1 = COALESCE(qr.id::text, qsr.id::text)
      )
      AND (
        ko.status IN ('paid', 'approved', 'completed')
        OR ko.approved_date IS NOT NULL
      )
    )
  ) as total_pagos,
  COUNT(DISTINCT COALESCE(qr.id, qsr.id)) as total_resultados
FROM quiz_results qr
FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
WHERE COALESCE(qr.id, qsr.id) IS NOT NULL;

