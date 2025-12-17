/* === SISTEMA DE GESTÃO N2 - PÁGINA ESPECÍFICA === */

// Variáveis globais
let fichasN2 = [];

// Função para coletar todos os protocolos de um container
function obterProtocolosDoContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    
    const inputs = container.querySelectorAll('.protocolo-input');
    const protocolos = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(valor => valor.length > 0);
    
    return protocolos;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (window.loadingVelotax) {
        window.loadingVelotax.mostrar();
        window.loadingVelotax.esconderForcado(); // Segurança
    }
    
    try {
        inicializarN2();
        carregarFichasN2().then(() => {
            atualizarDashboardN2();
        });
        configurarEventosN2();
    } catch (error) {
        console.error('Erro na inicialização N2:', error);
    } finally {
        setTimeout(() => {
            if (window.loadingVelotax) {
                window.loadingVelotax.esconder();
            }
        }, 500);
    }
});

// === INICIALIZAÇÃO ===
function inicializarN2() {
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
    
    if (secaoId === 'lista-n2') {
        renderizarListaN2();
    } else if (secaoId === 'minhas-reclamacoes-n2') {
        renderizarMinhasReclamacoesN2();
    } else if (secaoId === 'nova-reclamacao-n2' || secaoId === 'nova-ficha-n2') {
        // Compatibilidade com ambos os nomes
        if (secaoId === 'nova-ficha-n2') {
            mostrarSecao('nova-reclamacao-n2');
            return;
        }
    } else if (secaoId === 'dashboard-n2') {
        atualizarDashboardN2();
        // Reinicializar gráficos
        setTimeout(() => {
            if (window.graficosDetalhadosN2) {
                window.graficosDetalhadosN2.carregarDados();
                window.graficosDetalhadosN2.renderizarGraficos();
            } else {
                window.graficosDetalhadosN2 = new GraficosDetalhados('n2');
            }
        }, 300);
        // Configurar cards após um pequeno delay
        setTimeout(() => {
            configurarCardsDashboardN2();
        }, 500);
    }
}

// === CARREGAR FICHAS ===
async function carregarFichasN2() {
    console.log('🔄 Carregando fichas N2...');
    
    let fichasCarregadas = [];
    
    // PRIORIDADE 1: Usar armazenamentoReclamacoes (sistema novo e confiável)
    if (window.armazenamentoReclamacoes) {
        try {
            console.log('📦 Carregando do armazenamentoReclamacoes...');
            fichasCarregadas = await window.armazenamentoReclamacoes.carregarTodos('n2') || [];
            console.log('✅ Fichas carregadas do armazenamentoReclamacoes:', fichasCarregadas.length);
        } catch (error) {
            console.error('❌ Erro ao carregar do armazenamentoReclamacoes:', error);
        }
    }
    
    // FALLBACK: Se não encontrou nada, tentar localStorage (chaves novas e antigas)
    if (fichasCarregadas.length === 0) {
        try {
            const fichasNovas = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || '[]');
            const fichasAntigas = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
            fichasCarregadas = [...fichasNovas, ...fichasAntigas];
            // Remover duplicatas por ID
            fichasCarregadas = fichasCarregadas.filter((f, index, self) => 
                index === self.findIndex(t => t.id === f.id)
            );
            console.log('📦 Fichas carregadas do localStorage (fallback):', fichasCarregadas.length);
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
        }
    }
    
    // FALLBACK 2: Tentar carregar do gerenciador de fichas
    if (fichasCarregadas.length === 0 && window.gerenciadorFichas) {
        try {
            const fichasGerenciador = window.gerenciadorFichas.obterFichasPorTipo('n2') || [];
            if (Array.isArray(fichasGerenciador) && fichasGerenciador.length > 0) {
                fichasCarregadas = fichasGerenciador;
                console.log('📦 Fichas encontradas no gerenciadorFichas:', fichasCarregadas.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do gerenciadorFichas:', error);
        }
    }
    
    // Atualizar array global
    fichasN2 = fichasCarregadas;
    
    // Garantir que fichasN2 seja um array
    if (!Array.isArray(fichasN2)) {
        console.warn('⚠️ fichasN2 não é um array, convertendo...');
        fichasN2 = [];
    }
    
    console.log('📋 Total de fichas N2 carregadas:', fichasN2.length);
    if (fichasN2.length > 0) {
        console.log('📋 IDs das fichas:', fichasN2.map(f => f.id).join(', '));
    }
}

// === FORMULÁRIO ===
function configurarEventosN2() {
    const form = document.getElementById('form-n2');
    if (form) {
        form.addEventListener('submit', handleSubmitN2);
    }
    
    const busca = document.getElementById('busca-n2');
    if (busca) {
        busca.addEventListener('input', renderizarListaN2);
    }
    
    const filtroStatus = document.getElementById('filtro-status-n2');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', renderizarListaN2);
    }
    
    const filtroPortabilidade = document.getElementById('filtro-portabilidade-n2');
    if (filtroPortabilidade) {
        filtroPortabilidade.addEventListener('change', renderizarListaN2);
    }
    
    const cpf = document.getElementById('n2-cpf');
    if (cpf) {
        cpf.addEventListener('input', formatCPF);
    }
    
    const telefone = document.getElementById('n2-telefone');
    if (telefone) {
        telefone.addEventListener('input', formatPhone);
    }
}

// Função auxiliar para obter valor de campo de forma segura
function obterValorCampoN2(id) {
    const campo = document.getElementById(id);
    if (!campo) {
        console.warn(`⚠️ Campo ${id} não encontrado`);
        return '';
    }
    // Obter valor diretamente, sem verificação adicional
    const valor = campo.value || '';
    return valor;
}

// Função auxiliar para obter checkbox de forma segura
function obterCheckboxN2(id) {
    const campo = document.getElementById(id);
    return campo ? campo.checked : false;
}

async function handleSubmitN2(e) {
    e.preventDefault();
    console.log('🚀 handleSubmitN2 chamado');
    
    try {
        // Obter anexos
        const anexos = window.gerenciadorAnexos ? 
            window.gerenciadorAnexos.obterAnexosDoFormulario('anexos-preview-n2') : [];
        console.log('📎 Anexos coletados:', anexos.length);
        
        // Coletar datas diretamente dos campos
        const campoDataAtendimento = document.getElementById('n2-data-entrada-atendimento');
        const campoDataN2 = document.getElementById('n2-data-entrada-n2');
        const dataEntradaAtendimento = campoDataAtendimento ? campoDataAtendimento.value : '';
        const dataEntradaN2 = campoDataN2 ? campoDataN2.value : '';
        console.log('📅 Data entrada Atendimento:', dataEntradaAtendimento);
        console.log('📅 Data Entrada N2:', dataEntradaN2);
        console.log('📅 Campo dataEntradaN2 existe?', campoDataN2 !== null);
        console.log('📅 Valor direto do campo dataEntradaN2:', campoDataN2?.value);
        console.log('📅 Tipo do valor dataEntradaN2:', typeof dataEntradaN2);
        console.log('📅 Valor após trim dataEntradaN2:', dataEntradaN2.trim());
    
        const ficha = {
            id: gerarId(),
            tipoDemanda: 'n2',
            dataEntradaAtendimento: dataEntradaAtendimento,
            dataEntradaN2: dataEntradaN2,
        responsavel: window.sistemaPerfis?.usuarioAtual?.nome || window.sistemaPerfis?.usuarioAtual?.email || 'Sistema',
        mes: obterValorCampoN2('n2-mes'),
        nomeCompleto: obterValorCampoN2('n2-nome'),
        cpf: obterValorCampoN2('n2-cpf'),
        telefone: obterValorCampoN2('n2-telefone'),
        motivoReduzido: obterValorCampoN2('n2-motivo-reduzido'),
        motivoDetalhado: obterValorCampoN2('n2-motivo-detalhado'),
        prazoN2: obterValorCampoN2('n2-prazo-n2'),
        tentativasContato: obterTentativasN2(), // Coletar todas as tentativas
        acionouCentral: obterCheckboxN2('n2-acionou-central'),
        protocoloCentral: obterProtocolosDoContainer('n2-protocolos-central-container') || [],
        n2SegundoNivel: obterCheckboxN2('n2-n2-segundo-nivel'),
        protocoloN2: obterProtocolosDoContainer('n2-protocolos-n2-container') || [],
        reclameAqui: obterCheckboxN2('n2-reclame-aqui'),
        protocoloReclameAqui: obterProtocolosDoContainer('n2-protocolos-reclame-aqui-container') || [],
        procon: obterCheckboxN2('n2-procon'),
        protocoloProcon: obterProtocolosDoContainer('n2-protocolos-procon-container') || [],
        protocolosSemAcionamento: obterValorCampoN2('n2-protocolos-sem-acionamento'),
        pixStatus: obterValorCampoN2('n2-pix-status'),
        enviarCobranca: document.querySelector('input[name="n2-enviar-cobranca"]:checked')?.value || 'Não',
        casosCriticos: obterCheckboxN2('n2-casos-criticos'),
        status: obterValorCampoN2('n2-status'),
        finalizadoEm: obterValorCampoN2('n2-finalizado-em'),
            observacoes: obterValorCampoN2('n2-observacoes'),
            anexos: anexos, // Incluir anexos
            dataCriacao: new Date().toISOString()
        };
        
        console.log('📋 Ficha coletada:', ficha);
        
        // Validar
        console.log('✅ Validando ficha...');
        if (!validarFichaN2(ficha)) {
            console.error('❌ Validação falhou');
            return;
        }
        console.log('✅ Validação passou');
        
        // Salvar
        console.log('💾 Salvando ficha...');
        
        // PRIORIDADE 1: Salvar no armazenamentoReclamacoes (sistema novo e confiável)
        if (window.armazenamentoReclamacoes) {
            try {
                const sucesso = await window.armazenamentoReclamacoes.salvar('n2', ficha);
                if (sucesso) {
                    console.log('✅ Salvo no armazenamentoReclamacoes');
                } else {
                    console.error('❌ Erro ao salvar no armazenamentoReclamacoes');
                }
            } catch (error) {
                console.error('❌ Erro ao salvar no armazenamentoReclamacoes:', error);
            }
        }
        
        // SEMPRE adicionar ao array local também
        const indexExistente = fichasN2.findIndex(f => f.id === ficha.id);
        if (indexExistente >= 0) {
            fichasN2[indexExistente] = ficha;
            console.log('✅ Ficha atualizada no array local');
        } else {
            fichasN2.push(ficha);
            console.log('✅ Ficha adicionada ao array local');
        }
        
        // Salvar no localStorage como backup (chave nova)
        try {
            localStorage.setItem('velotax_reclamacoes_n2', JSON.stringify(fichasN2));
            console.log('💾 Salvo no localStorage (chave nova):', fichasN2.length, 'fichas');
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
        }
        
        // Tentar salvar no Supabase (se disponível)
        if (window.supabaseDB && !window.supabaseDB.usarLocalStorage) {
            try {
                await window.supabaseDB.salvarFichaN2(ficha);
                console.log('✅ Salvo no Supabase');
            } catch (error) {
                console.error('❌ Erro ao salvar no Supabase:', error);
                console.log('⚠️ Continuando com localStorage apenas');
            }
        }
        
        // Tentar salvar no gerenciador de fichas (se disponível)
        if (window.gerenciadorFichas) {
            try {
                window.gerenciadorFichas.adicionarFicha(ficha);
                console.log('✅ Salvo no gerenciadorFichas');
            } catch (error) {
                console.error('❌ Erro ao salvar no gerenciadorFichas:', error);
            }
        }
        
        // Disparar evento para atualizar home
        if (typeof window !== 'undefined') {
            const evento = new CustomEvent('reclamacaoSalva', {
                detail: { tipo: 'n2', reclamacao: ficha, total: fichasN2.length }
            });
            window.dispatchEvent(evento);
            console.log('📢 Evento reclamacaoSalva disparado do n2-page');
        }
        
        // Limpar e atualizar
        console.log('🧹 Limpando formulário...');
        limparFormN2();
        
        // Recarregar fichas para garantir que a nova ficha esteja disponível
        await carregarFichasN2();
        console.log('📋 Fichas N2 carregadas após salvar:', fichasN2.length);
        console.log('📋 Última ficha salva:', fichasN2[fichasN2.length - 1]);
        console.log('📋 Ficha salva está no array?', fichasN2.find(f => f.id === ficha.id) ? 'Sim' : 'Não');
        
        // Atualizar dashboard e listas
        atualizarDashboardN2();
        
        // Atualizar lista geral (sem filtro de usuário)
        renderizarListaN2();
        
        // Atualizar "Minhas Reclamações" se a seção estiver visível
        const secaoMinhas = document.getElementById('minhas-reclamacoes-n2');
        if (secaoMinhas && secaoMinhas.classList.contains('active')) {
            renderizarMinhasReclamacoesN2();
        }
        
        mostrarSecao('lista-n2');
        
        console.log('✅ Reclamação salva com sucesso!');
        mostrarAlerta('Reclamação N2 salva com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao processar submit:', error);
        mostrarAlerta('Erro ao salvar reclamação: ' + error.message, 'error');
    }
}

function validarFichaN2(ficha) {
    console.log('🔍 Validando ficha N2:', ficha);
    
    const camposObrigatorios = [
        'dataEntradaAtendimento', 'dataEntradaN2', 'responsavel', 'mes', 
        'nomeCompleto', 'cpf', 'motivoReduzido', 'motivoDetalhado', 'status', 'enviarCobranca'
    ];
    
    for (let campo of camposObrigatorios) {
        const valor = ficha[campo];
        console.log(`🔍 Validando campo ${campo}:`, valor, 'Tipo:', typeof valor, 'Vazio?', !valor || (typeof valor === 'string' && valor.trim() === ''));
        
        // Verificar se é checkbox
        if (campo === 'enviarCobranca') {
            if (!valor || valor === 'Não') {
                mostrarAlerta('Campo obrigatório não preenchido: Enviar para cobrança?', 'error');
                return false;
            }
        } else {
            // Para campos de texto/data, verificar se tem valor
            const estaVazio = !valor || (typeof valor === 'string' && valor.trim() === '');
            if (estaVazio) {
                // Mensagem mais específica para campos de data
                if (campo === 'dataEntradaAtendimento') {
                    mostrarAlerta('Campo obrigatório não preenchido: Data entrada Atendimento. Por favor, selecione uma data.', 'error');
                } else if (campo === 'dataEntradaN2') {
                    mostrarAlerta('Campo obrigatório não preenchido: Data Entrada N2. Por favor, selecione uma data.', 'error');
                } else {
                    mostrarAlerta(`Campo obrigatório não preenchido: ${campo}`, 'error');
                }
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
function atualizarDashboardN2() {
    carregarFichasN2();
    
    const total = fichasN2.length;
    const emTratativa = fichasN2.filter(f => f.status === 'em-tratativa').length;
    const concluidas = fichasN2.filter(f => f.status === 'concluido' || f.status === 'respondido').length;
    const emAndamento = fichasN2.filter(f => f.statusPortabilidade === 'em-andamento').length;
    
    atualizarElemento('n2-total-dash', total);
    atualizarElemento('n2-tratativa-dash', emTratativa);
    atualizarElemento('n2-concluidas-dash', concluidas);
    atualizarElemento('n2-andamento', emAndamento);
    
    // Métricas específicas
    const portabilidadesConcluidas = fichasN2.filter(f => f.statusPortabilidade === 'concluida').length;
    const taxaPortabilidade = total > 0 ? ((portabilidadesConcluidas / total) * 100).toFixed(1) : 0;
    atualizarElemento('taxa-portabilidade-n2', `${taxaPortabilidade}%`);
    
    // Banco mais solicitado
    const bancosDestino = {};
    fichasN2.forEach(f => {
        if (f.bancoDestino) {
            bancosDestino[f.bancoDestino] = (bancosDestino[f.bancoDestino] || 0) + 1;
        }
    });
    const bancoMaisSolicitado = Object.keys(bancosDestino).reduce((a, b) => 
        bancosDestino[a] > bancosDestino[b] ? a : b, 'N/A');
    atualizarElemento('banco-mais-solicitado', bancoMaisSolicitado);
    
    const pixLiberado = fichasN2.filter(f => f.pixLiberado).length;
    atualizarElemento('pix-liberado-n2', pixLiberado);
    
    // Adicionar event listeners aos cards
    configurarCardsDashboardN2();
}

// Configurar cliques nos cards do dashboard N2
function configurarCardsDashboardN2() {
    // Card Total
    const cardTotal = document.querySelector('#n2-total-dash')?.closest('.stat-card');
    if (cardTotal) {
        cardTotal.style.cursor = 'pointer';
        cardTotal.onclick = () => mostrarCasosDashboardN2('total');
    }
    
    // Card Em Tratativa
    const cardTratativa = document.querySelector('#n2-tratativa-dash')?.closest('.stat-card');
    if (cardTratativa) {
        cardTratativa.style.cursor = 'pointer';
        cardTratativa.onclick = () => mostrarCasosDashboardN2('em-tratativa');
    }
    
    // Card Concluídas
    const cardConcluidas = document.querySelector('#n2-concluidas-dash')?.closest('.stat-card');
    if (cardConcluidas) {
        cardConcluidas.style.cursor = 'pointer';
        cardConcluidas.onclick = () => mostrarCasosDashboardN2('concluidas');
    }
    
    // Card Em Andamento
    const cardAndamento = document.querySelector('#n2-andamento')?.closest('.stat-card');
    if (cardAndamento) {
        cardAndamento.style.cursor = 'pointer';
        cardAndamento.onclick = () => mostrarCasosDashboardN2('em-andamento');
    }
}

// Mostrar casos relacionados ao card clicado N2
async function mostrarCasosDashboardN2(tipo) {
    console.log('🔍 Mostrando casos do dashboard N2 - tipo:', tipo);
    
    // Garantir que fichasN2 está carregado
    if (!fichasN2 || fichasN2.length === 0) {
        console.warn('⚠️ Nenhuma ficha N2 carregada, tentando carregar...');
        await carregarFichasN2();
    }
    
    let filtradas = [];
    let titulo = '';
    
    switch(tipo) {
        case 'total':
            filtradas = fichasN2;
            titulo = 'Total de Reclamações N2';
            break;
        case 'em-tratativa':
            filtradas = fichasN2.filter(f => f.status === 'em-tratativa');
            titulo = 'Reclamações N2 em Tratativa';
            break;
        case 'concluidas':
            filtradas = fichasN2.filter(f => f.status === 'concluido' || f.status === 'respondido');
            titulo = 'Reclamações N2 Concluídas';
            break;
        case 'em-andamento':
            filtradas = fichasN2.filter(f => f.statusPortabilidade === 'em-andamento');
            titulo = 'Portabilidades em Andamento';
            break;
    }
    
    console.log('📋 Casos filtrados N2:', filtradas.length);
    
    if (filtradas.length === 0) {
        mostrarAlerta(`Nenhuma reclamação encontrada para "${titulo}"`, 'info');
        return;
    }
    
    // Garantir que fichasN2 está carregado
    if (!fichasN2 || fichasN2.length === 0) {
        console.warn('⚠️ Nenhuma ficha N2 carregada, tentando carregar...');
        await carregarFichasN2();
        // Recarregar filtradas após carregar
        switch(tipo) {
            case 'total':
                filtradas = fichasN2;
                break;
            case 'em-tratativa':
                filtradas = fichasN2.filter(f => f.status === 'em-tratativa');
                break;
            case 'concluidas':
                filtradas = fichasN2.filter(f => f.status === 'concluido' || f.status === 'respondido');
                break;
            case 'em-andamento':
                filtradas = fichasN2.filter(f => f.statusPortabilidade === 'em-andamento');
                break;
        }
    }
    
    // Criar sidebar com os casos
    if (window.criarModalCasosDashboard) {
        window.criarModalCasosDashboard(titulo, filtradas, 'n2');
    } else {
        console.error('❌ Função criarModalCasosDashboard não encontrada, criando...');
        // Criar função se não existir
        criarSidebarCasosDashboard(titulo, filtradas, 'n2');
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
        if (tipo === 'n2') {
            // Tentar usar função global ou local
            if (typeof criarCardN2 === 'function') {
                return criarCardN2(f);
            } else if (window.criarCardN2) {
                return window.criarCardN2(f);
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
async function renderizarListaN2() {
    const container = document.getElementById('lista-fichas-n2');
    if (!container) {
        console.error('❌ Container lista-fichas-n2 não encontrado!');
        console.error('❌ Tentando encontrar container alternativo...');
        // Tentar encontrar container alternativo
        const containerAlt = document.querySelector('#lista-n2 .fichas-container, #lista-n2 .complaints-list, #lista-n2');
        if (containerAlt) {
            console.log('✅ Container alternativo encontrado:', containerAlt.id || containerAlt.className);
        } else {
            console.error('❌ Nenhum container encontrado!');
            return;
        }
    }
    
    // Mostrar loading
    container.innerHTML = '<div class="loading-message">Carregando reclamações...</div>';
    
    // SEMPRE recarregar as fichas antes de renderizar para garantir que temos os dados mais recentes
    console.log('🔄 Recarregando fichas antes de renderizar lista...');
    await carregarFichasN2();
    
    // Verificar novamente após carregar
    if (!fichasN2 || !Array.isArray(fichasN2)) {
        console.error('❌ fichasN2 não é um array válido após carregamento');
        fichasN2 = [];
    }
    
    console.log('📋 Renderizando lista N2 geral com', fichasN2.length, 'fichas');
    console.log('📋 Primeiras 3 fichas:', fichasN2.slice(0, 3).map(f => ({ id: f.id, nome: f.nomeCompleto })));
    
    // Verificar se criarCardN2 existe
    if (typeof criarCardN2 !== 'function' && typeof window.criarCardN2 !== 'function') {
        console.error('❌ Função criarCardN2 não encontrada!');
        container.innerHTML = '<div class="no-results">Erro: Função de renderização não encontrada</div>';
        return;
    }
    
    const busca = document.getElementById('busca-n2')?.value.toLowerCase() || '';
    const filtroStatus = document.getElementById('filtro-status-n2')?.value || '';
    const filtroPortabilidade = document.getElementById('filtro-portabilidade-n2')?.value || '';
    
    // NÃO FILTRAR POR USUÁRIO NA LISTA GERAL - mostrar TODAS as reclamações de TODOS os agentes
    let filtradas = [...fichasN2]; // Criar cópia para não modificar o array original
    
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
    
    if (filtroStatus && filtroStatus !== 'todos') {
        filtradas = filtradas.filter(f => f.status === filtroStatus);
    }
    
    if (filtroPortabilidade && filtroPortabilidade !== 'todos') {
        filtradas = filtradas.filter(f => f.statusPortabilidade === filtroPortabilidade);
    }
    
    if (filtradas.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhuma ficha N2 encontrada</div>';
        console.log('⚠️ Nenhuma ficha filtrada encontrada');
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    filtradas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataEntrada || 0);
        const dataB = new Date(b.dataCriacao || b.dataEntrada || 0);
        return dataB - dataA;
    });
    
    // Usar criarCardN2 do window se disponível, senão usar função local
    const criarCard = window.criarCardN2 || criarCardN2;
    const html = filtradas.map(f => {
        try {
            return criarCard(f);
        } catch (error) {
            console.error('❌ Erro ao criar card para ficha', f.id, ':', error);
            return `<div class="ficha-card">Erro ao renderizar ficha ${f.id}</div>`;
        }
    }).join('');
    
    container.innerHTML = html;
    console.log('✅ Lista N2 renderizada com sucesso!', filtradas.length, 'fichas exibidas');
}

// Renderizar "Minhas Reclamações"
async function renderizarMinhasReclamacoesN2() {
    const container = document.getElementById('minhas-fichas-n2');
    if (!container) {
        console.error('❌ Container minhas-fichas-n2 não encontrado!');
        return;
    }
    
    // Mostrar loading
    container.innerHTML = '<div class="loading-message">Carregando suas reclamações...</div>';
    
    // SEMPRE recarregar as fichas antes de renderizar (AGUARDAR)
    console.log('🔄 Recarregando fichas antes de renderizar minhas reclamações...');
    await carregarFichasN2();
    
    // Verificar novamente após carregar
    if (!fichasN2 || !Array.isArray(fichasN2)) {
        console.warn('⚠️ fichasN2 não é um array válido, inicializando...');
        fichasN2 = [];
    }
    
    const usuarioAtual = window.sistemaPerfis?.usuarioAtual;
    if (!usuarioAtual) {
        console.warn('⚠️ Usuário não logado');
        container.innerHTML = '<div class="no-results">Você precisa estar logado para ver suas reclamações</div>';
        return;
    }
    
    console.log('👤 Usuário atual:', usuarioAtual);
    console.log('📋 Total de fichas N2 disponíveis:', fichasN2.length);
    
    const responsavelAtual = usuarioAtual.nome || usuarioAtual.email;
    const emailAtual = usuarioAtual.email || '';
    
    // Filtrar apenas reclamações do usuário logado
    const minhasFichas = fichasN2.filter(f => {
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
    
    console.log('📋 Minhas fichas N2 encontradas:', minhasFichas.length);
    
    if (minhasFichas.length === 0) {
        container.innerHTML = '<div class="no-results">Você não possui reclamações atribuídas</div>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    minhasFichas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataEntrada || 0);
        const dataB = new Date(b.dataCriacao || b.dataEntrada || 0);
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
            ${minhasFichas.map(f => criarCardN2(f)).join('')}
        </div>
    `;
}

// Tornar função global para uso no modal
window.criarCardN2 = function criarCardN2(ficha) {
    const statusLabels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
        'respondido': 'Respondido'
    };
    
    const portabilidadeLabels = {
        'solicitada': 'Solicitada',
        'em-andamento': 'Em Andamento',
        'concluida': 'Concluída',
        'cancelada': 'Cancelada',
        'pendente': 'Pendente'
    };
    
    const statusClass = `status-${ficha.status}`;
    const statusLabel = statusLabels[ficha.status] || ficha.status;
    const portabilidadeLabel = portabilidadeLabels[ficha.statusPortabilidade] || ficha.statusPortabilidade;
    
    return `
        <div class="complaint-item" onclick="abrirFichaN2('${ficha.id}')">
            <div class="complaint-header">
                <div class="complaint-title">
                    ${ficha.nomeCompleto || ficha.nomeCliente || 'Nome não informado'}
                    <span class="n2-badge">🔄 N2</span>
                </div>
                <div class="complaint-status ${statusClass}">${statusLabel}</div>
            </div>
            <div class="complaint-summary">
                <div class="complaint-detail"><strong>CPF:</strong> ${ficha.cpf}</div>
                <div class="complaint-detail"><strong>Motivo:</strong> ${ficha.motivoReduzido}</div>
                <div class="complaint-detail"><strong>Banco Origem:</strong> ${ficha.bancoOrigem || '-'}</div>
                <div class="complaint-detail"><strong>Banco Destino:</strong> ${ficha.bancoDestino || '-'}</div>
                <div class="complaint-detail"><strong>Status Portabilidade:</strong> ${portabilidadeLabel}</div>
                <div class="complaint-detail"><strong>Responsável:</strong> ${ficha.responsavel}</div>
            </div>
        </div>
    `;
}

function abrirFichaN2(id) {
    const ficha = fichasN2.find(f => f.id === id);
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
function gerarRelatorioPeriodoN2() {
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
        
        const filtradas = fichasN2.filter(f => {
            const data = new Date(f.dataEntrada);
            return data >= inicioDate && data <= fimDate;
        });
        
        mostrarRelatorioN2('Relatório por Período - N2', filtradas, `Período: ${inicio} a ${fim}`);
    });
}

function gerarRelatorioBancosN2() {
    const bancos = {};
    fichasN2.forEach(f => {
        const origem = f.bancoOrigem || 'Não informado';
        const destino = f.bancoDestino || 'Não informado';
        const chave = `${origem} → ${destino}`;
        bancos[chave] = (bancos[chave] || 0) + 1;
    });
    
    const dados = Object.entries(bancos).map(([rota, count]) => ({
        rota,
        count
    })).sort((a, b) => b.count - a.count);
    
    mostrarRelatorioBancos('Relatório por Bancos - N2', dados);
}

function gerarRelatorioCompletoN2() {
    mostrarRelatorioN2('Relatório Completo - N2', fichasN2, `Total: ${fichasN2.length} fichas`);
}

function mostrarRelatorioN2(titulo, dados, subtitulo) {
    const container = document.getElementById('conteudo-relatorio-n2');
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
                        <th>Banco Origem</th>
                        <th>Banco Destino</th>
                        <th>Status Portabilidade</th>
                        <th>Status</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(f => `
                        <tr>
                            <td>${f.nomeCompleto || f.nomeCliente || '-'}</td>
                            <td>${f.cpf || '-'}</td>
                            <td>${f.bancoOrigem || '-'}</td>
                            <td>${f.bancoDestino || '-'}</td>
                            <td>${f.statusPortabilidade || '-'}</td>
                            <td>${f.status || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
                    <button class="velohub-btn" onclick="filtrosExportacaoCSVN2.mostrarModalFiltros(${JSON.stringify(dados).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}, exportarRelatorioN2Dados)">📥 Exportar CSV com Filtros</button>
                    <button class="velohub-btn" onclick="exportarParaExcel(${JSON.stringify(dados).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}, 'relatorio-n2', 'n2')">📊 Exportar Excel</button>
    `;
}

function exportarRelatorioN2Dados(dados) {
    if (!dados) {
        const container = document.getElementById('conteudo-relatorio-n2');
        if (container) {
            dados = fichasN2;
        }
    }
    
    if (!dados || dados.length === 0) {
        mostrarAlerta('Nenhum dado para exportar', 'error');
        return;
    }
    
    const headers = ['Cliente', 'CPF', 'Banco Origem', 'Banco Destino', 'Status Portabilidade', 'Status'];
    const rows = dados.map(f => [
        f.nomeCompleto || f.nomeCliente || '',
        f.cpf || '',
        f.bancoOrigem || '',
        f.bancoDestino || '',
        f.statusPortabilidade || '',
        f.status || '',
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-n2-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function mostrarRelatorioBancos(titulo, dados) {
    const container = document.getElementById('conteudo-relatorio-n2');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <h3>${titulo}</h3>
        <div class="report-table">
            <table>
                <thead>
                    <tr>
                        <th>Rota (Origem → Destino)</th>
                        <th>Quantidade</th>
                        <th>Percentual</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(item => {
                        const percentual = ((item.count / fichasN2.length) * 100).toFixed(1);
                        return `
                            <tr>
                                <td>${item.rota}</td>
                                <td>${item.count}</td>
                                <td>${percentual}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <button class="velohub-btn" onclick="exportarRelatorioN2()">📥 Exportar CSV</button>
    `;
}

// === UTILITÁRIOS ===
// === OBTER TENTATIVAS DE CONTATO N2 ===
function obterTentativasN2() {
    const tentativas = [];
    const tentativasInputs = document.querySelectorAll('#tentativas-contato-n2 .tentativa-data');
    tentativasInputs.forEach((input, index) => {
        if (input.value) {
            tentativas.push({
                numero: index + 1,
                data: input.value
            });
        }
    });
    return tentativas;
}

function limparFormN2() {
    document.getElementById('form-n2')?.reset();
    // Não preencher automaticamente após limpar
    // Limpar tentativas dinâmicas (manter apenas as 2 primeiras)
    const container = document.getElementById('tentativas-contato-n2');
    if (container) {
        const tentativas = container.querySelectorAll('.tentativa-item');
        tentativas.forEach((item, index) => {
            if (index > 1) { // Manter apenas as 2 primeiras
                item.remove();
            } else {
                const input = item.querySelector('.tentativa-data');
                if (input) input.value = '';
            }
        });
        if (window.contadorTentativasN2 !== undefined) {
            window.contadorTentativasN2 = 2;
        }
    }
    // Limpar anexos
    if (window.gerenciadorAnexos) {
        window.gerenciadorAnexos.limparAnexosFormulario('anexos-preview-n2');
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

