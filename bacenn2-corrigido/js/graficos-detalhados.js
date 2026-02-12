/* === SISTEMA DE GRÁFICOS DETALHADOS E FILTRÁVEIS === */
/* VERSÃO: v2.18.0 | DATA: 2025-02-01 | ALTERAÇÕES: Simplificar gráfico mensal N2 para usar diretamente dataEntrada da planilha (campo "Data de entrada"), remover filtros complexos, adicionar logs detalhados */

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
    
    // Função helper para criar HTML do card de gráfico com botão Expandir
    criarCardGraficoHTML(titulo, containerId) {
        return `
            <div class="grafico-card-header">
                <h3>${titulo}</h3>
                <button class="btn-expandir-grafico" onclick="abrirGraficoModal('${containerId}', '${titulo}', '${this.tipoDemanda}')" title="Expandir gráfico">
                    🔍 Expandir
                </button>
            </div>
            <div id="${containerId}"></div>
        `;
    }

    inicializar() {
        // Carregar dados de forma assíncrona
        this.carregarDados().then(() => {
            this.renderizarFiltros();
            this.renderizarGraficos();
        });
    }

    async carregarDados() {
        console.log(`📊 [GraficosDetalhados] carregarDados chamado para tipo: ${this.tipoDemanda}`);
        if (window.gerenciadorFichas) {
            this.dados = window.gerenciadorFichas.obterFichasPorTipo(this.tipoDemanda);
            console.log(`📊 [GraficosDetalhados] Dados carregados via gerenciadorFichas: ${this.dados.length}`);
        } else if (window.armazenamentoReclamacoes) {
            // Usar o novo sistema de armazenamento (AGUARDAR carregamento do Supabase)
            this.dados = await window.armazenamentoReclamacoes.carregarTodos(this.tipoDemanda);
            console.log(`📊 [GraficosDetalhados] Dados carregados via armazenamentoReclamacoes: ${this.dados.length}`);
            if (this.dados.length > 0) {
                console.log(`📊 [GraficosDetalhados] Primeiras 3 fichas:`, this.dados.slice(0, 3).map(f => ({
                    id: f.id,
                    nome: f.nomeCompleto || f.nomeCliente,
                    tipoDemanda: f.tipoDemanda
                })));
            }
        } else {
            // Fallback: tentar chave nova primeiro, depois antiga
            const keyNova = `velotax_reclamacoes_${this.tipoDemanda}`;
            const keyAntiga = `velotax_demandas_${this.tipoDemanda}`;
            this.dados = JSON.parse(localStorage.getItem(keyNova) || localStorage.getItem(keyAntiga) || '[]');
            console.log(`📊 [GraficosDetalhados] Dados carregados via localStorage: ${this.dados.length}`);
        }
        console.log(`✅ [GraficosDetalhados] Total de dados carregados: ${this.dados.length}`);
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
        console.log(`📊 [GraficosDetalhados] renderizarGraficos chamado para tipo: ${this.tipoDemanda}`);
        console.log(`📊 [GraficosDetalhados] Total de dados disponíveis: ${this.dados.length}`);
        
        const dadosFiltrados = this.obterDadosFiltrados();
        console.log(`📊 [GraficosDetalhados] Dados após filtros: ${dadosFiltrados.length}`);
        
        if (this.tipoDemanda === 'bacen') {
            // BACEN: status e responsável em barras para facilitar comparação
            this.renderizarGraficoStatus(dadosFiltrados);
            this.renderizarGraficoMensal(dadosFiltrados);
            // this.renderizarGraficoOrigem(dadosFiltrados); // REMOVIDO - gráfico não necessário
            this.renderizarGraficoPrazoBacen(dadosFiltrados);
            this.renderizarGraficoCobrancaPizza(dadosFiltrados);
            this.renderizarGraficoCasosCriticos(dadosFiltrados);
            this.renderizarGraficoResponsavel(dadosFiltrados);
        } else if (this.tipoDemanda === 'n2') {
            // N2: status e responsável em barras para facilitar comparação
            this.renderizarGraficoStatus(dadosFiltrados);
            this.renderizarGraficoMensal(dadosFiltrados);
            this.renderizarGraficoPixRetiradaN2(dadosFiltrados);
            // this.renderizarGraficoOrigem(dadosFiltrados); // REMOVIDO - gráfico não necessário
            // REMOVIDO: renderizarGraficoStatusPortabilidade - gráfico não necessário
            this.renderizarGraficoCobrancaPizza(dadosFiltrados);
            this.renderizarGraficoCasosCriticos(dadosFiltrados);
            this.renderizarGraficoResponsavel(dadosFiltrados);
        } else if (this.tipoDemanda === 'chatbot') {
            // Chatbot: status em barras, demais mantidos
            console.log(`📊 [GraficosDetalhados] Renderizando gráficos Chatbot com ${dadosFiltrados.length} fichas`);
            this.renderizarGraficoStatus(dadosFiltrados);
            // Renderizar gráfico de resolução automática vs humana (usando o container do HTML)
            this.renderizarGraficoResolucaoAuto(dadosFiltrados);
            this.renderizarGraficoResponsavel(dadosFiltrados); // Substituído: Canal por Agente
            this.renderizarGraficoSatisfacao(dadosFiltrados);
            this.renderizarGraficoMensal(dadosFiltrados);
            this.renderizarGraficoProduto(dadosFiltrados);
            this.renderizarGraficoCobrancaPizza(dadosFiltrados);
            this.renderizarGraficoCasosCriticos(dadosFiltrados);
            console.log(`✅ [GraficosDetalhados] Gráficos Chatbot renderizados`);
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
                novoContainer.innerHTML = `
                    <div class="grafico-card-header">
                        <h3>Status das Reclamações</h3>
                        <button class="btn-expandir-grafico" onclick="abrirGraficoModal('${containerId}', 'Status das Reclamações', '${this.tipoDemanda}')" title="Expandir gráfico">
                            🔍 Expandir
                        </button>
                    </div>
                    <div id="${containerId}"></div>
                `;
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
        const containerId = `grafico-status-${this.tipoDemanda}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        // Adicionar botão Expandir se não existir (antes de renderizar)
        this.adicionarBotaoExpandir(containerId, 'Status das Reclamações');

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
    
    // Função helper para adicionar botão Expandir a gráficos existentes no HTML
    adicionarBotaoExpandir(containerId, titulo) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const card = container.closest('.grafico-card');
        if (!card) return;
        
        // Verificar se já tem header com botão
        if (card.querySelector('.grafico-card-header')) return;
        
        // Adicionar header com botão
        const header = document.createElement('div');
        header.className = 'grafico-card-header';
        const h3 = card.querySelector('h3');
        const tituloTexto = h3 ? h3.textContent : titulo;
        header.innerHTML = `
            <h3>${tituloTexto}</h3>
            <button class="btn-expandir-grafico" onclick="abrirGraficoModal('${containerId}', '${tituloTexto}', '${this.tipoDemanda}')" title="Expandir gráfico">
                🔍 Expandir
            </button>
        `;
        
        // Inserir antes do container ou substituir h3
        if (h3) {
            card.insertBefore(header, h3);
            h3.remove();
        } else {
            card.insertBefore(header, container);
        }
    }

    renderizarGraficoMensal(dados) {
        const containerId = `grafico-mensal-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        // Se o container existe mas não tem o header com botão, adicionar
        if (container) {
            const card = container.closest('.grafico-card');
            if (card) {
                // Verificar se já tem header
                let header = card.querySelector('.grafico-card-header');
                if (!header) {
                    // Adicionar header com botão antes do container
                    header = document.createElement('div');
                    header.className = 'grafico-card-header';
                    header.innerHTML = `
                        <h3>Gráfico Mensal</h3>
                        <button class="btn-expandir-grafico" onclick="abrirGraficoModal('${containerId}', 'Gráfico Mensal', '${this.tipoDemanda}')" title="Expandir gráfico">
                            🔍 Expandir
                        </button>
                    `;
                    // Inserir antes do primeiro filho (ou antes do container se não houver h3)
                    const h3 = card.querySelector('h3');
                    if (h3) {
                        card.insertBefore(header, h3);
                        h3.remove(); // Remover h3 antigo, já está no header
                    } else {
                        card.insertBefore(header, container);
                    }
                }
            }
        } else {
            return;
        }

        // Agrupar estritamente por mês/ano com base na data, ignorando datas inválidas
        const mesesCount = {};
        let fichasSemData = 0;
        let fichasComData = 0;
        
        dados.forEach(f => {
            // Para cada tipo, usar o campo de data mais apropriado
            let dataParaMes = null;
            if (this.tipoDemanda === 'n2') {
                // N2: Usar data da planilha diretamente
                // A planilha tem o campo "Data de entrada" que é mapeado para dataEntrada
                const camposEspecificos = f.camposEspecificos || {};
                
                // Log detalhado para as primeiras 5 fichas para debug
                if (fichasComData + fichasSemData < 5) {
                    console.log('🔍 [N2] Analisando ficha', f.id, {
                        dataEntrada: f.dataEntrada,
                        dataEntradaN2: f.dataEntradaN2,
                        dataEntradaAtendimento: f.dataEntradaAtendimento,
                        dataCriacao: f.dataCriacao,
                        data: f.data,
                        dataReclamacao: f.dataReclamacao,
                        camposEspecificos: camposEspecificos,
                        temCamposEspecificos: !!f.camposEspecificos,
                        // Verificar TODOS os campos que podem conter data
                        todasChaves: Object.keys(f).filter(k => k.toLowerCase().includes('data'))
                    });
                }
                
                // PRIORIDADE 1: dataEntrada (mapeado de "Data de entrada" da planilha)
                // Este é o campo principal que vem da coluna "Data de entrada" da planilha
                if (f.dataEntrada && typeof f.dataEntrada === 'string' && f.dataEntrada.trim() !== '' && f.dataEntrada !== 'Invalid Date') {
                    const dataTeste = this.extrairMes(f.dataEntrada);
                    if (dataTeste) {
                        dataParaMes = f.dataEntrada;
                        if (fichasComData < 5) {
                            console.log('✅ [N2] Usando dataEntrada:', f.dataEntrada, 'Mês:', dataTeste);
                        }
                    }
                }
                
                // PRIORIDADE 2: dataEntradaN2 (se dataEntrada não funcionou)
                if (!dataParaMes) {
                    if (f.dataEntradaN2 && typeof f.dataEntradaN2 === 'string' && f.dataEntradaN2.trim() !== '' && f.dataEntradaN2 !== 'Invalid Date') {
                        const dataTeste = this.extrairMes(f.dataEntradaN2);
                        if (dataTeste) {
                            dataParaMes = f.dataEntradaN2;
                            if (fichasComData < 5) {
                                console.log('✅ [N2] Usando dataEntradaN2:', f.dataEntradaN2, 'Mês:', dataTeste);
                            }
                        }
                    } else if (camposEspecificos.dataEntradaN2 && typeof camposEspecificos.dataEntradaN2 === 'string' && camposEspecificos.dataEntradaN2.trim() !== '' && camposEspecificos.dataEntradaN2 !== 'Invalid Date') {
                        const dataTeste = this.extrairMes(camposEspecificos.dataEntradaN2);
                        if (dataTeste) {
                            dataParaMes = camposEspecificos.dataEntradaN2;
                            if (fichasComData < 5) {
                                console.log('✅ [N2] Usando camposEspecificos.dataEntradaN2:', camposEspecificos.dataEntradaN2, 'Mês:', dataTeste);
                            }
                        }
                    }
                }
                
                // PRIORIDADE 3: dataEntradaAtendimento (se ainda não encontrou)
                if (!dataParaMes) {
                    if (f.dataEntradaAtendimento && typeof f.dataEntradaAtendimento === 'string' && f.dataEntradaAtendimento.trim() !== '' && f.dataEntradaAtendimento !== 'Invalid Date') {
                        const dataTeste = this.extrairMes(f.dataEntradaAtendimento);
                        if (dataTeste) {
                            dataParaMes = f.dataEntradaAtendimento;
                            if (fichasComData < 5) {
                                console.log('✅ [N2] Usando dataEntradaAtendimento:', f.dataEntradaAtendimento, 'Mês:', dataTeste);
                            }
                        }
                    } else if (camposEspecificos.dataEntradaAtendimento && typeof camposEspecificos.dataEntradaAtendimento === 'string' && camposEspecificos.dataEntradaAtendimento.trim() !== '' && camposEspecificos.dataEntradaAtendimento !== 'Invalid Date') {
                        const dataTeste = this.extrairMes(camposEspecificos.dataEntradaAtendimento);
                        if (dataTeste) {
                            dataParaMes = camposEspecificos.dataEntradaAtendimento;
                            if (fichasComData < 5) {
                                console.log('✅ [N2] Usando camposEspecificos.dataEntradaAtendimento:', camposEspecificos.dataEntradaAtendimento, 'Mês:', dataTeste);
                            }
                        }
                    }
                }
                
                // Se não encontrou nenhuma data válida, logar para debug com TODOS os campos
                if (!dataParaMes && fichasSemData < 10) {
                    // Buscar TODOS os campos que podem conter data
                    const todosCamposData = {};
                    Object.keys(f).forEach(k => {
                        if (k.toLowerCase().includes('data') || k.toLowerCase().includes('entrada')) {
                            todosCamposData[k] = f[k];
                        }
                    });
                    if (f.camposEspecificos) {
                        Object.keys(f.camposEspecificos).forEach(k => {
                            if (k.toLowerCase().includes('data') || k.toLowerCase().includes('entrada')) {
                                todosCamposData[`camposEspecificos.${k}`] = f.camposEspecificos[k];
                            }
                        });
                    }
                    console.warn('⚠️ [N2] Ficha', f.id, 'SEM DATA VÁLIDA DA PLANILHA. Todos os campos de data encontrados:', todosCamposData);
                    console.warn('   📋 Estrutura completa da ficha (primeiros 20 campos):', Object.keys(f).slice(0, 20));
                }
            } else if (this.tipoDemanda === 'chatbot') {
                // Chatbot: Priorizar campo "Data" da planilha (dataClienteChatbot ou data)
                // IMPORTANTE: Validar se a data é válida antes de usar
                if (f.dataClienteChatbot && typeof f.dataClienteChatbot === 'string' && f.dataClienteChatbot.trim() !== '' && f.dataClienteChatbot !== 'Invalid Date') {
                    const dataTeste = this.extrairMes(f.dataClienteChatbot);
                    if (dataTeste) {
                        dataParaMes = f.dataClienteChatbot;
                    }
                }
                
                // Se dataClienteChatbot não funcionou, tentar campo "Data" direto
                if (!dataParaMes && f.data && typeof f.data === 'string' && f.data.trim() !== '' && f.data !== 'Invalid Date') {
                    const dataTeste = this.extrairMes(f.data);
                    if (dataTeste) {
                        dataParaMes = f.data;
                    }
                }
                
                // Outros campos como fallback
                if (!dataParaMes) {
                    if (f.dataEntrada && typeof f.dataEntrada === 'string' && f.dataEntrada.trim() !== '' && f.dataEntrada !== 'Invalid Date') {
                        const dataTeste = this.extrairMes(f.dataEntrada);
                        if (dataTeste) {
                            dataParaMes = f.dataEntrada;
                        }
                    } else if (f.dataReclamacao && typeof f.dataReclamacao === 'string' && f.dataReclamacao.trim() !== '' && f.dataReclamacao !== 'Invalid Date') {
                        const dataTeste = this.extrairMes(f.dataReclamacao);
                        if (dataTeste) {
                            dataParaMes = f.dataReclamacao;
                        }
                    }
                }
                
                // Log para debug (apenas primeiras 10 fichas)
                if (fichasComData < 10 && dataParaMes) {
                    console.log('✅ [Chatbot] Ficha', f.id, 'Data usada:', dataParaMes, 'Mês extraído:', this.extrairMes(dataParaMes), 'Fonte:', 
                        f.dataClienteChatbot && this.extrairMes(f.dataClienteChatbot) ? 'dataClienteChatbot' : 
                        f.data && this.extrairMes(f.data) ? 'data' :
                        f.dataEntrada && this.extrairMes(f.dataEntrada) ? 'dataEntrada' : 'dataReclamacao');
                } else if (!dataParaMes && fichasSemData < 10) {
                    console.warn('⚠️ [Chatbot] Ficha', f.id, 'SEM DATA VÁLIDA - será ignorada no gráfico. Campos disponíveis:', {
                        dataClienteChatbot: f.dataClienteChatbot,
                        data: f.data,
                        dataEntrada: f.dataEntrada,
                        dataReclamacao: f.dataReclamacao,
                        dataCriacao: f.dataCriacao
                    });
                }
            } else {
                // BACEN: dataEntrada é da planilha (mapeado separadamente de dataCriacao)
                if (f.dataEntrada && f.dataEntrada.trim && f.dataEntrada.trim() !== '') {
                    dataParaMes = f.dataEntrada;
                } else if (f.dataReclamacao && f.dataReclamacao.trim && f.dataReclamacao.trim() !== '') {
                    dataParaMes = f.dataReclamacao;
                } else if (f.dataRecebimento && f.dataRecebimento.trim && f.dataRecebimento.trim() !== '') {
                    dataParaMes = f.dataRecebimento;
                } else if (f.dataCriacao && f.dataCriacao.trim && f.dataCriacao.trim() !== '') {
                    // Só usar dataCriacao como último recurso
                    dataParaMes = f.dataCriacao;
                }
            }
            
            const mes = this.extrairMes(dataParaMes);
            if (mes) {
                mesesCount[mes] = (mesesCount[mes] || 0) + 1;
                fichasComData++;
            } else {
                fichasSemData++;
                // Log apenas para primeiras 3 fichas sem data
                if (fichasSemData <= 3) {
                    console.warn('⚠️ [graficos-detalhados] Data inválida para ficha:', f.id, 'Data:', dataParaMes, 'Tipo:', this.tipoDemanda, 'Campos:', {
                        dataEntradaN2: f.dataEntradaN2,
                        dataEntradaAtendimento: f.dataEntradaAtendimento,
                        dataEntrada: f.dataEntrada,
                        dataCriacao: f.dataCriacao
                    });
                }
            }
        });
        
        console.log(`📊 [graficos-detalhados] Gráfico mensal ${this.tipoDemanda}: ${fichasComData} fichas com data válida, ${fichasSemData} sem data`);
        if (this.tipoDemanda === 'n2' && fichasSemData > 0) {
            console.warn(`⚠️ [N2] ${fichasSemData} fichas N2 sem data válida serão ignoradas. Verifique se o campo "Data de entrada" está sendo mapeado corretamente na importação.`);
        }

        // Se não há dados, mostrar mensagem
        if (Object.keys(mesesCount).length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--texto-secundario);">Nenhum dado disponível</p>';
            return;
        }

        // Encontrar primeiro e último mês
        const mesesComDados = Object.keys(mesesCount).sort((a, b) => {
            const [maRaw, yaRaw] = a.split('/');
            const [mbRaw, ybRaw] = b.split('/');
            const ma = parseInt(maRaw, 10) || 0;
            const mb = parseInt(mbRaw, 10) || 0;
            const ya = parseInt(yaRaw, 10) || 0;
            const yb = parseInt(ybRaw, 10) || 0;
            if (ya !== yb) return ya - yb;
            return ma - mb;
        });

        if (mesesComDados.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--texto-secundario);">Nenhum dado disponível</p>';
            return;
        }

        // Extrair primeiro e último mês/ano
        const [primeiroMesRaw, primeiroAnoRaw] = mesesComDados[0].split('/');
        const [ultimoMesRaw, ultimoAnoRaw] = mesesComDados[mesesComDados.length - 1].split('/');
        const primeiroMes = parseInt(primeiroMesRaw, 10);
        const primeiroAno = parseInt(primeiroAnoRaw, 10);
        const ultimoMes = parseInt(ultimoMesRaw, 10);
        const ultimoAno = parseInt(ultimoAnoRaw, 10);

        // Preencher todos os meses entre o primeiro e último
        const meses = [];
        const valores = [];
        
        let mesAtual = primeiroMes;
        let anoAtual = primeiroAno;
        
        while (anoAtual < ultimoAno || (anoAtual === ultimoAno && mesAtual <= ultimoMes)) {
            const chaveMes = `${mesAtual}/${anoAtual}`;
            meses.push(chaveMes);
            valores.push(mesesCount[chaveMes] || 0);
            
            mesAtual++;
            if (mesAtual > 12) {
                mesAtual = 1;
                anoAtual++;
            }
        }

        // Gráfico de linha com meses legíveis no eixo X
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Reclamações por Dia (Últimos 30 dias)', containerId);
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
        
        // Adicionar botão Expandir se o container já existe no HTML
        if (container) {
            this.adicionarBotaoExpandir(containerId, 'Enviado para Cobrança');
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
                novoContainer.innerHTML = `
                    <div class="grafico-card-header">
                        <h3>Enviado para Cobrança</h3>
                        <button class="btn-expandir-grafico" onclick="abrirGraficoModal('${containerId}', 'Enviado para Cobrança', '${this.tipoDemanda}')" title="Expandir gráfico">
                            🔍 Expandir
                        </button>
                    </div>
                    <div id="${containerId}"></div>
                `;
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Distribuição por Responsável (Pizza)', containerId);
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
                const containerId = `grafico-cobranca-${this.tipoDemanda}`;
                novoContainer.innerHTML = this.criarCardGraficoHTML('Enviado para Cobrança', containerId);
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
                const containerId = `grafico-blacklist-${this.tipoDemanda}`;
                novoContainer.innerHTML = this.criarCardGraficoHTML('Blacklist (Casos Críticos)', containerId);
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Por Origem', containerId);
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
        // Um pouco menor para sobrar espaço entre o topo da barra e o número
        const alturaMax = 200; // Altura fixa para todos os gráficos

        // Layout genérico: valor em cima, barra no meio, label HORIZONTAL abaixo.
        // Cada barra terá largura fixa e o container poderá rolar horizontalmente.
        return `
            <div class="grafico-barras" style="min-height: 420px; padding: 40px 16px 100px 16px; position: relative; overflow-x: auto; overflow-y: visible;">
                <div class="grafico-barras-container" style="display: inline-flex; align-items: flex-end; gap: 20px; min-height: 260px; padding-bottom: 32px;">
                    ${labels.map((label, i) => {
                        const altura = (values[i] / maxValue) * alturaMax;
                        const cor = cores && cores[label] ? cores[label] : '#1634FF';
                        return `
                            <div class="barra-item" style="display: flex; flex-direction: column; align-items: flex-start; width: 90px;">
                                <div style="height: 240px; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
                                    <div class="barra-valor" style="font-weight: bold; font-size: 12px; margin-bottom: 12px; white-space: nowrap;">${values[i]}</div>
                                    <div class="barra" style="height: ${altura}px; background: ${cor}; width: 100%; border-radius: 4px 4px 0 0; transition: all 0.3s;" title="${label}: ${values[i]}"></div>
                                </div>
                                <div class="barra-label" style="margin-top: 36px; font-size: 11px; text-align: left; padding-left: 8px; width: 120px; white-space: normal; word-break: break-word; max-height: 90px; overflow: hidden;">
                                    ${this.formatarLabel(label)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    criarGraficoLinha(labels, values, titulo, cor) {
        const maxValue = Math.max(...values, 1);
        const alturaMax = 220;
        const largura = Math.max(700, labels.length * 80); // mais espaço horizontal por mês
        const paddingEsq = 60;
        const paddingDir = 40;
        const paddingTopo = 20;
        const paddingBase = 80; // espaço para meses
        const larguraUtil = largura - (paddingEsq + paddingDir);

        const pontos = values.map((v, i) => ({
            x: paddingEsq + (labels.length <= 1 ? 0 : (i / (labels.length - 1)) * larguraUtil),
            y: paddingTopo + (alturaMax - (v / maxValue) * alturaMax)
        }));

        const alturaTotal = paddingTopo + alturaMax + paddingBase;

        return `
            <div class="grafico-linha" style="padding: 24px 16px 24px 16px; min-height: 340px; overflow-x: auto; overflow-y: visible;">
                <svg width="${largura}" height="${alturaTotal}" viewBox="0 0 ${largura} ${alturaTotal}" style="overflow: visible;">
                    <!-- Linha de base do eixo X -->
                    <line x1="${paddingEsq}" y1="${paddingTopo + alturaMax}" x2="${paddingEsq + larguraUtil}" y2="${paddingTopo + alturaMax}" stroke="#444" stroke-width="1" />

                    <!-- Linha -->
                    <polyline points="${pontos.map(p => `${p.x},${p.y}`).join(' ')}" 
                              fill="none" stroke="${cor}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>

                    <!-- Pontos e valores -->
                    ${pontos.map((p, i) => `
                        <circle cx="${p.x}" cy="${p.y}" r="4" fill="${cor}"/>
                        <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">${values[i]}</text>
                    `).join('')}

                    <!-- Meses no eixo X -->
                    ${pontos.map((p, i) => `
                        <text x="${p.x}" y="${paddingTopo + alturaMax + 32}" text-anchor="middle" font-size="11" fill="#ffffff">
                            ${titulo === 'Mês' ? this.formatarMesLinha(labels[i]) : labels[i]}
                        </text>
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Prazo Vencendo/Vencido', containerId);
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Casos Críticos', containerId);
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
        // Para Chatbot, usar o ID do container de canal se existir (para substituir o gráfico de canal)
        let container = document.getElementById(containerId);
        
        // Se não encontrar e for Chatbot, tentar usar o container do gráfico de canal
        if (!container && this.tipoDemanda === 'chatbot') {
            container = document.getElementById(`grafico-canais-${this.tipoDemanda}`) || 
                       document.getElementById(`grafico-canal-${this.tipoDemanda}`);
            if (container) {
                // Atualizar o ID do container para manter consistência
                container.id = containerId;
            }
        }
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                const titulo = this.tipoDemanda === 'chatbot' ? 'Por Agente' : 'Por Responsável';
                novoContainer.innerHTML = this.criarCardGraficoHTML(titulo, containerId);
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        const responsavelCount = {};
        dados.forEach(f => {
            // Para Chatbot, usar responsavel ou responsavelChatbot
            let responsavel = (this.tipoDemanda === 'chatbot' 
                ? (f.responsavel || f.responsavelChatbot || 'Não atribuído')
                : (f.responsavel || 'Não atribuído')).toString().trim();
            
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

        // Usa o layout genérico de barras (valor em cima, barra, label horizontal abaixo)
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Status de Portabilidade', containerId);
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
        // Para N2, esse gráfico foi desativado (não faz mais sentido no dashboard)
        if (this.tipoDemanda === 'n2') {
            return;
        }
        const containerId = `grafico-banco-destino-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = this.criarCardGraficoHTML('Top 10 Bancos Destino', containerId);
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
        // Tentar primeiro o ID do HTML: grafico-resolucao-chatbot
        let container = document.getElementById(`grafico-resolucao-${this.tipoDemanda}`);
        const containerId = container ? `grafico-resolucao-${this.tipoDemanda}` : `grafico-resolucao-auto-${this.tipoDemanda}`;
        
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Resolução Automática vs Humana', containerId);
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                console.error(`❌ Container de gráficos não encontrado para ${this.tipoDemanda}`);
                return;
            }
        }
        
        console.log(`✅ Renderizando gráfico Resolução em: ${containerId} com ${dados.length} fichas`);

        // Contar resoluções automáticas e encaminhadas (incluindo inferência de respostaBot)
        const resolvidasAuto = dados.filter(f => {
            if (f.resolvidoAutomaticamente === true || f.resolvidoAutomaticamente === 'Sim') return true;
            if (f.respostaBot === 'Sim' || f.respostaBot === 'sim') return true;
            return false;
        }).length;
        
        const encaminhadas = dados.filter(f => {
            if (f.encaminhadoHumano === true || f.encaminhadoHumano === 'Sim') return true;
            if (f.respostaBot === 'Não' || f.respostaBot === 'não' || f.respostaBot === 'Nao') return true;
            return false;
        }).length;

        const resolucaoCount = {
            'Resolvido Automaticamente': resolvidasAuto,
            'Encaminhado para Humano': encaminhadas
        };

        const labels = Object.keys(resolucaoCount);
        const values = Object.values(resolucaoCount);

        console.log(`📊 [renderizarGraficoResolucaoAuto] Resolvidas Auto: ${resolvidasAuto}, Encaminhadas: ${encaminhadas}`);

        if (values.every(v => v === 0)) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--texto-secundario);">Nenhum dado disponível</p>';
        } else {
        container.innerHTML = this.criarGraficoPizza(labels, values, 'Resolução');
        }
    }

    renderizarGraficoPixRetiradaN2(dados) {
        const containerId = 'grafico-pix-retirada-n2';
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = this.criarCardGraficoHTML('Chave PIX Retirada', containerId);
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                return;
            }
        }

        // Contar casos com PIX retirado/excluído
        const totalCasos = dados.length;
        const pixRetirado = dados.filter(f => {
            // Verificar pixStatus
            if (f.pixStatus === 'Excluído' || f.pixStatus === 'excluido' || f.pixStatus === 'Excluido') {
                return true;
            }
            // Verificar pixLiberado (false ou 'Não' significa excluído)
            if (f.pixLiberado === false || f.pixLiberado === 'Não' || f.pixLiberado === 'não') {
                return true;
            }
            return false;
        }).length;

        const pixNaoRetirado = totalCasos - pixRetirado;
        const porcentagemRetirado = totalCasos > 0 ? ((pixRetirado / totalCasos) * 100).toFixed(1) : 0;
        const porcentagemNaoRetirado = totalCasos > 0 ? ((pixNaoRetirado / totalCasos) * 100).toFixed(1) : 0;

        if (totalCasos === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--texto-secundario);">Nenhum dado disponível</p>';
            return;
        }

        // Criar gráfico de pizza usando Chart.js
        const canvasId = `canvas-pix-retirada-${Date.now()}`;
        container.innerHTML = `
            <div style="position: relative; height: 300px; margin: 20px 0;">
                <canvas id="${canvasId}"></canvas>
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: var(--cor-card, #f5f5f5); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: var(--azul-royal, #1634FF); margin-bottom: 10px;">
                    ${porcentagemRetirado}%
                </div>
                <div style="font-size: 14px; color: var(--texto-secundario, #666);">
                    dos casos tiveram a chave PIX retirada<br>
                    (${pixRetirado} de ${totalCasos} casos)
                </div>
            </div>
        `;

        // Aguardar um pouco para garantir que o canvas foi criado
        setTimeout(() => {
            const canvas = document.getElementById(canvasId);
            if (!canvas || typeof Chart === 'undefined') {
                console.error('Chart.js não está disponível ou canvas não foi criado');
                return;
            }

            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['PIX Retirado', 'PIX Não Retirado'],
                    datasets: [{
                        data: [pixRetirado, pixNaoRetirado],
                        backgroundColor: [
                            '#FF0000', // Vermelho para retirado
                            '#1DFDB9'  // Verde para não retirado
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12,
                                    family: 'Poppins, sans-serif'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }, 100);
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
                novoContainer.innerHTML = `
                    <div class="grafico-card-header">
                        <h3>Distribuição por Canal</h3>
                        <button class="btn-expandir-grafico" onclick="abrirGraficoModal('${containerId}', 'Distribuição por Canal', '${this.tipoDemanda}')" title="Expandir gráfico">
                            🔍 Expandir
                        </button>
                    </div>
                    <div id="${containerId}"></div>
                `;
                graficosContainer.appendChild(novoContainer);
                container = document.getElementById(containerId);
            } else {
                console.error(`❌ Container de gráficos não encontrado para ${this.tipoDemanda}`);
                return;
            }
        }
        
        console.log(`✅ Renderizando gráfico Canal em: ${containerId} com ${dados.length} fichas`);

        const canalCount = {};
        dados.forEach(f => {
            const canal = f.canalChatbot || 'Não informado';
            canalCount[canal] = (canalCount[canal] || 0) + 1;
        });

        const labels = Object.keys(canalCount);
        const values = Object.values(canalCount);

        console.log(`📊 [renderizarGraficoCanal] Canais encontrados:`, canalCount);

        if (labels.length === 0 || values.every(v => v === 0)) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--texto-secundario);">Nenhum dado disponível</p>';
        } else {
        container.innerHTML = this.criarGraficoBarras(labels, values, null, 'Canal');
        }
    }

    renderizarGraficoSatisfacao(dados) {
        const containerId = `grafico-satisfacao-${this.tipoDemanda}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            const graficosContainer = document.querySelector(`#dashboard-${this.tipoDemanda} .graficos-${this.tipoDemanda}`);
            if (graficosContainer) {
                const novoContainer = document.createElement('div');
                novoContainer.className = 'grafico-card';
                novoContainer.innerHTML = this.criarCardGraficoHTML('Distribuição de Satisfação (Nota)', containerId);
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
                novoContainer.innerHTML = this.criarCardGraficoHTML('Por Produto', containerId);
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

    // Formatação específica para labels do gráfico de linha mensal
    formatarMesLinha(valor) {
        // Esperado algo como "1/2025" ou "01/2025"
        if (!valor) return '';
        const [mesRaw, anoRaw] = valor.split('/');
        const mes = parseInt(mesRaw, 10);
        const ano = anoRaw ? anoRaw.toString().slice(-2) : '';
        const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        if (!isNaN(mes) && mes >= 1 && mes <= 12) {
            return `${nomes[mes - 1]}/${ano}`;
        }
        return valor;
    }

    extrairMes(dataString) {
        if (!dataString) return null;
        
        let data = null;
        
        // Tentar parsear como Date primeiro
        if (dataString instanceof Date) {
            data = dataString;
        } else if (typeof dataString === 'string') {
            // Tentar formato ISO primeiro
            data = new Date(dataString);
            
            // Se falhar, tentar formato DD/MM/YYYY (comum em planilhas)
            if (isNaN(data.getTime()) && dataString.includes('/')) {
                const partes = dataString.split('/');
                if (partes.length === 3) {
                    const dia = parseInt(partes[0], 10);
                    const mes = parseInt(partes[1], 10);
                    const ano = parseInt(partes[2], 10);
                    if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
                        // Se ano tem 2 dígitos, assumir 2000+
                        const anoCompleto = ano < 100 ? 2000 + ano : ano;
                        data = new Date(anoCompleto, mes - 1, dia);
                    }
                }
            }
        }
        
        if (!data || isNaN(data.getTime())) return null;

        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        if (!mes || !ano) return null;

        // Não precisa zero à esquerda aqui; a formatarMesLinha trata 1/2025 e 01/2025 igual.
        return `${mes}/${ano}`;
    }
}

// Inicializar gráficos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.location.pathname.includes('bacen.html') || window.location.href.includes('bacen.html')) {
            window.graficosDetalhadosBacen = new GraficosDetalhados('bacen');
            // Inicializar controle de gráficos após renderização
            setTimeout(() => {
                if (typeof ControleGraficosDashboard !== 'undefined') {
                    window.controleGraficosBacen = new ControleGraficosDashboard('bacen');
                }
            }, 2000);
        } else if (window.location.pathname.includes('n2.html') || window.location.href.includes('n2.html')) {
            window.graficosDetalhadosN2 = new GraficosDetalhados('n2');
            // Inicializar controle de gráficos após renderização
            setTimeout(() => {
                if (typeof ControleGraficosDashboard !== 'undefined') {
                    window.controleGraficosN2 = new ControleGraficosDashboard('n2');
                }
            }, 2000);
        } else if (window.location.pathname.includes('chatbot.html') || window.location.href.includes('chatbot.html')) {
            window.graficosDetalhadosChatbot = new GraficosDetalhados('chatbot');
            // Inicializar controle de gráficos após renderização
            setTimeout(() => {
                if (typeof ControleGraficosDashboard !== 'undefined') {
                    window.controleGraficosChatbot = new ControleGraficosDashboard('chatbot');
                }
            }, 2000);
        }
    }, 500);
});

// Reinicializar gráficos quando mudar de seção (sem sobrescrever mostrarSecao)
// Usar uma abordagem que não interfere com a função original
(function() {
    let wrapperCriado = false;
    
    function criarWrapper() {
        // Só criar wrapper uma vez e se a função mostrarSecao existir
        if (wrapperCriado || !window.mostrarSecao || typeof window.mostrarSecao !== 'function') {
            return;
        }
        
        // Verificar se a função já tem a lógica de dashboard (é a função específica da página)
        const funcaoStr = window.mostrarSecao.toString();
        if (funcaoStr.includes('dashboard-chatbot') || 
            funcaoStr.includes('dashboard-bacen') || 
            funcaoStr.includes('dashboard-n2')) {
            // É a função específica da página, criar wrapper que preserva a lógica
            const mostrarSecaoOriginal = window.mostrarSecao;
            
            window.mostrarSecao = function(secaoId) {
                // Chamar função original primeiro
                mostrarSecaoOriginal(secaoId);
                
                // Reinicializar gráficos se for dashboard (após um pequeno delay)
                if (secaoId && secaoId.includes('dashboard')) {
                    setTimeout(() => {
                        const tipo = secaoId.replace('dashboard-', '');
                        if (tipo === 'bacen' && window.graficosDetalhadosBacen) {
                            window.graficosDetalhadosBacen.carregarDados().then(() => {
                                window.graficosDetalhadosBacen.renderizarGraficos();
                            });
                        } else if (tipo === 'n2' && window.graficosDetalhadosN2) {
                            window.graficosDetalhadosN2.carregarDados().then(() => {
                                window.graficosDetalhadosN2.renderizarGraficos();
                            });
                        } else if (tipo === 'chatbot' && window.graficosDetalhadosChatbot) {
                            window.graficosDetalhadosChatbot.carregarDados().then(() => {
                                window.graficosDetalhadosChatbot.renderizarGraficos();
                            });
                        }
                    }, 300);
                }
            };
            
            wrapperCriado = true;
        }
    }
    
    // Tentar criar wrapper quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Aguardar um pouco mais para garantir que todos os scripts carregaram
            setTimeout(criarWrapper, 500);
        });
    } else {
        // DOM já está pronto, aguardar um pouco mais
        setTimeout(criarWrapper, 500);
    }
    
    // Também tentar criar quando window.mostrarSecao for definido (MutationObserver ou polling)
    let tentativas = 0;
    const intervalo = setInterval(() => {
        tentativas++;
        if (window.mostrarSecao && typeof window.mostrarSecao === 'function') {
            criarWrapper();
            clearInterval(intervalo);
        } else if (tentativas > 20) {
            // Parar após 2 segundos (20 * 100ms)
            clearInterval(intervalo);
        }
    }, 100);
})();

// === FUNÇÃO GLOBAL PARA ABRIR GRÁFICO EM MODAL ===
window.abrirGraficoModal = function(containerId, titulo, tipoDemanda) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ Container não encontrado:', containerId);
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay modal-grafico';
    modal.id = 'modal-grafico-expandido';
    modal.innerHTML = `
        <div class="modal-content modal-grafico-content">
            <div class="modal-header">
                <h2>${titulo}</h2>
                <button class="modal-close" onclick="fecharGraficoModal()">&times;</button>
            </div>
            <div class="modal-body modal-grafico-body">
                ${container.innerHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            fecharGraficoModal();
        }
    });
    
    // Fechar com ESC
    const fecharComEsc = function(e) {
        if (e.key === 'Escape') {
            fecharGraficoModal();
            document.removeEventListener('keydown', fecharComEsc);
        }
    };
    document.addEventListener('keydown', fecharComEsc);
};

window.fecharGraficoModal = function() {
    const modal = document.getElementById('modal-grafico-expandido');
    if (modal) {
        modal.remove();
    }
};

// Adicionar estilos CSS para o modal de gráfico
if (!document.getElementById('estilos-modal-grafico')) {
    const style = document.createElement('style');
    style.id = 'estilos-modal-grafico';
    style.textContent = `
        .modal-grafico {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .modal-grafico-content {
            background: white;
            border-radius: 8px;
            width: 95vw;
            height: 95vh;
            max-width: 95vw;
            max-height: 95vh;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        }
        .modal-grafico-body {
            padding: 30px;
            width: 100%;
            height: 100%;
            overflow: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .modal-grafico-body .grafico-barras,
        .modal-grafico-body .grafico-pizza,
        .modal-grafico-body .grafico-linha {
            width: 100%;
            max-width: 100%;
            transform: none;
            margin: 0;
        }
        .dark .modal-grafico-content {
            background: var(--cor-card-escuro);
            color: var(--texto-claro);
        }
        .grafico-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 10;
        }
        .grafico-card-header h3 {
            margin: 0;
            flex: 1;
        }
        .btn-expandir-grafico {
            background: var(--cor-primaria, #1634FF);
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 20;
            flex-shrink: 0;
            margin-left: 15px;
            white-space: nowrap;
        }
        .btn-expandir-grafico:hover {
            background: var(--cor-primaria-hover, #0d2bb3);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
}

