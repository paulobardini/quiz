-- ============================================
-- DIAGNÓSTICO E CORREÇÃO DE ENCODING/ACENTOS
-- ============================================

-- 1. Verificar encoding do banco
SELECT 
    datname as database_name,
    pg_encoding_to_char(encoding) as encoding
FROM pg_database 
WHERE datname = current_database();

SHOW server_encoding;
SHOW client_encoding;

-- 2. Verificar collation das colunas de texto
SELECT 
    table_name,
    column_name,
    data_type,
    character_set_name,
    collation_name
FROM information_schema.columns
WHERE table_name = 'premium_report_content'
    AND data_type IN ('text', 'character varying', 'varchar')
ORDER BY ordinal_position;

-- 3. Mostrar exemplos de palavras que DEVERIAM ter acentos
-- (Baseado nos dados que vimos: "Padrao" -> "Padrão", "Decisao" -> "Decisão", etc.)
SELECT 
    prc.profile_id,
    prc.title as report_title_original,
    -- Exemplos de correções esperadas (você precisa atualizar manualmente)
    CASE 
        WHEN prc.title LIKE '%Padrao%' THEN REPLACE(prc.title, 'Padrao', 'Padrão')
        WHEN prc.title LIKE '%Decisao%' THEN REPLACE(prc.title, 'Decisao', 'Decisão')
        ELSE prc.title
    END as report_title_corrigido,
    (block->>'order')::int as block_order,
    block->>'title' as block_title_original,
    CASE 
        WHEN block->>'title' LIKE '%padrao%' THEN REPLACE(block->>'title', 'padrao', 'padrão')
        WHEN block->>'title' LIKE '%origem%' THEN block->>'title' -- já está correto
        ELSE block->>'title'
    END as block_title_corrigido,
    block->>'subtitle' as block_subtitle_original,
    CASE 
        WHEN block->>'subtitle' LIKE '%esforco%' THEN REPLACE(block->>'subtitle', 'esforco', 'esforço')
        WHEN block->>'subtitle' LIKE '%custo invisivel%' THEN REPLACE(block->>'subtitle', 'custo invisivel', 'custo invisível')
        WHEN block->>'subtitle' LIKE '%Validacao%' THEN REPLACE(block->>'subtitle', 'Validacao', 'Validação')
        WHEN block->>'subtitle' LIKE '%autoridade%' THEN block->>'subtitle' -- já está correto
        ELSE block->>'subtitle'
    END as block_subtitle_corrigido
FROM premium_report_content prc,
     jsonb_array_elements(prc.blocks) as block
WHERE prc.blocks IS NOT NULL
ORDER BY prc.profile_id, (block->>'order')::int
LIMIT 20;

-- ============================================
-- IMPORTANTE: O problema é que os dados foram 
-- inseridos sem acentos no banco de dados.
-- 
-- SOLUÇÃO: Você precisa re-inserir os dados
-- com os acentos corretos. Não há como 
-- "adivinhar" automaticamente onde colocar
-- os acentos sem os dados originais.
-- ============================================

-- 4. Verificar se há triggers ou funções que possam estar removendo acentos
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'premium_report_content';

-- 5. Verificar funções customizadas que possam afetar encoding
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND (
        routine_definition LIKE '%unaccent%' 
        OR routine_definition LIKE '%encoding%'
        OR routine_definition LIKE '%charset%'
    );

-- ============================================
-- RECOMENDAÇÃO:
-- 1. Verifique de onde vêm os dados originais
-- 2. Re-insira os dados com acentos corretos
-- 3. Certifique-se de que o client_encoding 
--    está como UTF8 ao inserir dados
-- ============================================

