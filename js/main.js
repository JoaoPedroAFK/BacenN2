/* === SISTEMA DE RECLAMAÇÕES BACEN - JAVASCRIPT PRINCIPAL === */

// === VARIÁVEIS GLOBAIS ===
let complaints = [];
let currentFilter = 'all';

// Carrega fichas usando o gerenciador
function carregarFichas() {
    if (window.gerenciadorFichas) {
        complaints = window.gerenciadorFichas.obterFichasPorPerfil();
    } else {
        // Fallback para compatibilidade
        complaints = JSON.parse(localStorage.getItem('bacen-complaints') || '[]');
    }
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
    // Mostra loading
    if (window.loadingVelotax) {
        window.loadingVelotax.mostrar();
        window.loadingVelotax.esconderForcado(); // Segurança: esconde após 5s
    }
    
    // Aguarda o gerenciador de fichas estar pronto
    setTimeout(() => {
        try {
            initializeApp();
            carregarFichas();
            updateDashboard();
            setupEventListeners();
            
            // Atualiza home stats após um pouco mais de tempo
            setTimeout(() => {
                atualizarHomeStats();
                // Esconde loading
                if (window.loadingVelotax) {
                    window.loadingVelotax.esconder();
                }
            }, 300);
        } catch (error) {
            console.error('Erro na inicialização:', error);
            // Garante que o loading seja escondido mesmo em caso de erro
            if (window.loadingVelotax) {
                window.loadingVelotax.esconder();
            }
        }
    }, 100);
});

// === INICIALIZAR APLICAÇÃO ===
function initializeApp() {
    // Mostrar seção home por padrão
    showSection('home');
    atualizarHomeStats();
    
    // Configurar data atual nos campos de data
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data-reclamacao').value = today;
    document.getElementById('data-recebimento').value = today;
    document.getElementById('data-status').value = today;
    
    // Carregar dados salvos se existirem
    loadFormData();
}

// === NAVEGAÇÃO ===
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Ativar botão correspondente
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${sectionId}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Ações específicas por seção
    if (sectionId === 'list') {
        carregarFichas();
        renderComplaintsList();
    } else if (sectionId === 'dashboard') {
        carregarFichas();
        updateDashboard();
    } else if (sectionId === 'register') {
        loadFormData();
    } else if (sectionId === 'home') {
        atualizarHomeStats();
    }
}

// === FUNÇÕES DE HOME ===
function atualizarHomeStats() {
    if (!window.gerenciadorFichas) {
        // Tenta novamente após um tempo
        setTimeout(atualizarHomeStats, 500);
        return;
    }
    
    const stats = window.gerenciadorFichas.obterEstatisticas();
    
    // Atualiza stats BACEN
    const fichasBacen = window.gerenciadorFichas.obterFichasPorTipo('bacen');
    document.getElementById('bacen-total').textContent = fichasBacen.length || 0;
    document.getElementById('bacen-tratativa').textContent = 
        fichasBacen.filter(f => f.status === 'em-tratativa').length;
    
    // Atualiza stats N2
    const fichasN2 = window.gerenciadorFichas.obterFichasPorTipo('n2');
    document.getElementById('n2-total').textContent = fichasN2.length || 0;
    document.getElementById('n2-tratativa').textContent = 
        fichasN2.filter(f => f.status === 'em-tratativa').length;
    
    // Atualiza stats Chatbot
    const fichasChatbot = window.gerenciadorFichas.obterFichasPorTipo('chatbot');
    document.getElementById('chatbot-total').textContent = fichasChatbot.length || 0;
    document.getElementById('chatbot-tratativa').textContent = 
        fichasChatbot.filter(f => f.status === 'em-tratativa').length;
}

// === CONFIGURAR EVENT LISTENERS ===
function setupEventListeners() {
    // Formulário de reclamação
    const form = document.getElementById('complaint-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Busca na lista
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filtro por status
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', handleStatusFilter);
    }
    
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', formatCPF);
    }
    
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatPhone);
    }
    
    // Atualizar data do status quando status mudar
    const statusSelect = document.getElementById('status');
    if (statusSelect) {
        statusSelect.addEventListener('change', function() {
            if (this.value) {
                const dataStatus = document.getElementById('data-status');
                if (dataStatus) {
                    dataStatus.value = new Date().toISOString().split('T')[0];
                }
            }
        });
    }
    
    // Auto-save durante preenchimento
    setupAutoSave();
}

// === FORMULÁRIO ===
function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('Tentando salvar reclamação...'); // Debug
    
    // Obtém tipo de demanda se foi definido
    const tipoDemanda = sessionStorage.getItem('tipoDemandaAtual') || 'bacen';
    
    const complaint = {
        id: generateId(),
        tipoDemanda: tipoDemanda,
        dataReclamacao: document.getElementById('data-reclamacao').value,
        dataRecebimento: document.getElementById('data-recebimento').value,
        prazoRetorno: document.getElementById('prazo-retorno').value,
        responsavel: document.getElementById('responsavel').value,
        nomeCliente: document.getElementById('nome-cliente').value,
        cpf: document.getElementById('cpf').value,
        origem: getOrigemValue(),
        motivoReduzido: document.getElementById('motivo-reduzido').value,
        motivoDetalhado: document.getElementById('motivo-detalhado').value,
        telefone: document.getElementById('telefone').value,
        historicoTentativas: getTentativasData(),
        moduloContato: getModuloContatoData(),
        protocolosAnteriores: getProtocolosData(),
        resultadoTratativa: document.getElementById('resultado-tratativa').value,
        status: document.getElementById('status').value,
        dataStatus: document.getElementById('data-status').value,
        dataCriacao: new Date().toISOString()
    };
    
    // Limpa tipo temporário
    sessionStorage.removeItem('tipoDemandaAtual');
    
    // Restaura título do formulário
    const formTitle = document.querySelector('#register h2');
    if (formTitle) {
        formTitle.innerHTML = 'Nova Reclamação';
    }
    
    // Esconde botão voltar
    const btnVoltar = document.getElementById('btn-voltar-form');
    if (btnVoltar) {
        btnVoltar.style.display = 'none';
    }
    
    console.log('Dados da reclamação:', complaint); // Debug
    
    // Validar dados obrigatórios
    if (!validateComplaint(complaint)) {
        console.log('Validação falhou'); // Debug
        return;
    }
    
    // Adicionar reclamação usando gerenciador
    if (window.gerenciadorFichas) {
        window.gerenciadorFichas.adicionarFicha(complaint);
        carregarFichas();
    } else {
        // Fallback
        complaints.push(complaint);
        saveComplaints();
    }
    
    console.log('Reclamação salva com sucesso!'); // Debug
    
    // Limpar dados salvos
    clearFormData();
    
    // Limpar formulário
    clearForm();
    
    // Mostrar mensagem de sucesso
    showAlert('Reclamação salva com sucesso!', 'success');
    
    // Atualizar dashboard
    updateDashboard();
    
    // Ir para a lista de reclamações
    showSection('list');
}

// === VALIDAÇÃO ===
function validateComplaint(complaint) {
    const requiredFields = [
        'dataReclamacao', 'dataRecebimento', 'responsavel', 
        'nomeCliente', 'cpf', 'motivoReduzido', 'status'
    ];
    
    console.log('Validando campos obrigatórios...'); // Debug
    
    for (let field of requiredFields) {
        const value = complaint[field];
        console.log(`Campo ${field}:`, value); // Debug
        
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            console.log(`Campo ${field} está vazio ou inválido`); // Debug
            showAlert(`Campo obrigatório não preenchido: ${getFieldLabel(field)}`, 'error');
            return false;
        }
    }
    
    console.log('Validando CPF:', complaint.cpf); // Debug
    
    // Validar CPF
    if (!validateCPF(complaint.cpf)) {
        console.log('CPF inválido:', complaint.cpf); // Debug
        showAlert('CPF inválido', 'error');
        return false;
    }
    
    console.log('Validação passou!'); // Debug
    return true;
}

function getFieldLabel(field) {
    const labels = {
        'dataReclamacao': 'Data da Reclamação',
        'dataRecebimento': 'Data de Recebimento',
        'responsavel': 'Responsável',
        'nomeCliente': 'Nome do Cliente',
        'cpf': 'CPF',
        'motivoReduzido': 'Motivo Reduzido',
        'status': 'Status'
    };
    return labels[field] || field;
}

function validateCPF(cpf) {
    if (!cpf) {
        console.log('CPF vazio'); // Debug
        return false;
    }
    
    const cpfOriginal = cpf;
    cpf = cpf.replace(/\D/g, '');
    console.log('CPF sem formatação:', cpf); // Debug
    
    if (cpf.length !== 11) {
        console.log('CPF não tem 11 dígitos:', cpf.length); // Debug
        return false;
    }
    
    // CPFs de teste válidos (para desenvolvimento)
    const cpfsTeste = [
        '12345678909', // CPF de teste padrão
        '11111111111', // Para testes rápidos
        '00000000000'  // Para testes rápidos
    ];
    
    if (cpfsTeste.includes(cpf)) {
        console.log('CPF de teste aceito'); // Debug
        return true;
    }
    
    // Verificar se todos os dígitos são iguais (exceto os de teste)
    if (/^(\d)\1{10}$/.test(cpf)) {
        console.log('CPF com todos dígitos iguais'); // Debug
        return false;
    }
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) {
        console.log('Primeiro dígito verificador inválido'); // Debug
        console.log('Esperado:', remainder, 'Recebido:', parseInt(cpf.charAt(9))); // Debug
        return false;
    }
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) {
        console.log('Segundo dígito verificador inválido'); // Debug
        console.log('Esperado:', remainder, 'Recebido:', parseInt(cpf.charAt(10))); // Debug
        return false;
    }
    
    console.log('CPF válido!'); // Debug
    return true;
}

// === DADOS DO FORMULÁRIO ===
function getOrigemValue() {
    const origem = document.getElementById('origem').value;
    if (origem === 'outro') {
        const outro = document.getElementById('origem-outro').value;
        return outro || origem;
    }
    return origem;
}

function getTentativasData() {
    const tentativas = [];
    const tentativaItems = document.querySelectorAll('.tentativa-item');
    
    tentativaItems.forEach(item => {
        const datetime = item.querySelector('.tentativa-datetime').value;
        const resultado = item.querySelector('.tentativa-resultado').value;
        const obs = item.querySelector('.tentativa-obs').value;
        
        if (datetime && resultado) {
            tentativas.push({
                datetime,
                resultado,
                observacoes: obs
            });
        }
    });
    
    return tentativas;
}

function getModuloContatoData() {
    return {
        atendimento: document.getElementById('atendimento').checked,
        reclameAqui: document.getElementById('reclame-aqui').checked,
        bacen: document.getElementById('bacen').checked,
        procon: document.getElementById('procon').checked,
        n2: document.getElementById('n2').checked
    };
}

function getProtocolosData() {
    const protocolos = [];
    const protocoloItems = document.querySelectorAll('.protocolo-item');
    
    protocoloItems.forEach(item => {
        const protocolo = item.querySelector('.protocolo-input').value.trim();
        const canal = item.querySelector('.protocolo-canal').value.trim();
        const data = item.querySelector('.protocolo-data').value;
        
        if (protocolo) {
            protocolos.push({
                protocolo,
                canal: canal || '',
                data: data || ''
            });
        }
    });
    
    return protocolos;
}

// === PROTOCOLOS E TENTATIVAS ===
function addProtocolo() {
    const container = document.getElementById('protocolos-container');
    const newItem = document.createElement('div');
    newItem.className = 'protocolo-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Número do Protocolo</label>
                <input type="text" class="velohub-input protocolo-input" placeholder="Digite o número do protocolo">
            </div>
            <div class="form-group">
                <label>Canal</label>
                <input type="text" class="velohub-input protocolo-canal" placeholder="Digite o canal">
            </div>
            <div class="form-group">
                <label>Data</label>
                <input type="date" class="velohub-input protocolo-data">
            </div>
        </div>
        <button type="button" class="btn-remove" onclick="removeProtocolo(this)">❌</button>
    `;
    container.appendChild(newItem);
}

function removeProtocolo(button) {
    button.parentElement.remove();
}

function addTentativa() {
    const container = document.getElementById('historico-container');
    const newItem = document.createElement('div');
    newItem.className = 'tentativa-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Data/Hora</label>
                <input type="datetime-local" class="velohub-input tentativa-datetime">
            </div>
            <div class="form-group">
                <label>Resultado</label>
                <select class="velohub-input tentativa-resultado">
                    <option value="">Selecione...</option>
                    <option value="contatado">Contatado</option>
                    <option value="nao-atendeu">Não Atendeu</option>
                    <option value="telefone-ocupado">Telefone Ocupado</option>
                    <option value="nao-existe">Número Não Existe</option>
                    <option value="mensagem-voz">Mensagem de Voz</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Observações</label>
            <input type="text" class="velohub-input tentativa-obs" placeholder="Observações sobre a tentativa...">
        </div>
        <button type="button" class="btn-remove" onclick="removeTentativa(this)">❌</button>
    `;
    container.appendChild(newItem);
}

function removeTentativa(button) {
    button.parentElement.remove();
}

// === MÁSCARAS ===
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

// === LISTA DE RECLAMAÇÕES ===
function renderComplaintsList() {
    const container = document.getElementById('complaints-list');
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const tipoFilter = document.getElementById('tipo-filter')?.value || '';
    
    let filteredComplaints = complaints;
    
    // Aplicar filtro de busca
    if (searchTerm) {
        filteredComplaints = filteredComplaints.filter(complaint => {
            const nome = (complaint.nomeCliente || '').toLowerCase();
            const cpf = (complaint.cpf || '').toLowerCase();
            const motivo = (complaint.motivoReduzido || '').toLowerCase();
            const obs = (complaint.observacoes || '').toLowerCase();
            const motivoDetalhado = (complaint.motivoDetalhado || '').toLowerCase();
            
            return nome.includes(searchTerm) ||
                   cpf.includes(searchTerm) ||
                   motivo.includes(searchTerm) ||
                   obs.includes(searchTerm) ||
                   motivoDetalhado.includes(searchTerm);
        });
    }
    
    // Aplicar filtro de tipo
    if (tipoFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.tipoDemanda === tipoFilter
        );
    }
    
    // Aplicar filtro de status
    if (statusFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.status === statusFilter
        );
    }
    
    if (filteredComplaints.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhuma reclamação encontrada</div>';
        return;
    }
    
    container.innerHTML = filteredComplaints.map(complaint => createComplaintCard(complaint)).join('');
}

function createComplaintCard(complaint) {
    const statusLabels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
        'respondido': 'Respondido'
    };
    
    const tipoLabels = {
        'bacen': '🏦 BACEN',
        'n2': '🔄 N2',
        'chatbot': '🤖 Chatbot'
    };
    
    const statusClass = `status-${complaint.status}`;
    const statusLabel = statusLabels[complaint.status] || complaint.status;
    const tipoLabel = tipoLabels[complaint.tipoDemanda] || '';
    const tipoClass = complaint.tipoDemanda || 'bacen';
    
    return `
        <div class="complaint-item" onclick="toggleComplaintDetails(this)">
            <div class="complaint-header">
                <div class="complaint-title">
                    ${complaint.nomeCliente}
                    <span class="ficha-perfil-badge ${tipoClass}">${tipoLabel}</span>
                </div>
                <div class="complaint-status ${statusClass}">${statusLabel}</div>
            </div>
            <div class="complaint-summary">
                <div class="complaint-detail">
                    <strong>CPF:</strong> ${complaint.cpf}
                </div>
                <div class="complaint-detail">
                    <strong>Motivo:</strong> ${complaint.motivoReduzido}
                </div>
                <div class="complaint-detail">
                    <strong>Responsável:</strong> ${complaint.responsavel}
                </div>
                <div class="complaint-detail">
                    <strong>Data:</strong> ${formatDate(complaint.dataReclamacao)}
                </div>
            </div>
            <div class="complaint-details">
                <div class="complaint-detail">
                    <strong>Data de Recebimento:</strong> ${formatDate(complaint.dataRecebimento)}
                </div>
                <div class="complaint-detail">
                    <strong>Prazo Retorno BACEN:</strong> ${complaint.prazoRetorno ? formatDate(complaint.prazoRetorno) : 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Origem:</strong> ${complaint.origem || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Telefone:</strong> ${complaint.telefone || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Motivo Detalhado:</strong> ${complaint.motivoDetalhado || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Resultado da Tratativa:</strong> ${complaint.resultadoTratativa || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Data do Status:</strong> ${formatDate(complaint.dataStatus)}
                </div>
                ${renderModuloContato(complaint.moduloContato)}
                ${renderProtocolos(complaint.protocolosAnteriores)}
                ${renderTentativas(complaint.historicoTentativas)}
            </div>
            <div class="expand-icon">▼</div>
        </div>
    `;
}

function renderModuloContato(modulo) {
    const contatos = [];
    if (modulo.atendimento) contatos.push('Atendimento');
    if (modulo.reclameAqui) contatos.push('Reclame Aqui');
    if (modulo.bacen) contatos.push('BACEN');
    if (modulo.procon) contatos.push('Procon');
    if (modulo.n2) contatos.push('N2');
    
    return `
        <div class="complaint-detail">
            <strong>Módulo de Contato:</strong> ${contatos.length > 0 ? contatos.join(', ') : 'Nenhum selecionado'}
        </div>
    `;
}

function renderProtocolos(protocolos) {
    if (protocolos.length === 0) return '';
    
    const protocolosHtml = protocolos.map(protocolo => {
        if (typeof protocolo === 'string') {
            // Formato antigo (apenas string)
            return protocolo;
        } else {
            // Formato novo (objeto com protocolo, canal, data)
            let result = protocolo.protocolo;
            if (protocolo.canal) result += ` (${protocolo.canal})`;
            if (protocolo.data) result += ` - ${formatDate(protocolo.data)}`;
            return result;
        }
    }).join(', ');
    
    return `
        <div class="complaint-detail">
            <strong>Protocolos Anteriores:</strong> ${protocolosHtml}
        </div>
    `;
}

function renderTentativas(tentativas) {
    if (tentativas.length === 0) return '';
    
    const tentativasHtml = tentativas.map(tentativa => `
        <div class="tentativa-detail">
            <strong>${formatDateTime(tentativa.datetime)}</strong> - 
            ${tentativa.resultado}${tentativa.observacoes ? ` (${tentativa.observacoes})` : ''}
        </div>
    `).join('');
    
    return `
        <div class="complaint-detail">
            <strong>Histórico de Tentativas:</strong>
            <div class="tentativas-list">${tentativasHtml}</div>
        </div>
    `;
}

function toggleComplaintDetails(element) {
    element.classList.toggle('expanded');
    const details = element.querySelector('.complaint-details');
    details.classList.toggle('expanded');
}

// === BUSCA E FILTROS ===
function handleSearch() {
    renderComplaintsList();
}

function handleStatusFilter() {
    renderComplaintsList();
}

function handleTipoFilter() {
    renderComplaintsList();
}

// Configurar eventos de filtro
if (document.getElementById('tipo-filter')) {
    document.getElementById('tipo-filter').addEventListener('change', handleTipoFilter);
}

// Função para abrir busca avançada
function abrirBuscaAvancada() {
    if (window.sistemaBusca) {
        window.sistemaBusca.mostrarModalBusca();
    } else {
        alert('Sistema de busca avançada carregando...');
    }
}

// === DASHBOARD ===
function updateDashboard() {
    const total = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'em-tratativa').length;
    const completed = complaints.filter(c => c.status === 'concluido').length;
    const responded = complaints.filter(c => c.status === 'respondido').length;
    
    document.getElementById('total-complaints').textContent = total;
    document.getElementById('in-progress').textContent = inProgress;
    document.getElementById('completed').textContent = completed;
    document.getElementById('responded').textContent = responded;
}

// === RELATÓRIOS ===
function generatePeriodReport() {
    const startDate = prompt('Data inicial (DD/MM/AAAA):');
    const endDate = prompt('Data final (DD/MM/AAAA):');
    
    if (!startDate || !endDate) return;
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    const filteredComplaints = complaints.filter(complaint => {
        const complaintDate = new Date(complaint.dataReclamacao);
        return complaintDate >= start && complaintDate <= end;
    });
    
    showReport('Relatório por Período', filteredComplaints, `Período: ${startDate} a ${endDate}`);
}

function generateStatusReport() {
    const statusCounts = {};
    complaints.forEach(complaint => {
        statusCounts[complaint.status] = (statusCounts[complaint.status] || 0) + 1;
    });
    
    const reportData = Object.entries(statusCounts).map(([status, count]) => ({
        status: getStatusLabel(status),
        count: count,
        percentage: ((count / complaints.length) * 100).toFixed(1)
    }));
    
    showStatusReport('Relatório por Status', reportData);
}

function generateResponsibleReport() {
    const responsibleCounts = {};
    complaints.forEach(complaint => {
        responsibleCounts[complaint.responsavel] = (responsibleCounts[complaint.responsavel] || 0) + 1;
    });
    
    const reportData = Object.entries(responsibleCounts).map(([responsible, count]) => ({
        responsible,
        count,
        percentage: ((count / complaints.length) * 100).toFixed(1)
    }));
    
    showResponsibleReport('Relatório por Responsável', reportData);
}

function generateFullReport() {
    showReport('Relatório Completo', complaints, `Total de ${complaints.length} reclamações`);
}

function showReport(title, data, subtitle) {
    const content = document.getElementById('report-content');
    content.style.display = 'block';
    content.innerHTML = `
        <h3>${title}</h3>
        <p>${subtitle}</p>
        <div class="report-table">
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>CPF</th>
                        <th>Status</th>
                        <th>Responsável</th>
                        <th>Data</th>
                        <th>Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(complaint => `
                        <tr>
                            <td>${complaint.nomeCliente}</td>
                            <td>${complaint.cpf}</td>
                            <td>${getStatusLabel(complaint.status)}</td>
                            <td>${complaint.responsavel}</td>
                            <td>${formatDate(complaint.dataReclamacao)}</td>
                            <td>${complaint.motivoReduzido}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <button class="velohub-btn" onclick="exportReport()">📊 Exportar Relatório</button>
    `;
}

function showStatusReport(title, data) {
    const content = document.getElementById('report-content');
    content.style.display = 'block';
    content.innerHTML = `
        <h3>${title}</h3>
        <div class="status-chart">
            ${data.map(item => `
                <div class="status-item">
                    <div class="status-label">${item.status}</div>
                    <div class="status-bar">
                        <div class="status-fill" style="width: ${item.percentage}%"></div>
                    </div>
                    <div class="status-count">${item.count} (${item.percentage}%)</div>
                </div>
            `).join('')}
        </div>
        <button class="velohub-btn" onclick="exportReport()">📊 Exportar Relatório</button>
    `;
}

function showResponsibleReport(title, data) {
    const content = document.getElementById('report-content');
    content.style.display = 'block';
    content.innerHTML = `
        <h3>${title}</h3>
        <div class="responsible-chart">
            ${data.map(item => `
                <div class="responsible-item">
                    <div class="responsible-label">${item.responsible}</div>
                    <div class="responsible-bar">
                        <div class="responsible-fill" style="width: ${item.percentage}%"></div>
                    </div>
                    <div class="responsible-count">${item.count} (${item.percentage}%)</div>
                </div>
            `).join('')}
        </div>
        <button class="velohub-btn" onclick="exportReport()">📊 Exportar Relatório</button>
    `;
}

function exportReport() {
    const data = complaints.map(complaint => ({
        'Data Reclamação': formatDate(complaint.dataReclamacao),
        'Data Recebimento': formatDate(complaint.dataRecebimento),
        'Cliente': complaint.nomeCliente,
        'CPF': complaint.cpf,
        'Status': getStatusLabel(complaint.status),
        'Responsável': complaint.responsavel,
        'Motivo': complaint.motivoReduzido,
        'Origem': complaint.origem || '',
        'Telefone': complaint.telefone || ''
    }));
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'relatorio-reclamacoes.csv');
}

// === AUTO-SAVE ===
function setupAutoSave() {
    const form = document.getElementById('complaint-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', saveFormData);
        input.addEventListener('change', saveFormData);
    });
    
    // Carregar dados salvos ao entrar na seção
    document.addEventListener('click', function(e) {
        if (e.target && e.target.onclick && e.target.onclick.toString().includes('showSection(\'register\')')) {
            loadFormData();
        }
    });
}

function saveFormData() {
    const formData = {
        dataReclamacao: document.getElementById('data-reclamacao').value,
        dataRecebimento: document.getElementById('data-recebimento').value,
        prazoRetorno: document.getElementById('prazo-retorno').value,
        responsavel: document.getElementById('responsavel').value,
        nomeCliente: document.getElementById('nome-cliente').value,
        cpf: document.getElementById('cpf').value,
        origem: document.getElementById('origem').value,
        origemOutro: document.getElementById('origem-outro').value,
        motivoReduzido: document.getElementById('motivo-reduzido').value,
        motivoDetalhado: document.getElementById('motivo-detalhado').value,
        telefone: document.getElementById('telefone').value,
        resultadoTratativa: document.getElementById('resultado-tratativa').value,
        status: document.getElementById('status').value,
        dataStatus: document.getElementById('data-status').value,
        moduloContato: getModuloContatoData(),
        protocolos: getProtocolosData(),
        tentativas: getTentativasData()
    };
    
    localStorage.setItem('bacen-form-draft', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('bacen-form-draft');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            // Preencher campos básicos
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = formData[key] || '';
                }
            });
            
            // Tratar origem especial
            if (formData.origem === 'outro') {
                document.getElementById('origem-outro-group').style.display = 'block';
                document.getElementById('origem-outro').value = formData.origemOutro || '';
            }
            
            // Restaurar módulo de contato
            if (formData.moduloContato) {
                Object.keys(formData.moduloContato).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        element.checked = formData.moduloContato[key];
                    }
                });
            }
            
            // Restaurar protocolos
            if (formData.protocolos && formData.protocolos.length > 0) {
                const container = document.getElementById('protocolos-container');
                container.innerHTML = '';
                formData.protocolos.forEach(protocolo => {
                    addProtocolo();
                    const lastItem = container.lastElementChild;
                    lastItem.querySelector('.protocolo-input').value = protocolo.protocolo || '';
                    lastItem.querySelector('.protocolo-canal').value = protocolo.canal || '';
                    lastItem.querySelector('.protocolo-data').value = protocolo.data || '';
                });
            }
            
            // Restaurar tentativas
            if (formData.tentativas && formData.tentativas.length > 0) {
                const container = document.getElementById('historico-container');
                container.innerHTML = '';
                formData.tentativas.forEach(tentativa => {
                    addTentativa();
                    const lastItem = container.lastElementChild;
                    lastItem.querySelector('.tentativa-datetime').value = tentativa.datetime || '';
                    lastItem.querySelector('.tentativa-resultado').value = tentativa.resultado || '';
                    lastItem.querySelector('.tentativa-obs').value = tentativa.observacoes || '';
                });
            }
            
        } catch (e) {
            console.error('Erro ao carregar dados salvos:', e);
        }
    }
}

function clearFormData() {
    localStorage.removeItem('bacen-form-draft');
}

// === CONTROLE DE ORIGEM ===
function handleOrigemChange() {
    const origem = document.getElementById('origem').value;
    const outroGroup = document.getElementById('origem-outro-group');
    
    if (origem === 'outro') {
        outroGroup.style.display = 'block';
        document.getElementById('origem-outro').focus();
    } else {
        outroGroup.style.display = 'none';
        document.getElementById('origem-outro').value = '';
    }
}

// === GERADOR DE CPF VÁLIDO ===
function gerarCPFTeste() {
    // Gerar 9 primeiros dígitos aleatórios
    let cpf = '';
    for (let i = 0; i < 9; i++) {
        cpf += Math.floor(Math.random() * 10);
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    cpf += remainder;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    cpf += remainder;
    
    // Formatar CPF
    const cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    // Preencher campo
    document.getElementById('cpf').value = cpfFormatado;
    
    // Disparar evento de input para atualizar auto-save
    const event = new Event('input', { bubbles: true });
    document.getElementById('cpf').dispatchEvent(event);
    
    console.log('CPF gerado:', cpfFormatado);
}

// === UTILITÁRIOS ===
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Não informado';
    const date = new Date(dateTimeString);
    return date.toLocaleString('pt-BR');
}

function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
}

function getStatusLabel(status) {
    const labels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
        'respondido': 'Respondido'
    };
    return labels[status] || status;
}

function clearForm() {
    document.getElementById('complaint-form').reset();
    
    // Limpar dados salvos
    clearFormData();
    
    // Limpar protocolos e tentativas
    document.getElementById('protocolos-container').innerHTML = `
        <div class="protocolo-item">
            <div class="form-row">
                <div class="form-group">
                    <label>Número do Protocolo</label>
                    <input type="text" class="velohub-input protocolo-input" placeholder="Digite o número do protocolo">
                </div>
                <div class="form-group">
                    <label>Canal</label>
                    <input type="text" class="velohub-input protocolo-canal" placeholder="Digite o canal">
                </div>
                <div class="form-group">
                    <label>Data</label>
                    <input type="date" class="velohub-input protocolo-data">
                </div>
            </div>
            <button type="button" class="btn-remove" onclick="removeProtocolo(this)">❌</button>
        </div>
    `;
    
    document.getElementById('historico-container').innerHTML = `
        <div class="tentativa-item">
            <div class="form-row">
                <div class="form-group">
                    <label>Data/Hora</label>
                    <input type="datetime-local" class="velohub-input tentativa-datetime">
                </div>
                <div class="form-group">
                    <label>Resultado</label>
                    <select class="velohub-input tentativa-resultado">
                        <option value="">Selecione...</option>
                        <option value="contatado">Contatado</option>
                        <option value="nao-atendeu">Não Atendeu</option>
                        <option value="telefone-ocupado">Telefone Ocupado</option>
                        <option value="nao-existe">Número Não Existe</option>
                        <option value="mensagem-voz">Mensagem de Voz</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <input type="text" class="velohub-input tentativa-obs" placeholder="Observações sobre a tentativa...">
            </div>
            <button type="button" class="btn-remove" onclick="removeTentativa(this)">❌</button>
        </div>
    `;
    
    // Esconder campo origem outro
    document.getElementById('origem-outro-group').style.display = 'none';
    
    // Configurar data atual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data-reclamacao').value = today;
    document.getElementById('data-recebimento').value = today;
    document.getElementById('data-status').value = today;
}

function saveComplaints() {
    localStorage.setItem('bacen-complaints', JSON.stringify(complaints));
}

function loadComplaints() {
    complaints = JSON.parse(localStorage.getItem('bacen-complaints')) || [];
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.insertBefore(alert, document.body.firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
