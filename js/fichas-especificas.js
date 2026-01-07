/* === FICHAS ESPECÍFICAS POR TIPO DE DEMANDA === */
/* VERSÃO: v2.7.0 | DATA: 2025-02-01 | ALTERAÇÕES: Adicionar campo RDR na edição, listas e email das fichas BACEN */

class FichasEspecificas {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        this.adicionarEstilos();
    }

    // === FICHA BACEN ===
    criarFichaBacen(dados) {
        return `
            <div class="ficha-detalhada-container">
                <div class="ficha-header">
                    <div class="ficha-titulo">
                        <h2>🏦 Reclamação BACEN - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
                        <button class="btn-fechar" onclick="fichasEspecificas.fecharFicha()">✕</button>
                    </div>
                    <div class="ficha-status">
                        <span class="status-badge status-${dados.status || 'nao-iniciado'}">
                            ${this.formatarStatus(dados.status)}
                        </span>
                    </div>
                </div>

                <div class="ficha-conteudo-scroll">
                    <div class="ficha-secao">
                        <h3>📋 Dados Básicos</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Data de Entrada:</label>
                                <span class="ficha-valor editavel" data-campo="dataEntrada">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Finalizado em:</label>
                                <span class="ficha-valor editavel" data-campo="finalizadoEm">${this.formatarData(dados.finalizadoEm)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Responsável:</label>
                                <span class="ficha-valor editavel" data-campo="responsavel">${dados.responsavel || 'Não atribuído'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>👤 Dados do Cliente</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Nome Completo:</label>
                                <span class="ficha-valor editavel" data-campo="nomeCompleto">${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>CPF:</label>
                                <span class="ficha-valor editavel" data-campo="cpf">${dados.cpf || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Telefone:</label>
                                <span class="ficha-valor editavel" data-campo="telefone">${dados.telefone || 'Não informado'}</span>
                            </div>
                            <!-- Removido: Origem (não existe mais em chatbot) -->
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>🎯 Detalhes da Reclamação</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>RDR:</label>
                                <span class="ficha-valor editavel" data-campo="rdr">${dados.rdr || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Motivo Reduzido:</label>
                                <span class="ficha-valor editavel" data-campo="motivoReduzido">${dados.motivoReduzido || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Motivo da Reclamação:</label>
                                <span class="ficha-valor editavel" data-campo="motivoDetalhado">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Prazo BACEN:</label>
                                <span class="ficha-valor editavel" data-campo="prazoBacen">${this.formatarData(dados.prazoBacen || dados.prazoRetorno)}</span>
                            </div>
                        </div>
                        ${dados.anexos && dados.anexos.length > 0 ? `
                            <div class="ficha-item full-width">
                                <label>📎 Anexos (${dados.anexos.length}):</label>
                                <div id="anexos-ficha-bacen-${dados.id}" class="anexos-exibicao-container"></div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="ficha-secao">
                        <h3>🏦 Campos Específicos BACEN</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Acionou a central?</label>
                                <span class="ficha-valor editavel" data-campo="acionouCentral">${dados.acionouCentral ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>BACEN?</label>
                                <span class="ficha-valor editavel" data-campo="bacen">${dados.bacen ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Procon?</label>
                                <span class="ficha-valor editavel" data-campo="procon">${dados.procon ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>PIX liberado ou excluído?</label>
                                <span class="ficha-valor editavel" data-campo="pixStatus" data-tipo="select" data-opcoes='["Liberado","Excluído","Liberado para Retirada","Não Aplicável"]'>${dados.pixStatus || (dados.pixLiberado ? 'Liberado' : 'Excluído')}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Status do contrato</label>
                                <div style="display: flex; gap: 16px; margin-top: 8px;">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="ficha-status-contrato-quitado-${dados.id}" data-campo="statusContratoQuitado" ${dados.statusContratoQuitado ? 'checked' : ''} disabled>
                                        <span class="checkmark"></span>
                                        Quitado
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="ficha-status-contrato-aberto-${dados.id}" data-campo="statusContratoAberto" ${dados.statusContratoAberto ? 'checked' : ''} disabled>
                                        <span class="checkmark"></span>
                                        Em aberto
                                    </label>
                                </div>
                            </div>
                            <div class="ficha-item">
                                <label>Aceitou liquidação Antecipada?</label>
                                <span class="ficha-valor editavel" data-campo="liquidacaoAntecipada">${dados.liquidacaoAntecipada ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Enviar para cobrança?</label>
                                <span class="ficha-valor editavel" data-campo="enviarCobranca">${dados.enviarCobranca ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>✅ Resolução</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Status:</label>
                                <span class="ficha-valor editavel" data-campo="status" data-tipo="select" data-opcoes='["nao-iniciado","em-tratativa","concluido","respondido"]'>${this.formatarStatus(dados.status)}</span>
                            </div>
                            <div class="ficha-item">
                            </div>
                            <div class="ficha-item full-width">
                                <label>Observações:</label>
                                <span class="ficha-valor editavel" data-campo="observacoes">${dados.observacoes || 'Nenhuma observação'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ficha-rodape">
                    <button class="velohub-btn btn-primary" onclick="fichasEspecificas.toggleEdicao()">
                        ✏️ Editar Reclamação
                    </button>
                    <button class="velohub-btn btn-secondary" onclick="fichasEspecificas.salvarFicha()">
                        💾 Salvar Alterações
                    </button>
                    <button class="velohub-btn" style="background: #1DFDB9; color: #000058;" onclick="fichasEspecificas.copiarParaEmail()">
                        📧 Copiar para Email
                    </button>
                    <button class="velohub-btn" style="background: #FF00D7; color: white;" onclick="fichasEspecificas.excluirFicha()">
                        🗑️ Excluir Ficha
                    </button>
                </div>
            </div>
        `;
    }

    // === FICHA N2 ===
    criarFichaN2(dados) {
        return `
            <div class="ficha-detalhada-container">
                <div class="ficha-header">
                    <div class="ficha-titulo">
                        <h2>🔄 Reclamação N2 - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
                        <button class="btn-fechar" onclick="fichasEspecificas.fecharFicha()">✕</button>
                    </div>
                    <div class="ficha-status">
                        <span class="status-badge status-${dados.status || 'nao-iniciado'}">
                            ${this.formatarStatus(dados.status)}
                        </span>
                    </div>
                </div>

                <div class="ficha-conteudo-scroll">
                    <div class="ficha-secao">
                        <h3>📋 Dados Básicos</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Data de Entrada:</label>
                                <span class="ficha-valor editavel" data-campo="dataEntrada">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Finalizado em:</label>
                                <span class="ficha-valor editavel" data-campo="finalizadoEm">${this.formatarData(dados.finalizadoEm)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Responsável:</label>
                                <span class="ficha-valor editavel" data-campo="responsavel">${dados.responsavel || 'Não atribuído'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>👤 Dados do Cliente</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Nome Completo:</label>
                                <span class="ficha-valor editavel" data-campo="nomeCompleto">${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>CPF:</label>
                                <span class="ficha-valor editavel" data-campo="cpf">${dados.cpf || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Telefone:</label>
                                <span class="ficha-valor editavel" data-campo="telefone">${dados.telefone || 'Não informado'}</span>
                            </div>
                            <!-- Removido: Origem (não existe mais em chatbot) -->
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>🎯 Detalhes da Reclamação</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Motivo Reduzido:</label>
                                <span class="ficha-valor editavel" data-campo="motivoReduzido">${dados.motivoReduzido || 'Não informado'}</span>
                            </div>
                            <!-- Removido: Motivo da Reclamação e Prazo N2 (não existem mais em N2) -->
                        </div>
                        ${dados.anexos && dados.anexos.length > 0 ? `
                            <div class="ficha-item full-width">
                                <label>📎 Anexos (${dados.anexos.length}):</label>
                                <div id="anexos-ficha-n2-${dados.id}" class="anexos-exibicao-container"></div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="ficha-secao">
                        <h3>🔄 Campos Específicos N2</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Status Portabilidade:</label>
                                <span class="ficha-valor editavel" data-campo="statusPortabilidade" data-tipo="select" data-opcoes='["em-andamento","concluida","pendente","cancelada","em-analise","solicitada"]'>${this.formatarStatusPortabilidade(dados.statusPortabilidade) || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>N2 Portabilidade?</label>
                                <span class="ficha-valor editavel" data-campo="n2Portabilidade">${dados.n2Portabilidade ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Acionou a central?</label>
                                <span class="ficha-valor editavel" data-campo="acionouCentral">${dados.acionouCentral ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>PIX liberado ou excluído?</label>
                                <span class="ficha-valor editavel" data-campo="pixStatus" data-tipo="select" data-opcoes='["Liberado","Excluído","Liberado para Retirada","Não Aplicável"]'>${dados.pixStatus || (dados.pixLiberado ? 'Liberado' : 'Excluído')}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Status do contrato</label>
                                <div style="display: flex; gap: 16px; margin-top: 8px;">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="ficha-status-contrato-quitado-${dados.id}" data-campo="statusContratoQuitado" ${dados.statusContratoQuitado ? 'checked' : ''} disabled>
                                        <span class="checkmark"></span>
                                        Quitado
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="ficha-status-contrato-aberto-${dados.id}" data-campo="statusContratoAberto" ${dados.statusContratoAberto ? 'checked' : ''} disabled>
                                        <span class="checkmark"></span>
                                        Em aberto
                                    </label>
                                </div>
                            </div>
                            <div class="ficha-item">
                                <label>Enviar para cobrança?</label>
                                <span class="ficha-valor editavel" data-campo="enviarCobranca">${dados.enviarCobranca ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>✅ Resolução</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Status:</label>
                                <span class="ficha-valor editavel" data-campo="status" data-tipo="select" data-opcoes='["nao-iniciado","em-tratativa","concluido","respondido"]'>${this.formatarStatus(dados.status)}</span>
                            </div>
                            <div class="ficha-item">
                            </div>
                            <div class="ficha-item full-width">
                                <label>Observações:</label>
                                <span class="ficha-valor editavel" data-campo="observacoes">${dados.observacoes || 'Nenhuma observação'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ficha-rodape">
                    <button class="velohub-btn btn-primary" onclick="fichasEspecificas.toggleEdicao()">
                        ✏️ Editar Reclamação
                    </button>
                    <button class="velohub-btn btn-secondary" onclick="fichasEspecificas.salvarFicha()">
                        💾 Salvar Alterações
                    </button>
                    <button class="velohub-btn" style="background: #1DFDB9; color: #000058;" onclick="fichasEspecificas.copiarParaEmail()">
                        📧 Copiar para Email
                    </button>
                    <button class="velohub-btn" style="background: #FF00D7; color: white;" onclick="fichasEspecificas.excluirFicha()">
                        🗑️ Excluir Ficha
                    </button>
                </div>
            </div>
        `;
    }

    // === FICHA CHATBOT ===
    criarFichaChatbot(dados) {
        return `
            <div class="ficha-detalhada-container">
                <div class="ficha-header">
                    <div class="ficha-titulo">
                        <h2>🤖 Reclamação Chatbot - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
                        <button class="btn-fechar" onclick="fichasEspecificas.fecharFicha()">✕</button>
                    </div>
                    <div class="ficha-status">
                        <span class="status-badge status-${dados.status || 'nao-iniciado'}">
                            ${this.formatarStatus(dados.status)}
                        </span>
                    </div>
                </div>

                <div class="ficha-conteudo-scroll">
                    <div class="ficha-secao">
                        <h3>📋 Dados Básicos</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Data de Entrada:</label>
                                <span class="ficha-valor editavel" data-campo="dataEntrada">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Finalizado em:</label>
                                <span class="ficha-valor editavel" data-campo="finalizadoEm">${this.formatarData(dados.finalizadoEm)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Responsável:</label>
                                <span class="ficha-valor editavel" data-campo="responsavel">${dados.responsavel || 'Não atribuído'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>👤 Dados do Cliente</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Nome Completo:</label>
                                <span class="ficha-valor editavel" data-campo="nomeCompleto">${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>CPF:</label>
                                <span class="ficha-valor editavel" data-campo="cpf">${dados.cpf || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Telefone:</label>
                                <span class="ficha-valor editavel" data-campo="telefone">${dados.telefone || 'Não informado'}</span>
                            </div>
                            <!-- Removido: Origem (não existe mais em chatbot) -->
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>🎯 Detalhes da Reclamação</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Motivo Reduzido:</label>
                                <span class="ficha-valor editavel" data-campo="motivoReduzido">${dados.motivoReduzido || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Motivo da Reclamação:</label>
                                <span class="ficha-valor editavel" data-campo="motivoDetalhado">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Prazo Resposta:</label>
                                <span class="ficha-valor editavel" data-campo="prazoResposta">${this.formatarData(dados.prazoResposta || dados.prazoRetorno)}</span>
                            </div>
                        </div>
                        ${dados.anexos && dados.anexos.length > 0 ? `
                            <div class="ficha-item full-width">
                                <label>📎 Anexos (${dados.anexos.length}):</label>
                                <div id="anexos-ficha-chatbot-${dados.id}" class="anexos-exibicao-container"></div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="ficha-secao">
                        <h3>⭐ Detalhe da Avaliação</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Resposta do Bot</label>
                                <span class="ficha-valor editavel" data-campo="respostaBot">${dados.respostaBot || 'Não informado'}</span>
                            </div>
                            ${dados.respostaBot === 'Não' && dados.observacaoRespostaBot ? `
                            <div class="ficha-item full-width">
                                <label>Observação sobre Resposta do Bot</label>
                                <span class="ficha-valor editavel" data-campo="observacaoRespostaBot">${dados.observacaoRespostaBot || 'Nenhuma observação'}</span>
                            </div>
                            ` : ''}
                            <div class="ficha-item">
                                <label>Avaliação do Cliente:</label>
                                <span class="ficha-valor editavel" data-campo="avaliacaoCliente">${dados.avaliacaoCliente || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>🤖 Campos Específicos Chatbot</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Canal Chatbot:</label>
                                <span class="ficha-valor editavel" data-campo="canalChatbot">${dados.canalChatbot || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Satisfação (1-5):</label>
                                <span class="ficha-valor editavel" data-campo="satisfacao">${dados.satisfacao ? '⭐'.repeat(parseInt(dados.satisfacao)) + ' (' + dados.satisfacao + ')' : 'Não avaliado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Resolvido Automaticamente?</label>
                                <span class="ficha-valor editavel" data-campo="resolvidoAutomaticamente">${dados.resolvidoAutomaticamente ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Encaminhado para Humano?</label>
                                <span class="ficha-valor editavel" data-campo="encaminhadoHumano">${dados.encaminhadoHumano ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>PIX liberado ou excluído?</label>
                                <span class="ficha-valor editavel" data-campo="pixStatus" data-tipo="select" data-opcoes='["Liberado","Excluído","Liberado para Retirada","Não Aplicável"]'>${dados.pixStatus || (dados.pixLiberado ? 'Liberado' : 'Excluído')}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Enviar para cobrança?</label>
                                <span class="ficha-valor editavel" data-campo="enviarCobranca">${dados.enviarCobranca ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>✅ Resolução</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Status:</label>
                                <span class="ficha-valor editavel" data-campo="status" data-tipo="select" data-opcoes='["nao-iniciado","em-tratativa","concluido","respondido"]'>${this.formatarStatus(dados.status)}</span>
                            </div>
                            <div class="ficha-item">
                            </div>
                            <div class="ficha-item full-width">
                                <label>Observações:</label>
                                <span class="ficha-valor editavel" data-campo="observacoes">${dados.observacoes || 'Nenhuma observação'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ficha-rodape">
                    <button class="velohub-btn btn-primary" onclick="fichasEspecificas.toggleEdicao()">
                        ✏️ Editar Reclamação
                    </button>
                    <button class="velohub-btn btn-secondary" onclick="fichasEspecificas.salvarFicha()">
                        💾 Salvar Alterações
                    </button>
                    <button class="velohub-btn" style="background: #1DFDB9; color: #000058;" onclick="fichasEspecificas.copiarParaEmail()">
                        📧 Copiar para Email
                    </button>
                    <button class="velohub-btn" style="background: #FF00D7; color: white;" onclick="fichasEspecificas.excluirFicha()">
                        🗑️ Excluir Ficha
                    </button>
                </div>
            </div>
        `;
    }

    // === ABRIR FICHA ===
    abrirFicha(dados) {
        this.fichaAtual = dados;
        this.modoEdicao = false;
        
        const tipo = dados.tipoDemanda || 'bacen';
        let conteudo = '';
        
        if (tipo === 'bacen') {
            conteudo = this.criarFichaBacen(dados);
        } else if (tipo === 'n2') {
            conteudo = this.criarFichaN2(dados);
        } else if (tipo === 'chatbot') {
            conteudo = this.criarFichaChatbot(dados);
        } else {
            conteudo = this.criarFichaBacen(dados); // Fallback
        }
        
        const modal = document.createElement('div');
        modal.className = 'ficha-modal';
        modal.innerHTML = `
            <div class="ficha-modal-overlay" onclick="fichasEspecificas.fecharFicha()"></div>
            <div class="ficha-modal-content">
                ${conteudo}
            </div>
        `;

        document.body.appendChild(modal);
        // NÃO bloqueia o scroll do body, apenas do modal
        
        // Exibir anexos após criar a ficha
        setTimeout(() => {
            if (dados.anexos && dados.anexos.length > 0 && window.gerenciadorAnexos) {
                const tipo = dados.tipoDemanda || 'bacen';
                const containerId = `anexos-ficha-${tipo}-${dados.id}`;
                window.gerenciadorAnexos.exibirAnexosNaFicha(dados.anexos, containerId);
            }
        }, 100);
    }

    // === FECHAR FICHA ===
    fecharFicha() {
        const modal = document.querySelector('.ficha-modal');
        if (modal) {
            modal.remove();
        }
        this.fichaAtual = null;
        this.modoEdicao = false;
    }

    // === TOGGLE EDIÇÃO ===
    toggleEdicao() {
        this.modoEdicao = !this.modoEdicao;
        const valores = document.querySelectorAll('.ficha-valor.editavel');
        
        valores.forEach(elemento => {
            const campo = elemento.dataset.campo;
            const tipo = elemento.dataset.tipo;
            
            if (this.modoEdicao) {
                elemento.classList.add('editando');
                
                // Campos booleanos (Sim/Não) - converter para radio buttons
                const camposBooleanos = ['acionouCentral', 'bacen', 'procon', 'liquidacaoAntecipada', 
                                         'enviarCobranca', 'n2Portabilidade', 'resolvidoAutomaticamente', 
                                         'encaminhadoHumano'];
                
                if (camposBooleanos.includes(campo)) {
                    const valorAtual = elemento.textContent.trim();
                    const valorBoolean = valorAtual === 'Sim' || valorAtual === 'true' || valorAtual === true;
                    const nomeRadio = `ficha-${campo}-${this.fichaAtual.id}`;
                    
                    elemento.innerHTML = `
                        <div style="display: flex; gap: 16px;">
                            <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="${nomeRadio}" value="Sim" ${valorBoolean ? 'checked' : ''} style="cursor: pointer;">
                                <span>Sim</span>
                            </label>
                            <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="${nomeRadio}" value="Não" ${!valorBoolean ? 'checked' : ''} style="cursor: pointer;">
                                <span>Não</span>
                            </label>
                        </div>
                    `;
                }
                // Campos com select (PIX Status, Status, Status Portabilidade)
                else if (tipo === 'select') {
                    const valorAtual = elemento.textContent.trim();
                    let valorParaComparar = valorAtual;
                    
                    // Para status, comparar com valores formatados e não formatados
                    if (campo === 'status') {
                        const statusMap = {
                            'Não Iniciado': 'nao-iniciado',
                            'Em Tratativa': 'em-tratativa',
                            'Concluído': 'concluido',
                            'Respondido': 'respondido',
                            'Não definido': 'nao-iniciado'
                        };
                        valorParaComparar = statusMap[valorAtual] || valorAtual.toLowerCase().replace(/\s+/g, '-');
                    }
                    // Para statusPortabilidade, comparar com valores formatados e não formatados
                    else if (campo === 'statusPortabilidade') {
                        const portabilidadeMap = {
                            'Em Andamento': 'em-andamento',
                            'Concluída': 'concluida',
                            'Pendente': 'pendente',
                            'Cancelada': 'cancelada',
                            'Em Análise': 'em-analise',
                            'Solicitada': 'solicitada',
                            'Não informado': ''
                        };
                        valorParaComparar = portabilidadeMap[valorAtual] || valorAtual.toLowerCase().replace(/\s+/g, '-');
                    }
                    
                    const opcoes = JSON.parse(elemento.dataset.opcoes || '[]');
                    let optionsHTML = '<option value="">Selecione...</option>';
                    optionsHTML += opcoes.map(op => {
                        let selected = '';
                        if (campo === 'status') {
                            const opFormatado = this.formatarStatus(op);
                            selected = (valorParaComparar === op || valorAtual === opFormatado || valorParaComparar === op.toLowerCase()) ? 'selected' : '';
                        } else if (campo === 'statusPortabilidade') {
                            const opFormatado = this.formatarStatusPortabilidade(op);
                            selected = (valorParaComparar === op || valorAtual === opFormatado || valorParaComparar === op.toLowerCase()) ? 'selected' : '';
                        } else {
                            selected = valorAtual === op ? 'selected' : '';
                        }
                        return `<option value="${op}" ${selected}>${campo === 'status' ? this.formatarStatus(op) : campo === 'statusPortabilidade' ? this.formatarStatusPortabilidade(op) : op}</option>`;
                    }).join('');
                    elemento.innerHTML = `<select class="velohub-input" style="width: 100%; padding: 8px; border: 1px solid var(--azul-royal); border-radius: 4px; font-family: 'Poppins', sans-serif;">${optionsHTML}</select>`;
                }
                // Campos de data (incluindo finalizadoEm)
                else if (campo && (campo.includes('data') || campo.includes('Data') || campo.includes('prazo') || campo.includes('Prazo') || campo === 'finalizadoEm')) {
                    const valorAtual = elemento.textContent.trim();
                    let dataISO = '';
                    if (valorAtual && valorAtual !== 'Não informada' && valorAtual !== 'Não informado') {
                        const dataBR = valorAtual.split('/');
                        if (dataBR.length === 3) {
                            dataISO = `${dataBR[2]}-${dataBR[1].padStart(2, '0')}-${dataBR[0].padStart(2, '0')}`;
                        } else if (valorAtual.includes('-')) {
                            dataISO = valorAtual.split('T')[0]; // Se já estiver em formato ISO
                        }
                    }
                    const inputId = `ficha-input-${campo}-${this.fichaAtual?.id || 'temp'}`;
                    elemento.innerHTML = `<input type="date" id="${inputId}" class="velohub-input" value="${dataISO}" style="width: 100%; padding: 8px; border: 1px solid var(--azul-royal); border-radius: 4px;" onchange="fichasEspecificas.validarDataInput(this, '${campo}')">`;
                    
                    // Adicionar validação em tempo real
                    setTimeout(() => {
                        const input = document.getElementById(inputId);
                        if (input) {
                            input.addEventListener('blur', function() {
                                fichasEspecificas.validarDataInput(this, campo);
                            });
                        }
                    }, 100);
                }
                // Campo observações - textarea
                else if (campo === 'observacoes') {
                    const valorAtual = elemento.textContent.trim();
                    elemento.innerHTML = `<textarea class="velohub-input" rows="4" style="width: 100%; padding: 8px; border: 1px solid var(--azul-royal); border-radius: 4px; font-family: 'Poppins', sans-serif; resize: vertical;">${this.escapeHtml(valorAtual === 'Nenhuma observação' ? '' : valorAtual)}</textarea>`;
                }
                // Campos de texto normais
                else {
                    const valorAtual = elemento.textContent.trim();
                    elemento.innerHTML = `<input type="text" class="velohub-input" value="${this.escapeHtml(valorAtual)}" style="width: 100%; padding: 8px; border: 1px solid var(--azul-royal); border-radius: 4px; font-family: 'Poppins', sans-serif;">`;
                }
            } else {
                // Sair do modo edição - restaurar valores
                elemento.classList.remove('editando');
                
                // Radio buttons
                const radio = elemento.querySelector('input[type="radio"]:checked');
                if (radio) {
                    elemento.textContent = radio.value;
                }
                // Select
                else {
                    const select = elemento.querySelector('select');
                    if (select) {
                        if (campo === 'status') {
                            elemento.textContent = this.formatarStatus(select.value);
                        } else if (campo === 'statusPortabilidade') {
                            elemento.textContent = this.formatarStatusPortabilidade(select.value);
                        } else {
                            elemento.textContent = select.value || 'Não informado';
                        }
                    }
                    // Input date
                    else {
                        const inputDate = elemento.querySelector('input[type="date"]');
                        if (inputDate) {
                            const dataISO = inputDate.value;
                            if (dataISO) {
                                const [ano, mes, dia] = dataISO.split('-');
                                elemento.textContent = `${dia}/${mes}/${ano}`;
                            } else {
                                elemento.textContent = 'Não informada';
                            }
                        }
                        // Textarea
                        else {
                            const textarea = elemento.querySelector('textarea');
                            if (textarea) {
                                const valor = textarea.value.trim();
                                elemento.textContent = valor || 'Nenhuma observação';
                            }
                            // Input text
                            else {
                                const input = elemento.querySelector('input[type="text"]');
                                if (input) {
                                    elemento.textContent = input.value.trim() || 'Não informado';
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Atualizar checkboxes de status do contrato
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-campo]');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = !this.modoEdicao;
        });
        
        const btnEditar = document.querySelector('.ficha-rodape .btn-primary');
        if (btnEditar) {
            btnEditar.textContent = this.modoEdicao ? '✏️ Cancelar Edição' : '✏️ Editar Reclamação';
        }
    }
    
    // Função auxiliar para escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // === VALIDAR DATA ===
    validarDataInput(input, campo) {
        if (!input || !input.value) {
            // Data vazia é válida (opcional)
            input.style.borderColor = 'var(--azul-royal)';
            input.style.backgroundColor = '';
            return true;
        }
        
        const dataISO = input.value;
        const [ano, mes, dia] = dataISO.split('-').map(Number);
        
        // Validar se a data é válida
        const data = new Date(ano, mes - 1, dia);
        const dataValida = data.getFullYear() === ano && 
                          data.getMonth() === mes - 1 && 
                          data.getDate() === dia;
        
        // Validar se não é muito antiga (antes de 1900)
        const dataMinima = new Date(1900, 0, 1);
        const naoMuitoAntiga = data >= dataMinima;
        
        // Validar se não é muito futura (até 1 ano no futuro permitido)
        const hoje = new Date();
        const limiteFuturo = new Date();
        limiteFuturo.setFullYear(limiteFuturo.getFullYear() + 1);
        const naoMuitoFutura = data <= limiteFuturo;
        
        if (!dataValida) {
            input.style.borderColor = '#FF0000';
            input.style.backgroundColor = '#FFE5E5';
            this.mostrarNotificacao('Data inválida. Verifique o formato.', 'erro');
            return false;
        }
        
        if (!naoMuitoAntiga) {
            input.style.borderColor = '#FF8800';
            input.style.backgroundColor = '#FFF5E5';
            this.mostrarNotificacao('Data muito antiga. Use uma data a partir de 1900.', 'erro');
            return false;
        }
        
        if (!naoMuitoFutura) {
            input.style.borderColor = '#FF8800';
            input.style.backgroundColor = '#FFF5E5';
            this.mostrarNotificacao('Data muito distante no futuro. Use uma data até 1 ano à frente.', 'erro');
            return false;
        }
        
        // Data válida
        input.style.borderColor = '#00AA00';
        input.style.backgroundColor = '#E5FFE5';
        setTimeout(() => {
            input.style.borderColor = 'var(--azul-royal)';
            input.style.backgroundColor = '';
        }, 2000);
        
        return true;
    }

    // === SALVAR FICHA ===
    async salvarFicha() {
        if (!this.fichaAtual) return;
        
        const valores = document.querySelectorAll('.ficha-valor.editavel');
        const alteracoes = {};
        
        valores.forEach(elemento => {
            const campo = elemento.dataset.campo;
            const valorAntigo = this.fichaAtual[campo];
            let valorNovo;
            
            // Radio buttons (campos booleanos Sim/Não)
            const radio = elemento.querySelector('input[type="radio"]:checked');
            if (radio) {
                valorNovo = radio.value === 'Sim';
            }
            // Select (Status, PIX Status, Status Portabilidade)
            else {
                const select = elemento.querySelector('select');
                if (select) {
                    valorNovo = select.value;
                    // Para status e statusPortabilidade, o valor já está no formato correto (nao-iniciado, em-tratativa, em-andamento, etc)
                }
                    // Input date (incluindo finalizadoEm)
                    else {
                        const inputDate = elemento.querySelector('input[type="date"]');
                        if (inputDate) {
                            // Validar data antes de salvar
                            if (inputDate.value && !this.validarDataInput(inputDate, campo)) {
                                // Se a validação falhar, não salvar
                                return;
                            }
                            valorNovo = inputDate.value || null;
                        }
                    // Textarea (observações)
                    else {
                        const textarea = elemento.querySelector('textarea');
                        if (textarea) {
                            valorNovo = textarea.value.trim();
                        }
                        // Input text
                        else {
                            const input = elemento.querySelector('input[type="text"]');
                            if (input) {
                                valorNovo = input.value.trim();
                            } else {
                                valorNovo = elemento.textContent.trim();
                            }
                        }
                    }
                }
            }
            
            // Para pixStatus, mantém como string e também atualiza pixLiberado para compatibilidade
            if (campo === 'pixStatus') {
                this.fichaAtual.pixLiberado = valorNovo === 'Liberado';
            }
            
            // Converte datas de formato BR para ISO se necessário (incluindo finalizadoEm)
            if (campo && (campo.includes('data') || campo.includes('Data') || campo.includes('prazo') || campo.includes('Prazo') || campo === 'finalizadoEm')) {
                if (valorNovo && !valorNovo.includes('-') && valorNovo.includes('/')) {
                    const [dia, mes, ano] = valorNovo.split('/');
                    if (dia && mes && ano) {
                        valorNovo = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                    }
                }
            }
            
            if (valorNovo !== valorAntigo && valorNovo !== '') {
                alteracoes[campo] = valorNovo;
                this.fichaAtual[campo] = valorNovo;
            }
        });
        
        // Capturar checkboxes de status do contrato
        const checkboxQuitado = document.getElementById(`ficha-status-contrato-quitado-${this.fichaAtual.id}`);
        const checkboxAberto = document.getElementById(`ficha-status-contrato-aberto-${this.fichaAtual.id}`);
        
        if (checkboxQuitado && checkboxQuitado.checked !== this.fichaAtual.statusContratoQuitado) {
            alteracoes.statusContratoQuitado = checkboxQuitado.checked;
            this.fichaAtual.statusContratoQuitado = checkboxQuitado.checked;
        }
        if (checkboxAberto && checkboxAberto.checked !== this.fichaAtual.statusContratoAberto) {
            alteracoes.statusContratoAberto = checkboxAberto.checked;
            this.fichaAtual.statusContratoAberto = checkboxAberto.checked;
        }
        
        if (Object.keys(alteracoes).length > 0) {
            // Salvar diretamente no Firebase via armazenamentoReclamacoes
            const tipo = this.fichaAtual.tipoDemanda || 'bacen';
            
            try {
                if (window.armazenamentoReclamacoes) {
                    // Atualizar ficha completa com as alterações
                    const fichaAtualizada = { ...this.fichaAtual, ...alteracoes };
                    await window.armazenamentoReclamacoes.salvar(tipo, fichaAtualizada);
                    this.fichaAtual = fichaAtualizada;
                    
                    // Disparar evento para atualizar dashboards
                    window.dispatchEvent(new CustomEvent('reclamacaoSalva', {
                        detail: { tipo: tipo, reclamacao: fichaAtualizada, origem: 'edicao' }
                    }));
                    
                    this.mostrarNotificacao('Ficha salva com sucesso!', 'sucesso');
                } else {
                    console.error('❌ armazenamentoReclamacoes não disponível');
                    this.mostrarNotificacao('Erro: Sistema de armazenamento não disponível', 'erro');
                }
            } catch (error) {
                console.error('❌ Erro ao salvar ficha:', error);
                this.mostrarNotificacao('Erro ao salvar: ' + error.message, 'erro');
            }
            
            this.toggleEdicao();
            
            // Recarrega a lista se estiver em uma página específica
            setTimeout(() => {
                if (typeof renderizarListaBacen === 'function') renderizarListaBacen();
                if (typeof renderizarListaN2 === 'function') renderizarListaN2();
                if (typeof renderizarListaChatbot === 'function') renderizarListaChatbot();
            }, 500);
        } else {
            this.mostrarNotificacao('Nenhuma alteração detectada', 'info');
        }
    }

    // === EXCLUIR FICHA ===
    async excluirFicha() {
        if (!this.fichaAtual) return;
        
        const tipo = this.fichaAtual.tipoDemanda || 'bacen';
        const nomeCliente = this.fichaAtual.nomeCompleto || this.fichaAtual.nomeCliente || 'esta ficha';
        
        if (!confirm(`Tem certeza que deseja excluir a ficha de ${nomeCliente}?\n\nEsta ação não pode ser desfeita!`)) {
            return;
        }
        
        try {
            // Excluir do Firebase
            if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
                const sucesso = await window.firebaseDB.excluir(tipo, this.fichaAtual.id);
                if (sucesso) {
                    console.log(`✅ Ficha ${this.fichaAtual.id} excluída do Firebase`);
                } else {
                    throw new Error('Falha ao excluir do Firebase');
                }
            } else if (window.armazenamentoReclamacoes && window.armazenamentoReclamacoes.firebaseDB) {
                // Tentar via armazenamentoReclamacoes se disponível
                if (window.armazenamentoReclamacoes.firebaseDB.excluir) {
                    const sucesso = await window.armazenamentoReclamacoes.firebaseDB.excluir(tipo, this.fichaAtual.id);
                    if (sucesso) {
                        console.log(`✅ Ficha ${this.fichaAtual.id} excluída do Firebase via armazenamentoReclamacoes`);
                    } else {
                        throw new Error('Falha ao excluir do Firebase via armazenamentoReclamacoes');
                    }
                } else {
                    // Fallback: usar diretamente
                    const caminho = `fichas_${tipo}/${this.fichaAtual.id}`;
                    if (window.armazenamentoReclamacoes.firebaseDB.database) {
                        await window.armazenamentoReclamacoes.firebaseDB.database.ref(caminho).remove();
                        console.log(`✅ Ficha ${this.fichaAtual.id} excluída do Firebase via armazenamentoReclamacoes (fallback)`);
                    }
                }
            } else {
                console.warn('⚠️ Firebase não disponível para exclusão');
            }
            
            // Também remover do localStorage se existir
            const chaves = [
                `velotax_reclamacoes_${tipo}`,
                `velotax_demandas_${tipo}`,
                `${tipo}-complaints`
            ];
            
            chaves.forEach(chave => {
                const dados = localStorage.getItem(chave);
                if (dados) {
                    try {
                        const fichas = JSON.parse(dados);
                        if (Array.isArray(fichas)) {
                            const fichasFiltradas = fichas.filter(f => f.id !== this.fichaAtual.id);
                            localStorage.setItem(chave, JSON.stringify(fichasFiltradas));
                        }
                    } catch (e) {
                        console.warn(`⚠️ Erro ao remover do localStorage ${chave}:`, e);
                    }
                }
            });
            
            // Disparar evento para atualizar dashboards
            window.dispatchEvent(new CustomEvent('reclamacaoSalva', {
                detail: { tipo: tipo, acao: 'exclusao', id: this.fichaAtual.id }
            }));
            
            this.mostrarNotificacao('Ficha excluída com sucesso!', 'sucesso');
            
            // Fechar modal e recarregar listas
            this.fecharFicha();
            
            setTimeout(() => {
                if (typeof renderizarListaBacen === 'function') renderizarListaBacen();
                if (typeof renderizarListaN2 === 'function') renderizarListaN2();
                if (typeof renderizarListaChatbot === 'function') renderizarListaChatbot();
            }, 500);
        } catch (error) {
            console.error('❌ Erro ao excluir ficha:', error);
            this.mostrarNotificacao('Erro ao excluir: ' + error.message, 'erro');
        }
    }

    // === COPIAR PARA EMAIL ===
    copiarParaEmail() {
        if (!this.fichaAtual) return;
        
        const tipo = this.fichaAtual.tipoDemanda || 'bacen';
        let emailHTML = '';
        
        if (tipo === 'bacen') {
            emailHTML = this.formatarEmailBacen(this.fichaAtual);
        } else if (tipo === 'n2') {
            emailHTML = this.formatarEmailN2(this.fichaAtual);
        } else if (tipo === 'chatbot') {
            emailHTML = this.formatarEmailChatbot(this.fichaAtual);
        }
        
        // Copia para clipboard usando API moderna ou fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            // Tenta copiar como texto HTML primeiro
            navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([emailHTML], { type: 'text/html' }),
                    'text/plain': new Blob([this.htmlParaTexto(emailHTML)], { type: 'text/plain' })
                })
            ]).then(() => {
                this.mostrarNotificacao('Conteúdo copiado para área de transferência! Cole no seu email.', 'sucesso');
            }).catch(() => {
                // Fallback: copia como texto simples
                this.copiarTextoFallback(emailHTML);
            });
        } else {
            // Fallback para navegadores antigos
            this.copiarTextoFallback(emailHTML);
        }
    }
    
    copiarTextoFallback(html) {
        const textArea = document.createElement('textarea');
        textArea.value = this.htmlParaTexto(html);
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.mostrarNotificacao('Conteúdo copiado! Cole no seu email (formatação HTML preservada).', 'sucesso');
        } catch (err) {
            // Último fallback: abre em nova janela
            const popup = window.open('', '_blank');
            popup.document.write(html);
            this.mostrarNotificacao('Conteúdo aberto em nova janela. Copie manualmente.', 'info');
        }
        
        document.body.removeChild(textArea);
    }
    
    htmlParaTexto(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
    
    formatarEmailBacen(dados) {
        return `<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #1634FF; border-bottom: 2px solid #1634FF; padding-bottom: 10px; }
        .secao { margin: 20px 0; }
        .campo { margin: 10px 0; }
        .label { font-weight: bold; color: #000058; }
        .valor { margin-left: 10px; }
        .destaque { background: #f0f0f0; padding: 15px; border-left: 4px solid #1634FF; margin: 10px 0; }
    </style>
</head>
<body>
    <h2>🏦 FICHA BACEN - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
    
    <div class="secao">
        <h3><strong>📋 DADOS BÁSICOS</strong></h3>
        <div class="campo"><span class="label">Data de Entrada:</span> <span class="valor">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span></div>
        <div class="campo"><span class="label">Finalizado em:</span> <span class="valor">${this.formatarData(dados.finalizadoEm)}</span></div>
        <div class="campo"><span class="label">Responsável:</span> <span class="valor"><strong>${dados.responsavel || 'Não atribuído'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>👤 DADOS DO CLIENTE</strong></h3>
        <div class="campo"><span class="label">Nome Completo:</span> <span class="valor"><strong>${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">CPF:</span> <span class="valor"><strong>${dados.cpf || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Telefone:</span> <span class="valor">${dados.telefone || 'Não informado'}</span></div>
        <div class="campo"><span class="label">Origem:</span> <span class="valor">${dados.origem || 'Não informado'}</span></div>
    </div>
    
    <div class="secao">
        <h3><strong>🎯 DETALHES DA RECLAMAÇÃO</strong></h3>
        <div class="destaque">
            <div class="campo"><span class="label">RDR:</span> <span class="valor"><strong>${dados.rdr || 'Não informado'}</strong></span></div>
            <div class="campo"><span class="label">Motivo Reduzido:</span> <span class="valor"><strong>${dados.motivoReduzido || 'Não informado'}</strong></span></div>
            <div class="campo"><span class="label">Motivo da Reclamação:</span> <span class="valor">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span></div>
            <div class="campo"><span class="label">Prazo BACEN:</span> <span class="valor"><strong>${this.formatarData(dados.prazoBacen || dados.prazoRetorno)}</strong></span></div>
        </div>
    </div>
    
    <div class="secao">
        <h3><strong>🏦 CAMPOS ESPECÍFICOS BACEN</strong></h3>
        <div class="campo"><span class="label">Acionou a central?</span> <span class="valor"><strong>${dados.acionouCentral ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">BACEN?</span> <span class="valor"><strong>${dados.bacen ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Procon?</span> <span class="valor"><strong>${dados.procon ? 'Sim ⚠️' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">PIX liberado ou excluído?</span> <span class="valor"><strong>${dados.pixLiberado ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Aceitou liquidação Antecipada?</span> <span class="valor"><strong>${dados.liquidacaoAntecipada ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Enviar para cobrança?</span> <span class="valor"><strong>${dados.enviarCobranca ? 'Sim' : 'Não'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>✅ RESOLUÇÃO</strong></h3>
        <div class="campo"><span class="label">Status:</span> <span class="valor"><strong>${this.formatarStatus(dados.status)}</strong></span></div>
        <div class="campo"><span class="label">Observações:</span> <span class="valor">${dados.observacoes || 'Nenhuma observação'}</span></div>
    </div>
    
    <hr>
    <p style="font-size: 0.9em; color: #666;">Sistema Velotax - Gestão de Demandas BACEN</p>
</body>
</html>`;
    }
    
    formatarEmailN2(dados) {
        return `<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #1DFDB9; border-bottom: 2px solid #1DFDB9; padding-bottom: 10px; }
        .secao { margin: 20px 0; }
        .campo { margin: 10px 0; }
        .label { font-weight: bold; color: #000058; }
        .valor { margin-left: 10px; }
        .destaque { background: #f0f0f0; padding: 15px; border-left: 4px solid #1DFDB9; margin: 10px 0; }
    </style>
</head>
<body>
    <h2>🔄 FICHA N2 - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
    
    <div class="secao">
        <h3><strong>📋 DADOS BÁSICOS</strong></h3>
        <div class="campo"><span class="label">Data de Entrada:</span> <span class="valor">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span></div>
        <div class="campo"><span class="label">Finalizado em:</span> <span class="valor">${this.formatarData(dados.finalizadoEm)}</span></div>
        <div class="campo"><span class="label">Responsável:</span> <span class="valor"><strong>${dados.responsavel || 'Não atribuído'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>👤 DADOS DO CLIENTE</strong></h3>
        <div class="campo"><span class="label">Nome Completo:</span> <span class="valor"><strong>${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">CPF:</span> <span class="valor"><strong>${dados.cpf || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Telefone:</span> <span class="valor">${dados.telefone || 'Não informado'}</span></div>
        <div class="campo"><span class="label">Origem:</span> <span class="valor">${dados.origem || 'Não informado'}</span></div>
    </div>
    
    <div class="secao">
        <h3><strong>🎯 DETALHES DA RECLAMAÇÃO</strong></h3>
        <div class="destaque">
            <div class="campo"><span class="label">Motivo:</span> <span class="valor"><strong>${dados.motivoReduzido || 'Não informado'}</strong></span></div>
            <!-- Removido: Motivo da Reclamação e Prazo N2 (não existem mais em N2) -->
        </div>
    </div>
    
    <div class="secao">
        <h3><strong>🔄 CAMPOS ESPECÍFICOS N2</strong></h3>
        <div class="campo"><span class="label">N2 Portabilidade?</span> <span class="valor"><strong>${dados.n2Portabilidade ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Acionou a central?</span> <span class="valor"><strong>${dados.acionouCentral ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">PIX liberado ou excluído?</span> <span class="valor"><strong>${dados.pixLiberado ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Enviar para cobrança?</span> <span class="valor"><strong>${dados.enviarCobranca ? 'Sim' : 'Não'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>✅ RESOLUÇÃO</strong></h3>
        <div class="campo"><span class="label">Status:</span> <span class="valor"><strong>${this.formatarStatus(dados.status)}</strong></span></div>
        <div class="campo"><span class="label">Observações:</span> <span class="valor">${dados.observacoes || 'Nenhuma observação'}</span></div>
    </div>
    
    <hr>
    <p style="font-size: 0.9em; color: #666;">Sistema Velotax - Gestão de Demandas N2</p>
</body>
</html>`;
    }
    
    formatarEmailChatbot(dados) {
        return `<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #FF8400; border-bottom: 2px solid #FF8400; padding-bottom: 10px; }
        .secao { margin: 20px 0; }
        .campo { margin: 10px 0; }
        .label { font-weight: bold; color: #000058; }
        .valor { margin-left: 10px; }
        .destaque { background: #f0f0f0; padding: 15px; border-left: 4px solid #FF8400; margin: 10px 0; }
    </style>
</head>
<body>
    <h2>🤖 FICHA CHATBOT - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
    
    <div class="secao">
        <h3><strong>📋 DADOS BÁSICOS</strong></h3>
        <div class="campo"><span class="label">Data de Entrada:</span> <span class="valor">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span></div>
        <div class="campo"><span class="label">Finalizado em:</span> <span class="valor">${this.formatarData(dados.finalizadoEm)}</span></div>
        <div class="campo"><span class="label">Responsável:</span> <span class="valor"><strong>${dados.responsavel || 'Não atribuído'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>👤 DADOS DO CLIENTE</strong></h3>
        <div class="campo"><span class="label">Nome Completo:</span> <span class="valor"><strong>${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">CPF:</span> <span class="valor"><strong>${dados.cpf || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Telefone:</span> <span class="valor">${dados.telefone || 'Não informado'}</span></div>
        <!-- Removido: Origem (não existe mais em chatbot) -->
    </div>
    
    <div class="secao">
        <h3><strong>🎯 DETALHES DA RECLAMAÇÃO</strong></h3>
        <div class="destaque">
            <div class="campo"><span class="label">Motivo Reduzido:</span> <span class="valor"><strong>${dados.motivoReduzido || 'Não informado'}</strong></span></div>
            <div class="campo"><span class="label">Motivo da Reclamação:</span> <span class="valor">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span></div>
            <div class="campo"><span class="label">Prazo Resposta:</span> <span class="valor"><strong>${this.formatarData(dados.prazoResposta || dados.prazoRetorno)}</strong></span></div>
        </div>
    </div>
    
    <div class="secao">
        <h3><strong>🤖 CAMPOS ESPECÍFICOS CHATBOT</strong></h3>
        <div class="campo"><span class="label">Canal Chatbot:</span> <span class="valor"><strong>${dados.canalChatbot || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Satisfação (1-5):</span> <span class="valor"><strong>${dados.satisfacao ? '⭐'.repeat(parseInt(dados.satisfacao)) + ' (' + dados.satisfacao + ')' : 'Não avaliado'}</strong></span></div>
        <div class="campo"><span class="label">Resolvido Automaticamente?</span> <span class="valor"><strong>${dados.resolvidoAutomaticamente ? 'Sim ✅' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Encaminhado para Humano?</span> <span class="valor"><strong>${dados.encaminhadoHumano ? 'Sim 👤' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">PIX liberado ou excluído?</span> <span class="valor"><strong>${dados.pixLiberado ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Enviar para cobrança?</span> <span class="valor"><strong>${dados.enviarCobranca ? 'Sim' : 'Não'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>✅ RESOLUÇÃO</strong></h3>
        <div class="campo"><span class="label">Status:</span> <span class="valor"><strong>${this.formatarStatus(dados.status)}</strong></span></div>
        <div class="campo"><span class="label">Observações:</span> <span class="valor">${dados.observacoes || 'Nenhuma observação'}</span></div>
    </div>
    
    <hr>
    <p style="font-size: 0.9em; color: #666;">Sistema Velotax - Gestão de Demandas Chatbot</p>
</body>
</html>`;
    }

    // === UTILITÁRIOS ===
    formatarData(dataString) {
        if (!dataString) return 'Não informada';
        try {
            return new Date(dataString).toLocaleDateString('pt-BR');
        } catch {
            return dataString;
        }
    }
    
    formatarStatus(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'resolvido': 'Resolvido',
            'cancelado': 'Cancelado',
            'aguardando': 'Aguardando',
            'finalizado': 'Finalizado'
        };
        return statusMap[status] || status || 'Não informado';
    }
    
    mostrarNotificacao(mensagem, tipo = 'info') {
        // Cria uma notificação simples
        const notificacao = document.createElement('div');
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'sucesso' ? '#1DFDB9' : tipo === 'erro' ? '#FF00D7' : '#1634FF'};
            color: ${tipo === 'sucesso' ? '#000058' : '#FFFFFF'};
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            max-width: 400px;
        `;
        notificacao.textContent = mensagem;
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.style.opacity = '0';
            notificacao.style.transition = 'opacity 0.3s';
            setTimeout(() => notificacao.remove(), 300);
        }, 3000);
    }

    formatarStatus(status) {
        const statusMap = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'respondido': 'Respondido',
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'resolvido': 'Resolvido',
            'cancelado': 'Cancelado',
            'aguardando': 'Aguardando',
            'finalizado': 'Finalizado'
        };
        return statusMap[status] || status || 'Não definido';
    }

    formatarStatusPortabilidade(status) {
        const portabilidadeMap = {
            'solicitada': 'Solicitada',
            'em-andamento': 'Em Andamento',
            'concluida': 'Concluída',
            'cancelada': 'Cancelada',
            'pendente': 'Pendente',
            'em-analise': 'Em Análise'
        };
        return portabilidadeMap[status] || status || 'Não informado';
    }

    mostrarNotificacao(mensagem, tipo) {
        const notif = document.createElement('div');
        notif.className = `notificacao notificacao-${tipo}`;
        notif.textContent = mensagem;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${tipo === 'sucesso' ? '#1DFDB9' : tipo === 'erro' ? '#FF8400' : '#1634FF'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    // === ESTILOS ===
    adicionarEstilos() {
        if (document.getElementById('estilos-fichas-especificas')) return;
        
        const estilos = `
            <style id="estilos-fichas-especificas">
                .ficha-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .ficha-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }

                .ficha-modal-content {
                    position: relative;
                    width: 90%;
                    max-width: 1000px;
                    max-height: 90vh;
                    background: var(--cor-container);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 10000;
                }

                .ficha-detalhada-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .ficha-header {
                    background: linear-gradient(135deg, var(--azul-escuro) 0%, var(--azul-royal) 100%);
                    padding: 24px;
                    color: white;
                    flex-shrink: 0;
                }

                .ficha-titulo {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .ficha-titulo h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .btn-fechar {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                .btn-fechar:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                .ficha-conteudo-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    max-height: calc(90vh - 200px);
                }

                .ficha-secao {
                    margin-bottom: 32px;
                }

                .ficha-secao h3 {
                    color: var(--azul-royal);
                    font-size: 1.2rem;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid var(--borda-clara);
                }

                .ficha-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
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
                    color: var(--texto-principal);
                    font-size: 1rem;
                    padding: 8px;
                    border-radius: 4px;
                    min-height: 24px;
                }
                
                /* === TEMA ESCURO - FICHA DETALHADA === */
                .dark .ficha-detalhada-container {
                    background: var(--cor-card-escuro);
                    color: var(--texto-claro);
                }
                
                .dark .ficha-header {
                    background: var(--cor-sidebar);
                    border-bottom: 1px solid var(--borda-escura);
                }
                
                .dark .ficha-titulo h2 {
                    color: var(--texto-claro);
                }
                
                .dark .ficha-secao h3 {
                    color: var(--azul-ciano);
                    border-bottom-color: var(--borda-escura);
                }
                
                .dark .ficha-item label {
                    color: var(--texto-secundario-escuro);
                }
                
                .dark .ficha-valor {
                    color: var(--texto-claro);
                    background: var(--cor-container-escuro);
                }
                
                .dark .ficha-rodape {
                    background: var(--cor-container-escuro);
                    border-top-color: var(--borda-escura);
                }
                
                .dark .ficha-conteudo-scroll {
                    background: var(--cor-card-escuro);
                }
                
                .dark .ficha-modal-content {
                    background: var(--cor-card-escuro);
                }
                
                .dark .ficha-modal-overlay {
                    background: rgba(0, 0, 0, 0.85);
                }
                
                .dark .ficha-rodape .velohub-btn {
                    color: var(--texto-claro);
                }
                
                .dark .ficha-rodape .velohub-btn.btn-primary {
                    background: var(--azul-royal);
                    color: white;
                }
                
                .dark .ficha-rodape .velohub-btn.btn-secondary {
                    background: var(--azul-ciano);
                    color: var(--azul-escuro);
                }

                .ficha-valor.editando {
                    background: var(--cor-container);
                    border: 2px solid var(--azul-royal);
                    outline: none;
                }

                .ficha-valor:focus {
                    outline: 2px solid var(--azul-royal);
                    outline-offset: 2px;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: inline-block;
                }

                .status-nao-iniciado { background: #ECECEC; color: #272A30; }
                .status-em-tratativa { background: #FF8400; color: white; }
                .status-concluido { background: #1DFDB9; color: #000058; }
                .status-respondido { background: #1634FF; color: white; }

                .ficha-rodape {
                    padding: 16px 24px;
                    background: var(--cor-container);
                    border-top: 1px solid var(--borda-clara);
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    flex-shrink: 0;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', estilos);
    }
}

// Expor a classe globalmente IMEDIATAMENTE (antes do DOMContentLoaded)
// Garantir que está disponível mesmo se houver problemas de timing
window.FichasEspecificas = FichasEspecificas;

// Log para debug
console.log('✅ [fichas-especificas] Classe FichasEspecificas exposta globalmente:', typeof window.FichasEspecificas);

// Inicializa instância quando DOM estiver pronto
let fichasEspecificas;
function inicializarFichasEspecificas() {
    if (!fichasEspecificas) {
        try {
            fichasEspecificas = new FichasEspecificas();
            window.fichasEspecificas = fichasEspecificas;
            console.log('✅ [fichas-especificas] Instância criada e exposta globalmente');
        } catch (error) {
            console.error('❌ [fichas-especificas] Erro ao criar instância:', error);
        }
    }
    return fichasEspecificas;
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFichasEspecificas);
} else {
    // DOM já está pronto, inicializar imediatamente
    inicializarFichasEspecificas();
}

// Garantir disponibilidade mesmo após carregamento assíncrono
setTimeout(() => {
    if (!window.FichasEspecificas) {
        console.error('❌ [fichas-especificas] ATENÇÃO: Classe não está disponível após 1 segundo!');
    } else {
        console.log('✅ [fichas-especificas] Classe confirmada disponível após 1 segundo');
    }
}, 1000);

