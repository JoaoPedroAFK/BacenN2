// baileys-helper.js
// VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team
// Script genérico para projetos com Baileys - Funciona em qualquer projeto
// 
// USO:
//   node baileys-helper.js [comando]
//
// COMANDOS DISPONÍVEIS:
//   connect      - Conectar ao WhatsApp e manter conexão
//   groups       - Listar todos os grupos
//   contacts     - Listar contatos
//   status       - Verificar status da conexão
//   send         - Enviar mensagem (requer: --to, --msg)
//   info         - Informações do projeto e Baileys
//
// EXEMPLOS:
//   node baileys-helper.js connect
//   node baileys-helper.js groups
//   node baileys-helper.js send --to "5511999999999@s.whatsapp.net" --msg "Olá!"
//   node baileys-helper.js info

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

// Configurações
const AUTH_DIR = 'auth';
const CONFIG = {
  browser: ['Baileys Helper', 'Chrome', '1.0.0'],
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 30000,
  markOnlineOnConnect: true
};

let sock = null;
let isConnected = false;
let reconnecting = false;

/**
 * Verificar se Baileys está instalado
 */
function verificarBaileys() {
  try {
    require.resolve('@whiskeysockets/baileys');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Verificar dependências necessárias
 */
function verificarDependencias() {
  const dependencias = {
    baileys: verificarBaileys(),
    pino: false,
    'qrcode-terminal': false
  };

  try {
    require.resolve('pino');
    dependencias.pino = true;
  } catch (e) {}

  try {
    require.resolve('qrcode-terminal');
    dependencias['qrcode-terminal'] = true;
  } catch (e) {}

  return dependencias;
}

/**
 * Obter informações do projeto
 */
function obterInfoProjeto() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let packageInfo = null;

  if (fs.existsSync(packageJsonPath)) {
    try {
      packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (e) {
      // Ignorar erro
    }
  }

  return {
    nome: packageInfo?.name || 'Projeto Desconhecido',
    versao: packageInfo?.version || 'N/A',
    diretorio: process.cwd(),
    nodeVersion: process.version,
    baileysInstalado: verificarBaileys()
  };
}

/**
 * Conectar ao WhatsApp
 */
async function connect() {
  if (reconnecting) return;
  reconnecting = true;
  isConnected = false;

  try {
    console.log('🔌 Iniciando conexão com WhatsApp...');
    
    // Criar diretório auth se não existir
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
      console.log(`📁 Diretório "${AUTH_DIR}" criado.`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      ...CONFIG
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📱 QR CODE GERADO! ESCANEIE COM SEU WHATSAPP AGORA!');
        console.log('═══════════════════════════════════════════════════════\n');
        qrcode.generate(qr, { small: false });
        console.log('\n═══════════════════════════════════════════════════════\n');
      }

      if (connection === 'open') {
        isConnected = true;
        reconnecting = false;
        console.log('\n✅ WHATSAPP CONECTADO!');
        console.log('💡 Conexão estabelecida com sucesso.\n');
      }

      if (connection === 'close') {
        isConnected = false;
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(`\n❌ Desconectado (código: ${reason || 'desconhecido'})`);

        if (reason === DisconnectReason.loggedOut) {
          console.log('⚠️ DESLOGADO -> Limpando autenticação...');
          if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          }
          console.log('🔄 Reinicie o script para gerar novo QR Code');
          process.exit(0);
        } else {
          console.log('🔄 Tentando reconectar em 2 segundos...');
          setTimeout(() => {
            reconnecting = false;
            connect();
          }, 2000);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    reconnecting = false;
    process.exit(1);
  }
}

/**
 * Listar grupos
 */
async function listarGrupos() {
  if (!isConnected || !sock) {
    console.log('❌ WhatsApp não está conectado. Execute "connect" primeiro.');
    return;
  }

  try {
    console.log('🔍 Buscando grupos...\n');
    const grupos = await sock.groupFetchAllParticipating();
    
    const lista = Object.values(grupos).map(g => ({
      nome: g.subject || 'Sem nome',
      id: g.id,
      participantes: g.participants?.length || 0
    }));

    lista.sort((a, b) => a.nome.localeCompare(b.nome));

    console.log(`📊 Total de grupos: ${lista.length}\n`);
    lista.forEach((g, i) => {
      console.log(`${i + 1}. ${g.nome}`);
      console.log(`   ID: ${g.id}`);
      console.log(`   Participantes: ${g.participantes}\n`);
    });

    // Salvar em arquivo
    const arquivo = 'grupos-baileys.json';
    fs.writeFileSync(arquivo, JSON.stringify({ grupos: lista, total: lista.length, atualizadoEm: new Date().toISOString() }, null, 2));
    console.log(`✅ Lista salva em: ${arquivo}`);

  } catch (error) {
    console.error('❌ Erro ao listar grupos:', error.message);
  }
}

/**
 * Listar contatos
 */
async function listarContatos() {
  if (!isConnected || !sock) {
    console.log('❌ WhatsApp não está conectado. Execute "connect" primeiro.');
    return;
  }

  try {
    console.log('🔍 Buscando contatos...\n');
    const contatos = await sock.onWhatsApp(''); // Buscar todos
    
    console.log(`📊 Total de contatos: ${contatos?.length || 0}\n`);
    contatos?.slice(0, 20).forEach((c, i) => {
      console.log(`${i + 1}. ${c.jid}`);
    });

    if (contatos?.length > 20) {
      console.log(`\n... e mais ${contatos.length - 20} contatos`);
    }

  } catch (error) {
    console.error('❌ Erro ao listar contatos:', error.message);
  }
}

/**
 * Verificar status
 */
function verificarStatus() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 STATUS DA CONEXÃO');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Conectado: ${isConnected ? '✅ Sim' : '❌ Não'}`);
  console.log(`Socket: ${sock ? '✅ Ativo' : '❌ Inativo'}`);
  console.log(`Diretório auth: ${fs.existsSync(AUTH_DIR) ? '✅ Existe' : '❌ Não existe'}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
}

/**
 * Enviar mensagem
 */
async function enviarMensagem(to, msg) {
  if (!isConnected || !sock) {
    console.log('❌ WhatsApp não está conectado. Execute "connect" primeiro.');
    return;
  }

  if (!to || !msg) {
    console.log('❌ Uso: send --to "JID" --msg "Mensagem"');
    return;
  }

  try {
    console.log(`📤 Enviando mensagem para ${to}...`);
    await sock.sendMessage(to, { text: msg });
    console.log('✅ Mensagem enviada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
  }
}

/**
 * Exibir informações do projeto
 */
function exibirInfo() {
  const info = obterInfoProjeto();
  const deps = verificarDependencias();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📋 INFORMAÇÕES DO PROJETO');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Nome: ${info.nome}`);
  console.log(`Versão: ${info.versao}`);
  console.log(`Diretório: ${info.diretorio}`);
  console.log(`Node.js: ${info.nodeVersion}\n`);
  console.log('📦 DEPENDÊNCIAS:\n');
  console.log(`  Baileys: ${deps.baileys ? '✅ Instalado' : '❌ Não instalado'}`);
  console.log(`  Pino: ${deps.pino ? '✅ Instalado' : '❌ Não instalado'}`);
  console.log(`  QRCode Terminal: ${deps['qrcode-terminal'] ? '✅ Instalado' : '❌ Não instalado'}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
}

/**
 * Processar argumentos da linha de comando
 */
function processarArgumentos() {
  const args = process.argv.slice(2);
  const comando = args[0];

  // Parse de flags
  const flags = {};
  for (let i = 1; i < args.length; i += 2) {
    if (args[i]?.startsWith('--')) {
      flags[args[i].substring(2)] = args[i + 1];
    }
  }

  return { comando, flags };
}

/**
 * Main
 */
async function main() {
  const { comando, flags } = processarArgumentos();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🚀 Baileys Helper - Script Genérico');
  console.log('═══════════════════════════════════════════════════════\n');

  // Verificar dependências básicas
  if (!verificarBaileys()) {
    console.log('❌ Baileys não está instalado!');
    console.log('💡 Execute: npm install @whiskeysockets/baileys\n');
    process.exit(1);
  }

  switch (comando) {
    case 'connect':
      await connect();
      // Manter script rodando
      break;

    case 'groups':
      await connect();
      // Aguardar conexão
      await new Promise(resolve => {
        const checkConnection = setInterval(() => {
          if (isConnected) {
            clearInterval(checkConnection);
            listarGrupos().then(() => process.exit(0));
          }
        }, 1000);
      });
      break;

    case 'contacts':
      await connect();
      await new Promise(resolve => {
        const checkConnection = setInterval(() => {
          if (isConnected) {
            clearInterval(checkConnection);
            listarContatos().then(() => process.exit(0));
          }
        }, 1000);
      });
      break;

    case 'status':
      verificarStatus();
      break;

    case 'send':
      await connect();
      await new Promise(resolve => {
        const checkConnection = setInterval(() => {
          if (isConnected) {
            clearInterval(checkConnection);
            enviarMensagem(flags.to, flags.msg).then(() => process.exit(0));
          }
        }, 1000);
      });
      break;

    case 'info':
      exibirInfo();
      break;

    default:
      console.log('📖 COMANDOS DISPONÍVEIS:\n');
      console.log('  connect              - Conectar ao WhatsApp');
      console.log('  groups                - Listar grupos');
      console.log('  contacts              - Listar contatos');
      console.log('  status                - Verificar status');
      console.log('  send --to JID --msg MSG - Enviar mensagem');
      console.log('  info                  - Informações do projeto\n');
      console.log('💡 Exemplo: node baileys-helper.js connect\n');
      break;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando...');
  if (sock) {
    try {
      sock.end();
    } catch (e) {}
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Encerrando...');
  if (sock) {
    try {
      sock.end();
    } catch (e) {}
  }
  process.exit(0);
});

// Executar
main().catch(console.error);
