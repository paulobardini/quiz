-- Script para limpar e verificar dados de quiz_profile_texts
-- Execute este script ANTES de executar quiz_report_content_complete.sql

-- ============================================
-- PARTE 1: VERIFICAÇÃO DOS DADOS ATUAIS
-- ============================================

-- Ver quantos registros existem por profile_key
SELECT 
  profile_key,
  COUNT(*) as total,
  content_version,
  MAX(created_at) as ultima_atualizacao
FROM quiz_profile_texts
GROUP BY profile_key, content_version
ORDER BY profile_key, content_version;

-- Ver todos os registros atuais
SELECT 
  id,
  profile_key,
  title,
  content_version,
  created_at
FROM quiz_profile_texts
ORDER BY profile_key, content_version;

-- ============================================
-- PARTE 2: LIMPEZA (OPCIONAL - DESCOMENTE SE NECESSÁRIO)
-- ============================================

-- Opção 1: Limpar apenas registros da versão v1 (recomendado)
-- DELETE FROM quiz_profile_texts WHERE content_version = 'v1';

-- Opção 2: Limpar TODOS os registros (use com cuidado!)
-- DELETE FROM quiz_profile_texts;

-- ============================================
-- PARTE 3: VERIFICAÇÃO APÓS LIMPEZA
-- ============================================

-- Após executar a limpeza, verifique novamente:
-- SELECT COUNT(*) FROM quiz_profile_texts;

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Execute primeiro a PARTE 1 para ver o que existe
-- 2. Se houver dados antigos ou duplicados, descomente a linha de DELETE na PARTE 2
-- 3. Execute quiz_report_content_complete.sql para inserir os 20 registros corretos
-- 4. Verifique com: SELECT COUNT(*) FROM quiz_profile_texts; (deve retornar 20)

