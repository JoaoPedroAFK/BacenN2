# 🚀 Guia Rápido - Script Local de Limpeza

## 📋 Resumo

Script Node.js para limpar dados do Firebase Realtime Database **localmente**, sem precisar do plano Blaze ou Firebase Functions.

## ⚡ Início Rápido

### 1. Instalar Dependências

```powershell
cd scripts
npm install
```

### 2. Configurar Credenciais (Escolha uma opção)

#### **Opção A: Google Cloud CLI (Mais Fácil)**

```powershell
# Instalar Google Cloud SDK (se não tiver)
# Download: https://cloud.google.com/sdk/docs/install

# Autenticar
gcloud auth application-default login
```

#### **Opção B: Service Account Key**

1. Acesse: https://console.firebase.google.com/project/bacen-n2/settings/serviceaccounts/adminsdk
2. Clique em **Gerar nova chave privada**
3. Salve como `scripts/service-account-key.json`
4. Edite `scripts/clear-firebase-data.js` e descomente as linhas do service account

### 3. Executar o Script

```powershell
cd scripts
npm start
```

## 📁 Estrutura de Arquivos

```
scripts/
├── clear-firebase-data.js    # Script principal
├── package.json              # Dependências
├── README.md                 # Documentação completa
└── service-account-key.json  # (opcional) Chave de serviço
```

## ⚙️ Configuração

O script lê automaticamente o arquivo `functions/user_privacy.json` e limpa os caminhos configurados em `database.clearData`:

```json
{
  "database": {
    "clearData": [
      "/fichas_bacen",
      "/fichas_n2",
      "/fichas_chatbot"
    ]
  }
}
```

## ⚠️ Importante

- **Este script REMOVE PERMANENTEMENTE os dados!**
- Faça backup antes de executar
- Os caminhos serão mantidos vazios (estrutura preservada)

## 🔍 Verificar Resultado

Após executar, verifique no Firebase Console:
https://console.firebase.google.com/project/bacen-n2/database

## 🐛 Problemas Comuns

### "Firebase Admin não inicializado"
```powershell
gcloud auth application-default login
```

### "Cannot find module 'firebase-admin'"
```powershell
cd scripts
npm install
```

### "Permission denied"
- Verifique as regras de segurança do Firebase
- Certifique-se de que a conta tem permissões de escrita

## 📚 Documentação Completa

Veja `scripts/README.md` para mais detalhes.

