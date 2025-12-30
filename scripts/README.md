# 🔧 Script Local - Limpeza de Dados Firebase

## 📋 Descrição

Script Node.js para limpar dados do Firebase Realtime Database localmente, sem necessidade de Firebase Functions ou plano Blaze.

## 🚀 Instalação

### 1. Instalar Dependências

```bash
cd scripts
npm install
```

### 2. Configurar Credenciais do Firebase

Você tem duas opções:

#### Opção A: Application Default Credentials (Recomendado)

```bash
# Instalar Google Cloud SDK (se ainda não tiver)
# Windows: https://cloud.google.com/sdk/docs/install
# Depois execute:
gcloud auth application-default login
```

#### Opção B: Service Account Key

1. Acesse o [Firebase Console](https://console.firebase.google.com/project/bacen-n2)
2. Vá em **Configurações do Projeto** → **Contas de Serviço**
3. Clique em **Gerar nova chave privada**
4. Salve o arquivo JSON como `service-account-key.json` na pasta `scripts/`
5. Descomente e ajuste as linhas no script `clear-firebase-data.js`:

```javascript
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL
});
```

## 📝 Uso

### Executar o Script

```bash
npm start
# ou
npm run clear
# ou
node clear-firebase-data.js
```

### O que o Script Faz

1. Lê o arquivo `functions/user_privacy.json`
2. Identifica os caminhos configurados em `database.clearData`
3. Conecta ao Firebase Realtime Database
4. Remove todos os dados dos caminhos especificados
5. Preserva a estrutura dos caminhos (mantém vazios)

### Caminhos Configurados

Por padrão, o script limpa:
- `/fichas_bacen`
- `/fichas_n2`
- `/fichas_chatbot`

Para alterar, edite o arquivo `functions/user_privacy.json`.

## ⚠️ Avisos Importantes

- **Este script REMOVE PERMANENTEMENTE os dados!**
- Faça backup antes de executar
- Os caminhos serão mantidos vazios (estrutura preservada)
- Certifique-se de ter as credenciais corretas configuradas

## 🔍 Verificação

Após executar o script, verifique no Firebase Console:
1. Acesse: https://console.firebase.google.com/project/bacen-n2/database
2. Verifique que os caminhos estão vazios mas ainda existem

## 🐛 Troubleshooting

### Erro: "Firebase Admin não inicializado"

- Verifique se as credenciais estão configuradas corretamente
- Execute `gcloud auth application-default login` novamente

### Erro: "Permission denied"

- Verifique as regras de segurança do Firebase
- Certifique-se de que a conta de serviço tem permissões de escrita

### Erro: "Cannot find module 'firebase-admin'"

- Execute `npm install` na pasta `scripts/`

## 📚 Referências

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)

