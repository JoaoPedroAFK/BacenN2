/* === SISTEMA DE EXPORTAÇÃO DE RELATÓRIOS === */

class ExportacaoRelatorios {
    constructor() {
        this.bibliotecas = {
            jsPDF: null,
            xlsx: null
        };
    }

    async exportarPDF(dados, tipoDemanda, opcoes = {}) {
        // Usar jsPDF se disponível, senão usar método nativo
        if (window.jspdf) {
            return this.exportarPDFComJS(dados, tipoDemanda, opcoes);
        } else {
            return this.exportarPDFNativo(dados, tipoDemanda, opcoes);
        }
    }

    exportarPDFNativo(dados, tipoDemanda, opcoes) {
        // Criar HTML para impressão
        const html = this.gerarHTMLRelatorio(dados, tipoDemanda, opcoes);
        
        // Abrir janela de impressão
        const janela = window.open('', '_blank');
        janela.document.write(html);
        janela.document.close();
        
        setTimeout(() => {
            janela.print();
        }, 250);
    }

    gerarHTMLRelatorio(dados, tipoDemanda, opcoes) {
        const titulo = opcoes.titulo || `Relatório ${tipoDemanda.toUpperCase()}`;
        const dataGeracao = new Date().toLocaleString('pt-BR');
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${titulo}</title>
    <style>
        body { font-family: 'Poppins', Arial, sans-serif; padding: 20px; }
        h1 { color: #000058; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #1634FF; color: white; }
        tr:nth-child(even) { background: #f2f2f2; }
        .header { margin-bottom: 20px; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${titulo}</h1>
        <p>Gerado em: ${dataGeracao}</p>
        <p>Total de registros: ${dados.length}</p>
    </div>
    <table>
        <thead>
            <tr>
                ${this.obterColunas(tipoDemanda).map(col => `<th>${col}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${dados.map(ficha => `
                <tr>
                    ${this.obterValores(ficha, tipoDemanda).map(val => `<td>${val || '-'}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    <div class="footer">
        <p>Relatório gerado pelo Sistema Velotax</p>
    </div>
</body>
</html>
        `;
    }

    obterColunas(tipoDemanda) {
        const colunasBase = ['ID', 'Nome', 'CPF', 'Data Entrada', 'Status', 'Responsável'];
        
        if (tipoDemanda === 'bacen') {
            return [...colunasBase, 'Prazo BACEN', 'Procon', 'PIX Status'];
        } else if (tipoDemanda === 'n2') {
            return [...colunasBase, 'Status Portabilidade', 'PIX Status'];
        } else {
            return [...colunasBase, 'Canal', 'Resolvido Auto', 'Satisfação'];
        }
    }

    obterValores(ficha, tipoDemanda) {
        const valoresBase = [
            ficha.id,
            ficha.nomeCompleto || ficha.nomeCliente || '-',
            ficha.cpf || '-',
            this.formatarData(ficha.dataEntrada || ficha.dataReclamacao),
            ficha.status || '-',
            ficha.responsavel || '-'
        ];

        if (tipoDemanda === 'bacen') {
            return [
                ...valoresBase,
                this.formatarData(ficha.prazoBacen),
                ficha.procon ? 'Sim' : 'Não',
                ficha.pixStatus || '-',
                '-'
            ];
        } else if (tipoDemanda === 'n2') {
            return [
                ...valoresBase,
                ficha.statusPortabilidade || '-',
                ficha.pixStatus || '-'
            ];
        } else {
            return [
                ...valoresBase,
                ficha.canalChatbot || '-',
                ficha.resolvidoAutomaticamente ? 'Sim' : 'Não',
                ficha.satisfacao || '-'
            ];
        }
    }

    async exportarExcel(dados, tipoDemanda, opcoes = {}) {
        // Usar SheetJS se disponível
        if (window.XLSX) {
            return this.exportarExcelComSheetJS(dados, tipoDemanda, opcoes);
        } else {
            // Fallback: exportar como CSV
            return this.exportarCSV(dados, tipoDemanda, opcoes);
        }
    }

    exportarExcelComSheetJS(dados, tipoDemanda, opcoes) {
        const colunas = this.obterColunas(tipoDemanda);
        const linhas = dados.map(ficha => this.obterValores(ficha, tipoDemanda));

        const workbook = window.XLSX.utils.book_new();
        const worksheet = window.XLSX.utils.aoa_to_sheet([colunas, ...linhas]);
        
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
        
        const nomeArquivo = opcoes.nomeArquivo || `relatorio_${tipoDemanda}_${Date.now()}.xlsx`;
        window.XLSX.writeFile(workbook, nomeArquivo);
    }

    exportarCSV(dados, tipoDemanda, opcoes) {
        const colunas = this.obterColunas(tipoDemanda);
        const linhas = dados.map(ficha => this.obterValores(ficha, tipoDemanda));

        // Criar CSV
        const csv = [
            colunas.join(';'),
            ...linhas.map(linha => linha.map(v => `"${v}"`).join(';'))
        ].join('\n');

        // Adicionar BOM para Excel reconhecer UTF-8
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = opcoes.nomeArquivo || `relatorio_${tipoDemanda}_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    exportarJSON(dados, tipoDemanda, opcoes = {}) {
        const json = JSON.stringify(dados, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = opcoes.nomeArquivo || `relatorio_${tipoDemanda}_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    formatarData(data) {
        if (!data) return '-';
        const d = new Date(data);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('pt-BR');
    }

    criarInterfaceExportacao(containerId, tipoDemanda, dados) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="exportacao-container">
                <h3>📥 Exportar Relatório</h3>
                <div class="exportacao-opcoes">
                    <button class="btn-exportar" onclick="exportacaoRelatorios.exportarPDF(${JSON.stringify(dados)}, '${tipoDemanda}')">
                        📄 Exportar PDF
                    </button>
                    <button class="btn-exportar" onclick="exportacaoRelatorios.exportarExcel(${JSON.stringify(dados)}, '${tipoDemanda}')">
                        📊 Exportar Excel
                    </button>
                    <button class="btn-exportar" onclick="exportacaoRelatorios.exportarCSV(${JSON.stringify(dados)}, '${tipoDemanda}')">
                        📋 Exportar CSV
                    </button>
                    <button class="btn-exportar" onclick="exportacaoRelatorios.exportarJSON(${JSON.stringify(dados)}, '${tipoDemanda}')">
                        💾 Exportar JSON
                    </button>
                </div>
                <p class="exportacao-info">Total de registros: ${dados.length}</p>
            </div>
        `;
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.exportacaoRelatorios = new ExportacaoRelatorios();
}














