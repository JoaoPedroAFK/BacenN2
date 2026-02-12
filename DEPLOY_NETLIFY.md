# Deploy no Netlify (branch netlify-deploy)

Este deploy usa o código do **commit b88b6e5** (branch `netlify-deploy`). O app está na pasta **painel de serviços**.

## Passos na Netlify

1. **Conectar repositório**
   - Site novo: "Add new site" → "Import an existing project" → GitHub → escolher o repositório VeloHub.

2. **Configuração do build**
   - **Branch to deploy:** `netlify-deploy`
   - **Base directory:** deixar em branco (o `netlify.toml` na raiz já define `base = "painel de serviços"`).
   - **Build command:** (herdado do `painel de serviços/netlify.toml`: `npm run build`)
   - **Publish directory:** (herdado: `.next`; o plugin Next.js da Netlify cuida do output)

3. **Variáveis de ambiente**
   - Configurar no Netlify (Site settings → Environment variables) todas as variáveis que o painel precisa (ex.: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.), conforme o `.env.example` do painel.

4. **Deploy**
   - "Deploy site". O primeiro build pode demorar alguns minutos.

## Voltar a trabalhar na branch principal

```bash
git checkout Inovações
git stash pop   # se tiver guardado alterações antes de criar netlify-deploy
```

## Atualizar o deploy depois

Para o Netlify continuar usando exatamente este ponto do código, mantenha o deploy apontando para a branch `netlify-deploy`. Se quiser que novos commits entrem no deploy, faça merge (ou cherry-pick) desses commits em `netlify-deploy` e dê push.
