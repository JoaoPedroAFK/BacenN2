/* === GERENCIADOR DE ANEXOS === */

class GerenciadorAnexos {
    constructor() {
        this.tiposPermitidos = {
            imagens: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            pdfs: ['application/pdf']
        };
        this.tamanhoMaximo = 10 * 1024 * 1024; // 10MB
    }

    validarArquivo(arquivo) {
        const tipo = arquivo.type;
        const tamanho = arquivo.size;
        const tipoValido = 
            this.tiposPermitidos.imagens.includes(tipo) || 
            this.tiposPermitidos.pdfs.includes(tipo);

        if (!tipoValido) {
            return {
                valido: false,
                erro: 'Tipo de arquivo não permitido. Use PDF ou imagens (JPG, PNG, GIF, WEBP).'
            };
        }

        if (tamanho > this.tamanhoMaximo) {
            return {
                valido: false,
                erro: `Arquivo muito grande. Tamanho máximo: ${this.tamanhoMaximo / 1024 / 1024}MB`
            };
        }

        return { valido: true };
    }

    async converterParaBase64(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(arquivo);
        });
    }

    async adicionarAnexo(arquivo) {
        const validacao = this.validarArquivo(arquivo);
        if (!validacao.valido) {
            throw new Error(validacao.erro);
        }

        const base64 = await this.converterParaBase64(arquivo);
        const anexo = {
            id: Date.now() + Math.random(),
            nome: arquivo.name,
            tipo: arquivo.type,
            tamanho: arquivo.size,
            data: new Date().toISOString(),
            base64: base64
        };

        return anexo;
    }

    criarPreviewAnexo(anexo, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const anexoDiv = document.createElement('div');
        anexoDiv.className = 'anexo-preview';
        anexoDiv.dataset.anexoId = anexo.id;

        const isImagem = anexo.tipo.startsWith('image/');
        const tamanhoFormatado = this.formatarTamanho(anexo.tamanho);

        anexoDiv.innerHTML = `
            <div class="anexo-preview-content">
                ${isImagem ? 
                    `<img src="${anexo.base64}" alt="${anexo.nome}" class="anexo-preview-img">` :
                    `<div class="anexo-preview-pdf">
                        <span class="anexo-icon">📄</span>
                        <span class="anexo-nome">${anexo.nome}</span>
                    </div>`
                }
                <div class="anexo-info">
                    <span class="anexo-nome-text">${anexo.nome}</span>
                    <span class="anexo-tamanho">${tamanhoFormatado}</span>
                </div>
                <button type="button" class="anexo-remover" onclick="gerenciadorAnexos.removerAnexo('${anexo.id}', '${containerId}')" title="Remover anexo">
                    ✕
                </button>
            </div>
        `;

        container.appendChild(anexoDiv);
    }

    removerAnexo(anexoId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const anexoDiv = container.querySelector(`[data-anexo-id="${anexoId}"]`);
        if (anexoDiv) {
            anexoDiv.remove();
        }
    }

    obterAnexosDoContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];

        const anexos = [];
        const previews = container.querySelectorAll('.anexo-preview');
        
        previews.forEach(preview => {
            const anexoId = preview.dataset.anexoId;
            // Buscar dados do anexo armazenado (será salvo junto com a ficha)
            const anexo = this.obterAnexoPorId(anexoId);
            if (anexo) {
                anexos.push(anexo);
            }
        });

        return anexos;
    }

    obterAnexoPorId(anexoId) {
        // Os anexos serão armazenados junto com a ficha no localStorage
        // Este método será usado quando necessário buscar um anexo específico
        return null;
    }

    async handleUpload(event, containerId) {
        const arquivos = Array.from(event.target.files);
        const container = document.getElementById(containerId);
        
        if (!container) return;

        for (const arquivo of arquivos) {
            try {
                const anexo = await this.adicionarAnexo(arquivo);
                this.criarPreviewAnexo(anexo, containerId);
                
                // Armazenar anexo temporariamente no container
                if (!container.dataset.anexos) {
                    container.dataset.anexos = JSON.stringify([]);
                }
                const anexos = JSON.parse(container.dataset.anexos);
                anexos.push(anexo);
                container.dataset.anexos = JSON.stringify(anexos);
            } catch (erro) {
                alert(erro.message);
            }
        }

        // Limpar input para permitir adicionar o mesmo arquivo novamente
        event.target.value = '';
    }

    obterAnexosDoFormulario(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !container.dataset.anexos) return [];
        return JSON.parse(container.dataset.anexos);
    }

    limparAnexosFormulario(containerId) {
        this.limparAnexos(containerId);
        const container = document.getElementById(containerId);
        if (container) {
            container.dataset.anexos = JSON.stringify([]);
        }
    }

    formatarTamanho(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    exibirAnexosNaFicha(anexos, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !anexos || anexos.length === 0) return;

        container.innerHTML = '';

        anexos.forEach(anexo => {
            const anexoDiv = document.createElement('div');
            anexoDiv.className = 'anexo-exibicao';

            const isImagem = anexo.tipo && anexo.tipo.startsWith('image/');
            const tamanhoFormatado = this.formatarTamanho(anexo.tamanho || 0);

            anexoDiv.innerHTML = `
                <div class="anexo-exibicao-content">
                    ${isImagem ? 
                        `<img src="${anexo.base64}" alt="${anexo.nome}" class="anexo-exibicao-img" onclick="gerenciadorAnexos.abrirImagem('${anexo.base64}')">` :
                        `<div class="anexo-exibicao-pdf" onclick="gerenciadorAnexos.downloadAnexo('${anexo.base64}', '${anexo.nome}')">
                            <span class="anexo-icon">📄</span>
                            <span class="anexo-nome">${anexo.nome}</span>
                            <span class="anexo-download">⬇️ Baixar</span>
                        </div>`
                    }
                    <div class="anexo-info">
                        <span class="anexo-nome-text">${anexo.nome}</span>
                        <span class="anexo-tamanho">${tamanhoFormatado}</span>
                    </div>
                </div>
            `;

            container.appendChild(anexoDiv);
        });
    }

    abrirImagem(base64) {
        const janela = window.open('', '_blank');
        janela.document.write(`
            <html>
                <head><title>Visualizar Imagem</title></head>
                <body style="margin:0; padding:20px; text-align:center; background:#f0f0f0;">
                    <img src="${base64}" style="max-width:100%; max-height:90vh; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
                </body>
            </html>
        `);
    }

    downloadAnexo(base64, nomeArquivo) {
        const link = document.createElement('a');
        link.href = base64;
        link.download = nomeArquivo;
        link.click();
    }

    limparAnexos(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.gerenciadorAnexos = new GerenciadorAnexos();
}

