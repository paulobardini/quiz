-- ============================================
-- SQL para verificar qual relatório deve ser retornado para um resultId
-- Result ID: 43228633-2c73-4966-8d9b-4066d988bd93
-- ============================================

-- Buscar dados do resultado
WITH result_data AS (
  SELECT 
    COALESCE(qr.id, qsr.id) as result_id,
    COALESCE(qr.session_id, qsr.session_id) as session_id,
    COALESCE(qr.dominant_domain_id, NULL) as dominant_domain_id,
    COALESCE(qr.dominant_profile_id, NULL) as dominant_profile_id,
    COALESCE(qr.scores_json, qsr.scores) as scores,
    qsr.primary_profile,
    COALESCE(qr.created_at, qsr.created_at) as created_at
  FROM quiz_results qr
  FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
  WHERE COALESCE(qr.id, qsr.id) = '43228633-2c73-4966-8d9b-4066d988bd93'
)
SELECT 
  rd.result_id,
  rd.session_id,
  rd.dominant_domain_id,
  rd.dominant_profile_id,
  rd.primary_profile,
  rd.scores,
  rd.created_at,
  -- Buscar informações do domínio dominante
  qd.key as domain_key,
  qd.name as domain_name,
  -- Buscar informações do perfil dominante
  qp.id as profile_id,
  qp.key as profile_key,
  qp.name as profile_name,
  -- Verificar se tem conteúdo premium
  CASE 
    WHEN prc.profile_id IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as tem_conteudo_premium,
  prc.title as titulo_premium,
  CASE 
    WHEN prc.blocks IS NOT NULL AND jsonb_typeof(prc.blocks::jsonb) = 'array' 
    THEN jsonb_array_length(prc.blocks::jsonb)
    ELSE 0
  END as quantidade_blocos_premium,
  prc.version as versao_premium,
  -- Verificar se tem pagamento aprovado
  CASE 
    WHEN EXISTS (
      SELECT 1
      FROM kiwify_orders ko
      WHERE (
        ko.s1 = rd.session_id::text
        OR ko.s1 = rd.result_id::text
      )
      AND (
        ko.status IN ('paid', 'approved', 'completed')
        OR ko.approved_date IS NOT NULL
      )
    ) THEN 'SIM'
    ELSE 'NÃO'
  END as tem_pagamento_aprovado,
  -- Gerar link do relatório premium
  CONCAT('https://quiz-lilac-seven.vercel.app/report?resultId=', rd.result_id) as link_relatorio_premium
FROM result_data rd
LEFT JOIN quiz_domains qd ON qd.id = rd.dominant_domain_id
LEFT JOIN quiz_profiles qp ON qp.id = rd.dominant_profile_id
LEFT JOIN premium_report_content prc ON prc.profile_id = qp.id
ORDER BY prc.version DESC NULLS LAST
LIMIT 1;

-- ============================================
-- Verificar também se o perfil foi identificado corretamente via fallback
-- ============================================
WITH result_data AS (
  SELECT 
    COALESCE(qr.id, qsr.id) as result_id,
    COALESCE(qr.scores_json, qsr.scores) as scores,
    qsr.primary_profile
  FROM quiz_results qr
  FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
  WHERE COALESCE(qr.id, qsr.id) = '43228633-2c73-4966-8d9b-4066d988bd93'
),
domain_from_scores AS (
  SELECT 
    rd.result_id,
    rd.primary_profile as domain_key_calculado,
    rd.scores
  FROM result_data rd
)
SELECT 
  df.domain_key_calculado,
  qd.id as domain_id,
  qd.key as domain_key,
  qd.name as domain_name
FROM domain_from_scores df
LEFT JOIN quiz_domains qd ON qd.key = df.domain_key_calculado;

-- ============================================
-- Verificar status do pagamento
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
WHERE ko.s1 = (
  SELECT COALESCE(qr.session_id::text, qsr.session_id::text)
  FROM quiz_results qr
  FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
  WHERE COALESCE(qr.id, qsr.id) = '43228633-2c73-4966-8d9b-4066d988bd93'
  LIMIT 1
)
OR ko.s1 = '43228633-2c73-4966-8d9b-4066d988bd93'
ORDER BY ko.updated_at DESC
LIMIT 1;

