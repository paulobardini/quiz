# Configuração da Integração Kiwify

Este guia explica como configurar todas as variáveis de ambiente necessárias para a integração com a Kiwify.

## Variáveis de Ambiente Necessárias

### 1. Para o Checkout (Frontend)

**`NEXT_PUBLIC_KIWIFY_PRODUCT_URL`**
- **O que é**: URL completa do checkout ou slug do produto na Kiwify
- **Onde encontrar**: No painel da Kiwify → Links → Selecione o checkout → Copie a URL
- **Exemplos**:
  - URL completa: `https://pay.kiwify.com.br/Tgsa1ZA`
  - Slug: `Tgsa1ZA` (será convertido automaticamente para `https://pay.kiwify.com.br/Tgsa1ZA`)
- **Uso**: Usado no botão de checkout para redirecionar o usuário
- **Importante**: Use a URL do tipo "Checkout", não "Página"

### 2. Para o Webhook (Backend)

**`KIWIFY_WEBHOOK_TOKEN`**
- **O que é**: Token de segurança do webhook
- **Onde encontrar**: No painel da Kiwify → Webhooks → Configurar webhook
- **Uso**: Valida que o webhook realmente veio da Kiwify

**`KIWIFY_OAUTH_TOKEN`**
- **O que é**: Token OAuth para acessar a API da Kiwify
- **Valor**: `client_secret` da sua API Key
- **No seu caso**: `883bcfb4a9e3efaf24ea115832df2405365b3f5db3c5b0f6b4fdf09d37d`
- **Uso**: Usado para buscar dados completos da venda via API

**`KIWIFY_ACCOUNT_ID`**
- **O que é**: ID da sua conta Kiwify
- **Valor**: `account_id` da sua API Key
- **No seu caso**: `YUuS5fpgWB3bkuk`
- **Uso**: Usado junto com o OAuth token para autenticar na API

## Configuração no `.env.local`

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Checkout Kiwify (Frontend)
NEXT_PUBLIC_KIWIFY_PRODUCT_URL=https://pay.kiwify.com.br/Tgsa1ZA
# OU apenas o slug: Tgsa1ZA

# Webhook Kiwify (Backend)
KIWIFY_WEBHOOK_TOKEN=seu_token_do_webhook_kiwify
KIWIFY_OAUTH_TOKEN=883bcfb4a9e3efaf24ea115832df2405365b3f5db3c5b0f6b4fdf09d37d
KIWIFY_ACCOUNT_ID=YUuS5fpgWB3bkuk
```

## Configuração na Vercel

1. Acesse o painel da Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione todas as variáveis acima
4. **Importante**: Marque `KIWIFY_OAUTH_TOKEN`, `KIWIFY_ACCOUNT_ID` e `KIWIFY_WEBHOOK_TOKEN` como **Secret** (não devem aparecer no código)

## Como Obter o Token do Webhook

1. Acesse o painel da Kiwify
2. Vá em **Configurações** → **Webhooks**
3. Crie um novo webhook ou edite o existente
4. Configure a URL: `https://seu-dominio.vercel.app/api/webhooks/kiwify?token=SEU_TOKEN_AQUI`
5. Copie o token configurado e use como `KIWIFY_WEBHOOK_TOKEN`

## Como Obter a URL do Checkout

1. Acesse o painel da Kiwify
2. Vá em **Links** → Procure pelo link do tipo "Checkout"
3. Copie a URL completa (ex: `https://pay.kiwify.com.br/Tgsa1ZA`)
   - Você pode usar a URL completa OU apenas o slug (ex: `Tgsa1ZA`)
4. Use como `NEXT_PUBLIC_KIWIFY_PRODUCT_URL`
5. **Importante**: Use o link do tipo "Checkout", não "Página"

## Verificação

Após configurar:

1. **Checkout**: O botão "Desbloquear Relatório" deve redirecionar para o checkout da Kiwify
2. **Webhook**: Teste enviando um webhook de teste da Kiwify e verifique os logs na Vercel
3. **Tracking**: O parâmetro `s1` será automaticamente preenchido com o `quiz_session_id`

## Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env.local` no Git
- As chaves `KIWIFY_OAUTH_TOKEN` e `KIWIFY_WEBHOOK_TOKEN` são sensíveis
- Use variáveis de ambiente secretas na Vercel
- O `client_secret` só aparece uma vez - guarde-o com segurança!

