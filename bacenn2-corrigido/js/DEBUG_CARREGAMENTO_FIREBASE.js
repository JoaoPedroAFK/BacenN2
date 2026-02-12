/* === SCRIPT DE DEPURAÇÃO COMPLETA - CARREGAMENTO FIREBASE === */
/* VERSION: v1.1.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team */
/* 
 * Cole este código no console do navegador (F12) para diagnosticar problemas
 * de carregamento de dados do Firebase
 * 
 * USO:
 * 1. Abra o console do navegador (F12)
 * 2. Cole todo este código OU carregue via: <script src="js/DEBUG_CARREGAMENTO_FIREBASE.js"></script>
 * 3. Execute: debugCarregamentoFirebase('chatbot') // ou 'bacen', 'n2'
 */

async function debugCarregamentoFirebase(tipo = 'chatbot') {
    console.log('🔍 ===== DIAGNÓSTICO COMPLETO DE CARREGAMENTO FIREBASE =====');
    console.log(`📋 Tipo sendo diagnosticado: ${tipo}`);
    console.log('');
    
    const resultados = {
        tipo: tipo,
        timestamp: new Date().toISOString(),
        etapas: {}
    };
    
    // ==========================================
    // PASSO 1: Verificar Inicialização do Firebase
    // ==========================================
    console.log('📌 PASSO 1: Verificando Inicialização do Firebase...');
    console.log('─'.repeat(60));
    
    const firebaseInicializado = window.firebaseDB?.inicializado;
    const usandoLocalStorage = window.firebaseDB?.usarLocalStorage;
    const armazenamentoUsandoFirebase = window.armazenamentoReclamacoes?.usarFirebase;
    
    console.log('✅ Firebase inicializado?', firebaseInicializado);
    console.log('✅ Usando localStorage?', usandoLocalStorage);
    console.log('✅ Armazenamento usando Firebase?', armazenamentoUsandoFirebase);
    console.log('');
    
    resultados.etapas.inicializacao = {
        firebaseInicializado: firebaseInicializado,
        usandoLocalStorage: usandoLocalStorage,
        armazenamentoUsandoFirebase: armazenamentoUsandoFirebase,
        status: firebaseInicializado && !usandoLocalStorage && armazenamentoUsandoFirebase ? 'OK' : 'ERRO'
    };
    
    if (!firebaseInicializado || usandoLocalStorage || !armazenamentoUsandoFirebase) {
        console.error('❌ PROBLEMA DETECTADO: Firebase não está configurado corretamente!');
        console.error('   Verifique:');
        console.error('   - firebase-init-v2.js foi carregado?');
        console.error('   - Evento firebaseReady foi disparado?');
        console.error('   - armazenamento-reclamacoes.js escutou o evento?');
        console.log('');
        
        // Verificar se Firebase SDK está carregado
        console.log('🔍 Verificando Firebase SDK...');
        console.log('   typeof firebase:', typeof firebase);
        console.log('   firebase.apps:', firebase?.apps);
        console.log('   window.FIREBASE_CONFIG:', window.FIREBASE_CONFIG ? 'existe' : 'não existe');
        console.log('');
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK não está carregado!');
            console.error('   Verifique se os scripts do Firebase estão incluídos no HTML');
        }
        
        if (!window.FIREBASE_CONFIG) {
            console.error('❌ FIREBASE_CONFIG não encontrado!');
            console.error('   Verifique se config-firebase.js foi carregado');
        }
        
        console.log('');
        return resultados;
    }
    
    console.log('✅ PASSO 1: OK - Firebase está inicializado corretamente');
    console.log('');
    
    // ==========================================
    // PASSO 2: Verificar Dados no Firebase Diretamente
    // ==========================================
    console.log('📌 PASSO 2: Verificando Dados no Firebase...');
    console.log('─'.repeat(60));
    
    try {
        const caminho = `fichas_${tipo}`;
        console.log(`📂 Caminho no Firebase: ${caminho}`);
        
        // Verificar se firebase.database() está disponível
        if (!window.firebaseDB?.database) {
            console.error('❌ window.firebaseDB.database não está disponível!');
            resultados.etapas.dadosFirebase = {
                status: 'ERRO',
                erro: 'database não disponível'
            };
            return resultados;
        }
        
        console.log('📥 Fazendo leitura direta do Firebase...');
        const snapshot = await window.firebaseDB.database.ref(caminho).once('value');
        
        console.log('✅ Snapshot obtido');
        console.log('   snapshot.exists():', snapshot.exists());
        console.log('   snapshot.hasChildren():', snapshot.hasChildren());
        
        if (!snapshot.exists()) {
            console.warn('⚠️ Snapshot não existe - nenhum dado encontrado no Firebase');
            console.warn(`   Caminho verificado: ${caminho}`);
            console.warn('   Possíveis causas:');
            console.warn('   - Dados nunca foram salvos neste caminho');
            console.warn('   - Regras de segurança impedem leitura');
            console.warn('   - Caminho incorreto');
            console.log('');
            
            resultados.etapas.dadosFirebase = {
                status: 'VAZIO',
                snapshotExiste: false,
                caminho: caminho
            };
            
            // Verificar outros caminhos para comparação
            console.log('🔍 Verificando outros caminhos para comparação...');
            const outrosTipos = ['bacen', 'n2', 'chatbot'].filter(t => t !== tipo);
            for (const outroTipo of outrosTipos) {
                const outroCaminho = `fichas_${outroTipo}`;
                const outroSnapshot = await window.firebaseDB.database.ref(outroCaminho).once('value');
                console.log(`   ${outroCaminho}: ${outroSnapshot.exists() ? '✅ Existe' : '❌ Não existe'}`);
            }
            console.log('');
            
            return resultados;
        }
        
        const dadosBrutos = snapshot.val();
        console.log('📊 Dados brutos do Firebase:');
        console.log('   Tipo:', typeof dadosBrutos);
        console.log('   É array?', Array.isArray(dadosBrutos));
        console.log('   É objeto?', dadosBrutos && typeof dadosBrutos === 'object' && !Array.isArray(dadosBrutos));
        console.log('   Número de chaves:', dadosBrutos ? Object.keys(dadosBrutos).length : 0);
        
        if (dadosBrutos && typeof dadosBrutos === 'object' && !Array.isArray(dadosBrutos)) {
            const chaves = Object.keys(dadosBrutos);
            console.log('   Primeiras 3 chaves:', chaves.slice(0, 3));
            
            if (chaves.length > 0) {
                console.log('   Primeira ficha (amostra):', {
                    id: chaves[0],
                    nome: dadosBrutos[chaves[0]]?.nomeCompleto || dadosBrutos[chaves[0]]?.nomeCliente || 'sem nome',
                    campos: Object.keys(dadosBrutos[chaves[0]] || {})
                });
            }
        } else {
            console.warn('⚠️ Dados não estão no formato esperado (objeto)');
            console.warn('   Dados recebidos:', dadosBrutos);
        }
        
        // Converter para array (mesma lógica do firebase-db.js)
        console.log('');
        console.log('🔄 Convertendo objeto para array...');
        const fichas = Object.keys(dadosBrutos).map(id => {
            const ficha = dadosBrutos[id];
            // Garantir que ID está presente
            if (!ficha.id || ficha.id !== id) {
                ficha.id = id;
            }
            return ficha;
        });
        
        console.log('✅ Conversão concluída');
        console.log(`   Total de fichas: ${fichas.length}`);
        if (fichas.length > 0) {
            console.log('   Primeira ficha convertida:', {
                id: fichas[0].id,
                nome: fichas[0].nomeCompleto || fichas[0].nomeCliente || 'sem nome',
                status: fichas[0].status || 'sem status'
            });
        }
        
        resultados.etapas.dadosFirebase = {
            status: 'OK',
            snapshotExiste: true,
            caminho: caminho,
            totalFichas: fichas.length,
            dadosBrutos: dadosBrutos,
            fichasConvertidas: fichas
        };
        
        console.log('');
        console.log('✅ PASSO 2: OK - Dados encontrados e convertidos');
        console.log('');
        
    } catch (error) {
        console.error('❌ ERRO ao verificar dados no Firebase:', error);
        console.error('   Mensagem:', error.message);
        console.error('   Código:', error.code);
        console.error('   Stack:', error.stack);
        console.log('');
        
        resultados.etapas.dadosFirebase = {
            status: 'ERRO',
            erro: error.message,
            codigo: error.code,
            stack: error.stack
        };
        
        if (error.code === 'PERMISSION_DENIED') {
            console.error('🚨 ERRO DE PERMISSÃO!');
            console.error('   Verifique as regras de segurança no Firebase Console');
            console.error(`   Caminho tentado: fichas_${tipo}`);
        }
        
        return resultados;
    }
    
    // ==========================================
    // PASSO 3: Verificar Método firebaseDB.carregar()
    // ==========================================
    console.log('📌 PASSO 3: Testando firebaseDB.carregar()...');
    console.log('─'.repeat(60));
    
    try {
        if (!window.firebaseDB || typeof window.firebaseDB.carregar !== 'function') {
            console.error('❌ window.firebaseDB.carregar não é uma função!');
            resultados.etapas.metodoCarregar = {
                status: 'ERRO',
                erro: 'método carregar não encontrado'
            };
            return resultados;
        }
        
        console.log('📥 Chamando window.firebaseDB.carregar()...');
        const fichasCarregadas = await window.firebaseDB.carregar(tipo);
        
        console.log('✅ Método carregar() executado');
        console.log('   Tipo retornado:', typeof fichasCarregadas);
        console.log('   É array?', Array.isArray(fichasCarregadas));
        console.log('   Total de fichas:', fichasCarregadas?.length || 0);
        
        if (Array.isArray(fichasCarregadas) && fichasCarregadas.length > 0) {
            console.log('   Primeira ficha:', {
                id: fichasCarregadas[0].id,
                nome: fichasCarregadas[0].nomeCompleto || fichasCarregadas[0].nomeCliente || 'sem nome'
            });
        }
        
        resultados.etapas.metodoCarregar = {
            status: 'OK',
            totalFichas: fichasCarregadas?.length || 0,
            fichas: fichasCarregadas
        };
        
        console.log('');
        console.log('✅ PASSO 3: OK - Método carregar() funcionou');
        console.log('');
        
    } catch (error) {
        console.error('❌ ERRO ao testar firebaseDB.carregar():', error);
        resultados.etapas.metodoCarregar = {
            status: 'ERRO',
            erro: error.message
        };
        return resultados;
    }
    
    // ==========================================
    // PASSO 4: Verificar Método armazenamentoReclamacoes.carregarTodos()
    // ==========================================
    console.log('📌 PASSO 4: Testando armazenamentoReclamacoes.carregarTodos()...');
    console.log('─'.repeat(60));
    
    try {
        if (!window.armazenamentoReclamacoes || typeof window.armazenamentoReclamacoes.carregarTodos !== 'function') {
            console.error('❌ window.armazenamentoReclamacoes.carregarTodos não é uma função!');
            resultados.etapas.metodoCarregarTodos = {
                status: 'ERRO',
                erro: 'método carregarTodos não encontrado'
            };
            return resultados;
        }
        
        console.log('📥 Chamando window.armazenamentoReclamacoes.carregarTodos()...');
        const fichasArmazenamento = await window.armazenamentoReclamacoes.carregarTodos(tipo);
        
        console.log('✅ Método carregarTodos() executado');
        console.log('   Tipo retornado:', typeof fichasArmazenamento);
        console.log('   É array?', Array.isArray(fichasArmazenamento));
        console.log('   Total de fichas:', fichasArmazenamento?.length || 0);
        
        if (Array.isArray(fichasArmazenamento) && fichasArmazenamento.length > 0) {
            console.log('   Primeira ficha:', {
                id: fichasArmazenamento[0].id,
                nome: fichasArmazenamento[0].nomeCompleto || fichasArmazenamento[0].nomeCliente || 'sem nome'
            });
        }
        
        resultados.etapas.metodoCarregarTodos = {
            status: 'OK',
            totalFichas: fichasArmazenamento?.length || 0,
            fichas: fichasArmazenamento
        };
        
        console.log('');
        console.log('✅ PASSO 4: OK - Método carregarTodos() funcionou');
        console.log('');
        
    } catch (error) {
        console.error('❌ ERRO ao testar armazenamentoReclamacoes.carregarTodos():', error);
        resultados.etapas.metodoCarregarTodos = {
            status: 'ERRO',
            erro: error.message
        };
        return resultados;
    }
    
    // ==========================================
    // PASSO 5: Verificar Variável Global da Página
    // ==========================================
    console.log('📌 PASSO 5: Verificando Variável Global da Página...');
    console.log('─'.repeat(60));
    
    let variavelGlobal;
    let funcaoCarregar;
    
    switch(tipo) {
        case 'bacen':
            variavelGlobal = window.fichasBacen;
            funcaoCarregar = window.carregarFichasBacen;
            break;
        case 'n2':
            variavelGlobal = window.fichasN2;
            funcaoCarregar = window.carregarFichasN2;
            break;
        case 'chatbot':
            variavelGlobal = window.fichasChatbot;
            funcaoCarregar = window.carregarFichasChatbot;
            break;
    }
    
    console.log('📋 Variável global:', variavelGlobal ? 'existe' : 'não existe');
    console.log('📋 Função carregar:', funcaoCarregar ? 'existe' : 'não existe');
    
    if (variavelGlobal) {
        console.log('   Tipo:', typeof variavelGlobal);
        console.log('   É array?', Array.isArray(variavelGlobal));
        console.log('   Total:', variavelGlobal.length || 0);
    }
    
    if (funcaoCarregar) {
        console.log('🔄 Testando função carregar da página...');
        try {
            await funcaoCarregar();
            console.log('✅ Função carregar executada');
            
            // Verificar novamente variável global após carregar
            switch(tipo) {
                case 'bacen':
                    variavelGlobal = window.fichasBacen;
                    break;
                case 'n2':
                    variavelGlobal = window.fichasN2;
                    break;
                case 'chatbot':
                    variavelGlobal = window.fichasChatbot;
                    break;
            }
            
            console.log('   Total após carregar:', variavelGlobal?.length || 0);
        } catch (error) {
            console.error('❌ Erro ao executar função carregar:', error);
        }
    }
    
    resultados.etapas.variavelGlobal = {
        existe: !!variavelGlobal,
        total: variavelGlobal?.length || 0,
        funcaoCarregarExiste: !!funcaoCarregar
    };
    
    console.log('');
    
    // ==========================================
    // PASSO 6: Verificar Logs Persistentes
    // ==========================================
    console.log('📌 PASSO 6: Verificando Logs Persistentes...');
    console.log('─'.repeat(60));
    
    const logs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('velotax_debug_')) {
            try {
                const log = JSON.parse(localStorage.getItem(key));
                logs.push({ key, ...log });
            } catch (e) {
                // Ignorar logs inválidos
            }
        }
    }
    
    console.log(`📊 Total de logs encontrados: ${logs.length}`);
    
    if (logs.length > 0) {
        // Ordenar por timestamp
        logs.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
        });
        
        console.log('📋 Últimos 10 logs:');
        logs.slice(0, 10).forEach((log, index) => {
            console.log(`   ${index + 1}. [${log.timestamp || 'sem timestamp'}] ${log.acao || log.erro || 'sem ação'}`);
            if (log.tipo) console.log(`      Tipo: ${log.tipo}`);
            if (log.id) console.log(`      ID: ${log.id}`);
            if (log.erro) console.log(`      Erro: ${log.erro}`);
        });
        
        // Filtrar logs relacionados ao tipo sendo diagnosticado
        const logsTipo = logs.filter(log => log.tipo === tipo);
        console.log(`📋 Logs relacionados a ${tipo}: ${logsTipo.length}`);
    } else {
        console.log('⚠️ Nenhum log persistente encontrado');
    }
    
    resultados.etapas.logs = {
        total: logs.length,
        logs: logs.slice(0, 20) // Limitar a 20 logs
    };
    
    console.log('');
    
    // ==========================================
    // PASSO 7: Verificar Renderização na Lista
    // ==========================================
    console.log('📌 PASSO 7: Verificando Renderização na Lista...');
    console.log('─'.repeat(60));
    
    let containerId;
    let funcaoRenderizar;
    
    switch(tipo) {
        case 'bacen':
            containerId = 'lista-fichas-bacen';
            funcaoRenderizar = window.renderizarListaBacen;
            break;
        case 'n2':
            containerId = 'lista-fichas-n2';
            funcaoRenderizar = window.renderizarListaN2;
            break;
        case 'chatbot':
            containerId = 'lista-fichas-chatbot';
            funcaoRenderizar = window.renderizarListaChatbot;
            break;
    }
    
    const container = document.getElementById(containerId);
    console.log(`📋 Container ID: ${containerId}`);
    console.log('   Container existe?', container ? '✅ Sim' : '❌ Não');
    
    if (container) {
        console.log('   Container visível?', container.offsetParent !== null ? '✅ Sim' : '❌ Não');
        console.log('   Container tem conteúdo?', container.innerHTML.trim().length > 0 ? '✅ Sim' : '❌ Não');
        console.log('   Tamanho do conteúdo:', container.innerHTML.length, 'caracteres');
        
        // Contar elementos de ficha
        const fichasNoDOM = container.querySelectorAll('.complaint-item, .ficha-card');
        console.log('   Fichas renderizadas no DOM:', fichasNoDOM.length);
        
        if (fichasNoDOM.length === 0 && container.innerHTML.trim().length > 0) {
            console.warn('   ⚠️ Container tem conteúdo mas nenhuma ficha renderizada');
            console.warn('   Conteúdo (primeiros 200 chars):', container.innerHTML.substring(0, 200));
        }
    } else {
        console.error('❌ Container não encontrado no DOM!');
        console.error('   Verifique se o HTML tem o elemento com id:', containerId);
    }
    
    console.log('📋 Função renderizar:', funcaoRenderizar ? '✅ Existe' : '❌ Não existe');
    
    if (funcaoRenderizar && container) {
        console.log('🔄 Testando função renderizar...');
        try {
            await funcaoRenderizar();
            console.log('✅ Função renderizar executada');
            
            // Verificar novamente após renderizar
            const fichasAposRenderizar = container.querySelectorAll('.complaint-item, .ficha-card');
            console.log('   Fichas após renderizar:', fichasAposRenderizar.length);
            
            if (fichasAposRenderizar.length === 0) {
                console.warn('   ⚠️ Nenhuma ficha renderizada após chamar função');
                console.warn('   Possíveis causas:');
                console.warn('   - Filtros estão ocultando todas as fichas');
                console.warn('   - Variável global está vazia');
                console.warn('   - Erro na função criarCard*()');
            }
        } catch (error) {
            console.error('❌ Erro ao executar função renderizar:', error);
            console.error('   Mensagem:', error.message);
            console.error('   Stack:', error.stack);
        }
    }
    
    // Verificar filtros
    let buscaId, filtroStatusId;
    switch(tipo) {
        case 'bacen':
            buscaId = 'busca-bacen';
            filtroStatusId = 'filtro-status-bacen';
            break;
        case 'n2':
            buscaId = 'busca-n2';
            filtroStatusId = 'filtro-status-n2';
            break;
        case 'chatbot':
            buscaId = 'busca-chatbot';
            filtroStatusId = 'filtro-status-chatbot';
            break;
    }
    
    const busca = document.getElementById(buscaId);
    const filtroStatus = document.getElementById(filtroStatusId);
    
    console.log('');
    console.log('🔍 Verificando Filtros...');
    console.log('   Campo de busca:', busca ? `✅ Existe (valor: "${busca.value}")` : '❌ Não existe');
    console.log('   Filtro de status:', filtroStatus ? `✅ Existe (valor: "${filtroStatus.value}")` : '❌ Não existe');
    
    if (busca && busca.value) {
        console.warn('   ⚠️ Campo de busca tem valor - pode estar filtrando fichas');
    }
    if (filtroStatus && filtroStatus.value && filtroStatus.value !== 'todos' && filtroStatus.value !== '') {
        console.warn('   ⚠️ Filtro de status ativo - pode estar filtrando fichas');
    }
    
    resultados.etapas.renderizacao = {
        containerExiste: !!container,
        containerVisivel: container ? container.offsetParent !== null : false,
        fichasNoDOM: container ? container.querySelectorAll('.complaint-item, .ficha-card').length : 0,
        funcaoRenderizarExiste: !!funcaoRenderizar,
        buscaAtiva: busca ? busca.value : null,
        filtroStatusAtivo: filtroStatus ? filtroStatus.value : null
    };
    
    console.log('');
    
    // ==========================================
    // RESUMO FINAL
    // ==========================================
    console.log('📊 ===== RESUMO DO DIAGNÓSTICO =====');
    console.log('');
    
    // Verificar se todas as etapas críticas passaram
    const etapasCriticas = ['inicializacao', 'dadosFirebase', 'metodoCarregar', 'metodoCarregarTodos', 'variavelGlobal'];
    const etapasCriticasOK = etapasCriticas.every(nome => {
        const etapa = resultados.etapas[nome];
        return etapa && (etapa.status === 'OK' || etapa.status === 'VAZIO');
    });
    
    if (etapasCriticasOK) {
        console.log('✅ Todas as etapas críticas passaram!');
        console.log('');
        
        // Verificar renderização
        const renderizacao = resultados.etapas.renderizacao;
        if (renderizacao) {
            if (!renderizacao.containerExiste) {
                console.error('❌ Container da lista não existe no DOM!');
                console.error(`   ID esperado: lista-fichas-${tipo}`);
            } else if (renderizacao.fichasNoDOM === 0) {
                console.warn('⚠️ Container existe mas nenhuma ficha está renderizada');
                console.warn('   Possíveis causas:');
                
                if (renderizacao.buscaAtiva) {
                    console.warn(`   - Campo de busca tem valor: "${renderizacao.buscaAtiva}"`);
                }
                if (renderizacao.filtroStatusAtivo && renderizacao.filtroStatusAtivo !== 'todos') {
                    console.warn(`   - Filtro de status ativo: "${renderizacao.filtroStatusAtivo}"`);
                }
                if (!renderizacao.funcaoRenderizarExiste) {
                    console.warn('   - Função renderizar não existe');
                }
                if (resultados.etapas.variavelGlobal?.total === 0) {
                    console.warn('   - Variável global está vazia');
                }
            } else {
                console.log(`✅ ${renderizacao.fichasNoDOM} fichas renderizadas no DOM`);
            }
        }
        
        console.log('');
        console.log('📋 Resumo por etapa:');
        Object.entries(resultados.etapas).forEach(([nome, etapa]) => {
            const status = etapa.status || (etapa.existe !== undefined ? (etapa.existe ? 'OK' : 'ERRO') : 'INFO');
            const emoji = status === 'OK' ? '✅' : status === 'ERRO' ? '❌' : status === 'VAZIO' ? '⚠️' : 'ℹ️';
            console.log(`   ${emoji} ${nome}: ${status}`);
        });
    } else {
        console.log('❌ Problemas detectados nas seguintes etapas:');
        Object.entries(resultados.etapas).forEach(([nome, etapa]) => {
            if (etapa.status === 'ERRO') {
                console.log(`   ❌ ${nome}: ${etapa.erro || 'Erro desconhecido'}`);
            } else if (etapa.status === 'VAZIO' && nome === 'dadosFirebase') {
                console.log(`   ⚠️ ${nome}: Nenhum dado encontrado no Firebase`);
            }
        });
    }
    
    console.log('');
    console.log('📋 Resultados completos salvos em: window.debugResultados');
    window.debugResultados = resultados;
    
    return resultados;
}

// Função auxiliar para limpar logs antigos
function limparLogsDebug(dias = 7) {
    const agora = new Date();
    const limite = agora.getTime() - (dias * 24 * 60 * 60 * 1000);
    let removidos = 0;
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('velotax_debug_')) {
            try {
                const log = JSON.parse(localStorage.getItem(key));
                const logTime = new Date(log.timestamp || 0).getTime();
                if (logTime < limite) {
                    localStorage.removeItem(key);
                    removidos++;
                }
            } catch (e) {
                // Ignorar logs inválidos
            }
        }
    }
    
    console.log(`✅ ${removidos} logs antigos removidos`);
    return removidos;
}

// Função auxiliar para testar salvamento manual
async function testarSalvamentoManual(tipo = 'chatbot') {
    console.log('🧪 ===== TESTE DE SALVAMENTO MANUAL =====');
    console.log(`📋 Tipo: ${tipo}`);
    console.log('');
    
    const fichaTeste = {
        id: 'teste_' + Date.now(),
        nomeCompleto: 'Teste Debug ' + new Date().toLocaleTimeString(),
        cpf: '12345678900',
        motivo: 'Teste de depuração',
        dataCriacao: new Date().toISOString(),
        tipoDemanda: tipo,
        status: 'nao-iniciado'
    };
    
    console.log('📦 Ficha de teste:', fichaTeste);
    console.log('');
    
    try {
        console.log('💾 Salvando ficha de teste...');
        const sucesso = await window.armazenamentoReclamacoes.salvar(tipo, fichaTeste);
        
        if (sucesso) {
            console.log('✅ Ficha de teste salva com sucesso!');
            console.log('   ID:', fichaTeste.id);
            console.log('');
            
            // Aguardar um pouco
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verificar se foi salva
            console.log('🔍 Verificando se ficha foi salva...');
            const existe = await window.firebaseDB.existe(tipo, fichaTeste.id);
            
            if (existe) {
                console.log('✅ Ficha encontrada no Firebase!');
                console.log('');
                console.log('💡 Agora execute: debugCarregamentoFirebase("' + tipo + '")');
            } else {
                console.warn('⚠️ Ficha não encontrada no Firebase após salvar');
                console.warn('   Pode levar alguns segundos para sincronizar');
            }
        } else {
            console.error('❌ Falha ao salvar ficha de teste');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar ficha de teste:', error);
    }
    
    return fichaTeste;
}

// Função auxiliar para forçar atualização da lista
async function forcarAtualizacaoLista(tipo = 'chatbot') {
    console.log('🔄 ===== FORÇANDO ATUALIZAÇÃO DA LISTA =====');
    console.log(`📋 Tipo: ${tipo}`);
    console.log('');
    
    let funcaoCarregar, funcaoRenderizar, containerId;
    
    switch(tipo) {
        case 'bacen':
            funcaoCarregar = window.carregarFichasBacen;
            funcaoRenderizar = window.renderizarListaBacen;
            containerId = 'lista-fichas-bacen';
            break;
        case 'n2':
            funcaoCarregar = window.carregarFichasN2;
            funcaoRenderizar = window.renderizarListaN2;
            containerId = 'lista-fichas-n2';
            break;
        case 'chatbot':
            funcaoCarregar = window.carregarFichasChatbot;
            funcaoRenderizar = window.renderizarListaChatbot;
            containerId = 'lista-fichas-chatbot';
            break;
    }
    
    try {
        console.log('1️⃣ Recarregando fichas...');
        if (funcaoCarregar) {
            await funcaoCarregar();
            console.log('✅ Fichas recarregadas');
        } else {
            console.error('❌ Função carregar não encontrada');
        }
        
        console.log('');
        console.log('2️⃣ Renderizando lista...');
        if (funcaoRenderizar) {
            await funcaoRenderizar();
            console.log('✅ Lista renderizada');
        } else {
            console.error('❌ Função renderizar não encontrada');
        }
        
        console.log('');
        console.log('3️⃣ Verificando resultado...');
        const container = document.getElementById(containerId);
        if (container) {
            const fichas = container.querySelectorAll('.complaint-item, .ficha-card');
            console.log(`✅ ${fichas.length} fichas renderizadas no DOM`);
        } else {
            console.error('❌ Container não encontrado:', containerId);
        }
    } catch (error) {
        console.error('❌ Erro ao forçar atualização:', error);
    }
}

// Exportar para uso global
window.debugCarregamentoFirebase = debugCarregamentoFirebase;
window.limparLogsDebug = limparLogsDebug;
window.testarSalvamentoManual = testarSalvamentoManual;
window.forcarAtualizacaoLista = forcarAtualizacaoLista;

console.log('✅ Script de debug carregado!');
console.log('');
console.log('📝 Comandos disponíveis:');
console.log('   debugCarregamentoFirebase("chatbot")  // Diagnóstico completo');
console.log('   testarSalvamentoManual("chatbot")     // Testar salvamento');
console.log('   forcarAtualizacaoLista("chatbot")    // Forçar atualização');
console.log('   limparLogsDebug(7)                   // Limpar logs antigos');
console.log('');

