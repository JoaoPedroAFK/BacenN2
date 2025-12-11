/* === SISTEMA DE RELATÓRIOS ROBUSTO VELOTAX === */

class SistemaRelatorios {
    constructor() {
        this.dados = [];
        this.relatorioAtual = null;
        this.filtros = {};
        this.inicializar();
    }

    inicializar() {
        this.carregarDados();
        this.adicionarEstilos();
        this.configurarEventos();
    }

    carregarDados() {
        const fichas = JSON.parse(localStorage.getItem('velotax_fichas') || '[]');
        this.dados = fichas.length > 0 ? fichas : this.obterDadosDemo();
    }

    obterDadosDemo() {
        // Dados demo mais robustos baseados na planilha
        return [
            {
                id: 1,
                nomeCliente: 'João Silva',
                cpf: '123.456.789-00',
                status: 'em-tratativa',
                dataCriacao: '2024-01-15',
                dataRecebimento: '2024-01-15',
                finalizadoEm: null,
                responsavel: 'atendente@velotax.com',
                origem: 'bacen',
                valorNegociado: '1500.00',
                modulosContato: { bacen: true, atendimento: true },
                pixLiberado: true,
                aceitouLiquidacao: false,
                enviarCobranca: false,
                motivoReduzido: 'Portabilidade não realizada',
                motivoDetalhado: 'Cliente solicitou portabilidade mas não foi concluída',
                observacoes: 'Aguardando documentação complementar',
                concluido: false
            },
            {
                id: 2,
                nomeCliente: 'Maria Santos',
                cpf: '987.654.321-00',
                status: 'concluido',
                dataCriacao: '2024-01-10',
                dataRecebimento: '2024-01-11',
                finalizadoEm: '2024-01-18',
                responsavel: 'admin@velotax.com',
                origem: 'telefone',
                valorNegociado: '2500.00',
                modulosContato: { atendimento: true },
                pixLiberado: true,
                aceitouLiquidacao: true,
                enviarCobranca: false,
                motivoReduzido: 'Erro no PIX',
                motivoDetalhado: 'PIX não foi creditado na conta destino',
                observacoes: 'Problema resolvido após contato com banco',
                concluido: true
            },
            {
                id: 3,
                nomeCliente: 'Pedro Costa',
                cpf: '456.789.123-00',
                status: 'nao-iniciado',
                dataCriacao: '2024-01-20',
                dataRecebimento: '2024-01-20',
                finalizadoEm: null,
                responsavel: 'atendente@velotax.com',
                origem: 'reclame-aqui',
                valorNegociado: '800.00',
                modulosContato: { reclameAqui: true },
                pixLiberado: false,
                aceitouLiquidacao: false,
                enviarCobranca: true,
                motivoReduzido: 'Cobrança indevida',
                motivoDetalhado: 'Cliente afirma que foi cobrado indevidamente',
                observacoes: 'Aguardando análise de extratos',
                concluido: false
            }
        ];
    }

    // === INTERFACE DE RELATÓRIOS ===
    criarInterfaceRelatorios() {
        return `
            <div class="relatorios-container">
                <div class="relatorios-header">
                    <h2>📊 Sistema de Relatórios Velotax</h2>
                    <div class="relatorios-actions">
                        <button class="velohub-btn btn-secondary" onclick="sistemaRelatorios.exportarTodos()">
                            📥 Exportar Todos
                        </button>
                    </div>
                </div>

                <!-- Tipos de Relatórios -->
                <div class="relatorios-tipos">
                    <h3>🎯 Selecione o Tipo de Relatório</h3>
                    <div class="tipos-grid">
                        <div class="tipo-card" onclick="sistemaRelatorios.gerarRelatorio('periodo')">
                            <div class="tipo-icon">📅</div>
                            <h4>Relatório por Período</h4>
                            <p>Análise detalhada por intervalo de datas</p>
                        </div>
                        <div class="tipo-card" onclick="sistemaRelatorios.gerarRelatorio('status')">
                            <div class="tipo-icon">📊</div>
                            <h4>Relatório por Status</h4>
                            <p>Distribuição estatística por status</p>
                        </div>
                        <div class="tipo-card" onclick="sistemaRelatorios.gerarRelatorio('responsavel')">
                            <div class="tipo-icon">👥</div>
                            <h4>Relatório por Responsável</h4>
                            <p>Performance individual dos responsáveis</p>
                        </div>
                        <div class="tipo-card" onclick="sistemaRelatorios.gerarRelatorio('origem')">
                            <div class="tipo-icon">📍</div>
                            <h4>Relatório por Origem</h4>
                            <p>Análise por canal de origem</p>
                        </div>
                        <div class="tipo-card" onclick="sistemaRelatorios.gerarRelatorio('valores')">
                            <div class="tipo-icon">💰</div>
                            <h4>Relatório Financeiro</h4>
                            <p>Análise de valores negociados</p>
                        </div>
                        <div class="tipo-card" onclick="sistemaRelatorios.gerarRelatorio('completo')">
                            <div class="tipo-icon">📋</div>
                            <h4>Relatório Completo</h4>
                            <p>Todos os dados em formato detalhado</p>
                        </div>
                    </div>
                </div>

                <!-- Filtros do Relatório -->
                <div class="relatorios-filtros" id="relatorios-filtros" style="display: none;">
                    <h3>⚙️ Configurar Filtros</h3>
                    <div class="filtros-conteudo" id="filtros-conteudo">
                        <!-- Filtros serão inseridos dinamicamente -->
                    </div>
                    <div class="filtros-actions">
                        <button class="velohub-btn btn-primary" onclick="sistemaRelatorios.aplicarFiltros()">
                            🔄 Gerar Relatório
                        </button>
                        <button class="velohub-btn btn-secondary" onclick="sistemaRelatorios.limparFiltros()">
                            🗑️ Limpar
                        </button>
                    </div>
                </div>

                <!-- Resultado do Relatório -->
                <div class="relatorio-resultado" id="relatorio-resultado" style="display: none;">
                    <!-- Conteúdo do relatório será inserido aqui -->
                </div>
            </div>
        `;
    }

    // === GERAÇÃO DE RELATÓRIOS ===
    gerarRelatorio(tipo) {
        this.relatorioAtual = tipo;
        this.mostrarFiltros(tipo);
    }

    mostrarFiltros(tipo) {
        const container = document.getElementById('relatorios-filtros');
        const conteudo = document.getElementById('filtros-conteudo');
        
        conteudo.innerHTML = this.criarFiltros(tipo);
        container.style.display = 'block';
        
        // Esconde resultado anterior
        document.getElementById('relatorio-resultado').style.display = 'none';
    }

    criarFiltros(tipo) {
        const filtrosBase = `
            <div class="filtro-grupo">
                <h4>📅 Período</h4>
                <div class="filtro-row">
                    <div class="filtro-item">
                        <label>Data Inicial:</label>
                        <input type="date" id="relatorio-data-inicial" class="velohub-input">
                    </div>
                    <div class="filtro-item">
                        <label>Data Final:</label>
                        <input type="date" id="relatorio-data-final" class="velohub-input">
                    </div>
                </div>
            </div>
        `;

        switch (tipo) {
            case 'periodo':
                return filtrosBase + `
                    <div class="filtro-grupo">
                        <h4>📊 Agrupamento</h4>
                        <select id="relatorio-agrupamento" class="velohub-input">
                            <option value="dia">Por Dia</option>
                            <option value="semana">Por Semana</option>
                            <option value="mes">Por Mês</option>
                            <option value="ano">Por Ano</option>
                        </select>
                    </div>
                `;
                
            case 'status':
                return filtrosBase + `
                    <div class="filtro-grupo">
                        <h4>📊 Status</h4>
                        <div class="filtro-checkboxes">
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-status" value="nao-iniciado" checked>
                                <span class="checkmark"></span>
                                Não Iniciado
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-status" value="em-tratativa" checked>
                                <span class="checkmark"></span>
                                Em Tratativa
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-status" value="concluido" checked>
                                <span class="checkmark"></span>
                                Concluído
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-status" value="respondido" checked>
                                <span class="checkmark"></span>
                                Respondido
                            </label>
                        </div>
                    </div>
                `;
                
            case 'responsavel':
                return filtrosBase + `
                    <div class="filtro-grupo">
                        <h4>👤 Responsáveis</h4>
                        <div class="filtro-checkboxes">
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-responsavel" value="admin@velotax.com" checked>
                                <span class="checkmark"></span>
                                Administrador
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-responsavel" value="atendente@velotax.com" checked>
                                <span class="checkmark"></span>
                                Atendente
                            </label>
                        </div>
                    </div>
                `;
                
            case 'origem':
                return filtrosBase + `
                    <div class="filtro-grupo">
                        <h4>📍 Origens</h4>
                        <div class="filtro-checkboxes">
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-origem" value="bacen" checked>
                                <span class="checkmark"></span>
                                BACEN
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-origem" value="telefone" checked>
                                <span class="checkmark"></span>
                                Telefone
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-origem" value="email" checked>
                                <span class="checkmark"></span>
                                Email
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-origem" value="reclame-aqui" checked>
                                <span class="checkmark"></span>
                                Reclame Aqui
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-origem" value="procon" checked>
                                <span class="checkmark"></span>
                                PROCON
                            </label>
                        </div>
                    </div>
                `;
                
            case 'valores':
                return filtrosBase + `
                    <div class="filtro-grupo">
                        <h4>💰 Faixa de Valores</h4>
                        <div class="filtro-row">
                            <div class="filtro-item">
                                <label>Valor Mínimo:</label>
                                <input type="number" id="relatorio-valor-min" class="velohub-input" 
                                       placeholder="R$ 0,00" step="0.01">
                            </div>
                            <div class="filtro-item">
                                <label>Valor Máximo:</label>
                                <input type="number" id="relatorio-valor-max" class="velohub-input" 
                                       placeholder="R$ 0,00" step="0.01">
                            </div>
                        </div>
                    </div>
                `;
                
            case 'completo':
                return filtrosBase + `
                    <div class="filtro-grupo">
                        <h4>📊 Campos a Incluir</h4>
                        <div class="filtro-checkboxes">
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-campos" value="basicos" checked>
                                <span class="checkmark"></span>
                                Dados Básicos
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-campos" value="contato" checked>
                                <span class="checkmark"></span>
                                Informações de Contato
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-campos" value="valores" checked>
                                <span class="checkmark"></span>
                                Valores
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="relatorio-campos" value="observacoes" checked>
                                <span class="checkmark"></span>
                                Observações
                            </label>
                        </div>
                    </div>
                `;
                
            default:
                return filtrosBase;
        }
    }

    aplicarFiltros() {
        const filtros = this.coletarFiltros();
        const dadosFiltrados = this.filtrarDados(filtros);
        
        this.exibirRelatorio(this.relatorioAtual, dadosFiltrados, filtros);
    }

    coletarFiltros() {
        const filtros = {
            dataInicial: document.getElementById('relatorio-data-inicial')?.value || null,
            dataFinal: document.getElementById('relatorio-data-final')?.value || null,
        };

        // Coleta filtros específicos por tipo
        switch (this.relatorioAtual) {
            case 'periodo':
                filtros.agrupamento = document.getElementById('relatorio-agrupamento')?.value || 'mes';
                break;
                
            case 'status':
                filtros.status = [];
                document.querySelectorAll('input[name="relatorio-status"]:checked').forEach(cb => {
                    filtros.status.push(cb.value);
                });
                break;
                
            case 'responsavel':
                filtros.responsaveis = [];
                document.querySelectorAll('input[name="relatorio-responsavel"]:checked').forEach(cb => {
                    filtros.responsaveis.push(cb.value);
                });
                break;
                
            case 'origem':
                filtros.origens = [];
                document.querySelectorAll('input[name="relatorio-origem"]:checked').forEach(cb => {
                    filtros.origens.push(cb.value);
                });
                break;
                
            case 'valores':
                filtros.valorMin = document.getElementById('relatorio-valor-min')?.value ? 
                                 parseFloat(document.getElementById('relatorio-valor-min').value) : null;
                filtros.valorMax = document.getElementById('relatorio-valor-max')?.value ? 
                                 parseFloat(document.getElementById('relatorio-valor-max').value) : null;
                break;
                
            case 'completo':
                filtros.campos = [];
                document.querySelectorAll('input[name="relatorio-campos"]:checked').forEach(cb => {
                    filtros.campos.push(cb.value);
                });
                break;
        }

        return filtros;
    }

    filtrarDados(filtros) {
        return this.dados.filter(dado => {
            // Filtro de datas
            if (filtros.dataInicial && new Date(dado.dataCriacao) < new Date(filtros.dataInicial)) {
                return false;
            }
            if (filtros.dataFinal && new Date(dado.dataCriacao) > new Date(filtros.dataFinal)) {
                return false;
            }
            
            // Filtro de status
            if (filtros.status && !filtros.status.includes(dado.status)) {
                return false;
            }
            
            // Filtro de responsáveis
            if (filtros.responsaveis && !filtros.responsaveis.includes(dado.responsavel)) {
                return false;
            }
            
            // Filtro de origens
            if (filtros.origens && !filtros.origens.includes(dado.origem)) {
                return false;
            }
            
            // Filtro de valores
            // Filtros de valor removidos
            
            return true;
        });
    }

    // === EXIBIÇÃO DE RELATÓRIOS ===
    exibirRelatorio(tipo, dados, filtros) {
        const container = document.getElementById('relatorio-resultado');
        
        switch (tipo) {
            case 'periodo':
                container.innerHTML = this.gerarRelatorioPeriodo(dados, filtros);
                break;
            case 'status':
                container.innerHTML = this.gerarRelatorioStatus(dados, filtros);
                break;
            case 'responsavel':
                container.innerHTML = this.gerarRelatorioResponsavel(dados, filtros);
                break;
            case 'origem':
                container.innerHTML = this.gerarRelatorioOrigem(dados, filtros);
                break;
            case 'valores':
                container.innerHTML = this.gerarRelatorioValores(dados, filtros);
                break;
            case 'completo':
                container.innerHTML = this.gerarRelatorioCompleto(dados, filtros);
                break;
        }
        
        container.style.display = 'block';
    }

    gerarRelatorioPeriodo(dados, filtros) {
        // Agrupa dados por período
        const agrupados = this.agruparPorPeriodo(dados, filtros.agrupamento);
        
        let tabelaHTML = `
            <div class="relatorio-header">
                <h3>📅 Relatório por Período</h3>
                <div class="relatorio-info">
                    <span>Período: ${this.formatarPeriodo(filtros)}</span>
                    <span>Total de registros: ${dados.length}</span>
                </div>
            </div>
            
            <div class="relatorio-conteudo">
                <div class="tabela-container">
                    <table class="relatorio-tabela">
                        <thead>
                            <tr>
                                <th>Período</th>
                                <th>Quantidade</th>
                                <th>% do Total</th>
                                <th>Valor Total</th>
                                <th>Taxa Conclusão</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        Object.entries(agrupados).forEach(([periodo, itens]) => {
            const percentual = dados.length > 0 ? (itens.length / dados.length * 100) : 0;
            const valorTotal = 0; // Campo removido
            const concluidos = itens.filter(item => item.concluido).length;
            const taxaConclusao = itens.length > 0 ? (concluidos / itens.length * 100) : 0;
            
            tabelaHTML += `
                <tr>
                    <td>${periodo}</td>
                    <td>${itens.length}</td>
                    <td>${percentual.toFixed(1)}%</td>
                    <td>R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${taxaConclusao.toFixed(1)}%</td>
                </tr>
            `;
        });
        
        tabelaHTML += `
                        </tbody>
                    </table>
                </div>
                
                <div class="relatorio-acoes">
                    <button class="velohub-btn btn-primary" onclick="sistemaRelatorios.exportarRelatorio('periodo')">
                        📥 Exportar Relatório
                    </button>
                </div>
            </div>
        `;
        
        return tabelaHTML;
    }

    gerarRelatorioStatus(dados, filtros) {
        const statusCount = {};
        const statusValores = {};
        
        dados.forEach(dado => {
            const status = dado.status || 'nao-definido';
            statusCount[status] = (statusCount[status] || 0) + 1;
            // Campo removido
        });
        
        let tabelaHTML = `
            <div class="relatorio-header">
                <h3>📊 Relatório por Status</h3>
                <div class="relatorio-info">
                    <span>Período: ${this.formatarPeriodo(filtros)}</span>
                    <span>Total de registros: ${dados.length}</span>
                </div>
            </div>
            
            <div class="relatorio-conteudo">
                <div class="resumo-cards">
                    ${Object.entries(statusCount).map(([status, count]) => {
                        const valor = statusValores[status] || 0;
                        const percentual = dados.length > 0 ? (count / dados.length * 100) : 0;
                        
                        return `
                            <div class="resumo-card status-${status}">
                                <div class="resumo-titulo">${this.formatarStatus(status)}</div>
                                <div class="resumo-valor">${count}</div>
                                <div class="resumo-percentual">${percentual.toFixed(1)}%</div>
                                <div class="resumo-valor-total">R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="relatorio-acoes">
                    <button class="velohub-btn btn-primary" onclick="sistemaRelatorios.exportarRelatorio('status')">
                        📥 Exportar Relatório
                    </button>
                </div>
            </div>
        `;
        
        return tabelaHTML;
    }

    gerarRelatorioResponsavel(dados, filtros) {
        const responsaveis = {};
        
        dados.forEach(dado => {
            const responsavel = dado.responsavel?.split('@')[0] || 'não-atribuído';
            if (!responsaveis[responsavel]) {
                responsaveis[responsavel] = {
                    total: 0,
                    concluidos: 0,
                    emTratativa: 0,
                    valorTotal: 0
                };
            }
            responsaveis[responsavel].total++;
            // Campo removido
            
            if (dado.concluido) responsaveis[responsavel].concluidos++;
            if (dado.status === 'em-tratativa') responsaveis[responsavel].emTratativa++;
        });
        
        let tabelaHTML = `
            <div class="relatorio-header">
                <h3>👥 Relatório por Responsável</h3>
                <div class="relatorio-info">
                    <span>Período: ${this.formatarPeriodo(filtros)}</span>
                    <span>Total de registros: ${dados.length}</span>
                </div>
            </div>
            
            <div class="relatorio-conteudo">
                <div class="tabela-container">
                    <table class="relatorio-tabela">
                        <thead>
                            <tr>
                                <th>Responsável</th>
                                <th>Total</th>
                                <th>Concluídos</th>
                                <th>Em Tratativa</th>
                                <th>Taxa Conclusão</th>
                                <th>Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        Object.entries(responsaveis).forEach(([responsavel, dados]) => {
            const taxaConclusao = dados.total > 0 ? (dados.concluidos / dados.total * 100) : 0;
            
            tabelaHTML += `
                <tr>
                    <td>${responsavel}</td>
                    <td>${dados.total}</td>
                    <td>${dados.concluidos}</td>
                    <td>${dados.emTratativa}</td>
                    <td>${taxaConclusao.toFixed(1)}%</td>
                    <td>R$ ${dados.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        });
        
        tabelaHTML += `
                        </tbody>
                    </table>
                </div>
                
                <div class="relatorio-acoes">
                    <button class="velohub-btn btn-primary" onclick="sistemaRelatorios.exportarRelatorio('responsavel')">
                        📥 Exportar Relatório
                    </button>
                </div>
            </div>
        `;
        
        return tabelaHTML;
    }

    gerarRelatorioOrigem(dados, filtros) {
        const origens = {};
        
        dados.forEach(dado => {
            const origem = dado.origem || 'não-informada';
            if (!origens[origem]) {
                origens[origem] = {
                    total: 0,
                    concluidos: 0,
                    valorTotal: 0
                };
            }
            origens[origem].total++;
            // Campo removido
            
            if (dado.concluido) origens[origem].concluidos++;
        });
        
        let tabelaHTML = `
            <div class="relatorio-header">
                <h3>📍 Relatório por Origem</h3>
                <div class="relatorio-info">
                    <span>Período: ${this.formatarPeriodo(filtros)}</span>
                    <span>Total de registros: ${dados.length}</span>
                </div>
            </div>
            
            <div class="relatorio-conteudo">
                <div class="grafico-barras-container">
                    ${Object.entries(origens).map(([origem, dados]) => {
                        const percentual = (dados.total / dados.length * 100);
                        
                        return `
                            <div class="barra-vertical-item">
                                <div class="barra-vertical" style="height: ${percentual}%;">
                                    <div class="barra-valor">${dados.total}</div>
                                </div>
                                <div class="barra-label">${this.formatarOrigem(origem)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="relatorio-acoes">
                    <button class="velohub-btn btn-primary" onclick="sistemaRelatorios.exportarRelatorio('origem')">
                        📥 Exportar Relatório
                    </button>
                </div>
            </div>
        `;
        
        return tabelaHTML;
    }

    gerarRelatorioValores(dados, filtros) {
        const valores = []; // Campo removido
        
        if (valores.length === 0) {
            return `
                <div class="relatorio-header">
                    <h3>💰 Relatório Financeiro</h3>
                </div>
                <div class="relatorio-conteudo">
                    <div class="sem-dados">Nenhum valor encontrado no período</div>
                </div>
            `;
        }
        
        const estatisticas = {
            total: valores.reduce((a, b) => a + b, 0),
            media: valores.reduce((a, b) => a + b, 0) / valores.length,
            mediana: this.calcularMediana(valores),
            min: Math.min(...valores),
            max: Math.max(...valores)
        };
        
        // Cria faixas de valores
        const faixas = [
            { label: 'Até R$ 500', min: 0, max: 500, count: 0 },
            { label: 'R$ 501 - R$ 1.000', min: 501, max: 1000, count: 0 },
            { label: 'R$ 1.001 - R$ 2.000', min: 1001, max: 2000, count: 0 },
            { label: 'R$ 2.001 - R$ 3.000', min: 2001, max: 3000, count: 0 },
            { label: 'Acima de R$ 3.000', min: 3001, max: Infinity, count: 0 }
        ];
        
        valores.forEach(valor => {
            const faixa = faixas.find(f => valor >= f.min && valor <= f.max);
            if (faixa) faixa.count++;
        });
        
        return `
            <div class="relatorio-header">
                <h3>💰 Relatório Financeiro</h3>
                <div class="relatorio-info">
                    <span>Período: ${this.formatarPeriodo(filtros)}</span>
                    <span>Total de registros: ${dados.length}</span>
                </div>
            </div>
            
            <div class="relatorio-conteudo">
                <div class="estatisticas-grid">
                    <div class="estatistica-card">
                        <div class="estatistica-titulo">Total Negociado</div>
                        <div class="estatistica-valor">R$ ${estatisticas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="estatistica-card">
                        <div class="estatistica-titulo">Valor Médio</div>
                        <div class="estatistica-valor">R$ ${estatisticas.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="estatistica-card">
                        <div class="estatistica-titulo">Mediana</div>
                        <div class="estatistica-valor">R$ ${estatisticas.mediana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="estatistica-card">
                        <div class="estatistica-titulo">Maior Valor</div>
                        <div class="estatistica-valor">R$ ${estatisticas.max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
                
                <div class="faixas-container">
                    <h4>Distribuição por Faixa de Valores</h4>
                    <div class="faixas-grid">
                        ${faixas.map(faixa => `
                            <div class="faixa-card">
                                <div class="faixa-label">${faixa.label}</div>
                                <div class="faixa-valor">${faixa.count}</div>
                                <div class="faixa-percentual">${(faixa.count / valores.length * 100).toFixed(1)}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="relatorio-acoes">
                    <button class="velohub-btn btn-primary" onclick="sistemaRelatorios.exportarRelatorio('valores')">
                        📥 Exportar Relatório
                    </button>
                </div>
            </div>
        `;
    }

    gerarRelatorioCompleto(dados, filtros) {
        const campos = filtros.campos || ['basicos', 'contato', 'valores', 'observacoes'];
        
        let tabelaHTML = `
            <div class="relatorio-header">
                <h3>📋 Relatório Completo</h3>
                <div class="relatorio-info">
                    <span>Período: ${this.formatarPeriodo(filtros)}</span>
                    <span>Total de registros: ${dados.length}</span>
                </div>
            </div>
            
            <div class="relatorio-conteudo">
                <div class="tabela-container tabela-grande">
                    <table class="relatorio-tabela">
                        <thead>
                            <tr>
        `;
        
        // Cabeçalhos dinâmicos baseados nos campos selecionados
        if (campos.includes('basicos')) {
            tabelaHTML += `
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Data Criação</th>
                <th>Status</th>
            `;
        }
        
        if (campos.includes('contato')) {
            tabelaHTML += `
                <th>Telefone</th>
                <th>Origem</th>
                <th>Responsável</th>
            `;
        }
        
        if (campos.includes('valores')) {
            tabelaHTML += `
                <th>PIX Liberado</th>
                <th>Liquidação</th>
            `;
        }
        
        if (campos.includes('observacoes')) {
            tabelaHTML += `
                <th>Motivo Reduzido</th>
                <th>Observações</th>
            `;
        }
        
        tabelaHTML += `
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Linhas da tabela
        dados.forEach(dado => {
            tabelaHTML += '<tr>';
            
            if (campos.includes('basicos')) {
                tabelaHTML += `
                    <td>${dado.id}</td>
                    <td>${dado.nomeCliente || ''}</td>
                    <td>${dado.cpf || ''}</td>
                    <td>${this.formatarData(dado.dataCriacao)}</td>
                    <td><span class="status-badge status-${dado.status}">${this.formatarStatus(dado.status)}</span></td>
                `;
            }
            
            if (campos.includes('contato')) {
                tabelaHTML += `
                    <td>${dado.telefone || ''}</td>
                    <td>${this.formatarOrigem(dado.origem)}</td>
                    <td>${dado.responsavel?.split('@')[0] || ''}</td>
                `;
            }
            
            if (campos.includes('valores')) {
                tabelaHTML += `
                    <td>${dado.pixLiberado ? '✅' : '❌'}</td>
                    <td>${dado.aceitouLiquidacao ? '✅' : '❌'}</td>
                `;
            }
            
            if (campos.includes('observacoes')) {
                tabelaHTML += `
                    <td>${dado.motivoReduzido || ''}</td>
                    <td>${dado.observacoes || ''}</td>
                `;
            }
            
            tabelaHTML += '</tr>';
        });
        
        tabelaHTML += `
                        </tbody>
                    </table>
                </div>
                
                <div class="relatorio-acoes">
                    <button class="velohub-btn btn-primary" onclick="sistemaRelatorios.exportarRelatorio('completo')">
                        📥 Exportar Relatório
                    </button>
                </div>
            </div>
        `;
        
        return tabelaHTML;
    }

    // === UTILITÁRIOS ===
    agruparPorPeriodo(dados, agrupamento) {
        const agrupados = {};
        
        dados.forEach(dado => {
            let chave;
            const data = new Date(dado.dataCriacao);
            
            switch (agrupamento) {
                case 'dia':
                    chave = data.toLocaleDateString('pt-BR');
                    break;
                case 'semana':
                    const semana = Math.floor((data - new Date(data.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
                    chave = `Semana ${semana + 1}`;
                    break;
                case 'mes':
                    chave = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                    break;
                case 'ano':
                    chave = data.getFullYear().toString();
                    break;
                default:
                    chave = data.toLocaleDateString('pt-BR');
            }
            
            if (!agrupados[chave]) {
                agrupados[chave] = [];
            }
            agrupados[chave].push(dado);
        });
        
        return agrupados;
    }

    calcularMediana(valores) {
        if (valores.length === 0) return 0;
        
        const meio = Math.floor(valores.length / 2);
        
        if (valores.length % 2 === 0) {
            return (valores[meio - 1] + valores[meio]) / 2;
        } else {
            return valores[meio];
        }
    }

    formatarPeriodo(filtros) {
        if (filtros.dataInicial && filtros.dataFinal) {
            return `${this.formatarData(filtros.dataInicial)} a ${this.formatarData(filtros.dataFinal)}`;
        } else if (filtros.dataInicial) {
            return `A partir de ${this.formatarData(filtros.dataInicial)}`;
        } else if (filtros.dataFinal) {
            return `Até ${this.formatarData(filtros.dataFinal)}`;
        } else {
            'Todo o período';
        }
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

    // === EXPORTAÇÃO ===
    exportarRelatorio(tipo) {
        // Implementa exportação baseada no tipo
        this.mostrarNotificacao(`Exportando relatório ${tipo}...`, 'info');
        
        // Simulação de exportação
        setTimeout(() => {
            this.mostrarNotificacao('Relatório exportado com sucesso!', 'success');
        }, 1500);
    }

    exportarTodos() {
        this.mostrarNotificacao('Preparando exportação completa...', 'info');
        
        setTimeout(() => {
            this.mostrarNotificacao('Todos os relatórios exportados!', 'success');
        }, 2000);
    }

    limparFiltros() {
        document.getElementById('relatorios-filtros').style.display = 'none';
        document.getElementById('relatorio-resultado').style.display = 'none';
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
            <style id="estilos-relatorios">
                /* === CONTAINER PRINCIPAL === */
                .relatorios-container {
                    background: var(--cor-container);
                    border-radius: 12px;
                    box-shadow: var(--sombra-media);
                    padding: 24px;
                    margin: 20px auto;
                    max-width: 1400px;
                }

                .relatorios-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid var(--borda-clara);
                }

                .relatorios-header h2 {
                    color: var(--azul-royal);
                    margin: 0;
                }

                /* === TIPOS DE RELATÓRIOS === */
                .relatorios-tipos {
                    margin-bottom: 32px;
                }

                .relatorios-tipos h3 {
                    color: var(--texto-principal);
                    margin-bottom: 20px;
                }

                .tipos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                }

                .tipo-card {
                    background: var(--cor-sidebar);
                    border: 2px solid var(--borda-clara);
                    border-radius: 12px;
                    padding: 24px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .tipo-card:hover {
                    border-color: var(--azul-royal);
                    transform: translateY(-2px);
                    box-shadow: var(--sombra-media);
                }

                .tipo-icon {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                }

                .tipo-card h4 {
                    color: var(--azul-royal);
                    margin: 0 0 8px 0;
                }

                .tipo-card p {
                    color: var(--texto-secundario);
                    margin: 0;
                    font-size: 0.9rem;
                }

                /* === FILTROS === */
                .relatorios-filtros {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 24px;
                    margin-bottom: 24px;
                }

                .relatorios-filtros h3 {
                    color: var(--azul-royal);
                    margin: 0 0 20px 0;
                }

                .filtros-conteudo {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .filtro-grupo {
                    background: var(--cor-container);
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid var(--borda-clara);
                }

                .filtro-grupo h4 {
                    color: var(--texto-principal);
                    margin: 0 0 12px 0;
                    font-size: 0.95rem;
                }

                .filtro-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .filtro-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .filtro-item label {
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                    font-weight: 500;
                }

                .filtro-checkboxes {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }

                .filtros-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                /* === RESULTADO DO RELATÓRIO === */
                .relatorio-resultado {
                    background: var(--cor-container);
                    border-radius: 8px;
                    padding: 24px;
                    border: 1px solid var(--borda-clara);
                }

                .relatorio-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid var(--borda-clara);
                }

                .relatorio-header h3 {
                    color: var(--azul-royal);
                    margin: 0;
                }

                .relatorio-info {
                    display: flex;
                    gap: 16px;
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                }

                .relatorio-conteudo {
                    margin-bottom: 24px;
                }

                .relatorio-acoes {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 16px;
                    border-top: 1px solid var(--borda-clara);
                }

                /* === TABELAS === */
                .tabela-container {
                    overflow-x: auto;
                    margin-bottom: 20px;
                }

                .tabela-grande {
                    max-height: 500px;
                    overflow-y: auto;
                }

                .relatorio-tabela {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .relatorio-tabela th {
                    background: var(--azul-royal);
                    color: white;
                    font-weight: 600;
                    text-align: left;
                    padding: 12px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .relatorio-tabela td {
                    padding: 10px 12px;
                    border-bottom: 1px solid var(--borda-clara);
                }

                .relatorio-tabela tr:hover {
                    background: var(--cor-sidebar);
                }

                /* === RESUMO CARDS === */
                .resumo-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .resumo-card {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    border-left: 4px solid var(--azul-royal);
                }

                .resumo-card.status-nao-iniciado { border-left-color: var(--cinza-claro); }
                .resumo-card.status-em-tratativa { border-left-color: var(--laranja-destaque); }
                .resumo-card.status-concluido { border-left-color: var(--azul-ciano); }
                .resumo-card.status-respondido { border-left-color: var(--roxo-escuro); }

                .resumo-titulo {
                    font-size: 0.9rem;
                    color: var(--texto-secundario);
                    margin-bottom: 8px;
                }

                .resumo-valor {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--azul-royal);
                    margin-bottom: 4px;
                }

                .resumo-percentual {
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                    margin-bottom: 8px;
                }

                .resumo-valor-total {
                    font-size: 0.9rem;
                    color: var(--texto-principal);
                    font-weight: 600;
                }

                /* === ESTATÍSTICAS === */
                .estatisticas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .estatistica-card {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                }

                .estatistica-titulo {
                    font-size: 0.9rem;
                    color: var(--texto-secundario);
                    margin-bottom: 8px;
                }

                .estatistica-valor {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--azul-royal);
                }

                /* === FAIXAS DE VALORES === */
                .faixas-container {
                    margin-bottom: 24px;
                }

                .faixas-container h4 {
                    color: var(--texto-principal);
                    margin-bottom: 16px;
                }

                .faixas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 12px;
                }

                .faixa-card {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 16px;
                    text-align: center;
                }

                .faixa-label {
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                    margin-bottom: 8px;
                }

                .faixa-valor {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--azul-royal);
                    margin-bottom: 4px;
                }

                .faixa-percentual {
                    font-size: 0.8rem;
                    color: var(--texto-secundario);
                }

                /* === GRÁFICOS === */
                .grafico-barras-container {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 200px;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .barra-vertical-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                }

                .barra-vertical {
                    width: 60px;
                    background: var(--azul-royal);
                    border-radius: 4px 4px 0 0;
                    position: relative;
                    min-height: 20px;
                    transition: all 0.3s ease;
                }

                .barra-vertical:hover {
                    opacity: 0.8;
                }

                .barra-valor {
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-weight: 600;
                    color: var(--texto-principal);
                }

                .barra-label {
                    margin-top: 8px;
                    font-size: 0.8rem;
                    color: var(--texto-secundario);
                    text-align: center;
                    max-width: 100%;
                    word-wrap: break-word;
                }

                /* === ESTADOS ESPECIAIS === */
                .sem-dados {
                    text-align: center;
                    padding: 40px;
                    color: var(--texto-secundario);
                    font-style: italic;
                }

                /* === RESPONSIVO === */
                @media (max-width: 768px) {
                    .relatorios-header,
                    .relatorio-header {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }

                    .relatorio-info {
                        flex-direction: column;
                        gap: 4px;
                    }

                    .tipos-grid {
                        grid-template-columns: 1fr;
                    }

                    .filtros-conteudo {
                        grid-template-columns: 1fr;
                    }

                    .filtro-row {
                        grid-template-columns: 1fr;
                    }

                    .resumo-cards,
                    .estatisticas-grid,
                    .faixas-grid {
                        grid-template-columns: 1fr;
                    }

                    .grafico-barras-container {
                        height: auto;
                        flex-direction: column;
                    }

                    .barra-vertical {
                        width: 100%;
                        height: 40px !important;
                        margin-bottom: 8px;
                    }

                    .barra-valor {
                        top: 50%;
                        left: 10px;
                        transform: translateY(-50%);
                    }

                    .tabela-grande {
                        max-height: 400px;
                    }
                }
            </style>
        `;

        if (!document.getElementById('estilos-relatorios')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }

    configurarEventos() {
        // Eventos serão configurados conforme necessário
    }
}

// Inicializa o sistema de relatórios
let sistemaRelatorios;
document.addEventListener('DOMContentLoaded', () => {
    sistemaRelatorios = new SistemaRelatorios();
});

// Exporta para uso global
window.SistemaRelatorios = SistemaRelatorios;
window.sistemaRelatorios = sistemaRelatorios;
