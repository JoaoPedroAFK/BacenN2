/* === SISTEMA DE CLASSIFICAÇÃO DE DEMANDAS VELOTAX === */

class SistemaClassificacaoDemandas {
    constructor() {
        this.tiposDemanda = {
            bacen: {
                nome: 'BACEN',
                descricao: 'Reclamações registradas no Banco Central',
                cor: '#1634FF',
                campos: ['Data entrada', 'Finalizado em', 'Responsável', 'Nome completo', 'CPF', 'Origem', 'Motivo reduzido', 'Motivo Reclamação', 'Prazo Bacen', 'Telefone', 'Acionou a central?', 'Bacen?', 'Procon?', 'PIX liberado ou excluído?', 'Aceitou liquidação Antecipada?', 'Enviar para cobrança?', 'Observações']
            },
            n2: {
                nome: 'N2',
                descricao: 'Demandas de portabilidade e transferência',
                cor: '#1DFDB9',
                campos: ['Data entrada', 'Finalizado em', 'Responsável', 'Nome completo', 'CPF', 'Origem', 'Motivo reduzido', 'Motivo Reclamação', 'Prazo N2', 'Telefone', 'N2 Portabilidade?', 'Acionou a central?', 'Status Portabilidade', 'PIX liberado ou excluído?', 'Enviar para cobrança?', 'Observações']
            },
            chatbot: {
                nome: 'Chatbot',
                descricao: 'Demandas originadas no chatbot',
                cor: '#FF8400',
                campos: ['Data entrada', 'Finalizado em', 'Responsável', 'Nome completo', 'CPF', 'Origem', 'Motivo reduzido', 'Motivo Reclamação', 'Prazo Resposta', 'Telefone', 'Canal Chatbot', 'Satisfação', 'Resolvido Automaticamente?', 'Encaminhado para Humano?', 'PIX liberado ou excluído?', 'Enviar para cobrança?', 'Observações']
            }
        };
        
        this.inicializar();
    }

    inicializar() {
        this.adicionarEstilos();
        this.configurarEventos();
    }

    // === IDENTIFICAÇÃO AUTOMÁTICA ===
    identificarTipoDemanda(dados) {
        // Verifica campos específicos de cada tipo
        if (dados['N2 Portabilidade?'] === 'TRUE' || dados['Motivo reduzido']?.toLowerCase().includes('portabilidade')) {
            return 'n2';
        }
        
        if (dados['Canal Chatbot'] || dados['Resolvido Automaticamente?'] || dados['Encaminhado para Humano?']) {
            return 'chatbot';
        }
        
        // Padrão: BACEN
        return 'bacen';
    }

    // === INTERFACE DE CLASSIFICAÇÃO ===
    criarInterfaceClassificacao() {
        return `
            <div class="classificacao-container">
                <div class="classificacao-header">
                    <h2>🏷️ Classificação de Demandas</h2>
                    <p>Separar e gerenciar demandas de BACEN, N2 e Chatbot</p>
                </div>

                <!-- Filtros por Tipo -->
                <div class="filtro-tipos">
                    <h3>📊 Filtrar por Tipo de Demanda</h3>
                    <div class="tipos-botoes">
                        <button class="tipo-btn active" data-tipo="todos" onclick="sistemaClassificacao.filtrarPorTipo('todos')">
                            📋 Todas (${this.contarTotal()})
                        </button>
                        <button class="tipo-btn" data-tipo="bacen" onclick="sistemaClassificacao.filtrarPorTipo('bacen')">
                            🏦 BACEN (${this.contarPorTipo('bacen')})
                        </button>
                        <button class="tipo-btn" data-tipo="n2" onclick="sistemaClassificacao.filtrarPorTipo('n2')">
                            🔄 N2 (${this.contarPorTipo('n2')})
                        </button>
                        <button class="tipo-btn" data-tipo="chatbot" onclick="sistemaClassificacao.filtrarPorTipo('chatbot')">
                            🤖 Chatbot (${this.contarPorTipo('chatbot')})
                        </button>
                    </div>
                </div>

                <!-- Dashboard Consolidado -->
                <div class="dashboard-consolidado">
                    <h3>📈 Visão Geral Consolidada</h3>
                    <div class="consolidado-grid">
                        ${this.criarCardsConsolidados()}
                        ${this.criarGraficoDistribuicao()}
                        ${this.criarTabelaComparativa()}
                    </div>
                </div>

                <!-- Lista de Demandas -->
                <div class="demandas-lista">
                    <h3>📋 Lista de Demandas</h3>
                    <div class="lista-header">
                        <div class="busca-rapida">
                            <input type="text" id="busca-rapida" placeholder="🔍 Buscar rápida..." class="velohub-input">
                        </div>
                        <div class="acoes-lista">
                            <button class="velohub-btn btn-primary" onclick="sistemaClassificacao.novaDemanda()">
                                ➕ Nova Demanda
                            </button>
                            <button class="velohub-btn btn-secondary" onclick="sistemaClassificacao.exportarSelecionados()">
                                📥 Exportar Selecionados
                            </button>
                        </div>
                    </div>
                    
                    <div id="demandas-conteudo" class="demandas-conteudo">
                        ${this.renderizarDemandas('todos')}
                    </div>
                </div>
            </div>
        `;
    }

    criarCardsConsolidados() {
        const dados = this.obterTodasDemandas();
        const stats = this.calcularEstatisticas(dados);
        
        return `
            <div class="cards-consolidados">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-icon">🏦</span>
                        <span class="stat-titulo">BACEN</span>
                    </div>
                    <div class="stat-valor">${stats.bacen.total}</div>
                    <div class="stat-detalhes">
                        <span class="stat-item">Em Tratativa: ${stats.bacen.emTratativa}</span>
                        <span class="stat-item">Concluídos: ${stats.bacen.concluidos}</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-icon">🔄</span>
                        <span class="stat-titulo">N2</span>
                    </div>
                    <div class="stat-valor">${stats.n2.total}</div>
                    <div class="stat-detalhes">
                        <span class="stat-item">Em Tratativa: ${stats.n2.emTratativa}</span>
                        <span class="stat-item">Concluídos: ${stats.n2.concluidos}</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-icon">🤖</span>
                        <span class="stat-titulo">Chatbot</span>
                    </div>
                    <div class="stat-valor">${stats.chatbot.total}</div>
                    <div class="stat-detalhes">
                        <span class="stat-item">Resolvidos: ${stats.chatbot.resolvidos}</span>
                        <span class="stat-item">Encaminhados: ${stats.chatbot.encaminhados}</span>
                    </div>
                </div>
                
                <div class="stat-card total">
                    <div class="stat-header">
                        <span class="stat-icon">📊</span>
                        <span class="stat-titulo">Total Geral</span>
                    </div>
                    <div class="stat-valor">${stats.geral.total}</div>
                    <div class="stat-detalhes">
                        <span class="stat-item">Taxa Resolução: ${stats.geral.taxaResolucao}%</span>
                        <span class="stat-item">Valor Total: R$ ${stats.geral.valorTotal.toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    criarGraficoDistribuicao() {
        const dados = this.obterTodasDemandas();
        const distribuicao = this.calcularDistribuicao(dados);
        
        return `
            <div class="grafico-distribuicao">
                <h4>📊 Distribuição por Tipo</h4>
                <div class="grafico-container">
                    ${Object.entries(distribuicao).map(([tipo, dados]) => {
                        const percentual = (dados.total / this.contarTotal()) * 100;
                        const config = this.tiposDemanda[tipo];
                        
                        return `
                            <div class="barra-item">
                                <div class="barra" style="height: ${percentual}%; background: ${config.cor};">
                                    <div class="barra-valor">${dados.total}</div>
                                </div>
                                <div class="barra-label">${config.nome}</div>
                                <div class="barra-percentual">${percentual.toFixed(1)}%</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    criarTabelaComparativa() {
        const dados = this.obterTodasDemandas();
        const comparativo = this.calcularComparativo(dados);
        
        return `
            <div class="tabela-comparativa">
                <h4>📈 Comparativo de Performance</h4>
                <table class="tabela-comparativo">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Total</th>
                            <th>Tempo Médio</th>
                            <th>Taxa Resolução</th>
                            <th>Valor Médio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(comparativo).map(([tipo, dados]) => {
                            const config = this.tiposDemanda[tipo];
                            
                            return `
                                <tr>
                                    <td>
                                        <span class="tipo-badge" style="background: ${config.cor};">
                                            ${config.nome}
                                        </span>
                                    </td>
                                    <td>${dados.total}</td>
                                    <td>${dados.tempoMedio}</td>
                                    <td>${dados.taxaResolucao}%</td>
                                    <td>R$ ${dados.valorMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderizarDemandas(tipoFiltro) {
        const demandas = this.obterDemandasFiltradas(tipoFiltro);
        
        if (demandas.length === 0) {
            return `
                <div class="sem-demandas">
                    <p>📭 Nenhuma demanda encontrada</p>
                </div>
            `;
        }
        
        return demandas.map(demanda => this.criarCardDemanda(demanda)).join('');
    }

    criarCardDemanda(demanda) {
        const config = this.tiposDemanda[demanda.tipo];
        const statusClass = this.getStatusClass(demanda.status);
        
        return `
            <div class="demanda-card" data-tipo="${demanda.tipo}">
                <div class="demanda-header">
                    <div class="demanda-tipo">
                        <span class="tipo-badge" style="background: ${config.cor};">
                            ${config.nome}
                        </span>
                        <span class="demanda-id">#${demanda.id}</span>
                    </div>
                    <div class="demanda-status">
                        <span class="status-badge ${statusClass}">
                            ${this.formatarStatus(demanda.status)}
                        </span>
                    </div>
                </div>
                
                <div class="demanda-conteudo">
                    <div class="demanda-info">
                        <h4>${demanda.nomeCliente || 'Não informado'}</h4>
                        <p><strong>CPF:</strong> ${demanda.cpf || 'Não informado'}</p>
                        <p><strong>Motivo:</strong> ${demanda.motivoReduzido || 'Não informado'}</p>
                        <p><strong>Data:</strong> ${this.formatarData(demanda.dataCriacao)}</p>
                    </div>
                    
                    <div class="demanda-acoes">
                        <button class="velohub-btn btn-primary" onclick="sistemaClassificacao.verDetalhes(${demanda.id})">
                            📋 Ver Detalhes
                        </button>
                        <button class="velohub-btn btn-secondary" onclick="sistemaClassificacao.editarDemanda(${demanda.id})">
                            ✏️ Editar
                        </button>
                    </div>
                </div>
                
                <div class="demanda-campos-especificos">
                    ${this.renderizarCamposEspecificos(demanda)}
                </div>
            </div>
        `;
    }

    renderizarCamposEspecificos(demanda) {
        const config = this.tiposDemanda[demanda.tipo];
        let campos = '';
        
        // Renderiza campos específicos de cada tipo usando os camposEspecificos
        if (demanda.camposEspecificos) {
            switch (demanda.tipo) {
                case 'bacen':
                    campos = `
                        <span class="campo-especifico">🏦 BACEN: ${demanda.bacen ? '✅' : '❌'}</span>
                        <span class="campo-especifico">⚖️ PROCON: ${demanda.procon ? '✅' : '❌'}</span>
                        <span class="campo-especifico">📅 Prazo: ${this.formatarData(demanda.camposEspecificos.prazoBacen)}</span>
                        <span class="campo-especifico">📢 Reclame Aqui: ${demanda.camposEspecificos.reclameAqui ? '✅' : '❌'}</span>
                    `;
                    break;
                    
                case 'n2':
                    campos = `
                        <span class="campo-especifico">🔄 Portabilidade: ${demanda.camposEspecificos.n2Portabilidade ? '✅' : '❌'}</span>
                        <span class="campo-especifico">📊 Status: ${demanda.camposEspecificos.statusPortabilidade || 'N/A'}</span>
                    `;
                    break;
                    
                case 'chatbot':
                    campos = `
                        <span class="campo-especifico">🤖 Canal: ${demanda.camposEspecificos.canalChatbot || 'N/A'}</span>
                        <span class="campo-especifico">✅ Resolvido Auto: ${demanda.camposEspecificos.resolvidoAutomaticamente ? '✅' : '❌'}</span>
                        <span class="campo-especifico">👤 Encaminhado: ${demanda.camposEspecificos.encaminhadoParaHumano ? '✅' : '❌'}</span>
                        <span class="campo-especifico">⭐ Satisfação: ${demanda.camposEspecificos.satisfacao || 'N/A'}</span>
                    `;
                    break;
            }
        } else {
            // Fallback para dados antigos sem camposEspecificos
            switch (demanda.tipo) {
                case 'bacen':
                    campos = `
                        <span class="campo-especifico">🏦 BACEN: ${demanda.bacen ? '✅' : '❌'}</span>
                        <span class="campo-especifico">⚖️ PROCON: ${demanda.procon ? '✅' : '❌'}</span>
                        <span class="campo-especifico">📅 Prazo: ${this.formatarData(demanda.prazoBacen)}</span>
                    `;
                    break;
                    
                case 'n2':
                    campos = `
                        <span class="campo-especifico">🔄 Portabilidade: ${demanda.n2Portabilidade ? '✅' : '❌'}</span>
                        <!-- Removido: Banco Origem e Banco Destino (campos removidos das fichas) -->
                    `;
                    break;
                    
                case 'chatbot':
                    campos = `
                        <span class="campo-especifico">🤖 Canal: ${demanda.canalChatbot || 'N/A'}</span>
                        <span class="campo-especifico">✅ Resolvido Auto: ${demanda.resolvidoAutomaticamente ? '✅' : '❌'}</span>
                        <span class="campo-especifico">👤 Encaminhado: ${demanda.encaminhadoParaHumano ? '✅' : '❌'}</span>
                    `;
                    break;
            }
        }
        
        return `<div class="campos-especificos">${campos}</div>`;
    }

    // === MÉTODOS DE DADOS ===
    obterTodasDemandas() {
        // Obtém do localStorage separadamente por tipo
        // Usar chaves novas e antigas para compatibilidade
        const demandasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
        const demandasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
        // Usar chaves novas e antigas para compatibilidade
        const demandasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
        
        // Se não houver dados separados, tenta do formato antigo
        if (demandasBacen.length === 0 && demandasN2.length === 0 && demandasChatbot.length === 0) {
            const demandasAntigas = JSON.parse(localStorage.getItem('velotax_fichas') || '[]');
            
            if (demandasAntigas.length === 0) {
                return this.obterDadosDemo();
            }
            
            // Classifica as demandas antigas
            return demandasAntigas.map(demanda => ({
                ...demanda,
                tipo: this.identificarTipoDemanda(demanda)
            }));
        }
        
        // Combina todos os tipos com identificação
        const todasDemandas = [
            ...demandasBacen.map(d => ({ ...d, tipo: 'bacen' })),
            ...demandasN2.map(d => ({ ...d, tipo: 'n2' })),
            ...demandasChatbot.map(d => ({ ...d, tipo: 'chatbot' }))
        ];
        
        return todasDemandas;
    }

    obterDadosDemo() {
        return [
            // Demanda BACEN
            {
                id: 1,
                tipo: 'bacen',
                nomeCliente: 'João Silva',
                cpf: '123.456.789-00',
                status: 'em-tratativa',
                dataCriacao: '2024-01-15',
                motivoReduzido: 'Portabilidade não realizada',
                bacen: true,
                procon: false,
                prazoBacen: '2024-01-25',
            },
            // Demanda N2
            {
                id: 2,
                tipo: 'n2',
                nomeCliente: 'Maria Santos',
                cpf: '987.654.321-00',
                status: 'concluido',
                dataCriacao: '2024-01-10',
                motivoReduzido: 'Portabilidade',
                n2Portabilidade: true,
                // Removido: bancoOrigem e bancoDestino (campos removidos das fichas)
            },
            // Demanda Chatbot
            {
                id: 3,
                tipo: 'chatbot',
                nomeCliente: 'Pedro Costa',
                cpf: '456.789.123-00',
                status: 'concluido',
                dataCriacao: '2024-01-20',
                motivoReduzido: 'Dúvida sobre saldo',
                canalChatbot: 'WhatsApp',
                resolvidoAutomaticamente: true,
                encaminhadoParaHumano: false,
            }
        ];
    }

    obterDemandasFiltradas(tipoFiltro) {
        const demandas = this.obterTodasDemandas();
        
        if (tipoFiltro === 'todos') {
            return demandas;
        }
        
        return demandas.filter(d => d.tipo === tipoFiltro);
    }

    // === ESTATÍSTICAS ===
    contarTotal() {
        return this.obterTodasDemandas().length;
    }

    contarPorTipo(tipo) {
        return this.obterTodasDemandas().filter(d => d.tipo === tipo).length;
    }

    calcularEstatisticas(dados) {
        const stats = {
            bacen: { total: 0, emTratativa: 0, concluidos: 0 },
            n2: { total: 0, emTratativa: 0, concluidos: 0 },
            chatbot: { total: 0, resolvidos: 0, encaminhados: 0 },
            geral: { total: 0, taxaResolucao: 0, valorTotal: 0 }
        };
        
        dados.forEach(demanda => {
            const tipo = demanda.tipo;
            
            // Contagem geral
            stats[tipo].total++;
            stats.geral.total++;
            
            // Status específicos
            if (demanda.status === 'em-tratativa') {
                stats[tipo].emTratativa++;
            } else if (demanda.status === 'concluido') {
                stats[tipo].concluidos++;
            }
            
            // Específicos do chatbot
            if (tipo === 'chatbot') {
                if (demanda.resolvidoAutomaticamente) stats.chatbot.resolvidos++;
                if (demanda.encaminhadoParaHumano) stats.chatbot.encaminhados++;
            }
            
            // Valores (removido)
        });
        
        // Taxa de resolução geral
        const concluidos = dados.filter(d => d.status === 'concluido').length;
        stats.geral.taxaResolucao = dados.length > 0 ? 
            Math.round((concluidos / dados.length) * 100) : 0;
        
        return stats;
    }

    calcularDistribuicao(dados) {
        const distribuicao = {
            bacen: { total: 0 },
            n2: { total: 0 },
            chatbot: { total: 0 }
        };
        
        dados.forEach(demanda => {
            distribuicao[demanda.tipo].total++;
        });
        
        return distribuicao;
    }

    calcularComparativo(dados) {
        const comparativo = {};
        
        Object.keys(this.tiposDemanda).forEach(tipo => {
            const demandasTipo = dados.filter(d => d.tipo === tipo);
            
            if (demandasTipo.length > 0) {
                const concluidos = demandasTipo.filter(d => d.status === 'concluido');
                comparativo[tipo] = {
                    total: demandasTipo.length,
                    tempoMedio: '2.5 dias', // Simplificado
                    taxaResolucao: Math.round((concluidos.length / demandasTipo.length) * 100)
                };
            }
        });
        
        return comparativo;
    }

    // === CONTROLE DE INTERFACE ===
    filtrarPorTipo(tipo) {
        // Atualiza botões
        document.querySelectorAll('.tipo-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tipo="${tipo}"]`).classList.add('active');
        
        // Renderiza demandas filtradas
        const conteudo = document.getElementById('demandas-conteudo');
        if (conteudo) {
            conteudo.innerHTML = this.renderizarDemandas(tipo);
        }
    }

    verDetalhes(id) {
        const demanda = this.obterTodasDemandas().find(d => d.id === id);
        if (demanda && window.sistemaFichas) {
            window.sistemaFichas.abrirFicha(demanda);
        }
    }

    editarDemanda(id) {
        const demanda = this.obterTodasDemandas().find(d => d.id === id);
        if (demanda && window.sistemaFichas) {
            window.sistemaFichas.abrirFicha(demanda);
            setTimeout(() => window.sistemaFichas.toggleEdicao(), 500);
        }
    }

    novaDemanda() {
        // Implementar criação de nova demanda
        this.mostrarNotificacao('Funcionalidade em desenvolvimento', 'info');
    }

    exportarSelecionados() {
        // Implementar exportação
        this.mostrarNotificacao('Exportando demandas selecionadas...', 'info');
    }

    // === UTILITÁRIOS ===
    formatarStatus(status) {
        const statusMap = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'respondido': 'Respondido'
        };
        return statusMap[status] || status;
    }

    getStatusClass(status) {
        return `status-${status}`;
    }

    formatarData(dataString) {
        if (!dataString) return 'N/A';
        return new Date(dataString).toLocaleDateString('pt-BR');
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
            <style id="estilos-classificacao">
                /* === CONTAINER PRINCIPAL === */
                .classificacao-container {
                    max-width: 1400px;
                    margin: 20px auto;
                    padding: 24px;
                    background: var(--cor-container);
                    border-radius: 12px;
                    box-shadow: var(--sombra-media);
                }

                .classificacao-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .classificacao-header h2 {
                    color: var(--azul-royal);
                    margin-bottom: 8px;
                }

                .classificacao-header p {
                    color: var(--texto-secundario);
                }

                /* === FILTROS POR TIPO === */
                .filtro-tipos {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 32px;
                }

                .filtro-tipos h3 {
                    color: var(--azul-royal);
                    margin: 0 0 16px 0;
                }

                .tipos-botoes {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .tipo-btn {
                    padding: 12px 20px;
                    border: 2px solid var(--borda-clara);
                    background: var(--cor-container);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }

                .tipo-btn:hover {
                    border-color: var(--azul-royal);
                    transform: translateY(-2px);
                }

                .tipo-btn.active {
                    border-color: var(--azul-royal);
                    background: var(--azul-royal);
                    color: white;
                }

                /* === DASHBOARD CONSOLIDADO === */
                .dashboard-consolidado {
                    margin-bottom: 32px;
                }

                .dashboard-consolidado h3 {
                    color: var(--azul-royal);
                    margin-bottom: 20px;
                }

                .consolidado-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                }

                /* === CARDS CONSOLIDADOS === */
                .cards-consolidados {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    border-left: 4px solid var(--azul-royal);
                }

                .stat-card.total {
                    border-left-color: var(--azul-ciano);
                    background: linear-gradient(135deg, var(--cor-sidebar), rgba(29, 253, 185, 0.1));
                }

                .stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .stat-icon {
                    font-size: 1.5rem;
                }

                .stat-titulo {
                    font-weight: 600;
                    color: var(--texto-principal);
                }

                .stat-valor {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--azul-royal);
                    margin-bottom: 8px;
                }

                .stat-detalhes {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                }

                /* === GRÁFICO DE DISTRIBUIÇÃO === */
                .grafico-distribuicao {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .grafico-distribuicao h4 {
                    color: var(--azul-royal);
                    margin: 0 0 16px 0;
                }

                .grafico-container {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 150px;
                    gap: 16px;
                }

                .barra-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                }

                .barra {
                    width: 60px;
                    background: var(--azul-royal);
                    border-radius: 4px 4px 0 0;
                    position: relative;
                    min-height: 20px;
                    transition: all 0.3s ease;
                }

                .barra:hover {
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
                    color: var(--texto-principal);
                    font-weight: 500;
                }

                .barra-percentual {
                    font-size: 0.7rem;
                    color: var(--texto-secundario);
                    margin-top: 4px;
                }

                /* === TABELA COMPARATIVA === */
                .tabela-comparativa {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                }

                .tabela-comparativa h4 {
                    color: var(--azul-royal);
                    margin: 0 0 16px 0;
                }

                .tabela-comparativo {
                    width: 100%;
                    border-collapse: collapse;
                }

                .tabela-comparativo th {
                    background: var(--azul-royal);
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }

                .tabela-comparativo td {
                    padding: 12px;
                    border-bottom: 1px solid var(--borda-clara);
                }

                .tipo-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                /* === LISTA DE DEMANDAS === */
                .demandas-lista h3 {
                    color: var(--azul-royal);
                    margin-bottom: 20px;
                }

                .lista-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .busca-rapida {
                    flex: 1;
                    min-width: 200px;
                }

                .acoes-lista {
                    display: flex;
                    gap: 12px;
                }

                /* === CARDS DE DEMANDAS === */
                .demandas-conteudo {
                    display: grid;
                    gap: 16px;
                }

                .demanda-card {
                    background: var(--cor-container);
                    border: 1px solid var(--borda-clara);
                    border-radius: 8px;
                    padding: 20px;
                    transition: all 0.3s ease;
                }

                .demanda-card:hover {
                    box-shadow: var(--sombra-media);
                    transform: translateY(-2px);
                }

                .demanda-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .demanda-tipo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .demanda-id {
                    color: var(--texto-secundario);
                    font-size: 0.85rem;
                }

                .demanda-conteudo {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .demanda-info h4 {
                    color: var(--texto-principal);
                    margin: 0 0 8px 0;
                }

                .demanda-info p {
                    color: var(--texto-secundario);
                    margin: 4px 0;
                    font-size: 0.9rem;
                }

                .demanda-acoes {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .campos-especificos {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    padding-top: 12px;
                    border-top: 1px solid var(--borda-clara);
                }

                .campo-especifico {
                    background: var(--cor-sidebar);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    color: var(--texto-principal);
                }

                .sem-demandas {
                    text-align: center;
                    padding: 40px;
                    color: var(--texto-secundario);
                }

                /* === RESPONSIVO === */
                @media (max-width: 768px) {
                    .tipos-botoes {
                        flex-direction: column;
                    }

                    .consolidado-grid {
                        grid-template-columns: 1fr;
                    }

                    .cards-consolidados {
                        grid-template-columns: 1fr;
                    }

                    .grafico-container {
                        height: auto;
                        flex-direction: column;
                    }

                    .barra {
                        width: 100%;
                        height: 40px !important;
                        margin-bottom: 8px;
                    }

                    .barra-valor {
                        top: 50%;
                        left: 10px;
                        transform: translateY(-50%);
                    }

                    .lista-header {
                        flex-direction: column;
                    }

                    .demanda-conteudo {
                        grid-template-columns: 1fr;
                    }

                    .demanda-acoes {
                        flex-direction: row;
                    }

                    .campos-especificos {
                        flex-direction: column;
                    }
                }
            </style>
        `;

        if (!document.getElementById('estilos-classificacao')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }

    configurarEventos() {
        // Configurar busca rápida
        document.addEventListener('input', (e) => {
            if (e.target.id === 'busca-rapida') {
                this.buscaRapida(e.target.value);
            }
        });
    }

    buscaRapida(termo) {
        const demandas = this.obterTodasDemandas();
        const filtradas = demandas.filter(d => 
            d.nomeCliente?.toLowerCase().includes(termo.toLowerCase()) ||
            d.cpf?.includes(termo) ||
            d.motivoReduzido?.toLowerCase().includes(termo.toLowerCase())
        );
        
        const conteudo = document.getElementById('demandas-conteudo');
        if (conteudo) {
            conteudo.innerHTML = filtradas.length > 0 ? 
                filtradas.map(d => this.criarCardDemanda(d)).join('') :
                '<div class="sem-demandas"><p>📭 Nenhuma demanda encontrada</p></div>';
        }
    }
}

// Inicializa o sistema
let sistemaClassificacao;
document.addEventListener('DOMContentLoaded', () => {
    sistemaClassificacao = new SistemaClassificacaoDemandas();
});

// Exporta para uso global
window.SistemaClassificacao = SistemaClassificacaoDemandas;
window.SistemaClassificacaoDemandas = SistemaClassificacaoDemandas;
window.sistemaClassificacao = sistemaClassificacao;
