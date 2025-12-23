// 🔍 SCRIPT COMPLETO DE DEBUG DE SALVAMENTO
// Execute este código no console para verificar TODO o processo de salvamento

(function() {
    console.log('🔍 ===== DEBUG COMPLETO DE SALVAMENTO =====');
    
    // 1. Verificar logs de salvamento
    console.log('\n📋 1. LOGS DE SALVAMENTO:');
    const logs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('velotax_salvamento_') || key.startsWith('velotax_debug_salvamento_'))) {
            try {
                const log = JSON.parse(localStorage.getItem(key));
                logs.push({ key, ...log });
            } catch (e) {
                console.error('Erro ao parsear log:', key, e);
            }
        }
    }
    if (logs.length > 0) {
        const logsOrdenados = logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        console.table(logsOrdenados);
        console.log('📊 Total de logs:', logs.length);
    } else {
        console.warn('⚠️ Nenhum log de salvamento encontrado');
    }
    
    // 2. Verificar fichas no Firebase
    console.log('\n🔥 2. VERIFICAR FICHAS NO FIREBASE:');
    if (window.armazenamentoReclamacoes && window.armazenamentoReclamacoes.firebaseDB && window.armazenamentoReclamacoes.firebaseDB.inicializado) {
        (async () => {
            try {
                const fichas = await window.armazenamentoReclamacoes.carregarTodos('chatbot');
                console.log('✅ Fichas carregadas do Firebase:', fichas.length);
                if (fichas.length > 0) {
                    console.table(fichas.map(f => ({
                        id: f.id,
                        nome: f.nomeCompleto || f.nomeCliente || 'Sem nome',
                        status: f.status,
                        dataCriacao: f.dataCriacao
                    })));
                } else {
                    console.warn('⚠️ Nenhuma ficha encontrada no Firebase');
                }
            } catch (error) {
                console.error('❌ Erro ao carregar fichas:', error);
            }
        })();
    } else {
        console.warn('⚠️ Firebase não está inicializado');
        console.log('   window.armazenamentoReclamacoes:', window.armazenamentoReclamacoes ? 'existe' : 'não existe');
        if (window.armazenamentoReclamacoes) {
            console.log('   firebaseDB:', window.armazenamentoReclamacoes.firebaseDB ? 'existe' : 'não existe');
            if (window.armazenamentoReclamacoes.firebaseDB) {
                console.log('   inicializado:', window.armazenamentoReclamacoes.firebaseDB.inicializado);
            }
        }
    }
    
    // 3. Verificar estado do Firebase
    console.log('\n🔧 3. ESTADO DO FIREBASE:');
    if (window.firebaseDB) {
        console.log('✅ window.firebaseDB existe');
        console.log('   inicializado:', window.firebaseDB.inicializado);
        console.log('   usarLocalStorage:', window.firebaseDB.usarLocalStorage);
        console.log('   database:', window.firebaseDB.database ? 'existe' : 'não existe');
    } else {
        console.warn('⚠️ window.firebaseDB não existe');
    }
    
    // 4. Verificar última ficha salva (se houver)
    console.log('\n📝 4. ÚLTIMA FICHA SALVA:');
    const ultimoLog = logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))[0];
    if (ultimoLog && ultimoLog.id) {
        console.log('   ID da última ficha:', ultimoLog.id);
        console.log('   Timestamp:', ultimoLog.timestamp);
        console.log('   Sucesso:', ultimoLog.sucesso);
        
        // Verificar se existe no Firebase
        if (window.armazenamentoReclamacoes && window.armazenamentoReclamacoes.firebaseDB && window.armazenamentoReclamacoes.firebaseDB.inicializado) {
            (async () => {
                try {
                    const existe = await window.armazenamentoReclamacoes.firebaseDB.existe('chatbot', ultimoLog.id);
                    console.log('   Existe no Firebase?', existe ? '✅ Sim' : '❌ Não');
                } catch (error) {
                    console.error('   Erro ao verificar:', error);
                }
            })();
        }
    } else {
        console.warn('⚠️ Nenhuma ficha salva encontrada nos logs');
    }
    
    // 5. Teste de salvamento direto
    console.log('\n🧪 5. TESTE DE SALVAMENTO DIRETO:');
    console.log('   Para testar, execute:');
    console.log('   window.armazenamentoReclamacoes.salvar("chatbot", { id: "teste_' + Date.now() + '", nomeCompleto: "Teste", status: "nao-iniciado", dataCriacao: new Date().toISOString() })');
    
    console.log('\n✅ ===== FIM DO DEBUG =====');
})();

