/* === SCRIPT DE IMPORTAÇÃO DE DADOS - PLANILHA VELOTAX === */

class ImportadorDados {
    constructor() {
        this.dadosImportados = [];
        this.inicializar();
    }

    inicializar() {
        this.criarInterfaceImportacao();
        this.adicionarEstilos();
    }

    criarInterfaceImportacao() {
        return `
            <div class="importacao-container">
                <div class="importacao-header">
                    <h2>📥 Importação de Dados - Planilha Velotax</h2>
                    <p>Importe os dados da planilha "Itens das tabelas - Bacen, N2 e Chatbot.xlsx"</p>
                </div>

                <!-- Área de Upload -->
                <div class="upload-area" id="upload-area">
                    <div class="upload-content">
                        <div class="upload-icon">📁</div>
                        <h3>Arraste a planilha aqui</h3>
                        <p>ou clique para selecionar o arquivo</p>
                        <input type="file" id="file-input" accept=".xlsx,.xls,.csv" style="display: none;">
                        <button class="velohub-btn btn-primary" onclick="document.getElementById('file-input').click()">
                            📂 Selecionar Arquivo
                        </button>
                    </div>
                </div>

                <!-- Progresso da Importação -->
                <div class="progresso-container" id="progresso-container" style="display: none;">
                    <h3>📊 Progresso da Importação</h3>
                    <div class="progresso-bar">
                        <div class="progresso-fill" id="progresso-fill"></div>
                    </div>
                    <div class="progresso-info">
                        <span id="progresso-texto">0%</span>
                        <span id="progresso-contador">0 de 0 registros</span>
                    </div>
                </div>

                <!-- Resultados -->
                <div class="resultados-container" id="resultados-container" style="display: none;">
                    <h3>✅ Resultados da Importação</h3>
                    <div class="resultados-stats">
                        <div class="stat-card">
                            <div class="stat-valor" id="stat-total">0</div>
                            <div class="stat-label">Total Importados</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-valor" id="stat-sucesso">0</div>
                            <div class="stat-label">Sucesso</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-valor" id="stat-erros">0</div>
                            <div class="stat-label">Com Erros</div>
                        </div>
                    </div>
                    
                    <div class="resultados-acoes">
                        <button class="velohub-btn btn-primary" onclick="importadorDados.salvarDados()">
                            💾 Salvar no Sistema
                        </button>
                        <button class="velohub-btn btn-secondary" onclick="importadorDados.exportarErros()">
                            📥 Exportar Erros
                        </button>
                        <button class="velohub-btn btn-secondary" onclick="importadorDados.novaImportacao()">
                            🔄 Nova Importação
                        </button>
                    </div>
                </div>

                <!-- Logs de Importação -->
                <div class="logs-container" id="logs-container" style="display: none;">
                    <h3>📋 Logs da Importação</h3>
                    <div class="logs-content" id="logs-content"></div>
                </div>
            </div>
        `;
    }

    // === CONFIGURAÇÃO DO UPLOAD ===
    configurarUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        // Drag and Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processarArquivo(files[0]);
            }
        });

        // Click to upload
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processarArquivo(e.target.files[0]);
            }
        });
    }

    // === PROCESSAMENTO DO ARQUIVO ===
    async processarArquivo(arquivo) {
        this.mostrarProgresso();
        this.adicionarLog(`📁 Processando arquivo: ${arquivo.name}`);

        try {
            let dados;
            
            if (arquivo.name.endsWith('.csv')) {
                dados = await this.processarCSV(arquivo);
            } else if (arquivo.name.endsWith('.xlsx') || arquivo.name.endsWith('.xls')) {
                dados = await this.processarExcel(arquivo);
            } else {
                throw new Error('Formato de arquivo não suportado');
            }

            await this.processarDados(dados);
            
        } catch (erro) {
            this.adicionarLog(`❌ Erro ao processar arquivo: ${erro.message}`, 'erro');
            this.mostrarNotificacao('Erro ao processar arquivo', 'erro');
        }
    }

    async processarCSV(arquivo) {
        const texto = await arquivo.text();
        const linhas = texto.split('\n');
        const cabecalhos = linhas[0].split(',').map(h => h.trim());
        
        return linhas.slice(1).map((linha, index) => {
            const valores = linha.split(',').map(v => v.trim());
            const objeto = {};
            
            cabecalhos.forEach((cabecalho, i) => {
                objeto[cabecalho] = valores[i] || '';
            });
            
            return objeto;
        }).filter(obj => Object.values(obj).some(v => v !== ''));
    }

    async processarExcel(arquivo) {
        // Simulação de processamento Excel com separação por abas
        return new Promise((resolve) => {
            setTimeout(() => {
                // Dados demo baseados na planilha analisada com 3 abas
                resolve([
                    // === ABAS BACEN ===
                    {
                        "CPF Tratado": "12345678900",
                        "Data entrada": "2024-01-15",
                        "Finalizado em": "2024-01-20",
                        "Enviar para cobrança?": "Não",
                        "Responsável": "atendente@velotax.com",
                        "Nome completo": "João Silva",
                        "CPF": "123.456.789-00",
                        "Origem": "BACEN",
                        "Motivo reduzido": "Portabilidade",
                        "Motivo Reclamação": "Portabilidade não realizada",
                        "Prazo Bacen": "2024-01-25",
                        "Telefone": "(11) 98765-4321",
                        "1ª tentativa": "2024-01-16 10:00",
                        "2ª tentativa": "2024-01-17 14:30",
                        "3ª tentativa": "",
                        "Acionou a central?": "TRUE",
                        "N2 Portabilidade?": "FALSE",
                        "Reclame Aqui": "FALSE",
                        "Bacen": "TRUE",
                        "Procon": "FALSE",
                        "Protocolos Central": "12345",
                        "PIX liberado ou excluído?": "TRUE",
                        "Aceitou liquidação Antecipada?": "FALSE",
                        "Observações": "Cliente aguardando retorno",
                        "Mês": "Janeiro",
                        "Valor negociado": "1500.00",
                        "_aba": "Bacen"
                    },
                    {
                        "CPF Tratado": "98765432100",
                        "Data entrada": "2024-01-18",
                        "Finalizado em": "",
                        "Enviar para cobrança?": "Não",
                        "Responsável": "admin@velotax.com",
                        "Nome completo": "Maria Santos",
                        "CPF": "987.654.321-00",
                        "Origem": "Telefone",
                        "Motivo reduzido": "Erro no PIX",
                        "Motivo Reclamação": "PIX não foi creditado na conta destino",
                        "Prazo Bacen": "2024-01-28",
                        "Telefone": "(11) 91234-5678",
                        "1ª tentativa": "2024-01-19 09:00",
                        "2ª tentativa": "",
                        "3ª tentativa": "",
                        "Acionou a central?": "TRUE",
                        "N2 Portabilidade?": "FALSE",
                        "Reclame Aqui": "TRUE",
                        "Bacen": "TRUE",
                        "Procon": "FALSE",
                        "Protocolos Central": "12346",
                        "PIX liberado ou excluído?": "FALSE",
                        "Aceitou liquidação Antecipada?": "TRUE",
                        "Observações": "Problema resolvido após contato com banco",
                        "Mês": "Janeiro",
                        "Valor negociado": "2500.00",
                        "_aba": "Bacen"
                    },
                    
                    // === ABAS N2 ===
                    {
                        "CPF Tratado": "45678912300",
                        "Data entrada": "2024-01-12",
                        "Finalizado em": "2024-01-18",
                        "Enviar para cobrança?": "Não",
                        "Responsável": "atendente@velotax.com",
                        "Nome completo": "Pedro Costa",
                        "CPF": "456.789.123-00",
                        "Origem": "N2",
                        "Motivo reduzido": "Portabilidade",
                        "Motivo Reclamação": "Solicitação de portabilidade bancária",
                        "Prazo N2": "2024-01-22",
                        "Telefone": "(11) 95555-7777",
                        "1ª tentativa": "2024-01-13 11:00",
                        "2ª tentativa": "2024-01-14 15:00",
                        "3ª tentativa": "2024-01-15 10:00",
                        "Acionou a central?": "TRUE",
                        "N2 Portabilidade?": "TRUE",
                        "Reclame Aqui": "FALSE",
                        "Bacen": "FALSE",
                        "Procon": "FALSE",
                        "Protocolos Central": "N2-001",
                        "PIX liberado ou excluído?": "TRUE",
                        "Aceitou liquidação Antecipada?": "FALSE",
                        "Banco Origem": "Banco do Brasil",
                        "Banco Destino": "NuBank",
                        "Status Portabilidade": "Concluída",
                        "Observações": "Portabilidade realizada com sucesso",
                        "Mês": "Janeiro",
                        "Valor negociado": "800.00",
                        "_aba": "N2"
                    },
                    {
                        "CPF Tratado": "78912345600",
                        "Data entrada": "2024-01-20",
                        "Finalizado em": "",
                        "Enviar para cobrança?": "Sim",
                        "Responsável": "admin@velotax.com",
                        "Nome completo": "Ana Oliveira",
                        "CPF": "789.123.456-00",
                        "Origem": "N2",
                        "Motivo reduzido": "Transferência",
                        "Motivo Reclamação": "Problemas com transferência entre contas",
                        "Prazo N2": "2024-01-30",
                        "Telefone": "(11) 98888-9999",
                        "1ª tentativa": "2024-01-21 14:00",
                        "2ª tentativa": "",
                        "3ª tentativa": "",
                        "Acionou a central?": "TRUE",
                        "N2 Portabilidade?": "FALSE",
                        "Reclame Aqui": "FALSE",
                        "Bacen": "FALSE",
                        "Procon": "TRUE",
                        "Protocolos Central": "N2-002",
                        "PIX liberado ou excluído?": "FALSE",
                        "Aceitou liquidação Antecipada?": "FALSE",
                        "Banco Origem": "Itaú",
                        "Banco Destino": "Santander",
                        "Status Portabilidade": "Em andamento",
                        "Observações": "Aguardando documentação complementar",
                        "Mês": "Janeiro",
                        "Valor negociado": "1200.00",
                        "_aba": "N2"
                    },
                    
                    // === ABAS CHATBOT ===
                    {
                        "CPF Tratado": "32165498700",
                        "Data entrada": "2024-01-22",
                        "Finalizado em": "2024-01-22",
                        "Enviar para cobrança?": "Não",
                        "Responsável": "sistema@velotax.com",
                        "Nome completo": "Carlos Mendes",
                        "CPF": "321.654.987-00",
                        "Origem": "Chatbot",
                        "Motivo reduzido": "Dúvida saldo",
                        "Motivo Reclamação": "Cliente com dúvida sobre saldo disponível",
                        "Prazo Resposta": "2024-01-22",
                        "Telefone": "(11) 97777-6666",
                        "Canal Chatbot": "WhatsApp",
                        "Satisfação": "5",
                        "Resolvido Automaticamente?": "TRUE",
                        "Encaminhado para Humano?": "FALSE",
                        "Protocolos Central": "CHAT-001",
                        "PIX liberado ou excluído?": "TRUE",
                        "Aceitou liquidação Antecipada?": "FALSE",
                        "Observações": "Resposta automática via chatbot",
                        "Mês": "Janeiro",
                        "Valor negociado": "0.00",
                        "_aba": "Chatbot"
                    },
                    {
                        "CPF Tratado": "65498732100",
                        "Data entrada": "2024-01-23",
                        "Finalizado em": "2024-01-24",
                        "Enviar para cobrança?": "Não",
                        "Responsável": "atendente@velotax.com",
                        "Nome completo": "Fernanda Lima",
                        "CPF": "654.987.321-00",
                        "Origem": "Chatbot",
                        "Motivo reduzido": "Bloqueio cartão",
                        "Motivo Reclamação": "Cartão bloqueado indevidamente",
                        "Prazo Resposta": "2024-01-23",
                        "Telefone": "(11) 96666-5555",
                        "Canal Chatbot": "Site",
                        "Satisfação": "4",
                        "Resolvido Automaticamente?": "FALSE",
                        "Encaminhado para Humano?": "TRUE",
                        "Protocolos Central": "CHAT-002",
                        "PIX liberado ou excluído?": "TRUE",
                        "Aceitou liquidação Antecipada?": "FALSE",
                        "Observações": "Encaminhado para atendente humano após tentativa falha",
                        "Mês": "Janeiro",
                        "Valor negociado": "0.00",
                        "_aba": "Chatbot"
                    }
                ]);
            }, 2000);
        });
    }

    // === MAPEAMENTO E TRANSFORMAÇÃO ===
    async processarDados(dadosBrutos) {
        const total = dadosBrutos.length;
        let processados = 0;
        let sucesso = 0;
        let erros = 0;

        this.dadosImportados = [];

        for (let i = 0; i < dadosBrutos.length; i++) {
            try {
                const dadoBruto = dadosBrutos[i];
                const ficha = this.mapearParaFicha(dadoBruto);
                
                // Validação
                this.validarFicha(ficha);
                
                this.dadosImportados.push(ficha);
                sucesso++;
                processados++;
                
                this.atualizarProgresso(processados, total);
                this.adicionarLog(`✅ Registro ${i + 1}: ${ficha.nomeCliente} importado com sucesso`);
                
            } catch (erro) {
                erros++;
                processados++;
                
                this.atualizarProgresso(processados, total);
                this.adicionarLog(`❌ Registro ${i + 1}: ${erro.message}`, 'erro');
                
                // Salva registro com erro para análise
                this.dadosImportados.push({
                    ...dadoBruto,
                    _erroImportacao: erro.message,
                    _linha: i + 1
                });
            }
            
            // Pequena pausa para não travar a interface
            if (i % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        this.mostrarResultados(sucesso, erros, total);
        this.adicionarLog(`🎉 Importação concluída: ${sucesso} sucesso, ${erros} erros de ${total} registros`);
    }

    mapearParaFicha(dadoBruto) {
        // Identifica o tipo de demanda com base na aba ou campos específicos
        const tipoDemanda = this.identificarTipoDemanda(dadoBruto);
        
        // Mapeamento dos campos da planilha para o sistema
        const ficha = {
            id: Date.now() + Math.random(),
            nomeCliente: dadoBruto["Nome completo"] || '',
            cpf: dadoBruto["CPF"] || '',
            cpfTratado: dadoBruto["CPF Tratado"] || '',
            telefone: dadoBruto["Telefone"] || '',
            origem: this.normalizarOrigem(dadoBruto["Origem"] || ''),
            status: this.inferirStatus(dadoBruto),
            dataCriacao: this.formatarData(dadoBruto["Data entrada"] || ''),
            dataRecebimento: this.formatarData(dadoBruto["Data entrada"] || ''),
            finalizadoEm: this.formatarData(dadoBruto["Finalizado em"] || ''),
            responsavel: dadoBruto["Responsável"] || '',
            motivoReduzido: dadoBruto["Motivo reduzido"] || '',
            motivoDetalhado: dadoBruto["Motivo Reclamação"] || '',
            // valorNegociado removido
            enviarCobranca: dadoBruto["Enviar para cobrança?"] === "Sim",
            observacoes: dadoBruto["Observações"] || '',
            mes: dadoBruto["Mês"] || '',
            
            // Campo para identificar o tipo
            tipoDemanda: tipoDemanda,
            
            // Módulos de contato
            modulosContato: {
                atendimento: dadoBruto["Acionou a central?"] === "TRUE",
                n2: dadoBruto["N2 Portabilidade?"] === "TRUE",
                reclameAqui: dadoBruto["Reclame Aqui"] === "TRUE",
                bacen: dadoBruto["Bacen"] === "TRUE",
                procon: dadoBruto["Procon"] === "TRUE"
            },
            
            // Indicadores
            pixLiberado: dadoBruto["PIX liberado ou excluído?"] === "TRUE",
            aceitouLiquidacao: dadoBruto["Aceitou liquidação Antecipada?"] === "TRUE",
            
            // Tentativas de contato
            tentativas: this.processarTentativas(dadoBruto),
            
            // Protocolos
            protocolos: this.processarProtocolos(dadoBruto["Protocolos Central"] || ''),
            
            // Campos específicos por tipo
            camposEspecificos: this.processarCamposEspecificos(dadoBruto, tipoDemanda),
            
            // Status interno
            concluido: !!dadoBruto["Finalizado em"],
            dataAtualizacao: new Date().toISOString()
        };

        return ficha;
    }

    identificarTipoDemanda(dadoBruto) {
        // Verifica campo _aba (se existir na importação)
        if (dadoBruto["_aba"]) {
            const aba = dadoBruto["_aba"].toLowerCase();
            if (aba.includes("n2")) return "n2";
            if (aba.includes("chat")) return "chatbot";
            if (aba.includes("bacen")) return "bacen";
        }
        
        // Verifica campos específicos de cada tipo
        if (dadoBruto["N2 Portabilidade?"] === "TRUE" || 
            dadoBruto["Prazo N2"] || 
            dadoBruto["Banco Origem"] || 
            dadoBruto["Banco Destino"] ||
            dadoBruto["Status Portabilidade"] ||
            dadoBruto["Motivo reduzido"]?.toLowerCase().includes('portabilidade') && 
            (dadoBruto["Origem"]?.toLowerCase().includes('n2') || dadoBruto["Motivo Reclamação"]?.toLowerCase().includes('n2'))) {
            return "n2";
        }
        
        if (dadoBruto["Canal Chatbot"] || 
            dadoBruto["Resolvido Automaticamente?"] || 
            dadoBruto["Encaminhado para Humano?"] ||
            dadoBruto["Satisfação"] ||
            dadoBruto["Prazo Resposta"] ||
            dadoBruto["Origem"]?.toLowerCase().includes('chat') ||
            dadoBruto["Motivo reduzido"]?.toLowerCase().includes('chat')) {
            return "chatbot";
        }
        
        // Verifica se é BACEN
        if (dadoBruto["Bacen"] === "TRUE" || 
            dadoBruto["Prazo Bacen"] ||
            dadoBruto["Origem"]?.toLowerCase().includes('bacen') ||
            dadoBruto["Motivo reduzido"]?.toLowerCase().includes('bacen')) {
            return "bacen";
        }
        
        // Padrão: inferir com base em outros campos
        if (dadoBruto["Reclame Aqui"] === "TRUE" || dadoBruto["Procon"] === "TRUE") {
            return "bacen"; // Reclame Aqui e PROCON geralmente são relacionados a BACEN
        }
        
        return "bacen"; // Padrão
    }

    processarCamposEspecificos(dadoBruto, tipoDemanda) {
        const campos = {};
        
        switch (tipoDemanda) {
            case "bacen":
                campos.prazoBacen = this.formatarData(dadoBruto["Prazo Bacen"] || '');
                campos.reclameAqui = dadoBruto["Reclame Aqui"] === "TRUE";
                campos.procon = dadoBruto["Procon"] === "TRUE";
                break;
                
            case "n2":
                campos.prazoN2 = this.formatarData(dadoBruto["Prazo N2"] || '');
                campos.bancoOrigem = dadoBruto["Banco Origem"] || '';
                campos.bancoDestino = dadoBruto["Banco Destino"] || '';
                campos.statusPortabilidade = dadoBruto["Status Portabilidade"] || '';
                campos.n2Portabilidade = dadoBruto["N2 Portabilidade?"] === "TRUE";
                break;
                
            case "chatbot":
                campos.canalChatbot = dadoBruto["Canal Chatbot"] || '';
                campos.satisfacao = dadoBruto["Satisfação"] || '';
                campos.resolvidoAutomaticamente = dadoBruto["Resolvido Automaticamente?"] === "TRUE";
                campos.encaminhadoParaHumano = dadoBruto["Encaminhado para Humano?"] === "TRUE";
                campos.prazoResposta = this.formatarData(dadoBruto["Prazo Resposta"] || '');
                break;
        }
        
        return campos;
    }

    normalizarOrigem(origem) {
        const mapa = {
            'BACEN': 'bacen',
            'Telefone': 'telefone',
            'Email': 'email',
            'Reclame Aqui': 'reclame-aqui',
            'PROCON': 'procon',
            'N2': 'n2',
            'Presencial': 'presencial',
            'Site': 'site',
            'App': 'app'
        };
        
        return mapa[origem] || origem.toLowerCase().replace(/\s+/g, '-');
    }

    inferirStatus(dadoBruto) {
        if (dadoBruto["Finalizado em"]) {
            return dadoBruto["Enviar para cobrança?"] === "Sim" ? 'respondido' : 'concluido';
        } else if (dadoBruto["1ª tentativa"]) {
            return 'em-tratativa';
        } else {
            return 'nao-iniciado';
        }
    }

    formatarData(dataString) {
        if (!dataString) return '';
        
        // Tenta diferentes formatos de data
        const formatos = [
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
            /^\d{2}-\d{2}-\d{4}$/  // DD-MM-YYYY
        ];
        
        for (const formato of formatos) {
            if (formato.test(dataString)) {
                return new Date(dataString).toISOString();
            }
        }
        
        return dataString;
    }

    formatarValor(valorString) {
        if (!valorString) return '0';
        
        // Remove formatação e converte para número
        const valor = valorString.replace(/[R$\s.]/g, '').replace(',', '.');
        return parseFloat(valor) || 0;
    }

    processarTentativas(dadoBruto) {
        const tentativas = [];
        
        for (let i = 1; i <= 3; i++) {
            const campo = `${i}ª tentativa`;
            const data = dadoBruto[campo];
            
            if (data) {
                tentativas.push({
                    dataHora: this.formatarData(data),
                    resultado: 'contatado', // Simplificado
                    observacoes: `Tentativa ${i}`
                });
            }
        }
        
        return tentativas;
    }

    processarProtocolos(protocolosString) {
        if (!protocolosString) return [];
        
        // Divide múltiplos protocolos se existir
        const protocolos = protocolosString.split(/[,;]/).map(p => ({
            numero: p.trim(),
            canal: 'Não informado',
            data: new Date().toISOString()
        })).filter(p => p.numero);
        
        return protocolos;
    }

    validarFicha(ficha) {
        // Validações obrigatórias
        if (!ficha.nomeCliente) {
            throw new Error('Nome do cliente é obrigatório');
        }
        
        if (!ficha.cpf) {
            throw new Error('CPF é obrigatório');
        }
        
        if (!ficha.dataCriacao) {
            throw new Error('Data de criação é obrigatória');
        }
        
        // Validação de CPF (simplificada)
        if (ficha.cpf.replace(/\D/g, '').length !== 11) {
            throw new Error('CPF inválido');
        }
        
        return true;
    }

    // === INTERFACE ===
    mostrarProgresso() {
        document.getElementById('upload-area').style.display = 'none';
        document.getElementById('progresso-container').style.display = 'block';
        document.getElementById('resultados-container').style.display = 'none';
        document.getElementById('logs-container').style.display = 'block';
    }

    atualizarProgresso(processados, total) {
        const percentual = Math.round((processados / total) * 100);
        
        document.getElementById('progresso-fill').style.width = `${percentual}%`;
        document.getElementById('progresso-texto').textContent = `${percentual}%`;
        document.getElementById('progresso-contador').textContent = `${processados} de ${total} registros`;
    }

    mostrarResultados(sucesso, erros, total) {
        document.getElementById('progresso-container').style.display = 'none';
        document.getElementById('resultados-container').style.display = 'block';
        
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-sucesso').textContent = sucesso;
        document.getElementById('stat-erros').textContent = erros;
    }

    adicionarLog(mensagem, tipo = 'info') {
        const logsContent = document.getElementById('logs-content');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${tipo}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${mensagem}`;
        
        logsContent.appendChild(logEntry);
        logsContent.scrollTop = logsContent.scrollHeight;
    }

    // === AÇÕES FINAIS ===
    salvarDados() {
        try {
            // Filtra apenas registros sem erro
            const dadosValidos = this.dadosImportados.filter(d => !d._erroImportacao);
            
            // Separa os dados por tipo de demanda
            const dadosSeparados = {
                bacen: dadosValidos.filter(d => d.tipoDemanda === 'bacen'),
                n2: dadosValidos.filter(d => d.tipoDemanda === 'n2'),
                chatbot: dadosValidos.filter(d => d.tipoDemanda === 'chatbot')
            };
            
            // Salva no localStorage separadamente por tipo
            localStorage.setItem('velotax_demandas_bacen', JSON.stringify(dadosSeparados.bacen));
            localStorage.setItem('velotax_demandas_n2', JSON.stringify(dadosSeparados.n2));
            localStorage.setItem('velotax_demandas_chatbot', JSON.stringify(dadosSeparados.chatbot));
            
            // Salva todos os dados juntos para compatibilidade
            localStorage.setItem('velotax_demandas', JSON.stringify(dadosValidos));
            localStorage.setItem('velotax_fichas', JSON.stringify(dadosValidos)); // Para compatibilidade
            
            // Salva estatísticas da importação
            const estatisticas = {
                dataImportacao: new Date().toISOString(),
                totalImportado: dadosValidos.length,
                porTipo: {
                    bacen: dadosSeparados.bacen.length,
                    n2: dadosSeparados.n2.length,
                    chatbot: dadosSeparados.chatbot.length
                }
            };
            localStorage.setItem('velotax_importacao_estatisticas', JSON.stringify(estatisticas));
            
            this.mostrarNotificacao(`✅ Importação concluída com sucesso!`, 'sucesso');
            this.adicionarLog(`📊 Dados separados por tipo:`, 'info');
            this.adicionarLog(`   🏦 BACEN: ${dadosSeparados.bacen.length} registros`, 'info');
            this.adicionarLog(`   🔄 N2: ${dadosSeparados.n2.length} registros`, 'info');
            this.adicionarLog(`   🤖 Chatbot: ${dadosSeparados.chatbot.length} registros`, 'info');
            
            // Recarrega a página para mostrar novos dados
            setTimeout(() => {
                if (confirm('Deseja acessar a página de classificação para visualizar as demandas separadas?')) {
                    window.location.href = 'classificacao.html';
                } else {
                    location.reload();
                }
            }, 2000);
            
        } catch (erro) {
            this.mostrarNotificacao('Erro ao salvar dados: ' + erro.message, 'erro');
            this.adicionarLog(`❌ Erro ao salvar: ${erro.message}`, 'erro');
        }
    }

    exportarErros() {
        const dadosComErros = this.dadosImportados.filter(d => d._erroImportacao);
        
        if (dadosComErros.length === 0) {
            this.mostrarNotificacao('Nenhum erro para exportar', 'info');
            return;
        }
        
        // Cria CSV de erros
        const csv = [
            'Linha,Erro,Dados Originais',
            ...dadosComErros.map(d => 
                `"${d._linha}","${d._erroImportacao}","${JSON.stringify(d)}"`
            )
        ].join('\n');
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `erros-importacao-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    novaImportacao() {
        location.reload();
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
            <style id="estilos-importacao">
                .importacao-container {
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 24px;
                    background: var(--cor-container);
                    border-radius: 12px;
                    box-shadow: var(--sombra-media);
                }

                .importacao-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .importacao-header h2 {
                    color: var(--azul-royal);
                    margin-bottom: 8px;
                }

                .importacao-header p {
                    color: var(--texto-secundario);
                }

                .upload-area {
                    border: 3px dashed var(--borda-clara);
                    border-radius: 12px;
                    padding: 60px 20px;
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .upload-area:hover,
                .upload-area.drag-over {
                    border-color: var(--azul-royal);
                    background: rgba(22, 52, 255, 0.05);
                }

                .upload-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .upload-content h3 {
                    color: var(--texto-principal);
                    margin-bottom: 8px;
                }

                .upload-content p {
                    color: var(--texto-secundario);
                    margin-bottom: 20px;
                }

                .progresso-container {
                    margin-bottom: 32px;
                }

                .progresso-container h3 {
                    color: var(--azul-royal);
                    margin-bottom: 16px;
                }

                .progresso-bar {
                    width: 100%;
                    height: 20px;
                    background: var(--cor-sidebar);
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .progresso-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--azul-royal), var(--azul-ciano));
                    transition: width 0.3s ease;
                    border-radius: 10px;
                }

                .progresso-info {
                    display: flex;
                    justify-content: space-between;
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                }

                .resultados-container {
                    margin-bottom: 32px;
                }

                .resultados-container h3 {
                    color: var(--sucesso);
                    margin-bottom: 20px;
                }

                .resultados-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                }

                .stat-valor {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--azul-royal);
                    margin-bottom: 4px;
                }

                .stat-label {
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                }

                .resultados-acoes {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .logs-container {
                    margin-top: 32px;
                }

                .logs-container h3 {
                    color: var(--texto-principal);
                    margin-bottom: 16px;
                }

                .logs-content {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 16px;
                    max-height: 300px;
                    overflow-y: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 0.85rem;
                }

                .log-entry {
                    margin-bottom: 4px;
                    padding: 4px;
                    border-radius: 4px;
                }

                .log-info { color: var(--texto-principal); }
                .log-sucesso { color: var(--sucesso); }
                .log-erro { color: var(--erro); }
                .log-aviso { color: var(--aviso); }

                @media (max-width: 768px) {
                    .importacao-container {
                        margin: 20px;
                        padding: 16px;
                    }

                    .upload-area {
                        padding: 40px 16px;
                    }

                    .resultados-stats {
                        grid-template-columns: 1fr;
                    }

                    .resultados-acoes {
                        flex-direction: column;
                    }
                }
            </style>
        `;

        if (!document.getElementById('estilos-importacao')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }
}

// Inicializa o importador
let importadorDados;
document.addEventListener('DOMContentLoaded', () => {
    importadorDados = new ImportadorDados();
    importadorDados.configurarUpload();
});

// Exporta para uso global
window.ImportadorDados = ImportadorDados;
window.importadorDados = importadorDados;
