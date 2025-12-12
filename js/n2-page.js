/* === SISTEMA DE GESTÃO N2 - PÁGINA ESPECÍFICA === */

// Variáveis globais
let fichasN2 = [];

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
        carregarFichasN2();
        renderizarListaN2();
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
    }
}

// === CARREGAR FICHAS ===
async function carregarFichasN2() {
    // Tentar usar Supabase primeiro
    if (window.supabaseDB) {
        try {
            fichasN2 = await window.supabaseDB.obterFichasN2();
            return;
        } catch (error) {
            console.error('Erro ao carregar do Supabase:', error);
        }
    }
    
    // Fallback para gerenciador de fichas
    if (window.gerenciadorFichas) {
        fichasN2 = window.gerenciadorFichas.obterFichasPorTipo('n2');
    } else if (window.GerenciadorFichasPerfil) {
        window.gerenciadorFichas = new GerenciadorFichasPerfil();
        fichasN2 = window.gerenciadorFichas.obterFichasPorTipo('n2');
    } else {
        // Fallback para localStorage
        const fichas = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
        fichasN2 = fichas.map(f => ({ ...f, tipoDemanda: 'n2' }));
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
        
        const dataEntradaAtendimento = obterValorCampoN2('n2-data-entrada-atendimento');
        const dataEntradaN2 = obterValorCampoN2('n2-data-entrada-n2');
        console.log('📅 Data entrada Atendimento:', dataEntradaAtendimento);
        console.log('📅 Data Entrada N2:', dataEntradaN2);
        console.log('📅 Campo dataEntradaN2 existe?', document.getElementById('n2-data-entrada-n2') !== null);
        console.log('📅 Valor direto do campo:', document.getElementById('n2-data-entrada-n2')?.value);
    
        const ficha = {
            id: gerarId(),
            tipoDemanda: 'n2',
            dataEntradaAtendimento: dataEntradaAtendimento,
            dataEntradaN2: dataEntradaN2,
        responsavel: obterValorCampoN2('n2-responsavel'),
        mes: obterValorCampoN2('n2-mes'),
        nomeCompleto: obterValorCampoN2('n2-nome'),
        cpf: obterValorCampoN2('n2-cpf'),
        telefone: obterValorCampoN2('n2-telefone'),
        origem: obterValorCampoN2('n2-origem'),
        motivoReduzido: obterValorCampoN2('n2-motivo-reduzido'),
        motivoDetalhado: obterValorCampoN2('n2-motivo-detalhado'),
        prazoN2: obterValorCampoN2('n2-prazo-n2'),
        tentativasContato: obterTentativasN2(), // Coletar todas as tentativas
        acionouCentral: obterCheckboxN2('n2-acionou-central'),
        protocoloCentral: obterValorCampoN2('n2-protocolo-central'),
        n2SegundoNivel: obterCheckboxN2('n2-n2-segundo-nivel'),
        protocoloN2: obterValorCampoN2('n2-protocolo-n2'),
        reclameAqui: obterCheckboxN2('n2-reclame-aqui'),
        protocoloReclameAqui: obterValorCampoN2('n2-protocolo-reclame-aqui'),
        procon: obterCheckboxN2('n2-procon'),
        protocoloProcon: obterValorCampoN2('n2-protocolo-procon'),
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
        if (window.supabaseDB) {
            console.log('📦 Usando Supabase');
            try {
                await window.supabaseDB.salvarFichaN2(ficha);
                console.log('✅ Salvo no Supabase');
            } catch (error) {
                console.error('❌ Erro ao salvar no Supabase:', error);
                // Fallback
                if (window.gerenciadorFichas) {
                    window.gerenciadorFichas.adicionarFicha(ficha);
                    console.log('💾 Fallback: salvo via gerenciadorFichas');
                } else {
                    fichasN2.push(ficha);
                    localStorage.setItem('velotax_demandas_n2', JSON.stringify(fichasN2));
                    console.log('💾 Fallback: salvo no localStorage');
                }
            }
        } else if (window.gerenciadorFichas) {
            window.gerenciadorFichas.adicionarFicha(ficha);
            console.log('💾 Salvo via gerenciadorFichas');
        } else {
            fichasN2.push(ficha);
            localStorage.setItem('velotax_demandas_n2', JSON.stringify(fichasN2));
            console.log('💾 Salvo no localStorage');
        }
        
        // Limpar e atualizar
        console.log('🧹 Limpando formulário...');
        limparFormN2();
        await carregarFichasN2();
        atualizarDashboardN2();
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
        'nomeCompleto', 'cpf', 'origem', 'motivoReduzido', 'motivoDetalhado', 'status', 'enviarCobranca'
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
}

// === LISTA ===
function renderizarListaN2() {
    const container = document.getElementById('lista-fichas-n2');
    if (!container) return;
    
    const busca = document.getElementById('busca-n2')?.value.toLowerCase() || '';
    const filtroStatus = document.getElementById('filtro-status-n2')?.value || '';
    const filtroPortabilidade = document.getElementById('filtro-portabilidade-n2')?.value || '';
    
    let filtradas = fichasN2;
    
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
    
    if (filtroPortabilidade) {
        filtradas = filtradas.filter(f => f.statusPortabilidade === filtroPortabilidade);
    }
    
    if (filtradas.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhuma ficha N2 encontrada</div>';
        return;
    }
    
    container.innerHTML = filtradas.map(f => criarCardN2(f)).join('');
}

function criarCardN2(ficha) {
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
    const inicio = prompt('Data inicial (DD/MM/AAAA):');
    const fim = prompt('Data final (DD/MM/AAAA):');
    
    if (!inicio || !fim) return;
    
    const inicioDate = parseDate(inicio);
    const fimDate = parseDate(fim);
    
    const filtradas = fichasN2.filter(f => {
        const data = new Date(f.dataEntrada);
        return data >= inicioDate && data <= fimDate;
    });
    
    mostrarRelatorioN2('Relatório por Período - N2', filtradas, `Período: ${inicio} a ${fim}`);
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

