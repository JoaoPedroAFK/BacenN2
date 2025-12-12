/* === SERVIDOR HTTP LOCAL === */
/* Servidor simples para hospedagem local do sistema BACEN */

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { OAuth2Client } = require('google-auth-library');

const PORT = 3000;
const HOST = 'localhost';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '638842930106-b0plff0sbbs0ljsm39n5kadsjfcj3u3q.apps.googleusercontent.com';

// Inicializar cliente OAuth do Google
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// Função para validar token do Google
async function validarTokenGoogle(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        return {
            sucesso: true,
            usuario: {
                id: payload.sub,
                nome: payload.name || payload.email.split('@')[0],
                email: payload.email,
                picture: payload.picture,
                perfil: determinarPerfil(payload.email),
                tiposDemanda: determinarTiposDemanda(payload.email)
            }
        };
    } catch (error) {
        console.error('Erro ao validar token:', error);
        return {
            sucesso: false,
            erro: 'Token inválido ou expirado'
        };
    }
}

function determinarPerfil(email) {
    const emailLower = email.toLowerCase();
    if (emailLower.includes('admin') || emailLower.includes('gerente') || emailLower.includes('diretor')) {
        return 'administrador';
    }
    if (emailLower.includes('operador') || emailLower.includes('atendente')) {
        return 'operador';
    }
    return 'operador';
}

function determinarTiposDemanda(email) {
    const emailLower = email.toLowerCase();
    if (emailLower.includes('admin') || emailLower.includes('gerente') || emailLower.includes('diretor')) {
        return ['bacen', 'n2', 'chatbot'];
    }
    if (emailLower.includes('bacen')) {
        return ['bacen'];
    }
    if (emailLower.includes('n2') || emailLower.includes('chatbot')) {
        return ['n2', 'chatbot'];
    }
    return ['bacen', 'n2', 'chatbot'];
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Endpoint para validar token do Google
    if (req.method === 'POST' && req.url === '/api/auth/google') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const { token } = JSON.parse(body);
                const resultado = await validarTokenGoogle(token);
                
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });
                res.end(JSON.stringify(resultado));
            } catch (error) {
                res.writeHead(400, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ sucesso: false, erro: error.message }));
            }
        });
        return;
    }

    // CORS para OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

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

