# 🔧 CORREÇÃO DO ERRO 404 NA VERCEL

## ⚠️ Problema: 404 NOT_FOUND

Se você está recebendo erro 404, siga estes passos:

## ✅ Solução Passo a Passo

### 1. Na Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Vá no seu projeto
3. Clique em **Settings** → **General**

### 2. Configurações OBRIGATÓRIAS

**Framework Preset:** 
- Selecione **"Other"** ou **"Vite"** (não importa, vamos sobrescrever)

**Root Directory:** 
- Deixe **VAZIO** ou coloque apenas `/`

**Build Command:** 
- Deixe **VAZIO** (não precisa build)

**Output Directory:** 
- Deixe **VAZIO**

**Install Command:** 
- Deixe `npm install` (padrão)

### 3. Verificar Estrutura de Arquivos

Certifique-se de que na raiz do projeto tem:
- ✅ `index.html`
- ✅ `bacen.html`
- ✅ `n2.html`
- ✅ `chatbot.html`
- ✅ `package.json`
- ✅ Pasta `api/auth/google.js` (para o endpoint SSO)

### 4. Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o deploy completar

### 5. Verificar URL

Após o deploy, acesse:
- `https://seu-projeto.vercel.app/` (deve mostrar o index.html)
- `https://seu-projeto.vercel.app/bacen.html`
- `https://seu-projeto.vercel.app/api/auth/google` (deve retornar erro de método, não 404)

## 🐛 Se ainda der 404

### Opção A: Deletar e Recriar o Projeto

1. Na Vercel, delete o projeto atual
2. Crie um novo projeto
3. Conecte o mesmo repositório
4. Configure conforme passo 2 acima
5. Deploy

### Opção B: Usar Netlify (Alternativa)

Se a Vercel continuar dando problema:

1. Acesse: https://app.netlify.com
2. "Add new site" → "Import an existing project"
3. Conecte o GitHub: `JoaoPedroAFK/BacenN2`
4. Deploy settings:
   - Build command: (deixe vazio)
   - Publish directory: (deixe vazio)
5. Deploy!

Netlify é mais simples para sites estáticos e funciona igualmente bem.

## 📝 Notas Importantes

- A Vercel detecta automaticamente arquivos estáticos na raiz
- Não precisa de `vercel.json` para sites estáticos simples
- O endpoint `/api/auth/google` será detectado automaticamente pela pasta `api/`
- Certifique-se de que todos os arquivos estão commitados no Git

## ✅ Checklist Final

- [ ] Root Directory está vazio
- [ ] Build Command está vazio
- [ ] Output Directory está vazio
- [ ] Todos os arquivos estão no Git
- [ ] Variável `GOOGLE_CLIENT_ID` está configurada
- [ ] Redeploy foi feito após mudanças

