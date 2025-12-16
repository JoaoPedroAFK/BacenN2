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
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const section = document.getElementById(secaoId);
    if (section) {
        section.classList.add('active');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${secaoId}'`)) {
            btn.classList.add('active');
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
function carregarFichasChatbot() {
    console.log('🔄 Carregando fichas Chatbot...');
    
    // Usar o novo sistema de armazenamento
    if (window.armazenamentoReclamacoes) {
        fichasChatbot = window.armazenamentoReclamacoes.carregarTodos('chatbot');
        console.log('✅ Fichas carregadas:', fichasChatbot.length);
        console.log('📋 IDs:', fichasChatbot.map(f => f.id).join(', '));
    } else {
        console.error('❌ Sistema de armazenamento não encontrado!');
        fichasChatbot = [];
    }
    
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

async function handleSubmitChatbot(e) {
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
    
        const ficha = {
            id: gerarId(),
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
        
        // Salvar usando o novo sistema (síncrono e direto)
        const sucesso = window.armazenamentoReclamacoes.salvar('chatbot', ficha);
        
        if (!sucesso) {
            console.error('❌ Erro ao salvar reclamação');
            mostrarAlerta('Erro ao salvar reclamação', 'error');
            return;
        }
        
        console.log('✅ Reclamação salva com sucesso!');
        
        // RECARREGAR IMEDIATAMENTE
        carregarFichasChatbot();
        console.log('📋 Fichas recarregadas:', fichasChatbot.length);
        
        // Limpar formulário
        console.log('🧹 Limpando formulário...');
        limparFormChatbot();
        
        // Recarregar fichas para garantir que a nova ficha esteja disponível
        await carregarFichasChatbot();
        console.log('📋 Fichas Chatbot carregadas após salvar:', fichasChatbot.length);
        console.log('📋 Última ficha salva:', fichasChatbot[fichasChatbot.length - 1]);
        console.log('📋 Ficha salva está no array?', fichasChatbot.find(f => f.id === ficha.id) ? 'Sim' : 'Não');
        
        // Atualizar dashboard e listas
        await atualizarDashboardChatbot();
        
        // Atualizar lista geral (sem filtro de usuário)
        renderizarListaChatbot();
        
        // Atualizar "Minhas Reclamações" se a seção estiver visível
        const secaoMinhas = document.getElementById('minhas-reclamacoes-chatbot');
        if (secaoMinhas && secaoMinhas.classList.contains('active')) {
            renderizarMinhasReclamacoesChatbot();
        }
        
        mostrarSecao('lista-chatbot');
        
        console.log('✅ Reclamação salva com sucesso!');
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
async function atualizarDashboardChatbot() {
    await carregarFichasChatbot();
    
    const total = fichasChatbot.length;
    const resolvidasAuto = fichasChatbot.filter(f => f.resolvidoAutomaticamente).length;
    const encaminhadas = fichasChatbot.filter(f => f.encaminhadoHumano).length;
    
    // Calcular média de satisfação
    const satisfacoes = fichasChatbot
        .filter(f => f.satisfacao)
        .map(f => parseInt(f.satisfacao));
    const mediaSatisfacao = satisfacoes.length > 0 
        ? (satisfacoes.reduce((a, b) => a + b, 0) / satisfacoes.length).toFixed(1)
        : 0;
    const taxaSatisfacao = satisfacoes.length > 0 
        ? ((satisfacoes.filter(s => s >= 4).length / satisfacoes.length) * 100).toFixed(1)
        : 0;
    
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
async function mostrarCasosDashboardChatbot(tipo) {
    console.log('🔍 Mostrando casos do dashboard Chatbot - tipo:', tipo);
    
    // Garantir que fichasChatbot está carregado
    if (!fichasChatbot || fichasChatbot.length === 0) {
        console.warn('⚠️ Nenhuma ficha Chatbot carregada, tentando carregar...');
        await carregarFichasChatbot();
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
        await carregarFichasChatbot();
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
    const container = document.getElementById('lista-fichas-chatbot');
    if (!container) {
        console.error('❌ Container lista-fichas-chatbot não encontrado!');
        return;
    }
    
    // SEMPRE recarregar as fichas antes de renderizar para garantir que temos os dados mais recentes
    console.log('🔄 Recarregando fichas antes de renderizar lista...');
    carregarFichasChatbot();
    
    // Verificar novamente após carregar
    if (!fichasChatbot || !Array.isArray(fichasChatbot)) {
        console.error('❌ fichasChatbot não é um array válido após carregamento');
        fichasChatbot = [];
    }

    console.log('📋 Renderizando lista Chatbot geral com', fichasChatbot.length, 'fichas');
    console.log('📋 Primeiras 3 fichas:', fichasChatbot.slice(0, 3).map(f => ({ id: f.id, nome: f.nomeCompleto })));
    
    const busca = document.getElementById('busca-chatbot')?.value.toLowerCase() || '';
    const filtroStatus = document.getElementById('filtro-status-chatbot')?.value || '';
    const filtroCanal = document.getElementById('filtro-canal-chatbot')?.value || '';
    
    // NÃO FILTRAR POR USUÁRIO NA LISTA GERAL - mostrar TODAS as reclamações de TODOS os agentes
    let filtradas = [...(fichasChatbot || [])]; // Criar cópia para não modificar o array original
    
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
    
    if (filtroStatus) {
        filtradas = filtradas.filter(f => f.status === filtroStatus);
    }
    
    if (filtroCanal) {
        filtradas = filtradas.filter(f => f.canalChatbot === filtroCanal);
    }
    
    if (filtradas.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhuma ficha Chatbot encontrada</div>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    filtradas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataClienteChatbot || 0);
        const dataB = new Date(b.dataCriacao || b.dataClienteChatbot || 0);
        return dataB - dataA;
    });
    
    container.innerHTML = filtradas.map(f => criarCardChatbot(f)).join('');
    console.log('✅ Lista Chatbot renderizada com sucesso!');
}

// Renderizar "Minhas Reclamações"
function renderizarMinhasReclamacoesChatbot() {
    const container = document.getElementById('minhas-fichas-chatbot');
    if (!container) {
        console.error('❌ Container minhas-fichas-chatbot não encontrado!');
        return;
    }
    
    // Garantir que fichasChatbot está carregado
    if (!fichasChatbot || fichasChatbot.length === 0) {
        console.warn('⚠️ Nenhuma ficha Chatbot carregada, tentando carregar...');
        carregarFichasChatbot().then(() => {
            renderizarMinhasReclamacoesChatbot();
        });
        return;
    }
    
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
            ${minhasFichas.map(f => criarCardChatbot(f)).join('')}
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
    const inicio = prompt('Data inicial (DD/MM/AAAA):');
    const fim = prompt('Data final (DD/MM/AAAA):');
    
    if (!inicio || !fim) return;
    
    const inicioDate = parseDate(inicio);
    const fimDate = parseDate(fim);
    
    const filtradas = fichasChatbot.filter(f => {
        const data = new Date(f.dataEntrada);
        return data >= inicioDate && data <= fimDate;
    });
    
    mostrarRelatorioChatbot('Relatório por Período - Chatbot', filtradas, `Período: ${inicio} a ${fim}`);
}

function gerarRelatorioAutoChatbot() {
    const auto = fichasChatbot.filter(f => f.resolvidoAutomaticamente);
    mostrarRelatorioChatbot('Relatório de Resolução Automática - Chatbot', auto, 
        `${auto.length} fichas resolvidas automaticamente`);
}

function gerarRelatorioSatisfacaoChatbot() {
    // RECARREGAR fichas antes de gerar relatório
    console.log('📦 Carregando fichas antes de gerar relatório...');
    carregarFichasChatbot();
    
    console.log('📋 Total de fichas carregadas:', fichasChatbot.length);
    console.log('📋 Primeiras 3 fichas:', fichasChatbot.slice(0, 3).map(f => ({ 
        id: f.id, 
        nome: f.nomeCompleto, 
        nota: f.notaAvaliacao,
        avaliacao: f.avaliacaoCliente
    })));
    
    // Buscar por notaAvaliacao ou avaliacaoCliente
    const comSatisfacao = fichasChatbot.filter(f => {
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
    mostrarRelatorioChatbot('Relatório Completo - Chatbot', fichasChatbot, 
        `Total: ${fichasChatbot.length} fichas`);
}

function mostrarRelatorioChatbot(titulo, dados, subtitulo) {
    const container = document.getElementById('conteudo-relatorio-chatbot');
    if (!container) return;
    
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
                        <th>Resolvido Auto</th>
                        <th>Encaminhado</th>
                        <th>Satisfação</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(f => `
                        <tr>
                            <td>${f.nomeCompleto || f.nomeCliente || '-'}</td>
                            <td>${f.cpf || '-'}</td>
                            <td>${f.canalChatbot || '-'}</td>
                            <td>${f.resolvidoAutomaticamente ? 'Sim' : 'Não'}</td>
                            <td>${f.encaminhadoHumano ? 'Sim' : 'Não'}</td>
                            <td>${f.satisfacao ? '⭐'.repeat(parseInt(f.satisfacao)) : '-'}</td>
                            <td>${f.status || '-'}</td>
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
            dados = fichasChatbot;
        }
    }
    
    if (!dados || dados.length === 0) {
        mostrarAlerta('Nenhum dado para exportar', 'error');
        return;
    }
    
    const headers = ['Cliente', 'CPF', 'Canal', 'Resolvido Auto', 'Encaminhado Humano', 'Satisfação', 'Status'];
    const rows = dados.map(f => [
        f.nomeCompleto || f.nomeCliente || '',
        f.cpf || '',
        f.canalChatbot || '',
        f.resolvidoAutomaticamente ? 'Sim' : 'Não',
        f.encaminhadoHumano ? 'Sim' : 'Não',
        f.satisfacao || '',
        f.status || ''
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-chatbot-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function mostrarRelatorioSatisfacao(titulo, dados, subtitulo) {
    const container = document.getElementById('conteudo-relatorio-chatbot');
    if (!container) return;
    
    // Agrupar por nível de satisfação
    const porNivel = {};
    dados.forEach(f => {
        const nivel = f.satisfacao;
        porNivel[nivel] = (porNivel[nivel] || 0) + 1;
    });
    
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
        <button class="velohub-btn" onclick="exportarRelatorioChatbot()">📥 Exportar CSV</button>
    `;
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
    const [dia, mes, ano] = dateString.split('/');
    return new Date(ano, mes - 1, dia);
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

