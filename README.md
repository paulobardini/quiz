# Quiz Backend - V1

Backend e frontend do sistema de quiz desenvolvido com Next.js App Router, Supabase e deploy na Vercel.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript/JavaScript**
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL)
- **Vercel** (deploy)

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── session/      # Rotas de sessão
│   │   ├── result/       # Rotas de resultado
│   │   └── report/       # Rotas de relatório
│   ├── loading/          # Página de loading
│   ├── quiz/             # Página do quiz
│   ├── result/           # Resultado gratuito
│   ├── paywall/          # Paywall premium
│   └── report/           # Relatório premium
├── components/           # Componentes React
├── lib/                  # Utilitários e helpers
└── types/                # Tipagens TypeScript
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em [http://localhost:3000](http://localhost:3000).

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (veja `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Frontend
NEXT_PUBLIC_LP_BG_URL=https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg
NEXT_PUBLIC_API_BASE_URL=  # Deixe vazio para desenvolvimento local

# Kiwify - Checkout (Frontend)
NEXT_PUBLIC_KIWIFY_PRODUCT_URL=https://pay.kiwify.com.br/Tgsa1ZA  # URL completa ou slug do checkout

# Kiwify - Webhook (Backend)
KIWIFY_WEBHOOK_TOKEN=seu_token_do_webhook_kiwify
KIWIFY_OAUTH_TOKEN=seu_client_secret_da_api_key  # client_secret da API Key
KIWIFY_ACCOUNT_ID=seu_account_id  # account_id da API Key
```

📖 **Guia completo de configuração Kiwify**: Veja [KIWIFY_SETUP.md](./KIWIFY_SETUP.md)

## Build

```bash
npm run build
npm run start
```

## Deploy

Consulte o guia completo em [DEPLOY_V1.md](./DEPLOY_V1.md).

### Deploy Rápido na Vercel

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## Fluxo do Quiz

1. **Landing Page (`/`)** - Entrada do usuário
2. **Loading (`/loading`)** - Preparação da sessão
3. **Quiz (`/quiz`)** - Perguntas e respostas
4. **Result (`/result`)** - Resultado gratuito
5. **Paywall (`/paywall`)** - Transição para premium
6. **Report (`/report`)** - Relatório completo

## API Endpoints

### Sessão
- `POST /api/session/start` - Iniciar nova sessão
- `POST /api/session/next-question` - Buscar próxima pergunta
- `POST /api/session/answer` - Enviar resposta
- `POST /api/session/complete` - Completar quiz

### Resultados
- `GET /api/result/[resultId]` - Buscar resultado gratuito
- `GET /api/report/[resultId]` - Buscar relatório premium

### Health
- `GET /api/quiz/health` - Health check

## Banco de Dados

O projeto usa Supabase (PostgreSQL). Execute os scripts SQL na ordem:

1. Schema base: `supabase/sql/quiz_min_schema.sql`
2. Schema de resultados: `supabase/sql/result_free_schema.sql`
3. Seed de dados: `supabase/sql/quiz_profile_rules_reset.sql`
4. Seed de resultados: `supabase/sql/result_free_seed.sql`

Consulte `INSTRUCOES_EXECUTAR_SQL.md` para mais detalhes.

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint

## Documentação Adicional

- [DEPLOY_V1.md](./DEPLOY_V1.md) - Guia completo de deploy
- [INSTRUCOES_EXECUTAR_SQL.md](./INSTRUCOES_EXECUTAR_SQL.md) - Instruções SQL
- [INSTRUCOES_RESULTADO_GRATUITO.md](./INSTRUCOES_RESULTADO_GRATUITO.md) - Setup de resultados

## Versão

**V1.0.0** - Versão inicial de produção
