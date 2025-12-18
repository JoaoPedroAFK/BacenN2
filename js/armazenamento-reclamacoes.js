/* === SISTEMA DE ARMAZENAMENTO DE RECLAMAÇÕES === */
/* Usa Supabase quando disponível, fallback para localStorage */

class ArmazenamentoReclamacoes {
    constructor() {
        this.chaves = {
            bacen: 'velotax_reclamacoes_bacen',
            n2: 'velotax_reclamacoes_n2',
            chatbot: 'velotax_reclamacoes_chatbot'
        };
        this.usarSupabase = false;
        this.supabase = null;
        this.inicializarSupabase();
        console.log('✅ Sistema de armazenamento inicializado');
    }
    
    inicializarSupabase() {
        // Aguardar um pouco para garantir que supabaseDB foi inicializado
        setTimeout(() => {
            this.verificarEAtivarSupabase();
        }, 500); // Aumentar tempo de espera para garantir inicialização
    }
    
    verificarEAtivarSupabase() {
        // Verificar se Supabase está disponível
        if (window.supabaseDB && window.supabaseDB.supabase && !window.supabaseDB.usarLocalStorage) {
            this.usarSupabase = true;
            this.supabase = window.supabaseDB.supabase;
            console.log('✅ Usando Supabase para armazenamento compartilhado');
            console.log('🔍 Supabase client:', this.supabase ? 'disponível' : 'indisponível');
            return true;
        } else {
            console.warn('⚠️ Supabase não disponível. Usando localStorage (dados locais apenas).');
            console.warn('🔍 window.supabaseDB:', window.supabaseDB ? 'existe' : 'não existe');
            if (window.supabaseDB) {
                console.warn('🔍 window.supabaseDB.supabase:', window.supabaseDB.supabase ? 'existe' : 'não existe');
                console.warn('🔍 window.supabaseDB.usarLocalStorage:', window.supabaseDB.usarLocalStorage);
            }
            if (window.SUPABASE_CONFIG) {
                console.warn('🔍 window.SUPABASE_CONFIG existe:', window.SUPABASE_CONFIG);
            } else {
                console.warn('🔍 window.SUPABASE_CONFIG não existe');
            }
            if (window.supabase) {
                console.warn('🔍 window.supabase existe:', typeof window.supabase);
            } else {
                console.warn('🔍 window.supabase não existe');
            }
            return false;
        }
    }

    // === SALVAR RECLAMAÇÃO ===
    async salvar(tipo, reclamacao) {
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
        
        // Remover campos que podem não existir na tabela (evitar erro PGRST204)
        // Se dataAtualizacao não existir, remover do objeto antes de salvar
        const camposParaRemover = ['_debugLogado']; // Campos que não devem ser salvos
        camposParaRemover.forEach(campo => {
            if (reclamacao.hasOwnProperty(campo)) {
                delete reclamacao[campo];
            }
        });
        
        // Obter chave
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return false;
        }
        
        // DEBUG: Verificar estado do Supabase (apenas para primeira ficha para não poluir logs)
        if (!reclamacao._debugLogado) {
            reclamacao._debugLogado = true;
            console.log(`🔍 DEBUG Supabase - usarSupabase: ${this.usarSupabase}`);
            console.log(`🔍 DEBUG Supabase - window.supabaseDB:`, window.supabaseDB ? 'existe' : 'não existe');
            if (window.supabaseDB) {
                console.log(`🔍 DEBUG Supabase - window.supabaseDB.supabase:`, window.supabaseDB.supabase ? 'existe' : 'não existe');
                console.log(`🔍 DEBUG Supabase - window.supabaseDB.usarLocalStorage:`, window.supabaseDB.usarLocalStorage);
                console.log(`🔍 DEBUG Supabase - window.SUPABASE_CONFIG:`, window.SUPABASE_CONFIG ? 'existe' : 'não existe');
                console.log(`🔍 DEBUG Supabase - window.supabase:`, typeof window.supabase);
            }
        }
        
        // PRIORIDADE 1: Tentar salvar no Supabase (armazenamento compartilhado)
        // Re-verificar Supabase antes de salvar (pode ter sido inicializado depois)
        if (!this.usarSupabase) {
            const ativado = this.verificarEAtivarSupabase();
            if (ativado) {
                console.log('✅ Supabase detectado durante salvamento, ativando...');
            }
        }
        
        // Forçar verificação novamente antes de usar
        if (window.supabaseDB && window.supabaseDB.supabase && !window.supabaseDB.usarLocalStorage) {
            this.usarSupabase = true;
            this.supabase = window.supabaseDB.supabase;
        }
        
        // Log detalhado para debug
        if (!reclamacao._debugLogado) {
            console.log(`🔍 DEBUG SALVAMENTO - usarSupabase: ${this.usarSupabase}`);
            console.log(`🔍 DEBUG SALVAMENTO - window.supabaseDB:`, window.supabaseDB ? 'existe' : 'não existe');
            if (window.supabaseDB) {
                console.log(`🔍 DEBUG SALVAMENTO - window.supabaseDB.supabase:`, window.supabaseDB.supabase ? 'existe' : 'não existe');
                console.log(`🔍 DEBUG SALVAMENTO - window.supabaseDB.usarLocalStorage:`, window.supabaseDB.usarLocalStorage);
            }
        }
        
        if (this.usarSupabase && window.supabaseDB && window.supabaseDB.supabase) {
            try {
                const nomeTabela = `fichas_${tipo}`;
                if (!reclamacao._debugLogado) {
                    console.log(`☁️ Tentando salvar no Supabase (tabela: ${nomeTabela}, ID: ${reclamacao.id})...`);
                    console.log(`   Dados a salvar:`, JSON.stringify(reclamacao).substring(0, 200));
                }
                
                // Verificar se já existe (com tratamento de erro melhor)
                let existente = null;
                try {
                    const { data, error: erroVerificacao } = await window.supabaseDB.supabase
                        .from(nomeTabela)
                        .select('id')
                        .eq('id', reclamacao.id)
                        .maybeSingle();
                    
                    if (erroVerificacao) {
                        if (erroVerificacao.code === 'PGRST116') {
                            // Tabela não existe ou sem permissão - continuar tentando inserir
                            if (!reclamacao._debugLogado) {
                                console.warn(`   ⚠️ Tabela pode não existir ou sem permissão, tentando inserir mesmo assim...`);
                            }
                        } else {
                            console.error(`❌ ERRO ao verificar existência no Supabase:`, erroVerificacao);
                            throw erroVerificacao;
                        }
                    } else {
                        existente = data;
                    }
                } catch (err) {
                    // Ignorar erro de verificação e tentar inserir
                    if (!reclamacao._debugLogado) {
                        console.warn(`   ⚠️ Erro ao verificar existência, tentando inserir:`, err.message);
                    }
                }
                
                let resultado;
                if (existente && existente.id) {
                    // Atualizar
                    if (!reclamacao._debugLogado) {
                        console.log(`   🔄 Atualizando registro existente...`);
                    }
                    
                    // Criar cópia do objeto sem campos problemáticos
                    const dadosParaAtualizar = { ...reclamacao };
                    delete dadosParaAtualizar._debugLogado;
                    // Remover dataAtualizacao se não existir na tabela (evita erro PGRST204)
                    if (dadosParaAtualizar.dataAtualizacao === undefined || dadosParaAtualizar.dataAtualizacao === null) {
                        delete dadosParaAtualizar.dataAtualizacao;
                    }
                    
                    let data, error;
                    
                    // Tentar atualizar primeiro com todos os campos
                    ({ data, error } = await window.supabaseDB.supabase
                        .from(nomeTabela)
                        .update(dadosParaAtualizar)
                        .eq('id', reclamacao.id)
                        .select()
                        .single());
                    
                    // Se falhar por causa de coluna não encontrada, tentar sem dataAtualizacao
                    if (error && error.code === 'PGRST204' && error.message.includes('dataAtualizacao')) {
                        console.warn(`   ⚠️ Coluna dataAtualizacao não existe, tentando sem ela...`);
                        delete dadosParaAtualizar.dataAtualizacao;
                        
                        ({ data, error } = await window.supabaseDB.supabase
                            .from(nomeTabela)
                            .update(dadosParaAtualizar)
                            .eq('id', reclamacao.id)
                            .select()
                            .single());
                    }
                    
                    if (error) {
                        console.error(`❌ ERRO ao atualizar no Supabase:`, error);
                        console.error(`   Código: ${error.code}`);
                        console.error(`   Mensagem: ${error.message}`);
                        console.error(`   Detalhes:`, JSON.stringify(error));
                        console.error(`   Tabela: ${nomeTabela}`);
                        console.error(`   ID: ${reclamacao.id}`);
                        if (error.code === 'PGRST116' || error.message.includes('permission') || error.message.includes('policy') || error.message.includes('RLS')) {
                            console.error(`🚨 ERRO DE PERMISSÃO/RLS! Configure as políticas no Supabase!`);
                            console.error(`   Execute o script: SUPABASE_FIX_RLS_DUPLICADAS.sql`);
                        }
                        if (error.code === 'PGRST204') {
                            console.error(`🚨 COLUNA NÃO EXISTE! Execute o script: SUPABASE_ADICIONAR_COLUNAS_FALTANTES.sql`);
                        }
                        throw error;
                    }
                    resultado = data;
                    if (!reclamacao._debugLogado) {
                        console.log(`✅ Reclamação atualizada no Supabase: ${reclamacao.id}`);
                    }
                } else {
                    // Inserir
                    if (!reclamacao._debugLogado) {
                        console.log(`   ➕ Inserindo novo registro...`);
                    }
                    
                    // Criar cópia do objeto sem campos problemáticos
                    const dadosParaInserir = { ...reclamacao };
                    delete dadosParaInserir._debugLogado;
                    
                    let data, error;
                    
                    // Tentar inserir primeiro
                    ({ data, error } = await window.supabaseDB.supabase
                        .from(nomeTabela)
                        .insert(dadosParaInserir)
                        .select()
                        .single());
                    
                    // Se falhar por causa de coluna não encontrada (dataAtualizacao), tentar sem ela
                    if (error && error.code === 'PGRST204' && error.message.includes('dataAtualizacao')) {
                        console.warn(`   ⚠️ Coluna dataAtualizacao não existe, removendo do objeto e tentando novamente...`);
                        delete dadosParaInserir.dataAtualizacao;
                        
                        ({ data, error } = await window.supabaseDB.supabase
                            .from(nomeTabela)
                            .insert(dadosParaInserir)
                            .select()
                            .single());
                    }
                    
                    if (error) {
                        console.error(`❌ ERRO ao inserir no Supabase:`, error);
                        console.error(`   Código: ${error.code}`);
                        console.error(`   Mensagem: ${error.message}`);
                        console.error(`   Detalhes:`, JSON.stringify(error));
                        console.error(`   Tabela: ${nomeTabela}`);
                        console.error(`   ID: ${reclamacao.id}`);
                        console.error(`   Dados tentados:`, JSON.stringify(dadosParaInserir).substring(0, 300));
                        if (error.code === 'PGRST116' || error.message.includes('permission') || error.message.includes('policy') || error.message.includes('RLS')) {
                            console.error(`🚨 ERRO DE PERMISSÃO/RLS! Configure as políticas no Supabase!`);
                            console.error(`   Execute o script: SUPABASE_FIX_RLS_DUPLICADAS.sql`);
                        }
                        if (error.code === 'PGRST204') {
                            console.error(`🚨 COLUNA NÃO EXISTE! Execute o script: SUPABASE_ADICIONAR_COLUNAS_FALTANTES.sql`);
                        }
                        throw error;
                    }
                    resultado = data;
                    if (!reclamacao._debugLogado) {
                        console.log(`✅ Reclamação salva no Supabase: ${reclamacao.id}`);
                    }
                }
                
                // Verificar se realmente foi salvo
                if (!resultado || !resultado.id) {
                    console.error(`❌ ERRO: Supabase retornou resultado vazio!`);
                    console.error(`   Tabela: ${nomeTabela}`);
                    console.error(`   ID esperado: ${reclamacao.id}`);
                    throw new Error('Resultado vazio do Supabase');
                }
                
                // Verificação adicional: buscar o registro salvo
                if (!reclamacao._debugLogado) {
                    const { data: verificado, error: erroVerificacao } = await window.supabaseDB.supabase
                        .from(nomeTabela)
                        .select('id')
                        .eq('id', reclamacao.id)
                        .single();
                    
                    if (erroVerificacao || !verificado) {
                        console.warn(`⚠️ AVISO: Registro salvo mas não encontrado na verificação!`);
                        console.warn(`   Erro:`, erroVerificacao);
                    } else {
                        console.log(`✅ Verificação: Registro confirmado no Supabase`);
                    }
                }
                
                // NÃO salvar no localStorage se Supabase funcionou (evita quota excedida)
                // localStorage só como fallback quando Supabase não está disponível
                if (!reclamacao._debugLogado) {
                    console.log(`✅ Reclamação ${reclamacao.id} salva no Supabase`);
                }
                return true;
            } catch (error) {
                console.error(`❌ Erro ao salvar no Supabase:`, error);
                console.error(`   Tipo: ${tipo}, ID: ${reclamacao.id}`);
                console.error(`   Stack: ${error.stack}`);
                
                // Se Supabase está ativo mas falhou, NÃO usar localStorage (evita quota)
                if (this.usarSupabase) {
                    console.error(`⚠️ Supabase está ativo mas falhou. NÃO usando localStorage para evitar quota excedida.`);
                    console.error(`   Execute o script SQL para corrigir a estrutura das tabelas!`);
                    throw error; // Propaga o erro para que o usuário veja
                } else {
                    console.warn(`⚠️ Supabase não disponível. Fallback para localStorage...`);
                    // Continuar para salvar no localStorage apenas se Supabase não estiver disponível
                }
            }
        } else {
            if (!reclamacao._debugLogado) {
                console.warn(`⚠️ Supabase não disponível para salvar. Condições:`);
                console.warn(`   usarSupabase: ${this.usarSupabase}`);
                console.warn(`   window.supabaseDB: ${window.supabaseDB ? 'existe' : 'não existe'}`);
                if (window.supabaseDB) {
                    console.warn(`   window.supabaseDB.supabase: ${window.supabaseDB.supabase ? 'existe' : 'não existe'}`);
                    console.warn(`   window.supabaseDB.usarLocalStorage: ${window.supabaseDB.usarLocalStorage}`);
                }
            }
        }
        
        // FALLBACK: Salvar no localStorage
        return this.salvarLocalStorage(tipo, reclamacao, chave);
    }
    
    // Método auxiliar para salvar no localStorage (apenas quando Supabase não está disponível)
    salvarLocalStorage(tipo, reclamacao, chave) {
        try {
            // Verificar tamanho antes de salvar (evitar quota excedida)
            const dadosAtuais = localStorage.getItem(chave);
            let reclamacoes = [];
            
            if (dadosAtuais) {
                try {
                    reclamacoes = JSON.parse(dadosAtuais);
                    if (!Array.isArray(reclamacoes)) {
                        console.warn(`⚠️ Dados inválidos para ${tipo}, resetando...`);
                        reclamacoes = [];
                    }
                } catch (e) {
                    console.warn(`⚠️ Erro ao parsear dados existentes, resetando...`);
                    reclamacoes = [];
                }
            }
            
            // Verificar se já existe (atualizar) ou adicionar nova
            const index = reclamacoes.findIndex(r => r.id === reclamacao.id);
            if (index >= 0) {
                reclamacoes[index] = reclamacao;
                console.log(`🔄 Reclamação atualizada no localStorage: ${reclamacao.id}`);
            } else {
                reclamacoes.push(reclamacao);
                console.log(`➕ Nova reclamação adicionada no localStorage: ${reclamacao.id}`);
            }
            
            // Tentar salvar no localStorage
            const dadosParaSalvar = JSON.stringify(reclamacoes);
            const tamanhoMB = (new Blob([dadosParaSalvar]).size / 1024 / 1024).toFixed(2);
            
            // Verificar se excede limite (localStorage geralmente tem ~5-10MB)
            if (tamanhoMB > 4) {
                console.warn(`⚠️ Dados muito grandes (${tamanhoMB}MB). Limpando localStorage antigo...`);
                // Limpar dados antigos, manter apenas os últimos 100 registros
                reclamacoes = reclamacoes.slice(-100);
                console.warn(`⚠️ Mantendo apenas os últimos 100 registros no localStorage`);
            }
            
            try {
                localStorage.setItem(chave, JSON.stringify(reclamacoes));
                console.log(`✅ Salvo no localStorage: ${reclamacoes.length} reclamações ${tipo} (${tamanhoMB}MB)`);
                return true;
            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError') {
                    console.error(`❌ QUOTA EXCEDIDA no localStorage!`);
                    console.error(`   Tamanho tentado: ${tamanhoMB}MB`);
                    console.error(`   ⚠️ Limpando localStorage e mantendo apenas últimos 50 registros...`);
                    
                    // Limpar e manter apenas últimos 50
                    reclamacoes = reclamacoes.slice(-50);
                    try {
                        localStorage.setItem(chave, JSON.stringify(reclamacoes));
                        console.warn(`⚠️ localStorage limpo. Mantidos apenas últimos 50 registros.`);
                        return true;
                    } catch (e) {
                        console.error(`❌ ERRO: Não foi possível salvar mesmo após limpar!`);
                        console.error(`   Use o Supabase para salvar todos os dados!`);
                        return false;
                    }
                }
                throw quotaError;
            }
        } catch (error) {
            console.error(`❌ Erro ao salvar no localStorage:`, error);
            if (error.name === 'QuotaExceededError') {
                console.error(`🚨 QUOTA EXCEDIDA! Execute o script SQL para usar Supabase!`);
            }
            return false;
        }
    }

    // === CARREGAR TODAS AS RECLAMAÇÕES ===
    async carregarTodos(tipo) {
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return [];
        }
        
        // PRIORIDADE 1: Tentar carregar do Supabase (armazenamento compartilhado)
        // Re-verificar Supabase antes de carregar (pode ter sido inicializado depois)
        if (!this.usarSupabase) {
            const ativado = this.verificarEAtivarSupabase();
            if (ativado) {
                console.log('✅ Supabase detectado durante carregamento, ativando...');
            }
        }
        
        // Forçar verificação novamente antes de usar
        if (window.supabaseDB && window.supabaseDB.supabase && !window.supabaseDB.usarLocalStorage) {
            this.usarSupabase = true;
            this.supabase = window.supabaseDB.supabase;
        }
        
        if (this.usarSupabase && window.supabaseDB && window.supabaseDB.supabase) {
            try {
                const nomeTabela = `fichas_${tipo}`;
                console.log(`☁️ Carregando do Supabase (tabela: ${nomeTabela})...`);
                
                const { data, error } = await window.supabaseDB.supabase
                    .from(nomeTabela)
                    .select('*')
                    .order('dataCriacao', { ascending: false });
                
                if (error) {
                    console.error(`❌ ERRO do Supabase ao carregar ${tipo}:`, error);
                    console.error(`   Código: ${error.code}`);
                    console.error(`   Mensagem: ${error.message}`);
                    console.error(`   Detalhes: ${JSON.stringify(error)}`);
                    
                    // Se for erro de RLS ou permissão, mostrar mensagem clara
                    if (error.code === 'PGRST116' || error.message.includes('permission') || error.message.includes('policy')) {
                        console.error(`🚨 ERRO DE PERMISSÃO/RLS! Configure as políticas no Supabase!`);
                        console.error(`   Acesse: https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk/auth/policies`);
                        console.error(`   Tabela: ${nomeTabela}`);
                        console.error(`   Você precisa criar políticas que permitam SELECT para anon role`);
                    }
                    
                    throw error;
                }
                
                // Sempre retornar os dados do Supabase, mesmo se vazio
                if (data && Array.isArray(data)) {
                    if (data.length > 0) {
                        console.log(`✅ ${data.length} reclamações ${tipo} carregadas do Supabase`);
                        
                        // Sincronizar com localStorage como backup
                        localStorage.setItem(chave, JSON.stringify(data));
                        console.log(`💾 Dados sincronizados com localStorage`);
                    } else {
                        console.log(`⚠️ Nenhuma reclamação ${tipo} encontrada no Supabase (tabela vazia)`);
                        // Retornar array vazio do Supabase, não do localStorage
                        return [];
                    }
                    
                    return data;
                } else {
                    console.warn(`⚠️ Resposta do Supabase inválida:`, data);
                    // Não cair no fallback, retornar vazio
                    return [];
                }
            } catch (error) {
                console.error(`❌ Erro ao carregar do Supabase:`, error);
                console.error(`   Stack: ${error.stack}`);
                // NÃO fazer fallback para localStorage se Supabase está ativo
                // Retornar vazio para forçar o usuário a ver o erro
                console.error(`⚠️ Supabase está ativo mas falhou. Verifique as políticas RLS!`);
                return [];
            }
        }
        
        // FALLBACK: Carregar do localStorage
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
            
            console.log(`📦 Carregadas ${reclamacoes.length} reclamações ${tipo} do localStorage`);
            return reclamacoes;
        } catch (error) {
            console.error(`❌ Erro ao carregar ${tipo}:`, error);
            return [];
        }
    }

    // === OBTER RECLAMAÇÃO POR ID ===
    async obterPorId(tipo, id) {
        const reclamacoes = await this.carregarTodos(tipo);
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
    async contar(tipo) {
        const reclamacoes = await this.carregarTodos(tipo);
        return reclamacoes.length;
    }
}

// Criar instância global
if (!window.armazenamentoReclamacoes) {
    window.armazenamentoReclamacoes = new ArmazenamentoReclamacoes();
    console.log('✅ Sistema de armazenamento global criado');
}

