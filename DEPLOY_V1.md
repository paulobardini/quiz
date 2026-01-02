# Guia de Deploy V1 - Quiz Backend

## Pré-requisitos

- Conta na Vercel
- Projeto Supabase configurado
- Banco de dados migrado e populado

## Checklist Pré-Deploy

### 1. Banco de Dados Supabase

Execute os seguintes scripts SQL na ordem:

1. **Schema Base:**
   - `supabase/sql/quiz_min_schema.sql`
   - `supabase/sql/result_free_schema.sql`

2. **Seed de Dados:**
   - `supabase/sql/quiz_profile_rules_reset.sql`
   - `supabase/sql/result_free_seed.sql`

3. **Migração de Dados (se aplicável):**
   - `supabase/sql/result_free_migrate_data.sql`

### 2. Variáveis de Ambiente

Configure as seguintes variáveis na Vercel:

#### Obrigatórias:
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key do Supabase

#### Opcionais:
- `NEXT_PUBLIC_API_BASE_URL` - Deixe vazio para usar URLs relativas (recomendado)
- `NEXT_PUBLIC_LP_BG_URL` - URL da imagem de fundo da Landing Page
- `QUIZ_DEBUG` - `false` para produção

### 3. Build Local

Teste o build localmente antes do deploy:

```bash
npm run build
npm run start
```

## Deploy na Vercel

### Opção 1: Deploy via GitHub (Recomendado)

1. **Conecte o repositório:**
   - Acesse [Vercel Dashboard](https://vercel.com/dashboard)
   - Clique em "Add New Project"
   - Conecte seu repositório GitHub

2. **Configure o projeto:**
   - Framework Preset: **Next.js**
   - Root Directory: `.` (raiz)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Adicione as variáveis de ambiente:**
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis listadas acima

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar

### Opção 2: Deploy via CLI

1. **Instale a CLI da Vercel:**
   ```bash
   npm i -g vercel
   ```

2. **Faça login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Configure variáveis de ambiente:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_LP_BG_URL
   ```

## Pós-Deploy

### 1. Verificação de Rotas

Teste as seguintes rotas após o deploy:

- `GET /` - Landing Page
- `GET /api/quiz/health` - Health check
- `POST /api/session/start` - Iniciar sessão
- `GET /api/result/[resultId]` - Buscar resultado
- `GET /api/report/[resultId]` - Buscar relatório premium

### 2. Teste do Fluxo Completo

1. Acesse a Landing Page
2. Inicie um quiz
3. Responda algumas perguntas
4. Complete o quiz
5. Verifique o resultado gratuito
6. Acesse o relatório premium (via paywall)

### 3. Monitoramento

- Verifique os logs na Vercel Dashboard
- Monitore erros no console do navegador
- Verifique performance no Vercel Analytics

## Troubleshooting

### Erro: "NEXT_PUBLIC_SUPABASE_URL não está definida"

- Verifique se a variável está configurada na Vercel
- Certifique-se de que o nome está correto (case-sensitive)
- Faça um redeploy após adicionar variáveis

### Erro: "Failed to fetch"

- Verifique se `NEXT_PUBLIC_API_BASE_URL` está vazia ou configurada corretamente
- Em produção, deixe vazia para usar URLs relativas
- Verifique CORS se estiver usando URL externa

### Erro: "Resultado não encontrado"

- Verifique se o banco de dados foi migrado corretamente
- Confirme que as tabelas `quiz_results` e `quiz_session_results` existem
- Verifique se há dados de teste no banco

### Build falha

- Verifique os logs de build na Vercel
- Execute `npm run build` localmente para identificar erros
- Verifique se todas as dependências estão no `package.json`

## Estrutura de Rotas V1

### Frontend
- `/` - Landing Page
- `/loading` - Página de carregamento
- `/quiz` - Quiz interativo
- `/result` - Resultado gratuito
- `/paywall` - Paywall premium
- `/report` - Relatório premium

### Backend API
- `POST /api/session/start` - Iniciar sessão
- `POST /api/session/next-question` - Próxima pergunta
- `POST /api/session/answer` - Responder pergunta
- `POST /api/session/complete` - Completar quiz
- `GET /api/result/[resultId]` - Buscar resultado gratuito
- `GET /api/report/[resultId]` - Buscar relatório premium
- `GET /api/quiz/health` - Health check

## Segurança

- ✅ `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no frontend
- ✅ Variáveis com `NEXT_PUBLIC_` são expostas ao cliente
- ✅ Use Service Role Key apenas no backend (API routes)
- ✅ Valide todas as entradas nas rotas de API

## Performance

- ✅ Páginas estáticas onde possível (`/`, `/loading`)
- ✅ API routes dinâmicas para dados em tempo real
- ✅ Otimização de imagens via CSS (background-image)
- ✅ Lazy loading de componentes quando necessário

## Versão

**V1.0.0** - Deploy inicial com:
- Fluxo completo de quiz
- Resultado gratuito
- Relatório premium
- Integração Supabase
- Deploy Vercel

