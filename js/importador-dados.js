/* === SCRIPT DE IMPORTAÇÃO DE DADOS - PLANILHA VELOTAX === */
/* VERSÃO: v2.7.0 | DATA: 2025-02-01 | ALTERAÇÕES: Corrigir mesclagem de camposEspecificos para não sobrescrever dataEntrada principal com valor vazio em N2 */

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
                    <p>Importe os dados da planilha "Ação Bacen e Ouvidoria (1).xlsx"</p>
                    <p style="font-size: 0.9rem; color: var(--texto-secundario); margin-top: 8px;">
                        O sistema processará apenas as abas <strong>"Base Bacen"</strong> e <strong>"Base Ouvidoria"</strong> e mapeará apenas colunas que existem nas fichas do sistema.
                    </p>
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
                        <button class="velohub-btn btn-primary" onclick="(window.importadorDadosGlobal || window.importadorDados).salvarDados()">
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
        // Carregar biblioteca SheetJS se não estiver disponível
        if (!window.XLSX) {
            await this.carregarBibliotecaXLSX();
        }
        
        if (!window.XLSX) {
            throw new Error('Biblioteca XLSX não disponível. Por favor, recarregue a página.');
        }
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = window.XLSX.read(data, { type: 'array' });
                    
                    this.adicionarLog(`📋 Planilha carregada. Encontradas ${workbook.SheetNames.length} abas: ${workbook.SheetNames.join(', ')}`);
                    
                    // Filtrar apenas as abas que queremos processar (Base Bacen, Base Ouvidoria e Planilha Chatbot)
                    const abasPermitidas = ['Base Bacen', 'Base Ouvidoria', 'Planilha Chatbot'];
                    const abasParaProcessar = workbook.SheetNames.filter(nomeAba => {
                        const nomeNormalizado = nomeAba.trim().toLowerCase();
                        return abasPermitidas.some(permitida => {
                            const permitidaLower = permitida.toLowerCase();
                            // Verificação para Base Bacen e Base Ouvidoria
                            if (permitidaLower.includes('base') && (permitidaLower.includes('bacen') || permitidaLower.includes('ouvidoria'))) {
                                return nomeNormalizado.includes('base') && (nomeNormalizado.includes('bacen') || nomeNormalizado.includes('ouvidoria'));
                            }
                            // Verificação para Planilha Chatbot
                            if (permitidaLower.includes('planilha') && permitidaLower.includes('chatbot')) {
                                return nomeNormalizado.includes('planilha') && nomeNormalizado.includes('chatbot') ||
                                       nomeNormalizado.includes('chatbot');
                            }
                            // Verificação genérica (match parcial ou completo)
                            return nomeNormalizado.includes(permitidaLower) || 
                                   permitidaLower.includes(nomeNormalizado) ||
                                   nomeNormalizado === permitidaLower;
                        });
                    });
                    
                    if (abasParaProcessar.length === 0) {
                        throw new Error('Nenhuma aba válida encontrada. Procurando por: "Base Bacen", "Base Ouvidoria" ou "Planilha Chatbot"');
                    }
                    
                    this.adicionarLog(`📌 Processando apenas as abas: ${abasParaProcessar.join(', ')}`);
                    
                    const todosDados = [];
                    
                    // Processar apenas as abas permitidas
                    abasParaProcessar.forEach((nomeAba, index) => {
                        this.adicionarLog(`📄 Processando aba: ${nomeAba}...`);
                        
                        const worksheet = workbook.Sheets[nomeAba];
                        const dadosAba = window.XLSX.utils.sheet_to_json(worksheet, { 
                            defval: '', // Valor padrão para células vazias
                            raw: false  // Converter tudo para string
                        });
                        
                        this.adicionarLog(`   ✅ ${dadosAba.length} registros encontrados na aba "${nomeAba}"`);
                        
                        // Adicionar identificador da aba em cada registro
                        dadosAba.forEach(registro => {
                            registro._aba = nomeAba;
                            registro._indiceAba = index;
                        });
                        
                        todosDados.push(...dadosAba);
                    });
                    
                    this.adicionarLog(`📊 Total de registros processados: ${todosDados.length}`);
                    resolve(todosDados);
                    
                } catch (erro) {
                    reject(new Error(`Erro ao processar Excel: ${erro.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao ler o arquivo'));
            };
            
            reader.readAsArrayBuffer(arquivo);
        });
    }
    
    async carregarBibliotecaXLSX() {
        return new Promise((resolve, reject) => {
            if (window.XLSX) {
                resolve();
                return;
            }
            
            this.adicionarLog('📦 Carregando biblioteca XLSX...');
            
            const script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
            script.onload = () => {
                this.adicionarLog('✅ Biblioteca XLSX carregada com sucesso');
                resolve();
            };
            script.onerror = () => {
                this.adicionarLog('❌ Erro ao carregar biblioteca XLSX', 'erro');
                reject(new Error('Não foi possível carregar a biblioteca XLSX'));
            };
            document.head.appendChild(script);
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
                
                // Verificar se o registro está completamente vazio
                const temDados = Object.values(dadoBruto).some(valor => {
                    const str = (valor || '').toString().trim();
                    return str !== '' && str !== '0' && !/^0+$/.test(str);
                });
                
                if (!temDados) {
                    this.adicionarLog(`⏭️ Registro ${i + 1}: Ignorado (todos os campos estão vazios)`, 'aviso');
                    processados++;
                    continue;
                }
                
                // Identificar tipo ANTES de validar nome/CPF (para aplicar regras específicas)
                const tipoIdentificado = this.identificarTipoDemanda(dadoBruto);
                
                // Para chatbot, verificar CPF primeiro (obrigatório)
                if (tipoIdentificado === 'chatbot') {
                    const cpfBruto = dadoBruto["CPF"] || dadoBruto["CPF Tratado"] || dadoBruto["CPF Tratado "] || '';
                    const cpfStr = (cpfBruto || '').toString().trim().replace(/\D/g, '');
                    
                    if (!cpfStr || cpfStr === '' || /^0+$/.test(cpfStr) || cpfStr.length !== 11) {
                        this.adicionarLog(`⏭️ Registro ${i + 1}: Ignorado (CPF em branco ou inválido - obrigatório para Chatbot)`, 'aviso');
                        processados++;
                        continue;
                    }
                }
                
                // Mapear primeiro para obter nomeCliente (pode vir de várias colunas)
                const ficha = this.mapearParaFicha(dadoBruto);
                
                // Verificar nome após mapeamento (mais flexível)
                const nomeFinal = (ficha.nomeCliente || ficha.nomeCompleto || '').toString().trim();
                
                // Para chatbot, se não tiver nome mas tiver CPF, gerar nome do CPF
                if (tipoIdentificado === 'chatbot' && (!nomeFinal || nomeFinal === '' || /^0+$/.test(nomeFinal))) {
                    if (ficha.cpf && ficha.cpf.length === 11) {
                        ficha.nomeCliente = `Cliente ${ficha.cpf}`;
                        ficha.nomeCompleto = `Cliente ${ficha.cpf}`;
                    } else {
                        this.adicionarLog(`⏭️ Registro ${i + 1}: Ignorado (sem nome e sem CPF válido)`, 'aviso');
                        processados++;
                        continue;
                    }
                } else if (!nomeFinal || nomeFinal === '' || /^0+$/.test(nomeFinal) || nomeFinal.startsWith('Cliente Importado')) {
                    // Para outros tipos, nome é obrigatório
                    this.adicionarLog(`⏭️ Registro ${i + 1}: Ignorado (nome vazio ou contém apenas zeros)`, 'aviso');
                    processados++;
                    continue;
                }
                
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
                
                // Salva registro com erro para análise (se dadoBruto existir)
                const dadoBruto = dadosBrutos[i] || {};
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
        
        // Log para debug (apenas os primeiros 5 registros)
        if (!this._debugCount) this._debugCount = 0;
        if (this._debugCount < 5) {
            console.log(`🔍 [${this._debugCount + 1}] Aba: "${dadoBruto._aba || 'N/A'}", Tipo identificado: "${tipoDemanda || 'N/A'}"`);
            this._debugCount++;
        }
        
        // Normalizar chaves (remover espaços extras, normalizar maiúsculas/minúsculas)
        const normalizarChave = (chave) => {
            return Object.keys(dadoBruto).find(k => 
                k.trim().toLowerCase() === chave.toLowerCase()
            ) || chave;
        };
        
        const obterValor = (chave) => {
            const chaveNormalizada = normalizarChave(chave);
            return dadoBruto[chaveNormalizada] || dadoBruto[chave] || '';
        };
        
        // Mapeamento flexível dos campos da planilha para o sistema
        const ficha = {
            id: this.gerarId(),
            nomeCliente: obterValor("Nome completo") || obterValor("Nome") || obterValor("Cliente") || obterValor("Nome do Cliente") || '',
            nomeCompleto: obterValor("Nome completo") || obterValor("Nome") || obterValor("Cliente") || obterValor("Nome do Cliente") || '',
            cpf: this.limparCPF(obterValor("CPF") || obterValor("CPF Tratado") || ''),
            cpfTratado: this.limparCPF(obterValor("CPF Tratado") || obterValor("CPF") || ''),
            telefone: obterValor("Telefone") || obterValor("Celular") || obterValor("Contato") || '',
            origem: this.normalizarOrigem(obterValor("Origem") || obterValor("Canal") || ''),
            status: this.inferirStatus(dadoBruto, obterValor),
            // dataCriacao: usar apenas como fallback se não houver data na planilha (data de importação)
            dataCriacao: this.formatarData(obterValor("Data entrada") || obterValor("Data Entrada") || obterValor("Data de Entrada") || obterValor("Data") || obterValor("Data Criação") || new Date().toISOString()),
            // dataEntrada: data real da planilha (não a data de importação)
            dataEntrada: this.formatarData(obterValor("Data entrada") || obterValor("Data Entrada") || obterValor("Data de Entrada") || obterValor("Data") || ''),
            dataRecebimento: this.formatarData(obterValor("Data entrada") || obterValor("Data Recebimento") || obterValor("Data") || obterValor("Data Criação") || new Date().toISOString()),
            // Para Chatbot, mapear campo Data como dataClienteChatbot
            dataClienteChatbot: tipoDemanda === 'chatbot' ? this.formatarData(obterValor("Data") || obterValor("Data Cliente") || obterValor("Data entrada") || obterValor("Data Criação") || new Date().toISOString()) : '',
            finalizadoEm: this.formatarData(obterValor("Finalizado em") || obterValor("Finalizado Em") || obterValor("Data Finalização") || obterValor("Data Fim") || ''),
            responsavel: obterValor("Responsável") || obterValor("Responsavel") || obterValor("Atendente") || '',
            motivoReduzido: obterValor("Motivo reduzido") || obterValor("Motivo Reduzido") || obterValor("Tipo") || obterValor("Categoria") || '',
            motivoDetalhado: obterValor("Motivo Reclamação") || obterValor("Motivo Reclamacao") || obterValor("Descrição") || obterValor("Descricao") || obterValor("Observações") || '',
            enviarCobranca: this.converterBooleano(obterValor("Enviar para cobrança?") || obterValor("Enviar Cobrança") || obterValor("Cobrança") || ''),
            observacoes: obterValor("Observações") || obterValor("Observacoes") || obterValor("Observação") || obterValor("Notas") || '',
            mes: obterValor("Mês") || obterValor("Mes") || this.extrairMes(obterValor("Data entrada") || obterValor("Data") || ''),
            
            // Campo para identificar o tipo
            tipoDemanda: tipoDemanda,
            
            // Módulos de contato
            modulosContato: {
                atendimento: this.converterBooleano(obterValor("Acionou a central?") || obterValor("Central") || ''),
                n2: this.converterBooleano(obterValor("N2 Portabilidade?") || obterValor("N2") || ''),
                reclameAqui: this.converterBooleano(obterValor("Reclame Aqui") || obterValor("ReclameAqui") || ''),
                bacen: this.converterBooleano(obterValor("Bacen") || obterValor("BACEN") || ''),
                procon: this.converterBooleano(obterValor("Procon") || obterValor("PROCON") || '')
            },
            
            // Indicadores
            pixLiberado: this.converterBooleano(obterValor("PIX liberado ou excluído?") || obterValor("PIX Liberado") || obterValor("PIX") || ''),
            aceitouLiquidacao: this.converterBooleano(obterValor("Aceitou liquidação Antecipada?") || obterValor("Liquidação Antecipada") || obterValor("Liquidacao") || ''),
            
            // Tentativas de contato
            tentativas: this.processarTentativas(dadoBruto),
            
            // Protocolos
            protocolos: this.processarProtocolos(obterValor("Protocolos Central") || obterValor("Protocolo") || obterValor("Protocolos") || ''),
            
            // Campos específicos por tipo
            camposEspecificos: this.processarCamposEspecificos(dadoBruto, tipoDemanda, obterValor),
            
            // Status interno
            concluido: !!obterValor("Finalizado em"),
            dataAtualizacao: new Date().toISOString()
        };

        // Mesclar campos específicos diretamente na ficha (para facilitar acesso)
        const camposEspecificos = this.processarCamposEspecificos(dadoBruto, tipoDemanda, obterValor);
        
        // Mesclar campos específicos, mas NÃO sobrescrever campos principais se estiverem vazios
        // IMPORTANTE: Para N2, garantir que dataEntrada não seja sobrescrita por valor vazio
        Object.keys(camposEspecificos).forEach(key => {
            const valorEspecifico = camposEspecificos[key];
            const valorPrincipal = ficha[key];
            
            // Para campos de data em N2, lógica especial
            if ((key === 'dataEntrada' || key === 'dataEntradaN2' || key === 'dataEntradaAtendimento') && tipoDemanda === 'n2') {
                // Se o específico tem valor válido, usar ele
                if (valorEspecifico && valorEspecifico !== '' && valorEspecifico !== 'Invalid Date') {
                    ficha[key] = valorEspecifico;
                }
                // Se o específico está vazio mas o principal tem valor, manter o principal
                // (não fazer nada, já está correto)
            } else {
                // Para outros campos, mesclar normalmente
                // Mas não sobrescrever se o principal já tem valor e o específico está vazio
                if (valorPrincipal && valorPrincipal !== '' && (!valorEspecifico || valorEspecifico === '')) {
                    // Manter valor principal, não sobrescrever
                    return;
                }
                ficha[key] = valorEspecifico;
            }
        });

        return ficha;
    }

    identificarTipoDemanda(dadoBruto) {
        // Normalizar chaves
        const obterValor = (chave) => {
            const chaveNormalizada = Object.keys(dadoBruto).find(k => 
                k.trim().toLowerCase() === chave.toLowerCase()
            ) || chave;
            return dadoBruto[chaveNormalizada] || dadoBruto[chave] || '';
        };
        
        // PRIORIDADE 1: Verifica campo _aba (identificador da aba da planilha)
        // APENAS Base Bacen e Base Ouvidoria são processadas
        if (dadoBruto["_aba"]) {
            const aba = dadoBruto["_aba"].toString().toLowerCase().trim();
            console.log(`🔍 Identificando tipo pela aba: "${aba}"`);
            
            // Base Ouvidoria = N2 (prioridade máxima)
            if (aba.includes("ouvidoria") || (aba.includes("base") && aba.includes("ouvidoria"))) {
                console.log(`✅ Identificado como N2 pela aba: "${aba}"`);
                return "n2";
            }
            
            // Base Bacen = BACEN (prioridade máxima)
            if (aba.includes("base bacen") || (aba.includes("base") && aba.includes("bacen"))) {
                console.log(`✅ Identificado como BACEN pela aba: "${aba}"`);
                return "bacen";
            }
            
            // Verificações adicionais (apenas para N2 e BACEN)
            if (aba.includes("n2") || aba.includes("portabilidade")) {
                console.log(`✅ Identificado como N2 pela aba: "${aba}"`);
                return "n2";
            }
            if (aba.includes("bacen")) {
                console.log(`✅ Identificado como BACEN pela aba: "${aba}"`);
                return "bacen";
            }
            
            console.log(`⚠️ Não foi possível identificar tipo pela aba: "${aba}"`);
        }
        
        // PRIORIDADE 2: Verifica campos específicos de N2
        if (obterValor("N2 Portabilidade?") || 
            obterValor("Prazo N2") || 
            obterValor("Banco Origem") || 
            obterValor("Banco Destino") ||
            obterValor("Status Portabilidade") ||
            obterValor("Banco de Origem") ||
            obterValor("Banco de Destino")) {
            return "n2";
        }
        
        // Verifica se o motivo ou origem menciona portabilidade/N2
        const motivo = (obterValor("Motivo reduzido") + ' ' + obterValor("Motivo Reclamação") + ' ' + obterValor("Origem")).toLowerCase();
        if (motivo.includes('portabilidade') && (motivo.includes('n2') || motivo.includes('ouvidoria'))) {
            return "n2";
        }
        
        // PRIORIDADE 3: Verifica campos específicos de Chatbot
        // Verificar campos da planilha CSV do Chatbot
        if (obterValor("Resposta do Bot foi correta?") || 
            obterValor("Resposta do Bot foi correta") ||
            obterValor("Ticket") ||
            obterValor("Nota") ||
            obterValor("Avaliação") ||
            obterValor("Produto") ||
            obterValor("Canal Chatbot") || 
            obterValor("Resolvido Automaticamente?") || 
            obterValor("Encaminhado para Humano?") ||
            obterValor("Satisfação") ||
            obterValor("Nota Avaliação") ||
            obterValor("Prazo Resposta") ||
            obterValor("Canal")?.toLowerCase().includes('chat') ||
            obterValor("Canal")?.toLowerCase().includes('whatsapp') ||
            obterValor("Canal")?.toLowerCase().includes('site')) {
            console.log(`✅ Identificado como Chatbot por campo específico`);
            return "chatbot";
        }
        
        // Verifica se o motivo ou origem menciona chatbot
        if (motivo.includes('chatbot') || motivo.includes('chat') || motivo.includes('bot')) {
            return "chatbot";
        }
        
        // PRIORIDADE 4: Verifica se é BACEN
        if (obterValor("Bacen") || 
            obterValor("Prazo Bacen") ||
            obterValor("Prazo BACEN") ||
            obterValor("Reclame Aqui") ||
            obterValor("Procon")) {
            return "bacen";
        }
        
        // Verifica se o motivo ou origem menciona BACEN
        if (motivo.includes('bacen') || motivo.includes('banco central') || motivo.includes('reclame aqui') || motivo.includes('procon')) {
            return "bacen";
        }
        
        // PADRÃO: Se não conseguir identificar, tenta inferir pela origem
        const origem = obterValor("Origem")?.toLowerCase() || '';
        if (origem.includes('n2') || origem.includes('ouvidoria')) return "n2";
        if (origem.includes('chat') || origem.includes('bot')) return "chatbot";
        if (origem.includes('bacen')) return "bacen";
        
        // Último recurso: padrão BACEN
        return "bacen";
    }

    processarCamposEspecificos(dadoBruto, tipoDemanda, obterValor = null) {
        const campos = {};
        
        // Normalizar chaves (criar obterValor se não foi passado)
        if (!obterValor) {
            obterValor = (chave) => {
                const chaveNormalizada = Object.keys(dadoBruto).find(k => 
                    k.trim().toLowerCase() === chave.toLowerCase()
                ) || chave;
                return dadoBruto[chaveNormalizada] || dadoBruto[chave] || '';
            };
        }
        
        switch (tipoDemanda) {
            case "bacen":
                campos.prazoBacen = this.formatarData(obterValor("Prazo Bacen") || obterValor("Prazo BACEN") || obterValor("Prazo") || '');
                campos.reclameAqui = this.converterBooleano(obterValor("Reclame Aqui") || obterValor("ReclameAqui") || '');
                campos.procon = this.converterBooleano(obterValor("Procon") || obterValor("PROCON") || '');
                campos.casosCriticos = this.converterBooleano(obterValor("Casos Críticos") || obterValor("Casos Criticos") || obterValor("Crítico") || '');
                break;
                
            case "n2":
                // Removido: prazoN2 (prazo Bacen não existe mais em N2)
                campos.bancoOrigem = obterValor("Banco Origem") || obterValor("Banco de Origem") || obterValor("Origem Banco") || '';
                campos.bancoDestino = obterValor("Banco Destino") || obterValor("Banco de Destino") || obterValor("Destino Banco") || '';
                campos.statusPortabilidade = obterValor("Status Portabilidade") || obterValor("Status") || '';
                campos.n2Portabilidade = this.converterBooleano(obterValor("N2 Portabilidade?") || obterValor("N2") || '');
                // Mapear datas específicas de N2 da planilha
                // IMPORTANTE: "Data de entrada" é o campo principal solicitado para o gráfico mensal
                campos.dataEntrada = this.formatarData(obterValor("Data de entrada") || obterValor("Data entrada") || obterValor("Data Entrada") || obterValor("Data de Entrada") || obterValor("Data") || '');
                campos.dataEntradaAtendimento = this.formatarData(obterValor("Data Entrada Atendimento") || obterValor("Data entrada Atendimento") || obterValor("Data Entrada") || obterValor("Data") || '');
                campos.dataEntradaN2 = this.formatarData(obterValor("Data Entrada N2") || obterValor("Data entrada N2") || obterValor("Data N2") || obterValor("Data Entrada") || obterValor("Data") || '');
                break;
                
            case "chatbot":
                campos.canalChatbot = obterValor("Canal Chatbot") || obterValor("Canal") || obterValor("Origem") || '';
                campos.satisfacao = obterValor("Satisfação") || obterValor("Satisfacao") || obterValor("Nota") || obterValor("Nota Avaliação") || '';
                campos.notaAvaliacao = obterValor("Nota Avaliação") || obterValor("Nota Avaliacao") || obterValor("Nota") || obterValor("Satisfação") || obterValor("Satisfacao") || '';
                // Campos específicos da planilha CSV do Chatbot
                const respostaBot = obterValor("Resposta do Bot foi correta?") || obterValor("Resposta do Bot foi correta") || '';
                campos.respostaBot = respostaBot; // SIM ou NÃO
                // Inferir resolvidoAutomaticamente e encaminhadoHumano de respostaBot
                if (respostaBot && (respostaBot.toUpperCase() === 'SIM' || respostaBot.toUpperCase() === 'S')) {
                    campos.resolvidoAutomaticamente = true;
                    campos.encaminhadoHumano = false;
                } else if (respostaBot && (respostaBot.toUpperCase() === 'NÃO' || respostaBot.toUpperCase() === 'NAO' || respostaBot.toUpperCase() === 'N')) {
                    campos.resolvidoAutomaticamente = false;
                    campos.encaminhadoHumano = true;
                } else {
                    campos.resolvidoAutomaticamente = this.converterBooleano(obterValor("Resolvido Automaticamente?") || obterValor("Resolvido Automaticamente") || obterValor("Auto Resolvido") || '');
                    campos.encaminhadoHumano = this.converterBooleano(obterValor("Encaminhado para Humano?") || obterValor("Encaminhado para Humano") || obterValor("Encaminhado Humano") || '');
                }
                campos.encaminhadoParaHumano = campos.encaminhadoHumano;
                campos.ticket = obterValor("Ticket") || '';
                campos.avaliacao = obterValor("Avaliação") || obterValor("Avaliacao") || '';
                campos.produto = obterValor("Produto") || obterValor("Tipo Produto") || '';
                campos.motivoChatbot = obterValor("Motivo") || obterValor("Motivo Reclamação") || '';
                campos.finalizacao = obterValor("Finalização") || obterValor("Finalizacao") || '';
                campos.pixLiberado = this.converterBooleano(obterValor("PIX LIBERADO?") || obterValor("PIX LIBERADO") || obterValor("Pix Liberado") || '');
                // IMPORTANTE: Campo "Data" da planilha é o principal para o gráfico mensal
                // Mapear explicitamente para garantir que seja usado
                campos.dataClienteChatbot = this.formatarData(obterValor("Data") || obterValor("Data Cliente") || obterValor("Data entrada") || obterValor("Data Criação") || '');
                // Também mapear para campo "data" genérico para garantir compatibilidade
                campos.data = this.formatarData(obterValor("Data") || obterValor("Data Cliente") || obterValor("Data entrada") || '');
                campos.prazoResposta = this.formatarData(obterValor("Prazo Resposta") || obterValor("Prazo") || '');
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

    inferirStatus(dadoBruto, obterValor = null) {
        // Se obterValor não foi passado, criar função auxiliar
        if (!obterValor) {
            const normalizarChave = (chave) => {
                return Object.keys(dadoBruto).find(k => 
                    k.trim().toLowerCase() === chave.toLowerCase()
                ) || chave;
            };
            obterValor = (chave) => {
                const chaveNormalizada = normalizarChave(chave);
                return dadoBruto[chaveNormalizada] || dadoBruto[chave] || '';
            };
        }
        
        if (obterValor("Finalizado em") || obterValor("Finalizado Em") || obterValor("Data Finalização")) {
            return this.converterBooleano(obterValor("Enviar para cobrança?") || obterValor("Enviar Cobrança")) ? 'respondido' : 'concluido';
        } else if (obterValor("1ª tentativa") || obterValor("1a tentativa") || obterValor("Primeira tentativa")) {
            return 'em-tratativa';
        } else {
            return 'nao-iniciado';
        }
    }

    formatarData(dataString) {
        if (!dataString) return '';
        
        const str = dataString.toString().trim();
        if (!str) return '';
        
        // Se já está em formato ISO, retorna
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
            try {
                const data = new Date(str);
                if (!isNaN(data.getTime())) {
                    return data.toISOString();
                }
            } catch (e) {
                // Continua tentando outros formatos
            }
        }
        
        // Tenta formato DD/MM/YYYY ou DD/MM/AAAA
        const matchBR = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (matchBR) {
            const [, dia, mes, ano] = matchBR;
            try {
                const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                if (!isNaN(data.getTime())) {
                    return data.toISOString();
                }
            } catch (e) {
                // Continua
            }
        }
        
        // Tenta formato DD-MM-YYYY
        const matchBR2 = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
        if (matchBR2) {
            const [, dia, mes, ano] = matchBR2;
            try {
                const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                if (!isNaN(data.getTime())) {
                    return data.toISOString();
                }
            } catch (e) {
                // Continua
            }
        }
        
        // Tenta parsear como data do Excel (número serial)
        if (/^\d+\.?\d*$/.test(str)) {
            try {
                // Excel usa 1 de janeiro de 1900 como base (mas na verdade é 30/12/1899)
                const excelDate = parseFloat(str);
                if (excelDate > 0 && excelDate < 100000) {
                    // Converter número serial do Excel para data JavaScript
                    const data = new Date((excelDate - 25569) * 86400 * 1000);
                    if (!isNaN(data.getTime())) {
                        return data.toISOString();
                    }
                }
            } catch (e) {
                // Continua
            }
        }
        
        // Última tentativa: usar Date nativo
        try {
            const data = new Date(str);
            if (!isNaN(data.getTime())) {
                return data.toISOString();
            }
        } catch (e) {
            // Ignora
        }
        
        // Se não conseguir, retorna string original
        return str;
    }

    formatarValor(valorString) {
        if (!valorString) return '0';
        
        // Remove formatação e converte para número
        const valor = valorString.replace(/[R$\s.]/g, '').replace(',', '.');
        return parseFloat(valor) || 0;
    }
    
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    limparCPF(cpf) {
        if (!cpf) return '';
        return cpf.toString().replace(/\D/g, '');
    }
    
    converterBooleano(valor) {
        if (!valor) return false;
        const str = valor.toString().toLowerCase().trim();
        return str === 'true' || str === 'sim' || str === 's' || str === '1' || str === 'yes' || str === 'y';
    }
    
    extrairMes(dataString) {
        if (!dataString) return '';
        try {
            const data = new Date(dataString);
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            return meses[data.getMonth()] || '';
        } catch {
            return '';
        }
    }

    processarTentativas(dadoBruto) {
        const tentativas = [];
        
        // Normalizar chaves
        const obterValor = (chave) => {
            const chaveNormalizada = Object.keys(dadoBruto).find(k => 
                k.trim().toLowerCase() === chave.toLowerCase()
            ) || chave;
            return dadoBruto[chaveNormalizada] || dadoBruto[chave] || '';
        };
        
        // Tentar diferentes formatos de nome de campo
        const variacoes = [
            ['1ª tentativa', '1a tentativa', 'Primeira tentativa', 'Tentativa 1', '1ª Tentativa'],
            ['2ª tentativa', '2a tentativa', 'Segunda tentativa', 'Tentativa 2', '2ª Tentativa'],
            ['3ª tentativa', '3a tentativa', 'Terceira tentativa', 'Tentativa 3', '3ª Tentativa']
        ];
        
        for (let i = 0; i < variacoes.length; i++) {
            let data = '';
            for (const variacao of variacoes[i]) {
                data = obterValor(variacao);
                if (data) break;
            }
            
            if (data) {
                tentativas.push({
                    dataHora: this.formatarData(data),
                    resultado: 'contatado',
                    observacoes: `Tentativa ${i + 1}`
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
        // Validações obrigatórias (mais flexível)
        // Se não tem nome, tenta usar outros campos ou gera um nome padrão
        if (!ficha.nomeCliente || (typeof ficha.nomeCliente === 'string' && ficha.nomeCliente.trim() === '')) {
            // Tenta usar CPF ou ID como nome temporário
            if (ficha.cpf && ficha.cpf.trim() !== '') {
                ficha.nomeCliente = `Cliente ${ficha.cpf}`;
            } else if (ficha.id) {
                ficha.nomeCliente = `Cliente ${ficha.id}`;
            } else {
                ficha.nomeCliente = `Cliente Importado ${Date.now()}`;
            }
        }
        
        // CPF não é obrigatório, mas se existir deve ser válido
        if (ficha.cpf && ficha.cpf.replace(/\D/g, '').length !== 11 && ficha.cpf.replace(/\D/g, '').length !== 0) {
            // Não lança erro, apenas limpa CPF inválido
            ficha.cpf = '';
            ficha.cpfTratado = '';
        }
        
        // Se não tem data de criação, usa data atual
        if (!ficha.dataCriacao || ficha.dataCriacao === '') {
            ficha.dataCriacao = new Date().toISOString();
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
    async salvarDados() {
        try {
            // Verificar se há dados importados
            this.adicionarLog(`🔍 Verificando dados importados...`, 'info');
            this.adicionarLog(`   📦 this.dadosImportados.length: ${this.dadosImportados ? this.dadosImportados.length : 'UNDEFINED'}`, 'info');
            
            if (!this.dadosImportados || this.dadosImportados.length === 0) {
                this.adicionarLog(`❌ ERRO: Nenhum dado importado encontrado!`, 'erro');
                this.adicionarLog(`   💡 Tente importar o arquivo novamente`, 'info');
                this.mostrarNotificacao('Nenhum dado para salvar. Por favor, importe o arquivo novamente.', 'erro');
                return;
            }
            
            // Filtra apenas registros sem erro
            const dadosValidos = this.dadosImportados.filter(d => !d._erroImportacao);
            
            this.adicionarLog(`📊 Total de registros no array: ${this.dadosImportados.length}`, 'info');
            this.adicionarLog(`📊 Total de registros válidos para salvar: ${dadosValidos.length}`, 'info');
            this.adicionarLog(`📊 Total de registros com erro: ${this.dadosImportados.length - dadosValidos.length}`, 'info');
            
            // Verificar tipos antes de separar
            const tiposEncontrados = {};
            dadosValidos.forEach(d => {
                const tipo = d.tipoDemanda || 'nao-identificado';
                tiposEncontrados[tipo] = (tiposEncontrados[tipo] || 0) + 1;
            });
            
            this.adicionarLog(`🔍 Tipos encontrados: ${Object.keys(tiposEncontrados).map(t => `${t}=${tiposEncontrados[t]}`).join(', ')}`, 'info');
            
            // Verificar abas dos registros
            const abasEncontradas = {};
            dadosValidos.forEach(d => {
                const aba = d._aba || 'sem-aba';
                abasEncontradas[aba] = (abasEncontradas[aba] || 0) + 1;
            });
            
            this.adicionarLog(`📋 Abas encontradas: ${Object.keys(abasEncontradas).map(a => `${a}=${abasEncontradas[a]}`).join(', ')}`, 'info');
            
            // Separa os dados por tipo de demanda
            const dadosSeparados = {
                bacen: dadosValidos.filter(d => d.tipoDemanda === 'bacen'),
                n2: dadosValidos.filter(d => d.tipoDemanda === 'n2'),
                chatbot: dadosValidos.filter(d => d.tipoDemanda === 'chatbot')
            };
            
            // Log detalhado da separação
            this.adicionarLog(`🔍 Análise de tipos:`, 'info');
            this.adicionarLog(`   🏦 BACEN: ${dadosSeparados.bacen.length}`, 'info');
            this.adicionarLog(`   🔄 N2: ${dadosSeparados.n2.length}`, 'info');
            this.adicionarLog(`   🤖 Chatbot: ${dadosSeparados.chatbot.length}`, 'info');
            
            // Verificar tipos não identificados
            const naoIdentificados = dadosValidos.filter(d => !d.tipoDemanda || (d.tipoDemanda !== 'bacen' && d.tipoDemanda !== 'n2' && d.tipoDemanda !== 'chatbot'));
            if (naoIdentificados.length > 0) {
                this.adicionarLog(`⚠️ ${naoIdentificados.length} registros não identificados!`, 'aviso');
                // Tentar re-identificar baseado na aba
                naoIdentificados.forEach((d, i) => {
                    if (i < 10) { // Mostrar apenas os 10 primeiros
                        const aba = d._aba || 'N/A';
                        let tipoCorrigido = null;
                        
                        if (aba.toLowerCase().includes('ouvidoria')) {
                            tipoCorrigido = 'n2';
                        } else if (aba.toLowerCase().includes('bacen')) {
                            tipoCorrigido = 'bacen';
                        }
                        
                        if (tipoCorrigido) {
                            d.tipoDemanda = tipoCorrigido;
                            this.adicionarLog(`   ✅ ${i + 1}. Corrigido: Aba "${aba}" → ${tipoCorrigido}`, 'sucesso');
                        } else {
                            this.adicionarLog(`   ⚠️ ${i + 1}. Aba: "${aba}", Tipo: "${d.tipoDemanda || 'N/A'}", Nome: "${d.nomeCliente || d.nomeCompleto || 'N/A'}"`, 'aviso');
                        }
                    }
                });
                
                // Re-separar após correções
                if (naoIdentificados.some(d => d.tipoDemanda === 'bacen' || d.tipoDemanda === 'n2' || d.tipoDemanda === 'chatbot')) {
                    dadosSeparados.bacen = dadosValidos.filter(d => d.tipoDemanda === 'bacen');
                    dadosSeparados.n2 = dadosValidos.filter(d => d.tipoDemanda === 'n2');
                    dadosSeparados.chatbot = dadosValidos.filter(d => d.tipoDemanda === 'chatbot');
                    this.adicionarLog(`🔄 Re-separação após correções: BACEN=${dadosSeparados.bacen.length}, N2=${dadosSeparados.n2.length}, Chatbot=${dadosSeparados.chatbot.length}`, 'info');
                }
            }
            
            // Garantir que o sistema de armazenamento está disponível
            if (!window.armazenamentoReclamacoes) {
                console.error('❌ Sistema de armazenamento não encontrado! Tentando inicializar...');
                // Tentar carregar o script se não estiver disponível
                if (typeof ArmazenamentoReclamacoes !== 'undefined') {
                    window.armazenamentoReclamacoes = new ArmazenamentoReclamacoes();
                    this.adicionarLog(`✅ Sistema de armazenamento inicializado`, 'sucesso');
                } else {
                    this.adicionarLog(`⚠️ Sistema de armazenamento não disponível, usando apenas localStorage`, 'aviso');
                }
            }
            
            // Verificar se Firebase está ativo antes de salvar no localStorage
            const usarFirebase = window.armazenamentoReclamacoes && window.armazenamentoReclamacoes.usarFirebase;
            
            if (!usarFirebase) {
                // Apenas salvar no localStorage se Firebase NÃO estiver ativo
                this.adicionarLog(`💾 Firebase não está ativo, salvando no localStorage como fallback...`, 'aviso');
                
                // Salva no localStorage primeiro (garantir que está salvo)
                const bacenExistentes = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || '[]');
                const n2Existentes = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || '[]');
                const chatbotExistentes = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || '[]');
                
                // Mescla com dados existentes (evita duplicatas por ID)
                const mesclarDados = (existentes, novos) => {
                    const mapa = new Map();
                    existentes.forEach(item => mapa.set(item.id, item));
                    novos.forEach(item => mapa.set(item.id, item));
                    return Array.from(mapa.values());
                };
                
                const bacenFinal = mesclarDados(bacenExistentes, dadosSeparados.bacen);
                const n2Final = mesclarDados(n2Existentes, dadosSeparados.n2);
                const chatbotFinal = mesclarDados(chatbotExistentes, dadosSeparados.chatbot);
                
                try {
                    // Tentar salvar apenas se não exceder quota (limite de ~2MB por tipo)
                    const tamanhoBacen = new Blob([JSON.stringify(bacenFinal)]).size / 1024 / 1024;
                    const tamanhoN2 = new Blob([JSON.stringify(n2Final)]).size / 1024 / 1024;
                    const tamanhoChatbot = new Blob([JSON.stringify(chatbotFinal)]).size / 1024 / 1024;
                    
                    if (tamanhoBacen < 2) {
                        localStorage.setItem('velotax_reclamacoes_bacen', JSON.stringify(bacenFinal));
                        this.adicionarLog(`💾 Dados BACEN salvos no localStorage (${tamanhoBacen.toFixed(2)}MB)`, 'sucesso');
                    } else {
                        this.adicionarLog(`⚠️ Dados BACEN muito grandes (${tamanhoBacen.toFixed(2)}MB), não salvando no localStorage`, 'aviso');
                    }
                    
                    if (tamanhoN2 < 2) {
                        localStorage.setItem('velotax_reclamacoes_n2', JSON.stringify(n2Final));
                        this.adicionarLog(`💾 Dados N2 salvos no localStorage (${tamanhoN2.toFixed(2)}MB)`, 'sucesso');
                    } else {
                        this.adicionarLog(`⚠️ Dados N2 muito grandes (${tamanhoN2.toFixed(2)}MB), não salvando no localStorage`, 'aviso');
                    }
                    
                    if (tamanhoChatbot < 2) {
                        localStorage.setItem('velotax_reclamacoes_chatbot', JSON.stringify(chatbotFinal));
                        this.adicionarLog(`💾 Dados Chatbot salvos no localStorage (${tamanhoChatbot.toFixed(2)}MB)`, 'sucesso');
                    } else {
                        this.adicionarLog(`⚠️ Dados Chatbot muito grandes (${tamanhoChatbot.toFixed(2)}MB), não salvando no localStorage`, 'aviso');
                    }
                } catch (error) {
                    if (error.name === 'QuotaExceededError') {
                        this.adicionarLog(`❌ QUOTA EXCEDIDA no localStorage!`, 'erro');
                        this.adicionarLog(`   ⚠️ Configure o Firebase para salvar todos os dados!`, 'aviso');
                    } else {
                        this.adicionarLog(`❌ Erro ao salvar no localStorage: ${error.message}`, 'erro');
                    }
                }
            } else {
                this.adicionarLog(`🔥 Firebase está ativo - dados serão salvos apenas no Firebase (não no localStorage)`, 'info');
            }
            
            // Usar o sistema de armazenamento se disponível (para sincronização)
            if (window.armazenamentoReclamacoes) {
                // Forçar verificação do Firebase antes de salvar
                this.adicionarLog(`🔍 Verificando Firebase antes de salvar...`, 'info');
                if (window.armazenamentoReclamacoes.verificarEAtivarFirebase) {
                    const firebaseAtivo = window.armazenamentoReclamacoes.verificarEAtivarFirebase();
                    this.adicionarLog(`   ${firebaseAtivo ? '✅' : '⚠️'} Firebase: ${firebaseAtivo ? 'ATIVO' : 'INATIVO (usando localStorage)'}`, firebaseAtivo ? 'sucesso' : 'aviso');
                }
                
                // Aguardar um pouco para garantir que Firebase está pronto
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Inicializar contadores (mesmo se não usar Firebase)
            let salvosBacen = 0, salvosN2 = 0, salvosChatbot = 0;
            let errosBacen = 0, errosN2 = 0, errosChatbot = 0;
            
            // Usar o sistema de armazenamento se disponível (para sincronização)
            if (window.armazenamentoReclamacoes) {
                
                this.adicionarLog(`💾 Salvando dados via sistema de armazenamento...`, 'info');
                
                // Salva usando o sistema de armazenamento (assíncrono)
                this.adicionarLog(`   🏦 Salvando ${dadosSeparados.bacen.length} fichas BACEN...`, 'info');
                for (let i = 0; i < dadosSeparados.bacen.length; i++) {
                    const ficha = dadosSeparados.bacen[i];
                    try {
                        const resultado = await window.armazenamentoReclamacoes.salvar('bacen', ficha);
                        if (resultado) salvosBacen++;
                        if ((i + 1) % 100 === 0) {
                            this.adicionarLog(`   📊 Progresso BACEN: ${i + 1}/${dadosSeparados.bacen.length}`, 'info');
                        }
                    } catch (error) {
                        errosBacen++;
                        console.error(`❌ Erro ao salvar ficha BACEN ${ficha.id}:`, error);
                        this.adicionarLog(`   ❌ Erro ao salvar ficha BACEN ${ficha.id}: ${error.message}`, 'erro');
                    }
                }
                
                this.adicionarLog(`   🔄 Salvando ${dadosSeparados.n2.length} fichas N2...`, 'info');
                for (let i = 0; i < dadosSeparados.n2.length; i++) {
                    const ficha = dadosSeparados.n2[i];
                    try {
                        const resultado = await window.armazenamentoReclamacoes.salvar('n2', ficha);
                        if (resultado) salvosN2++;
                        if ((i + 1) % 100 === 0) {
                            this.adicionarLog(`   📊 Progresso N2: ${i + 1}/${dadosSeparados.n2.length}`, 'info');
                        }
                    } catch (error) {
                        errosN2++;
                        console.error(`❌ Erro ao salvar ficha N2 ${ficha.id}:`, error);
                        this.adicionarLog(`   ❌ Erro ao salvar ficha N2 ${ficha.id}: ${error.message}`, 'erro');
                    }
                }
                
                this.adicionarLog(`   🤖 Salvando ${dadosSeparados.chatbot.length} fichas Chatbot...`, 'info');
                for (let i = 0; i < dadosSeparados.chatbot.length; i++) {
                    const ficha = dadosSeparados.chatbot[i];
                    try {
                        const resultado = await window.armazenamentoReclamacoes.salvar('chatbot', ficha);
                        if (resultado) salvosChatbot++;
                        if ((i + 1) % 100 === 0) {
                            this.adicionarLog(`   📊 Progresso Chatbot: ${i + 1}/${dadosSeparados.chatbot.length}`, 'info');
                        }
                    } catch (error) {
                        errosChatbot++;
                        console.error(`❌ Erro ao salvar ficha Chatbot ${ficha.id}:`, error);
                        this.adicionarLog(`   ❌ Erro ao salvar ficha Chatbot ${ficha.id}: ${error.message}`, 'erro');
                    }
                }
                
                this.adicionarLog(`✅ Dados salvos via sistema: BACEN=${salvosBacen} (${errosBacen} erros), N2=${salvosN2} (${errosN2} erros), Chatbot=${salvosChatbot} (${errosChatbot} erros)`, 'sucesso');
                
                // Verificar se os dados foram salvos corretamente no Firebase
                if (window.armazenamentoReclamacoes.usarFirebase) {
                    this.adicionarLog(`🔥 Verificando dados no Firebase...`, 'info');
                    try {
                        const verificarBacen = await window.armazenamentoReclamacoes.carregarTodos('bacen');
                        const verificarN2 = await window.armazenamentoReclamacoes.carregarTodos('n2');
                        const verificarChatbot = await window.armazenamentoReclamacoes.carregarTodos('chatbot');
                        this.adicionarLog(`   🔥 Firebase: BACEN=${verificarBacen.length}, N2=${verificarN2.length}, Chatbot=${verificarChatbot.length}`, 'info');
                    } catch (error) {
                        this.adicionarLog(`   ❌ Erro ao verificar Firebase: ${error.message}`, 'erro');
                    }
                } else {
                    this.adicionarLog(`⚠️ Supabase não está ativo. Dados salvos apenas localmente.`, 'aviso');
                }
            }
            
            // Salva todos os dados juntos para compatibilidade
            localStorage.setItem('velotax_demandas', JSON.stringify(dadosValidos));
            localStorage.setItem('velotax_fichas', JSON.stringify(dadosValidos));
            
            // Salva estatísticas da importação
            const estatisticas = {
                dataImportacao: new Date().toISOString(),
                totalImportado: dadosValidos.length,
                porTipo: {
                    bacen: dadosSeparados.bacen.length,
                    n2: dadosSeparados.n2.length,
                    chatbot: dadosSeparados.chatbot.length
                },
                totalSalvos: {
                    bacen: salvosBacen || dadosSeparados.bacen.length,
                    n2: salvosN2 || dadosSeparados.n2.length,
                    chatbot: salvosChatbot || dadosSeparados.chatbot.length
                }
            };
            localStorage.setItem('velotax_importacao_estatisticas', JSON.stringify(estatisticas));
            
            this.mostrarNotificacao(`✅ Importação concluída com sucesso!`, 'sucesso');
            this.adicionarLog(`📊 Dados separados por tipo:`, 'info');
            this.adicionarLog(`   🏦 BACEN: ${dadosSeparados.bacen.length} fichas importadas`, 'info');
            this.adicionarLog(`   🔄 N2: ${dadosSeparados.n2.length} fichas importadas`, 'info');
            this.adicionarLog(`   🤖 Chatbot: ${dadosSeparados.chatbot.length} fichas importadas`, 'info');
            
            // Dispara eventos para atualizar dashboards e listas
            // Disparar evento para cada tipo de ficha importada
            if (salvosBacen > 0) {
                window.dispatchEvent(new CustomEvent('reclamacaoSalva', { 
                    detail: { tipo: 'bacen', total: salvosBacen, origem: 'importacao' } 
                }));
                this.adicionarLog(`📢 Evento reclamacaoSalva disparado para BACEN (${salvosBacen} fichas)`, 'info');
            }
            if (salvosN2 > 0) {
                window.dispatchEvent(new CustomEvent('reclamacaoSalva', { 
                    detail: { tipo: 'n2', total: salvosN2, origem: 'importacao' } 
                }));
                this.adicionarLog(`📢 Evento reclamacaoSalva disparado para N2 (${salvosN2} fichas)`, 'info');
            }
            if (salvosChatbot > 0) {
                window.dispatchEvent(new CustomEvent('reclamacaoSalva', { 
                    detail: { tipo: 'chatbot', total: salvosChatbot, origem: 'importacao' } 
                }));
                this.adicionarLog(`📢 Evento reclamacaoSalva disparado para Chatbot (${salvosChatbot} fichas)`, 'info');
            }
            
            // Disparar evento geral de importação
            window.dispatchEvent(new CustomEvent('importacaoConcluida', { 
                detail: { 
                    tipo: 'importacao', 
                    total: dadosValidos.length,
                    porTipo: {
                        bacen: salvosBacen,
                        n2: salvosN2,
                        chatbot: salvosChatbot
                    }
                } 
            }));
            
            // Log final de verificação
            this.adicionarLog(`🔍 VERIFICAÇÃO FINAL:`, 'info');
            this.adicionarLog(`   📦 localStorage.getItem('velotax_reclamacoes_bacen'): ${localStorage.getItem('velotax_reclamacoes_bacen') ? 'EXISTE' : 'NÃO EXISTE'}`, 'info');
            this.adicionarLog(`   📦 localStorage.getItem('velotax_reclamacoes_n2'): ${localStorage.getItem('velotax_reclamacoes_n2') ? 'EXISTE' : 'NÃO EXISTE'}`, 'info');
            this.adicionarLog(`   📦 localStorage.getItem('velotax_reclamacoes_chatbot'): ${localStorage.getItem('velotax_reclamacoes_chatbot') ? 'EXISTE' : 'NÃO EXISTE'}`, 'info');
            
            // Verificar estrutura de uma ficha de exemplo
            if (dadosSeparados.bacen.length > 0) {
                const exemplo = dadosSeparados.bacen[0];
                this.adicionarLog(`   📋 Exemplo BACEN - Campos: ${Object.keys(exemplo).join(', ')}`, 'info');
                this.adicionarLog(`   📋 Exemplo BACEN - nomeCliente: ${exemplo.nomeCliente || 'AUSENTE'}, nomeCompleto: ${exemplo.nomeCompleto || 'AUSENTE'}`, 'info');
            }
            if (dadosSeparados.n2.length > 0) {
                const exemplo = dadosSeparados.n2[0];
                this.adicionarLog(`   📋 Exemplo N2 - Campos: ${Object.keys(exemplo).join(', ')}`, 'info');
                this.adicionarLog(`   📋 Exemplo N2 - nomeCliente: ${exemplo.nomeCliente || 'AUSENTE'}, nomeCompleto: ${exemplo.nomeCompleto || 'AUSENTE'}`, 'info');
            }
            
            // Recarrega a página para mostrar novos dados
            setTimeout(() => {
                if (confirm('Importação concluída! Deseja recarregar a página para ver os dados?')) {
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
