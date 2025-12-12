# ✅ Configuração Correta da Vercel

## ⚙️ Configurações OBRIGATÓRIAS no Dashboard da Vercel

### Settings → General

1. **Framework Preset:** `Other`
2. **Root Directory:** (deixe **VAZIO**)
3. **Build Command:** (deixe **VAZIO**)
4. **Output Directory:** (deixe **VAZIO** - o `vercel.json` já configura)
5. **Install Command:** `npm install`

### Settings → Environment Variables

Adicione:
- **Name:** `GOOGLE_CLIENT_ID`
- **Value:** `638842930106-b0plff0sbbs0ljsm39n5kadsjfcj3u3q.apps.googleusercontent.com`

## 📝 O que o `vercel.json` faz

```json
{
  "outputDirectory": ".",
  "rewrites": [
    {
      "source": "/api/auth/google",
      "destination": "/api/auth/google.js"
    }
  ]
}
```

- `outputDirectory: "."` = Indica que os arquivos estão na raiz do projeto
- `rewrites` = Configura o endpoint da API para SSO Google

## 🚀 Após Configurar

1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o deploy completar

## ✅ Pronto!

O sistema estará rodando em: `https://seu-projeto.vercel.app`

