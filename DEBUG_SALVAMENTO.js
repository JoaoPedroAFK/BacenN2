// 🔍 SCRIPT DE DEBUG COMPLETO - Salvar como snippet no Chrome DevTools
// Execute este código no console após tentar salvar uma reclamação

(function() {
    console.log('🔍 ===== DEBUG DE SALVAMENTO =====');
    
    // 1. Ver logs persistentes
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
    
    console.log('\n📊 LOGS DE DEBUG (localStorage):');
    if (logs.length === 0) {
        console.warn('⚠️ Nenhum log de debug encontrado. O salvamento pode não ter sido tentado.');
    } else {
        console.table(logs);
        
        // Mostrar últimos 10
        console.log('\n📋 ÚLTIMOS 10 LOGS:');
        logs.slice(0, 10).forEach((log, index) => {
            console.log(`${index + 1}. [${log.timestamp || 'sem timestamp'}] ${log.acao || log.erro || 'sem ação'}`);
            if (log.erro) {
                console.error('   ❌ Erro:', log.erro);
                if (log.stack) console.error('   Stack:', log.stack);
            }
            if (log.sucesso !== undefined) {
                console.log(`   ${log.sucesso ? '✅' : '❌'} Sucesso:`, log.sucesso);
            }
            if (log.tipo && log.id) {
                console.log(`   📝 Tipo: ${log.tipo}, ID: ${log.id}`);
            }
        });
    }
    
    // 2. Verificar estado do Firebase
    console.log('\n🔥 ESTADO DO FIREBASE:');
    console.log('   window.firebaseDB:', window.firebaseDB ? '✅ existe' : '❌ não existe');
    if (window.firebaseDB) {
        console.log('   window.firebaseDB.inicializado:', window.firebaseDB.inicializado);
        console.log('   window.firebaseDB.usarLocalStorage:', window.firebaseDB.usarLocalStorage);
        console.log('   typeof window.firebaseDB.salvar:', typeof window.firebaseDB.salvar);
    }
    
    console.log('   window.armazenamentoReclamacoes:', window.armazenamentoReclamacoes ? '✅ existe' : '❌ não existe');
    if (window.armazenamentoReclamacoes) {
        console.log('   window.armazenamentoReclamacoes.usarFirebase:', window.armazenamentoReclamacoes.usarFirebase);
        console.log('   window.armazenamentoReclamacoes.firebaseDB:', window.armazenamentoReclamacoes.firebaseDB ? '✅ existe' : '❌ não existe');
    }
    
    // 3. Verificar se há dados no Firebase (para chatbot)
    if (window.firebaseDB && window.firebaseDB.database && window.firebaseDB.inicializado) {
        console.log('\n📥 VERIFICANDO DADOS NO FIREBASE (fichas_chatbot):');
        try {
            window.firebaseDB.database.ref('fichas_chatbot').once('value')
                .then(snapshot => {
                    const dados = snapshot.val();
                    console.log('   Dados brutos:', dados);
                    if (dados) {
                        const ids = Object.keys(dados);
                        console.log(`   ✅ ${ids.length} fichas encontradas no Firebase`);
                        console.log('   IDs:', ids);
                        if (ids.length > 0) {
                            console.log('   Última ficha:', dados[ids[ids.length - 1]]);
                        }
                    } else {
                        console.warn('   ⚠️ Nenhuma ficha encontrada no Firebase');
                    }
                })
                .catch(error => {
                    console.error('   ❌ Erro ao verificar Firebase:', error);
                });
        } catch (error) {
            console.error('   ❌ Erro ao acessar Firebase:', error);
        }
    } else {
        console.warn('   ⚠️ Firebase não está disponível para verificação');
    }
    
    // 4. Verificar localStorage (fallback)
    console.log('\n💾 VERIFICANDO LOCALSTORAGE (fallback):');
    const localStorageKeys = ['velotax_reclamacoes_chatbot', 'velotax_demandas_chatbot'];
    localStorageKeys.forEach(key => {
        const dados = localStorage.getItem(key);
        if (dados) {
            try {
                const parsed = JSON.parse(dados);
                console.log(`   ✅ ${key}: ${Array.isArray(parsed) ? parsed.length : 'N/A'} itens`);
            } catch (e) {
                console.log(`   ⚠️ ${key}: dados inválidos`);
            }
        } else {
            console.log(`   ❌ ${key}: não encontrado`);
        }
    });
    
    console.log('\n✅ ===== FIM DO DEBUG =====');
})();

