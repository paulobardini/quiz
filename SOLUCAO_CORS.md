# Solução para Erro de Conexão no Localhost

## Problema

A API funciona no Postman mas não no navegador quando rodando em localhost. Isso acontece porque:

1. **CORS**: O navegador bloqueia requisições cross-origin (localhost → Vercel)
2. **Mesmo Projeto**: Frontend e backend estão no mesmo projeto Next.js, então não precisa usar URL externa

## Solução Recomendada

Para desenvolvimento local, use URLs relativas. Isso faz o frontend chamar as APIs do mesmo servidor Next.js.

### Passo 1: Ajustar .env.local

Edite o arquivo `.env.local` e deixe `NEXT_PUBLIC_API_BASE_URL` vazio ou remova a linha:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_LP_BG_URL=https://i.ibb.co/7J9jBKP1/pexels-njeromin-28203471.jpg
```

Ou simplesmente remova a linha `NEXT_PUBLIC_API_BASE_URL` do arquivo.

### Passo 2: Reiniciar o Servidor

Após alterar o `.env.local`, reinicie o servidor Next.js:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

### Passo 3: Testar

Agora o botão "Iniciar Quiz" deve funcionar, pois o frontend usará URLs relativas como `/api/session/start` que apontam para o mesmo servidor Next.js.

## Como Funciona

- **Sem `NEXT_PUBLIC_API_BASE_URL`**: Frontend usa URLs relativas (`/api/session/start`)
- **Com `NEXT_PUBLIC_API_BASE_URL`**: Frontend usa URL absoluta (`https://quiz-lilac-seven.vercel.app/api/session/start`)

## Para Produção

Na Vercel, configure a variável de ambiente `NEXT_PUBLIC_API_BASE_URL` com a URL da sua API de produção. O código já está preparado para isso.

## Alternativa: Configurar CORS na Vercel

Se realmente precisar usar a API da Vercel em desenvolvimento local, você precisaria configurar CORS nas rotas da API para permitir requisições do localhost. Mas isso não é necessário já que frontend e backend estão no mesmo projeto.

