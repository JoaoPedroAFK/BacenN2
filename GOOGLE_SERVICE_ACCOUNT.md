# 🔐 Configuração Google Service Account

## 📋 Credenciais do Service Account

As credenciais do Google Service Account estão configuradas para integração com Google Sheets e outras APIs do Google.

### ⚠️ IMPORTANTE: Segurança

**NUNCA** commite este arquivo no Git! As credenciais devem ser mantidas em segredo.

### 📝 Variável de Ambiente

Para usar em um servidor Node.js ou backend, adicione ao arquivo `.env`:

```env
# ============================================
# Google Service Account - Credenciais
# ============================================
# ⚠️ IMPORTANTE: Substitua pelo JSON completo do seu Service Account
# O JSON deve ser uma string única (sem quebras de linha)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"SEU_PROJECT_ID","private_key_id":"SEU_PRIVATE_KEY_ID","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"SEU_EMAIL@PROJECT.iam.gserviceaccount.com","client_id":"SEU_CLIENT_ID","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/...","universe_domain":"googleapis.com"}
```

### 🔧 Uso no Código

Se estiver usando em um servidor Node.js:

```javascript
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

// Ou se preferir variáveis separadas:
const serviceAccount = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com"
};
```

### 📦 Para Vercel/Netlify

Se estiver fazendo deploy no Vercel ou Netlify:

1. Vá em **Settings** → **Environment Variables**
2. Adicione a variável `GOOGLE_SERVICE_ACCOUNT_JSON` com o valor JSON completo (como string)
3. Ou adicione as variáveis individuais se preferir

### ⚠️ Nota de Segurança

- **NUNCA** exponha essas credenciais no código frontend (JavaScript do navegador)
- Use apenas em servidores backend/API
- Mantenha o arquivo `.env` no `.gitignore`
- Rotacione as credenciais periodicamente

### 📚 Documentação

- [Google Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets API](https://developers.google.com/sheets/api)

