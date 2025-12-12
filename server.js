/* === SERVIDOR HTTP LOCAL === */
/* Servidor simples para hospedagem local do sistema BACEN */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = 'localhost';

// Mapeamento de tipos MIME
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse da URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Obter extensão do arquivo
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Ler arquivo
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Arquivo não encontrado
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Não Encontrado</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; }
                            h1 { color: #1634FF; }
                        </style>
                    </head>
                    <body>
                        <h1>404 - Arquivo Não Encontrado</h1>
                        <p>O arquivo solicitado não foi encontrado.</p>
                        <a href="/">Voltar para Home</a>
                    </body>
                    </html>
                `, 'utf-8');
            } else {
                // Erro do servidor
                res.writeHead(500);
                res.end(`Erro do servidor: ${error.code}`, 'utf-8');
            }
        } else {
            // Sucesso
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 SERVIDOR LOCAL INICIADO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📍 URL: http://${HOST}:${PORT}`);
    console.log(`📁 Diretório: ${__dirname}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('💡 Pressione Ctrl+C para parar o servidor');
    console.log('═══════════════════════════════════════════════════════');
});

