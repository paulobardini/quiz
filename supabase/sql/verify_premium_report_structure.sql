-- ============================================
-- VERIFICAÇÃO DA ESTRUTURA DO RELATÓRIO PREMIUM
-- ============================================

-- 1. Verificar se a tabela premium_report_content existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'premium_report_content'
ORDER BY ordinal_position;

-- 2. Verificar todos os registros de premium_report_content
SELECT 
    profile_id,
    title,
    version,
    created_at,
    updated_at,
    CASE 
        WHEN blocks IS NULL THEN 'NULL'
        WHEN jsonb_typeof(blocks) = 'array' THEN 'ARRAY (' || jsonb_array_length(blocks) || ' itens)'
        ELSE jsonb_typeof(blocks)
    END as blocks_type,
    jsonb_array_length(blocks) as blocks_count
FROM premium_report_content
ORDER BY created_at DESC;

-- 3. Verificar a estrutura dos blocos (primeiro registro como exemplo)
SELECT 
    profile_id,
    title,
    version,
    blocks,
    jsonb_pretty(blocks) as blocks_formatted
FROM premium_report_content
WHERE blocks IS NOT NULL
LIMIT 1;

-- 4. Verificar se os blocos têm a estrutura correta (order, block_id, title, subtitle, paragraphs)
SELECT 
    prc.profile_id,
    prc.title as report_title,
    prc.version,
    jsonb_array_length(prc.blocks) as total_blocks,
    -- Verificar cada bloco
    jsonb_array_elements(prc.blocks) as block_data
FROM premium_report_content prc
WHERE prc.blocks IS NOT NULL
ORDER BY prc.created_at DESC;

-- 5. Verificar estrutura detalhada de cada bloco
WITH block_analysis AS (
    SELECT 
        prc.profile_id,
        prc.title as report_title,
        prc.version,
        jsonb_array_elements(prc.blocks) as block,
        jsonb_array_elements(prc.blocks)->>'order' as block_order,
        jsonb_array_elements(prc.blocks)->>'block_id' as block_id,
        jsonb_array_elements(prc.blocks)->>'title' as block_title,
        jsonb_array_elements(prc.blocks)->>'subtitle' as block_subtitle,
        jsonb_array_elements(prc.blocks)->'paragraphs' as paragraphs_array,
        jsonb_array_length(jsonb_array_elements(prc.blocks)->'paragraphs') as paragraphs_count
    FROM premium_report_content prc
    WHERE prc.blocks IS NOT NULL
)
SELECT 
    profile_id,
    report_title,
    version,
    block_order::int as order_num,
    block_id,
    block_title,
    block_subtitle,
    paragraphs_count,
    CASE 
        WHEN block_order IS NULL THEN '❌ SEM ORDER'
        WHEN block_id IS NULL OR block_id = '' THEN '❌ SEM BLOCK_ID'
        WHEN block_title IS NULL OR block_title = '' THEN '❌ SEM TITLE'
        WHEN block_subtitle IS NULL OR block_subtitle = '' THEN '⚠️ SEM SUBTITLE'
        WHEN paragraphs_count IS NULL OR paragraphs_count < 3 THEN '⚠️ PARÁGRAFOS INCOMPLETOS (' || COALESCE(paragraphs_count::text, '0') || ')'
        ELSE '✅ OK'
    END as validation_status
FROM block_analysis
ORDER BY profile_id, order_num::int;

-- 6. Verificar relação entre quiz_profiles e premium_report_content
SELECT 
    qp.id as profile_id,
    qp.key as profile_key,
    qp.name as profile_name,
    qp.domain_id,
    qd.name as domain_name,
    prc.profile_id as has_content,
    prc.title as report_title,
    prc.version,
    CASE 
        WHEN prc.profile_id IS NULL THEN '❌ SEM CONTEÚDO PREMIUM'
        WHEN prc.blocks IS NULL THEN '❌ SEM BLOCOS'
        WHEN jsonb_array_length(prc.blocks) = 0 THEN '❌ BLOCOS VAZIOS'
        ELSE '✅ OK'
    END as status
FROM quiz_profiles qp
LEFT JOIN quiz_domains qd ON qd.id = qp.domain_id
LEFT JOIN premium_report_content prc ON prc.profile_id = qp.id
ORDER BY qp.key;

-- 7. Verificar perfis que têm resultado mas não têm conteúdo premium
SELECT DISTINCT
    qp.id as profile_id,
    qp.key as profile_key,
    qp.name as profile_name,
    COUNT(qsr.id) as total_results,
    CASE 
        WHEN prc.profile_id IS NULL THEN '❌ SEM CONTEÚDO PREMIUM'
        ELSE '✅ TEM CONTEÚDO'
    END as has_premium_content
FROM quiz_profiles qp
INNER JOIN quiz_session_results qsr ON qsr.primary_profile = qp.key
LEFT JOIN premium_report_content prc ON prc.profile_id = qp.id
GROUP BY qp.id, qp.key, qp.name, prc.profile_id
HAVING prc.profile_id IS NULL
ORDER BY total_results DESC;

-- 8. Verificar se há blocos duplicados ou com order duplicado
SELECT 
    prc.profile_id,
    jsonb_array_elements(prc.blocks)->>'order' as block_order,
    jsonb_array_elements(prc.blocks)->>'block_id' as block_id,
    COUNT(*) as occurrences
FROM premium_report_content prc
WHERE prc.blocks IS NOT NULL
GROUP BY prc.profile_id, 
         jsonb_array_elements(prc.blocks)->>'order',
         jsonb_array_elements(prc.blocks)->>'block_id'
HAVING COUNT(*) > 1;

-- 9. Resumo geral
SELECT 
    (SELECT COUNT(*) FROM premium_report_content) as total_content_records,
    (SELECT COUNT(*) FROM premium_report_content WHERE blocks IS NOT NULL) as content_with_blocks,
    (SELECT COUNT(DISTINCT profile_id) FROM premium_report_content) as profiles_with_content,
    (SELECT COUNT(*) FROM quiz_profiles) as total_profiles,
    (SELECT COUNT(*) FROM quiz_profiles qp 
     INNER JOIN premium_report_content prc ON prc.profile_id = qp.id) as profiles_with_content;

-- 10. Exemplo de bloco completo e válido
SELECT 
    prc.profile_id,
    qp.key as profile_key,
    prc.title,
    prc.version,
    jsonb_pretty(prc.blocks) as blocks_example
FROM premium_report_content prc
INNER JOIN quiz_profiles qp ON qp.id = prc.profile_id
WHERE prc.blocks IS NOT NULL
    AND jsonb_array_length(prc.blocks) >= 7
ORDER BY prc.created_at DESC
LIMIT 1;

