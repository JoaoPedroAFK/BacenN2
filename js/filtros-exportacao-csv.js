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
                            </select>
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
            });
        });
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

        // Fechar modal
        const modal = document.getElementById('modal-filtros-csv');
        if (modal) {
            modal.remove();
        }

        // Chamar callback de exportação
        if (callbackExportar) {
            callbackExportar(dadosFiltrados);
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
            const dataLimite = new Date();
            
            switch (filtroPeriodo) {
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

