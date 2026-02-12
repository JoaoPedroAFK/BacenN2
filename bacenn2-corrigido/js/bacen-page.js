/* === SISTEMA DE GESTÃO BACEN - PÁGINA ESPECÍFICA === */

// Variáveis globais
let fichasBacen = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (window.loadingVelotax) {
        window.loadingVelotax.mostrar();
        window.loadingVelotax.esconderForcado(); // Segurança
    }
    
    try {
        inicializarBacen();
        carregarFichasBacen().then(() => {
            atualizarDashboardBacen(); // async, mas não precisa await aqui
            
            // Verificar se há parâmetro ?editar=id na URL
            const urlParams = new URLSearchParams(window.location.search);
            const editarId = urlParams.get('editar');
            if (editarId) {
                console.log('📝 [BACEN] Parâmetro editar encontrado:', editarId);
                // Aguardar um pouco para garantir que tudo está carregado
                setTimeout(() => {
                    abrirFichaBacen(editarId);
                }, 1000);
            }
        });
        configurarEventosBacen();
    } catch (error) {
        console.error('Erro na inicialização BACEN:', error);
    } finally {
        setTimeout(() => {
            if (window.loadingVelotax) {
                window.loadingVelotax.esconder();
            }
        }, 500);
    }
});

// === INICIALIZAÇÃO ===
function inicializarBacen() {
    // Não preencher automaticamente - usuário deve inserir manualmente
    
    // Listener CRÍTICO: Recarregar fichas quando Firebase estiver pronto
    window.addEventListener('firebaseReady', async function(event) {
        console.log('🔥 [BACEN] Firebase está pronto! Recarregando fichas...');
        // Aguardar um pouco para garantir que armazenamentoReclamacoes também está pronto
        await new Promise(resolve => setTimeout(resolve, 500));
        // Recarregar fichas do Firebase
        await carregarFichasBacen();
        // Atualizar dashboard
        atualizarDashboardBacen();
        // Atualizar lista se estiver visível
        const secaoLista = document.getElementById('lista-bacen');
        if (secaoLista && secaoLista.classList.contains('active')) {
            renderizarListaBacen();
        }
    });
    
    // Listener para atualizar dashboard quando fichas forem importadas
    window.addEventListener('reclamacaoSalva', async function(event) {
        if (event.detail && (event.detail.tipo === 'bacen' || event.detail.origem === 'importacao')) {
            console.log('📢 [BACEN] Evento reclamacaoSalva recebido, atualizando dashboard...');
            // Recarregar fichas e atualizar dashboard
            await carregarFichasBacen();
            atualizarDashboardBacen();
            // Atualizar lista se estiver visível
            const secaoLista = document.getElementById('lista-bacen');
            if (secaoLista && secaoLista.classList.contains('active')) {
                renderizarListaBacen();
            }
        }
    });
    
    // Listener para evento de importação concluída
    window.addEventListener('importacaoConcluida', async function(event) {
        if (event.detail && event.detail.porTipo && event.detail.porTipo.bacen > 0) {
            console.log('📢 [BACEN] Importação concluída, atualizando dashboard...');
            // Recarregar fichas e atualizar dashboard
            await carregarFichasBacen();
            atualizarDashboardBacen();
            // Atualizar lista se estiver visível
            const secaoLista = document.getElementById('lista-bacen');
            if (secaoLista && secaoLista.classList.contains('active')) {
                renderizarListaBacen();
            }
        }
    });
}

// === NAVEGAÇÃO ===
function mostrarSecao(secaoId) {
    console.log('🔘 mostrarSecao chamado com:', secaoId);
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
    } else {
        console.warn('⚠️ Seção não encontrada:', secaoId);
    }
    
    // Ativar botão correspondente
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${secaoId}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Ações específicas
    if (secaoId === 'lista-bacen') {
        renderizarListaBacen();
    } else if (secaoId === 'minhas-reclamacoes-bacen') {
        renderizarMinhasReclamacoesBacen();
    } else if (secaoId === 'nova-reclamacao-bacen' || secaoId === 'nova-ficha-bacen') {
        // Compatibilidade com ambos os nomes
        if (secaoId === 'nova-ficha-bacen') {
            mostrarSecao('nova-reclamacao-bacen');
            return;
        }
    } else if (secaoId === 'dashboard-bacen') {
        atualizarDashboardBacen();
        // Reinicializar gráficos
        setTimeout(async () => {
            if (window.graficosDetalhadosBacen) {
                await window.graficosDetalhadosBacen.carregarDados();
                window.graficosDetalhadosBacen.renderizarGraficos();
            } else {
                window.graficosDetalhadosBacen = new GraficosDetalhados('bacen');
                // Inicializar controle de gráficos após renderização
                setTimeout(() => {
                    if (typeof ControleGraficosDashboard !== 'undefined') {
                        window.controleGraficosBacen = new ControleGraficosDashboard('bacen');
                    }
                }, 2000);
            }
        }, 300);
    }
}

// === CARREGAR FICHAS ===
async function carregarFichasBacen() {
    console.log('🔄 Carregando fichas BACEN...');
    
    let fichasCarregadas = [];
    
    // PRIORIDADE 1: Aguardar armazenamentoReclamacoes estar disponível
    if (!window.armazenamentoReclamacoes) {
        console.log('⏳ Aguardando armazenamentoReclamacoes estar disponível...');
        // Aguardar até 5 segundos
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (window.armazenamentoReclamacoes) {
                console.log('✅ armazenamentoReclamacoes agora está disponível!');
                break;
            }
        }
    }
    
    // PRIORIDADE 1: Usar armazenamentoReclamacoes (sistema novo e confiável)
    if (window.armazenamentoReclamacoes) {
        try {
            console.log('📦 Carregando do armazenamentoReclamacoes...');
            console.log('🔍 Estado do Firebase:', {
                usarFirebase: window.armazenamentoReclamacoes.usarFirebase,
                firebaseDB: window.firebaseDB ? 'existe' : 'não existe',
                firebaseInicializado: window.firebaseDB?.inicializado,
                firebaseUsarLocalStorage: window.firebaseDB?.usarLocalStorage
            });
            
            // Aguardar um pouco para garantir que Firebase está pronto
            if (window.firebaseDB && !window.firebaseDB.inicializado) {
                console.log('⏳ Aguardando Firebase inicializar...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Re-verificar Firebase
                if (window.armazenamentoReclamacoes.verificarEAtivarFirebase) {
                    window.armazenamentoReclamacoes.verificarEAtivarFirebase();
                }
            }
            
            fichasCarregadas = await window.armazenamentoReclamacoes.carregarTodos('bacen') || [];
            console.log('✅ Fichas carregadas do armazenamentoReclamacoes:', fichasCarregadas.length);
            if (fichasCarregadas.length > 0) {
                console.log('📋 Primeiras 3 fichas:', fichasCarregadas.slice(0, 3).map(f => f.id || 'sem ID'));
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do armazenamentoReclamacoes:', error);
            console.error('   Stack:', error.stack);
        }
    } else {
        console.warn('⚠️ window.armazenamentoReclamacoes não está disponível após aguardar!');
    }
    
    // FALLBACK: Se não encontrou nada, tentar localStorage (chaves novas e antigas)
    if (fichasCarregadas.length === 0) {
        try {
            const fichasNovas = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || '[]');
            const fichasAntigas = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
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
            const fichasGerenciador = window.gerenciadorFichas.obterFichasPorTipo('bacen') || [];
            if (Array.isArray(fichasGerenciador) && fichasGerenciador.length > 0) {
                fichasCarregadas = fichasGerenciador;
                console.log('📦 Fichas encontradas no gerenciadorFichas:', fichasCarregadas.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do gerenciadorFichas:', error);
        }
    }
    
    // Atualizar array global
    fichasBacen = fichasCarregadas;
    
    // Garantir que fichasBacen seja um array
    if (!Array.isArray(fichasBacen)) {
        console.warn('⚠️ fichasBacen não é um array, convertendo...');
        fichasBacen = [];
    }
    
    console.log('📋 Total de fichas BACEN carregadas:', fichasBacen.length);
    if (fichasBacen.length > 0) {
        console.log('📋 IDs das fichas:', fichasBacen.map(f => f.id).join(', '));
    }
}

// === FORMULÁRIO ===
function configurarEventosBacen() {
    const form = document.getElementById('form-bacen');
    if (form) {
        console.log('✅ Formulário BACEN encontrado, adicionando listener de submit');
        form.addEventListener('submit', handleSubmitBacen);
    } else {
        console.error('❌ Formulário BACEN não encontrado!');
    }
    
    const busca = document.getElementById('busca-bacen');
    if (busca) {
        busca.addEventListener('input', renderizarListaBacen);
    }
    
    const filtroStatus = document.getElementById('filtro-status-bacen');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', renderizarListaBacen);
    }
    
    // Máscaras
    const cpf = document.getElementById('bacen-cpf');
    if (cpf) {
        cpf.addEventListener('input', formatCPF);
    }
    
    // Aplicar máscara em todos os campos de telefone existentes e futuros
    const telefones = document.querySelectorAll('#bacen-telefones-container .telefone-mask');
    telefones.forEach(tel => {
        tel.addEventListener('input', formatPhone);
    });
}

// Função auxiliar para obter valor de campo de forma segura
function obterValorCampo(id) {
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
function obterCheckbox(id) {
    const campo = document.getElementById(id);
    return campo ? campo.checked : false;
}

async function handleSubmitBacen(e) {
    e.preventDefault();
    console.log('🚀 handleSubmitBacen chamado');
    
    try {
        // Obter anexos
        const anexos = window.gerenciadorAnexos ? 
            window.gerenciadorAnexos.obterAnexosDoFormulario('anexos-preview-bacen') : [];
        console.log('📎 Anexos coletados:', anexos.length);
    
    // Coletar dataEntrada diretamente do campo
    const campoDataEntrada = document.getElementById('bacen-data-entrada');
    const dataEntrada = campoDataEntrada ? campoDataEntrada.value : '';
    console.log('📅 Data de Entrada coletada:', dataEntrada);
    console.log('📅 Campo existe?', campoDataEntrada !== null);
    console.log('📅 Valor direto do campo:', campoDataEntrada?.value);
    console.log('📅 Tipo do valor:', typeof dataEntrada);
    console.log('📅 Valor após trim:', dataEntrada.trim());
    
    const ficha = {
        id: gerarId(),
        tipoDemanda: 'bacen',
        dataEntrada: dataEntrada,
        responsavel: window.sistemaPerfis?.usuarioAtual?.nome || window.sistemaPerfis?.usuarioAtual?.email || 'Sistema',
        mes: obterValorCampo('bacen-mes'),
        nomeCompleto: obterValorCampo('bacen-nome'),
        cpf: obterValorCampo('bacen-cpf'),
        telefone: window.obterTelefonesDoContainer ? window.obterTelefonesDoContainer('bacen-telefones-container').join(', ') : obterValorCampo('bacen-telefone'),
        origem: obterValorCampo('bacen-origem'),
        origemTipo: document.querySelector('input[name="bacen-origem-tipo"]:checked')?.value || '',
        rdr: obterValorCampo('bacen-rdr'),
        motivoReduzido: obterValorCampo('bacen-motivo-reduzido'),
        motivoDetalhado: obterValorCampo('bacen-motivo-detalhado'),
        prazoBacen: obterValorCampo('bacen-prazo-bacen'),
        tentativasContato: obterTentativasBacen(), // Coletar todas as tentativas
        acionouCentral: obterCheckbox('bacen-acionou-central'),
        protocoloCentral: obterProtocolosDoContainer('bacen-protocolos-central-container') || [],
        n2SegundoNivel: obterCheckbox('bacen-n2-segundo-nivel'),
        protocoloN2: obterProtocolosDoContainer('bacen-protocolos-n2-container') || [],
        reclameAqui: obterCheckbox('bacen-reclame-aqui'),
        protocoloReclameAqui: obterProtocolosDoContainer('bacen-protocolos-reclame-aqui-container') || [],
        procon: obterCheckbox('bacen-procon'),
        protocoloProcon: obterProtocolosDoContainer('bacen-protocolos-procon-container') || [],
        protocolosSemAcionamento: obterValorCampo('bacen-protocolos-sem-acionamento'),
        pixStatus: obterValorCampo('bacen-pix-status'),
        statusContratoQuitado: document.getElementById('bacen-status-contrato-quitado')?.checked || false,
        statusContratoAberto: document.getElementById('bacen-status-contrato-aberto')?.checked || false,
        enviarCobranca: document.querySelector('input[name="bacen-enviar-cobranca"]:checked')?.value || 'Não',
        formalizadoCliente: document.querySelector('input[name="bacen-formalizado-cliente"]:checked')?.value === 'Sim',
        casosCriticos: obterCheckbox('bacen-casos-criticos'),
        status: obterValorCampo('bacen-status'),
        finalizadoEm: obterValorCampo('bacen-finalizado-em'),
        observacoes: obterValorCampo('bacen-observacoes'),
        anexos: anexos, // Incluir anexos
        dataCriacao: new Date().toISOString()
    };
    
    console.log('📋 Ficha coletada:', ficha);
    
        // Validar
        console.log('✅ Validando ficha...');
        if (!validarFichaBacen(ficha)) {
            console.error('❌ Validação falhou');
            return;
        }
        console.log('✅ Validação passou');
        
        // Salvar
        console.log('💾 Salvando ficha...');
        
        // PRIORIDADE 1: Salvar no armazenamentoReclamacoes (sistema novo e confiável)
        if (!window.armazenamentoReclamacoes) {
            console.error('❌ Sistema de armazenamento não encontrado!');
            mostrarAlerta('Erro ao salvar: sistema de armazenamento não disponível', 'error');
            return;
        }
        
        try {
            console.log('📤 [bacen-page] Chamando armazenamentoReclamacoes.salvar...');
            const sucesso = await window.armazenamentoReclamacoes.salvar('bacen', ficha);
            console.log('📥 [bacen-page] Resultado do salvar:', sucesso);
            
            if (!sucesso) {
                console.error('❌ [bacen-page] Erro ao salvar reclamação - retornou false');
                mostrarAlerta('Erro ao salvar reclamação', 'error');
                return;
            }
            
            console.log('✅ [bacen-page] Reclamação salva com sucesso!');
            
            // Aguardar um pouco para garantir que o Firebase salvou
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('❌ [bacen-page] Erro ao salvar reclamação:', error);
            mostrarAlerta('Erro ao salvar reclamação: ' + error.message, 'error');
            return;
        }
        
        // RECARREGAR IMEDIATAMENTE (assíncrono)
        await carregarFichasBacen();
        console.log('📋 Fichas recarregadas:', fichasBacen.length);
        
        // Limpar formulário
        limparFormBacen();
        
        // Atualizar dashboard e listas IMEDIATAMENTE
        atualizarDashboardBacen();
        renderizarListaBacen();
        
        // Mostrar lista
        mostrarSecao('lista-bacen');
        
        // Disparar evento para atualizar home e relatórios
        if (typeof window !== 'undefined') {
            const evento = new CustomEvent('reclamacaoSalva', {
                detail: { tipo: 'bacen', reclamacao: ficha, total: fichasBacen.length }
            });
            window.dispatchEvent(evento);
            console.log('📢 Evento reclamacaoSalva disparado do bacen-page');
        }
        
        // Mostrar sucesso
        mostrarAlerta('Reclamação BACEN salva com sucesso!', 'success');
        
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
                detail: { tipo: 'bacen', reclamacao: ficha, total: fichasBacen.length }
            });
            window.dispatchEvent(evento);
            console.log('📢 Evento reclamacaoSalva disparado do bacen-page');
        }
        
        // Limpar e atualizar
        console.log('🧹 Limpando formulário...');
        limparFormBacen();
        
        // Recarregar fichas para garantir que a nova ficha esteja disponível
        await carregarFichasBacen();
        console.log('📋 Fichas BACEN carregadas após salvar:', fichasBacen.length);
        console.log('📋 Última ficha salva:', fichasBacen[fichasBacen.length - 1]);
        console.log('📋 Ficha salva está no array?', fichasBacen.find(f => f.id === ficha.id) ? 'Sim' : 'Não');
        
        // Atualizar dashboard e listas
        atualizarDashboardBacen();
        
        // Atualizar lista geral (sem filtro de usuário)
        renderizarListaBacen();
        
        // Atualizar "Minhas Reclamações" se a seção estiver visível
        const secaoMinhas = document.getElementById('minhas-reclamacoes-bacen');
        if (secaoMinhas && secaoMinhas.classList.contains('active')) {
            renderizarMinhasReclamacoesBacen();
        }
        
        mostrarSecao('lista-bacen');
        
        console.log('✅ Reclamação salva com sucesso!');
        mostrarAlerta('Reclamação BACEN salva com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao processar submit:', error);
        mostrarAlerta('Erro ao salvar reclamação: ' + error.message, 'error');
    }
}

function validarFichaBacen(ficha) {
    console.log('🔍 Validando ficha:', ficha);
    
    const camposObrigatorios = [
        'dataEntrada', 'responsavel', 'mes', 'nomeCompleto', 'cpf', 
        'origem', 'motivoReduzido', 'motivoDetalhado', 'status', 'enviarCobranca'
    ];
    
    // Validação condicional: Prazo Bacen obrigatório apenas se Origem for Bacen Celcoin ou Bacen Via Capital
    if ((ficha.origem === 'Bacen Celcoin' || ficha.origem === 'Bacen Via Capital') && !ficha.prazoBacen) {
        mostrarAlerta('Prazo BACEN é obrigatório quando a origem é "Bacen Celcoin" ou "Bacen Via Capital"', 'error');
        return false;
    }
    
    for (let campo of camposObrigatorios) {
        const valor = ficha[campo];
        console.log(`🔍 Validando campo ${campo}:`, valor, 'Tipo:', typeof valor, 'Vazio?', !valor || (typeof valor === 'string' && valor.trim() === ''));
        
        // Verificar se é checkbox - aceita tanto "Sim" quanto "Não"
        if (campo === 'enviarCobranca') {
            // Campo é obrigatório mas aceita "Sim" ou "Não"
            if (!valor || (valor !== 'Sim' && valor !== 'Não')) {
                mostrarAlerta('Campo obrigatório não preenchido: Enviar para cobrança?', 'error');
                return false;
            }
        } else {
            // Para campos de texto/data, verificar se tem valor
            const estaVazio = !valor || (typeof valor === 'string' && valor.trim() === '');
            if (estaVazio) {
                // Mensagem mais específica para dataEntrada
                if (campo === 'dataEntrada') {
                    mostrarAlerta('Campo obrigatório não preenchido: Data de Entrada. Por favor, selecione uma data.', 'error');
                } else {
                    mostrarAlerta(`Campo obrigatório não preenchido: ${campo}`, 'error');
                }
                return false;
            }
        }
    }
    
    // Validar CPF
    if (!validarCPF(ficha.cpf)) {
        mostrarAlerta('CPF inválido', 'error');
        return false;
    }
    
    return true;
}

// === DASHBOARD ===
// Função para excluir ficha BACEN (apenas das listas e contagens, não do Firebase)
async function excluirFichaBacen(id) {
    if (!confirm('Tem certeza que deseja excluir esta reclamação das listas? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        // Remover apenas do array local (não do Firebase)
        fichasBacen = fichasBacen.filter(f => f.id !== id);
        
        // Atualizar interface imediatamente
        atualizarDashboardBacen();
        renderizarListaBacen();
        
        // Atualizar "Minhas Reclamações" se estiver visível
        const secaoMinhas = document.getElementById('minhas-reclamacoes-bacen');
        if (secaoMinhas && secaoMinhas.classList.contains('active')) {
            renderizarMinhasReclamacoesBacen();
        }
        
        // Atualizar gráficos se estiverem visíveis
        if (window.graficosDetalhadosBacen) {
            await window.graficosDetalhadosBacen.carregarDados();
            window.graficosDetalhadosBacen.renderizarGraficos();
        }
        
        mostrarAlerta('Reclamação removida das listas com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao excluir ficha BACEN:', error);
        mostrarAlerta('Erro ao remover reclamação: ' + error.message, 'error');
    }
}

// Tornar função global
window.excluirFichaBacen = excluirFichaBacen;

async function atualizarDashboardBacen() {
    await carregarFichasBacen();
    
    const total = fichasBacen.length;
    const emTratativa = fichasBacen.filter(f => f.status === 'em-tratativa').length;
    const concluidas = fichasBacen.filter(f => f.status === 'concluido' || f.status === 'respondido').length;
    
    // Calcular prazo vencendo (próximos 7 dias)
    const hoje = new Date();
    const prazoVencendo = fichasBacen.filter(f => {
        if (!f.prazoBacen) return false;
        const prazo = new Date(f.prazoBacen);
        const diff = (prazo - hoje) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;
    
    // Atualizar elementos
    atualizarElemento('bacen-total-dash', total);
    atualizarElemento('bacen-tratativa-dash', emTratativa);
    atualizarElemento('bacen-concluidas-dash', concluidas);
    atualizarElemento('bacen-prazo-vencendo', prazoVencendo);
    
    // Métricas específicas
    const taxaResolucao = total > 0 ? ((concluidas / total) * 100).toFixed(1) : 0;
    atualizarElemento('taxa-resolucao-bacen', `${taxaResolucao}%`);
    
    const comProcon = fichasBacen.filter(f => f.procon).length;
    atualizarElemento('com-procon-bacen', comProcon);
    
    const liquidacao = fichasBacen.filter(f => f.liquidacaoAntecipada).length;
    atualizarElemento('liquidacao-bacen', liquidacao);
    
    // Adicionar event listeners aos cards
    configurarCardsDashboardBacen();
}

// Configurar cliques nos cards do dashboard
function configurarCardsDashboardBacen() {
    console.log('🔧 Configurando cards do dashboard BACEN...');
    
    // Card Total
    const cardTotal = document.querySelector('#bacen-total-dash')?.closest('.stat-card');
    if (cardTotal) {
        cardTotal.style.cursor = 'pointer';
        cardTotal.onclick = () => {
            console.log('📊 Card Total clicado');
            mostrarCasosDashboardBacen('total');
        };
        console.log('✅ Card Total configurado');
    } else {
        console.warn('⚠️ Card Total não encontrado');
    }
    
    // Card Em Tratativa
    const cardTratativa = document.querySelector('#bacen-tratativa-dash')?.closest('.stat-card');
    if (cardTratativa) {
        cardTratativa.style.cursor = 'pointer';
        cardTratativa.onclick = () => {
            console.log('📊 Card Em Tratativa clicado');
            mostrarCasosDashboardBacen('em-tratativa');
        };
        console.log('✅ Card Em Tratativa configurado');
    } else {
        console.warn('⚠️ Card Em Tratativa não encontrado');
    }
    
    // Card Concluídas
    const cardConcluidas = document.querySelector('#bacen-concluidas-dash')?.closest('.stat-card');
    if (cardConcluidas) {
        cardConcluidas.style.cursor = 'pointer';
        cardConcluidas.onclick = () => {
            console.log('📊 Card Concluídas clicado');
            mostrarCasosDashboardBacen('concluidas');
        };
        console.log('✅ Card Concluídas configurado');
    } else {
        console.warn('⚠️ Card Concluídas não encontrado');
    }
    
    // Card Prazo Vencendo
    const cardPrazo = document.querySelector('#bacen-prazo-vencendo')?.closest('.stat-card');
    if (cardPrazo) {
        cardPrazo.style.cursor = 'pointer';
        cardPrazo.onclick = () => {
            console.log('📊 Card Prazo Vencendo clicado');
            mostrarCasosDashboardBacen('prazo-vencendo');
        };
        console.log('✅ Card Prazo Vencendo configurado');
    } else {
        console.warn('⚠️ Card Prazo Vencendo não encontrado');
    }
}

// Mostrar casos relacionados ao card clicado
function mostrarCasosDashboardBacen(tipo) {
    console.log('🔍 Mostrando casos do dashboard BACEN - tipo:', tipo);
    let filtradas = [];
    let titulo = '';
    
    switch(tipo) {
        case 'total':
            filtradas = fichasBacen;
            titulo = 'Total de Reclamações BACEN';
            break;
        case 'em-tratativa':
            filtradas = fichasBacen.filter(f => f.status === 'em-tratativa');
            titulo = 'Reclamações em Tratativa';
            break;
        case 'concluidas':
            filtradas = fichasBacen.filter(f => f.status === 'concluido' || f.status === 'respondido');
            titulo = 'Reclamações Concluídas';
            break;
        case 'prazo-vencendo':
            const hoje = new Date();
            filtradas = fichasBacen.filter(f => {
                if (!f.prazoBacen) return false;
                const prazo = new Date(f.prazoBacen);
                const diff = (prazo - hoje) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 7;
            });
            titulo = 'Reclamações com Prazo Vencendo';
            break;
    }
    
    console.log('📋 Casos filtrados:', filtradas.length);
    
    if (filtradas.length === 0) {
        mostrarAlerta(`Nenhuma reclamação encontrada para "${titulo}"`, 'info');
        return;
    }
    
    // Criar sidebar com os casos
    if (window.criarModalCasosDashboard) {
        window.criarModalCasosDashboard(titulo, filtradas, 'bacen');
    } else {
        console.error('❌ Função criarModalCasosDashboard não encontrada');
        mostrarAlerta('Erro ao abrir sidebar de casos', 'error');
    }
}

// === LISTA ===
async function renderizarListaBacen() {
    const container = document.getElementById('lista-fichas-bacen');
    if (!container) {
        console.error('❌ Container lista-fichas-bacen não encontrado!');
        return;
    }
    
    // Mostrar loading
    container.innerHTML = '<div class="loading-message">Carregando reclamações...</div>';
    
    // SEMPRE recarregar as fichas antes de renderizar para garantir que temos os dados mais recentes
    console.log('🔄 Recarregando fichas antes de renderizar lista...');
    await carregarFichasBacen();
    
    // Verificar novamente após carregar
    if (!fichasBacen || !Array.isArray(fichasBacen)) {
        console.error('❌ fichasBacen não é um array válido após carregamento');
        fichasBacen = [];
    }
    
    console.log('📋 Renderizando lista geral com', fichasBacen.length, 'fichas');
    console.log('📋 Primeiras 3 fichas:', fichasBacen.slice(0, 3).map(f => ({ id: f.id, nome: f.nomeCompleto })));
    
    const busca = document.getElementById('busca-bacen')?.value.toLowerCase() || '';
    const filtroStatus = document.getElementById('filtro-status-bacen')?.value || '';
    
    // NÃO FILTRAR POR USUÁRIO NA LISTA GERAL - mostrar TODAS as reclamações de TODOS os agentes
    let filtradas = [...fichasBacen]; // Criar cópia para não modificar o array original
    
    // Aplicar busca
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
    
    // Aplicar filtro de status (ignorar "todos")
    if (filtroStatus && filtroStatus !== 'todos') {
        filtradas = filtradas.filter(f => f.status === filtroStatus);
    }
    
    console.log('📋 Fichas após filtros:', filtradas.length);
    
    // Verificar se criarCardBacen existe
    if (typeof criarCardBacen !== 'function' && typeof window.criarCardBacen !== 'function') {
        console.error('❌ Função criarCardBacen não encontrada!');
        container.innerHTML = '<div class="no-results">Erro: Função de renderização não encontrada</div>';
        return;
    }
    
    if (filtradas.length === 0) {
        if (fichasBacen.length === 0) {
            container.innerHTML = '<div class="no-results">Nenhuma reclamação BACEN cadastrada ainda</div>';
        } else {
            container.innerHTML = '<div class="no-results">Nenhuma reclamação BACEN encontrada com os filtros aplicados</div>';
        }
        console.log('⚠️ Nenhuma ficha filtrada encontrada');
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    filtradas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataEntrada || 0);
        const dataB = new Date(b.dataCriacao || b.dataEntrada || 0);
        return dataB - dataA;
    });
    
    // Usar criarCardBacen do window se disponível, senão usar função local
    const criarCard = window.criarCardBacen || criarCardBacen;
    const html = filtradas.map(f => {
        try {
            return criarCard(f);
        } catch (error) {
            console.error('❌ Erro ao criar card para ficha', f.id, ':', error);
            return `<div class="ficha-card">Erro ao renderizar ficha ${f.id}</div>`;
        }
    }).join('');
    
    container.innerHTML = html;
    console.log('✅ Lista BACEN renderizada com sucesso!', filtradas.length, 'fichas exibidas');
}

// Renderizar "Minhas Reclamações"
async function renderizarMinhasReclamacoesBacen() {
    const container = document.getElementById('minhas-fichas-bacen');
    if (!container) {
        console.error('❌ Container minhas-fichas-bacen não encontrado!');
        return;
    }
    
    // Mostrar loading
    container.innerHTML = '<div class="loading-message">Carregando suas reclamações...</div>';
    
    // SEMPRE recarregar as fichas antes de renderizar (AGUARDAR)
    console.log('🔄 Recarregando fichas antes de renderizar minhas reclamações...');
    await carregarFichasBacen();
    
    // Verificar novamente após carregar
    if (!fichasBacen || !Array.isArray(fichasBacen)) {
        console.warn('⚠️ fichasBacen não é um array válido, inicializando...');
        fichasBacen = [];
    }
    
    // Verificar usuário atual - múltiplas fontes
    let usuarioAtual = window.sistemaPerfis?.usuarioAtual;
    
    // Fallback: tentar obter do localStorage
    if (!usuarioAtual) {
        try {
            const usuarioSalvo = localStorage.getItem('velotax_usuario_atual');
            if (usuarioSalvo) {
                usuarioAtual = JSON.parse(usuarioSalvo);
                console.log('✅ Usuário carregado do localStorage:', usuarioAtual);
            }
        } catch (e) {
            console.warn('⚠️ Erro ao carregar usuário do localStorage:', e);
        }
    }
    
    // Fallback: tentar obter da sessão do Google/VeloHub
    if (!usuarioAtual) {
        try {
            const sessionData = localStorage.getItem('velohub_user_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session?.user) {
                    usuarioAtual = {
                        nome: session.user.name,
                        email: session.user.email,
                        foto: session.user.picture
                    };
                    console.log('✅ Usuário carregado da sessão VeloHub:', usuarioAtual);
                }
            }
        } catch (e) {
            console.warn('⚠️ Erro ao carregar usuário da sessão:', e);
        }
    }
    
    if (!usuarioAtual) {
        console.warn('⚠️ Usuário não logado - sistemaPerfis:', window.sistemaPerfis, 'localStorage:', localStorage.getItem('velotax_usuario_atual'));
        container.innerHTML = '<div class="no-results">Você precisa estar logado para ver suas reclamações</div>';
        return;
    }
    
    console.log('👤 Usuário atual identificado:', usuarioAtual);
    console.log('📋 Total de fichas disponíveis:', fichasBacen.length);
    
    // Normalizar nome do usuário atual
    const nomeAtual = (usuarioAtual.nome || '').toString().trim();
    const emailAtual = (usuarioAtual.email || '').toString().trim();
    
    // Normalizar variações de nomes conhecidos
    const normalizarNome = (nome) => {
        if (!nome) return '';
        const nomeLower = nome.toLowerCase().trim();
        // Normalizar "Shirley" - todas as variações
        if (nomeLower.includes('shirley')) {
            return 'shirley';
        }
        // Normalizar "Venssa" - todas as variações
        if (nomeLower.includes('venssa') || nomeLower.includes('venessa') || nomeLower.includes('venesa')) {
            return 'venssa';
        }
        return nomeLower;
    };
    
    const nomeAtualNormalizado = normalizarNome(nomeAtual);
    const emailAtualLower = emailAtual.toLowerCase().trim();
    
    console.log('🔍 Buscando fichas para:', {
        nomeOriginal: nomeAtual,
        nomeNormalizado: nomeAtualNormalizado,
        email: emailAtualLower
    });
    
    // Filtrar apenas reclamações do usuário logado - comparação mais robusta
    const minhasFichas = fichasBacen.filter(f => {
        const responsavelFicha = (f.responsavel || '').toString().trim();
        const responsavelFichaLower = responsavelFicha.toLowerCase();
        const responsavelFichaNormalizado = normalizarNome(responsavelFicha);
        
        // Múltiplas estratégias de comparação
        const match = 
            // Comparação exata (case-insensitive)
            responsavelFichaLower === nomeAtualNormalizado ||
            responsavelFichaLower === emailAtualLower ||
            // Comparação normalizada (para Shirley, Venssa, etc)
            responsavelFichaNormalizado === nomeAtualNormalizado ||
            // Comparação parcial (inclui)
            (nomeAtualNormalizado && responsavelFichaLower.includes(nomeAtualNormalizado)) ||
            (emailAtualLower && responsavelFichaLower.includes(emailAtualLower)) ||
            // Comparação reversa (nome do usuário inclui responsável)
            (nomeAtualNormalizado && nomeAtualNormalizado.includes(responsavelFichaNormalizado));
        
        if (match) {
            console.log('✅ Match encontrado:', {
                fichaId: f.id,
                responsavelFicha: responsavelFicha,
                nomeAtual: nomeAtual,
                matchType: responsavelFichaLower === nomeAtualNormalizado ? 'exato' :
                          responsavelFichaNormalizado === nomeAtualNormalizado ? 'normalizado' :
                          'parcial'
            });
        }
        
        return match;
    });
    
    console.log('📋 Minhas fichas encontradas:', minhasFichas.length);
    if (minhasFichas.length === 0) {
        console.warn('⚠️ Nenhuma ficha encontrada. Verificando responsáveis disponíveis...');
        const responsaveisUnicos = [...new Set(fichasBacen.map(f => f.responsavel).filter(Boolean))];
        console.log('📋 Responsáveis únicos nas fichas:', responsaveisUnicos);
        console.log('📋 Comparação:', {
            buscando: nomeAtualNormalizado || emailAtualLower,
            disponiveis: responsaveisUnicos.map(r => ({ original: r, normalizado: normalizarNome(r) }))
        });
    }
    
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
            ${minhasFichas.map(f => criarCardBacen(f)).join('')}
        </div>
    `;
}

function criarCardBacen(ficha) {
    const statusLabels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
        'respondido': 'Respondido'
    };
    
    const statusClass = `status-${ficha.status}`;
    const statusLabel = statusLabels[ficha.status] || ficha.status;
    
    // Verificar se prazo está vencendo
    let prazoClass = '';
    let prazoText = '';
    if (ficha.prazoBacen) {
        const prazo = new Date(ficha.prazoBacen);
        const hoje = new Date();
        const diff = (prazo - hoje) / (1000 * 60 * 60 * 24);
        if (diff < 0) {
            prazoClass = 'prazo-vencido';
            prazoText = '⚠️ Prazo Vencido';
        } else if (diff <= 7) {
            prazoClass = 'prazo-vencendo';
            prazoText = `⏰ Vence em ${Math.ceil(diff)} dias`;
        }
    }
    
    return `
        <div class="complaint-item" onclick="abrirFichaBacen('${ficha.id}')">
            <div class="complaint-header">
                <div class="complaint-title">
                    ${ficha.nomeCompleto || ficha.nomeCliente || 'Nome não informado'}
                    <span class="bacen-badge">🏦 BACEN</span>
                    ${prazoText ? `<span class="${prazoClass}">${prazoText}</span>` : ''}
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                <div class="complaint-status ${statusClass}">${statusLabel}</div>
                    <button class="btn-excluir-ficha" onclick="event.stopPropagation(); excluirFichaBacen('${ficha.id}')" title="Excluir reclamação">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="complaint-summary">
                <div class="complaint-detail"><strong>CPF:</strong> ${ficha.cpf}</div>
                ${ficha.rdr ? `<div class="complaint-detail"><strong>RDR:</strong> ${ficha.rdr}</div>` : ''}
                ${obterProtocolosFicha(ficha, true) ? `<div class="complaint-detail"><strong>Protocolo(s):</strong> ${obterProtocolosFicha(ficha, true)}</div>` : ''}
                <div class="complaint-detail"><strong>Motivo:</strong> ${ficha.motivoReduzido}</div>
                <div class="complaint-detail"><strong>Prazo BACEN:</strong> ${formatarData(ficha.prazoBacen)}</div>
                <div class="complaint-detail"><strong>Responsável:</strong> ${ficha.responsavel}</div>
                ${ficha.procon ? '<div class="complaint-detail"><strong>⚠️ Com Procon</strong></div>' : ''}
            </div>
        </div>
    `;
}

// Função auxiliar para obter protocolos de uma ficha
function obterProtocolosFicha(ficha, formatoReduzido = false) {
    const protocolosPorTipo = [];
    
    // Protocolo Central
    if (ficha.protocoloCentral && Array.isArray(ficha.protocoloCentral) && ficha.protocoloCentral.length > 0) {
        const protocolos = ficha.protocoloCentral.filter(p => p && p.trim());
        if (protocolos.length > 0) {
            if (formatoReduzido) {
                protocolosPorTipo.push(`Central: ${protocolos.join(', ')}`);
            } else {
                protocolosPorTipo.push(`<strong>Central:</strong> ${protocolos.join(', ')}`);
            }
        }
    }
    
    // Protocolo N2
    if (ficha.protocoloN2 && Array.isArray(ficha.protocoloN2) && ficha.protocoloN2.length > 0) {
        const protocolos = ficha.protocoloN2.filter(p => p && p.trim());
        if (protocolos.length > 0) {
            if (formatoReduzido) {
                protocolosPorTipo.push(`N2: ${protocolos.join(', ')}`);
            } else {
                protocolosPorTipo.push(`<strong>N2:</strong> ${protocolos.join(', ')}`);
            }
        }
    }
    
    // Protocolo Reclame Aqui
    if (ficha.protocoloReclameAqui && Array.isArray(ficha.protocoloReclameAqui) && ficha.protocoloReclameAqui.length > 0) {
        const protocolos = ficha.protocoloReclameAqui.filter(p => p && p.trim());
        if (protocolos.length > 0) {
            if (formatoReduzido) {
                protocolosPorTipo.push(`Reclame Aqui: ${protocolos.join(', ')}`);
            } else {
                protocolosPorTipo.push(`<strong>Reclame Aqui:</strong> ${protocolos.join(', ')}`);
            }
        }
    }
    
    // Protocolo Procon
    if (ficha.protocoloProcon && Array.isArray(ficha.protocoloProcon) && ficha.protocoloProcon.length > 0) {
        const protocolos = ficha.protocoloProcon.filter(p => p && p.trim());
        if (protocolos.length > 0) {
            if (formatoReduzido) {
                protocolosPorTipo.push(`Procon: ${protocolos.join(', ')}`);
            } else {
                protocolosPorTipo.push(`<strong>Procon:</strong> ${protocolos.join(', ')}`);
            }
        }
    }
    
    // Protocolos Sem Acionamento
    if (ficha.protocolosSemAcionamento && ficha.protocolosSemAcionamento.trim()) {
        if (formatoReduzido) {
            protocolosPorTipo.push(`Sem Acionamento: ${ficha.protocolosSemAcionamento.trim()}`);
        } else {
            protocolosPorTipo.push(`<strong>Sem Acionamento:</strong> ${ficha.protocolosSemAcionamento.trim()}`);
        }
    }
    
    if (protocolosPorTipo.length === 0) {
        return null;
    }
    
    // Para visualização reduzida, retornar texto simples separado por vírgula
    if (formatoReduzido) {
        return protocolosPorTipo.join(', ');
    }
    
    // Para visualização completa, retornar HTML formatado
    return protocolosPorTipo.join('<br>');
}

// Criar sidebar para exibir casos do dashboard (função global)
window.criarModalCasosDashboard = function criarModalCasosDashboard(titulo, casos, tipo) {
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
        if (tipo === 'bacen') {
            return criarCardBacen(f);
        } else if (tipo === 'n2') {
            // Tentar usar função global ou do window
            if (typeof criarCardN2 === 'function') {
                return criarCardN2(f);
            } else if (window.criarCardN2) {
                return window.criarCardN2(f);
            }
            return criarCardBacen(f); // Fallback
        } else if (tipo === 'chatbot') {
            // Tentar usar função global ou do window
            if (typeof criarCardChatbot === 'function') {
                return criarCardChatbot(f);
            } else if (window.criarCardChatbot) {
                return window.criarCardChatbot(f);
            }
            return criarCardBacen(f); // Fallback
        }
        return criarCardBacen(f);
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

window.fecharSidebarCasosDashboard = function fecharSidebarCasosDashboard() {
    const sidebar = document.getElementById('sidebar-casos-dashboard');
    if (sidebar) {
        sidebar.classList.remove('aberta');
        setTimeout(() => {
            sidebar.remove();
        }, 300); // Aguardar animação de fechamento
    }
}

function abrirFichaBacen(id) {
    const ficha = fichasBacen.find(f => f.id === id);
    if (!ficha) {
        mostrarAlerta('Ficha não encontrada', 'error');
        return;
    }
    
    // Usa o sistema de fichas específicas
    console.log('🔍 [bacen-page] abrirFichaBacen - Verificando disponibilidade:', {
        fichasEspecificas: !!window.fichasEspecificas,
        FichasEspecificas: !!window.FichasEspecificas,
        tipo: typeof window.FichasEspecificas
    });
    
    if (window.fichasEspecificas && typeof window.fichasEspecificas.abrirFicha === 'function') {
        console.log('✅ [bacen-page] Usando instância existente');
        window.fichasEspecificas.abrirFicha(ficha);
    } else if (window.FichasEspecificas && typeof window.FichasEspecificas === 'function') {
        // Criar instância se não existir
        console.log('✅ [bacen-page] Criando nova instância de FichasEspecificas');
        try {
            window.fichasEspecificas = new window.FichasEspecificas();
        window.fichasEspecificas.abrirFicha(ficha);
        } catch (error) {
            console.error('❌ [bacen-page] Erro ao criar instância:', error);
            mostrarAlerta('Erro ao abrir ficha: ' + error.message, 'error');
        }
    } else {
        // Aguardar mais tempo e tentar novamente (pode ser carregamento assíncrono)
        console.warn('⚠️ [bacen-page] FichasEspecificas não disponível imediatamente, aguardando...');
        let tentativas = 0;
        const maxTentativas = 10; // 5 segundos total
        
        const tentarAbrir = setInterval(() => {
            tentativas++;
            console.log(`🔄 [bacen-page] Tentativa ${tentativas}/${maxTentativas} de abrir ficha`);
            
            if (window.FichasEspecificas && typeof window.FichasEspecificas === 'function') {
                clearInterval(tentarAbrir);
                console.log('✅ [bacen-page] FichasEspecificas disponível após aguardar');
                try {
                    window.fichasEspecificas = new window.FichasEspecificas();
                window.fichasEspecificas.abrirFicha(ficha);
                } catch (error) {
                    console.error('❌ [bacen-page] Erro ao criar instância após aguardar:', error);
                    mostrarAlerta('Erro ao abrir ficha: ' + error.message, 'error');
                }
            } else if (tentativas >= maxTentativas) {
                clearInterval(tentarAbrir);
                console.error('❌ [bacen-page] FichasEspecificas não disponível após', maxTentativas * 500, 'ms');
                console.error('   Verifique se js/fichas-especificas.js está sendo carregado corretamente');
                console.error('   window.FichasEspecificas:', window.FichasEspecificas);
                mostrarAlerta('Sistema de fichas não disponível. Verifique o console para mais detalhes.', 'error');
            }
        }, 500);
    }
}

// === RELATÓRIOS ===
function gerarRelatorioPeriodoBacen() {
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
        
        const filtradas = fichasBacen.filter(f => {
            const data = new Date(f.dataEntrada || f.dataReclamacao || f.dataCriacao);
            return data >= inicioDate && data <= fimDate;
        });
        
        mostrarRelatorio('Relatório por Período - BACEN', filtradas, `Período: ${inicio} a ${fim}`);
    });
}

function gerarRelatorioPrazosBacen() {
    const hoje = new Date();
    const vencendo = fichasBacen.filter(f => {
        const prazoBacen = f.prazoBacen || f.prazoRetorno;
        if (!prazoBacen) return false;
        const prazo = new Date(prazoBacen);
        return prazo <= hoje || (prazo - hoje) / (1000 * 60 * 60 * 24) <= 7;
    });
    
    mostrarRelatorio('Relatório de Prazos - BACEN', vencendo, 'Fichas com prazo vencendo ou vencido');
}

function gerarRelatorioCompletoBacen() {
    mostrarRelatorio('Relatório Completo - BACEN', fichasBacen, `Total: ${fichasBacen.length} fichas`);
}

function mostrarRelatorio(titulo, dados, subtitulo) {
    const container = document.getElementById('conteudo-relatorio-bacen');
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
                        <th>Status</th>
                        <th>Prazo BACEN</th>
                        <th>Procon</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(f => `
                        <tr>
                            <td>${f.nomeCompleto || f.nomeCliente || '-'}</td>
                            <td>${f.cpf || '-'}</td>
                            <td>${f.status || '-'}</td>
                            <td>${formatarData(f.prazoBacen || f.prazoRetorno)}</td>
                            <td>${f.procon ? 'Sim' : 'Não'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
                    <button class="velohub-btn" onclick="filtrosExportacaoCSVBacen.mostrarModalFiltros(${JSON.stringify(dados).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}, exportarRelatorioBacenDados)">📥 Exportar CSV com Filtros</button>
                    <button class="velohub-btn" onclick="exportarParaExcel(${JSON.stringify(dados).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}, 'relatorio-bacen', 'bacen')">📊 Exportar Excel</button>
    `;
}

function exportarRelatorioBacenDados(dados) {
    if (!dados) {
        // Tenta obter dados do contexto
        const container = document.getElementById('conteudo-relatorio-bacen');
        if (container) {
            const table = container.querySelector('table tbody');
            if (table) {
                dados = fichasBacen;
            }
        }
    }
    
    if (!dados || dados.length === 0) {
        mostrarAlerta('Nenhum dado para exportar', 'error');
        return;
    }
    
    const headers = ['Cliente', 'CPF', 'Status', 'Prazo BACEN', 'Procon', 'Data Entrada'];
    const rows = dados.map(f => [
        f.nomeCompleto || f.nomeCliente || '',
        f.cpf || '',
        f.status || '',
        formatarData(f.prazoBacen || f.prazoRetorno),
        f.procon ? 'Sim' : 'Não',
        formatarData(f.dataEntrada || f.dataReclamacao)
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-bacen-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// === UTILITÁRIOS ===
// === OBTER TENTATIVAS DE CONTATO ===
function obterTentativasBacen() {
    const tentativas = [];
    const tentativasInputs = document.querySelectorAll('#tentativas-contato-bacen .tentativa-data');
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

function limparFormBacen() {
    document.getElementById('form-bacen')?.reset();
    // Não preencher automaticamente após limpar
    // Limpar tentativas dinâmicas (manter apenas as 2 primeiras)
    const container = document.getElementById('tentativas-contato-bacen');
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
        contadorTentativasBacen = 2;
    }
    // Limpar anexos
    if (window.gerenciadorAnexos) {
        window.gerenciadorAnexos.limparAnexosFormulario('anexos-preview-bacen');
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

// Função global para mostrar modal de seleção de período
function mostrarModalPeriodo(callback) {
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

// Funções de máscara (reutilizar do main.js)
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

