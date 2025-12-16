/* === SISTEMA SIMPLES DE ARMAZENAMENTO DE RECLAMAÇÕES === */
/* Sistema direto e confiável usando apenas localStorage */

class ArmazenamentoReclamacoes {
    constructor() {
        this.chaves = {
            bacen: 'velotax_reclamacoes_bacen',
            n2: 'velotax_reclamacoes_n2',
            chatbot: 'velotax_reclamacoes_chatbot'
        };
        console.log('✅ Sistema de armazenamento inicializado');
    }

    // === SALVAR RECLAMAÇÃO ===
    salvar(tipo, reclamacao) {
        console.log(`💾 Salvando reclamação ${tipo} - ID: ${reclamacao.id}`);
        
        // Garantir que tem ID
        if (!reclamacao.id) {
            reclamacao.id = this.gerarId();
            console.log(`🆔 ID gerado: ${reclamacao.id}`);
        }
        
        // Garantir que tem data de criação
        if (!reclamacao.dataCriacao) {
            reclamacao.dataCriacao = new Date().toISOString();
        }
        
        // Garantir tipo
        reclamacao.tipoDemanda = tipo;
        
        // Obter chave
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return false;
        }
        
        // Carregar reclamações existentes
        let reclamacoes = this.carregarTodos(tipo);
        
        // Verificar se já existe (atualizar) ou adicionar nova
        const index = reclamacoes.findIndex(r => r.id === reclamacao.id);
        if (index >= 0) {
            reclamacoes[index] = reclamacao;
            console.log(`🔄 Reclamação atualizada: ${reclamacao.id}`);
        } else {
            reclamacoes.push(reclamacao);
            console.log(`➕ Nova reclamação adicionada: ${reclamacao.id}`);
        }
        
        // Salvar no localStorage
        try {
            localStorage.setItem(chave, JSON.stringify(reclamacoes));
            console.log(`✅ Salvo no localStorage: ${reclamacoes.length} reclamações ${tipo}`);
            console.log(`📋 IDs salvos:`, reclamacoes.map(r => r.id).join(', '));
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar no localStorage:`, error);
            return false;
        }
    }

    // === CARREGAR TODAS AS RECLAMAÇÕES ===
    carregarTodos(tipo) {
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return [];
        }
        
        try {
            // Tentar carregar da chave nova primeiro
            let dados = localStorage.getItem(chave);
            let reclamacoes = [];
            
            if (dados) {
                reclamacoes = JSON.parse(dados);
                if (!Array.isArray(reclamacoes)) {
                    console.warn(`⚠️ Dados inválidos para ${tipo}, resetando...`);
                    localStorage.removeItem(chave);
                    reclamacoes = [];
                }
            }
            
            // MIGRAÇÃO: Se não encontrou na chave nova, tentar chave antiga e migrar
            if (reclamacoes.length === 0) {
                const chaveAntiga = `velotax_demandas_${tipo}`;
                const dadosAntigos = localStorage.getItem(chaveAntiga);
                
                if (dadosAntigos) {
                    console.log(`🔄 Migrando dados de ${chaveAntiga} para ${chave}...`);
                    try {
                        const dadosMigrados = JSON.parse(dadosAntigos);
                        if (Array.isArray(dadosMigrados) && dadosMigrados.length > 0) {
                            reclamacoes = dadosMigrados;
                            // Salvar na chave nova
                            localStorage.setItem(chave, JSON.stringify(reclamacoes));
                            console.log(`✅ ${reclamacoes.length} reclamações migradas`);
                            // Remover chave antiga
                            localStorage.removeItem(chaveAntiga);
                            console.log(`🗑️ Chave antiga removida: ${chaveAntiga}`);
                        }
                    } catch (error) {
                        console.error(`❌ Erro ao migrar dados:`, error);
                    }
                }
            }
            
            console.log(`📦 Carregadas ${reclamacoes.length} reclamações ${tipo}`);
            return reclamacoes;
        } catch (error) {
            console.error(`❌ Erro ao carregar ${tipo}:`, error);
            return [];
        }
    }

    // === OBTER RECLAMAÇÃO POR ID ===
    obterPorId(tipo, id) {
        const reclamacoes = this.carregarTodos(tipo);
        return reclamacoes.find(r => r.id === id) || null;
    }

    // === REMOVER RECLAMAÇÃO ===
    remover(tipo, id) {
        const chave = this.chaves[tipo];
        if (!chave) return false;
        
        let reclamacoes = this.carregarTodos(tipo);
        const antes = reclamacoes.length;
        reclamacoes = reclamacoes.filter(r => r.id !== id);
        
        if (reclamacoes.length < antes) {
            localStorage.setItem(chave, JSON.stringify(reclamacoes));
            console.log(`🗑️ Reclamação ${id} removida`);
            return true;
        }
        
        return false;
    }

    // === RESETAR TODOS OS DADOS ===
    resetar() {
        console.log('🔄 Resetando todos os dados...');
        Object.values(this.chaves).forEach(chave => {
            localStorage.removeItem(chave);
            console.log(`🗑️ Removido: ${chave}`);
        });
        console.log('✅ Todos os dados foram resetados');
    }

    // === GERAR ID ÚNICO ===
    gerarId() {
        return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // === CONTAR RECLAMAÇÕES ===
    contar(tipo) {
        return this.carregarTodos(tipo).length;
    }
}

// Criar instância global
if (!window.armazenamentoReclamacoes) {
    window.armazenamentoReclamacoes = new ArmazenamentoReclamacoes();
    console.log('✅ Sistema de armazenamento global criado');
}

