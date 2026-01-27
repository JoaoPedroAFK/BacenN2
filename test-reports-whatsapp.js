/**
 * Script de Teste - Envio de Relatórios via WhatsApp
 * VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team
 * 
 * Testa a integração de envio de relatórios via WhatsApp localmente
 * 
 * Requisitos: Node.js >= 18.0.0 (fetch nativo)
 */

// Importar fetch se Node.js < 18
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    console.error('❌ Erro: fetch não está disponível. Use Node.js >= 18.0.0 ou instale node-fetch');
    process.exit(1);
  }
} else {
  fetch = globalThis.fetch;
}

const API_BASE_URL = process.env.API_URL || 'http://localhost:8090/api';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

/**
 * Teste 1: Verificar se o endpoint de teste está funcionando
 */
async function testConnection() {
  logSection('TESTE 1: Verificar Conexão');
  
  try {
    const url = `${API_BASE_URL}/escalacoes/reports/test`;
    log(`📡 Fazendo requisição para: ${url}`, 'blue');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Conexão OK!', 'green');
      log(`   Mensagem: ${data.message}`, 'green');
      log(`   Timestamp: ${data.timestamp}`, 'green');
      log(`   WhatsApp API URL: ${data.config?.whatsappApiUrl || 'Não configurado'}`, 'yellow');
      return true;
    } else {
      log('❌ Erro na conexão', 'red');
      log(`   Erro: ${data.error || 'Desconhecido'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Erro ao conectar', 'red');
    log(`   Erro: ${error.message}`, 'red');
    log(`   Verifique se o backend está rodando em ${API_BASE_URL}`, 'yellow');
    return false;
  }
}

/**
 * Teste 2: Enviar relatório simples
 */
async function testSendReport() {
  logSection('TESTE 2: Enviar Relatório Simples');
  
  const reportContent = `# Relatório de Teste

Este é um relatório de teste gerado automaticamente.

## Resumo Executivo

- Total de contatos: 150
- Sentimento positivo: 75%
- Rede mais ativa: Instagram

## Análise por Rede Social

### Instagram
- Contatos: 80
- Sentimento: 70% positivo

### Facebook
- Contatos: 50
- Sentimento: 80% positivo

### TikTok
- Contatos: 20
- Sentimento: 60% positivo

## Plano de Ação

1. Melhorar atendimento no TikTok
2. Expandir presença no Instagram
3. Manter qualidade no Facebook

---
Gerado em: ${new Date().toLocaleString('pt-BR')}
`;

  try {
    const url = `${API_BASE_URL}/escalacoes/reports/send`;
    log(`📡 Enviando relatório para: ${url}`, 'blue');
    log(`📝 Tamanho do relatório: ${reportContent.length} caracteres`, 'blue');
    
    const payload = {
      reportContent: reportContent,
      title: 'Relatório de Teste - Integração WhatsApp',
      filters: {
        socialNetwork: 'Instagram',
        contactReason: 'Suporte'
      },
      dateRange: new Date().toLocaleDateString('pt-BR')
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Relatório enviado com sucesso!', 'green');
      log(`   Message ID: ${data.data?.messageId || 'N/A'}`, 'green');
      log(`   Total de mensagens: ${data.data?.messageIds?.length || 1}`, 'green');
      log('\n📱 Verifique o WhatsApp do número 11943952784', 'cyan');
      return true;
    } else {
      log('❌ Erro ao enviar relatório', 'red');
      log(`   Erro: ${data.error || 'Desconhecido'}`, 'red');
      log(`   Status HTTP: ${response.status}`, 'red');
      
      if (data.error && data.error.includes('WhatsApp desconectado')) {
        log('\n⚠️  A API WhatsApp (Baileys) não está conectada', 'yellow');
        log('   Configure a variável WHATSAPP_API_URL no backend', 'yellow');
        log('   Ou verifique se a API Baileys está rodando', 'yellow');
      }
      
      return false;
    }
  } catch (error) {
    log('❌ Erro ao enviar relatório', 'red');
    log(`   Erro: ${error.message}`, 'red');
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      log('\n⚠️  Não foi possível conectar ao backend', 'yellow');
      log(`   Verifique se o backend está rodando em ${API_BASE_URL}`, 'yellow');
      log('   Execute: cd backend && npm start', 'yellow');
    }
    
    return false;
  }
}

/**
 * Teste 3: Verificar configuração
 */
async function testConfiguration() {
  logSection('TESTE 3: Verificar Configuração');
  
  const config = {
    apiUrl: API_BASE_URL,
    whatsappApiUrl: process.env.WHATSAPP_API_URL || 'Não configurado',
    whatsappDefaultJid: process.env.WHATSAPP_DEFAULT_JID || 'Não configurado'
  };
  
  log('📋 Configuração Atual:', 'blue');
  log(`   API Base URL: ${config.apiUrl}`, 'blue');
  log(`   WhatsApp API URL: ${config.whatsappApiUrl}`, 
      config.whatsappApiUrl !== 'Não configurado' ? 'green' : 'yellow');
  log(`   WhatsApp Default JID: ${config.whatsappDefaultJid}`, 
      config.whatsappDefaultJid !== 'Não configurado' ? 'green' : 'yellow');
  
  if (config.whatsappApiUrl === 'Não configurado') {
    log('\n⚠️  WHATSAPP_API_URL não está configurado', 'yellow');
    log('   Configure no arquivo backend/env ou backend/.env', 'yellow');
    log('   Exemplo: WHATSAPP_API_URL=https://sua-api-baileys.com', 'yellow');
  }
  
  return true;
}

/**
 * Função principal
 */
async function runTests() {
  log('\n🧪 TESTE DE INTEGRAÇÃO - RELATÓRIOS VIA WHATSAPP', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // Verificar configuração
  await testConfiguration();
  
  // Teste 1: Conexão
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    log('\n❌ Não foi possível conectar ao backend', 'red');
    log('   Por favor, inicie o backend primeiro:', 'yellow');
    log('   cd backend && npm start', 'yellow');
    process.exit(1);
  }
  
  // Teste 2: Enviar relatório
  const reportOk = await testSendReport();
  
  // Resumo
  logSection('RESUMO DOS TESTES');
  
  log(`✅ Teste de Conexão: ${connectionOk ? 'PASSOU' : 'FALHOU'}`, 
      connectionOk ? 'green' : 'red');
  log(`✅ Teste de Envio: ${reportOk ? 'PASSOU' : 'FALHOU'}`, 
      reportOk ? 'green' : 'red');
  
  if (connectionOk && reportOk) {
    log('\n🎉 Todos os testes passaram!', 'green');
    log('📱 Verifique o WhatsApp do número 11943952784', 'cyan');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os erros acima.', 'yellow');
  }
  
  console.log('\n');
}

// Executar testes
runTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
