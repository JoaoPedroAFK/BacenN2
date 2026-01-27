// get-grupos-baileys.js
// VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team
// Script para obter IDs dos grupos do WhatsApp via Baileys

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const path = require('path');

let sock = null;
let isConnected = false;

/**
 * Conectar ao WhatsApp via Baileys
 */
async function connect() {
  try {
    console.log('🔌 Iniciando conexão com WhatsApp...');
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    
    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: ['Grupos Script', 'Chrome', '1.0.0'],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      markOnlineOnConnect: true
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📱 QR CODE GERADO! ESCANEIE COM SEU WHATSAPP AGORA!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n');
        qrcode.generate(qr, { small: false });
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('\n');
      }

      if (connection === 'open') {
        isConnected = true;
        console.log('\n✅ WHATSAPP CONECTADO!');
        console.log('📋 Buscando grupos...\n');
        buscarGrupos();
      }

      if (connection === 'close') {
        isConnected = false;
        const status = lastDisconnect?.error?.output?.statusCode;
        
        if (status === DisconnectReason.loggedOut) {
          console.log('⚠️ DESLOGADO -> Limpando autenticação...');
          if (fs.existsSync('auth')) {
            fs.rmSync('auth', { recursive: true, force: true });
          }
          console.log('🔄 Reinicie o script para gerar novo QR Code');
          process.exit(0);
        } else {
          console.log(`❌ Desconectado (${status || 'desconhecido'})`);
          console.log('🔄 Tentando reconectar...');
          setTimeout(() => connect(), 2000);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }
}

/**
 * Buscar todos os grupos e salvar IDs
 */
async function buscarGrupos() {
  if (!isConnected || !sock) {
    console.log('❌ WhatsApp não está conectado');
    return;
  }

  try {
    console.log('🔍 Buscando grupos...');
    const grupos = await sock.groupFetchAllParticipating();
    
    const lista = Object.values(grupos).map(g => ({
      nome: g.subject || 'Sem nome',
      id: g.id,
      descricao: g.desc || '',
      criadoEm: g.creation ? new Date(g.creation * 1000).toISOString() : null,
      participantes: g.participants?.length || 0,
      admin: g.participants?.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id) || []
    }));

    // Ordenar por nome
    lista.sort((a, b) => a.nome.localeCompare(b.nome));

    // Exibir no console
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 TOTAL DE GRUPOS ENCONTRADOS: ${lista.length}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n');

    lista.forEach((grupo, index) => {
      console.log(`${index + 1}. ${grupo.nome}`);
      console.log(`   ID: ${grupo.id}`);
      console.log(`   Participantes: ${grupo.participantes}`);
      if (grupo.descricao) {
        console.log(`   Descrição: ${grupo.descricao.substring(0, 50)}${grupo.descricao.length > 50 ? '...' : ''}`);
      }
      console.log('');
    });

    // Salvar em arquivo JSON
    const arquivoJSON = 'grupos-whatsapp.json';
    const dados = {
      atualizadoEm: new Date().toISOString(),
      totalGrupos: lista.length,
      grupos: lista
    };

    fs.writeFileSync(arquivoJSON, JSON.stringify(dados, null, 2), 'utf8');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Dados salvos em: ${arquivoJSON}`);
    console.log('═══════════════════════════════════════════════════════');

    // Salvar apenas IDs em arquivo de texto simples
    const arquivoTXT = 'grupos-ids.txt';
    const idsTexto = lista.map(g => `${g.nome} | ${g.id}`).join('\n');
    fs.writeFileSync(arquivoTXT, `Total de grupos: ${lista.length}\nAtualizado em: ${new Date().toLocaleString('pt-BR')}\n\n${idsTexto}`, 'utf8');
    console.log(`✅ IDs salvos em: ${arquivoTXT}`);
    console.log('═══════════════════════════════════════════════════════');

    // Salvar apenas IDs (um por linha) para uso em scripts
    const arquivoIds = 'grupos-ids-only.txt';
    const idsOnly = lista.map(g => g.id).join('\n');
    fs.writeFileSync(arquivoIds, idsOnly, 'utf8');
    console.log(`✅ IDs puros salvos em: ${arquivoIds}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('✅ Processo concluído!');
    console.log('💡 Você pode manter o script rodando ou pressionar Ctrl+C para sair\n');

  } catch (error) {
    console.error('❌ Erro ao buscar grupos:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Iniciar conexão
console.log('═══════════════════════════════════════════════════════');
console.log('📱 Script de Listagem de Grupos WhatsApp (Baileys)');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Verificar se pasta auth existe
if (!fs.existsSync('auth')) {
  console.log('ℹ️ Pasta "auth" não encontrada. Será criada após escanear QR Code.');
  console.log('');
}

connect();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando script...');
  if (sock) {
    try {
      sock.end();
    } catch (e) {
      console.log('Erro ao fechar conexão:', e.message);
    }
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Encerrando script...');
  if (sock) {
    try {
      sock.end();
    } catch (e) {
      console.log('Erro ao fechar conexão:', e.message);
    }
  }
  process.exit(0);
});
