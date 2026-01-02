-- ============================================
-- SQL para gerar link do relatório premium
-- Session ID: 1c570df7-7565-4b1b-835f-a9ba77071a08
-- ============================================

-- Buscar resultId associado à sessão e gerar link do relatório
WITH session_data AS (
  SELECT 
    '1c570df7-7565-4b1b-835f-a9ba77071a08'::text as session_id
),
results AS (
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
  WHERE COALESCE(qr.session_id::text, qsr.session_id::text) = (SELECT session_id FROM session_data)
    OR COALESCE(qr.id::text, qsr.id::text) = (SELECT session_id FROM session_data)
)
SELECT 
  result_id,
  session_id,
  profile_key,
  has_scores,
  has_profile,
  created_at,
  -- Verificar se tem pagamento aprovado
  CASE 
    WHEN EXISTS (
      SELECT 1
      FROM kiwify_orders ko
      WHERE (
        ko.s1 = session_id::text
        OR ko.s1 = result_id::text
      )
      AND (
        ko.status IN ('paid', 'approved', 'completed')
        OR ko.approved_date IS NOT NULL
      )
    ) THEN true
    ELSE false
  END as has_payment,
  -- Gerar link do relatório premium
  CONCAT('https://quiz-lilac-seven.vercel.app/report?resultId=', result_id) as url_relatorio_premium,
  -- Gerar link do resultado gratuito (caso queira testar)
  CONCAT('https://quiz-lilac-seven.vercel.app/result?resultId=', result_id) as url_resultado_gratuito
FROM results
WHERE has_scores = true AND has_profile = true
ORDER BY created_at DESC
LIMIT 1;

-- ============================================
-- Verificação adicional: Status do pagamento
-- ============================================
SELECT 
  ko.order_id,
  ko.status,
  ko.approved_date,
  ko.s1,
  ko.product_id,
  ko.product_name,
  ko.customer_email,
  ko.updated_at
FROM kiwify_orders ko
WHERE ko.s1 = '1c570df7-7565-4b1b-835f-a9ba77071a08'
ORDER BY ko.updated_at DESC
LIMIT 1;

-- ============================================
-- Link direto (se já souber o resultId)
-- ============================================
-- Substitua RESULT_ID_AQUI pelo resultId retornado na query acima
-- https://quiz-lilac-seven.vercel.app/report?resultId=RESULT_ID_AQUI

