# 🧪 Teste do Firebase - Verificar se está funcionando

## ✅ Checklist antes de importar

### 1. Verificar se Firebase está inicializado
Abra o console do navegador (F12) e procure por:
- `✅ Firebase Realtime Database inicializado com sucesso!`
- `✅ Usando Firebase Realtime Database para armazenamento compartilhado`

### 2. Verificar Realtime Database no Firebase Console
1. Acesse: https://console.firebase.google.com/project/bacen-n2/realtime-database
2. Verifique se o banco de dados foi criado
3. Verifique se as regras de segurança estão configuradas (aba "Regras")

### 3. Regras de Segurança (Cole no Firebase Console → Realtime Database → Regras)

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

**IMPORTANTE:** Clique em "Publicar" após colar as regras!

### 4. Teste Manual
1. Abra a página de importação
2. Tente importar uma planilha pequena (5-10 registros)
3. Verifique no console se aparece:
   - `🔥 Tentando salvar no Firebase...`
   - `✅ Ficha [tipo] salva no Firebase: [id]`
4. Verifique no Firebase Console se os dados aparecem em:
   - `fichas_bacen/`
   - `fichas_n2/`
   - `fichas_chatbot/`

## 🚨 Se algo der errado

### Erro: "Firebase não disponível"
- Verifique se o Realtime Database foi criado
- Verifique se as regras de segurança estão publicadas
- Recarregue a página (Ctrl+F5)

### Erro: "Permission denied"
- Verifique as regras de segurança no Firebase Console
- Certifique-se de que as regras permitem `.read: true` e `.write: true`

### Dados não aparecem no Firebase
- Verifique o console do navegador para erros
- Verifique se o Firebase está realmente inicializado
- Tente salvar uma reclamação manualmente primeiro

## 📊 Estrutura dos dados no Firebase

Os dados serão salvos assim:

```
fichas_bacen/
  └── [id-da-ficha]/
      ├── id: "mj..."
      ├── nomeCliente: "..."
      ├── cpf: "..."
      ├── status: "..."
      └── ... (outros campos)

fichas_n2/
  └── [id-da-ficha]/
      └── ... (mesma estrutura)

fichas_chatbot/
  └── [id-da-ficha]/
      └── ... (mesma estrutura)
```

## ✅ Pronto para importar!

Após verificar tudo acima, você pode:
1. Importar planilhas grandes
2. Os dados serão salvos automaticamente no Firebase
3. Todos os usuários verão os mesmos dados (compartilhado)

