/* === ENDPOINT SERVERLESS PARA VALIDAÇÃO GOOGLE SSO === */
/* Endpoint específico para Vercel serverless */

const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '638842930106-b0plff0sbbs0ljsm39n5kadsjfcj3u3q.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ sucesso: false, erro: 'Método não permitido' });
        return;
    }

    try {
        const { token } = req.body;
        
        if (!token) {
            res.status(400).json({ sucesso: false, erro: 'Token não fornecido' });
            return;
        }

        // Validar token do Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        res.status(200).json({
            sucesso: true,
            usuario: {
                id: payload.sub,
                nome: payload.name || payload.email.split('@')[0],
                email: payload.email,
                picture: payload.picture,
                perfil: determinarPerfil(payload.email),
                tiposDemanda: determinarTiposDemanda(payload.email)
            }
        });
    } catch (error) {
        console.error('Erro ao validar token:', error);
        res.status(400).json({
            sucesso: false,
            erro: error.message || 'Token inválido ou expirado'
        });
    }
};


