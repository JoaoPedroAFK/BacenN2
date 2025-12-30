# 🚀 Instruções Rápidas - Firebase CLI

<!-- VERSION: v1.0.0 | DATE: 2025-02-01 | AUTHOR: VeloHub Development Team -->

## ✅ Firebase CLI Instalado

O Firebase CLI foi instalado com sucesso (versão 15.1.0).

---

## 🔐 Passo 1: Fazer Login no Firebase

Execute o comando abaixo no PowerShell ou Terminal:

```powershell
firebase login
```

**O que vai acontecer:**
1. Uma janela do navegador será aberta automaticamente
2. Você será solicitado a fazer login com sua conta Google
3. Autorize o acesso do Firebase CLI
4. Volte ao terminal - você verá uma mensagem de sucesso

**Se a janela não abrir automaticamente:**
- Copie o link que aparece no terminal
- Cole no navegador e faça login

---

## 📁 Passo 2: Navegar até o Projeto

```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
```

---

## ⚙️ Passo 3: Inicializar Firebase Functions

```powershell
firebase init functions
```

**Durante a inicialização, selecione:**
- ✅ **Functions**: Configure a Cloud Functions
- ✅ **JavaScript**: Linguagem (ou TypeScript se preferir)
- ✅ **ESLint**: Sim (recomendado)
- ✅ **Instalar dependências**: Sim
- **Projeto Firebase**: Selecione `bacen-n2` (ou seu projeto)

---

## 📦 Passo 4: Copiar o index.js do Repositório

Antes de implantar, você precisa copiar o arquivo `index.js` do repositório oficial:

### Opção A: Via Git Clone

```powershell
# Clonar repositório temporariamente
git clone https://github.com/FirebaseExtended/user-privacy.git temp-user-privacy

# Copiar o index.js
copy temp-user-privacy\functions\index.js functions\index.js

# Remover repositório temporário (opcional)
Remove-Item -Recurse -Force temp-user-privacy
```

### Opção B: Download Manual

1. Acesse: https://github.com/FirebaseExtended/user-privacy
2. Navegue até: `functions/index.js`
3. Clique em "Raw" para ver o código
4. Copie todo o conteúdo
5. Crie o arquivo `functions/index.js` e cole o conteúdo

---

## 📥 Passo 5: Instalar Dependências das Functions

```powershell
cd functions
npm install
cd ..
```

---

## 🚀 Passo 6: Implantar as Functions

```powershell
firebase deploy --only functions
```

**Ou para implantar apenas uma função específica:**

```powershell
firebase deploy --only functions:clearData
firebase deploy --only functions:exportData
```

---

## ✅ Verificar Deploy

Após o deploy, você pode verificar no Firebase Console:
- Acesse: https://console.firebase.google.com/project/bacen-n2/functions
- Você deve ver as funções `clearData` e `exportData` listadas

---

## 🧪 Testar as Functions

### Testar clearData:

1. No Firebase Console, vá em **Functions**
2. Clique em **clearData**
3. Clique em **Test**
4. Forneça um JSON de teste:
   ```json
   {
     "uid": "test-user-id"
   }
   ```

### Testar exportData:

Via HTTP request (substitua `USER_ID_TOKEN` e `USER_UID`):

```powershell
curl -X POST https://us-central1-bacen-n2.cloudfunctions.net/exportData `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer USER_ID_TOKEN" `
  -d '{\"uid\": \"USER_UID\"}'
```

---

## 📝 Checklist

- [ ] Firebase CLI instalado ✅
- [ ] Login no Firebase (`firebase login`)
- [ ] Navegar até o projeto
- [ ] Inicializar Firebase Functions (`firebase init functions`)
- [ ] Copiar `index.js` do repositório oficial
- [ ] Instalar dependências (`cd functions && npm install`)
- [ ] Implantar functions (`firebase deploy --only functions`)
- [ ] Verificar no Firebase Console
- [ ] Testar clearData
- [ ] Testar exportData

---

## 🐛 Problemas Comuns

### "firebase: comando não encontrado"
- **Solução**: Execute `npm install -g firebase-tools` novamente
- **Verificar**: `firebase --version` deve mostrar a versão

### "Cannot run login in non-interactive mode"
- **Solução**: Execute `firebase login` diretamente no terminal (não via script)
- O comando precisa abrir o navegador interativamente

### "Functions directory not found"
- **Solução**: Certifique-se de estar na raiz do projeto
- Verifique se a pasta `functions/` existe

### "user_privacy.json not found"
- **Solução**: O arquivo deve estar em `functions/user_privacy.json`
- ✅ Já está criado e configurado corretamente

---

## 📚 Referências

- **Guia Completo**: Ver `GUIA_USER_PRIVACY.md`
- **Repositório Oficial**: https://github.com/FirebaseExtended/user-privacy
- **Documentação Firebase**: https://firebase.google.com/docs/functions

---

*Instruções criadas para o projeto BacenN2 - VeloHub Development Team*

