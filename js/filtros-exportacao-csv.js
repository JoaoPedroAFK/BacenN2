/* === FILTROS AVANÇADOS PARA EXPORTAÇÃO CSV === */

class FiltrosExportacaoCSV {
    constructor(tipoDemanda) {
        this.tipoDemanda = tipoDemanda;
        this.filtros = {
            enviarCobranca: null,
            blacklist: null,
            status: null,
            origem: null,
            responsavel: null,
            periodo: null
        };
    }

    mostrarModalFiltros(dados, callbackExportar) {
        // Salvar dados originais globalmente
        window.dadosOriginais = dados;
        
        const modal = document.createElement('div');
        modal.className = 'modal-filtros-csv';
        modal.id = 'modal-filtros-csv';
        modal.innerHTML = `
            <div class="modal-content-filtros">
                <div class="modal-header-filtros">
                    <h3>🔍 Filtros Avançados para Exportação</h3>
                    <button class="btn-fechar-modal" onclick="this.closest('.modal-filtros-csv').remove()">✕</button>
                </div>
                <div class="modal-body-filtros">
                    <div class="filtros-exportacao-grid">
                        <div class="filtro-item-export">
                            <label>Enviar para Cobrança:</label>
                            <select id="filtro-csv-cobranca" class="velohub-input">
                                <option value="">Todos</option>
                                <option value="sim">Sim</option>
                                <option value="nao">Não</option>
                            </select>
                        </div>
                        <div class="filtro-item-export">
                            <label>Blacklist (Casos Críticos):</label>
                            <select id="filtro-csv-blacklist" class="velohub-input">
                                <option value="">Todos</option>
                                <option value="sim">Sim</option>
                                <option value="nao">Não</option>
                            </select>
                        </div>
                        <div class="filtro-item-export">
                            <label>Status:</label>
                            <select id="filtro-csv-status" class="velohub-input">
                                <option value="">Todos</option>
                                <option value="nao-iniciado">Não Iniciado</option>
                                <option value="em-tratativa">Em Tratativa</option>
                                <option value="concluido">Concluído</option>
                                <option value="respondido">Respondido</option>
                            </select>
                        </div>
                        ${this.tipoDemanda === 'bacen' || this.tipoDemanda === 'n2' ? `
                        <div class="filtro-item-export">
                            <label>Origem:</label>
                            <select id="filtro-csv-origem" class="velohub-input">
                                <option value="">Todas</option>
                                ${this.obterOrigensUnicas(dados).map(o => `<option value="${o}">${o}</option>`).join('')}
                            </select>
                        </div>
                        ` : ''}
                        <div class="filtro-item-export">
                            <label>Responsável:</label>
                            <select id="filtro-csv-responsavel" class="velohub-input">
                                <option value="">Todos</option>
                                ${this.obterResponsaveisUnicos(dados).map(r => `<option value="${r}">${r}</option>`).join('')}
                            </select>
                        </div>
                        <div class="filtro-item-export">
                            <label>Período:</label>
                            <select id="filtro-csv-periodo" class="velohub-input">
                                <option value="">Todos</option>
                                <option value="7dias">Últimos 7 dias</option>
                                <option value="30dias">Últimos 30 dias</option>
                                <option value="90dias">Últimos 90 dias</option>
                                <option value="mes">Este mês</option>
                                <option value="ano">Este ano</option>
                                <option value="custom">Período Customizado</option>
                            </select>
                        </div>
                        <div class="filtro-item-export" id="periodo-custom-container" style="display: none;">
                            <label>Data Inicial:</label>
                            <input type="date" id="filtro-csv-data-inicial" class="velohub-input">
                        </div>
                        <div class="filtro-item-export" id="periodo-custom-container-fim" style="display: none;">
                            <label>Data Final:</label>
                            <input type="date" id="filtro-csv-data-final" class="velohub-input">
                        </div>
                    </div>
                    <div class="filtros-exportacao-secao" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--borda, #ddd);">
                        <h4 style="margin-bottom: 15px; color: var(--texto-principal, #333);">📋 Campos para Incluir no Relatório</h4>
                        <div id="campos-relatorio-container" style="max-height: 300px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                            ${this.obterCamposDisponiveis(dados).map(campo => `
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; background: var(--cor-container, #f5f5f5);">
                                    <input type="checkbox" class="campo-relatorio-checkbox" value="${campo.chave}" checked style="cursor: pointer;">
                                    <span>${campo.label}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div style="margin-top: 10px; display: flex; gap: 10px;">
                            <button type="button" class="velohub-btn btn-secondary" onclick="this.closest('.modal-filtros-csv').querySelectorAll('.campo-relatorio-checkbox').forEach(cb => cb.checked = true)" style="padding: 6px 12px; font-size: 12px;">✓ Selecionar Todos</button>
                            <button type="button" class="velohub-btn btn-secondary" onclick="this.closest('.modal-filtros-csv').querySelectorAll('.campo-relatorio-checkbox').forEach(cb => cb.checked = false)" style="padding: 6px 12px; font-size: 12px;">✕ Desmarcar Todos</button>
                        </div>
                    </div>
                    <div class="modal-info-filtros">
                        <p>📊 Total de registros: <strong id="total-filtrado">${dados.length}</strong></p>
                    </div>
                </div>
                <div class="modal-footer-filtros">
                    <button class="velohub-btn btn-secondary" onclick="this.closest('.modal-filtros-csv').remove()">Cancelar</button>
                    <button class="velohub-btn" id="btn-exportar-filtrado">📥 Exportar CSV</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Configurar botão de exportar
        const btnExportar = modal.querySelector('#btn-exportar-filtrado');
        if (btnExportar) {
            btnExportar.onclick = () => {
                this.aplicarFiltrosEExportar(dados, callbackExportar);
            };
        }

        // Atualizar contador ao mudar filtros
        const selects = modal.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', () => {
                this.atualizarContador(dados);
                // Mostrar/ocultar campos de data customizada
                if (select.id === 'filtro-csv-periodo') {
                    const periodoCustom = select.value === 'custom';
                    document.getElementById('periodo-custom-container').style.display = periodoCustom ? 'block' : 'none';
                    document.getElementById('periodo-custom-container-fim').style.display = periodoCustom ? 'block' : 'none';
                }
            });
        });
        
        // Atualizar contador ao mudar datas customizadas
        const dataInicial = modal.querySelector('#filtro-csv-data-inicial');
        const dataFinal = modal.querySelector('#filtro-csv-data-final');
        if (dataInicial) {
            dataInicial.addEventListener('change', () => this.atualizarContador(dados));
        }
        if (dataFinal) {
            dataFinal.addEventListener('change', () => this.atualizarContador(dados));
        }
    }
    
    obterCamposDisponiveis(dados) {
        if (!dados || dados.length === 0) return [];
        
        // Obter todos os campos únicos do primeiro registro
        const primeiroRegistro = dados[0];
        const campos = [];
        
        // Mapeamento de campos comuns com labels amigáveis
        const mapeamentoLabels = {
            'id': 'ID',
            'dataEntrada': 'Data de Entrada',
            'dataCriacao': 'Data de Criação',
            'mes': 'Mês',
            'nomeCompleto': 'Nome Completo',
            'cpf': 'CPF',
            'telefone': 'Telefone',
            'origem': 'Origem',
            'origemTipo': 'Tipo de Origem',
            'rdr': 'RDR',
            'motivoReduzido': 'Motivo Reduzido',
            'motivoDetalhado': 'Motivo Detalhado',
            'prazoBacen': 'Prazo BACEN',
            'pixStatus': 'Status PIX',
            'enviarCobranca': 'Enviar para Cobrança',
            'casosCriticos': 'Casos Críticos',
            'status': 'Status',
            'finalizadoEm': 'Finalizado Em',
            'observacoes': 'Observações',
            'responsavel': 'Responsável',
            'dataEntradaAtendimento': 'Data Entrada Atendimento',
            'dataEntradaN2': 'Data Entrada N2',
            'formalizadoCliente': 'Formalizado Cliente',
            'dataClienteChatbot': 'Data Cliente Chatbot',
            'notaAvaliacao': 'Nota de Avaliação',
            'avaliacaoCliente': 'Avaliação do Cliente',
            'produto': 'Produto',
            'motivo': 'Motivo',
            'respostaBot': 'Resposta do Bot',
            'canalChatbot': 'Canal Chatbot'
        };
        
        // Adicionar campos do primeiro registro
        for (const chave in primeiroRegistro) {
            if (primeiroRegistro.hasOwnProperty(chave) && chave !== '__objeto' && chave !== '__metadata') {
                const label = mapeamentoLabels[chave] || chave.charAt(0).toUpperCase() + chave.slice(1).replace(/([A-Z])/g, ' $1').trim();
                campos.push({ chave, label });
            }
        }
        
        // Ordenar por label
        campos.sort((a, b) => a.label.localeCompare(b.label));
        
        return campos;
    }

    atualizarContador(dados) {
        const dadosFiltrados = this.aplicarFiltros(dados);
        const contador = document.getElementById('total-filtrado');
        if (contador) {
            contador.textContent = dadosFiltrados.length;
        }
    }

    aplicarFiltrosEExportar(dados, callbackExportar) {
        const dadosParaFiltrar = dados || window.dadosOriginais || [];
        const dadosFiltrados = this.aplicarFiltros(dadosParaFiltrar);
        
        if (dadosFiltrados.length === 0) {
            if (typeof mostrarAlerta === 'function') {
                mostrarAlerta('Nenhum registro encontrado com os filtros selecionados', 'error');
            } else {
                alert('Nenhum registro encontrado com os filtros selecionados');
            }
            return;
        }

        // Obter campos selecionados
        const camposSelecionados = [];
        const checkboxes = document.querySelectorAll('.campo-relatorio-checkbox:checked');
        checkboxes.forEach(cb => {
            camposSelecionados.push(cb.value);
        });
        
        // Se nenhum campo foi selecionado, usar todos
        if (camposSelecionados.length === 0) {
            if (dadosFiltrados.length > 0) {
                Object.keys(dadosFiltrados[0]).forEach(chave => {
                    if (chave !== '__objeto' && chave !== '__metadata') {
                        camposSelecionados.push(chave);
                    }
                });
            }
        }

        // Fechar modal
        const modal = document.getElementById('modal-filtros-csv');
        if (modal) {
            modal.remove();
        }

        // Chamar callback de exportação com campos selecionados
        if (callbackExportar) {
            callbackExportar(dadosFiltrados, camposSelecionados);
        }
    }

    aplicarFiltros(dados) {
        let dadosFiltrados = [...dados];

        // Filtro Enviar para Cobrança
        const filtroCobranca = document.getElementById('filtro-csv-cobranca')?.value;
        if (filtroCobranca) {
            if (filtroCobranca === 'sim') {
                dadosFiltrados = dadosFiltrados.filter(f => 
                    f.enviarCobranca === true || f.enviarCobranca === 'Sim'
                );
            } else {
                dadosFiltrados = dadosFiltrados.filter(f => 
                    !f.enviarCobranca || f.enviarCobranca === false || f.enviarCobranca === 'Não'
                );
            }
        }

        // Filtro Blacklist
        const filtroBlacklist = document.getElementById('filtro-csv-blacklist')?.value;
        if (filtroBlacklist) {
            if (filtroBlacklist === 'sim') {
                dadosFiltrados = dadosFiltrados.filter(f => 
                    f.casosCriticos === true || f.casosCriticos === 'Sim' || f.blacklist === true
                );
            } else {
                dadosFiltrados = dadosFiltrados.filter(f => 
                    !f.casosCriticos && !f.blacklist || f.casosCriticos === false
                );
            }
        }

        // Filtro Status
        const filtroStatus = document.getElementById('filtro-csv-status')?.value;
        if (filtroStatus) {
            dadosFiltrados = dadosFiltrados.filter(f => f.status === filtroStatus);
        }

        // Filtro Origem
        const filtroOrigem = document.getElementById('filtro-csv-origem')?.value;
        if (filtroOrigem && (this.tipoDemanda === 'bacen' || this.tipoDemanda === 'n2')) {
            dadosFiltrados = dadosFiltrados.filter(f => f.origem === filtroOrigem);
        }

        // Filtro Responsável
        const filtroResponsavel = document.getElementById('filtro-csv-responsavel')?.value;
        if (filtroResponsavel) {
            dadosFiltrados = dadosFiltrados.filter(f => f.responsavel === filtroResponsavel);
        }

        // Filtro Período
        const filtroPeriodo = document.getElementById('filtro-csv-periodo')?.value;
        if (filtroPeriodo) {
            const hoje = new Date();
            let dataInicial = null;
            let dataFinal = null;
            
            if (filtroPeriodo === 'custom') {
                // Período customizado
                const dataInicialStr = document.getElementById('filtro-csv-data-inicial')?.value;
                const dataFinalStr = document.getElementById('filtro-csv-data-final')?.value;
                
                if (dataInicialStr) {
                    dataInicial = new Date(dataInicialStr + 'T00:00:00');
                }
                if (dataFinalStr) {
                    dataFinal = new Date(dataFinalStr + 'T23:59:59');
                }
            } else {
                // Períodos pré-definidos
                const dataLimite = new Date();
                
                switch (filtroPeriodo) {
                    case '7dias':
                        dataInicial = new Date();
                        dataInicial.setDate(hoje.getDate() - 7);
                        break;
                    case '30dias':
                        dataInicial = new Date();
                        dataInicial.setDate(hoje.getDate() - 30);
                        break;
                    case '90dias':
                        dataInicial = new Date();
                        dataInicial.setDate(hoje.getDate() - 90);
                        break;
                    case 'mes':
                        dataInicial = new Date();
                        dataInicial.setDate(1);
                        dataInicial.setMonth(hoje.getMonth());
                        break;
                    case 'ano':
                        dataInicial = new Date();
                        dataInicial.setFullYear(hoje.getFullYear(), 0, 1);
                        break;
                }
                dataFinal = hoje;
            }
            
            if (dataInicial || dataFinal) {
                dadosFiltrados = dadosFiltrados.filter(f => {
                    const dataFicha = new Date(f.dataEntrada || f.dataCriacao || f.dataReclamacao);
                    if (dataInicial && dataFicha < dataInicial) return false;
                    if (dataFinal && dataFicha > dataFinal) return false;
                    return true;
                });
            }
        }

        return dadosFiltrados;
    }

    obterOrigensUnicas(dados) {
        return [...new Set(dados.map(f => f.origem).filter(Boolean))];
    }

    obterResponsaveisUnicos(dados) {
        return [...new Set(dados.map(f => f.responsavel).filter(Boolean))];
    }
}

// Inicializar instâncias para cada tipo
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('bacen.html') || window.location.href.includes('bacen.html')) {
        window.filtrosExportacaoCSVBacen = new FiltrosExportacaoCSV('bacen');
    } else if (window.location.pathname.includes('n2.html') || window.location.href.includes('n2.html')) {
        window.filtrosExportacaoCSVN2 = new FiltrosExportacaoCSV('n2');
    } else if (window.location.pathname.includes('chatbot.html') || window.location.href.includes('chatbot.html')) {
        window.filtrosExportacaoCSVChatbot = new FiltrosExportacaoCSV('chatbot');
    }
});

