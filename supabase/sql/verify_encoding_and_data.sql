-- Verificar encoding do banco de dados
SELECT 
    datname as database_name,
    pg_encoding_to_char(encoding) as encoding
FROM pg_database 
WHERE datname = current_database();

-- Verificar encoding da conexão atual
SHOW server_encoding;
SHOW client_encoding;

-- Verificar dados da tabela premium_report_content
SELECT 
    profile_id,
    title as report_title,
    version,
    jsonb_array_length(blocks) as total_blocks,
    created_at,
    updated_at
FROM premium_report_content
ORDER BY profile_id, created_at DESC
LIMIT 20;

-- Verificar uma amostra específica de texto dos blocos para ver se os acentos estão corretos
SELECT 
    prc.profile_id,
    prc.title as report_title,
    (block->>'order')::int as block_order,
    block->>'block_id' as block_id,
    block->>'title' as block_title,
    block->>'subtitle' as block_subtitle,
    jsonb_array_length(block->'paragraphs') as paragraphs_count,
    block->'paragraphs'->>0 as first_paragraph_sample
FROM premium_report_content prc,
     jsonb_array_elements(prc.blocks) as block
WHERE prc.blocks IS NOT NULL
ORDER BY prc.profile_id, (block->>'order')::int
LIMIT 10;

-- Verificar se há caracteres especiais/acentos nos dados dos blocos
SELECT 
    prc.profile_id,
    prc.title as report_title,
    (block->>'order')::int as block_order,
    block->>'title' as block_title,
    CASE 
        WHEN block->>'title' ~ '[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]' THEN 'Contém acentos'
        ELSE 'Sem acentos visíveis'
    END as block_title_has_accents,
    block->>'subtitle' as block_subtitle,
    CASE 
        WHEN block->>'subtitle' ~ '[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]' THEN 'Contém acentos'
        ELSE 'Sem acentos visíveis'
    END as block_subtitle_has_accents,
    CASE 
        WHEN block->'paragraphs'->>0 ~ '[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]' THEN 'Contém acentos'
        ELSE 'Sem acentos visíveis'
    END as first_paragraph_has_accents
FROM premium_report_content prc,
     jsonb_array_elements(prc.blocks) as block
WHERE prc.blocks IS NOT NULL
ORDER BY prc.profile_id, (block->>'order')::int
LIMIT 10;

