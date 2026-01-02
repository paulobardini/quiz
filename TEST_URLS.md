# URLs de Teste - Payment Success

## URL Base
```
https://quiz-lilac-seven.vercel.app/payment/success
```

## Opção 1: Com sessionId (s1)
Substitua `SEU_SESSION_ID_AQUI` pelo ID de uma sessão válida do banco:

```
https://quiz-lilac-seven.vercel.app/payment/success?s1=SEU_SESSION_ID_AQUI
```

**Exemplo:**
```
https://quiz-lilac-seven.vercel.app/payment/success?s1=c555334a-78c7-48a4-89a1-742456753c88
```

## Opção 2: Com resultId direto (mais rápido)
Se você já tem um `resultId`, pode acessar diretamente o relatório:

```
https://quiz-lilac-seven.vercel.app/report?resultId=SEU_RESULT_ID_AQUI
```

**Exemplo:**
```
https://quiz-lilac-seven.vercel.app/report?resultId=26d05116-188f-4907-b6dd-ec24d13563d4
```

## Como obter um sessionId ou resultId válido

### Via Supabase SQL Editor:
```sql
-- Pegar um sessionId recente
SELECT id, status, created_at 
FROM quiz_sessions 
WHERE status = 'completed' 
ORDER BY created_at DESC 
LIMIT 5;

-- Pegar um resultId recente
SELECT id, session_id, created_at 
FROM quiz_session_results 
ORDER BY created_at DESC 
LIMIT 5;
```

### Via API (se tiver um sessionId):
```
GET https://quiz-lilac-seven.vercel.app/api/session/result-id?sessionId=SEU_SESSION_ID
```

## Teste Rápido
Se você já tem um `resultId` que funcionou antes, use diretamente:
```
https://quiz-lilac-seven.vercel.app/report?resultId=26d05116-188f-4907-b6dd-ec24d13563d4
```

