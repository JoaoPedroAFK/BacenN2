/* === SCRIPT PARA LIMPAR BASE DE DADOS FIREBASE === */
/* VERSÃO: v1.0.0 | DATA: 2025-01-31 */
/* 
 * ATENÇÃO: Este script DELETA TODOS os dados do Firebase!
 * Use apenas quando quiser fazer reset completo da base de dados.
 */

console.log('🗑️ Script de limpeza do Firebase carregado!');

// Função global para limpar Firebase
window.limparFirebaseCompleto = async function() {
    const confirmacao = confirm(
        '⚠️ ATENÇÃO: Esta ação irá DELETAR TODOS os dados do Firebase!\n\n' +
        'Isso inclui:\n' +
        '- Todas as fichas BACEN\n' +
        '- Todas as fichas N2\n' +
        '- Todas as fichas Chatbot\n\n' +
        'Esta ação NÃO PODE ser desfeita!\n\n' +
        'Deseja continuar?'
    );
    
    if (!confirmacao) {
        console.log('❌ Limpeza cancelada pelo usuário');
        return;
    }
    
    console.log('🗑️ Iniciando limpeza do Firebase...');
    
    // Verificar se Firebase está disponível
    if (!window.firebaseDB || !window.firebaseDB.inicializado || window.firebaseDB.usarLocalStorage) {
        console.error('❌ Firebase não está disponível ou está usando localStorage!');
        alert('Erro: Firebase não está disponível. Verifique a conexão.');
        return;
    }
    
    try {
        const database = window.firebaseDB.database || firebase.database();
        
        // Limpar fichas_bacen
        console.log('🗑️ Limpando fichas_bacen...');
        await database.ref('fichas_bacen').remove();
        console.log('✅ fichas_bacen limpo');
        
        // Limpar fichas_n2
        console.log('🗑️ Limpando fichas_n2...');
        await database.ref('fichas_n2').remove();
        console.log('✅ fichas_n2 limpo');
        
        // Limpar fichas_chatbot
        console.log('🗑️ Limpando fichas_chatbot...');
        await database.ref('fichas_chatbot').remove();
        console.log('✅ fichas_chatbot limpo');
        
        // Limpar localStorage também (opcional)
        const limparLocalStorage = confirm('Deseja também limpar o localStorage?');
        if (limparLocalStorage) {
            localStorage.removeItem('velotax_reclamacoes_bacen');
            localStorage.removeItem('velotax_reclamacoes_n2');
            localStorage.removeItem('velotax_reclamacoes_chatbot');
            localStorage.removeItem('velotax_demandas_bacen');
            localStorage.removeItem('velotax_demandas_n2');
            localStorage.removeItem('velotax_demandas_chatbot');
            localStorage.removeItem('velotax_demandas');
            console.log('✅ localStorage limpo');
        }
        
        alert('✅ Base de dados limpa com sucesso!\n\nRecarregue a página para ver as mudanças.');
        console.log('✅ Limpeza concluída com sucesso!');
        
        // Recarregar página após 2 segundos
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro ao limpar Firebase:', error);
        alert('Erro ao limpar Firebase: ' + error.message);
    }
};

// Função para limpar apenas um tipo específico
window.limparFirebaseTipo = async function(tipo) {
    if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
        console.error('❌ Tipo inválido. Use: bacen, n2 ou chatbot');
        return;
    }
    
    const confirmacao = confirm(
        `⚠️ ATENÇÃO: Esta ação irá DELETAR TODAS as fichas ${tipo.toUpperCase()}!\n\n` +
        'Esta ação NÃO PODE ser desfeita!\n\n' +
        'Deseja continuar?'
    );
    
    if (!confirmacao) {
        console.log('❌ Limpeza cancelada pelo usuário');
        return;
    }
    
    console.log(`🗑️ Limpando fichas_${tipo}...`);
    
    if (!window.firebaseDB || !window.firebaseDB.inicializado || window.firebaseDB.usarLocalStorage) {
        console.error('❌ Firebase não está disponível!');
        alert('Erro: Firebase não está disponível.');
        return;
    }
    
    try {
        const database = window.firebaseDB.database || firebase.database();
        await database.ref(`fichas_${tipo}`).remove();
        console.log(`✅ fichas_${tipo} limpo`);
        alert(`✅ Fichas ${tipo.toUpperCase()} limpas com sucesso!`);
    } catch (error) {
        console.error(`❌ Erro ao limpar fichas_${tipo}:`, error);
        alert('Erro ao limpar: ' + error.message);
    }
};

console.log('✅ Funções de limpeza disponíveis:');
console.log('   - window.limparFirebaseCompleto() // Limpa tudo');
console.log('   - window.limparFirebaseTipo("bacen") // Limpa apenas BACEN');
console.log('   - window.limparFirebaseTipo("n2") // Limpa apenas N2');
console.log('   - window.limparFirebaseTipo("chatbot") // Limpa apenas Chatbot');

