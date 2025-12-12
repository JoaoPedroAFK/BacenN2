# 🚀 Deploy na Vercel - Sistema BACEN Velotax

## ⚡ Deploy Automático (100% do Tempo)

O sistema está configurado para rodar 24/7 na Vercel sem precisar iniciar nada manualmente!

## 📋 Passos para Deploy

### 1. Conectar Repositório GitHub

1. Acesse: https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Conecte seu repositório GitHub: `JoaoPedroAFK/BacenN2`
4. Clique em **"Import"**

### 2. Configurar Projeto

**Framework Preset:** Other (ou Node.js)

**Root Directory:** (deixe vazio ou `/`)

**Build Command:** (deixe vazio - não precisa build)

**Output Directory:** (deixe vazio)

**Install Command:** `npm install`

### 3. Variáveis de Ambiente

Adicione estas variáveis em **Settings** → **Environment Variables**:

```
GOOGLE_CLIENT_ID=638842930106-b0plff0sbbs0ljsm39n5kadsjfcj3u3q.apps.googleusercontent.com
```

(Se tiver outras variáveis do backend, adicione também)

### 4. Deploy!

Clique em **"Deploy"** e aguarde.

## ✅ Pronto!

Após o deploy, você receberá uma URL como:
```
https://bacen-velotax.vercel.app
```

O sistema estará rodando **24/7 automaticamente**!

## 🔄 Deploy Automático

A Vercel faz deploy automático sempre que você fizer push no GitHub:
- Push na branch `main` → Deploy automático em produção
- Push em outras branches → Preview automático

## 📝 Notas

- ✅ Servidor configurado para Vercel
- ✅ Endpoint `/api/auth/google` funcionando
- ✅ Arquivos estáticos servidos automaticamente
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Sem necessidade de iniciar nada manualmente

## 🔧 Comandos Úteis

**Ver logs:**
- Acesse o dashboard da Vercel → Seu projeto → Logs

**Redeploy manual:**
- Dashboard → Deployments → Clique nos 3 pontos → Redeploy

**Variáveis de ambiente:**
- Settings → Environment Variables

