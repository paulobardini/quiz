# Checklist de Deploy V1

Use este checklist antes de fazer deploy em produção.

## ✅ Pré-Deploy

### Banco de Dados
- [ ] Executou `quiz_min_schema.sql` no Supabase
- [ ] Executou `result_free_schema.sql` no Supabase
- [ ] Executou `quiz_profile_rules_reset.sql` no Supabase
- [ ] Executou `result_free_seed.sql` no Supabase
- [ ] Verificou que há dados de teste no banco
- [ ] Testou queries básicas no Supabase

### Código
- [ ] Build local passou sem erros (`npm run build`)
- [ ] Servidor de produção funciona (`npm run start`)
- [ ] Não há erros de TypeScript (`npm run type-check`)
- [ ] Lint passou sem erros críticos (`npm run lint`)
- [ ] Todas as rotas de API estão funcionando
- [ ] Frontend renderiza corretamente

### Variáveis de Ambiente
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `NEXT_PUBLIC_LP_BG_URL` configurada (ou usando padrão)
- [ ] `NEXT_PUBLIC_API_BASE_URL` vazia (ou configurada corretamente)
- [ ] Todas as variáveis estão no `.env.example`

### Testes Funcionais
- [ ] Landing Page carrega corretamente
- [ ] Botão "Iniciar Quiz" funciona
- [ ] Quiz carrega perguntas
- [ ] Respostas são enviadas corretamente
- [ ] Quiz completa e gera resultado
- [ ] Página de resultado exibe dados
- [ ] Paywall redireciona corretamente
- [ ] Relatório premium carrega (se aplicável)

## ✅ Deploy na Vercel

### Configuração
- [ ] Projeto conectado ao GitHub
- [ ] Framework detectado como Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next` (padrão)
- [ ] Node.js version: 18.x ou superior

### Variáveis de Ambiente
- [ ] Todas as variáveis adicionadas na Vercel
- [ ] Variáveis configuradas para Production
- [ ] Variáveis configuradas para Preview (opcional)
- [ ] Variáveis configuradas para Development (opcional)

### Deploy
- [ ] Primeiro deploy iniciado
- [ ] Build completou com sucesso
- [ ] Deploy está ativo
- [ ] URL de produção está acessível

## ✅ Pós-Deploy

### Verificação de Rotas
- [ ] `GET /` - Landing Page
- [ ] `GET /api/quiz/health` - Health check retorna 200
- [ ] `POST /api/session/start` - Cria sessão
- [ ] `GET /api/result/[resultId]` - Retorna resultado
- [ ] `GET /api/report/[resultId]` - Retorna relatório

### Teste End-to-End
- [ ] Fluxo completo funciona em produção
- [ ] Dados são salvos no Supabase
- [ ] Resultados são gerados corretamente
- [ ] Navegação entre páginas funciona
- [ ] localStorage funciona corretamente
- [ ] Erros são tratados adequadamente

### Performance
- [ ] Páginas carregam em < 3s
- [ ] API responses em < 1s
- [ ] Imagens carregam corretamente
- [ ] Sem erros no console do navegador
- [ ] Sem warnings críticos

### Segurança
- [ ] Service Role Key não está exposta
- [ ] Variáveis sensíveis não estão no código
- [ ] CORS configurado corretamente (se necessário)
- [ ] Validação de inputs nas APIs

### Monitoramento
- [ ] Logs da Vercel estão acessíveis
- [ ] Erros são logados corretamente
- [ ] Analytics configurado (opcional)

## ✅ Documentação

- [ ] README.md atualizado
- [ ] DEPLOY_V1.md criado
- [ ] .env.example atualizado
- [ ] Comentários no código quando necessário

## 🚀 Pronto para Produção!

Após completar todos os itens acima, o projeto está pronto para produção.

