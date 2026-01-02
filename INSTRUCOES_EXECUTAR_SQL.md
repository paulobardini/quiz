# Instruções para Executar SQL no Supabase

## Arquivo SQL Completo

## Arquivos SQL Disponíveis

### 1. `quiz_profile_rules_reset.sql` (RECOMENDADO se já executou antes)
- Limpa dados antigos e recria os 20 perfis corretos (5 por domínio)
- Use este se `SELECT COUNT(*) FROM quiz_profile_rules;` retornar mais de 20

### 2. `quiz_report_content_complete.sql` (Primeira execução)
- Criação de todas as tabelas necessárias
- Regras de perfil para todos os 4 domínios (5 níveis cada = 20 perfis)
- Textos de perfil para todos os 20 perfis
- Templates de relatório (free e paid)

## Como Executar no Supabase

### ⚠️ IMPORTANTE: Verifique primeiro

Execute esta query no Supabase para verificar quantos registros existem:

```sql
SELECT COUNT(*) FROM quiz_profile_rules;
```

- Se retornar **0**: Execute `quiz_report_content_complete.sql`
- Se retornar **20**: Já está correto, não precisa fazer nada
- Se retornar **mais de 20** (ex: 52): Execute `quiz_profile_rules_reset.sql` para limpar e recriar

### Opção 1: Via SQL Editor do Supabase (Recomendado)

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo SQL apropriado:
   - `supabase/sql/quiz_profile_rules_reset.sql` (se já tem dados)
   - `supabase/sql/quiz_report_content_complete.sql` (primeira vez)
6. Copie todo o conteúdo do arquivo
7. Cole no SQL Editor do Supabase
8. Clique em **Run** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Opção 2: Via Supabase CLI (se configurado)

```bash
supabase db execute -f supabase/sql/quiz_report_content_complete.sql
```

## Verificação

Após executar, verifique se os dados foram inseridos:

```sql
-- Verificar regras de perfil
SELECT COUNT(*) FROM quiz_profile_rules WHERE algorithm_version = 'v1';
-- Deve retornar 20 (5 níveis × 4 domínios)

-- Verificar textos de perfil
SELECT COUNT(*) FROM quiz_profile_texts WHERE content_version = 'v1';
-- Deve retornar 20 (5 níveis × 4 domínios)

-- Verificar templates

-- Deve retornar 2 (free e paid)

-- Verificar por domínio (deve ter 5 perfis cada)
SELECT domain, COUNT(*) as total_perfis
FROM quiz_profile_rules 
WHERE algorithm_version = 'v1'
GROUP BY domain
ORDER BY domain;
```

## Estrutura dos Dados

### Regras de Perfil (quiz_profile_rules) - 5 níveis por domínio

**Clareza:**
- muito_baixa (0-20), baixa (21-40), media (41-60), alta (61-80), muito_alta (81-100)

**Constância:**
- muito_baixa (0-20), baixa (21-40), media (41-60), alta (61-80), muito_alta (81-100)

**Emocional:**
- muito_baixo (0-20), baixo (21-40), medio (41-60), alto (61-80), muito_alto (81-100)

**Prosperidade:**
- muito_baixa (0-20), baixa (21-40), media (41-60), alta (61-80), muito_alta (81-100)

**Total: 20 perfis (4 domínios × 5 níveis)**

## Após Executar

Após executar o SQL com sucesso:
1. Recarregue a página do resultado no navegador
2. O erro "Cannot read properties of null" deve desaparecer
3. Os perfis devem ser exibidos corretamente

