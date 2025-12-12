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
        carregarFichasChatbot().then(() => {
            atualizarDashboardChatbot();
        });
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
            renderizarListaChatbot();
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
    }
}

// === CARREGAR FICHAS ===
async function carregarFichasChatbot() {
    // Tentar usar Supabase primeiro
    if (window.supabaseDB) {
        try {
            fichasChatbot = await window.supabaseDB.obterFichasChatbot();
            return;
        } catch (error) {
            console.error('Erro ao carregar do Supabase:', error);
        }
    }
    
    // Fallback para gerenciador de fichas
    if (window.gerenciadorFichas) {
        fichasChatbot = window.gerenciadorFichas.obterFichasPorTipo('chatbot');
    } else if (window.GerenciadorFichasPerfil) {
        window.gerenciadorFichas = new GerenciadorFichasPerfil();
        fichasChatbot = window.gerenciadorFichas.obterFichasPorTipo('chatbot');
    } else {
        // Fallback para localStorage
        const fichas = JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
        fichasChatbot = fichas.map(f => ({ ...f, tipoDemanda: 'chatbot' }));
    }
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
        responsavel: obterValorCampoChatbot('chatbot-responsavel'),
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
        
        // Salvar
        console.log('💾 Salvando ficha...');
        if (window.supabaseDB) {
            console.log('📦 Usando Supabase');
            try {
                await window.supabaseDB.salvarFichaChatbot(ficha);
                console.log('✅ Salvo no Supabase');
            } catch (error) {
                console.error('❌ Erro ao salvar no Supabase:', error);
                // Fallback
                if (window.gerenciadorFichas) {
                    window.gerenciadorFichas.adicionarFicha(ficha);
                    console.log('💾 Fallback: salvo via gerenciadorFichas');
                } else {
                    fichasChatbot.push(ficha);
                    localStorage.setItem('velotax_demandas_chatbot', JSON.stringify(fichasChatbot));
                    console.log('💾 Fallback: salvo no localStorage');
                }
            }
        } else if (window.gerenciadorFichas) {
            window.gerenciadorFichas.adicionarFicha(ficha);
            console.log('💾 Salvo via gerenciadorFichas');
        } else {
            fichasChatbot.push(ficha);
            localStorage.setItem('velotax_demandas_chatbot', JSON.stringify(fichasChatbot));
            console.log('💾 Salvo no localStorage');
        }
        
        // Limpar e atualizar
        console.log('🧹 Limpando formulário...');
        limparFormChatbot();
        await carregarFichasChatbot();
        console.log('📋 Fichas carregadas:', fichasChatbot.length);
        await atualizarDashboardChatbot();
        console.log('📋 Renderizando lista com', fichasChatbot.length, 'fichas');
        renderizarListaChatbot(); // Garantir que a lista seja atualizada
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
}

// === LISTA ===
function renderizarListaChatbot() {
    const container = document.getElementById('lista-fichas-chatbot');
    if (!container) {
        console.warn('⚠️ Container lista-fichas-chatbot não encontrado');
        return;
    }
    
    console.log('📋 Renderizando lista com', fichasChatbot.length, 'fichas');
    console.log('📋 Fichas disponíveis:', fichasChatbot);
    
    const busca = document.getElementById('busca-chatbot')?.value.toLowerCase() || '';
    const filtroStatus = document.getElementById('filtro-status-chatbot')?.value || '';
    const filtroCanal = document.getElementById('filtro-canal-chatbot')?.value || '';
    
    let filtradas = fichasChatbot || [];
    
    if (busca) {
        filtradas = filtradas.filter(f => {
            const nome = (f.nomeCompleto || '').toLowerCase();
            const cpf = (f.cpf || '').toLowerCase();
            const motivo = (f.motivoReduzido || '').toLowerCase();
            return nome.includes(busca) || cpf.includes(busca) || motivo.includes(busca);
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
    
    container.innerHTML = filtradas.map(f => criarCardChatbot(f)).join('');
}

function criarCardChatbot(ficha) {
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
        badges += `<span style="background: #FF8400; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">${estrelas}</span>`;
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
    const comSatisfacao = fichasChatbot.filter(f => f.satisfacao);
    const media = comSatisfacao.length > 0 
        ? (comSatisfacao.reduce((s, f) => s + parseInt(f.satisfacao), 0) / comSatisfacao.length).toFixed(1)
        : 0;
    
    mostrarRelatorioSatisfacao('Relatório de Satisfação - Chatbot', comSatisfacao, 
        `Média de satisfação: ${media}/5`);
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

