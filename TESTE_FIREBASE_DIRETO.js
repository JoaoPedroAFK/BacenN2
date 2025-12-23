// 🔍 SCRIPT DE TESTE DIRETO NO FIREBASE
// Execute este código no console para verificar diretamente se há dados no Firebase

(async function() {
    console.log('🔍 ===== TESTE DIRETO NO FIREBASE =====');
    
    // Verificar se Firebase está disponível
    if (!window.firebaseDB || !window.firebaseDB.database) {
        console.error('❌ Firebase não está disponível!');
        return;
    }
    
    const database = window.firebaseDB.database;
    
    // Testar todos os caminhos
    const caminhos = ['fichas_bacen', 'fichas_n2', 'fichas_chatbot'];
    
    for (const caminho of caminhos) {
        console.log(`\n📥 Testando caminho: ${caminho}`);
        try {
            const snapshot = await database.ref(caminho).once('value');
            const dados = snapshot.val();
            
            console.log(`   snapshot.exists(): ${snapshot.exists()}`);
            console.log(`   dados:`, dados);
            
            if (snapshot.exists() && dados) {
                const keys = Object.keys(dados);
                console.log(`   ✅ ${keys.length} fichas encontradas`);
                console.log(`   IDs:`, keys.slice(0, 5));
                
                // Mostrar primeira ficha como exemplo
                if (keys.length > 0) {
                    const primeiraFicha = dados[keys[0]];
                    console.log(`   📋 Primeira ficha:`, {
                        id: keys[0],
                        nome: primeiraFicha.nomeCliente || primeiraFicha.nomeCompleto || 'sem nome',
                        tipo: primeiraFicha.tipoDemanda || 'sem tipo'
                    });
                }
            } else {
                console.warn(`   ⚠️ Nenhuma ficha encontrada em ${caminho}`);
            }
        } catch (error) {
            console.error(`   ❌ Erro ao acessar ${caminho}:`, error);
        }
    }
    
    console.log('\n✅ ===== FIM DO TESTE =====');
})();

