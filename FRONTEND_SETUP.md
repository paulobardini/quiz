# Frontend Setup - Quiz Next.js

## Estrutura Criada

```
src/
├── app/
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Landing Page (/)
│   ├── loading/
│   │   └── page.tsx        # Página de loading (/loading)
│   ├── quiz/
│   │   └── page.tsx        # Página do quiz (/quiz)
│   ├── result/
│   │   └── page.tsx        # Página de resultado (/result)
│   ├── paywall/
│   │   └── page.tsx        # Página de paywall (/paywall)
│   ├── report/
│   │   └── page.tsx        # Página de relatório (/report)
│   └── globals.css         # Estilos globais com Tailwind
├── components/
│   ├── StartButton.tsx     # Botão de iniciar quiz
│   └── QuizCard.tsx        # Card de pergunta
├── lib/
│   └── api.ts              # Centralização de chamadas HTTP
└── types/
    └── quiz.ts             # Tipagens TypeScript
```

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_API_BASE_URL=https://quiz-lilac-seven.vercel.app
NEXT_PUBLIC_LP_BG_URL=https://i.ibb.co/7J9jBKP1/pexels-njeromin-28203471.jpg
```

### 2. Instalação de Dependências

As dependências já estão instaladas. Se necessário, execute:

```bash
npm install
```

### 3. Execução Local

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Fluxo de Navegação

1. **Landing Page (/)**: Exibe o botão "Iniciar Quiz"
2. **Loading (/loading)**: Prepara estado e busca primeira pergunta
3. **Quiz (/quiz)**: Renderiza perguntas e opções, envia respostas
4. **Result (/result)**: Exibe resultado com CTA para relatório
5. **Paywall (/paywall)**: Simula paywall premium
6. **Report (/report)**: Exibe relatório completo

## Funcionalidades Implementadas

### Persistência no localStorage

- `quiz_session_id`: ID da sessão atual
- `quiz_total_questions`: Total de perguntas
- `quiz_started_at`: Timestamp de início
- `quiz_current_question`: JSON da pergunta atual
- `quiz_current_index`: Índice da pergunta atual

### Prevenção de Duplicação

- O `StartButton` verifica se já existe `quiz_session_id` antes de criar nova sessão
- Se existir, redireciona diretamente para `/loading`

### Proteção contra Cliques Duplos

- Estado `isSubmitting` no `QuizCard` bloqueia múltiplos cliques
- Estado `isLoading` no `StartButton` previne múltiplas requisições

### Tratamento de Erros

- Redirecionamento automático para `/` quando sessão inválida
- Mensagens de erro claras para o usuário
- Fallback para estados de erro

## Componentes

### StartButton

Componente client-side que:
- Inicia nova sessão via API
- Salva dados no localStorage
- Redireciona para `/loading`
- Previne duplicação de sessão

### QuizCard

Componente client-side que:
- Renderiza pergunta e opções
- Exibe barra de progresso
- Bloqueia cliques durante submissão
- Ordena opções por `position`

## API Integration

Todas as chamadas HTTP estão centralizadas em `src/lib/api.ts`:

- `startSession()`: POST /api/session/start
- `getNextQuestion()`: POST /api/session/next-question
- `submitAnswer()`: POST /api/session/answer
- `completeSession()`: POST /api/session/complete
- `getResult()`: POST /api/session/result
- `getReport()`: POST /api/session/report

## Tipagens

Todas as tipagens estão em `src/types/quiz.ts`:

- `StartSessionRequest/Response`
- `NextQuestionRequest/Response`
- `AnswerRequest/Response`
- `CompleteRequest/Response`
- `ResultResponse`
- `ReportResponse`

## Ajustes para Variações no Backend

### Se o payload do backend mudar:

1. **Atualizar tipos** em `src/types/quiz.ts`
2. **Atualizar funções** em `src/lib/api.ts` se necessário
3. **Atualizar componentes** que consomem os dados

### Exemplo: Se `NextQuestionResponse` mudar

1. Edite `src/types/quiz.ts`:
```typescript
export interface NextQuestionResponse {
  done: boolean;
  question?: Question;
  options?: QuestionOption[];
  // Adicione novos campos aqui
}
```

2. Os componentes que usam `getNextQuestion()` automaticamente receberão os novos tipos

## SSR vs CSR

- **Server Components (padrão)**: `layout.tsx`
- **Client Components**: Todas as páginas e componentes que usam:
  - `useState`, `useEffect`
  - `localStorage`
  - `useRouter` do Next.js
  - Event handlers

Todas as páginas são Client Components (`"use client"`) porque precisam de interatividade e acesso ao localStorage.

## Observações Finais

1. O background da LP usa CSS inline com `backgroundImage` (não `next/image`)
2. O overlay escuro tem opacidade de 65% (`bg-black/65`)
3. Todos os componentes são responsivos com classes Tailwind
4. O fluxo completo está funcional e pronto para produção
5. O paywall é apenas simulação, sem integração de pagamento real

## Próximos Passos (Opcional)

1. Adicionar animações de transição entre páginas
2. Implementar analytics/tracking
3. Adicionar testes unitários
4. Implementar sistema de pagamento real no paywall
5. Adicionar loading states mais elaborados
6. Implementar tratamento de offline/retry automático

