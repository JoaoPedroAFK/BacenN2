/* === SISTEMA DE ARMAZENAMENTO DE RECLAMAÇÕES === */
/* Usa Firebase quando disponível, fallback para localStorage */

class ArmazenamentoReclamacoes {
    constructor() {
        this.chaves = {
            bacen: 'velotax_reclamacoes_bacen',
            n2: 'velotax_reclamacoes_n2',
            chatbot: 'velotax_reclamacoes_chatbot'
        };
        this.usarFirebase = false;
        this.firebaseDB = null;
        this.inicializarFirebase();
        console.log('✅ Sistema de armazenamento inicializado');
    }
    
    inicializarFirebase() {
        // Aguardar um pouco para garantir que firebaseDB foi inicializado
        setTimeout(() => {
            this.verificarEAtivarFirebase();
        }, 1000);
    }
    
    verificarEAtivarFirebase() {
        // Verificar se Firebase está disponível
        if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
            this.usarFirebase = true;
            this.firebaseDB = window.firebaseDB;
            console.log('✅ Usando Firebase Realtime Database para armazenamento compartilhado');
            console.log('🔍 Firebase DB:', this.firebaseDB ? 'disponível' : 'indisponível');
            return true;
        } else {
            console.warn('⚠️ Firebase não disponível. Usando localStorage (dados locais apenas).');
            console.warn('🔍 window.firebaseDB:', window.firebaseDB ? 'existe' : 'não existe');
            if (window.firebaseDB) {
                console.warn('🔍 window.firebaseDB.inicializado:', window.firebaseDB.inicializado);
                console.warn('🔍 window.firebaseDB.usarLocalStorage:', window.firebaseDB.usarLocalStorage);
            }
            if (window.FIREBASE_CONFIG) {
                console.warn('🔍 window.FIREBASE_CONFIG existe');
            } else {
                console.warn('🔍 window.FIREBASE_CONFIG não existe - configure em js/config-firebase.js');
            }
            return false;
        }
    }

    // === FUNÇÃO HELPER: Criar objeto apenas com campos básicos que provavelmente existem ===
    criarObjetoMinimo(dados, tipo = null) {
        // Campos MÍNIMOS que provavelmente existem em TODAS as tabelas
        const objetoMinimo = {
            id: dados.id,
            nomeCliente: dados.nomeCliente || dados.nomeCompleto || '',
            cpf: dados.cpf || '',
            status: dados.status || 'nao-iniciado'
        };
        
        // Adicionar origem apenas se NÃO for chatbot
        if (tipo !== 'chatbot' && dados.origem) {
            objetoMinimo.origem = dados.origem;
        }
        
        // Adicionar campos que provavelmente existem (mas não são obrigatórios)
        // NÃO adicionar dataCriacao, enviarCobranca, pixLiberado, tipoDemanda - podem não existir
        if (dados.telefone) objetoMinimo.telefone = dados.telefone;
        if (dados.nomeCompleto) objetoMinimo.nomeCompleto = dados.nomeCompleto;
        if (dados.cpfTratado) objetoMinimo.cpfTratado = dados.cpfTratado;
        // NÃO adicionar dataCriacao - pode não existir ou ter nome diferente
        if (dados.dataRecebimento) objetoMinimo.dataRecebimento = dados.dataRecebimento;
        if (dados.finalizadoEm) objetoMinimo.finalizadoEm = dados.finalizadoEm;
        if (dados.responsavel) objetoMinimo.responsavel = dados.responsavel;
        if (dados.motivoReduzido) objetoMinimo.motivoReduzido = dados.motivoReduzido;
        if (dados.motivoDetalhado) objetoMinimo.motivoDetalhado = dados.motivoDetalhado;
        if (dados.observacoes) objetoMinimo.observacoes = dados.observacoes;
        if (dados.mes) objetoMinimo.mes = dados.mes;
        
        // NÃO adicionar campos booleanos que podem não existir
        // if (typeof dados.enviarCobranca === 'boolean') objetoMinimo.enviarCobranca = dados.enviarCobranca;
        // if (typeof dados.pixLiberado === 'boolean') objetoMinimo.pixLiberado = dados.pixLiberado;
        // if (typeof dados.aceitouLiquidacao === 'boolean') objetoMinimo.aceitouLiquidacao = dados.aceitouLiquidacao;
        // if (typeof dados.concluido === 'boolean') objetoMinimo.concluido = dados.concluido;
        
        // NÃO adicionar campos JSON que podem não existir
        // if (dados.modulosContato && typeof dados.modulosContato === 'object') objetoMinimo.modulosContato = dados.modulosContato;
        // if (dados.tentativas && typeof dados.tentativas === 'object') objetoMinimo.tentativas = dados.tentativas;
        // if (dados.protocolos && typeof dados.protocolos === 'object') objetoMinimo.protocolos = dados.protocolos;
        // if (dados.camposEspecificos && typeof dados.camposEspecificos === 'object') objetoMinimo.camposEspecificos = dados.camposEspecificos;
        
        // NÃO adicionar tipoDemanda - pode não existir
        // if (dados.tipoDemanda) objetoMinimo.tipoDemanda = dados.tipoDemanda;
        
        return objetoMinimo;
    }

    // === FUNÇÃO HELPER: Tentar salvar removendo colunas inexistentes automaticamente ===
    async tentarSalvarComRetry(supabase, nomeTabela, dados, operacao = 'insert', id = null, maxTentativas = 20) {
        // Extrair tipo da tabela (fichas_bacen -> bacen, fichas_n2 -> n2, fichas_chatbot -> chatbot)
        const tipo = nomeTabela.replace('fichas_', '');
        
        // Começar com objeto mínimo (apenas campos básicos)
        let dadosLimpos = this.criarObjetoMinimo(dados, tipo);
        
        for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
            try {
                let resultado;
                
                if (operacao === 'update' && id) {
                    const { data, error } = await supabase
                        .from(nomeTabela)
                        .update(dadosLimpos)
                        .eq('id', id)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    resultado = data;
                } else {
                    const { data, error } = await supabase
                        .from(nomeTabela)
                        .insert(dadosLimpos)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    resultado = data;
                }
                
                return { sucesso: true, data: resultado };
            } catch (error) {
                // Se for erro de rede (Failed to fetch), tentar novamente após um delay
                if (error.message && error.message.includes('Failed to fetch')) {
                    console.warn(`   ⚠️ Erro de rede (tentativa ${tentativa + 1}/${maxTentativas}), aguardando 500ms e tentando novamente...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue; // Tentar novamente
                }
                
                // Se for erro de coluna não encontrada (PGRST204), extrair nome da coluna e remover
                if (error.code === 'PGRST204' && error.message) {
                    // Extrair nome da coluna da mensagem: "Could not find the 'nomeColuna' column..."
                    const match = error.message.match(/'([^']+)'/);
                    if (match && match[1]) {
                        const colunaProblema = match[1];
                        console.warn(`   ⚠️ Coluna '${colunaProblema}' não existe na tabela, removendo e tentando novamente...`);
                        delete dadosLimpos[colunaProblema];
                        continue; // Tentar novamente sem essa coluna
                    }
                }
                
                // Se não for erro de coluna ou não conseguir extrair nome, retornar erro
                return { sucesso: false, error };
            }
        }
        
        return { sucesso: false, error: new Error('Máximo de tentativas excedido') };
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
        
        // Obter chave
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return false;
        }
        
        // DEBUG: Verificar estado do Firebase (apenas para primeira ficha para não poluir logs)
        if (!reclamacao._debugLogado) {
            reclamacao._debugLogado = true;
            console.log(`🔍 DEBUG Firebase - usarFirebase: ${this.usarFirebase}`);
            console.log(`🔍 DEBUG Firebase - window.firebaseDB:`, window.firebaseDB ? 'existe' : 'não existe');
            if (window.firebaseDB) {
                console.log(`🔍 DEBUG Firebase - window.firebaseDB.inicializado:`, window.firebaseDB.inicializado);
                console.log(`🔍 DEBUG Firebase - window.firebaseDB.usarLocalStorage:`, window.firebaseDB.usarLocalStorage);
                console.log(`🔍 DEBUG Firebase - window.FIREBASE_CONFIG:`, window.FIREBASE_CONFIG ? 'existe' : 'não existe');
            }
        }
        
        // PRIORIDADE 1: Tentar salvar no Firebase (armazenamento compartilhado)
        // Re-verificar Firebase antes de salvar (pode ter sido inicializado depois)
        if (!this.usarFirebase) {
            const ativado = this.verificarEAtivarFirebase();
            if (ativado) {
                console.log('✅ Firebase detectado durante salvamento, ativando...');
            }
        }
        
        // Forçar verificação novamente antes de usar
        if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
            this.usarFirebase = true;
            this.firebaseDB = window.firebaseDB;
        }
        
        // Log detalhado para debug
        if (!reclamacao._debugLogado) {
            console.log(`🔍 DEBUG SALVAMENTO - usarFirebase: ${this.usarFirebase}`);
            console.log(`🔍 DEBUG SALVAMENTO - window.firebaseDB:`, window.firebaseDB ? 'existe' : 'não existe');
            if (window.firebaseDB) {
                console.log(`🔍 DEBUG SALVAMENTO - window.firebaseDB.inicializado:`, window.firebaseDB.inicializado);
                console.log(`🔍 DEBUG SALVAMENTO - window.firebaseDB.usarLocalStorage:`, window.firebaseDB.usarLocalStorage);
            }
        }
        
        if (this.usarFirebase && window.firebaseDB && window.firebaseDB.inicializado) {
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
                    
                    const resultadoUpdate = await this.tentarSalvarComRetry(
                        window.supabaseDB.supabase,
                        nomeTabela,
                        reclamacao,
                        'update',
                        reclamacao.id
                    );
                    
                    if (!resultadoUpdate.sucesso) {
                        const error = resultadoUpdate.error;
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
                    resultado = resultadoUpdate.data;
                    if (!reclamacao._debugLogado) {
                        console.log(`✅ Reclamação atualizada no Supabase: ${reclamacao.id}`);
                    }
                } else {
                    // Inserir
                    if (!reclamacao._debugLogado) {
                        console.log(`   ➕ Inserindo novo registro...`);
                    }
                    
                    const resultadoInsert = await this.tentarSalvarComRetry(
                        window.supabaseDB.supabase,
                        nomeTabela,
                        reclamacao,
                        'insert'
                    );
                    
                    if (!resultadoInsert.sucesso) {
                        const error = resultadoInsert.error;
                        console.error(`❌ ERRO ao inserir no Supabase:`, error);
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
                    resultado = resultadoInsert.data;
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
                
                // NUNCA usar localStorage quando Supabase está ativo - apenas Supabase!
                if (this.usarSupabase) {
                    console.error(`⚠️ Supabase está ativo mas falhou. NÃO usando localStorage!`);
                    console.error(`   Execute o script SQL para corrigir a estrutura das tabelas!`);
                    throw error; // Propaga o erro - NÃO tenta localStorage
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
        
        // PRIORIDADE 1: Tentar carregar do Firebase (armazenamento compartilhado)
        // Re-verificar Firebase antes de carregar (pode ter sido inicializado depois)
        if (!this.usarFirebase) {
            const ativado = this.verificarEAtivarFirebase();
            if (ativado) {
                console.log('✅ Firebase detectado durante carregamento, ativando...');
            }
        }
        
        // Forçar verificação novamente antes de usar
        if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
            this.usarFirebase = true;
            this.firebaseDB = window.firebaseDB;
        }
        
        if (this.usarFirebase && window.firebaseDB && window.firebaseDB.inicializado) {
            try {
                console.log(`🔥 Carregando do Firebase (tipo: ${tipo})...`);
                
                const data = await window.firebaseDB.carregar(tipo);
                
                // Ordenar por dataCriacao (se existir) ou data de recebimento
                if (data && data.length > 0) {
                    data.sort((a, b) => {
                        const dataA = a.dataCriacao || a.dataRecebimento || a.dataEntrada || 0;
                        const dataB = b.dataCriacao || b.dataRecebimento || b.dataEntrada || 0;
                        return new Date(dataB) - new Date(dataA);
                    });
                    console.log(`✅ ${data.length} reclamações ${tipo} carregadas do Firebase`);
                    return data;
                } else {
                    console.log(`⚠️ Nenhuma reclamação ${tipo} encontrada no Firebase`);
                    return [];
                }
            } catch (error) {
                console.error(`❌ Erro ao carregar do Firebase:`, error);
                console.error(`   Stack: ${error.stack}`);
                // NÃO fazer fallback para localStorage se Firebase está ativo
                console.error(`⚠️ Firebase está ativo mas falhou. Verifique a configuração!`);
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

