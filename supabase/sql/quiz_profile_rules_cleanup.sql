-- Script para limpar e verificar dados de quiz_profile_rules
-- Execute este script ANTES de executar quiz_report_content_complete.sql

-- ============================================
-- PARTE 1: VERIFICAÇÃO DOS DADOS ATUAIS
-- ============================================

-- Ver quantos registros existem por domínio
SELECT 
  domain,
  COUNT(*) as total,
  COUNT(DISTINCT profile_key) as perfis_unicos,
  algorithm_version
FROM quiz_profile_rules
GROUP BY domain, algorithm_version
ORDER BY domain, algorithm_version;

-- Ver todos os registros atuais
SELECT 
  id,
  domain,
  min_score,
  max_score,
  profile_key,
  algorithm_version,
  created_at
FROM quiz_profile_rules
ORDER BY domain, min_score, algorithm_version;

-- ============================================
-- PARTE 2: LIMPEZA (OPCIONAL - DESCOMENTE SE NECESSÁRIO)
-- ============================================

-- Opção 1: Limpar apenas registros da versão v1 (recomendado)
-- DELETE FROM quiz_profile_rules WHERE algorithm_version = 'v1';

-- Opção 2: Limpar TODOS os registros (use com cuidado!)
-- DELETE FROM quiz_profile_rules;

-- ============================================
-- PARTE 3: VERIFICAÇÃO APÓS LIMPEZA
-- ============================================

-- Após executar a limpeza, verifique novamente:
-- SELECT COUNT(*) FROM quiz_profile_rules;

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Execute primeiro a PARTE 1 para ver o que existe
-- 2. Se houver dados antigos ou duplicados, descomente a linha de DELETE na PARTE 2
-- 3. Execute quiz_report_content_complete.sql para inserir os 20 registros corretos
-- 4. Verifique com: SELECT COUNT(*) FROM quiz_profile_rules; (deve retornar 20)

