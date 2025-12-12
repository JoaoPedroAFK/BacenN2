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
            atualizarDashboardBacen();
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
}

// === NAVEGAÇÃO ===
function mostrarSecao(secaoId) {
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
    }
    
    // Ativar botão correspondente
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${secaoId}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Ações específicas
    if (secaoId === 'lista-bacen') {
        carregarFichasBacen();
        renderizarListaBacen();
    } else if (secaoId === 'minhas-reclamacoes-bacen') {
        carregarFichasBacen();
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
        setTimeout(() => {
            if (window.graficosDetalhadosBacen) {
                window.graficosDetalhadosBacen.carregarDados();
                window.graficosDetalhadosBacen.renderizarGraficos();
            } else {
                window.graficosDetalhadosBacen = new GraficosDetalhados('bacen');
            }
        }, 300);
    }
}

// === CARREGAR FICHAS ===
async function carregarFichasBacen() {
    // Tentar usar Supabase primeiro
    if (window.supabaseDB) {
        try {
            fichasBacen = await window.supabaseDB.obterFichasBacen();
            return;
        } catch (error) {
            console.error('Erro ao carregar do Supabase:', error);
        }
    }
    
    // Fallback para gerenciador de fichas
    if (window.gerenciadorFichas) {
        fichasBacen = window.gerenciadorFichas.obterFichasPorTipo('bacen');
    } else if (window.GerenciadorFichasPerfil) {
        // Inicializa se não estiver
        window.gerenciadorFichas = new GerenciadorFichasPerfil();
        fichasBacen = window.gerenciadorFichas.obterFichasPorTipo('bacen');
    } else {
        // Fallback para localStorage
        const fichas = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
        fichasBacen = fichas.map(f => ({ ...f, tipoDemanda: 'bacen' }));
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
    
    const telefone = document.getElementById('bacen-telefone');
    if (telefone) {
        telefone.addEventListener('input', formatPhone);
    }
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
        telefone: obterValorCampo('bacen-telefone'),
        origem: obterValorCampo('bacen-origem'),
        motivoReduzido: obterValorCampo('bacen-motivo-reduzido'),
        motivoDetalhado: obterValorCampo('bacen-motivo-detalhado'),
        prazoBacen: obterValorCampo('bacen-prazo-bacen'),
        tentativasContato: obterTentativasBacen(), // Coletar todas as tentativas
        acionouCentral: obterCheckbox('bacen-acionou-central'),
        protocoloCentral: obterValorCampo('bacen-protocolo-central'),
        n2SegundoNivel: obterCheckbox('bacen-n2-segundo-nivel'),
        protocoloN2: obterValorCampo('bacen-protocolo-n2'),
        reclameAqui: obterCheckbox('bacen-reclame-aqui'),
        protocoloReclameAqui: obterValorCampo('bacen-protocolo-reclame-aqui'),
        procon: obterCheckbox('bacen-procon'),
        protocoloProcon: obterValorCampo('bacen-protocolo-procon'),
        protocolosSemAcionamento: obterValorCampo('bacen-protocolos-sem-acionamento'),
        pixStatus: obterValorCampo('bacen-pix-status'),
        enviarCobranca: document.querySelector('input[name="bacen-enviar-cobranca"]:checked')?.value || 'Não',
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
        if (window.supabaseDB) {
            console.log('📦 Usando Supabase');
            try {
                await window.supabaseDB.salvarFichaBacen(ficha);
                console.log('✅ Salvo no Supabase');
            } catch (error) {
                console.error('❌ Erro ao salvar no Supabase:', error);
                // Fallback
                if (window.gerenciadorFichas) {
                    window.gerenciadorFichas.adicionarFicha(ficha);
                    console.log('💾 Fallback: salvo via gerenciadorFichas');
                } else {
                    fichasBacen.push(ficha);
                    localStorage.setItem('velotax_demandas_bacen', JSON.stringify(fichasBacen));
                    console.log('💾 Fallback: salvo no localStorage');
                }
            }
        } else if (window.gerenciadorFichas) {
            window.gerenciadorFichas.adicionarFicha(ficha);
            console.log('💾 Salvo via gerenciadorFichas');
        } else {
            fichasBacen.push(ficha);
            localStorage.setItem('velotax_demandas_bacen', JSON.stringify(fichasBacen));
            console.log('💾 Salvo no localStorage');
        }
        
        // Limpar e atualizar
        console.log('🧹 Limpando formulário...');
        limparFormBacen();
        await carregarFichasBacen();
        atualizarDashboardBacen();
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
function atualizarDashboardBacen() {
    carregarFichasBacen();
    
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
}

// === LISTA ===
function renderizarListaBacen() {
    const container = document.getElementById('lista-fichas-bacen');
    if (!container) return;
    
    const busca = document.getElementById('busca-bacen')?.value.toLowerCase() || '';
    const filtroStatus = document.getElementById('filtro-status-bacen')?.value || '';
    
    // NÃO FILTRAR POR USUÁRIO NA LISTA GERAL - mostrar todas as reclamações
    let filtradas = fichasBacen;
    
    // Aplicar busca
    if (busca) {
        filtradas = filtradas.filter(f => {
            const nome = (f.nomeCompleto || '').toLowerCase();
            const cpf = (f.cpf || '').toLowerCase();
            const motivo = (f.motivoReduzido || '').toLowerCase();
            return nome.includes(busca) || cpf.includes(busca) || motivo.includes(busca);
        });
    }
    
    // Aplicar filtro de status
    if (filtroStatus) {
        filtradas = filtradas.filter(f => f.status === filtroStatus);
    }
    
    if (filtradas.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhuma ficha BACEN encontrada</div>';
        return;
    }
    
    container.innerHTML = filtradas.map(f => criarCardBacen(f)).join('');
}

// Renderizar "Minhas Reclamações"
function renderizarMinhasReclamacoesBacen() {
    const container = document.getElementById('minhas-fichas-bacen');
    if (!container) return;
    
    const usuarioAtual = window.sistemaPerfis?.usuarioAtual;
    if (!usuarioAtual) {
        container.innerHTML = '<div class="no-results">Você precisa estar logado para ver suas reclamações</div>';
        return;
    }
    
    const responsavelAtual = usuarioAtual.nome || usuarioAtual.email;
    
    // Filtrar apenas reclamações do usuário logado
    const minhasFichas = fichasBacen.filter(f => {
        const responsavelFicha = f.responsavel || '';
        return responsavelFicha === responsavelAtual || 
               responsavelFicha === usuarioAtual.email ||
               responsavelFicha === usuarioAtual.nome;
    });
    
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
                <div class="complaint-status ${statusClass}">${statusLabel}</div>
            </div>
            <div class="complaint-summary">
                <div class="complaint-detail"><strong>CPF:</strong> ${ficha.cpf}</div>
                <div class="complaint-detail"><strong>Motivo:</strong> ${ficha.motivoReduzido}</div>
                <div class="complaint-detail"><strong>Prazo BACEN:</strong> ${formatarData(ficha.prazoBacen)}</div>
                <div class="complaint-detail"><strong>Responsável:</strong> ${ficha.responsavel}</div>
                ${ficha.procon ? '<div class="complaint-detail"><strong>⚠️ Com Procon</strong></div>' : ''}
            </div>
        </div>
    `;
}

function abrirFichaBacen(id) {
    const ficha = fichasBacen.find(f => f.id === id);
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
function gerarRelatorioPeriodoBacen() {
    const inicio = prompt('Data inicial (DD/MM/AAAA):');
    const fim = prompt('Data final (DD/MM/AAAA):');
    
    if (!inicio || !fim) return;
    
    const inicioDate = parseDate(inicio);
    const fimDate = parseDate(fim);
    
    const filtradas = fichasBacen.filter(f => {
        const data = new Date(f.dataEntrada || f.dataReclamacao || f.dataCriacao);
        return data >= inicioDate && data <= fimDate;
    });
    
    mostrarRelatorio('Relatório por Período - BACEN', filtradas, `Período: ${inicio} a ${fim}`);
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

