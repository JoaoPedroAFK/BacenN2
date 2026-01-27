// get-grupos-simples.js
// VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team
// Versão simplificada do script para obter IDs dos grupos

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

let sock = null;
let isConnected = false;

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  
  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['Grupos Script', 'Chrome', '1.0.0']
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 ESCANEIE O QR CODE:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      isConnected = true;
      console.log('\n✅ Conectado! Buscando grupos...\n');
      
      try {
        const grupos = await sock.groupFetchAllParticipating();
        const lista = Object.values(grupos).map(g => ({
          nome: g.subject || 'Sem nome',
          id: g.id
        }));

        console.log(`📊 Total: ${lista.length} grupos\n`);
        lista.forEach((g, i) => {
          console.log(`${i + 1}. ${g.nome}`);
          console.log(`   ID: ${g.id}\n`);
        });

        // Salvar em JSON
        fs.writeFileSync('grupos.json', JSON.stringify(lista, null, 2));
        console.log('✅ Salvo em: grupos.json');
        
        // Salvar apenas IDs
        const ids = lista.map(g => g.id).join('\n');
        fs.writeFileSync('grupos-ids.txt', ids);
        console.log('✅ IDs salvos em: grupos-ids.txt\n');
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
      }
    }

    if (connection === 'close') {
      const status = lastDisconnect?.error?.output?.statusCode;
      if (status === DisconnectReason.loggedOut) {
        console.log('⚠️ Deslogado. Limpando auth...');
        if (fs.existsSync('auth')) fs.rmSync('auth', { recursive: true, force: true });
      }
      process.exit(0);
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

console.log('📱 Script de Grupos WhatsApp\n');
connect();
