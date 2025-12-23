# 🔍 Verificar Salvamento de Chatbot

## 📋 Diagnóstico

O teste mostrou:
- ✅ `fichas_bacen`: 15 fichas
- ✅ `fichas_n2`: 859 fichas
- ❌ `fichas_chatbot`: 0 fichas

**Problema**: As fichas de chatbot não estão sendo salvas no Firebase.

## 🔍 Verificar Logs de Salvamento

Execute este código no console **APÓS tentar salvar uma ficha de chatbot**:

```javascript
// Ver logs de salvamento de chatbot
const logs = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('velotax_debug_')) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            if (value.tipo === 'chatbot' || key.includes('chatbot')) {
                logs.push({ key, ...value });
            }
        } catch (e) {
            if (key.includes('chatbot')) {
                logs.push({ key, valor: localStorage.getItem(key) });
            }
        }
    }
}

logs.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
});

console.log('📊 LOGS DE SALVAMENTO CHATBOT:');
if (logs.length === 0) {
    console.warn('⚠️ Nenhum log de salvamento de chatbot encontrado!');
    console.warn('   Isso significa que o salvamento pode não estar sendo chamado.');
} else {
    console.table(logs);
    logs.forEach((log, index) => {
        console.log(`${index + 1}. [${log.timestamp}] ${log.acao || log.erro || 'sem ação'}`);
        if (log.erro) {
            console.error('   ❌ Erro:', log.erro);
            if (log.codigo) console.error('   Código:', log.codigo);
        }
        if (log.sucesso !== undefined) {
            console.log(`   ${log.sucesso ? '✅' : '❌'} Sucesso:`, log.sucesso);
        }
    });
}
```

## 🔍 Testar Salvamento Manual

Execute este código para testar salvar uma ficha de chatbot diretamente:

```javascript
// Teste de salvamento manual
(async function() {
    console.log('🧪 Testando salvamento manual de chatbot...');
    
    if (!window.armazenamentoReclamacoes) {
        console.error('❌ armazenamentoReclamacoes não disponível!');
        return;
    }
    
    const fichaTeste = {
        id: 'teste_' + Date.now(),
        tipoDemanda: 'chatbot',
        nomeCompleto: 'Teste Chatbot',
        cpf: '12345678900',
        dataCriacao: new Date().toISOString(),
        status: 'nao-iniciado'
    };
    
    console.log('📤 Tentando salvar ficha de teste:', fichaTeste);
    
    try {
        const sucesso = await window.armazenamentoReclamacoes.salvar('chatbot', fichaTeste);
        console.log('📥 Resultado:', sucesso);
        
        if (sucesso) {
            console.log('✅ Ficha salva! Verificando no Firebase...');
            // Aguardar um pouco
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verificar se foi salva
            const db = window.firebaseDB.database;
            const snapshot = await db.ref('fichas_chatbot/' + fichaTeste.id).once('value');
            if (snapshot.exists()) {
                console.log('✅ Ficha encontrada no Firebase!');
                console.log('Dados:', snapshot.val());
            } else {
                console.error('❌ Ficha NÃO encontrada no Firebase após salvar!');
            }
        } else {
            console.error('❌ Salvamento retornou false!');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        console.error('Stack:', error.stack);
    }
})();
```

## 🔍 Verificar Regras de Segurança

Verifique se as regras do Firebase permitem escrita em `fichas_chatbot`:

1. Acesse: https://console.firebase.google.com/project/bacen-n2/database
2. Vá em **Regras**
3. Verifique se há:
```json
{
  "rules": {
    "fichas_chatbot": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 📝 Próximos Passos

1. Execute o código de verificação de logs acima
2. Execute o teste de salvamento manual
3. Compartilhe os resultados
4. Verifique as regras de segurança no Firebase Console

