-- Script de diagnóstico para verificar se os perfis estão sendo encontrados corretamente
-- Execute este script no Supabase SQL Editor para debugar problemas de matching

-- ============================================
-- 1. VERIFICAR REGRAS DE PERFIL
-- ============================================

-- Ver todas as regras de perfil por domínio
SELECT 
  domain,
  min_score,
  max_score,
  profile_key,
  algorithm_version
FROM quiz_profile_rules
WHERE algorithm_version = 'v1'
ORDER BY domain, min_score;

-- ============================================
-- 2. VERIFICAR RESULTADOS RECENTES
-- ============================================

-- Ver os últimos 5 resultados com seus scores
SELECT 
  id,
  session_id,
  scores,
  primary_profile,
  secondary_profile,
  created_at
FROM quiz_session_results
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 3. TESTAR MATCHING PARA UM DOMÍNIO ESPECÍFICO
-- ============================================

-- Exemplo: testar se um score de 45 em "clareza" encontra o perfil correto
-- Substitua os valores abaixo pelos valores reais do seu resultado

-- Para testar, descomente e ajuste os valores:
/*
WITH test_score AS (
  SELECT 'clareza' as domain, 45 as score
)
SELECT 
  r.domain,
  r.min_score,
  r.max_score,
  r.profile_key,
  t.score,
  CASE 
    WHEN t.score >= r.min_score AND t.score <= r.max_score THEN 'MATCH'
    ELSE 'NO MATCH'
  END as match_status
FROM quiz_profile_rules r
CROSS JOIN test_score t
WHERE r.domain = t.domain
  AND r.algorithm_version = 'v1'
ORDER BY r.min_score;
*/

-- ============================================
-- 4. VERIFICAR SE HÁ TEXTOS PARA TODOS OS PERFIS
-- ============================================

-- Verificar se todos os profile_keys têm textos correspondentes
SELECT 
  r.profile_key,
  r.domain,
  CASE 
    WHEN t.profile_key IS NOT NULL THEN 'TEM TEXTO'
    ELSE 'SEM TEXTO'
  END as status_texto
FROM quiz_profile_rules r
LEFT JOIN quiz_profile_texts t 
  ON r.profile_key = t.profile_key 
  AND t.content_version = 'v1'
WHERE r.algorithm_version = 'v1'
ORDER BY r.domain, r.min_score;

-- ============================================
-- 5. VERIFICAR SCORES QUE NÃO ENCONTRAM PERFIL
-- ============================================

-- Esta query mostra resultados que podem não estar encontrando perfil
-- (scores fora das faixas 0-100 ou valores NULL)
SELECT 
  id,
  primary_profile,
  scores->primary_profile as primary_score,
  CASE 
    WHEN (scores->primary_profile)::int < 0 OR (scores->primary_profile)::int > 100 THEN 'FORA DA FAIXA'
    WHEN scores->primary_profile IS NULL THEN 'NULL'
    ELSE 'OK'
  END as status_score
FROM quiz_session_results
WHERE (scores->primary_profile)::int < 0 
   OR (scores->primary_profile)::int > 100
   OR scores->primary_profile IS NULL
ORDER BY created_at DESC
LIMIT 10;

