# Ajustes nas Rotas de API

## Arquivos Criados ou Alterados

1. `src/app/api/session/complete/route.ts` (alterado)
2. `src/app/api/result/[resultId]/route.ts` (criado)

## Código Completo dos Arquivos

### 1. src/app/api/session/complete/route.ts

O arquivo foi ajustado para sempre retornar `resultId` após completar a sessão. As principais mudanças:

- Quando a sessão já está completa, busca o `resultId` existente e retorna
- Após criar/atualizar o resultado, busca o `id` do registro e retorna no response
- Response agora sempre inclui: `{ ok: true, resultId: string }`

### 2. src/app/api/result/[resultId]/route.ts

Nova rota criada para buscar resultado por ID:

- Método: GET
- Path: `/api/result/{resultId}`
- Valida `resultId` na URL
- Busca resultado no banco por ID
- Valida que a sessão associada está completa
- Retorna o mesmo formato que `POST /api/session/result`

## Instruções de Teste Local

### Pré-requisitos

1. Ter o servidor Next.js rodando localmente (`npm run dev`)
2. Ter as variáveis de ambiente configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Ter dados de teste no Supabase (sessão com respostas completas)

### Teste 1: POST /api/session/complete retorna resultId

```bash
# Substitua SESSION_ID por um ID de sessão válida com 28 respostas
curl -X POST http://localhost:3000/api/session/complete \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID"}'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "resultId": "uuid-do-resultado"
}
```

**Salve o `resultId` retornado para o próximo teste.**

### Teste 2: GET /api/result/{resultId} retorna resultado

```bash
# Substitua RESULT_ID pelo resultId obtido no teste anterior
curl http://localhost:3000/api/result/RESULT_ID
```

**Resposta esperada:**
```json
{
  "scores": {
    "clareza": 75,
    "constancia": 80,
    "emocional": 65,
    "prosperidade": 70
  },
  "primaryDomain": "constancia",
  "secondaryDomain": "clareza",
  "primaryProfile": {
    "key": "profile-key",
    "title": "Título do Perfil",
    "freeSummary": "Resumo do perfil..."
  },
  "secondaryProfile": {
    "key": "profile-key-2",
    "title": "Título do Perfil Secundário"
  }
}
```

### Teste 3: GET /api/result/{resultId} com ID inválido

```bash
curl http://localhost:3000/api/result/00000000-0000-0000-0000-000000000000
```

**Resposta esperada:**
```json
{
  "error": "Resultado não encontrado"
}
```
Status: 404

### Teste 4: POST /api/session/complete com sessão já completa

```bash
# Use um sessionId de uma sessão já completada
curl -X POST http://localhost:3000/api/session/complete \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID_COMPLETA"}'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "resultId": "uuid-do-resultado-existente"
}
```

### Teste 5: POST /api/session/complete com sessão incompleta

```bash
# Use um sessionId de uma sessão com menos de 28 respostas
curl -X POST http://localhost:3000/api/session/complete \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID_INCOMPLETA"}'
```

**Resposta esperada:**
```json
{
  "error": "Sessão incompleta: X de 28 perguntas respondidas"
}
```
Status: 409

## Validações Implementadas

### POST /api/session/complete
- Valida que `sessionId` é obrigatório e string
- Valida que a sessão existe
- Valida que todas as 28 perguntas foram respondidas
- Retorna `resultId` sempre que a operação for bem-sucedida

### GET /api/result/{resultId}
- Valida que `resultId` é obrigatório e string
- Valida que o resultado existe
- Valida que a sessão associada existe
- Valida que a sessão está com status `completed`
- Retorna erro 404 se resultado não encontrado
- Retorna erro 409 se sessão não está completa

## Observações

1. A rota `POST /api/session/result` continua funcionando para compatibilidade
2. A nova rota `GET /api/result/{resultId}` usa o mesmo formato de resposta
3. O `resultId` é um UUID gerado automaticamente pelo Supabase
4. Todas as validações de negócio foram mantidas, apenas a exposição do resultado foi ajustada

