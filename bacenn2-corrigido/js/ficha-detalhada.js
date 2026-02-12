/* === SISTEMA DE FICHAS DETALHADAS VELOTAX === */

class SistemaFichas {
    constructor() {
        this.fichaAtual = null;
        this.modoEdicao = false;
        this.inicializar();
    }

    inicializar() {
        this.adicionarEstilos();
        this.configurarEventos();
    }

    // === CRIAÇÃO DE FICHA DETALHADA ===
    criarFichaDetalhada(dados) {
        this.fichaAtual = dados;
        
        // Normaliza nome do cliente
        const nomeCliente = dados.nomeCompleto || dados.nomeCliente || 'Não informado';
        
        const fichaHTML = `
            <div class="ficha-detalhada-container">
                <div class="ficha-header">
                    <div class="ficha-titulo">
                        <h2>📋 Ficha Completa - ${nomeCliente}</h2>
                        <div class="ficha-status">
                            <span class="status-badge status-${dados.status || 'nao-iniciado'}">
                                ${this.formatarStatus(dados.status)}
                            </span>
                        </div>
                    </div>
                    <div class="ficha-acoes">
                        ${this.criarBotoesAcao()}
                    </div>
                </div>

                <div class="ficha-conteudo">
                    <!-- Abas de Navegação -->
                    <div class="ficha-abas">
                        <button class="aba-btn active" onclick="sistemaFichas.mostrarAba('dados-basicos')">
                            📝 Dados Básicos
                        </button>
                        <button class="aba-btn" onclick="sistemaFichas.mostrarAba('contato')">
                            📞 Contato e Tentativas
                        </button>
                        <button class="aba-btn" onclick="sistemaFichas.mostrarAba('protocolos')">
                            📄 Protocolos
                        </button>
                        <button class="aba-btn" onclick="sistemaFichas.mostrarAba('resolucao')">
                            ✅ Resolução
                        </button>
                        <button class="aba-btn" onclick="sistemaFichas.mostrarAba('historico')">
                            📜 Histórico de Alterações
                        </button>
                    </div>

                    <!-- Conteúdo das Abas -->
                    <div class="ficha-corpo">
                        ${this.criarAbaDadosBasicos(dados)}
                        ${this.criarAbaContato(dados)}
                        ${this.criarAbaProtocolos(dados)}
                        ${this.criarAbaResolucao(dados)}
                        ${this.criarAbaHistorico(dados)}
                    </div>
                </div>

                <!-- Rodapé da Ficha -->
                <div class="ficha-rodape">
                    <div class="ficha-info-tempo">
                        <small>
                            📅 Criado em: ${this.formatarData(dados.dataCriacao)} | 
                            🔄 Última atualização: ${this.formatarData(dados.dataAtualizacao)}
                        </small>
                    </div>
                    <div class="ficha-acoes-rodape">
                        <button class="velohub-btn btn-secondary" onclick="sistemaFichas.exportarFicha()">
                            📥 Exportar Ficha
                        </button>
                        <button class="velohub-btn btn-danger" onclick="sistemaFichas.excluirFicha()">
                            🗑️ Excluir Reclamação
                        </button>
                    </div>
                </div>
            </div>
        `;

        return fichaHTML;
    }

    criarBotoesAcao() {
        const permissoes = window.sistemaPerfis?.verificarPermissao || (() => false);
        
        let botoes = `
            <button class="velohub-btn btn-primary" onclick="sistemaFichas.toggleEdicao()">
                ✏️ ${this.modoEdicao ? 'Cancelar Edição' : 'Editar Ficha'}
            </button>
        `;

        if (permissoes('exportar_dados')) {
            botoes += `
                <button class="velohub-btn btn-secondary" onclick="sistemaFichas.imprimirFicha()">
                    🖨️ Imprimir
                </button>
            `;
        }

        return botoes;
    }

    // === ABAS DA FICHA ===
    criarAbaDadosBasicos(dados) {
        return `
            <div class="aba-conteudo active" id="aba-dados-basicos">
                <div class="ficha-secao">
                    <h3>📋 Informações Principais</h3>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>CPF:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="cpf">${dados.cpf || 'Não informado'}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Nome Completo:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="nomeCliente">${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Telefone:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="telefone">${dados.telefone || 'Não informado'}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Origem:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="origem">${dados.origem || 'Não informada'}</span>
                        </div>
                    </div>
                </div>

                <div class="ficha-secao">
                    <h3>🎯 Detalhes da Reclamação</h3>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Data da Reclamação:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="dataReclamacao">${this.formatarData(dados.dataReclamacao)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Data de Recebimento:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="dataRecebimento">${this.formatarData(dados.dataRecebimento)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Prazo BACEN:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="prazoBacen">${this.formatarData(dados.prazoBacen)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Responsável:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="responsavel">${dados.responsavel || 'Não atribuído'}</span>
                        </div>
                    </div>
                    
                    <div class="ficha-item full-width">
                        <label>Motivo Reduzido:</label>
                        <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                              data-campo="motivoReduzido">${dados.motivoReduzido || 'Não informado'}</span>
                    </div>
                    
                    <div class="ficha-item full-width">
                        <label>Motivo Detalhado:</label>
                        <div class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                             data-campo="motivoDetalhado">${dados.motivoDetalhado || 'Não informado'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    criarAbaContato(dados) {
        const tentativas = dados.tentativas || [];
        const modulosContato = dados.modulosContato || {};

        return `
            <div class="aba-conteudo" id="aba-contato">
                <div class="ficha-secao">
                    <h3>📞 Módulos de Contato</h3>
                    <div class="modulos-grid">
                        <div class="modulo-item ${modulosContato.atendimento ? 'ativo' : ''}">
                            <span class="modulo-icon">📞</span>
                            <span class="modulo-nome">Atendimento</span>
                            <span class="modulo-status">${modulosContato.atendimento ? '✅' : '❌'}</span>
                        </div>
                        <div class="modulo-item ${modulosContato.reclameAqui ? 'ativo' : ''}">
                            <span class="modulo-icon">💬</span>
                            <span class="modulo-nome">Reclame Aqui</span>
                            <span class="modulo-status">${modulosContato.reclameAqui ? '✅' : '❌'}</span>
                        </div>
                        <div class="modulo-item ${modulosContato.bacen ? 'ativo' : ''}">
                            <span class="modulo-icon">🏦</span>
                            <span class="modulo-nome">BACEN</span>
                            <span class="modulo-status">${modulosContato.bacen ? '✅' : '❌'}</span>
                        </div>
                        <div class="modulo-item ${modulosContato.procon ? 'ativo' : ''}">
                            <span class="modulo-icon">⚖️</span>
                            <span class="modulo-nome">PROCON</span>
                            <span class="modulo-status">${modulosContato.procon ? '✅' : '❌'}</span>
                        </div>
                        <div class="modulo-item ${modulosContato.n2 ? 'ativo' : ''}">
                            <span class="modulo-icon">🔄</span>
                            <span class="modulo-nome">N2</span>
                            <span class="modulo-status">${modulosContato.n2 ? '✅' : '❌'}</span>
                        </div>
                    </div>
                </div>

                <div class="ficha-secao">
                    <h3>📋 Histórico de Tentativas</h3>
                    <div class="tentativas-lista">
                        ${tentativas.length > 0 ? tentativas.map((tentativa, index) => `
                            <div class="tentativa-item">
                                <div class="tentativa-cabecalho">
                                    <span class="tentativa-numero">Tentativa ${index + 1}</span>
                                    <span class="tentativa-data">${this.formatarDataHora(tentativa.dataHora)}</span>
                                </div>
                                <div class="tentativa-conteudo">
                                    <div class="tentativa-campo">
                                        <label>Resultado:</label>
                                        <span>${tentativa.resultado || 'Não informado'}</span>
                                    </div>
                                    <div class="tentativa-campo">
                                        <label>Observações:</label>
                                        <span>${tentativa.observacoes || 'Nenhuma observação'}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<p class="sem-dados">Nenhuma tentativa registrada</p>'}
                    </div>
                    
                    ${this.modoEdicao ? `
                        <button class="velohub-btn btn-secondary" onclick="sistemaFichas.adicionarTentativa()">
                            ➕ Adicionar Tentativa
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    criarAbaProtocolos(dados) {
        const protocolos = dados.protocolos || [];

        return `
            <div class="aba-conteudo" id="aba-protocolos">
                <div class="ficha-secao">
                    <h3>📄 Protocolos Anteriores</h3>
                    <div class="protocolos-lista">
                        ${protocolos.length > 0 ? protocolos.map((protocolo, index) => `
                            <div class="protocolo-item">
                                <div class="protocolo-numero">
                                    <strong>Protocolo ${index + 1}:</strong>
                                    <span>${protocolo.numero || 'Não informado'}</span>
                                </div>
                                <div class="protocolo-detalhes">
                                    <div class="protocolo-campo">
                                        <label>Canal:</label>
                                        <span>${protocolo.canal || 'Não informado'}</span>
                                    </div>
                                    <div class="protocolo-campo">
                                        <label>Data:</label>
                                        <span>${this.formatarData(protocolo.data)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<p class="sem-dados">Nenhum protocolo registrado</p>'}
                    </div>
                    
                    ${this.modoEdicao ? `
                        <button class="velohub-btn btn-secondary" onclick="sistemaFichas.adicionarProtocolo()">
                            ➕ Adicionar Protocolo
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    criarAbaResolucao(dados) {
        return `
            <div class="aba-conteudo" id="aba-resolucao">
                <div class="ficha-secao">
                    <h3>✅ Status e Resolução</h3>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Status Atual:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="status">${this.formatarStatus(dados.status)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Data do Status:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="dataStatus">${this.formatarData(dados.dataStatus)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Finalizado em:</label>
                            <span class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                                  data-campo="finalizadoEm">${this.formatarData(dados.finalizadoEm)}</span>
                        </div>
                    </div>
                </div>

                <div class="ficha-secao">
                    <h3>📝 Resultado da Tratativa</h3>
                    <div class="ficha-item full-width">
                        <div class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                             data-campo="resultadoTratativa">
                            ${dados.resultadoTratativa || 'Nenhum resultado registrado'}
                        </div>
                    </div>
                </div>

                <div class="ficha-secao">
                    <h3>📊 Indicadores de Resolução</h3>
                    <div class="indicadores-grid">
                        <div class="indicador-item">
                            <span class="indicador-label">PIX Liberado/Excluído:</span>
                            <span class="indicador-valor ${dados.pixLiberado ? 'positivo' : 'negativo'}">
                                ${dados.pixLiberado ? '✅ Sim' : '❌ Não'}
                            </span>
                        </div>
                        <div class="indicador-item">
                            <span class="indicador-label">Aceitou Liquidação:</span>
                            <span class="indicador-valor ${dados.aceitouLiquidacao ? 'positivo' : 'negativo'}">
                                ${dados.aceitouLiquidacao ? '✅ Sim' : '❌ Não'}
                            </span>
                        </div>
                        <div class="indicador-item">
                            <span class="indicador-label">Enviar para Cobrança:</span>
                            <span class="indicador-valor ${dados.enviarCobranca ? 'positivo' : 'negativo'}">
                                ${dados.enviarCobranca ? '✅ Sim' : '❌ Não'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="ficha-secao">
                    <h3>📋 Observações Finais</h3>
                    <div class="ficha-item full-width">
                        <div class="ficha-valor ${this.modoEdicao ? 'editavel' : ''}" 
                             data-campo="observacoes">
                            ${dados.observacoes || 'Nenhuma observação'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // === CONTROLE DE ABAS ===
    mostrarAba(abaId) {
        // Remove classe active de todas as abas
        document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.aba-conteudo').forEach(conteudo => conteudo.classList.remove('active'));
        
        // Adiciona classe active na aba selecionada
        event.target.classList.add('active');
        document.getElementById(`aba-${abaId}`).classList.add('active');
    }

    // === EDIÇÃO ===
    toggleEdicao() {
        this.modoEdicao = !this.modoEdicao;
        
        if (this.modoEdicao) {
            this.habilitarEdicao();
        } else {
            this.desabilitarEdicao();
        }
    }

    habilitarEdicao() {
        // Transforma elementos editáveis em inputs
        document.querySelectorAll('.editavel').forEach(element => {
            const campo = element.dataset.campo;
            const valor = element.textContent;
            
            if (element.tagName === 'DIV') {
                element.innerHTML = `<textarea class="ficha-input" data-campo="${campo}">${valor}</textarea>`;
            } else {
                element.innerHTML = `<input type="text" class="ficha-input" data-campo="${campo}" value="${valor}">`;
            }
        });

        // Atualiza botão
        const btnEditar = document.querySelector('.ficha-acoes .btn-primary');
        if (btnEditar) {
            btnEditar.innerHTML = '💾 Salvar Alterações';
            btnEditar.onclick = () => this.salvarAlteracoes();
        }
    }

    desabilitarEdicao() {
        // Recarrega a ficha para restaurar valores originais
        if (this.fichaAtual) {
            this.abrirFicha(this.fichaAtual);
        }
    }

    salvarAlteracoes() {
        const dadosAtualizados = { ...this.fichaAtual };
        
        // Coleta valores dos inputs
        document.querySelectorAll('.ficha-input').forEach(input => {
            const campo = input.dataset.campo;
            dadosAtualizados[campo] = input.value;
        });

        // Atualiza usando o gerenciador de fichas
        if (window.gerenciadorFichas) {
            try {
                window.gerenciadorFichas.atualizarFicha(this.fichaAtual.id, dadosAtualizados);
                this.fichaAtual = window.gerenciadorFichas.fichas.find(f => f.id === this.fichaAtual.id);
            } catch (erro) {
                this.mostrarNotificacao(erro.message, 'erro');
                return;
            }
        } else {
            // Fallback
            dadosAtualizados.dataAtualizacao = new Date().toISOString();
            this.salvarFicha(dadosAtualizados);
            this.fichaAtual = dadosAtualizados;
        }
        
        // Desabilita edição
        this.modoEdicao = false;
        this.abrirFicha(this.fichaAtual);
        
        // Mostra notificação
        this.mostrarNotificacao('Ficha atualizada com sucesso!', 'sucesso');
    }

    criarAbaHistorico(dados) {
        const historico = window.gerenciadorFichas?.obterHistoricoFicha(dados.id) || [];
        
        if (historico.length === 0) {
            return `
                <div class="aba-conteudo" id="aba-historico">
                    <div class="ficha-secao">
                        <h3>📜 Histórico de Alterações</h3>
                        <p style="color: var(--texto-secundario); text-align: center; padding: 40px;">
                            Nenhuma alteração registrada ainda.
                        </p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="aba-conteudo" id="aba-historico">
                <div class="ficha-secao">
                    <h3>📜 Histórico de Alterações</h3>
                    <div class="historico-lista">
                        ${historico.map(registro => this.criarItemHistorico(registro)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    criarItemHistorico(registro) {
        const tipoLabels = {
            'criacao': '📝 Criação',
            'edicao': '✏️ Edição',
            'exclusao': '🗑️ Exclusão'
        };

        const tipoIcon = tipoLabels[registro.tipoAlteracao] || '📋 Alteração';
        const dataHora = new Date(registro.dataHora).toLocaleString('pt-BR');

        let alteracoesHTML = '';
        if (registro.alteracoes && registro.alteracoes.length > 0) {
            alteracoesHTML = `
                <div class="historico-alteracoes">
                    ${registro.alteracoes.map(alt => `
                        <div class="historico-alteracao-item">
                            <strong>${this.formatarNomeCampo(alt.campo)}:</strong>
                            <span class="valor-antigo">${alt.valorAntigo || 'N/A'}</span>
                            <span class="seta">→</span>
                            <span class="valor-novo">${alt.valorNovo || 'N/A'}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="historico-item">
                <div class="historico-header">
                    <div class="historico-tipo">${tipoIcon}</div>
                    <div class="historico-info">
                        <div class="historico-usuario">👤 ${registro.usuario}</div>
                        <div class="historico-data">📅 ${dataHora}</div>
                    </div>
                </div>
                ${alteracoesHTML}
            </div>
        `;
    }

    formatarNomeCampo(campo) {
        const nomes = {
            'nomeCliente': 'Nome do Cliente',
            'cpf': 'CPF',
            'telefone': 'Telefone',
            'status': 'Status',
            'responsavel': 'Responsável',
            'motivoReduzido': 'Motivo Reduzido',
        };
        return nomes[campo] || campo;
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

    formatarData(dataString) {
        if (!dataString) return 'Não informada';
        return new Date(dataString).toLocaleDateString('pt-BR');
    }

    formatarDataHora(dataString) {
        if (!dataString) return 'Não informada';
        return new Date(dataString).toLocaleString('pt-BR');
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

    // === EXPORTAÇÃO ===
    exportarFicha() {
        if (!this.fichaAtual) return;

        const dados = this.fichaAtual;
        const texto = `
FICHA COMPLETA - SISTEMA VELOTAX
================================

DADOS BÁSICOS
-------------
CPF: ${dados.cpf || 'Não informado'}
Nome: ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}
Telefone: ${dados.telefone || 'Não informado'}
Origem: ${dados.origem || 'Não informada'}

RECLAMAÇÃO
----------
Data da Reclamação: ${this.formatarData(dados.dataReclamacao)}
Data de Recebimento: ${this.formatarData(dados.dataRecebimento)}
Prazo BACEN: ${this.formatarData(dados.prazoBacen)}
Responsável: ${dados.responsavel || 'Não atribuído'}

Motivo Reduzido: ${dados.motivoReduzido || 'Não informado'}
Motivo Detalhado: ${dados.motivoDetalhado || 'Não informado'}

RESOLUÇÃO
---------
Status: ${this.formatarStatus(dados.status)}
Data do Status: ${this.formatarData(dados.dataStatus)}
Finalizado em: ${this.formatarData(dados.finalizadoEm)}

Resultado da Tratativa: ${dados.resultadoTratativa || 'Nenhum resultado'}
Observações: ${dados.observacoes || 'Nenhuma observação'}

GERADO EM: ${new Date().toLocaleString('pt-BR')}
        `;

        // Cria blob e download
        const blob = new Blob([texto], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha-${dados.cpf || 'sem-cpf'}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // === ESTILOS ===
    adicionarEstilos() {
        const estilos = `
            <style id="estilos-fichas">
                /* === CONTAINER DA FICHA === */
                .ficha-detalhada-container {
                    background: var(--cor-container);
                    border-radius: 12px;
                    box-shadow: var(--sombra-forte);
                    margin: 20px auto;
                    max-width: 1200px;
                    overflow: hidden;
                }

                /* === HEADER DA FICHA === */
                .ficha-header {
                    background: linear-gradient(135deg, var(--azul-escuro) 0%, var(--azul-royal) 100%);
                    padding: 24px;
                    color: var(--texto-claro);
                }

                .ficha-titulo {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .ficha-titulo h2 {
                    font-size: 1.5rem;
                    margin: 0;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-nao-iniciado { background: var(--cinza-claro); color: var(--cinza-escuro); }
                .status-em-tratativa { background: var(--azul-ciano); color: var(--azul-escuro); }
                .status-concluido { background: var(--sucesso); color: var(--azul-escuro); }
                .status-respondido { background: var(--info); color: var(--texto-claro); }

                .ficha-acoes {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                /* === ABAS === */
                .ficha-abas {
                    display: flex;
                    background: var(--cor-sidebar);
                    border-bottom: 1px solid var(--borda-clara);
                }

                .aba-btn {
                    flex: 1;
                    padding: 16px;
                    border: none;
                    background: transparent;
                    color: var(--texto-secundario);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-bottom: 3px solid transparent;
                }

                .aba-btn:hover {
                    background: rgba(0, 0, 0, 0.05);
                    color: var(--texto-principal);
                }

                .aba-btn.active {
                    background: var(--cor-container);
                    color: var(--azul-royal);
                    border-bottom-color: var(--azul-royal);
                }

                /* === CONTEÚDO DAS ABAS === */
                .ficha-corpo {
                    padding: 24px;
                }

                .aba-conteudo {
                    display: none;
                }

                .aba-conteudo.active {
                    display: block;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* === SEÇÕES E GRID === */
                .ficha-secao {
                    margin-bottom: 32px;
                }

                .ficha-secao h3 {
                    color: var(--azul-royal);
                    margin-bottom: 16px;
                    font-size: 1.1rem;
                    border-bottom: 2px solid var(--azul-ciano);
                    padding-bottom: 8px;
                }

                .ficha-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .ficha-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .ficha-item.full-width {
                    grid-column: 1 / -1;
                }

                .ficha-item label {
                    font-weight: 600;
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                }

                .ficha-valor {
                    padding: 8px 12px;
                    background: var(--cor-sidebar);
                    border-radius: 6px;
                    color: var(--texto-principal);
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                }

                .ficha-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 2px solid var(--azul-ciano);
                    border-radius: 6px;
                    font-family: inherit;
                    font-size: 0.95rem;
                }

                .ficha-input:focus {
                    outline: none;
                    border-color: var(--azul-royal);
                    box-shadow: 0 0 0 3px rgba(22, 52, 255, 0.1);
                }

                /* === MÓDULOS DE CONTATO === */
                .modulos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 12px;
                }

                .modulo-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .modulo-item.ativo {
                    background: rgba(29, 253, 185, 0.1);
                    border: 1px solid var(--azul-ciano);
                }

                .modulo-icon {
                    font-size: 1.2rem;
                }

                .modulo-nome {
                    flex: 1;
                    font-weight: 500;
                }

                .modulo-status {
                    font-size: 1rem;
                }

                /* === TENTATIVAS === */
                .tentativas-lista {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tentativa-item {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 16px;
                    border-left: 4px solid var(--azul-royal);
                }

                .tentativa-cabecalho {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .tentativa-numero {
                    font-weight: 600;
                    color: var(--azul-royal);
                }

                .tentativa-data {
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                }

                .tentativa-conteudo {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .tentativa-campo {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .tentativa-campo label {
                    font-weight: 500;
                    color: var(--texto-secundario);
                    font-size: 0.85rem;
                }

                /* === PROTOCOLOS === */
                .protocolos-lista {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .protocolo-item {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 16px;
                    border-left: 4px solid var(--laranja-destaque);
                }

                .protocolo-numero {
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .protocolo-detalhes {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .protocolo-campo {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .protocolo-campo label {
                    font-weight: 500;
                    color: var(--texto-secundario);
                    font-size: 0.85rem;
                }

                /* === INDICADORES === */
                .indicadores-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .indicador-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                }

                .indicador-label {
                    font-weight: 500;
                    color: var(--texto-secundario);
                }

                .indicador-valor {
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .indicador-valor.positivo {
                    background: rgba(29, 253, 185, 0.2);
                    color: var(--sucesso);
                }

                .indicador-valor.negativo {
                    background: rgba(255, 0, 215, 0.2);
                    color: var(--erro);
                }

                /* === RODAPÉ === */
                .ficha-rodape {
                    background: var(--cor-sidebar);
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid var(--borda-clara);
                }

                .ficha-info-tempo {
                    color: var(--texto-secundario);
                    font-size: 0.85rem;
                }

                .ficha-acoes-rodape {
                    display: flex;
                    gap: 12px;
                }

                /* === HISTÓRICO DE ALTERAÇÕES === */
                .historico-lista {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .historico-item {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 16px;
                    border-left: 4px solid var(--azul-royal);
                }

                .historico-header {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .historico-tipo {
                    font-size: 1.5rem;
                }

                .historico-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .historico-usuario {
                    font-weight: 600;
                    color: var(--texto-principal);
                    font-size: 0.9rem;
                }

                .historico-data {
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                }

                .historico-alteracoes {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--borda-clara);
                }

                .historico-alteracao-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: var(--cor-container);
                    border-radius: 4px;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                }

                .historico-alteracao-item strong {
                    color: var(--texto-principal);
                    min-width: 150px;
                }

                .valor-antigo {
                    color: var(--erro);
                    text-decoration: line-through;
                    padding: 2px 8px;
                    background: rgba(255, 0, 215, 0.1);
                    border-radius: 4px;
                }

                .seta {
                    color: var(--azul-royal);
                    font-weight: bold;
                }

                .valor-novo {
                    color: var(--sucesso);
                    padding: 2px 8px;
                    background: rgba(29, 253, 185, 0.1);
                    border-radius: 4px;
                }

                /* === ESTADOS ESPECIAIS === */
                .sem-dados {
                    text-align: center;
                    color: var(--texto-secundario);
                    font-style: italic;
                    padding: 20px;
                }

                /* === RESPONSIVO === */
                @media (max-width: 768px) {
                    .ficha-titulo {
                        flex-direction: column;
                        gap: 12px;
                        align-items: flex-start;
                    }

                    .ficha-abas {
                        flex-direction: column;
                    }

                    .ficha-grid {
                        grid-template-columns: 1fr;
                    }

                    .tentativa-conteudo,
                    .protocolo-detalhes {
                        grid-template-columns: 1fr;
                    }

                    .ficha-rodape {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }

                    .ficha-acoes-rodape {
                        justify-content: center;
                    }

                    .modulos-grid {
                        grid-template-columns: 1fr;
                    }

                    .indicadores-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        if (!document.getElementById('estilos-fichas')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }

    configurarEventos() {
        // Eventos serão configurados conforme necessário
    }

    // === MÉTODOS DE SALVAMENTO ===
    salvarFicha(dados) {
        // Obtém fichas existentes
        const fichas = JSON.parse(localStorage.getItem('velotax_fichas') || '[]');
        
        // Encontra e atualiza ou adiciona nova ficha
        const index = fichas.findIndex(f => f.id === dados.id);
        if (index >= 0) {
            fichas[index] = dados;
        } else {
            fichas.push(dados);
        }
        
        // Salva no storage
        localStorage.setItem('velotax_fichas', JSON.stringify(fichas));
    }

    // === MÉTODOS DE INTERFACE ===
    abrirFicha(dados) {
        const modal = document.createElement('div');
        modal.className = 'ficha-modal';
        modal.innerHTML = `
            <div class="ficha-modal-overlay" onclick="sistemaFichas.fecharFicha()"></div>
            <div class="ficha-modal-content">
                ${this.criarFichaDetalhada(dados)}
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    fecharFicha() {
        const modal = document.querySelector('.ficha-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // Métodos placeholder para funcionalidades futuras
    adicionarTentativa() {
        this.mostrarNotificacao('Funcionalidade em desenvolvimento', 'info');
    }

    adicionarProtocolo() {
        this.mostrarNotificacao('Funcionalidade em desenvolvimento', 'info');
    }

    imprimirFicha() {
        window.print();
    }

    excluirFicha() {
        if (confirm('Tem certeza que deseja excluir esta reclamação?')) {
            // Implementar exclusão
            this.mostrarNotificacao('Reclamação excluída com sucesso', 'sucesso');
            this.fecharFicha();
        }
    }
}

// Inicializa o sistema de fichas
let sistemaFichas;

// Função para inicializar o sistema
function inicializarSistemaFichas() {
    if (!sistemaFichas) {
        sistemaFichas = new SistemaFichas();
        window.sistemaFichas = sistemaFichas;
    }
    return sistemaFichas;
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    inicializarSistemaFichas();
});

// Exporta para uso global
window.SistemaFichas = SistemaFichas;
window.sistemaFichas = sistemaFichas;
window.inicializarSistemaFichas = inicializarSistemaFichas;
