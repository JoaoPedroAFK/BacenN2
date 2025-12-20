# 🔍 Como Ver Logs de Debug de Salvamento

## 📋 Instruções

Após tentar salvar uma reclamação, execute este código no console do navegador (F12):

```javascript
// Ver todos os logs de debug de salvamento
const logs = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('velotax_debug_')) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            logs.push({ key, ...value });
        } catch (e) {
            logs.push({ key, valor: localStorage.getItem(key) });
        }
    }
}

// Ordenar por timestamp
logs.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
});

console.log('📊 LOGS DE DEBUG DE SALVAMENTO:');
console.table(logs);

// Mostrar apenas os mais recentes
console.log('\n📋 ÚLTIMOS 10 LOGS:');
logs.slice(0, 10).forEach((log, index) => {
    console.log(`${index + 1}. [${log.timestamp || 'sem timestamp'}] ${log.acao || log.erro || 'sem ação'}`);
    if (log.erro) {
        console.error('   Erro:', log.erro);
    }
    if (log.sucesso !== undefined) {
        console.log('   Sucesso:', log.sucesso);
    }
});
```

## 🧹 Limpar Logs

Para limpar os logs de debug:

```javascript
// Limpar todos os logs de debug
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('velotax_debug_')) {
        keysToRemove.push(key);
    }
}
keysToRemove.forEach(key => localStorage.removeItem(key));
console.log(`✅ ${keysToRemove.length} logs removidos`);
```

## 📝 O que os logs mostram

Os logs mostram:
- **iniciando_salvamento**: Quando o salvamento começa
- **chamando_firebase_salvar**: Quando chama o método do Firebase
- **resultado**: Resultado do salvamento (true/false)
- **erro**: Se houver algum erro

