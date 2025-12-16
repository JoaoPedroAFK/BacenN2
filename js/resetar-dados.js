/* === SCRIPT PARA RESETAR TODOS OS DADOS === */
/* Execute este script no console do navegador para resetar todos os dados */

function resetarTodosOsDados() {
    console.log('🔄 Iniciando reset de todos os dados...');
    
    // Lista de todas as chaves do localStorage relacionadas ao sistema
    const chaves = [
        'velotax_demandas_bacen',
        'velotax_demandas_n2',
        'velotax_demandas_chatbot',
        'velotax_reclamacoes_bacen',
        'velotax_reclamacoes_n2',
        'velotax_reclamacoes_chatbot',
        // Adicionar outras chaves se necessário
    ];
    
    let removidas = 0;
    chaves.forEach(chave => {
        if (localStorage.getItem(chave)) {
            localStorage.removeItem(chave);
            console.log(`🗑️ Removido: ${chave}`);
            removidas++;
        }
    });
    
    // Se o sistema de armazenamento estiver disponível, usar ele também
    if (window.armazenamentoReclamacoes) {
        window.armazenamentoReclamacoes.resetar();
    }
    
    console.log(`✅ Reset concluído! ${removidas} chaves removidas.`);
    console.log('🔄 Recarregue a página para ver as mudanças.');
    
    return removidas;
}

// Executar automaticamente se chamado
if (typeof window !== 'undefined') {
    window.resetarTodosOsDados = resetarTodosOsDados;
    console.log('✅ Função resetarTodosOsDados() disponível. Execute: resetarTodosOsDados()');
}

