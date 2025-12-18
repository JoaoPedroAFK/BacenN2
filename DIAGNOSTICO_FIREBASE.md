# 🔍 Diagnóstico do Firebase

## Problema: Dados sumindo após apagar cookies

Isso indica que os dados estão sendo salvos apenas no **localStorage** e não no **Firebase**.

## ✅ Passos para Diagnosticar

### 1. Abra o Console do Navegador (F12)

### 2. Procure por estas mensagens:

#### ✅ Firebase Inicializado:
```
✅ Firebase Realtime Database inicializado com sucesso!
✅ Firebase Realtime Database ATIVADO para armazenamento compartilhado!
```

#### ❌ Firebase NÃO Inicializado:
```
⚠️ Firebase não disponível. Usando localStorage (dados locais apenas).
❌ Firebase não foi inicializado após 5 segundos!
```

### 3. Verifique se o Realtime Database foi criado:

1. Acesse: https://console.firebase.google.com/project/bacen-n2/realtime-database
2. Você deve ver uma tela com a estrutura de dados
3. Se aparecer "Criar banco de dados", **CRIE AGORA!**

### 4. Verifique as Regras de Segurança:

1. No Firebase Console → **Realtime Database** → aba **"Regras"**
2. Deve ter estas regras:

```json
{
  "rules": {
    "fichas_bacen": {
      ".read": true,
      ".write": true
    },
    "fichas_n2": {
      ".read": true,
      ".write": true
    },
    "fichas_chatbot": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. **Clique em "Publicar"** se ainda não publicou!

### 5. Teste de Salvamento:

1. Abra o console (F12)
2. Tente salvar uma reclamação manualmente
3. Procure por:

#### ✅ Salvando no Firebase:
```
🔥 Tentando salvar no Firebase (tipo: bacen, ID: ...)
✅ Ficha bacen salva no Firebase: ...
```

#### ❌ Salvando no localStorage:
```
⚠️ Firebase não disponível para salvar. Motivos: ...
➕ Nova reclamação adicionada no localStorage: ...
```

### 6. Verifique no Firebase Console:

1. Acesse: https://console.firebase.google.com/project/bacen-n2/realtime-database
2. Você deve ver:
   - `fichas_bacen/`
   - `fichas_n2/`
   - `fichas_chatbot/`
3. Se estiver vazio, os dados **NÃO estão sendo salvos no Firebase**

## 🚨 Soluções

### Se Firebase não está inicializando:

1. **Verifique se o Realtime Database foi criado**
2. **Verifique as regras de segurança** (devem estar publicadas)
3. **Recarregue a página** (Ctrl+F5)
4. **Verifique o console** para erros

### Se Firebase está inicializando mas não salva:

1. **Verifique as regras de segurança** - devem permitir `.write: true`
2. **Verifique o console** para erros de permissão
3. **Teste salvando uma reclamação manualmente** e veja os logs

### Se ainda não funcionar:

Cole no console do navegador (F12):

```javascript
// Verificar estado do Firebase
console.log('Firebase DB:', window.firebaseDB);
console.log('Inicializado:', window.firebaseDB?.inicializado);
console.log('Usar LocalStorage:', window.firebaseDB?.usarLocalStorage);
console.log('Config:', window.FIREBASE_CONFIG);

// Tentar inicializar manualmente
if (window.firebaseDB && !window.firebaseDB.inicializado) {
    window.firebaseDB.inicializar().then(() => {
        console.log('✅ Firebase inicializado manualmente!');
    });
}
```

## 📋 Checklist Final

- [ ] Realtime Database criado no Firebase Console
- [ ] Regras de segurança configuradas e publicadas
- [ ] Console mostra "✅ Firebase Realtime Database inicializado"
- [ ] Console mostra "✅ Firebase Realtime Database ATIVADO"
- [ ] Ao salvar, aparece "🔥 Tentando salvar no Firebase"
- [ ] Dados aparecem no Firebase Console
- [ ] Após apagar cookies, dados ainda aparecem

