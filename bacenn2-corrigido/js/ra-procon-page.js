/* === SISTEMA DE GESTÃO RECLAMEAQUI E PROCON - PÁGINA ESPECÍFICA === */
/* VERSÃO: v1.0.0 | DATA: 2026-01-XX | ALTERAÇÕES: Sistema refinado e minucioso para RA e Procon */

// Variáveis globais
let fichasRAPROCON = [];
let graficosRAPROCON = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (window.loadingVelotax) {
        window.loadingVelotax.mostrar();
        window.loadingVelotax.esconderForcado();
    }
    
    try {
        inicializarRAPROCON();
        carregarFichasRAPROCON().then(() => {
            atualizarDashboardRAPROCON();
        });
        configurarEventosRAPROCON();
    } catch (error) {
        console.error('❌ Erro na inicialização RA/Procon:', error);
    } finally {
        setTimeout(() => {
            if (window.loadingVelotax) {
                window.loadingVelotax.esconder();
            }
        }, 500);
    }
});

// === INICIALIZAÇÃO ===
function inicializarRAPROCON() {
    // Listener para quando Firebase estiver pronto
    window.addEventListener('firebaseReady', async function(event) {
        console.log('🔥 [RA/PROCON] Firebase está pronto! Recarregando fichas...');
        await new Promise(resolve => setTimeout(resolve, 500));
        await carregarFichasRAPROCON();
        atualizarDashboardRAPROCON();
        const secaoLista = document.getElementById('lista-ra-procon');
        if (secaoLista && secaoLista.classList.contains('active')) {
            renderizarListaRAPROCON();
        }
    });
    
    // Listener para atualizar quando fichas forem importadas
    window.addEventListener('reclamacaoSalva', function(event) {
        if (event.detail && event.detail.tipo === 'ra-procon') {
            carregarFichasRAPROCON().then(() => {
                atualizarDashboardRAPROCON();
                renderizarListaRAPROCON();
            });
        }
    });
    
    // Definir data de entrada como hoje por padrão
    const dataEntrada = document.getElementById('ra-procon-data-entrada');
    if (dataEntrada && !dataEntrada.value) {
        const hoje = new Date().toISOString().split('T')[0];
        dataEntrada.value = hoje;
    }
}

// === CONFIGURAÇÃO DE EVENTOS ===
function configurarEventosRAPROCON() {
    const form = document.getElementById('form-ra-procon');
    if (form) {
        form.addEventListener('submit', handleSubmitRAPROCON);
    }
    
    const busca = document.getElementById('busca-ra-procon');
    if (busca) {
        busca.addEventListener('input', renderizarListaRAPROCON);
    }
}

// === CARREGAMENTO DE DADOS ===
async function carregarFichasRAPROCON() {
    console.log('📥 [RA/PROCON] Carregando fichas...');
    
    try {
        if (window.armazenamentoReclamacoes) {
            fichasRAPROCON = await window.armazenamentoReclamacoes.carregarTodos('ra-procon') || [];
            console.log(`✅ [RA/PROCON] ${fichasRAPROCON.length} fichas carregadas do Firebase`);
        } else {
            // Fallback para localStorage
            const dados = localStorage.getItem('velotax_reclamacoes_ra_procon');
            fichasRAPROCON = dados ? JSON.parse(dados) : [];
            console.log(`✅ [RA/PROCON] ${fichasRAPROCON.length} fichas carregadas do localStorage`);
        }
        
        // Garantir que todas as fichas tenham tipoDemanda
        fichasRAPROCON = fichasRAPROCON.map(f => ({
            ...f,
            tipoDemanda: f.tipoDemanda || 'ra-procon'
        }));
        
    } catch (error) {
        console.error('❌ [RA/PROCON] Erro ao carregar fichas:', error);
        fichasRAPROCON = [];
    }
}

// === TOGGLE CAMPOS ESPECÍFICOS ===
function toggleCamposEspecificos() {
    const tipo = document.querySelector('input[name="ra-procon-tipo"]:checked')?.value;
    const camposRA = document.getElementById('campos-reclame-aqui');
    const camposProcon = document.getElementById('campos-procon');
    
    if (camposRA) camposRA.style.display = tipo === 'reclame-aqui' ? 'block' : 'none';
    if (camposProcon) camposProcon.style.display = tipo === 'procon' ? 'block' : 'none';
}

// === HANDLE SUBMIT ===
async function handleSubmitRAPROCON(e) {
    e.preventDefault();
    console.log('💾 [RA/PROCON] Salvando nova reclamação...');
    
    const tipo = document.querySelector('input[name="ra-procon-tipo"]:checked')?.value;
    if (!tipo) {
        mostrarAlerta('Selecione o tipo de reclamação (ReclameAqui ou Procon)', 'error');
        return;
    }
    
    const dados = {
        id: 'raprocon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        tipoDemanda: 'ra-procon',
        tipo: tipo, // 'reclame-aqui' ou 'procon'
        mes: obterValorCampoRAPROCON('ra-procon-mes'),
        protocolo: obterValorCampoRAPROCON('ra-procon-protocolo'),
        nomeCompleto: obterValorCampoRAPROCON('ra-procon-nome'),
        cpf: obterValorCampoRAPROCON('ra-procon-cpf'),
        telefone: obterValorCampoRAPROCON('ra-procon-telefone'),
        email: obterValorCampoRAPROCON('ra-procon-email'),
        motivo: obterValorCampoRAPROCON('ra-procon-motivo'),
        detalhamento: obterValorCampoRAPROCON('ra-procon-detalhamento'),
        status: obterValorCampoRAPROCON('ra-procon-status'),
        prioridade: obterValorCampoRAPROCON('ra-procon-prioridade'),
        dataEntrada: obterValorCampoRAPROCON('ra-procon-data-entrada'),
        dataResolucao: obterValorCampoRAPROCON('ra-procon-data-resolucao'),
        observacoes: obterValorCampoRAPROCON('ra-procon-observacoes'),
        responsavel: window.sistemaPerfis?.usuarioAtual?.nome || window.sistemaPerfis?.usuarioAtual?.email || 'Sistema',
        dataCriacao: new Date().toISOString()
    };
    
    // Campos específicos ReclameAqui
    if (tipo === 'reclame-aqui') {
        dados.camposEspecificos = {
            nota: obterValorCampoRAPROCON('ra-nota'),
            dataPublicacao: obterValorCampoRAPROCON('ra-data-publicacao'),
            comentario: obterValorCampoRAPROCON('ra-comentario'),
            link: obterValorCampoRAPROCON('ra-link')
        };
    }
    
    // Campos específicos Procon
    if (tipo === 'procon') {
        dados.camposEspecificos = {
            orgao: obterValorCampoRAPROCON('procon-orgao'),
            dataRecebimento: obterValorCampoRAPROCON('procon-data-recebimento'),
            prazoResposta: obterValorCampoRAPROCON('procon-prazo-resposta'),
            valorReclamado: obterValorCampoRAPROCON('procon-valor-reclamado'),
            descricao: obterValorCampoRAPROCON('procon-descricao')
        };
    }
    
    try {
        if (window.armazenamentoReclamacoes) {
            await window.armazenamentoReclamacoes.salvar('ra-procon', dados);
            console.log('✅ [RA/PROCON] Ficha salva com sucesso:', dados.id);
            
            window.dispatchEvent(new CustomEvent('reclamacaoSalva', {
                detail: { tipo: 'ra-procon', reclamacao: dados, origem: 'criacao' }
            }));
            
            mostrarAlerta('Reclamação salva com sucesso!', 'sucesso');
            limparFormRAPROCON();
            
            // Atualizar dashboard e lista
            await carregarFichasRAPROCON();
            atualizarDashboardRAPROCON();
            renderizarListaRAPROCON();
        } else {
            console.error('❌ [RA/PROCON] armazenamentoReclamacoes não disponível');
            mostrarAlerta('Erro: Sistema de armazenamento não disponível', 'erro');
        }
    } catch (error) {
        console.error('❌ [RA/PROCON] Erro ao salvar:', error);
        mostrarAlerta('Erro ao salvar reclamação: ' + error.message, 'erro');
    }
}

// === FUNÇÕES AUXILIARES ===
function obterValorCampoRAPROCON(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : '';
}

function limparFormRAPROCON() {
    document.getElementById('form-ra-procon')?.reset();
    toggleCamposEspecificos();
    const dataEntrada = document.getElementById('ra-procon-data-entrada');
    if (dataEntrada) {
        const hoje = new Date().toISOString().split('T')[0];
        dataEntrada.value = hoje;
    }
}

// === DASHBOARD ===
function atualizarDashboardRAPROCON() {
    const total = fichasRAPROCON.length;
    const ra = fichasRAPROCON.filter(f => f.tipo === 'reclame-aqui').length;
    const procon = fichasRAPROCON.filter(f => f.tipo === 'procon').length;
    const emTratativa = fichasRAPROCON.filter(f => f.status === 'em-tratativa').length;
    const concluidas = fichasRAPROCON.filter(f => f.status === 'concluido' || f.status === 'respondido').length;
    const pendentes = fichasRAPROCON.filter(f => f.status === 'nao-iniciado' || f.status === 'aguardando-cliente').length;
    
    atualizarElemento('ra-procon-total-dash', total);
    atualizarElemento('ra-total-dash', ra);
    atualizarElemento('procon-total-dash', procon);
    atualizarElemento('ra-procon-tratativa-dash', emTratativa);
    atualizarElemento('ra-procon-concluidas-dash', concluidas);
    atualizarElemento('ra-procon-pendentes-dash', pendentes);
    
    // Renderizar gráficos
    renderizarGraficosRAPROCON();
}

// === RENDERIZAR GRÁFICOS ===
function renderizarGraficosRAPROCON() {
    // Gráfico por Tipo
    const ctxTipo = document.getElementById('grafico-tipo-ra-procon');
    if (ctxTipo) {
        if (graficosRAPROCON.tipo) graficosRAPROCON.tipo.destroy();
        
        const ra = fichasRAPROCON.filter(f => f.tipo === 'reclame-aqui').length;
        const procon = fichasRAPROCON.filter(f => f.tipo === 'procon').length;
        
        graficosRAPROCON.tipo = new Chart(ctxTipo, {
            type: 'doughnut',
            data: {
                labels: ['ReclameAqui', 'Procon'],
                datasets: [{
                    data: [ra, procon],
                    backgroundColor: ['#1694FF', '#000058']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Gráfico Mensal
    const ctxMensal = document.getElementById('grafico-mensal-ra-procon');
    if (ctxMensal) {
        if (graficosRAPROCON.mensal) graficosRAPROCON.mensal.destroy();
        
        const meses = {};
        fichasRAPROCON.forEach(f => {
            const mes = f.mes || 'Sem mês';
            meses[mes] = (meses[mes] || 0) + 1;
        });
        
        graficosRAPROCON.mensal = new Chart(ctxMensal, {
            type: 'bar',
            data: {
                labels: Object.keys(meses).sort(),
                datasets: [{
                    label: 'Reclamações',
                    data: Object.keys(meses).sort().map(m => meses[m]),
                    backgroundColor: '#1634FF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Gráfico por Status
    const ctxStatus = document.getElementById('grafico-status-ra-procon');
    if (ctxStatus) {
        if (graficosRAPROCON.status) graficosRAPROCON.status.destroy();
        
        const statusCount = {};
        fichasRAPROCON.forEach(f => {
            const status = f.status || 'nao-iniciado';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        
        graficosRAPROCON.status = new Chart(ctxStatus, {
            type: 'pie',
            data: {
                labels: Object.keys(statusCount).map(s => formatarStatus(s)),
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: ['#1634FF', '#1DFDB9', '#15A237', '#FCC200', '#FF8400', '#FF00D7']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// === RENDERIZAR LISTA ===
function renderizarListaRAPROCON() {
    const container = document.getElementById('fichas-container-ra-procon');
    if (!container) return;
    
    const busca = document.getElementById('busca-ra-procon')?.value.toLowerCase() || '';
    let fichasFiltradas = fichasRAPROCON;
    
    if (busca) {
        fichasFiltradas = fichasRAPROCON.filter(f => {
            const nome = (f.nomeCompleto || '').toLowerCase();
            const cpf = (f.cpf || '').toLowerCase();
            const protocolo = (f.protocolo || '').toLowerCase();
            return nome.includes(busca) || cpf.includes(busca) || protocolo.includes(busca);
        });
    }
    
    if (fichasFiltradas.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma reclamação encontrada</div>';
        return;
    }
    
    // Ordenar por data de entrada (mais recente primeiro)
    fichasFiltradas.sort((a, b) => {
        const dataA = new Date(a.dataEntrada || a.dataCriacao || 0);
        const dataB = new Date(b.dataEntrada || b.dataCriacao || 0);
        return dataB - dataA;
    });
    
    container.innerHTML = fichasFiltradas.map(f => criarCardRAPROCON(f)).join('');
}

// === CRIAR CARD ===
function criarCardRAPROCON(ficha) {
    const tipoLabel = ficha.tipo === 'reclame-aqui' ? 'ReclameAqui' : 'Procon';
    const tipoCor = ficha.tipo === 'reclame-aqui' ? '#1694FF' : '#000058';
    const statusLabels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'aguardando-cliente': 'Aguardando Cliente',
        'concluido': 'Concluído',
        'respondido': 'Respondido',
        'arquivado': 'Arquivado'
    };
    const statusLabel = statusLabels[ficha.status] || ficha.status;
    const statusClass = `status-${ficha.status}`;
    
    return `
        <div class="complaint-item" onclick="abrirFichaRAPROCON('${ficha.id}')" style="cursor: pointer;">
            <div class="complaint-header">
                <div class="complaint-title">
                    ${ficha.nomeCompleto || 'Nome não informado'}
                    <span class="n2-badge" style="background: ${tipoCor};">${tipoLabel}</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <div class="complaint-status ${statusClass}">${statusLabel}</div>
                    ${ficha.prioridade ? `<span class="badge-prioridade prioridade-${ficha.prioridade}">${ficha.prioridade.toUpperCase()}</span>` : ''}
                </div>
            </div>
            <div class="complaint-summary">
                <div class="complaint-detail"><strong>CPF:</strong> ${ficha.cpf || '-'}</div>
                <div class="complaint-detail"><strong>Protocolo:</strong> ${ficha.protocolo || '-'}</div>
                <div class="complaint-detail"><strong>Motivo:</strong> ${ficha.motivo || '-'}</div>
                <div class="complaint-detail"><strong>Data Entrada:</strong> ${formatarData(ficha.dataEntrada)}</div>
                <div class="complaint-detail"><strong>Responsável:</strong> ${ficha.responsavel || '-'}</div>
            </div>
        </div>
    `;
}

// === ABRIR FICHA ===
function abrirFichaRAPROCON(id) {
    const ficha = fichasRAPROCON.find(f => f.id === id);
    if (!ficha) {
        mostrarAlerta('Ficha não encontrada', 'error');
        return;
    }
    
    // Usar sistema de fichas específicas se disponível
    if (window.FichasEspecificas) {
        const fichasEspecificas = new window.FichasEspecificas();
        fichasEspecificas.abrirFicha('ra-procon', ficha);
    } else {
        // Fallback: mostrar em modal simples
        mostrarFichaRAPROCONModal(ficha);
    }
}

// === FUNÇÕES DE FILTRO ===
function filtrarPorTipo(tipo) {
    // Atualizar botões
    document.querySelectorAll('#filtro-tipo-todos, #filtro-tipo-ra, #filtro-tipo-procon').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (tipo === 'todos') {
        document.getElementById('filtro-tipo-todos')?.classList.add('active');
    } else if (tipo === 'reclame-aqui') {
        document.getElementById('filtro-tipo-ra')?.classList.add('active');
    } else if (tipo === 'procon') {
        document.getElementById('filtro-tipo-procon')?.classList.add('active');
    }
    
    // Filtrar e renderizar
    let fichasFiltradas = fichasRAPROCON;
    if (tipo !== 'todos') {
        fichasFiltradas = fichasRAPROCON.filter(f => f.tipo === tipo);
    }
    
    const container = document.getElementById('fichas-container-ra-procon');
    if (container) {
        if (fichasFiltradas.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhuma reclamação encontrada</div>';
        } else {
            container.innerHTML = fichasFiltradas.map(f => criarCardRAPROCON(f)).join('');
        }
    }
}

// === BUSCA ===
function buscarRAPROCON() {
    renderizarListaRAPROCON();
}

// === FUNÇÕES DE RELATÓRIO ===
function gerarRelatorioTipoRAPROCON() {
    const ra = fichasRAPROCON.filter(f => f.tipo === 'reclame-aqui').length;
    const procon = fichasRAPROCON.filter(f => f.tipo === 'procon').length;
    
    mostrarRelatorioRAPROCON('Relatório por Tipo', {
        'ReclameAqui': ra,
        'Procon': procon
    });
}

function gerarRelatorioStatusRAPROCON() {
    const statusCount = {};
    fichasRAPROCON.forEach(f => {
        const status = f.status || 'nao-iniciado';
        statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    mostrarRelatorioRAPROCON('Relatório por Status', statusCount);
}

function gerarRelatorioMensalRAPROCON() {
    const meses = {};
    fichasRAPROCON.forEach(f => {
        const mes = f.mes || 'Sem mês';
        meses[mes] = (meses[mes] || 0) + 1;
    });
    
    mostrarRelatorioRAPROCON('Relatório Mensal', meses);
}

function gerarRelatorioPrioridadeRAPROCON() {
    const prioridades = {};
    fichasRAPROCON.forEach(f => {
        const prioridade = f.prioridade || 'sem-prioridade';
        prioridades[prioridade] = (prioridades[prioridade] || 0) + 1;
    });
    
    mostrarRelatorioRAPROCON('Relatório por Prioridade', prioridades);
}

function mostrarRelatorioRAPROCON(titulo, dados) {
    const container = document.getElementById('conteudo-relatorio-ra-procon');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <h3>${titulo}</h3>
        <table class="relatorio-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantidade</th>
                    <th>Percentual</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(dados).map(([item, qtd]) => {
                    const total = Object.values(dados).reduce((a, b) => a + b, 0);
                    const percentual = total > 0 ? ((qtd / total) * 100).toFixed(1) : 0;
                    return `
                        <tr>
                            <td>${item}</td>
                            <td>${qtd}</td>
                            <td>${percentual}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <button class="velohub-btn" onclick="exportarRelatorioRAPROCON(${JSON.stringify(dados).replace(/"/g, '&quot;')})">📥 Exportar CSV</button>
    `;
}

// === EXPORTAÇÃO ===
function exportarListaRAPROCON() {
    const headers = ['Tipo', 'Protocolo', 'Nome', 'CPF', 'Status', 'Prioridade', 'Data Entrada', 'Responsável'];
    const rows = fichasRAPROCON.map(f => [
        f.tipo === 'reclame-aqui' ? 'ReclameAqui' : 'Procon',
        f.protocolo || '',
        f.nomeCompleto || '',
        f.cpf || '',
        f.status || '',
        f.prioridade || '',
        formatarData(f.dataEntrada) || '',
        f.responsavel || ''
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ra-procon-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// === IMPORTAR PLANILHA ===
async function importarPlanilhaRAPROCON() {
    const input = document.getElementById('arquivo-ra-procon');
    if (!input || !input.files || input.files.length === 0) {
        mostrarAlerta('Selecione um arquivo Excel', 'error');
        return;
    }
    
    const file = input.files[0];
    console.log('📥 [RA/PROCON] Importando planilha:', file.name);
    
    // Aqui você pode usar uma biblioteca como SheetJS para ler o Excel
    // Por enquanto, apenas log
    mostrarAlerta('Funcionalidade de importação será implementada em breve', 'info');
}

// === FUNÇÕES AUXILIARES ===
function formatarStatus(status) {
    const statusMap = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'aguardando-cliente': 'Aguardando Cliente',
        'concluido': 'Concluído',
        'respondido': 'Respondido',
        'arquivado': 'Arquivado'
    };
    return statusMap[status] || status;
}

function formatarData(dataString) {
    if (!dataString) return 'Não informada';
    try {
        return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
        return dataString;
    }
}

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

// Expor funções globalmente
window.filtrarPorTipo = filtrarPorTipo;
window.buscarRAPROCON = buscarRAPROCON;
window.abrirFichaRAPROCON = abrirFichaRAPROCON;
window.toggleCamposEspecificos = toggleCamposEspecificos;
window.limparFormRAPROCON = limparFormRAPROCON;
window.gerarRelatorioTipoRAPROCON = gerarRelatorioTipoRAPROCON;
window.gerarRelatorioStatusRAPROCON = gerarRelatorioStatusRAPROCON;
window.gerarRelatorioMensalRAPROCON = gerarRelatorioMensalRAPROCON;
window.gerarRelatorioPrioridadeRAPROCON = gerarRelatorioPrioridadeRAPROCON;
window.exportarListaRAPROCON = exportarListaRAPROCON;
window.importarPlanilhaRAPROCON = importarPlanilhaRAPROCON;

