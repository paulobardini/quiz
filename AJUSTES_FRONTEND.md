# Ajustes Realizados no Frontend

## Arquivos Alterados

1. `src/types/quiz.ts`
2. `src/lib/api.ts`
3. `src/app/loading/page.tsx`
4. `src/app/quiz/page.tsx`
5. `src/app/result/page.tsx`
6. `src/app/report/page.tsx`
7. `src/app/paywall/page.tsx`
8. `src/components/StartButton.tsx`
9. `src/components/QuizCard.tsx`

## Explicação Técnica dos Ajustes

### 1. src/types/quiz.ts

**Alterações:**
- `QuestionOption.position` agora é opcional (`position?: number`)
- `CompleteResponse` agora inclui `resultId?: string`

**Motivo:**
- Permite que o backend retorne opções sem position, mantendo compatibilidade
- Prepara o tipo para quando o backend retornar resultId após completar a sessão

### 2. src/lib/api.ts

**Alterações:**
- `getResult()` agora usa `GET /api/result/{resultId}` em vez de `POST /api/session/result`

**Motivo:**
- Alinha com o contrato especificado pelo usuário
- Usa resultId em vez de sessionId para buscar resultado

### 3. src/app/loading/page.tsx

**Alterações:**
- Removida toda a lógica de chamada para `getNextQuestion()`
- Removida persistência em localStorage (`quiz_current_question`, `quiz_current_index`)
- Página agora apenas valida `quiz_session_id` e redireciona para `/quiz`
- Removido estado de erro e botão de retry

**Motivo:**
- Elimina dupla chamada de `next-question` (loading não deve chamar, apenas quiz)
- `/loading` agora é apenas uma página de transição que valida sessão
- Backend é a única fonte de verdade do progresso

### 4. src/app/quiz/page.tsx

**Alterações:**
- Removida leitura de `quiz_current_question` do localStorage
- Removida persistência de `quiz_current_question` e `quiz_current_index`
- `handleComplete()` agora salva `resultId` no localStorage se retornado pelo backend
- Removida lógica de fallback para questão salva

**Motivo:**
- Garante que apenas `/quiz` chama `getNextQuestion()`
- Backend é sempre a fonte de verdade do progresso
- Refresh em `/quiz` não pula perguntas, sempre busca do backend
- Prepara para quando o backend retornar `resultId` após completar

### 5. src/app/result/page.tsx

**Alterações:**
- Agora usa `quiz_result_id` do localStorage em vez de `quiz_session_id`
- Chama `getResult(resultId)` com GET em vez de POST

**Motivo:**
- Alinha com o contrato `GET /api/result/{resultId}`
- Proteção: se não existir `quiz_result_id`, redireciona para `/`
- Usa resultId persistido após completar a sessão

### 6. src/app/report/page.tsx

**Alterações:**
- Adicionada verificação de `quiz_result_id` antes de carregar relatório
- Se não existir `quiz_result_id`, redireciona para `/paywall`

**Motivo:**
- Proteção de fluxo: garante que apenas quem completou o quiz acessa o relatório
- Redireciona para paywall se não tiver resultId, mantendo o fluxo correto

### 7. src/app/paywall/page.tsx

**Alterações:**
- Adicionada verificação de `quiz_session_id` no useEffect
- Se não existir, redireciona para `/`

**Motivo:**
- Proteção de fluxo: garante que apenas quem tem sessão ativa acessa o paywall

### 8. src/components/StartButton.tsx

**Alterações:**
- Removida persistência de `quiz_total_questions` e `quiz_started_at`
- Mantida apenas `quiz_session_id`

**Motivo:**
- Reduz localStorage apenas para dados essenciais
- Backend é a fonte de verdade para total de perguntas e timestamp

### 9. src/components/QuizCard.tsx

**Alterações:**
- Ordenação de opções agora verifica se `position` existe antes de ordenar
- Se não existir position, mantém ordem recebida do backend

**Motivo:**
- Compatibilidade com opções que não têm position definido
- Fallback seguro quando position não está presente

## Resumo das Mudanças

### localStorage Reduzido

**Antes:**
- `quiz_session_id`
- `quiz_total_questions`
- `quiz_started_at`
- `quiz_current_question`
- `quiz_current_index`

**Depois:**
- `quiz_session_id`
- `quiz_result_id`

### Fluxo de Chamadas

**Antes:**
- `/loading` chamava `getNextQuestion()` e salvava no localStorage
- `/quiz` tentava ler do localStorage primeiro, depois chamava API

**Depois:**
- `/loading` apenas valida sessão e redireciona
- `/quiz` sempre chama `getNextQuestion()` do backend
- Backend é sempre a fonte de verdade

### Proteções de Fluxo

- Todas as rotas internas verificam `quiz_session_id`
- `/result` e `/report` verificam `quiz_result_id`
- Redirecionamentos automáticos para `/` quando dados ausentes

### Contrato de API

- `GET /api/result/{resultId}` em vez de `POST /api/session/result`
- `CompleteResponse` preparado para retornar `resultId` (opcional por enquanto)
- `position` opcional em `QuestionOption`

## Observações

1. O backend atual ainda não retorna `resultId` em `/api/session/complete`, mas o frontend está preparado para quando isso acontecer
2. O endpoint `GET /api/result/{resultId}` precisa ser implementado no backend se ainda não existir
3. Todas as mudanças mantêm compatibilidade com o backend atual, exceto `getResult()` que agora espera GET em vez de POST
4. O fluxo está mais seguro e previsível, com backend como única fonte de verdade

