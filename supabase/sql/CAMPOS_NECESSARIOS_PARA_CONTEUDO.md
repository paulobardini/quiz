# Campos Necessários para Criar Conteúdo Premium

## Opção 1: Tabela `premium_report_content` (Recomendado)

Esta é a opção mais completa e estruturada. Cada perfil precisa de um registro nesta tabela.

### Campos Obrigatórios:

1. **`profile_id`** (UUID)
   - ID do perfil na tabela `quiz_profiles`
   - Exemplo: ID do perfil `emocional_medio`

2. **`title`** (TEXT)
   - Título do relatório premium
   - Exemplo: "Leitura completa do seu padrão de decisão"

3. **`blocks`** (JSONB)
   - Array de objetos, cada objeto representa um bloco do relatório
   - Deve conter exatamente 7 blocos
   - Estrutura de cada bloco:
     ```json
     {
       "order": 1,
       "block_id": "abertura",
       "title": "Abertura",
       "subtitle": "Validação e leitura inicial do padrão",
       "paragraphs": [
         "Parágrafo 1 do bloco",
         "Parágrafo 2 do bloco",
         "Parágrafo 3 do bloco"
       ]
     }
     ```

4. **`version`** (TEXT, opcional mas recomendado)
   - Versão do conteúdo
   - Exemplo: "v1"

### Estrutura Completa dos 7 Blocos:

```json
[
  {
    "order": 1,
    "block_id": "abertura",
    "title": "Abertura",
    "subtitle": "Validação e leitura inicial do padrão",
    "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
  },
  {
    "order": 2,
    "block_id": "padrao_acao",
    "title": "O Padrão em Ação",
    "subtitle": "Como isso aparece no seu dia a dia",
    "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
  },
  {
    "order": 3,
    "block_id": "origem",
    "title": "A Origem do Padrão",
    "subtitle": "Por que isso se repete, mesmo com esforço",
    "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
  },
  {
    "order": 4,
    "block_id": "custo",
    "title": "O Custo Invisível",
    "subtitle": "O que esse padrão está te custando",
    "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
  },
  {
    "order": 5,
    "block_id": "ajuste",
    "title": "O Ajuste-Chave",
    "subtitle": "O que muda a forma como você decide",
    "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
  },
  {
    "order": 6,
    "block_id": "evitar",
    "title": "O Que Evitar",
    "subtitle": "Erros comuns de quem tem esse padrão",
    "paragraphs": ["parágrafo 1", "parágrafo 2", "parágrafo 3"]
  },
  {
    "order": 7,
    "block_id": "desafio",
    "title": "Desafio de 7 Dias",
    "subtitle": "Experiência prática guiada",
    "paragraphs": [
      "Este desafio existe para tirar a leitura do papel e transformar em movimento observável.",
      "Dias 1 e 2: anote decisões já tomadas que você continua revisitando.",
      "Dias 3 e 4: escolha uma e declare encerrada.",
      "Dias 5 e 6: observe tentativas de reabertura e volte ao encerramento.",
      "Dia 7: avalie a energia economizada."
    ]
  }
]
```

---

## Opção 2: Tabela `quiz_profile_content` (Fallback)

Se não houver conteúdo em `premium_report_content`, o sistema usa esta tabela como fallback. Cada perfil precisa de 2 registros:

### Registro 1: `paid_deepdive`

- **`profile_id`** (UUID): ID do perfil
- **`content_type`** (TEXT): `'paid_deepdive'`
- **`body`** (TEXT): Texto completo da análise profunda
- **`is_active`** (BOOLEAN): `true`
- **`version`** (TEXT, opcional): `'v1'`

### Registro 2: `paid_plan`

- **`profile_id`** (UUID): ID do perfil
- **`content_type`** (TEXT): `'paid_plan'`
- **`body`** (TEXT): Texto completo do plano de ação
- **`is_active`** (BOOLEAN): `true`
- **`version`** (TEXT, opcional): `'v1'`

---

## SQL para Verificar o Que Está Faltando

Execute o arquivo `verify_all_profiles_content.sql` para ver:
- Quais perfis têm conteúdo completo
- Quais perfis têm apenas fallback
- Quais perfis não têm nenhum conteúdo

---

## Resumo

**Para cada perfil, você precisa criar:**

1. **OPÇÃO PREFERIDA:** 1 registro em `premium_report_content` com:
   - `profile_id`
   - `title`
   - `blocks` (JSONB com 7 blocos)
   - `version` (opcional)

2. **OPÇÃO FALLBACK:** 2 registros em `quiz_profile_content`:
   - 1 registro com `content_type = 'paid_deepdive'`
   - 1 registro com `content_type = 'paid_plan'`

**Total de perfis:** 20 perfis (5 por domínio × 4 domínios)
- Clareza: 5 perfis
- Constância: 5 perfis
- Emocional: 5 perfis
- Prosperidade: 5 perfis

