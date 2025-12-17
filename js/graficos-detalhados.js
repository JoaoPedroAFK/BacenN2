/* === SISTEMA DE GRÁFICOS DETALHADOS E FILTRÁVEIS === */

class GraficosDetalhados {
    constructor(tipoDemanda) {
        this.tipoDemanda = tipoDemanda;
        this.dados = [];
        this.filtros = {
            periodo: 'todos',
            status: 'todos',
            responsavel: 'todos',
            origem: 'todos'
        };
        this.inicializar();
    }

    inicializar() {
        this.carregarDados();
        this.renderizarFiltros();
        this.renderizarGraficos();
    }

    carregarDados() {
        if (window.gerenciadorFichas) {
            this.dados = window.gerenciadorFichas.obterFichasPorTipo(this.tipoDemanda);
        } else if (window.armazenamentoReclamacoes) {
            // Usar o novo sistema de armazenamento
            this.dados = window.armazenamentoReclamacoes.carregarTodos(this.tipoDemanda);
        } else {
            // Fallback: tentar chave nova primeiro, depois antiga
            const keyNova = `velotax_reclamacoes_${this.tipoDemanda}`;
            const keyAntiga = `velotax_demandas_${this.tipoDemanda}`;
            this.dados = JSON.parse(localStorage.getItem(keyNova) || localStorage.getItem(keyAntiga) || '[]');
        }
    }

    renderizarFiltros() {
        const containerId = `filtros-graficos-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            // Criar container de filtros antes dos gráficos
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                container = document.createElement('div');
                container.id = containerId;
                container.className = 'filtros-graficos-container';
                graficosContainer.parentNode.insertBefore(container, graficosContainer);
            } else {
                return;
            }
        }

        const responsaveis = [...new Set(this.dados.map(f => f.responsavel).filter(Boolean))];
        const origens = [...new Set(this.dados.map(f => f.origem).filter(Boolean))];

        container.innerHTML = `
            <div class="filtros-graficos">
                <h3>🔍 Filtros dos Gráficos</h3>
                <div class="filtros-grid">
                    <div class="filtro-item">
                        <label>Período:</label>
                        <select id="filtro-periodo-${this.tipoDemanda}" onchange="graficosDetalhados${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.aplicarFiltros()">
                            <option value="todos">Todos</option>
                            <option value="7dias">Últimos 7 dias</option>
                            <option value="30dias">Últimos 30 dias</option>
                            <option value="90dias">Últimos 90 dias</option>
                            <option value="mes">Este mês</option>
                            <option value="ano">Este ano</option>
                        </select>
                    </div>
                    <div class="filtro-item">
                        <label>Status:</label>
                        <select id="filtro-status-${this.tipoDemanda}" onchange="graficosDetalhados${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.aplicarFiltros()">
                            <option value="todos">Todos</option>
                            <option value="nao-iniciado">Não Iniciado</option>
                            <option value="em-tratativa">Em Tratativa</option>
                            <option value="concluido">Concluído</option>
                            <option value="respondido">Respondido</option>
                        </select>
                    </div>
                    <div class="filtro-item">
                        <label>Responsável:</label>
                        <select id="filtro-responsavel-${this.tipoDemanda}" onchange="graficosDetalhados${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.aplicarFiltros()">
                            <option value="todos">Todos</option>
                            ${responsaveis.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>
                    ${this.tipoDemanda === 'bacen' || this.tipoDemanda === 'n2' ? `
                    <div class="filtro-item">
                        <label>Origem:</label>
                        <select id="filtro-origem-${this.tipoDemanda}" onchange="graficosDetalhados${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.aplicarFiltros()">
                            <option value="todos">Todos</option>
                            ${origens.map(o => `<option value="${o}">${o}</option>`).join('')}
                        </select>
                    </div>
                    ` : ''}
                    <div class="filtro-item">
                        <button class="velohub-btn btn-secondary" onclick="graficosDetalhados${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.limparFiltros()">🔄 Limpar Filtros</button>
                    </div>
                </div>
            </div>
        `;
    }

    aplicarFiltros() {
        this.filtros.periodo = document.getElementById(`filtro-periodo-${this.tipoDemanda}`).value;
        this.filtros.status = document.getElementById(`filtro-status-${this.tipoDemanda}`).value;
        this.filtros.responsavel = document.getElementById(`filtro-responsavel-${this.tipoDemanda}`).value;
        if (this.tipoDemanda === 'bacen' || this.tipoDemanda === 'n2') {
            this.filtros.origem = document.getElementById(`filtro-origem-${this.tipoDemanda}`).value;
        }
        
        this.renderizarGraficos();
    }

    limparFiltros() {
        this.filtros = {
            periodo: 'todos',
            status: 'todos',
            responsavel: 'todos',
            origem: 'todos'
        };
        
        document.getElementById(`filtro-periodo-${this.tipoDemanda}`).value = 'todos';
        document.getElementById(`filtro-status-${this.tipoDemanda}`).value = 'todos';
        document.getElementById(`filtro-responsavel-${this.tipoDemanda}`).value = 'todos';
        if (this.tipoDemanda === 'bacen' || this.tipoDemanda === 'n2') {
            document.getElementById(`filtro-origem-${this.tipoDemanda}`).value = 'todos';
        }
        
        this.renderizarGraficos();
    }

    obterDadosFiltrados() {
        let dadosFiltrados = [...this.dados];

        // Filtro de período
        if (this.filtros.periodo !== 'todos') {
            const hoje = new Date();
            const dataLimite = new Date();
            
            switch (this.filtros.periodo) {
                case '7dias':
                    dataLimite.setDate(hoje.getDate() - 7);
                    break;
                case '30dias':
                    dataLimite.setDate(hoje.getDate() - 30);
                    break;
                case '90dias':
                    dataLimite.setDate(hoje.getDate() - 90);
                    break;
                case 'mes':
                    dataLimite.setDate(1);
                    dataLimite.setMonth(hoje.getMonth());
                    break;
                case 'ano':
                    dataLimite.setFullYear(hoje.getFullYear(), 0, 1);
                    break;
            }
            
            dadosFiltrados = dadosFiltrados.filter(f => {
                const dataFicha = new Date(f.dataEntrada || f.dataCriacao || f.dataReclamacao);
                return dataFicha >= dataLimite;
            });
        }

        // Filtro de status
        if (this.filtros.status !== 'todos') {
            dadosFiltrados = dadosFiltrados.filter(f => f.status === this.filtros.status);
        }

        // Filtro de responsável
        if (this.filtros.responsavel !== 'todos') {
            dadosFiltrados = dadosFiltrados.filter(f => f.responsavel === this.filtros.responsavel);
        }

        // Filtro de origem
        if (this.filtros.origem !== 'todos' && (this.tipoDemanda === 'bacen' || this.tipoDemanda === 'n2')) {
            dadosFiltrados = dadosFiltrados.filter(f => f.origem === this.filtros.origem);
        }

        return dadosFiltrados;
    }

    renderizarGraficos() {
        const dadosFiltrados = this.obterDadosFiltrados();
        
        if (this.tipoDemanda === 'bacen') {
            // BACEN: 7 gráficos conforme proposta
            this.renderizarGraficoStatusPizza(dadosFiltrados);
            this.renderizarGraficoMensal(dadosFiltrados);
            this.renderizarGraficoOrigem(dadosFiltrados);
            this.renderizarGraficoPrazoBacen(dadosFiltrados);
            this.renderizarGraficoCobrancaPizza(dadosFiltrados);
            this.renderizarGraficoCasosCriticos(dadosFiltrados);
            this.renderizarGraficoResponsavel(dadosFiltrados);
        } else if (this.tipoDemanda === 'n2') {
            // N2: 5 gráficos (removidos: StatusPortabilidade, BancoDestino)
            this.renderizarGraficoStatusPizza(dadosFiltrados);
            this.renderizarGraficoMensal(dadosFiltrados);
            this.renderizarGraficoOrigem(dadosFiltrados);
            this.renderizarGraficoCobrancaPizza(dadosFiltrados);
            this.renderizarGraficoCasosCriticos(dadosFiltrados);
            this.renderizarGraficoResponsavel(dadosFiltrados);
        } else if (this.tipoDemanda === 'chatbot') {
            // Chatbot: 6 gráficos (removidos: ResolucaoAuto)
            this.renderizarGraficoStatusPizza(dadosFiltrados);
            this.renderizarGraficoCanal(dadosFiltrados);
            this.renderizarGraficoSatisfacao(dadosFiltrados);
            this.renderizarGraficoMensal(dadosFiltrados);
            this.renderizarGraficoProduto(dadosFiltrados);
            this.renderizarGraficoCobrancaPizza(dadosFiltrados);
            this.renderizarGraficoCasosCriticos(dadosFiltrados);
        }
    }

    renderizarGraficoStatusPizza(dados) {
        // Usar o ID padrão do HTML: grafico-status-{tipo}
        const containerId = `grafico-status-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            // Tentar encontrar container de gráficos de várias formas
            let graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-chatbot`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-bacen`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-n2`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda}`);
            }
            
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Status das Reclamações</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                console.error(`❌ Container de gráficos não encontrado para ${this.tipoDemanda}`);
                return;
            }
        }
        
        console.log(`✅ Renderizando gráfico Status em: ${containerId}`);

        const statusCount = {};
        dados.forEach(f => {
            const status = f.status || 'sem-status';
            const statusNormalizado = status.toLowerCase().trim().replace('í', 'i').replace('é', 'e');
            statusCount[statusNormalizado] = (statusCount[statusNormalizado] || 0) + 1;
        });

        const labels = Object.keys(statusCount);
        const values = Object.values(statusCount);
        
        if (values.reduce((a, b) => a + b, 0) === 0) {
            container.innerHTML = '<p>Nenhum dado disponível</p>';
            return;
        }

        container.innerHTML = this.criarGraficoPizza(labels, values, 'Status');
        console.log(`✅ Gráfico de Status renderizado:`, { labels, values });
    }

    renderizarGraficoStatus(dados) {
        const container = document.getElementById(`grafico-status-${this.tipoDemanda}`);
        if (!container) return;

        const statusCount = {};
        dados.forEach(f => {
            const status = f.status || 'sem-status';
            // Normalizar status para evitar duplicações (concluido vs concluído)
            const statusNormalizado = status.toLowerCase().trim().replace('í', 'i').replace('é', 'e');
            statusCount[statusNormalizado] = (statusCount[statusNormalizado] || 0) + 1;
        });

        const labels = Object.keys(statusCount);
        const values = Object.values(statusCount);
        const cores = {
            'nao-iniciado': '#FF8400',
            'em-tratativa': '#1634FF',
            'concluido': '#1DFDB9',
            'concluído': '#1DFDB9',
            'respondido': '#791DD0',
            'sem-status': '#666'
        };

        container.innerHTML = this.criarGraficoBarras(labels, values, cores, 'Status');
    }

    renderizarGraficoMensal(dados) {
        const container = document.getElementById(`grafico-mensal-${this.tipoDemanda}`);
        if (!container) return;

        const mesesCount = {};
        dados.forEach(f => {
            const mes = f.mes || this.extrairMes(f.dataEntrada || f.dataCriacao);
            if (mes) {
                mesesCount[mes] = (mesesCount[mes] || 0) + 1;
            }
        });

        const meses = Object.keys(mesesCount).sort();
        const valores = meses.map(m => mesesCount[m]);

        container.innerHTML = this.criarGraficoLinha(meses, valores, 'Mês', '#1634FF');
    }

    renderizarGraficoDiario(dados) {
        const containerId = `grafico-diario-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Reclamações por Dia (Últimos 30 dias)</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const diasCount = {};
        const hoje = new Date();
        const ultimos30Dias = [];
        
        for (let i = 29; i >= 0; i--) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() - i);
            const dataStr = `${data.getDate()}/${data.getMonth() + 1}`;
            ultimos30Dias.push(dataStr);
            diasCount[dataStr] = 0;
        }

        dados.forEach(f => {
            const dataEntrada = f.dataEntrada || f.dataCriacao || f.dataReclamacao;
            if (dataEntrada) {
                const data = new Date(dataEntrada);
                const dataStr = `${data.getDate()}/${data.getMonth() + 1}`;
                if (diasCount.hasOwnProperty(dataStr)) {
                    diasCount[dataStr]++;
                }
            }
        });

        const dias = ultimos30Dias;
        const valores = dias.map(d => diasCount[d] || 0);

        container.innerHTML = this.criarGraficoLinha(dias, valores, 'Dia', '#1DFDB9');
    }

    renderizarGraficoCobrancaPizza(dados) {
        // Usar o ID padrão: grafico-cobranca-{tipo}
        const containerId = `grafico-cobranca-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            // Tentar encontrar container de gráficos de várias formas
            let graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-chatbot`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-bacen`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-n2`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda}`);
            }
            
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Enviado para Cobrança</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                console.error(`❌ Container de gráficos não encontrado para ${this.tipoDemanda}`);
                return;
            }
        }
        
        console.log(`✅ Renderizando gráfico Cobrança em: ${containerId}`);

        const cobrancaCount = {
            'Sim': dados.filter(f => f.enviarCobranca === true || f.enviarCobranca === 'Sim').length,
            'Não': dados.filter(f => !f.enviarCobranca || f.enviarCobranca === false || f.enviarCobranca === 'Não').length
        };

        const labels = Object.keys(cobrancaCount);
        const values = Object.values(cobrancaCount);

        container.innerHTML = this.criarGraficoPizza(labels, values, 'Cobrança');
    }

    renderizarGraficoResponsavelPizza(dados) {
        const containerId = `grafico-responsavel-pizza-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Distribuição por Responsável (Pizza)</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const responsavelCount = {};
        dados.forEach(f => {
            const responsavel = f.responsavel || 'Não atribuído';
            responsavelCount[responsavel] = (responsavelCount[responsavel] || 0) + 1;
        });

        const labels = Object.keys(responsavelCount);
        const values = Object.values(responsavelCount);

        container.innerHTML = this.criarGraficoPizza(labels, values, 'Responsável');
    }

    renderizarGraficoCobranca(dados) {
        const container = document.getElementById(`grafico-cobranca-${this.tipoDemanda}`);
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Enviado para Cobrança</h3><div id="grafico-cobranca-${this.tipoDemanda}"></div>`;
                graficosContainer.appendChild(novoContainer);
            } else {
                return;
            }
        }

        const cobrancaCount = {
            'Sim': dados.filter(f => f.enviarCobranca === true || f.enviarCobranca === 'Sim').length,
            'Não': dados.filter(f => !f.enviarCobranca || f.enviarCobranca === false || f.enviarCobranca === 'Não').length
        };

        const labels = Object.keys(cobrancaCount);
        const values = Object.values(cobrancaCount);
        const cores = {
            'Sim': '#FF8400',
            'Não': '#1DFDB9'
        };

        container.innerHTML = this.criarGraficoBarras(labels, values, cores, 'Cobrança');
    }

    renderizarGraficoBlacklist(dados) {
        const container = document.getElementById(`grafico-blacklist-${this.tipoDemanda}`);
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Blacklist (Casos Críticos)</h3><div id="grafico-blacklist-${this.tipoDemanda}"></div>`;
                graficosContainer.appendChild(novoContainer);
            } else {
                return;
            }
        }

        const blacklistCount = {
            'Sim': dados.filter(f => f.casosCriticos === true || f.casosCriticos === 'Sim' || f.blacklist === true).length,
            'Não': dados.filter(f => !f.casosCriticos && !f.blacklist || f.casosCriticos === false).length
        };

        const labels = Object.keys(blacklistCount);
        const values = Object.values(blacklistCount);
        const cores = {
            'Sim': '#FF00D7',
            'Não': '#1634FF'
        };

        container.innerHTML = this.criarGraficoBarras(labels, values, cores, 'Blacklist');
    }

    renderizarGraficoOrigem(dados) {
        const containerId = `grafico-origem-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Por Origem</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const origemCount = {};
        dados.forEach(f => {
            let origem = (f.origem || 'Não informado').toString().trim();
            
            // Normalizar variações de origem
            if (origem.toLowerCase().includes('bacen') && origem.toLowerCase().includes('celcoin')) {
                origem = 'Bacen Celcoin';
            } else if (origem.toLowerCase().includes('bacen') && origem.toLowerCase().includes('via') && origem.toLowerCase().includes('capital')) {
                origem = 'Bacen Via Capital';
            } else if (origem.toLowerCase().includes('consumidor')) {
                origem = 'Consumidor.gov';
            } else if (origem.toLowerCase().includes('reclame')) {
                origem = 'Reclame Aqui';
            }
            
            origemCount[origem] = (origemCount[origem] || 0) + 1;
        });

        // Ordenar por quantidade (maior para menor)
        const sorted = Object.entries(origemCount)
            .sort((a, b) => b[1] - a[1]);

        const labels = sorted.map(([nome]) => nome);
        const values = sorted.map(([, count]) => count);

        container.innerHTML = this.criarGraficoBarras(labels, values, null, 'Origem');
    }

    criarGraficoBarras(labels, values, cores, titulo) {
        const maxValue = Math.max(...values, 1);
        const alturaMax = 250; // Altura fixa para todos os gráficos

        return `
            <div class="grafico-barras" style="min-height: 350px;">
                <div class="grafico-barras-container">
                    ${labels.map((label, i) => {
                        const altura = (values[i] / maxValue) * alturaMax;
                        const cor = cores && cores[label] ? cores[label] : '#1634FF';
                        return `
                            <div class="barra-item">
                                <div class="barra-valor">${values[i]}</div>
                                <div class="barra" style="height: ${altura}px; background: ${cor};" title="${label}: ${values[i]}"></div>
                                <div class="barra-label" style="transform: rotate(-45deg); transform-origin: top left; white-space: nowrap; margin-top: 5px; margin-left: 10px;">${this.formatarLabel(label)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    criarGraficoLinha(labels, values, titulo, cor) {
        const maxValue = Math.max(...values, 1);
        const alturaMax = 200;
        const largura = 500;
        const padding = 40;
        const larguraUtil = largura - (padding * 2);
        const pontos = values.map((v, i) => ({
            x: padding + (i / (values.length - 1 || 1)) * larguraUtil,
            y: alturaMax - (v / maxValue) * alturaMax
        }));

        return `
            <div class="grafico-linha">
                <svg width="${largura}" height="${alturaMax + 60}" viewBox="0 0 ${largura} ${alturaMax + 60}">
                    <polyline points="${pontos.map(p => `${p.x},${p.y}`).join(' ')}" 
                              fill="none" stroke="${cor}" stroke-width="3"/>
                    ${pontos.map((p, i) => `
                        <circle cx="${p.x}" cy="${p.y}" r="5" fill="${cor}"/>
                        <text x="${p.x}" y="${alturaMax + 25}" text-anchor="middle" font-size="10">${labels[i]}</text>
                    `).join('')}
                    ${values.map((v, i) => `
                        <text x="${pontos[i].x}" y="${pontos[i].y - 5}" text-anchor="middle" font-size="12" font-weight="bold">${v}</text>
                    `).join('')}
                </svg>
            </div>
        `;
    }

    criarGraficoPizza(labels, values, titulo) {
        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0) return '<p>Nenhum dado disponível</p>';

        let currentAngle = -90;
        const raio = 80;
        const cores = ['#1634FF', '#1DFDB9', '#FF8400', '#FF00D7', '#791DD0', '#000058'];

        const slices = values.map((value, i) => {
            const percentage = (value / total) * 100;
            const angle = (value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const x1 = 100 + raio * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 100 + raio * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 100 + raio * Math.cos((currentAngle * Math.PI) / 180);
            const y2 = 100 + raio * Math.sin((currentAngle * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;

            return {
                path: `M 100 100 L ${x1} ${y1} A ${raio} ${raio} 0 ${largeArc} 1 ${x2} ${y2} Z`,
                label: labels[i],
                value: value,
                percentage: percentage.toFixed(1),
                cor: cores[i % cores.length]
            };
        });

        return `
            <div class="grafico-pizza">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    ${slices.map(slice => `
                        <path d="${slice.path}" fill="${slice.cor}" stroke="#fff" stroke-width="2"/>
                    `).join('')}
                </svg>
                <div class="grafico-pizza-legend">
                    ${slices.map(slice => `
                        <div class="legend-item">
                            <span class="legend-color" style="background: ${slice.cor};"></span>
                            <span class="legend-label">${this.formatarLabel(slice.label)}</span>
                            <span class="legend-value">${slice.value} (${slice.percentage}%)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // === GRÁFICOS ESPECÍFICOS BACEN ===
    renderizarGraficoPrazoBacen(dados) {
        const containerId = `grafico-prazo-bacen-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Prazo Vencendo/Vencido</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const hoje = new Date();
        const prazoCount = {
            'Vencido': 0,
            'Vence em 7 dias': 0,
            'No prazo': 0
        };

        dados.forEach(f => {
            if (!f.prazoBacen) {
                prazoCount['No prazo']++;
                return;
            }
            const prazo = new Date(f.prazoBacen);
            const diff = (prazo - hoje) / (1000 * 60 * 60 * 24);
            if (diff < 0) {
                prazoCount['Vencido']++;
            } else if (diff <= 7) {
                prazoCount['Vence em 7 dias']++;
            } else {
                prazoCount['No prazo']++;
            }
        });

        const labels = Object.keys(prazoCount);
        const values = Object.values(prazoCount);
        const cores = {
            'Vencido': '#FF0000',
            'Vence em 7 dias': '#FF8400',
            'No prazo': '#1DFDB9'
        };

        container.innerHTML = this.criarGraficoBarras(labels, values, cores, 'Prazo');
    }

    renderizarGraficoCasosCriticos(dados) {
        const containerId = `grafico-casos-criticos-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Casos Críticos</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const criticosCount = {
            'Críticos': dados.filter(f => f.casosCriticos === true || f.casosCriticos === 'Sim').length,
            'Não Críticos': dados.filter(f => !f.casosCriticos || f.casosCriticos === false || f.casosCriticos === 'Não').length
        };

        const labels = Object.keys(criticosCount);
        const values = Object.values(criticosCount);
        const cores = {
            'Críticos': '#FF00D7',
            'Não Críticos': '#1634FF'
        };

        container.innerHTML = this.criarGraficoBarras(labels, values, cores, 'Casos Críticos');
    }

    renderizarGraficoResponsavel(dados) {
        const containerId = `grafico-responsavel-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Por Responsável</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const responsavelCount = {};
        dados.forEach(f => {
            let responsavel = (f.responsavel || 'Não atribuído').toString().trim();
            
            // Normalizar "Shirley" - agregar todas as variações
            if (responsavel.toLowerCase().includes('shirley')) {
                responsavel = 'Shirley';
            }
            
            responsavelCount[responsavel] = (responsavelCount[responsavel] || 0) + 1;
        });

        // Ordenar e pegar top 10
        const sorted = Object.entries(responsavelCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const labels = sorted.map(([nome]) => nome);
        const values = sorted.map(([, count]) => count);

        container.innerHTML = this.criarGraficoBarras(labels, values, null, 'Responsável');
    }

    // === GRÁFICOS ESPECÍFICOS N2 ===
    renderizarGraficoStatusPortabilidade(dados) {
        const containerId = `grafico-portabilidade-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Status de Portabilidade</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const portabilidadeCount = {};
        dados.forEach(f => {
            const status = f.statusPortabilidade || 'Não informado';
            portabilidadeCount[status] = (portabilidadeCount[status] || 0) + 1;
        });

        const labels = Object.keys(portabilidadeCount);
        const values = Object.values(portabilidadeCount);
        const cores = {
            'solicitada': '#1634FF',
            'em-andamento': '#FF8400',
            'concluida': '#1DFDB9',
            'concluída': '#1DFDB9',
            'cancelada': '#FF0000',
            'pendente': '#791DD0',
            'Não informado': '#666'
        };

        container.innerHTML = this.criarGraficoBarras(labels, values, cores, 'Portabilidade');
    }

    renderizarGraficoBancoDestino(dados) {
        const containerId = `grafico-banco-destino-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Top 10 Bancos Destino</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const bancoCount = {};
        dados.forEach(f => {
            const banco = f.bancoDestino || 'Não informado';
            bancoCount[banco] = (bancoCount[banco] || 0) + 1;
        });

        // Ordenar e pegar top 10
        const sorted = Object.entries(bancoCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const labels = sorted.map(([banco]) => banco);
        const values = sorted.map(([, count]) => count);

        container.innerHTML = this.criarGraficoBarras(labels, values, null, 'Banco Destino');
    }

    // === GRÁFICOS ESPECÍFICOS CHATBOT ===
    renderizarGraficoResolucaoAuto(dados) {
        const containerId = `grafico-resolucao-auto-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Resolução Automática vs Humana</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const resolucaoCount = {
            'Resolvido Automaticamente': dados.filter(f => f.resolvidoAutomaticamente === true || f.resolvidoAutomaticamente === 'Sim').length,
            'Encaminhado para Humano': dados.filter(f => f.encaminhadoHumano === true || f.encaminhadoHumano === 'Sim').length
        };

        const labels = Object.keys(resolucaoCount);
        const values = Object.values(resolucaoCount);

        container.innerHTML = this.criarGraficoPizza(labels, values, 'Resolução');
    }

    renderizarGraficoCanal(dados) {
        // Tentar primeiro o ID do HTML: grafico-canais-chatbot
        let container = document.getElementById(`grafico-canais-${this.tipoDemanda}`);
        const containerId = container ? `grafico-canais-${this.tipoDemanda}` : `grafico-canal-${this.tipoDemanda}`;
        
        if (!container) {
            container = document.getElementById(containerId);
        }
        
        if (!container) {
            // Tentar encontrar container de gráficos de várias formas
            let graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-chatbot`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-bacen`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-n2`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda}`);
            }
            
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Distribuição por Canal</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                console.error(`❌ Container de gráficos não encontrado para ${this.tipoDemanda}`);
                return;
            }
        }
        
        console.log(`✅ Renderizando gráfico Canal em: ${containerId}`);

        const canalCount = {};
        dados.forEach(f => {
            const canal = f.canalChatbot || 'Não informado';
            canalCount[canal] = (canalCount[canal] || 0) + 1;
        });

        const labels = Object.keys(canalCount);
        const values = Object.values(canalCount);

        container.innerHTML = this.criarGraficoBarras(labels, values, null, 'Canal');
    }

    renderizarGraficoSatisfacao(dados) {
        const containerId = `grafico-satisfacao-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Distribuição de Satisfação (Nota)</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const satisfacaoCount = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
        dados.forEach(f => {
            const nota = parseInt(f.notaAvaliacao || f.satisfacao || 0);
            if (nota >= 1 && nota <= 5) {
                satisfacaoCount[nota.toString()]++;
            }
        });

        const labels = ['5 ⭐', '4 ⭐', '3 ⭐', '2 ⭐', '1 ⭐'];
        const values = [satisfacaoCount['5'], satisfacaoCount['4'], satisfacaoCount['3'], satisfacaoCount['2'], satisfacaoCount['1']];
        const cores = {
            '5 ⭐': '#1DFDB9',
            '4 ⭐': '#1634FF',
            '3 ⭐': '#FF8400',
            '2 ⭐': '#FF00D7',
            '1 ⭐': '#FF0000'
        };

        container.innerHTML = this.criarGraficoBarras(labels, values, cores, 'Satisfação');
    }

    renderizarGraficoProduto(dados) {
        const containerId = `grafico-produto-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            // Tentar encontrar container de gráficos de várias formas
            let graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-chatbot`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-bacen`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-n2`);
            }
            if (!graficosContainer) {
                graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda}`);
            }
            
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = `<h3>Por Produto</h3><div id="${containerId}"></div>`;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                console.error(`❌ Container de gráficos não encontrado para ${this.tipoDemanda}`);
                return;
            }
        }

        const produtoCount = {};
        dados.forEach(f => {
            const produto = f.produto || 'Não informado';
            produtoCount[produto] = (produtoCount[produto] || 0) + 1;
        });

        // Ordenar e pegar top 10
        const sorted = Object.entries(produtoCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const labels = sorted.map(([produto]) => produto.length > 20 ? produto.substring(0, 20) + '...' : produto);
        const values = sorted.map(([, count]) => count);

        container.innerHTML = this.criarGraficoBarras(labels, values, null, 'Produto');
    }

    formatarLabel(label) {
        const labels = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'respondido': 'Respondido'
        };
        return labels[label] || label;
    }

    extrairMes(dataString) {
        if (!dataString) return null;
        const data = new Date(dataString);
        return `${data.getMonth() + 1}/${data.getFullYear()}`;
    }
}

// Inicializar gráficos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.location.pathname.includes('bacen.html') || window.location.href.includes('bacen.html')) {
            window.graficosDetalhadosBacen = new GraficosDetalhados('bacen');
        } else if (window.location.pathname.includes('n2.html') || window.location.href.includes('n2.html')) {
            window.graficosDetalhadosN2 = new GraficosDetalhados('n2');
        } else if (window.location.pathname.includes('chatbot.html') || window.location.href.includes('chatbot.html')) {
            window.graficosDetalhadosChatbot = new GraficosDetalhados('chatbot');
        }
    }, 500);
});

// Reinicializar quando mudar de seção
if (typeof mostrarSecao === 'function') {
    const mostrarSecaoOriginal = window.mostrarSecao;
    window.mostrarSecao = function(secaoId) {
        if (typeof mostrarSecaoOriginal === 'function') {
            mostrarSecaoOriginal(secaoId);
        }
        
        // Reinicializar gráficos se for dashboard
        if (secaoId.includes('dashboard')) {
            setTimeout(() => {
                const tipo = secaoId.replace('dashboard-', '');
                if (tipo === 'bacen' && !window.graficosDetalhadosBacen) {
                    window.graficosDetalhadosBacen = new GraficosDetalhados('bacen');
                } else if (tipo === 'n2' && !window.graficosDetalhadosN2) {
                    window.graficosDetalhadosN2 = new GraficosDetalhados('n2');
                } else if (tipo === 'chatbot' && !window.graficosDetalhadosChatbot) {
                    window.graficosDetalhadosChatbot = new GraficosDetalhados('chatbot');
                } else if (tipo === 'bacen' && window.graficosDetalhadosBacen) {
                    window.graficosDetalhadosBacen.renderizarGraficos();
                } else if (tipo === 'n2' && window.graficosDetalhadosN2) {
                    window.graficosDetalhadosN2.renderizarGraficos();
                } else if (tipo === 'chatbot' && window.graficosDetalhadosChatbot) {
                    window.graficosDetalhadosChatbot.renderizarGraficos();
                }
            }, 300);
        }
    };
}

