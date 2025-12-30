# 🔒 Guia de Configuração - Firebase User Privacy (clearData e exportData)

<!-- VERSION: v1.0.0 | DATE: 2025-02-01 | AUTHOR: VeloHub Development Team -->

## 📋 Visão Geral

Este guia explica como configurar e usar as Firebase Functions `clearData` e `exportData` do repositório oficial do Firebase para gerenciar a privacidade dos dados dos usuários no Firebase Realtime Database.

**Repositório Oficial**: [https://github.com/FirebaseExtended/user-privacy](https://github.com/FirebaseExtended/user-privacy)

---

## 🚀 Passo a Passo de Configuração

### **1. Obter o Repositório**

Clone o repositório oficial do Firebase user-privacy:

```bash
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
git clone https://github.com/FirebaseExtended/user-privacy.git temp-user-privacy
```

Ou baixe o ZIP do repositório e extraia em uma pasta temporária.

---

### **2. Copiar as Firebase Functions**

Copie os arquivos necessários do repositório clonado:

```bash
# Copiar o arquivo principal das functions
copy temp-user-privacy\functions\index.js functions\index.js

# Copiar package.json das functions (se necessário)
copy temp-user-privacy\functions\package.json functions\package.json
```

**Arquivos importantes do repositório:**
- `functions/index.js` - Contém as funções `clearData` e `exportData`
- `functions/package.json` - Dependências necessárias
- `functions/user_privacy.json` - **JÁ CRIADO** com os caminhos do seu projeto

---

### **3. Configurar o user_privacy.json**

O arquivo `functions/user_privacy.json` já foi criado com os caminhos corretos do seu projeto:

```json
{
  "database": {
    "clear": [
      "/fichas_bacen",
      "/fichas_n2",
      "/fichas_chatbot"
    ],
    "export": [
      "/fichas_bacen",
      "/fichas_n2",
      "/fichas_chatbot"
    ]
  }
}
```

**Formato para Realtime Database:**
- Os caminhos são strings simples começando com `/`
- `clear`: Caminhos que serão limpos quando `clearData` for executado
- `export`: Caminhos que serão exportados quando `exportData` for executado

**Nota:** Se você tiver dados de usuário específicos por UID (ex: `/users/UID_VARIABLE`), você precisaria usar `UID_VARIABLE` como placeholder que será substituído pelo UID real do usuário.

---

### **4. Instalar Dependências**

Navegue até a pasta `functions` e instale as dependências:

```bash
cd functions
npm install
```

**Dependências necessárias** (geralmente já estão no `package.json` do repositório):
- `firebase-admin`
- `firebase-functions`

---

### **5. Configurar Firebase CLI**

Se ainda não tiver o Firebase CLI instalado:

```bash
npm install -g firebase-tools
```

Faça login no Firebase:

```bash
firebase login
```

Inicialize o projeto Firebase (se ainda não foi feito):

```bash
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
firebase init functions
```

Durante a inicialização:
- Selecione o projeto Firebase: `bacen-n2` (ou seu projeto)
- Linguagem: JavaScript
- ESLint: Sim (recomendado)
- Instalar dependências: Sim

---

### **6. Ajustar as Functions (Opcional)**

Se necessário, edite `functions/index.js` para:
- Remover partes de Firestore/Storage se você só usa Realtime Database
- Ajustar lógica de limpeza/exportação conforme suas necessidades
- Adicionar logs personalizados

**Exemplo de ajuste** (remover Firestore e Storage, manter apenas RTDB):

```javascript
// No arquivo functions/index.js, você pode comentar ou remover:
// - clearFirestoreData()
// - clearStorageData()
// - exportFirestoreData()
// - exportStorageData()

// Manter apenas:
// - clearDatabaseData()
// - exportDatabaseData()
```

---

### **7. Implantar as Functions**

Implante as Firebase Functions no seu projeto:

```bash
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
firebase deploy --only functions
```

Ou para implantar apenas uma função específica:

```bash
firebase deploy --only functions:clearData
firebase deploy --only functions:exportData
```

---

## 📖 Como Usar

### **clearData - Limpar Dados do Usuário**

A função `clearData` é acionada automaticamente quando um usuário deleta sua conta no Firebase Auth.

**Para testar manualmente:**

1. **Via Firebase Console:**
   - Acesse: https://console.firebase.google.com/project/bacen-n2/functions
   - Vá em "Functions" → "clearData"
   - Clique em "Test" e forneça um UID de teste

2. **Via HTTP Request** (se configurado):
   ```bash
   curl -X POST https://us-central1-bacen-n2.cloudfunctions.net/clearData \
     -H "Content-Type: application/json" \
     -d '{"uid": "USER_UID_AQUI"}'
   ```

**O que acontece:**
- Todos os dados em `/fichas_bacen`, `/fichas_n2`, `/fichas_chatbot` serão **removidos**
- A estrutura dos caminhos será **preservada** (ficarão vazios)
- Você pode então reimportar dados usando a funcionalidade de importação

---

### **exportData - Exportar Dados do Usuário**

A função `exportData` é acionada via HTTP request.

**Para usar:**

1. **Via HTTP Request:**
   ```bash
   curl -X POST https://us-central1-bacen-n2.cloudfunctions.net/exportData \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer USER_ID_TOKEN" \
     -d '{"uid": "USER_UID_AQUI"}'
   ```

2. **Via Interface Web** (se implementado):
   - Adicione um botão na interface do usuário
   - Faça uma requisição POST para a função `exportData`

**O que acontece:**
- Os dados em `/fichas_bacen`, `/fichas_n2`, `/fichas_chatbot` serão exportados
- Um arquivo JSON será criado no Firebase Storage
- O usuário receberá um link para download

---

## ⚠️ Importante: Resetar Dados sem Perder Caminhos

Para resetar os dados na base **sem perder os caminhos**:

1. **Execute clearData:**
   - Isso removerá todos os dados dentro de `/fichas_bacen`, `/fichas_n2`, `/fichas_chatbot`
   - Os caminhos permanecerão vazios (estrutura preservada)

2. **Reimporte os dados:**
   - Use a funcionalidade de "Importar Dados" do sistema
   - Os dados serão salvos nos mesmos caminhos (agora vazios)

**Resultado:**
- ✅ Caminhos preservados: `/fichas_bacen/`, `/fichas_n2/`, `/fichas_chatbot/`
- ✅ Dados antigos removidos
- ✅ Novos dados importados nos mesmos caminhos

---

## 🔐 Segurança

### **Regras de Segurança do Storage (para exportData)**

Se você usar `exportData`, adicione regras de segurança no Firebase Storage:

```json
{
  "rules": {
    "exportData": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": false
      }
    }
  }
}
```

Isso garante que apenas o usuário autenticado possa acessar seus próprios dados exportados.

---

## 📝 Estrutura de Arquivos Criada

```
Bacen/
├── functions/
│   ├── index.js              # (copiar do repositório)
│   ├── package.json          # (copiar do repositório)
│   └── user_privacy.json     # ✅ JÁ CRIADO
├── firebase.json             # (criar se não existir)
└── .firebaserc              # (criar se não existir)
```

---

## 🐛 Troubleshooting

### **Erro: "Functions directory not found"**
- Certifique-se de que a pasta `functions/` existe na raiz do projeto
- Execute `firebase init functions` novamente

### **Erro: "user_privacy.json not found"**
- Verifique se o arquivo está em `functions/user_privacy.json`
- Confirme que o caminho está correto no código das functions

### **Erro: "Permission denied"**
- Verifique as regras de segurança do Firebase Realtime Database
- Confirme que as functions têm permissão para ler/escrever nos caminhos

### **Dados não estão sendo limpos**
- Verifique se os caminhos no `user_privacy.json` estão corretos
- Confirme que os caminhos começam com `/`
- Verifique os logs das functions no Firebase Console

---

## 📚 Referências

- **Repositório Oficial**: [https://github.com/FirebaseExtended/user-privacy](https://github.com/FirebaseExtended/user-privacy)
- **Documentação Firebase Functions**: [https://firebase.google.com/docs/functions](https://firebase.google.com/docs/functions)
- **Firebase Realtime Database**: [https://firebase.google.com/docs/database](https://firebase.google.com/docs/database)

---

## ✅ Checklist de Implementação

- [ ] Clonar repositório `user-privacy`
- [ ] Copiar `functions/index.js` do repositório
- [ ] Copiar `functions/package.json` do repositório
- [ ] Verificar `functions/user_privacy.json` (já criado)
- [ ] Instalar dependências: `cd functions && npm install`
- [ ] Configurar Firebase CLI: `firebase login`
- [ ] Inicializar Firebase Functions: `firebase init functions`
- [ ] Ajustar `functions/index.js` (remover Firestore/Storage se necessário)
- [ ] Implantar functions: `firebase deploy --only functions`
- [ ] Testar `clearData` no Firebase Console
- [ ] Testar `exportData` via HTTP request
- [ ] Configurar regras de segurança do Storage (se usar exportData)

---

*Documento criado para o projeto BacenN2 - VeloHub Development Team*

