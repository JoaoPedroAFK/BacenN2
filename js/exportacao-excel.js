/* === EXPORTAÇÃO PARA EXCEL === */

// Função para exportar dados para Excel usando SheetJS
async function exportarParaExcel(dados, nomeArquivo, tipoDemanda) {
    try {
        // Carregar biblioteca SheetJS se não estiver disponível
        if (!window.XLSX) {
            await carregarBibliotecaXLSX();
        }

        if (!window.XLSX) {
            // Fallback: usar CSV se XLSX não estiver disponível
            console.warn('Biblioteca XLSX não disponível. Usando CSV como fallback.');
            return exportarParaCSV(dados, nomeArquivo);
        }

        // Preparar dados para Excel
        const dadosFormatados = prepararDadosParaExcel(dados, tipoDemanda);
        
        // Criar workbook
        const wb = window.XLSX.utils.book_new();
        
        // Criar worksheet
        const ws = window.XLSX.utils.aoa_to_sheet(dadosFormatados);
        
        // Ajustar largura das colunas
        const colWidths = dadosFormatados[0].map((_, i) => ({
            wch: Math.max(
                ...dadosFormatados.map(row => String(row[i] || '').length),
                15
            )
        }));
        ws['!cols'] = colWidths;
        
        // Adicionar worksheet ao workbook
        window.XLSX.utils.book_append_sheet(wb, ws, 'Reclamações');
        
        // Gerar arquivo Excel
        const nomeCompleto = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.xlsx`;
        window.XLSX.writeFile(wb, nomeCompleto);
        
        mostrarAlerta(`Arquivo Excel "${nomeCompleto}" exportado com sucesso!`, 'success');
        return true;
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        if (window.mostrarAlerta) {
            window.mostrarAlerta('Erro ao exportar para Excel. Tentando CSV...', 'warning');
        }
        return exportarParaCSV(dados, nomeArquivo);
    }
}

// Carregar biblioteca SheetJS
function carregarBibliotecaXLSX() {
    return new Promise((resolve, reject) => {
        if (window.XLSX) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
        script.onload = () => {
            console.log('✅ Biblioteca XLSX carregada');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Erro ao carregar biblioteca XLSX');
            reject(new Error('Não foi possível carregar a biblioteca XLSX'));
        };
        document.head.appendChild(script);
    });
}

// Preparar dados para Excel
function prepararDadosParaExcel(dados, tipoDemanda) {
    if (!dados || dados.length === 0) {
        return [['Nenhum dado disponível']];
    }

    // Definir cabeçalhos baseado no tipo de demanda
    let cabecalhos = [];
    
    if (tipoDemanda === 'bacen') {
        cabecalhos = [
            'ID', 'Data Entrada', 'Responsável', 'Mês', 'Nome Completo', 'CPF', 'Telefone',
            'Origem', 'Motivo Reduzido', 'Motivo Reclamação', 'Prazo Bacen',
            'Tentativas de Contato', 'Acionou Central', 'Protocolo Central',
            'N2 Segundo Nível', 'Protocolo N2', 'Reclame Aqui', 'Protocolo Reclame Aqui',
            'Procon', 'Protocolo Procon', 'Protocolos Sem Acionamento',
            'PIX Status', 'Enviar para Cobrança', 'Casos Críticos',
            'Status', 'Finalizado Em', 'Observações', 'Data Criação'
        ];
    } else if (tipoDemanda === 'n2') {
        cabecalhos = [
            'ID', 'Data Entrada Atendimento', 'Data Entrada N2', 'Responsável', 'Mês',
            'Nome Completo', 'CPF', 'Telefone', 'Origem', 'Motivo Reduzido',
            'Motivo Reclamação', 'Prazo N2', 'Tentativas de Contato',
            'Acionou Central', 'Protocolo Central', 'N2 Segundo Nível', 'Protocolo N2',
            'Reclame Aqui', 'Protocolo Reclame Aqui', 'Procon', 'Protocolo Procon',
            'Protocolos Sem Acionamento', 'PIX Status', 'Enviar para Cobrança',
            'Casos Críticos', 'Status', 'Finalizado Em', 'Observações', 'Data Criação'
        ];
    } else if (tipoDemanda === 'chatbot') {
        cabecalhos = [
            'ID', 'Data Cliente Chatbot', 'Responsável', 'Nome Completo', 'CPF', 'Telefone',
            'Origem', 'Nota Avaliação', 'Avaliação do Cliente', 'Produto', 'Motivo',
            'Resposta do Bot', 'PIX Status', 'Enviar para Cobrança', 'Casos Críticos',
            'Observações', 'Data Criação'
        ];
    }

    // Criar array de dados
    const linhas = [cabecalhos];
    
    dados.forEach(item => {
        const linha = [];
        
        if (tipoDemanda === 'bacen') {
            linha.push(
                item.id || '',
                formatarData(item.dataEntrada) || '',
                item.responsavel || '',
                item.mes || '',
                item.nomeCompleto || '',
                item.cpf || '',
                item.telefone || '',
                item.origem || '',
                item.motivoReduzido || '',
                item.motivoDetalhado || '',
                formatarData(item.prazoBacen) || '',
                formatarTentativas(item.tentativasContato) || '',
                item.acionouCentral ? 'Sim' : 'Não',
                item.protocoloCentral || '',
                item.n2SegundoNivel ? 'Sim' : 'Não',
                item.protocoloN2 || '',
                item.reclameAqui ? 'Sim' : 'Não',
                item.protocoloReclameAqui || '',
                item.procon ? 'Sim' : 'Não',
                item.protocoloProcon || '',
                item.protocolosSemAcionamento || '',
                item.pixStatus || '',
                item.enviarCobranca || '',
                item.casosCriticos ? 'Sim' : 'Não',
                item.status || '',
                formatarData(item.finalizadoEm) || '',
                item.observacoes || '',
                formatarDataHora(item.dataCriacao) || ''
            );
        } else if (tipoDemanda === 'n2') {
            linha.push(
                item.id || '',
                formatarData(item.dataEntradaAtendimento) || '',
                formatarData(item.dataEntradaN2) || '',
                item.responsavel || '',
                item.mes || '',
                item.nomeCompleto || '',
                item.cpf || '',
                item.telefone || '',
                item.origem || '',
                item.motivoReduzido || '',
                item.motivoDetalhado || '',
                formatarData(item.prazoN2) || '',
                formatarTentativas(item.tentativasContato) || '',
                item.acionouCentral ? 'Sim' : 'Não',
                item.protocoloCentral || '',
                item.n2SegundoNivel ? 'Sim' : 'Não',
                item.protocoloN2 || '',
                item.reclameAqui ? 'Sim' : 'Não',
                item.protocoloReclameAqui || '',
                item.procon ? 'Sim' : 'Não',
                item.protocoloProcon || '',
                item.protocolosSemAcionamento || '',
                item.pixStatus || '',
                item.enviarCobranca || '',
                item.casosCriticos ? 'Sim' : 'Não',
                item.status || '',
                formatarData(item.finalizadoEm) || '',
                item.observacoes || '',
                formatarDataHora(item.dataCriacao) || ''
            );
        } else if (tipoDemanda === 'chatbot') {
            linha.push(
                item.id || '',
                formatarData(item.dataClienteChatbot) || '',
                item.responsavel || '',
                item.nomeCompleto || '',
                item.cpf || '',
                item.telefone || '',
                item.origem || '',
                item.notaAvaliacao || '',
                item.avaliacaoCliente || '',
                item.produto || '',
                item.motivo || '',
                item.respostaBot || '',
                item.pixStatus || '',
                item.enviarCobranca || '',
                item.casosCriticos ? 'Sim' : 'Não',
                item.observacoes || '',
                formatarDataHora(item.dataCriacao) || ''
            );
        }
        
        linhas.push(linha);
    });
    
    return linhas;
}

// Funções auxiliares
function formatarData(dataString) {
    if (!dataString) return '';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch {
        return dataString;
    }
}

function formatarDataHora(dataString) {
    if (!dataString) return '';
    try {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
    } catch {
        return dataString;
    }
}

function formatarTentativas(tentativas) {
    if (!tentativas || !Array.isArray(tentativas)) return '';
    return tentativas.map(t => {
        const data = formatarData(t.data);
        return `${t.numero}ª: ${data}`;
    }).join('; ');
}

// Fallback para CSV
function exportarParaCSV(dados, nomeArquivo) {
    // Usar função existente de exportação CSV
    if (window.exportarRelatorioCSV) {
        return window.exportarRelatorioCSV(dados, nomeArquivo);
    }
    
    // Implementação básica de CSV
    const csv = converterParaCSV(dados);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.mostrarAlerta) {
        window.mostrarAlerta(`Arquivo CSV "${nomeArquivo}.csv" exportado com sucesso!`, 'success');
    } else {
        alert(`Arquivo CSV "${nomeArquivo}.csv" exportado com sucesso!`);
    }
    return true;
}

function converterParaCSV(dados) {
    if (!dados || dados.length === 0) return '';
    
    // Implementação básica - pode ser melhorada
    const linhas = dados.map(item => {
        return Object.values(item).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
    });
    
    return linhas.join('\n');
}

// Exportar para uso global
window.exportarParaExcel = exportarParaExcel;

