-- Script para verificar se os textos de perfil estão corretos no banco
-- Execute este script no Supabase SQL Editor

-- ============================================
-- 1. VERIFICAR SE TODOS OS PERFIS TÊM TEXTOS
-- ============================================

SELECT 
  r.profile_key,
  r.domain,
  r.min_score,
  r.max_score,
  CASE 
    WHEN t.id IS NOT NULL THEN 'TEM TEXTO'
    ELSE 'SEM TEXTO'
  END as status,
  t.title,
  LENGTH(t.free_summary) as tamanho_free_summary,
  t.content_version
FROM quiz_profile_rules r
LEFT JOIN quiz_profile_texts t 
  ON r.profile_key = t.profile_key 
  AND t.content_version = 'v1'
WHERE r.algorithm_version = 'v1'
ORDER BY r.domain, r.min_score;

-- ============================================
-- 2. VERIFICAR TEXTOS ESPECÍFICOS
-- ============================================

-- Verificar texto do perfil "constancia_media" (exemplo)
SELECT 
  profile_key,
  title,
  free_summary,
  content_version,
  created_at
FROM quiz_profile_texts
WHERE profile_key = 'constancia_media'
ORDER BY content_version, created_at DESC;

-- ============================================
-- 3. VERIFICAR SE HÁ DUPLICATAS
-- ============================================

SELECT 
  profile_key,
  content_version,
  COUNT(*) as total
FROM quiz_profile_texts
GROUP BY profile_key, content_version
HAVING COUNT(*) > 1;

-- ============================================
-- 4. LISTAR TODOS OS TEXTOS POR DOMÍNIO
-- ============================================

SELECT 
  t.profile_key,
  t.title,
  SUBSTRING(t.free_summary, 1, 100) as free_summary_preview,
  t.content_version
FROM quiz_profile_texts t
WHERE t.content_version = 'v1'
ORDER BY 
  CASE 
    WHEN t.profile_key LIKE 'clareza%' THEN 1
    WHEN t.profile_key LIKE 'constancia%' THEN 2
    WHEN t.profile_key LIKE 'emocional%' THEN 3
    WHEN t.profile_key LIKE 'prosperidade%' THEN 4
  END,
  t.profile_key;

