/* === SISTEMA DE GESTÃO CHATBOT - PÁGINA ESPECÍFICA === */

// Variáveis globais
let fichasChatbot = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (window.loadingVelotax) {
        window.loadingVelotax.mostrar();
        window.loadingVelotax.esconderForcado(); // Segurança
    }
    
    try {
        inicializarChatbot();
        carregarFichasChatbot();
        atualizarDashboardChatbot();
        configurarEventosChatbot();
    } catch (error) {
        console.error('Erro na inicialização Chatbot:', error);
    } finally {
        setTimeout(() => {
            if (window.loadingVelotax) {
                window.loadingVelotax.esconder();
            }
        }, 500);
    }
});

// === INICIALIZAÇÃO ===
function inicializarChatbot() {
    // Não preencher automaticamente - usuário deve inserir manualmente
}

// === NAVEGAÇÃO ===
function mostrarSecao(secaoId) {
    console.log('🔍 mostrarSecao chamado com:', secaoId);
    
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const section = document.getElementById(secaoId);
    if (section) {
        section.classList.add('active');
        console.log('✅ Seção ativada:', secaoId);
    } else {
        console.error('❌ Seção não encontrada:', secaoId);
    }
    
    // Ativar botão correspondente
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${secaoId}'`)) {
            btn.classList.add('active');
            console.log('✅ Botão ativado para:', secaoId);
        }
    });
    
    if (secaoId === 'lista-chatbot') {
        carregarFichasChatbot().then(() => {
            console.log('📋 Fichas Chatbot carregadas para lista geral:', fichasChatbot.length);
            renderizarListaChatbot();
        });
    } else if (secaoId === 'minhas-reclamacoes-chatbot') {
        carregarFichasChatbot().then(() => {
            console.log('📋 Fichas Chatbot carregadas para minhas reclamações:', fichasChatbot.length);
            renderizarMinhasReclamacoesChatbot();
        });
    } else if (secaoId === 'nova-reclamacao-chatbot' || secaoId === 'nova-ficha-chatbot') {
        // Compatibilidade com ambos os nomes
        if (secaoId === 'nova-ficha-chatbot') {
            mostrarSecao('nova-reclamacao-chatbot');
            return;
        }
    } else if (secaoId === 'dashboard-chatbot') {
        atualizarDashboardChatbot();
        // Reinicializar gráficos
        setTimeout(() => {
            if (window.graficosDetalhadosChatbot) {
                window.graficosDetalhadosChatbot.carregarDados();
                window.graficosDetalhadosChatbot.renderizarGraficos();
            } else {
                window.graficosDetalhadosChatbot = new GraficosDetalhados('chatbot');
            }
        }, 300);
        // Configurar cards após um pequeno delay
        setTimeout(() => {
            configurarCardsDashboardChatbot();
        }, 500);
    }
}

// === CARREGAR FICHAS ===
async function carregarFichasChatbot() {
    console.log('🔄 Carregando fichas Chatbot...');
    console.log('🔍 window.armazenamentoReclamacoes:', typeof window.armazenamentoReclamacoes);
    
    // Verificar diretamente no localStorage primeiro (para debug)
    const chaveNova = 'velotax_reclamacoes_chatbot';
    const chaveAntiga = 'velotax_demandas_chatbot';
    const dadosNovos = localStorage.getItem(chaveNova);
    const dadosAntigos = localStorage.getItem(chaveAntiga);
    
    console.log('🔍 localStorage verificação:');
    console.log(`  - ${chaveNova}:`, dadosNovos ? `${JSON.parse(dadosNovos).length} reclamações` : 'vazio');
    console.log(`  - ${chaveAntiga}:`, dadosAntigos ? `${JSON.parse(dadosAntigos).length} reclamações` : 'vazio');
    
    // Usar o novo sistema de armazenamento
    if (window.armazenamentoReclamacoes) {
        fichasChatbot = await window.armazenamentoReclamacoes.carregarTodos('chatbot');
        console.log('✅ Fichas carregadas via sistema:', fichasChatbot.length);
        if (fichasChatbot.length > 0) {
            console.log('📋 IDs:', fichasChatbot.map(f => f.id).join(', '));
            console.log('📋 Primeira ficha:', fichasChatbot[0]);
        }
    } else {
        console.error('❌ Sistema de armazenamento não encontrado!');
        console.error('🔍 Tentando carregar diretamente do localStorage...');
        // Fallback: tentar carregar diretamente
        try {
            const dados = dadosNovos || dadosAntigos;
            if (dados) {
                fichasChatbot = JSON.parse(dados);
                console.log('✅ Carregado do localStorage (fallback):', fichasChatbot.length);
            } else {
                fichasChatbot = [];
                console.log('📦 Nenhum dado encontrado no localStorage');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
            fichasChatbot = [];
        }
    }
    
    // Garantir que é um array
    if (!Array.isArray(fichasChatbot)) {
        console.warn('⚠️ fichasChatbot não é um array, convertendo...');
        fichasChatbot = [];
    }
    
    // Verificar novamente após carregar
    const verificacaoFinal = localStorage.getItem(chaveNova);
    if (verificacaoFinal) {
        const dadosFinais = JSON.parse(verificacaoFinal);
        console.log('🔍 Verificação final no localStorage:', dadosFinais.length, 'reclamações');
        if (dadosFinais.length !== fichasChatbot.length) {
            console.warn('⚠️ DISCREPÂNCIA: localStorage tem', dadosFinais.length, 'mas fichasChatbot tem', fichasChatbot.length);
            // Sincronizar
            fichasChatbot = dadosFinais;
            console.log('✅ Sincronizado com localStorage');
        }
    }
    
    console.log('📋 Total final de fichas:', fichasChatbot.length);
    return fichasChatbot;
}

// === FORMULÁRIO ===
function configurarEventosChatbot() {
    const form = document.getElementById('form-chatbot');
    if (form) {
        form.addEventListener('submit', handleSubmitChatbot);
    }
    
    const busca = document.getElementById('busca-chatbot');
    if (busca) {
        busca.addEventListener('input', renderizarListaChatbot);
    }
    
    const filtroStatus = document.getElementById('filtro-status-chatbot');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', renderizarListaChatbot);
    }
    
    const filtroCanal = document.getElementById('filtro-canal-chatbot');
    if (filtroCanal) {
        filtroCanal.addEventListener('change', renderizarListaChatbot);
    }
    
    const cpf = document.getElementById('chatbot-cpf');
    if (cpf) {
        cpf.addEventListener('input', formatCPF);
    }
    
    const telefone = document.getElementById('chatbot-telefone');
    if (telefone) {
        telefone.addEventListener('input', formatPhone);
    }
}

// Função auxiliar para obter valor de campo de forma segura
function obterValorCampoChatbot(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value : '';
}

// Função auxiliar para obter checkbox de forma segura
function obterCheckboxChatbot(id) {
    const campo = document.getElementById(id);
    return campo ? campo.checked : false;
}

function handleSubmitChatbot(e) {
    e.preventDefault();
    console.log('🚀 handleSubmitChatbot chamado');
    
    try {
        // Obter anexos
        const anexos = window.gerenciadorAnexos ? 
            window.gerenciadorAnexos.obterAnexosDoFormulario('anexos-preview-chatbot') : [];
        console.log('📎 Anexos coletados:', anexos.length);
        
        // Coletar dataClienteChatbot diretamente do campo
        const campoDataCliente = document.getElementById('chatbot-data-cliente');
        const dataClienteChatbot = campoDataCliente ? campoDataCliente.value : '';
        console.log('📅 Data Cliente Chatbot coletada:', dataClienteChatbot);
        console.log('📅 Campo existe?', campoDataCliente !== null);
        console.log('📅 Valor direto do campo:', campoDataCliente?.value);
        console.log('📅 Tipo do valor:', typeof dataClienteChatbot);
        console.log('📅 Valor após trim:', dataClienteChatbot.trim());
    
        // Gerar ID usando o sistema de armazenamento
        const id = window.armazenamentoReclamacoes ? 
            window.armazenamentoReclamacoes.gerarId() : 
            `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const ficha = {
            id: id,
            tipoDemanda: 'chatbot',
            dataClienteChatbot: dataClienteChatbot,
            responsavel: window.sistemaPerfis?.usuarioAtual?.nome || window.sistemaPerfis?.usuarioAtual?.email || 'Sistema',
            nomeCompleto: obterValorCampoChatbot('chatbot-nome') || '',
            cpf: obterValorCampoChatbot('chatbot-cpf'),
            origem: obterValorCampoChatbot('chatbot-origem') || 'Atendimento',
            telefone: obterValorCampoChatbot('chatbot-telefone') || '',
            notaAvaliacao: obterValorCampoChatbot('chatbot-nota-avaliacao'),
            avaliacaoCliente: obterValorCampoChatbot('chatbot-avaliacao-cliente'),
            produto: obterValorCampoChatbot('chatbot-produto'),
            motivo: obterValorCampoChatbot('chatbot-motivo'),
            respostaBot: document.querySelector('input[name="chatbot-resposta-bot"]:checked')?.value || '',
            pixStatus: obterValorCampoChatbot('chatbot-pix-status'),
            enviarCobranca: document.querySelector('input[name="chatbot-enviar-cobranca"]:checked')?.value || 'Não',
            casosCriticos: obterCheckboxChatbot('chatbot-casos-criticos'),
            observacoes: obterValorCampoChatbot('chatbot-observacoes'),
            anexos: anexos, // Incluir anexos
            status: obterValorCampoChatbot('chatbot-status') || 'nao-iniciado', // Status padrão
            canalChatbot: obterValorCampoChatbot('chatbot-canal') || '', // Canal do chatbot
            dataCriacao: new Date().toISOString()
        };
        
        console.log('📋 Ficha coletada:', ficha);
        
        // Validar
        console.log('✅ Validando ficha...');
        if (!validarFichaChatbot(ficha)) {
            console.error('❌ Validação falhou');
            return;
        }
        console.log('✅ Validação passou');
        
        // Salvar usando o novo sistema
        console.log('💾 Salvando reclamação...');
        
        if (!window.armazenamentoReclamacoes) {
            console.error('❌ Sistema de armazenamento não encontrado!');
            mostrarAlerta('Erro ao salvar: sistema de armazenamento não disponível', 'error');
            return;
        }
        
        // Salvar usando o novo sistema (assíncrono)
        const sucesso = await window.armazenamentoReclamacoes.salvar('chatbot', ficha);
        
        if (!sucesso) {
            console.error('❌ Erro ao salvar reclamação');
            mostrarAlerta('Erro ao salvar reclamação', 'error');
            return;
        }
        
        console.log('✅ Reclamação salva com sucesso!');
        
        // RECARREGAR IMEDIATAMENTE (síncrono)
        carregarFichasChatbot();
        console.log('📋 Fichas recarregadas:', fichasChatbot.length);
        console.log('📋 Última ficha salva:', fichasChatbot[fichasChatbot.length - 1]);
        console.log('📋 Ficha salva está no array?', fichasChatbot.find(f => f.id === ficha.id) ? 'Sim' : 'Não');
        
        // Limpar formulário
        console.log('🧹 Limpando formulário...');
        limparFormChatbot();
        
        // Atualizar dashboard e listas IMEDIATAMENTE
        atualizarDashboardChatbot();
        renderizarListaChatbot();
        
        // Atualizar "Minhas Reclamações" se a seção estiver visível
        const secaoMinhas = document.getElementById('minhas-reclamacoes-chatbot');
        if (secaoMinhas && secaoMinhas.classList.contains('active')) {
            renderizarMinhasReclamacoesChatbot();
        }
        
        // Mostrar lista
        mostrarSecao('lista-chatbot');
        
        // Disparar evento para atualizar home e relatórios
        if (typeof window !== 'undefined') {
            const evento = new CustomEvent('reclamacaoSalva', {
                detail: { tipo: 'chatbot', reclamacao: ficha, total: fichasChatbot.length }
            });
            window.dispatchEvent(evento);
            console.log('📢 Evento reclamacaoSalva disparado do chatbot-page');
        }
        
        // Mostrar sucesso
        mostrarAlerta('Reclamação Chatbot salva com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao processar submit:', error);
        mostrarAlerta('Erro ao salvar reclamação: ' + error.message, 'error');
    }
}

function validarFichaChatbot(ficha) {
    console.log('🔍 Validando ficha Chatbot:', ficha);
    
    // Campos obrigatórios do Chatbot - APENAS OS QUE EXISTEM NO HTML
    // Verificando campos que realmente existem no formulário
    const camposObrigatorios = [
        { nome: 'dataClienteChatbot', label: 'Data do cliente com o chatbot' },
        { nome: 'cpf', label: 'CPF' },
        { nome: 'responsavel', label: 'Responsável' },
        { nome: 'nomeCompleto', label: 'Nome Completo' },
        { nome: 'enviarCobranca', label: 'Enviar para cobrança?', tipo: 'radio' }
    ];
    
    for (let campo of camposObrigatorios) {
        const valor = ficha[campo.nome];
        console.log(`🔍 Validando campo ${campo.nome}:`, valor, 'Tipo:', typeof valor);
        
        // Verificar se é radio button
        if (campo.tipo === 'radio') {
            if (!valor || valor.trim() === '') {
                mostrarAlerta(`Campo obrigatório não preenchido: ${campo.label}`, 'error');
                return false;
            }
        } else {
            // Para campos de texto/data, verificar se tem valor
            const estaVazio = !valor || (typeof valor === 'string' && valor.trim() === '');
            if (estaVazio) {
                mostrarAlerta(`Campo obrigatório não preenchido: ${campo.label}`, 'error');
                return false;
            }
        }
    }
    
    if (!validarCPF(ficha.cpf)) {
        mostrarAlerta('CPF inválido', 'error');
        return false;
    }
    
    return true;
}

// === DASHBOARD ===
function atualizarDashboardChatbot() {
    carregarFichasChatbot();
    
    const total = fichasChatbot.length;
    const resolvidasAuto = fichasChatbot.filter(f => f.resolvidoAutomaticamente).length;
    const encaminhadas = fichasChatbot.filter(f => f.encaminhadoHumano).length;
    
    // Calcular média de satisfação - usar notaAvaliacao (campo correto)
    const fichasComNota = fichasChatbot.filter(f => {
        const nota = parseInt(f.notaAvaliacao || f.satisfacao || 0);
        return nota > 0 && nota <= 5;
    });
    
    console.log('📊 Fichas com nota de avaliação:', fichasComNota.length);
    console.log('📊 Notas:', fichasComNota.map(f => ({
        id: f.id,
        notaAvaliacao: f.notaAvaliacao,
        satisfacao: f.satisfacao
    })));
    
    const satisfacoes = fichasComNota.map(f => parseInt(f.notaAvaliacao || f.satisfacao || 0));
    const mediaSatisfacao = satisfacoes.length > 0 
        ? (satisfacoes.reduce((a, b) => a + b, 0) / satisfacoes.length).toFixed(1)
        : '0.0';
    const taxaSatisfacao = satisfacoes.length > 0 
        ? ((satisfacoes.filter(s => s >= 4).length / satisfacoes.length) * 100).toFixed(1)
        : '0.0';
    
    console.log('📊 Média de satisfação calculada:', mediaSatisfacao);
    console.log('📊 Taxa de satisfação calculada:', taxaSatisfacao + '%');
    
    atualizarElemento('chatbot-total-dash', total);
    atualizarElemento('chatbot-auto-resolvidas', resolvidasAuto);
    atualizarElemento('chatbot-encaminhadas', encaminhadas);
    atualizarElemento('chatbot-satisfacao', `${taxaSatisfacao}%`);
    
    // Métricas específicas
    const taxaAuto = total > 0 ? ((resolvidasAuto / total) * 100).toFixed(1) : 0;
    atualizarElemento('taxa-auto-chatbot', `${taxaAuto}%`);
    
    // Canal mais usado
    const canais = {};
    fichasChatbot.forEach(f => {
        if (f.canalChatbot) {
            canais[f.canalChatbot] = (canais[f.canalChatbot] || 0) + 1;
        }
    });
    const canalMaisUsado = Object.keys(canais).reduce((a, b) => 
        canais[a] > canais[b] ? a : b, 'N/A');
    atualizarElemento('canal-mais-usado', canalMaisUsado);
    
    atualizarElemento('media-satisfacao', mediaSatisfacao);
    
    // Adicionar event listeners aos cards
    configurarCardsDashboardChatbot();
}

// Configurar cliques nos cards do dashboard Chatbot
function configurarCardsDashboardChatbot() {
    // Card Total
    const cardTotal = document.querySelector('#chatbot-total-dash')?.closest('.stat-card');
    if (cardTotal) {
        cardTotal.style.cursor = 'pointer';
        cardTotal.onclick = () => mostrarCasosDashboardChatbot('total');
    }
    
    // Card Resolvidas Automaticamente
    const cardAuto = document.querySelector('#chatbot-auto-resolvidas')?.closest('.stat-card');
    if (cardAuto) {
        cardAuto.style.cursor = 'pointer';
        cardAuto.onclick = () => mostrarCasosDashboardChatbot('auto-resolvidas');
    }
    
    // Card Encaminhadas
    const cardEncaminhadas = document.querySelector('#chatbot-encaminhadas')?.closest('.stat-card');
    if (cardEncaminhadas) {
        cardEncaminhadas.style.cursor = 'pointer';
        cardEncaminhadas.onclick = () => mostrarCasosDashboardChatbot('encaminhadas');
    }
    
    // Card Satisfação (não clicável, apenas informativo)
}

// Mostrar casos relacionados ao card clicado Chatbot
function mostrarCasosDashboardChatbot(tipo) {
    console.log('🔍 Mostrando casos do dashboard Chatbot - tipo:', tipo);
    
    // Garantir que fichasChatbot está carregado
    if (!fichasChatbot || fichasChatbot.length === 0) {
        console.warn('⚠️ Nenhuma ficha Chatbot carregada, tentando carregar...');
        carregarFichasChatbot();
    }
    
    let filtradas = [];
    let titulo = '';
    
    switch(tipo) {
        case 'total':
            filtradas = fichasChatbot;
            titulo = 'Total de Reclamações Chatbot';
            break;
        case 'auto-resolvidas':
            filtradas = fichasChatbot.filter(f => f.resolvidoAutomaticamente);
            titulo = 'Reclamações Resolvidas Automaticamente';
            break;
        case 'encaminhadas':
            filtradas = fichasChatbot.filter(f => f.encaminhadoHumano);
            titulo = 'Reclamações Encaminhadas para Humano';
            break;
    }
    
    console.log('📋 Casos filtrados Chatbot:', filtradas.length);
    
    if (filtradas.length === 0) {
        mostrarAlerta(`Nenhuma reclamação encontrada para "${titulo}"`, 'info');
        return;
    }
    
    // Garantir que fichasChatbot está carregado
    if (!fichasChatbot || fichasChatbot.length === 0) {
        console.warn('⚠️ Nenhuma ficha Chatbot carregada, tentando carregar...');
        carregarFichasChatbot();
        // Recarregar filtradas após carregar
        switch(tipo) {
            case 'total':
                filtradas = fichasChatbot;
                break;
            case 'auto-resolvidas':
                filtradas = fichasChatbot.filter(f => f.resolvidoAutomaticamente);
                break;
            case 'encaminhadas':
                filtradas = fichasChatbot.filter(f => f.encaminhadoHumano);
                break;
        }
    }
    
    // Criar sidebar com os casos
    if (window.criarModalCasosDashboard) {
        window.criarModalCasosDashboard(titulo, filtradas, 'chatbot');
    } else {
        console.error('❌ Função criarModalCasosDashboard não encontrada, criando...');
        // Criar função se não existir
        criarSidebarCasosDashboard(titulo, filtradas, 'chatbot');
    }
}

// Função para criar sidebar de casos do dashboard (fallback se não estiver no bacen-page.js)
function criarSidebarCasosDashboard(titulo, casos, tipo) {
    // Remover sidebar existente se houver
    const sidebarExistente = document.getElementById('sidebar-casos-dashboard');
    if (sidebarExistente) {
        sidebarExistente.remove();
    }
    
    // Criar sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar-casos-dashboard';
    sidebar.className = 'sidebar-casos-dashboard';
    
    // Função para criar card baseado no tipo
    const criarCard = (f) => {
        if (tipo === 'chatbot') {
            // Tentar usar função global ou local
            if (typeof criarCardChatbot === 'function') {
                return criarCardChatbot(f);
            } else if (window.criarCardChatbot) {
                return window.criarCardChatbot(f);
            }
        }
        // Fallback: criar card básico
        return `<div class="ficha-card">Ficha ${f.id || 'N/A'}</div>`;
    };
    
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <h3>${titulo}</h3>
            <button class="btn-fechar-sidebar" onclick="fecharSidebarCasosDashboard()">✕</button>
        </div>
        <div class="sidebar-info">
            <p><strong>Total:</strong> ${casos.length} caso(s)</p>
        </div>
        <div class="sidebar-content" id="conteudo-casos-dashboard">
            ${casos.map(f => criarCard(f)).join('')}
        </div>
    `;
    
    document.body.appendChild(sidebar);
    
    // Abrir sidebar com animação
    setTimeout(() => {
        sidebar.classList.add('aberta');
    }, 10);
}

// Função global para fechar sidebar
if (!window.fecharSidebarCasosDashboard) {
    window.fecharSidebarCasosDashboard = function fecharSidebarCasosDashboard() {
        const sidebar = document.getElementById('sidebar-casos-dashboard');
        if (sidebar) {
            sidebar.classList.remove('aberta');
            setTimeout(() => {
                sidebar.remove();
            }, 300);
        }
    };
}

// === LISTA ===
function renderizarListaChatbot() {
    console.log('🎨 renderizarListaChatbot() chamado');
    const container = document.getElementById('lista-fichas-chatbot');
    if (!container) {
        console.error('❌ Container lista-fichas-chatbot não encontrado!');
        console.error('🔍 Elementos disponíveis:', Array.from(document.querySelectorAll('[id*="lista"]')).map(e => e.id));
        return;
    }
    
    console.log('✅ Container encontrado:', container);
    
    // SEMPRE recarregar as fichas antes de renderizar para garantir que temos os dados mais recentes
    console.log('🔄 Recarregando fichas antes de renderizar lista...');
    carregarFichasChatbot();
    
    // Verificar novamente após carregar
    if (!fichasChatbot || !Array.isArray(fichasChatbot)) {
        console.error('❌ fichasChatbot não é um array válido após carregamento');
        fichasChatbot = [];
    }

    console.log('📋 Renderizando lista Chatbot geral com', fichasChatbot.length, 'fichas');
    if (fichasChatbot.length > 0) {
        console.log('📋 Primeiras 3 fichas:', fichasChatbot.slice(0, 3).map(f => ({ id: f.id, nome: f.nomeCompleto, status: f.status })));
    }
    
    const busca = document.getElementById('busca-chatbot')?.value.toLowerCase() || '';
    let filtroStatus = document.getElementById('filtro-status-chatbot')?.value || '';
    let filtroCanal = document.getElementById('filtro-canal-chatbot')?.value || '';
    
    // Tratar "todos" como vazio (alguns selects podem retornar "todos" em vez de "")
    if (filtroStatus.toLowerCase() === 'todos' || filtroStatus === '') {
        filtroStatus = '';
    }
    if (filtroCanal.toLowerCase() === 'todos' || filtroCanal === '') {
        filtroCanal = '';
    }
    
    console.log('🔍 Filtros aplicados:', { busca, filtroStatus, filtroCanal });
    console.log('📋 Primeira ficha completa:', fichasChatbot.length > 0 ? fichasChatbot[0] : 'Nenhuma');
    
    // NÃO FILTRAR POR USUÁRIO NA LISTA GERAL - mostrar TODAS as reclamações de TODOS os agentes
    let filtradas = [...(fichasChatbot || [])]; // Criar cópia para não modificar o array original
    console.log('📋 Fichas antes dos filtros:', filtradas.length);
    
    if (busca) {
        // Normalizar busca (remover formatação de CPF)
        const buscaNormalizada = busca.replace(/\D/g, ''); // Remove tudo que não é dígito
        const buscaLower = busca.toLowerCase();
        
        filtradas = filtradas.filter(f => {
            const nome = (f.nomeCompleto || f.nomeCliente || '').toLowerCase();
            const motivo = (f.motivoReduzido || '').toLowerCase();
            const id = (f.id || '').toLowerCase();
            
            // Para CPF, comparar tanto formatado quanto sem formatação
            const cpfFormatado = (f.cpf || '').toLowerCase();
            const cpfSemFormatacao = (f.cpf || '').replace(/\D/g, '');
            
            // Busca por nome, motivo ou ID (texto normal)
            const matchTexto = nome.includes(buscaLower) || motivo.includes(buscaLower) || id.includes(buscaLower);
            
            // Busca por CPF (com ou sem formatação)
            const matchCPF = buscaNormalizada.length > 0 && (
                cpfFormatado.includes(buscaLower) || 
                cpfSemFormatacao.includes(buscaNormalizada) ||
                (buscaNormalizada.length >= 3 && cpfSemFormatacao.startsWith(buscaNormalizada))
            );
            
            return matchTexto || matchCPF;
        });
    }
    
    if (filtroStatus && filtroStatus.trim() !== '') {
        const antesStatus = filtradas.length;
        filtradas = filtradas.filter(f => {
            const statusFicha = (f.status || '').toString().toLowerCase().trim();
            const statusFiltro = filtroStatus.toLowerCase().trim();
            const match = statusFicha === statusFiltro;
            if (!match && antesStatus <= 5) {
                console.log(`❌ Ficha ${f.id} não passou no filtro de status: "${statusFicha}" !== "${statusFiltro}"`);
            }
            return match;
        });
        console.log(`🔍 Filtro de status: ${antesStatus} -> ${filtradas.length}`);
    }
    
    if (filtroCanal && filtroCanal.trim() !== '') {
        const antesCanal = filtradas.length;
        filtradas = filtradas.filter(f => {
            const canalFicha = (f.canalChatbot || f.canal || '').toString().toLowerCase().trim();
            const canalFiltro = filtroCanal.toLowerCase().trim();
            const match = canalFicha === canalFiltro;
            if (!match && antesCanal <= 5) {
                console.log(`❌ Ficha ${f.id} não passou no filtro de canal: "${canalFicha}" !== "${canalFiltro}"`);
            }
            return match;
        });
        console.log(`🔍 Filtro de canal: ${antesCanal} -> ${filtradas.length}`);
    }
    
    console.log('📋 Fichas após todos os filtros:', filtradas.length);
    
    if (filtradas.length === 0) {
        if (fichasChatbot.length === 0) {
            container.innerHTML = '<div class="no-results">Nenhuma reclamação Chatbot cadastrada ainda</div>';
            console.log('📭 Nenhuma reclamação cadastrada');
        } else {
            container.innerHTML = '<div class="no-results">Nenhuma reclamação Chatbot encontrada com os filtros aplicados</div>';
            console.log('🔍 Nenhuma reclamação encontrada com os filtros. Total disponível:', fichasChatbot.length);
        }
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    filtradas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataClienteChatbot || 0);
        const dataB = new Date(b.dataCriacao || b.dataClienteChatbot || 0);
        return dataB - dataA;
    });
    
    // Verificar se a função criarCardChatbot existe
    if (typeof criarCardChatbot !== 'function' && typeof window.criarCardChatbot !== 'function') {
        console.error('❌ Função criarCardChatbot não encontrada!');
        container.innerHTML = '<div class="no-results">Erro: função de criação de cards não encontrada</div>';
        return;
    }
    
    const criarCard = typeof criarCardChatbot === 'function' ? criarCardChatbot : window.criarCardChatbot;
    
    try {
        console.log('📋 Renderizando', filtradas.length, 'reclamações filtradas');
        container.innerHTML = filtradas.map(f => criarCard(f)).join('');
        console.log('✅ Lista Chatbot renderizada com sucesso! Total de cards:', filtradas.length);
    } catch (error) {
        console.error('❌ Erro ao renderizar cards:', error);
        container.innerHTML = `<div class="no-results">Erro ao renderizar lista: ${error.message}</div>`;
    }
}

// Renderizar "Minhas Reclamações"
function renderizarMinhasReclamacoesChatbot() {
    console.log('🎨 renderizarMinhasReclamacoesChatbot() chamado');
    const container = document.getElementById('minhas-fichas-chatbot');
    if (!container) {
        console.error('❌ Container minhas-fichas-chatbot não encontrado!');
        console.error('🔍 Elementos disponíveis:', Array.from(document.querySelectorAll('[id*="minhas"]')).map(e => e.id));
        return;
    }
    
    console.log('✅ Container encontrado:', container);
    
    // SEMPRE recarregar as fichas antes de renderizar
    console.log('🔄 Recarregando fichas antes de renderizar minhas reclamações...');
    carregarFichasChatbot();
    
    // Verificar novamente após carregar
    if (!fichasChatbot || !Array.isArray(fichasChatbot)) {
        console.warn('⚠️ fichasChatbot não é um array válido, inicializando...');
        fichasChatbot = [];
    }
    
    console.log('📋 Total de fichas disponíveis:', fichasChatbot.length);
    
    const usuarioAtual = window.sistemaPerfis?.usuarioAtual;
    if (!usuarioAtual) {
        console.warn('⚠️ Usuário não logado');
        container.innerHTML = '<div class="no-results">Você precisa estar logado para ver suas reclamações</div>';
        return;
    }
    
    console.log('👤 Usuário atual:', usuarioAtual);
    console.log('📋 Total de fichas Chatbot disponíveis:', fichasChatbot.length);
    
    const responsavelAtual = usuarioAtual.nome || usuarioAtual.email;
    const emailAtual = usuarioAtual.email || '';
    
    // Filtrar apenas reclamações do usuário logado
    const minhasFichas = fichasChatbot.filter(f => {
        const responsavelFicha = (f.responsavel || '').toString().toLowerCase().trim();
        const nomeAtual = (responsavelAtual || '').toString().toLowerCase().trim();
        const emailAtualLower = (emailAtual || '').toString().toLowerCase().trim();
        
        const match = responsavelFicha === nomeAtual || 
                      responsavelFicha === emailAtualLower ||
                      responsavelFicha === (usuarioAtual.nome || '').toString().toLowerCase().trim() ||
                      responsavelFicha.includes(nomeAtual) ||
                      responsavelFicha.includes(emailAtualLower);
        
        if (match) {
            console.log('✅ Match encontrado:', f.id, 'Responsável:', f.responsavel, 'vs', nomeAtual);
        }
        
        return match;
    });
    
    console.log('📋 Minhas fichas Chatbot encontradas:', minhasFichas.length);
    
    if (minhasFichas.length === 0) {
        container.innerHTML = '<div class="no-results">Você não possui reclamações atribuídas</div>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    minhasFichas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataClienteChatbot || 0);
        const dataB = new Date(b.dataCriacao || b.dataClienteChatbot || 0);
        return dataB - dataA;
    });
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${minhasFichas.length}</div>
                <div class="stat-label">Total de Reclamações</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${minhasFichas.filter(f => f.status === 'em-tratativa').length}</div>
                <div class="stat-label">Em Tratativa</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${minhasFichas.filter(f => f.status === 'concluido').length}</div>
                <div class="stat-label">Concluídas</div>
            </div>
        </div>
        <div class="fichas-list">
            ${minhasFichas.map(f => {
                const criarCard = typeof criarCardChatbot === 'function' ? criarCardChatbot : (window.criarCardChatbot || (() => `<div class="ficha-card">Ficha ${f.id || 'N/A'}</div>`));
                return criarCard(f);
            }).join('')}
        </div>
    `;
}

// Tornar função global para uso no modal
window.criarCardChatbot = function criarCardChatbot(ficha) {
    const statusLabels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
        'respondido': 'Respondido'
    };
    
    const canalLabels = {
        'whatsapp': '📱 WhatsApp',
        'telegram': '✈️ Telegram',
        'site': '🌐 Site',
        'app': '📲 App',
        'outro': '🔗 Outro'
    };
    
    const statusClass = `status-${ficha.status}`;
    const statusLabel = statusLabels[ficha.status] || ficha.status;
    const canalLabel = canalLabels[ficha.canalChatbot] || ficha.canalChatbot;
    
    let badges = `<span class="chatbot-badge">🤖 Chatbot</span>`;
    if (ficha.resolvidoAutomaticamente) {
        badges += '<span style="background: #1DFDB9; color: #000058; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">✅ Auto</span>';
    }
    if (ficha.encaminhadoHumano) {
        badges += '<span style="background: #1634FF; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">👤 Humano</span>';
    }
    if (ficha.satisfacao) {
        const estrelas = '⭐'.repeat(parseInt(ficha.satisfacao));
        badges += `<span style="background: #1634FF; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">${estrelas}</span>`;
    }
    
    return `
        <div class="complaint-item" onclick="abrirFichaChatbot('${ficha.id}')">
            <div class="complaint-header">
                <div class="complaint-title">
                    ${ficha.nomeCompleto || ficha.nomeCliente || 'Nome não informado'}
                    ${badges}
                </div>
                <div class="complaint-status ${statusClass}">${statusLabel}</div>
            </div>
            <div class="complaint-summary">
                <div class="complaint-detail"><strong>CPF:</strong> ${ficha.cpf}</div>
                <div class="complaint-detail"><strong>Motivo:</strong> ${ficha.motivoReduzido}</div>
                <div class="complaint-detail"><strong>Canal:</strong> ${canalLabel}</div>
                <div class="complaint-detail"><strong>Prazo Resposta:</strong> ${formatarData(ficha.prazoResposta)}</div>
                <div class="complaint-detail"><strong>Responsável:</strong> ${ficha.responsavel}</div>
            </div>
        </div>
    `;
}

function abrirFichaChatbot(id) {
    const ficha = fichasChatbot.find(f => f.id === id);
    if (!ficha) {
        mostrarAlerta('Ficha não encontrada', 'error');
        return;
    }
    
    // Usa o sistema de fichas específicas
    if (window.fichasEspecificas) {
        window.fichasEspecificas.abrirFicha(ficha);
    } else if (window.FichasEspecificas) {
        window.fichasEspecificas = new FichasEspecificas();
        window.fichasEspecificas.abrirFicha(ficha);
    } else {
        setTimeout(() => {
            if (window.FichasEspecificas) {
                window.fichasEspecificas = new FichasEspecificas();
                window.fichasEspecificas.abrirFicha(ficha);
            } else {
                mostrarAlerta('Sistema de fichas não disponível. Recarregue a página.', 'error');
            }
        }, 200);
    }
}

// === RELATÓRIOS ===
function gerarRelatorioPeriodoChatbot() {
    // RECARREGAR fichas ANTES de gerar relatório - DIRETAMENTE do sistema
    console.log('📦 Carregando fichas antes de gerar relatório por período...');
    
    // Carregar diretamente do sistema de armazenamento
    let fichasParaRelatorio = [];
    if (window.armazenamentoReclamacoes) {
        fichasParaRelatorio = window.armazenamentoReclamacoes.carregarTodos('chatbot');
        console.log('📋 Fichas carregadas do sistema:', fichasParaRelatorio.length);
    } else {
        const dados = localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot');
        if (dados) {
            fichasParaRelatorio = JSON.parse(dados);
        }
    }
    
    // Atualizar variável global
    fichasChatbot = fichasParaRelatorio;
    
    mostrarModalPeriodo((inicio, fim) => {
        if (!inicio || !fim) return;
        
        const inicioDate = parseDate(inicio);
        const fimDate = parseDate(fim);
        
        if (!inicioDate || !fimDate || isNaN(inicioDate.getTime()) || isNaN(fimDate.getTime())) {
            mostrarAlerta('Datas inválidas. Use o formato DD/MM/AAAA', 'erro');
            return;
        }
        
        if (inicioDate > fimDate) {
            mostrarAlerta('A data inicial não pode ser maior que a data final', 'erro');
            return;
        }
        
        const filtradas = fichasParaRelatorio.filter(f => {
            const data = new Date(f.dataCriacao || f.dataClienteChatbot || f.dataEntrada);
            return data >= inicioDate && data <= fimDate;
        });
        
        console.log('📋 Fichas no período:', filtradas.length);
        mostrarRelatorioChatbot('Relatório por Período - Chatbot', filtradas, `Período: ${inicio} a ${fim}`);
    });
}

function gerarRelatorioAutoChatbot() {
    // RECARREGAR fichas ANTES de gerar relatório - DIRETAMENTE do sistema
    console.log('📦 Carregando fichas antes de gerar relatório de auto-resolução...');
    
    // Carregar diretamente do sistema de armazenamento
    let fichasParaRelatorio = [];
    if (window.armazenamentoReclamacoes) {
        fichasParaRelatorio = window.armazenamentoReclamacoes.carregarTodos('chatbot');
        console.log('📋 Fichas carregadas do sistema:', fichasParaRelatorio.length);
    } else {
        const dados = localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot');
        if (dados) {
            fichasParaRelatorio = JSON.parse(dados);
        }
    }
    
    // Atualizar variável global
    fichasChatbot = fichasParaRelatorio;
    
    const auto = fichasParaRelatorio.filter(f => f.resolvidoAutomaticamente);
    console.log('📋 Fichas auto-resolvidas:', auto.length);
    mostrarRelatorioChatbot('Relatório de Resolução Automática - Chatbot', auto, 
        `${auto.length} fichas resolvidas automaticamente`);
}

function gerarRelatorioSatisfacaoChatbot() {
    // RECARREGAR fichas ANTES de gerar relatório - DIRETAMENTE do sistema
    console.log('📦 Carregando fichas antes de gerar relatório de satisfação...');
    
    // Carregar diretamente do sistema de armazenamento
    let fichasParaRelatorio = [];
    if (window.armazenamentoReclamacoes) {
        fichasParaRelatorio = window.armazenamentoReclamacoes.carregarTodos('chatbot');
        console.log('📋 Fichas carregadas do sistema:', fichasParaRelatorio.length);
    } else {
        const dados = localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot');
        if (dados) {
            fichasParaRelatorio = JSON.parse(dados);
        }
    }
    
    // Atualizar variável global
    fichasChatbot = fichasParaRelatorio;
    
    console.log('📋 Total de fichas carregadas:', fichasParaRelatorio.length);
    console.log('📋 Primeiras 3 fichas:', fichasParaRelatorio.slice(0, 3).map(f => ({ 
        id: f.id, 
        nome: f.nomeCompleto, 
        nota: f.notaAvaliacao,
        avaliacao: f.avaliacaoCliente
    })));
    
    // Buscar por notaAvaliacao ou avaliacaoCliente
    const comSatisfacao = fichasParaRelatorio.filter(f => {
        const temNota = f.notaAvaliacao && f.notaAvaliacao !== '' && f.notaAvaliacao !== '0';
        const temAvaliacao = f.avaliacaoCliente && f.avaliacaoCliente !== '';
        return temNota || temAvaliacao;
    });
    
    console.log('📊 Fichas com satisfação:', comSatisfacao.length);
    console.log('📊 Detalhes:', comSatisfacao.map(f => ({
        id: f.id,
        nota: f.notaAvaliacao,
        avaliacao: f.avaliacaoCliente
    })));
    
    // Calcular média apenas das que têm nota numérica
    const comNota = comSatisfacao.filter(f => {
        const nota = parseInt(f.notaAvaliacao || 0);
        return nota > 0 && nota <= 5;
    });
    
    const media = comNota.length > 0 
        ? (comNota.reduce((s, f) => s + parseInt(f.notaAvaliacao || 0), 0) / comNota.length).toFixed(1)
        : 0;
    
    if (comSatisfacao.length === 0) {
        mostrarAlerta('Nenhuma avaliação de satisfação encontrada', 'info');
        return;
    }
    
    mostrarRelatorioSatisfacao('Relatório de Satisfação - Chatbot', comSatisfacao, 
        `Média de satisfação: ${media}/5 (${comNota.length} avaliações com nota, ${comSatisfacao.length} total)`);
}

function gerarRelatorioCompletoChatbot() {
    // RECARREGAR fichas ANTES de gerar relatório - DIRETAMENTE do sistema
    console.log('📦 Carregando fichas antes de gerar relatório completo...');
    
    // Carregar diretamente do sistema de armazenamento (não confiar na variável global)
    let fichasParaRelatorio = [];
    if (window.armazenamentoReclamacoes) {
        fichasParaRelatorio = window.armazenamentoReclamacoes.carregarTodos('chatbot');
        console.log('📋 Fichas carregadas do sistema:', fichasParaRelatorio.length);
        console.log('📋 IDs:', fichasParaRelatorio.map(f => f.id).join(', '));
    } else {
        // Fallback
        const dados = localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot');
        if (dados) {
            fichasParaRelatorio = JSON.parse(dados);
            console.log('📋 Fichas carregadas do localStorage (fallback):', fichasParaRelatorio.length);
        }
    }
    
    // Atualizar variável global também
    fichasChatbot = fichasParaRelatorio;
    
    console.log('📋 Total de fichas para relatório:', fichasParaRelatorio.length);
    mostrarRelatorioChatbot('Relatório Completo - Chatbot', fichasParaRelatorio, 
        `Total: ${fichasParaRelatorio.length} fichas`);
}

function mostrarRelatorioChatbot(titulo, dados, subtitulo) {
    const container = document.getElementById('conteudo-relatorio-chatbot');
    if (!container) return;
    
    console.log('📊 Gerando relatório com', dados.length, 'registros');
    console.log('📊 Primeira ficha:', dados[0] ? Object.keys(dados[0]) : 'nenhuma');
    
    container.style.display = 'block';
    container.innerHTML = `
        <h3>${titulo}</h3>
        <p>${subtitulo}</p>
        <div class="report-table">
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>CPF</th>
                        <th>Canal</th>
                        <th>Data Cliente</th>
                        <th>Produto</th>
                        <th>Motivo</th>
                        <th>Resolvido Auto</th>
                        <th>Encaminhado</th>
                        <th>Nota Avaliação</th>
                        <th>Avaliação Cliente</th>
                        <th>Status</th>
                        <th>Responsável</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(f => `
                        <tr>
                            <td>${f.nomeCompleto || f.nomeCliente || '-'}</td>
                            <td>${f.cpf || '-'}</td>
                            <td>${f.canalChatbot || '-'}</td>
                            <td>${f.dataClienteChatbot ? new Date(f.dataClienteChatbot).toLocaleDateString('pt-BR') : '-'}</td>
                            <td>${f.produto || '-'}</td>
                            <td>${f.motivo || f.motivoReduzido || '-'}</td>
                            <td>${f.resolvidoAutomaticamente ? 'Sim' : 'Não'}</td>
                            <td>${f.encaminhadoHumano ? 'Sim' : 'Não'}</td>
                            <td>${f.notaAvaliacao ? '⭐'.repeat(parseInt(f.notaAvaliacao)) + ' (' + f.notaAvaliacao + ')' : '-'}</td>
                            <td>${f.avaliacaoCliente || '-'}</td>
                            <td>${f.status || '-'}</td>
                            <td>${f.responsavel || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
                    <button class="velohub-btn" onclick="filtrosExportacaoCSVChatbot.mostrarModalFiltros(${JSON.stringify(dados).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}, exportarRelatorioChatbotDados)">📥 Exportar CSV com Filtros</button>
                    <button class="velohub-btn" onclick="exportarParaExcel(${JSON.stringify(dados).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}, 'relatorio-chatbot', 'chatbot')">📊 Exportar Excel</button>
    `;
}

function exportarRelatorioChatbotDados(dados) {
    if (!dados) {
        const container = document.getElementById('conteudo-relatorio-chatbot');
        if (container) {
            // Tentar recarregar dados
            if (window.armazenamentoReclamacoes) {
                dados = window.armazenamentoReclamacoes.carregarTodos('chatbot');
            } else {
                dados = fichasChatbot;
            }
        }
    }
    
    if (!dados || dados.length === 0) {
        mostrarAlerta('Nenhum dado para exportar', 'error');
        return;
    }
    
    console.log('📥 Exportando CSV com', dados.length, 'registros');
    
    // Headers completos com todos os campos
    const headers = [
        'Cliente', 
        'CPF', 
        'Canal', 
        'Data Cliente',
        'Data Criação',
        'Produto',
        'Motivo',
        'Resolvido Auto', 
        'Encaminhado Humano', 
        'Nota Avaliação',
        'Avaliação Cliente',
        'Satisfação',
        'Status',
        'Responsável',
        'Telefone',
        'Origem',
        'PIX Status',
        'Enviar Cobrança',
        'Casos Críticos',
        'Observações'
    ];
    
    const rows = dados.map(f => [
        f.nomeCompleto || f.nomeCliente || '',
        f.cpf || '',
        f.canalChatbot || '',
        f.dataClienteChatbot ? new Date(f.dataClienteChatbot).toLocaleDateString('pt-BR') : '',
        f.dataCriacao ? new Date(f.dataCriacao).toLocaleDateString('pt-BR') : '',
        f.produto || '',
        f.motivo || f.motivoReduzido || '',
        f.resolvidoAutomaticamente ? 'Sim' : 'Não',
        f.encaminhadoHumano ? 'Sim' : 'Não',
        f.notaAvaliacao || '',
        f.avaliacaoCliente || '',
        f.satisfacao || '',
        f.status || '',
        f.responsavel || '',
        f.telefone || '',
        f.origem || '',
        f.pixStatus || '',
        f.enviarCobranca || '',
        f.casosCriticos ? 'Sim' : 'Não',
        f.observacoes || ''
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    // Adicionar BOM para Excel reconhecer UTF-8
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-chatbot-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV exportado com sucesso');
}

function mostrarRelatorioSatisfacao(titulo, dados, subtitulo) {
    const container = document.getElementById('conteudo-relatorio-chatbot');
    if (!container) return;
    
    console.log('📊 Gerando relatório de satisfação com', dados.length, 'avaliações');
    console.log('📊 Dados recebidos:', dados.map(f => ({
        id: f.id,
        notaAvaliacao: f.notaAvaliacao,
        satisfacao: f.satisfacao,
        avaliacaoCliente: f.avaliacaoCliente
    })));
    
    // Agrupar por nível de satisfação - usar notaAvaliacao (que é o campo correto)
    const porNivel = {};
    dados.forEach(f => {
        // Tentar notaAvaliacao primeiro, depois satisfacao como fallback
        const nivel = parseInt(f.notaAvaliacao || f.satisfacao || 0);
        if (nivel > 0 && nivel <= 5) {
            porNivel[nivel] = (porNivel[nivel] || 0) + 1;
        }
    });
    
    console.log('📊 Agrupamento por nível:', porNivel);
    
    container.style.display = 'block';
    container.innerHTML = `
        <h3>${titulo}</h3>
        <p>${subtitulo}</p>
        <div class="report-table">
            <table>
                <thead>
                    <tr>
                        <th>Nível de Satisfação</th>
                        <th>Quantidade</th>
                        <th>Percentual</th>
                    </tr>
                </thead>
                <tbody>
                    ${[5, 4, 3, 2, 1].map(nivel => {
                        const count = porNivel[nivel] || 0;
                        const percentual = dados.length > 0 ? ((count / dados.length) * 100).toFixed(1) : 0;
                        return `
                            <tr>
                                <td>${'⭐'.repeat(nivel)} (${nivel})</td>
                                <td>${count}</td>
                                <td>${percentual}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <button class="velohub-btn" onclick="exportarRelatorioSatisfacaoChatbot(${JSON.stringify(dados).replace(/"/g, '&quot;')})">📥 Exportar CSV</button>
    `;
}

// Função para exportar CSV do relatório de satisfação
function exportarRelatorioSatisfacaoChatbot(dados) {
    if (!dados || dados.length === 0) {
        mostrarAlerta('Nenhum dado para exportar', 'error');
        return;
    }
    
    console.log('📥 Exportando relatório de satisfação com', dados.length, 'avaliações');
    
    // Agrupar por nível
    const porNivel = {};
    dados.forEach(f => {
        const nivel = parseInt(f.notaAvaliacao || f.satisfacao || 0);
        if (nivel > 0 && nivel <= 5) {
            porNivel[nivel] = (porNivel[nivel] || 0) + 1;
        }
    });
    
    // Criar CSV com dados detalhados
    const headers = ['Nível de Satisfação', 'Quantidade', 'Percentual', 'Cliente', 'CPF', 'Avaliação'];
    const rows = [];
    
    // Adicionar linha de resumo por nível
    [5, 4, 3, 2, 1].forEach(nivel => {
        const count = porNivel[nivel] || 0;
        const percentual = dados.length > 0 ? ((count / dados.length) * 100).toFixed(1) : 0;
        rows.push([
            `${'⭐'.repeat(nivel)} (${nivel})`,
            count,
            `${percentual}%`,
            '',
            '',
            ''
        ]);
    });
    
    // Adicionar linha em branco
    rows.push(['', '', '', '', '', '']);
    
    // Adicionar detalhes de cada avaliação
    rows.push(['Detalhes das Avaliações', '', '', '', '', '']);
    rows.push(['Cliente', 'CPF', 'Nota', 'Avaliação Texto', 'Data', 'Status']);
    
    dados.forEach(f => {
        rows.push([
            f.nomeCompleto || f.nomeCliente || '',
            f.cpf || '',
            f.notaAvaliacao || f.satisfacao || '',
            f.avaliacaoCliente || '',
            f.dataCriacao ? new Date(f.dataCriacao).toLocaleDateString('pt-BR') : '',
            f.status || ''
        ]);
    });
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-satisfacao-chatbot-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV exportado com sucesso');
}

// === UTILITÁRIOS ===
function limparFormChatbot() {
    document.getElementById('form-chatbot')?.reset();
    // Não preencher automaticamente - usuário deve inserir manualmente
    // Limpar anexos
    if (window.gerenciadorAnexos) {
        window.gerenciadorAnexos.limparAnexosFormulario('anexos-preview-chatbot');
    }
}

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

function formatarData(dataString) {
    if (!dataString) return 'Não informada';
    return new Date(dataString).toLocaleDateString('pt-BR');
}

function parseDate(dateString) {
    if (!dateString) return null;
    // Aceitar formato DD/MM/AAAA ou AAAA-MM-DD
    if (dateString.includes('/')) {
        const [dia, mes, ano] = dateString.split('/');
        return new Date(ano, mes - 1, dia);
    } else if (dateString.includes('-')) {
        return new Date(dateString);
    }
    return null;
}

// Função global para mostrar modal de seleção de período (reutilizada)
if (typeof mostrarModalPeriodo === 'undefined') {
    window.mostrarModalPeriodo = function(callback) {
        // Remover modal existente se houver
        const modalExistente = document.getElementById('modal-periodo');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'modal-periodo';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-periodo">
                <div class="modal-header">
                    <h3>📅 Selecionar Período</h3>
                    <button class="modal-close" onclick="fecharModalPeriodo()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="data-inicio">Data Inicial:</label>
                        <input type="date" id="data-inicio" class="form-control">
                        <input type="text" id="data-inicio-texto" class="form-control" placeholder="DD/MM/AAAA" 
                               pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10">
                    </div>
                    <div class="form-group">
                        <label for="data-fim">Data Final:</label>
                        <input type="date" id="data-fim" class="form-control">
                        <input type="text" id="data-fim-texto" class="form-control" placeholder="DD/MM/AAAA" 
                               pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10">
                    </div>
                    <div class="modal-actions">
                        <button class="velohub-btn btn-secondary" onclick="fecharModalPeriodo()">Cancelar</button>
                        <button class="velohub-btn btn-primary" onclick="confirmarPeriodo()">Gerar Relatório</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Sincronizar inputs de data e texto
        const dataInicio = document.getElementById('data-inicio');
        const dataInicioTexto = document.getElementById('data-inicio-texto');
        const dataFim = document.getElementById('data-fim');
        const dataFimTexto = document.getElementById('data-fim-texto');
        
        // Converter data para formato brasileiro
        function formatarDataBR(dataISO) {
            if (!dataISO) return '';
            const [ano, mes, dia] = dataISO.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        
        // Converter formato brasileiro para ISO
        function formatarDataISO(dataBR) {
            if (!dataBR) return '';
            const [dia, mes, ano] = dataBR.split('/');
            if (dia && mes && ano) {
                return `${ano}-${mes}-${dia}`;
            }
            return '';
        }
        
        // Validar formato DD/MM/AAAA
        function validarDataBR(data) {
            const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (!regex.test(data)) return false;
            const [dia, mes, ano] = data.split('/').map(Number);
            if (mes < 1 || mes > 12) return false;
            if (dia < 1 || dia > 31) return false;
            if (ano < 1900 || ano > 2100) return false;
            return true;
        }
        
        // Sincronizar data picker -> texto
        dataInicio.addEventListener('change', function() {
            dataInicioTexto.value = formatarDataBR(this.value);
        });
        
        dataFim.addEventListener('change', function() {
            dataFimTexto.value = formatarDataBR(this.value);
        });
        
        // Sincronizar texto -> data picker (com validação)
        dataInicioTexto.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length >= 2) valor = valor.substring(0, 2) + '/' + valor.substring(2);
            if (valor.length >= 5) valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
            this.value = valor;
            
            if (validarDataBR(this.value)) {
                dataInicio.value = formatarDataISO(this.value);
            }
        });
        
        dataFimTexto.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length >= 2) valor = valor.substring(0, 2) + '/' + valor.substring(2);
            if (valor.length >= 5) valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
            this.value = valor;
            
            if (validarDataBR(this.value)) {
                dataFim.value = formatarDataISO(this.value);
            }
        });
        
        // Fechar ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalPeriodo();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', function fecharESC(e) {
            if (e.key === 'Escape') {
                fecharModalPeriodo();
                document.removeEventListener('keydown', fecharESC);
            }
        });
        
        // Focar no primeiro campo
        setTimeout(() => dataInicio.focus(), 100);
        
        // Função global para confirmar
        window.confirmarPeriodo = function() {
            const inicio = dataInicioTexto.value || formatarDataBR(dataInicio.value);
            const fim = dataFimTexto.value || formatarDataBR(dataFim.value);
            
            if (!inicio || !fim) {
                mostrarAlerta('Por favor, preencha ambas as datas', 'erro');
                return;
            }
            
            if (!validarDataBR(inicio) || !validarDataBR(fim)) {
                mostrarAlerta('Por favor, use o formato DD/MM/AAAA para as datas', 'erro');
                return;
            }
            
            fecharModalPeriodo();
            if (callback) callback(inicio, fim);
        };
        
        // Função global para fechar
        window.fecharModalPeriodo = function() {
            const modal = document.getElementById('modal-periodo');
            if (modal) {
                modal.remove();
            }
            delete window.confirmarPeriodo;
            delete window.fecharModalPeriodo;
        };
    };
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function mostrarAlerta(mensagem, tipo) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensagem;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 5000);
}

function formatCPF(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
}

function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
}

