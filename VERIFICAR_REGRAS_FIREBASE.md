# 🔍 Verificação de Regras do Firebase

## 📋 Regras Necessárias

As regras do Firebase Realtime Database devem permitir leitura e escrita nos caminhos:

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

## 🔍 Como Verificar

1. Acesse: https://console.firebase.google.com/project/bacen-n2/database/bacen-n2-default-rtdb/rules
2. Verifique se as regras acima estão configuradas
3. Se não estiverem, atualize e publique

## 🧪 Teste de Permissões

Execute este código no console do navegador após carregar a página:

```javascript
// Testar escrita
async function testarEscritaFirebase() {
    const testData = {
        id: 'teste_permissao_' + Date.now(),
        nome: 'Teste de Permissão',
        timestamp: new Date().toISOString()
    };
    
    try {
        if (window.firebaseDB && window.firebaseDB.database) {
            const ref = window.firebaseDB.database.ref('fichas_chatbot/teste_permissao');
            await ref.set(testData);
            console.log('✅ Escrita permitida!');
            
            // Verificar se foi salvo
            const snapshot = await ref.once('value');
            if (snapshot.exists()) {
                console.log('✅ Dados salvos corretamente:', snapshot.val());
                // Limpar teste
                await ref.remove();
                console.log('✅ Dados de teste removidos');
            } else {
                console.error('❌ Dados não foram salvos');
            }
        } else {
            console.error('❌ Firebase não está inicializado');
        }
    } catch (error) {
        console.error('❌ Erro ao testar escrita:', error);
        if (error.code === 'PERMISSION_DENIED') {
            console.error('🚨 PERMISSÃO NEGADA! Verifique as regras do Firebase!');
        }
    }
}

testarEscritaFirebase();
```

## 📊 Verificar Logs Persistentes

Após salvar uma nova ficha, execute no console:

```javascript
// Ver todos os logs de salvamento
const logs = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('velotax_salvamento_') || key.startsWith('velotax_debug_salvamento_'))) {
        try {
            const log = JSON.parse(localStorage.getItem(key));
            logs.push({ key, ...log });
        } catch (e) {}
    }
}
console.table(logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)));
```

