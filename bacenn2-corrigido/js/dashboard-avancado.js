/* === DASHBOARD AVANÇADO VELOTAX === */

class DashboardAvancado {
    constructor() {
        this.dados = [];
        this.filtros = { periodo: '30dias' };
        this.inicializar();
    }

    inicializar() {
        this.carregarDados();
        this.adicionarEstilos();
        this.configurarEventos();
        this.renderizarDashboard();
    }

    carregarDados() {
        // Usa o gerenciador de fichas se disponível
        if (window.gerenciadorFichas) {
            this.dados = window.gerenciadorFichas.obterFichasPorPerfil();
        } else {
            // Obtém dados do localStorage (usando chaves novas e antigas para compatibilidade)
            const fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
            const fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
            const fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
            
            this.dados = [
                ...fichasBacen.map(f => ({ ...f, tipoDemanda: 'bacen' })),
                ...fichasN2.map(f => ({ ...f, tipoDemanda: 'n2' })),
                ...fichasChatbot.map(f => ({ ...f, tipoDemanda: 'chatbot' }))
            ];
            
            if (this.dados.length === 0) {
                this.dados = this.obterDadosDemo();
            }
        }
    }

    obterDadosDemo() {
        // Dados demo baseados na planilha com 1.336 registros
        return [
            {
                id: 1,
                nomeCliente: 'João Silva',
                cpf: '123.456.789-00',
                status: 'em-tratativa',
                dataCriacao: '2024-01-15',
                responsavel: 'atendente@velotax.com',
                origem: 'bacen',
                modulosContato: { bacen: true, atendimento: true },
                concluido: false
            },
            {
                id: 2,
                nomeCliente: 'Maria Santos',
                cpf: '987.654.321-00',
                status: 'concluido',
                dataCriacao: '2024-01-10',
                responsavel: 'admin@velotax.com',
                origem: 'telefone',
                modulosContato: { atendimento: true },
                concluido: true
            },
            {
                id: 3,
                nomeCliente: 'Pedro Costa',
                cpf: '456.789.123-00',
                status: 'nao-iniciado',
                dataCriacao: '2024-01-20',
                responsavel: 'atendente@velotax.com',
                origem: 'reclame-aqui',
                modulosContato: { reclameAqui: true },
                concluido: false
            },
            {
                id: 4,
                nomeCliente: 'Ana Oliveira',
                cpf: '789.123.456-00',
                status: 'respondido',
                dataCriacao: '2024-01-08',
                responsavel: 'admin@velotax.com',
                origem: 'procon',
                modulosContato: { procon: true, bacen: true },
                concluido: true
            },
            {
                id: 5,
                nomeCliente: 'Carlos Ferreira',
                cpf: '321.654.987-00',
                status: 'em-tratativa',
                dataCriacao: '2024-01-18',
                responsavel: 'atendente@velotax.com',
                origem: 'email',
                modulosContato: { atendimento: true, n2: true },
                concluido: false
            }
        ];
    }

    renderizarDashboard() {
        const container = document.getElementById('dashboard');
        if (!container) return;

        container.innerHTML = `
            <div class="dashboard-avancado">
                <!-- Filtros do Dashboard -->
                <div class="dashboard-filtros">
                    <h3>📊 Período de Análise</h3>
                    <div class="filtros-periodo">
                        <select id="filtro-periodo" class="velohub-input" onchange="dashboardAvancado.mudarPeriodo()">
                            <option value="7dias">Últimos 7 dias</option>
                            <option value="30dias" selected>Últimos 30 dias</option>
                            <option value="90dias">Últimos 90 dias</option>
                            <option value="ano">Este ano</option>
                            <option value="todos">Todo o período</option>
                        </select>
                        <button class="velohub-btn btn-primary" onclick="dashboardAvancado.atualizarDados()">
                            🔄 Atualizar
                        </button>
                    </div>
                </div>

                <!-- KPIs Principais -->
                <div class="kpi-grid">
                    ${this.criarKPI('total', '📋 Total de Fichas', this.calcularTotal(), 'primary')}
                    ${this.criarKPI('em-tratativa', '⏳ Em Tratativa', this.calcularPorStatus('em-tratativa'), 'warning')}
                    ${this.criarKPI('concluidos', '✅ Concluídos', this.calcularPorStatus('concluido'), 'success')}
                    ${this.criarKPI('taxa-conclusao', '📈 Taxa de Conclusão', this.calcularTaxaConclusao(), 'info')}
                </div>

                <!-- KPIs por Tipo de Demanda -->
                <div class="kpi-tipos-grid">
                    <h3>📊 Métricas por Tipo de Demanda</h3>
                    <div class="tipos-kpi-grid">
                        ${this.criarKPITipo('bacen', '🏦 BACEN', '#1634FF')}
                        ${this.criarKPITipo('n2', '🔄 N2', '#1DFDB9')}
                        ${this.criarKPITipo('chatbot', '🤖 Chatbot', '#1634FF')}
                    </div>
                </div>

                <!-- Gráficos e Análises -->
                <div class="graficos-grid">
                    <!-- Gráfico de Status -->
                    <div class="grafico-card">
                        <h3>📊 Distribuição por Status</h3>
                        <div class="grafico-container">
                            ${this.criarGraficoStatus()}
                        </div>
                    </div>

                    <!-- Gráfico de Origens -->
                    <div class="grafico-card">
                        <h3>📍 Reclamações por Origem</h3>
                        <div class="grafico-container">
                            ${this.criarGraficoOrigens()}
                        </div>
                    </div>

                    <!-- Gráfico de Responsáveis -->
                    <div class="grafico-card">
                        <h3>👤 Performance por Responsável</h3>
                        <div class="grafico-container">
                            ${this.criarGraficoResponsaveis()}
                        </div>
                    </div>

                    <!-- Gráfico de Valores -->
                    <div class="grafico-card">
                        <h3>💰 Valores Negociados</h3>
                        <div class="grafico-container">
                            ${this.criarGraficoValores()}
                        </div>
                    </div>
                </div>

                <!-- Tabela de Detalhes -->
                <div class="tabela-detalhes">
                    <h3>📋 Atividades Recentes</h3>
                    <div class="tabela-container">
                        ${this.criarTabelaAtividades()}
                    </div>
                </div>

                <!-- Métricas Adicionais -->
                <div class="metricas-adicionais">
                    <div class="metricas-grid">
                        ${this.criarMetrica('tempo-medio', '⏱️ Tempo Médio de Resolução', this.calcularTempoMedio())}
                        ${this.criarMetrica('valor-total', '💰 Total Negociado', this.calcularValorTotal())}
                        ${this.criarMetrica('pix-liberado', '🔄 Taxa de Liberação PIX', this.calcularTaxaPIX())}
                        ${this.criarMetrica('liquidacao', '🤝 Taxa de Liquidação', this.calcularTaxaLiquidacao())}
                    </div>
                </div>
            </div>
        `;
    }

    criarKPI(id, titulo, valor, tipo) {
        const cores = {
            primary: 'var(--azul-royal)',
            success: 'var(--azul-ciano)',
            warning: 'var(--laranja-destaque)',
            info: 'var(--roxo-escuro)'
        };

        return `
            <div class="kpi-card kpi-${tipo}" id="kpi-${id}">
                <div class="kpi-header">
                    <h4>${titulo}</h4>
                    <div class="kpi-icone">${titulo.split(' ')[0]}</div>
                </div>
                <div class="kpi-valor" style="color: ${cores[tipo]}">${valor}</div>
                <div class="kpi-tendencia">
                    ${this.calcularTendencia(id)}
                </div>
            </div>
        `;
    }

    criarMetrica(id, titulo, valor) {
        return `
            <div class="metrica-card" id="metrica-${id}">
                <div class="metrica-titulo">${titulo}</div>
                <div class="metrica-valor">${valor}</div>
            </div>
        `;
    }

    criarKPITipo(tipo, titulo, cor) {
        const dadosFiltrados = this.filtrarPorPeriodo();
        const dadosTipo = dadosFiltrados.filter(d => d.tipoDemanda === tipo);
        const total = dadosTipo.length;
        const emTratativa = dadosTipo.filter(d => d.status === 'em-tratativa').length;
        const concluidos = dadosTipo.filter(d => d.status === 'concluido' || d.status === 'respondido').length;
        const taxa = total > 0 ? ((concluidos / total) * 100).toFixed(1) : 0;

        return `
            <div class="kpi-tipo-card" style="border-left: 4px solid ${cor}">
                <div class="kpi-tipo-header">
                    <h4>${titulo}</h4>
                </div>
                <div class="kpi-tipo-valores">
                    <div class="kpi-tipo-item">
                        <span class="kpi-tipo-label">Total:</span>
                        <span class="kpi-tipo-valor" style="color: ${cor}">${total}</span>
                    </div>
                    <div class="kpi-tipo-item">
                        <span class="kpi-tipo-label">Em Tratativa:</span>
                        <span class="kpi-tipo-valor">${emTratativa}</span>
                    </div>
                    <div class="kpi-tipo-item">
                        <span class="kpi-tipo-label">Concluídos:</span>
                        <span class="kpi-tipo-valor">${concluidos}</span>
                    </div>
                    <div class="kpi-tipo-item">
                        <span class="kpi-tipo-label">Taxa:</span>
                        <span class="kpi-tipo-valor" style="color: ${cor}">${taxa}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    // === CÁLCULOS ===
    calcularTotal() {
        return this.filtrarPorPeriodo().length;
    }

    calcularPorStatus(status) {
        return this.filtrarPorPeriodo().filter(d => d.status === status).length;
    }

    calcularTaxaConclusao() {
        const dadosFiltrados = this.filtrarPorPeriodo();
        const concluidos = dadosFiltrados.filter(d => d.concluido).length;
        const taxa = dadosFiltrados.length > 0 ? (concluidos / dadosFiltrados.length * 100) : 0;
        return `${taxa.toFixed(1)}%`;
    }

    calcularTempoMedio() {
        const concluidos = this.filtrarPorPeriodo().filter(d => d.concluido && d.finalizadoEm);
        if (concluidos.length === 0) return 'N/A';
        
        const tempos = concluidos.map(d => {
            const criacao = new Date(d.dataCriacao);
            const conclusao = new Date(d.finalizadoEm);
            return Math.floor((conclusao - criacao) / (1000 * 60 * 60 * 24)); // dias
        });
        
        const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
        return `${media.toFixed(1)} dias`;
    }

    calcularValorTotal() {
        // Campo removido
        return 'N/A';
    }

    calcularTaxaPIX() {
        const dadosFiltrados = this.filtrarPorPeriodo();
        const comPIX = dadosFiltrados.filter(d => d.pixLiberado).length;
        const taxa = dadosFiltrados.length > 0 ? (comPIX / dadosFiltrados.length * 100) : 0;
        return `${taxa.toFixed(1)}%`;
    }

    calcularTaxaLiquidacao() {
        const dadosFiltrados = this.filtrarPorPeriodo();
        const comLiquidacao = dadosFiltrados.filter(d => d.aceitouLiquidacao).length;
        const taxa = dadosFiltrados.length > 0 ? (comLiquidacao / dadosFiltrados.length * 100) : 0;
        return `${taxa.toFixed(1)}%`;
    }

    // === GRÁFICOS ===
    criarGraficoStatus() {
        const dados = this.filtrarPorPeriodo();
        const statusCount = {
            'nao-iniciado': 0,
            'em-tratativa': 0,
            'concluido': 0,
            'respondido': 0
        };

        dados.forEach(d => {
            if (statusCount.hasOwnProperty(d.status)) {
                statusCount[d.status]++;
            }
        });

        const total = dados.length;
        const maxCount = Math.max(...Object.values(statusCount));

        return `
            <div class="grafico-barras">
                ${Object.entries(statusCount).map(([status, count]) => {
                    const percentual = total > 0 ? (count / total * 100) : 0;
                    const height = maxCount > 0 ? (count / maxCount * 100) : 0;
                    const cores = {
                        'nao-iniciado': 'var(--cinza-claro)',
                        'em-tratativa': 'var(--laranja-destaque)',
                        'concluido': 'var(--azul-ciano)',
                        'respondido': 'var(--azul-royal)'
                    };

                    return `
                        <div class="barra-item">
                            <div class="barra" style="height: ${height}%; background: ${cores[status]};"></div>
                            <div class="barra-label">${this.formatarStatus(status)}</div>
                            <div class="barra-valor">${count} (${percentual.toFixed(1)}%)</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    criarGraficoOrigens() {
        const dados = this.filtrarPorPeriodo();
        const origens = {};

        dados.forEach(d => {
            const origem = d.origem || 'não-informada';
            origens[origem] = (origens[origem] || 0) + 1;
        });

        const total = dados.length;
        const cores = [
            'var(--azul-royal)',
            'var(--azul-ciano)',
            'var(--laranja-destaque)',
            'var(--roxo-escuro)',
            'var(--rosa-vibrante)',
            'var(--cinza-escuro)'
        ];

        return `
            <div class="grafico-pizza">
                ${Object.entries(origens).map(([origem, count], index) => {
                    const percentual = total > 0 ? (count / total * 100) : 0;
                    const cor = cores[index % cores.length];
                    
                    return `
                        <div class="pizza-item">
                            <div class="pizza-cor" style="background: ${cor};"></div>
                            <div class="pizza-info">
                                <div class="pizza-label">${this.formatarOrigem(origem)}</div>
                                <div class="pizza-valor">${count} (${percentual.toFixed(1)}%)</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    criarGraficoResponsaveis() {
        const dados = this.filtrarPorPeriodo();
        const responsaveis = {};

        dados.forEach(d => {
            const responsavel = d.responsavel?.split('@')[0] || 'não-atribuído';
            responsaveis[responsavel] = (responsaveis[responsavel] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(responsaveis));

        return `
            <div class="grafico-horizontal">
                ${Object.entries(responsaveis).map(([responsavel, count]) => {
                    const width = maxCount > 0 ? (count / maxCount * 100) : 0;
                    
                    return `
                        <div class="horizontal-item">
                            <div class="horizontal-label">${responsavel}</div>
                            <div class="horizontal-bar-container">
                                <div class="horizontal-bar" style="width: ${width}%;"></div>
                            </div>
                            <div class="horizontal-valor">${count}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    criarGraficoValores() {
        const dados = this.filtrarPorPeriodo();
        const valores = dados
            .filter(() => false) // Campo removido
            .map(() => 0)
            .sort((a, b) => a - b);

        if (valores.length === 0) {
            return '<div class="sem-dados">Nenhum valor registrado</div>';
        }

        // Cria faixas de valores
        const faixas = [
            { label: 'Até R$ 1.000', min: 0, max: 1000, count: 0 },
            { label: 'R$ 1.001 - R$ 2.000', min: 1001, max: 2000, count: 0 },
            { label: 'R$ 2.001 - R$ 3.000', min: 2001, max: 3000, count: 0 },
            { label: 'Acima de R$ 3.000', min: 3001, max: Infinity, count: 0 }
        ];

        valores.forEach(valor => {
            const faixa = faixas.find(f => valor >= f.min && valor <= f.max);
            if (faixa) faixa.count++;
        });

        const maxCount = Math.max(...faixas.map(f => f.count));

        return `
            <div class="grafico-barras">
                ${faixas.map(faixa => {
                    const height = maxCount > 0 ? (faixa.count / maxCount * 100) : 0;
                    
                    return `
                        <div class="barra-item">
                            <div class="barra" style="height: ${height}%;"></div>
                            <div class="barra-label">${faixa.label}</div>
                            <div class="barra-valor">${faixa.count}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    criarTabelaAtividades() {
        const dados = this.filtrarPorPeriodo()
            .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
            .slice(0, 10);

        return `
            <div class="tabela-wrapper">
                <table class="tabela-atividades">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>CPF</th>
                            <th>Status</th>
                            <th>Responsável</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.map(d => `
                            <tr onclick="dashboardAvancado.abrirFicha(${d.id})">
                                <td>${this.formatarData(d.dataCriacao)}</td>
                                <td>${d.nomeCliente || 'N/A'}</td>
                                <td>${d.cpf || 'N/A'}</td>
                                <td>
                                    <span class="status-badge status-${d.status}">
                                        ${this.formatarStatus(d.status)}
                                    </span>
                                </td>
                                <td>${d.responsavel?.split('@')[0] || 'N/A'}</td>
                                <td>-</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // === UTILITÁRIOS ===
    filtrarPorPeriodo() {
        const agora = new Date();
        let dataInicial;

        switch (this.filtros.periodo) {
            case '7dias':
                dataInicial = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30dias':
                dataInicial = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90dias':
                dataInicial = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'ano':
                dataInicial = new Date(agora.getFullYear(), 0, 1);
                break;
            case 'todos':
            default:
                return this.dados;
        }

        return this.dados.filter(d => new Date(d.dataCriacao) >= dataInicial);
    }

    mudarPeriodo() {
        this.filtros.periodo = document.getElementById('filtro-periodo').value;
        this.renderizarDashboard();
    }

    atualizarDados() {
        this.carregarDados();
        this.renderizarDashboard();
        this.mostrarNotificacao('Dashboard atualizado!', 'success');
    }

    calcularTendencia(kpiId) {
        // Simulação de tendência (em produção, comparar com período anterior)
        const tendencias = {
            'total': { valor: '+12%', direcao: 'up', cor: 'var(--sucesso)' },
            'em-tratativa': { valor: '-5%', direcao: 'down', cor: 'var(--erro)' },
            'concluidos': { valor: '+8%', direcao: 'up', cor: 'var(--sucesso)' },
            'taxa-conclusao': { valor: '+3%', direcao: 'up', cor: 'var(--sucesso)' }
        };

        const tendencia = tendencias[kpiId];
        if (!tendencia) return '';

        return `
            <div class="tendencia ${tendencia.direcao}" style="color: ${tendencia.cor}">
                ${tendencia.direcao === 'up' ? '↑' : '↓'} ${tendencia.valor}
            </div>
        `;
    }

    formatarStatus(status) {
        const statusMap = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'respondido': 'Respondido'
        };
        return statusMap[status] || status;
    }

    formatarOrigem(origem) {
        const origemMap = {
            'bacen': 'BACEN',
            'telefone': 'Telefone',
            'email': 'Email',
            'reclame-aqui': 'Reclame Aqui',
            'procon': 'PROCON',
            'n2': 'N2',
            'presencial': 'Presencial',
            'site': 'Site',
            'app': 'App'
        };
        return origemMap[origem] || origem;
    }

    formatarData(dataString) {
        if (!dataString) return 'N/A';
        return new Date(dataString).toLocaleDateString('pt-BR');
    }

    abrirFicha(id) {
        const ficha = this.dados.find(d => d.id === id);
        if (ficha && window.sistemaFichas) {
            window.sistemaFichas.abrirFicha(ficha);
        }
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.textContent = mensagem;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.remove();
        }, 3000);
    }

    // === ESTILOS ===
    adicionarEstilos() {
        const estilos = `
            <style id="estilos-dashboard">
                /* === DASHBOARD AVANÇADO === */
                .dashboard-avancado {
                    padding: 20px;
                }

                /* === FILTROS === */
                .dashboard-filtros {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .dashboard-filtros h3 {
                    color: var(--azul-royal);
                    margin: 0;
                }

                .filtros-periodo {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                /* === KPI GRID === */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .kpi-card {
                    background: var(--cor-container);
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: var(--sombra-suave);
                    border: 1px solid var(--borda-clara);
                    transition: all 0.3s ease;
                }

                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--sombra-media);
                }

                .kpi-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }

                .kpi-header h4 {
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin: 0;
                }

                .kpi-icone {
                    font-size: 1.5rem;
                    opacity: 0.5;
                }

                .kpi-valor {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .kpi-tendencia {
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .tendencia.up {
                    color: var(--sucesso);
                }

                .tendencia.down {
                    color: var(--erro);
                }

                /* === GRÁFICOS === */
                .graficos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .grafico-card {
                    background: var(--cor-container);
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: var(--sombra-suave);
                    border: 1px solid var(--borda-clara);
                }

                .grafico-card h3 {
                    color: var(--azul-royal);
                    margin: 0 0 20px 0;
                    font-size: 1.1rem;
                }

                .grafico-container {
                    height: 200px;
                }

                /* === GRÁFICO DE BARRAS === */
                .grafico-barras {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 100%;
                    gap: 8px;
                }

                .barra-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    min-width: 60px;
                }

                .barra {
                    width: 100%;
                    background: var(--azul-royal);
                    border-radius: 4px 4px 0 0;
                    min-height: 8px;
                    transition: all 0.3s ease;
                }

                .barra:hover {
                    opacity: 0.8;
                }

                .barra-label {
                    font-size: 0.75rem;
                    color: var(--texto-secundario);
                    text-align: center;
                    margin-top: 8px;
                    max-width: 100%;
                    word-wrap: break-word;
                }

                .barra-valor {
                    font-size: 0.7rem;
                    color: var(--texto-principal);
                    font-weight: 600;
                    margin-top: 4px;
                }

                /* === GRÁFICO DE PIZZA (LEGENDA) === */
                .grafico-pizza {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    height: 100%;
                    justify-content: center;
                }

                .pizza-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pizza-cor {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }

                .pizza-info {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pizza-label {
                    font-size: 0.85rem;
                    color: var(--texto-principal);
                }

                .pizza-valor {
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                    font-weight: 600;
                }

                /* === GRÁFICO HORIZONTAL === */
                .grafico-horizontal {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    height: 100%;
                    justify-content: center;
                }

                .horizontal-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .horizontal-label {
                    font-size: 0.75rem;
                    color: var(--texto-principal);
                    min-width: 80px;
                }

                .horizontal-bar-container {
                    flex: 1;
                    height: 20px;
                    background: var(--cor-sidebar);
                    border-radius: 10px;
                    overflow: hidden;
                }

                .horizontal-bar {
                    height: 100%;
                    background: var(--azul-royal);
                    transition: width 0.5s ease;
                }

                .horizontal-valor {
                    font-size: 0.75rem;
                    color: var(--texto-principal);
                    font-weight: 600;
                    min-width: 30px;
                    text-align: right;
                }

                /* === TABELA DE ATIVIDADES === */
                .tabela-detalhes {
                    background: var(--cor-container);
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: var(--sombra-suave);
                    border: 1px solid var(--borda-clara);
                    margin-bottom: 32px;
                }

                .tabela-detalhes h3 {
                    color: var(--azul-royal);
                    margin: 0 0 20px 0;
                }

                .tabela-wrapper {
                    overflow-x: auto;
                }

                .tabela-atividades {
                    width: 100%;
                    border-collapse: collapse;
                }

                .tabela-atividades th {
                    background: var(--cor-sidebar);
                    color: var(--texto-principal);
                    font-weight: 600;
                    text-align: left;
                    padding: 12px;
                    border-bottom: 2px solid var(--borda-clara);
                }

                .tabela-atividades td {
                    padding: 12px;
                    border-bottom: 1px solid var(--borda-clara);
                    color: var(--texto-principal);
                }

                .tabela-atividades tr {
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .tabela-atividades tr:hover {
                    background: var(--cor-sidebar);
                }

                /* === MÉTRICAS ADICIONAIS === */
                .metricas-adicionais {
                    margin-top: 32px;
                }

                .metricas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .metrica-card {
                    background: var(--cor-container);
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: var(--sombra-suave);
                    border: 1px solid var(--borda-clara);
                }

                .metrica-titulo {
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                    margin-bottom: 8px;
                }

                .metrica-valor {
                    color: var(--azul-royal);
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                /* === ESTADOS ESPECIAIS === */
                .sem-dados {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--texto-secundario);
                    font-style: italic;
                }

                /* === KPIs POR TIPO === */
                .kpi-tipos-grid {
                    background: var(--cor-container);
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: var(--sombra-suave);
                    border: 1px solid var(--borda-clara);
                    margin-bottom: 32px;
                }

                .kpi-tipos-grid h3 {
                    color: var(--azul-royal);
                    margin: 0 0 20px 0;
                }

                .tipos-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }

                .kpi-tipo-card {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 16px;
                    transition: all 0.3s ease;
                }

                .kpi-tipo-card:hover {
                    box-shadow: var(--sombra-media);
                    transform: translateY(-2px);
                }

                .kpi-tipo-header h4 {
                    color: var(--texto-principal);
                    margin: 0 0 12px 0;
                    font-size: 1rem;
                }

                .kpi-tipo-valores {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .kpi-tipo-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .kpi-tipo-label {
                    font-size: 0.75rem;
                    color: var(--texto-secundario);
                }

                .kpi-tipo-valor {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--texto-principal);
                }

                /* === RESPONSIVO === */
                @media (max-width: 768px) {
                    .dashboard-filtros {
                        flex-direction: column;
                        gap: 16px;
                        align-items: stretch;
                    }

                    .filtros-periodo {
                        flex-direction: column;
                    }

                    .kpi-grid {
                        grid-template-columns: 1fr;
                    }

                    .graficos-grid {
                        grid-template-columns: 1fr;
                    }

                    .metricas-grid {
                        grid-template-columns: 1fr;
                    }

                    .tipos-kpi-grid {
                        grid-template-columns: 1fr;
                    }

                    .tabela-wrapper {
                        font-size: 0.85rem;
                    }

                    .tabela-atividades th,
                    .tabela-atividades td {
                        padding: 8px;
                    }
                }
            </style>
        `;

        if (!document.getElementById('estilos-dashboard')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }

    configurarEventos() {
        // Eventos serão configurados conforme necessário
    }
}

// Inicializa o dashboard
let dashboardAvancado;
document.addEventListener('DOMContentLoaded', () => {
    dashboardAvancado = new DashboardAvancado();
});

// Exporta para uso global
window.DashboardAvancado = DashboardAvancado;
window.dashboardAvancado = dashboardAvancado;
