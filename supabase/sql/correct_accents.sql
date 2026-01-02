-- ============================================
-- CORREÇÃO AUTOMÁTICA DE ACENTOS
-- ATENÇÃO: Este script tenta corrigir palavras comuns,
-- mas pode não ser 100% preciso. Revise os resultados!
-- ============================================

-- Função para corrigir acentos em texto
CREATE OR REPLACE FUNCTION fix_portuguese_accents(text_to_fix TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Correções comuns de palavras sem acentos
    text_to_fix := REPLACE(text_to_fix, 'Padrao', 'Padrão');
    text_to_fix := REPLACE(text_to_fix, 'padrao', 'padrão');
    text_to_fix := REPLACE(text_to_fix, 'Decisao', 'Decisão');
    text_to_fix := REPLACE(text_to_fix, 'decisao', 'decisão');
    text_to_fix := REPLACE(text_to_fix, 'Validacao', 'Validação');
    text_to_fix := REPLACE(text_to_fix, 'validacao', 'validação');
    text_to_fix := REPLACE(text_to_fix, 'esforco', 'esforço');
    text_to_fix := REPLACE(text_to_fix, 'Esforco', 'Esforço');
    text_to_fix := REPLACE(text_to_fix, 'invisivel', 'invisível');
    text_to_fix := REPLACE(text_to_fix, 'Invisivel', 'Invisível');
    text_to_fix := REPLACE(text_to_fix, 'acao', 'ação');
    text_to_fix := REPLACE(text_to_fix, 'Acao', 'Ação');
    text_to_fix := REPLACE(text_to_fix, 'pratica', 'prática');
    text_to_fix := REPLACE(text_to_fix, 'Pratica', 'Prática');
    text_to_fix := REPLACE(text_to_fix, 'guia', 'guia'); -- já está correto
    text_to_fix := REPLACE(text_to_fix, 'origem', 'origem'); -- já está correto
    text_to_fix := REPLACE(text_to_fix, 'custo', 'custo'); -- já está correto
    text_to_fix := REPLACE(text_to_fix, 'autoridade', 'autoridade'); -- já está correto
    
    RETURN text_to_fix;
END;
$$ LANGUAGE plpgsql;

-- ATUALIZAR título do relatório
UPDATE premium_report_content
SET title = fix_portuguese_accents(title)
WHERE title IS NOT NULL;

-- ATUALIZAR blocos (JSONB)
-- Isso é mais complexo, precisamos atualizar cada campo dentro do JSONB
DO $$
DECLARE
    rec RECORD;
    updated_blocks JSONB;
    block_item JSONB;
    fixed_block JSONB;
    fixed_paragraphs JSONB;
    paragraph_text TEXT;
    i INT;
BEGIN
    FOR rec IN SELECT profile_id, blocks FROM premium_report_content WHERE blocks IS NOT NULL
    LOOP
        updated_blocks := '[]'::JSONB;
        
        -- Iterar sobre cada bloco
        FOR i IN 0..jsonb_array_length(rec.blocks) - 1
        LOOP
            block_item := rec.blocks->i;
            fixed_block := block_item;
            
            -- Corrigir title do bloco
            IF block_item->>'title' IS NOT NULL THEN
                fixed_block := jsonb_set(
                    fixed_block,
                    '{title}',
                    to_jsonb(fix_portuguese_accents(block_item->>'title'))
                );
            END IF;
            
            -- Corrigir subtitle do bloco
            IF block_item->>'subtitle' IS NOT NULL THEN
                fixed_block := jsonb_set(
                    fixed_block,
                    '{subtitle}',
                    to_jsonb(fix_portuguese_accents(block_item->>'subtitle'))
                );
            END IF;
            
            -- Corrigir paragraphs
            IF block_item->'paragraphs' IS NOT NULL AND jsonb_typeof(block_item->'paragraphs') = 'array' THEN
                fixed_paragraphs := '[]'::JSONB;
                
                FOR j IN 0..jsonb_array_length(block_item->'paragraphs') - 1
                LOOP
                    paragraph_text := block_item->'paragraphs'->>j;
                    IF paragraph_text IS NOT NULL THEN
                        fixed_paragraphs := fixed_paragraphs || jsonb_build_array(fix_portuguese_accents(paragraph_text));
                    ELSE
                        fixed_paragraphs := fixed_paragraphs || jsonb_build_array(paragraph_text);
                    END IF;
                END LOOP;
                
                fixed_block := jsonb_set(fixed_block, '{paragraphs}', fixed_paragraphs);
            END IF;
            
            updated_blocks := updated_blocks || jsonb_build_array(fixed_block);
        END LOOP;
        
        -- Atualizar o registro
        UPDATE premium_report_content
        SET blocks = updated_blocks,
            updated_at = NOW()
        WHERE profile_id = rec.profile_id;
    END LOOP;
END $$;

-- Verificar resultados
SELECT 
    prc.profile_id,
    prc.title as report_title,
    (block->>'order')::int as block_order,
    block->>'title' as block_title,
    block->>'subtitle' as block_subtitle,
    CASE 
        WHEN block->>'title' ~ '[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]' THEN '✅ Tem acentos'
        ELSE '❌ Sem acentos'
    END as title_status,
    CASE 
        WHEN block->>'subtitle' ~ '[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]' THEN '✅ Tem acentos'
        ELSE '❌ Sem acentos'
    END as subtitle_status
FROM premium_report_content prc,
     jsonb_array_elements(prc.blocks) as block
WHERE prc.blocks IS NOT NULL
ORDER BY prc.profile_id, (block->>'order')::int
LIMIT 20;

-- Limpar função temporária (opcional)
-- DROP FUNCTION IF EXISTS fix_portuguese_accents(TEXT);

