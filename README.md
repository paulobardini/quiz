# Quiz Backend

Backend do sistema de quiz desenvolvido com Next.js App Router, Supabase e deploy na Vercel.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (PostgreSQL)
- Vercel (deploy)

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

Configure as seguintes variáveis de ambiente (veja `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key do Supabase
- `QUIZ_DEBUG` - Modo debug (opcional, padrão: false)

## Build

```bash
npm run build
```

## Deploy

O projeto está configurado para deploy automático na Vercel via GitHub.
