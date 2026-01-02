-- ============================================
-- SQL SIMPLES: Gerar link do relatório premium
-- Session ID: 1c570df7-7565-4b1b-835f-a9ba77071a08
-- ============================================

-- Buscar resultId e gerar link direto
SELECT 
  COALESCE(qr.id, qsr.id) as result_id,
  COALESCE(qr.session_id, qsr.session_id) as session_id,
  CONCAT('https://quiz-lilac-seven.vercel.app/report?resultId=', COALESCE(qr.id, qsr.id)) as link_relatorio_premium
FROM quiz_results qr
FULL OUTER JOIN quiz_session_results qsr ON qr.id = qsr.id
WHERE 
  COALESCE(qr.session_id::text, qsr.session_id::text) = '1c570df7-7565-4b1b-835f-a9ba77071a08'
  OR COALESCE(qr.id::text, qsr.id::text) = '1c570df7-7565-4b1b-835f-a9ba77071a08'
ORDER BY COALESCE(qr.created_at, qsr.created_at) DESC
LIMIT 1;

