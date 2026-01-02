# Instruções para Implementar Resultado Gratuito

Este documento contém instruções passo a passo para implementar a estrutura de resultado gratuito na página `/result`.

## Arquivos Criados

### SQL (Supabase)
1. `supabase/sql/result_free_schema.sql` - Schema das novas tabelas
2. `supabase/sql/result_free_seed.sql` - Seed com dados mínimos
3. `supabase/sql/result_free_migrate_data.sql` - Migração de dados existentes

### Backend
4. `src/app/api/result/[resultId]/route.ts` - Endpoint ajustado para novo contrato

### Frontend
5. `src/app/result/page.jsx` - Página de resultado ajustada

## Passo a Passo

### 1. Executar SQL no Supabase

#### 1.1. Criar Schema
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase/sql/result_free_schema.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** ou pressione `Ctrl+Enter`
7. Verifique se não há erros

#### 1.2. Popular Dados (Seed)
1. No SQL Editor, abra o arquivo `supabase/sql/result_free_seed.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor
4. Clique em **Run**
5. Verifique se os dados foram inseridos:
   ```sql
   SELECT COUNT(*) FROM quiz_domains; -- Deve retornar 4
   SELECT COUNT(*) FROM quiz_profiles; -- Deve retornar 20
   SELECT COUNT(*) FROM quiz_ui_copy; -- Deve retornar 5
   ```

#### 1.3. Migrar Dados Existentes (Opcional)
Se você já tem resultados no banco:
1. No SQL Editor, abra o arquivo `supabase/sql/result_free_migrate_data.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor
4. Clique em **Run**
5. Verifique se os dados foram migrados:
   ```sql
   SELECT COUNT(*) FROM quiz_results;
   SELECT COUNT(*) FROM quiz_result_domain_scores;
   ```

### 2. Verificar Backend

O arquivo `src/app/api/result/[resultId]/route.ts` já foi ajustado para:
- Buscar dados das novas tabelas
- Retornar o formato especificado
- Ter fallback para estrutura antiga (compatibilidade)

### 3. Verificar Frontend

O arquivo `src/app/result/page.jsx` já foi ajustado para:
- Consumir o novo formato da API
- Renderizar na ordem especificada:
  1. Título e subtítulo
  2. Resultado principal (domínio + perfil)
  3. Resumo gratuito (free_summary)
  4. Panorama dos 4 domínios (sem números, apenas níveis)
  5. Impacto prático (free_impact)
  6. Bloco limite + CTA

### 4. Testar Localmente

#### 4.1. Iniciar o Servidor
```bash
npm run dev
```

#### 4.2. Testar o Fluxo Completo
1. Acesse `http://localhost:3000`
2. Inicie um quiz
3. Complete o quiz
4. Verifique se a página `/result` renderiza corretamente

#### 4.3. Validar o Payload da API
Você pode testar diretamente o endpoint:
```bash
curl http://localhost:3000/api/result/[resultId]
```

O payload deve retornar:
```json
{
  "resultId": "...",
  "dominant": {
    "domain": { "id": "...", "key": "...", "name": "...", "shortLabel": "..." },
    "profile": { "id": "...", "key": "...", "name": "..." }
  },
  "freeText": {
    "summary": "...",
    "impact": "..."
  },
  "domains": [
    {
      "domain": { "id": "...", "key": "...", "name": "...", "shortLabel": "..." },
      "level": "Muito Baixo" | "Baixo" | "Médio" | "Alto" | "Muito Alto",
      "rank": 1-4
    }
  ],
  "uiCopy": {
    "resultTitle": "...",
    "resultSubtitle": "...",
    "freeLimitText": "...",
    "ctaReportLabel": "...",
    "ctaReportMicrocopy": "..."
  }
}
```

### 5. Verificações Finais

#### 5.1. Verificar Tabelas no Supabase
```sql
-- Verificar domínios
SELECT * FROM quiz_domains;

-- Verificar perfis
SELECT p.*, d.name as domain_name 
FROM quiz_profiles p 
JOIN quiz_domains d ON p.domain_id = d.id 
ORDER BY d.key, p.order_index;

-- Verificar conteúdo de perfil
SELECT pc.*, p.name as profile_name
FROM quiz_profile_content pc
JOIN quiz_profiles p ON pc.profile_id = p.id
WHERE pc.content_type IN ('free_summary', 'free_impact')
ORDER BY p.name, pc.content_type;

-- Verificar cópias de UI
SELECT * FROM quiz_ui_copy WHERE is_active = true;
```

#### 5.2. Verificar Função de Mapeamento
```sql
-- Testar função de mapeamento
SELECT 
  score,
  public.map_score_to_level(score) as level
FROM generate_series(0, 100, 10) as score;
```

## Estrutura das Tabelas

### quiz_domains
Armazena os 4 domínios: clareza, constancia, emocional, prosperidade.

### quiz_profiles
Armazena os 20 perfis (5 por domínio).

### quiz_results
Armazena resultados com referência ao domínio e perfil dominantes.

### quiz_result_domain_scores
Armazena scores por domínio com níveis calculados (5 faixas).

### quiz_profile_content
Armazena conteúdo de perfil (free_summary, free_impact, paid_deepdive, paid_plan).

### quiz_ui_copy
Armazena cópias de UI controláveis via banco.

## Níveis de Score (5 Faixas)

- **Muito Baixo**: 0-19
- **Baixo**: 20-39
- **Médio**: 40-59
- **Alto**: 60-79
- **Muito Alto**: 80-100

## Troubleshooting

### Erro: "Tabela não existe"
- Execute o schema SQL primeiro (`result_free_schema.sql`)

### Erro: "Dados não encontrados"
- Execute o seed SQL (`result_free_seed.sql`)

### Erro: "Perfil não encontrado"
- Verifique se os perfis foram criados corretamente
- Verifique se o profile_key corresponde entre `quiz_profiles` e `quiz_profile_rules`

### Frontend não renderiza
- Verifique o console do navegador
- Verifique o payload da API no Network tab
- Verifique se o formato retornado corresponde ao esperado

## Próximos Passos

1. Personalizar cópias de UI no banco (`quiz_ui_copy`)
2. Ajustar conteúdo de perfis (`quiz_profile_content`)
3. Testar com diferentes resultados
4. Validar responsividade em mobile

