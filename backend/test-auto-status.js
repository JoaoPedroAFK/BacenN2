/**
 * Script de teste para endpoint /api/escalacoes/solicitacoes/auto-status
 * VERSION: v1.0.0 | DATE: 2025-01-31
 * 
 * Testa a atualização de status via reação do WhatsApp
 */

const fetch = require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:8080';
const ENDPOINT = '/api/escalacoes/solicitacoes/auto-status';

// Exemplo de teste - você precisa substituir pelo waMessageId real de uma solicitação
const testCases = [
  {
    name: 'Teste 1: Reação ✅ (feito)',
    body: {
      waMessageId: 'SUBSTITUA_PELO_WA_MESSAGE_ID_REAL',
      reaction: '✅',
      reactor: '5511999999999'
    }
  },
  {
    name: 'Teste 2: Reação ❌ (não feito)',
    body: {
      waMessageId: 'SUBSTITUA_PELO_WA_MESSAGE_ID_REAL',
      reaction: '❌',
      reactor: '5511999999999'
    }
  },
  {
    name: 'Teste 3: Status explícito "feito"',
    body: {
      waMessageId: 'SUBSTITUA_PELO_WA_MESSAGE_ID_REAL',
      status: 'feito',
      reactor: '5511999999999'
    }
  }
];

async function testAutoStatus() {
  console.log('🧪 Testando endpoint /api/escalacoes/solicitacoes/auto-status\n');
  console.log('⚠️  IMPORTANTE: Substitua SUBSTITUA_PELO_WA_MESSAGE_ID_REAL pelo waMessageId real de uma solicitação existente!\n');
  
  // Primeiro, vamos buscar uma solicitação existente para pegar o waMessageId
  try {
    console.log('📋 Buscando solicitações existentes...');
    const listResponse = await fetch(`${API_BASE}/api/escalacoes/solicitacoes`);
    const listData = await listResponse.json();
    
    if (listData.success && listData.data && listData.data.length > 0) {
      const primeiraSolicitacao = listData.data[0];
      const waMessageId = primeiraSolicitacao.waMessageId || primeiraSolicitacao.payload?.messageIds?.[0];
      
      if (waMessageId) {
        console.log(`✅ Encontrada solicitação com waMessageId: ${waMessageId}`);
        console.log(`   CPF: ${primeiraSolicitacao.cpf}`);
        console.log(`   Tipo: ${primeiraSolicitacao.tipo}`);
        console.log(`   Status atual: ${primeiraSolicitacao.status}\n`);
        
        // Testar com reação ✅
        console.log('🧪 Testando reação ✅ (deve atualizar para "feito")...');
        const test1 = await fetch(`${API_BASE}${ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            waMessageId: waMessageId,
            reaction: '✅',
            reactor: '5511999999999'
          })
        });
        
        const result1 = await test1.json();
        console.log('📤 Resposta:', JSON.stringify(result1, null, 2));
        
        if (result1.success && result1.data) {
          console.log(`✅ Status atualizado para: ${result1.data.status}`);
          console.log(`   respondedAt: ${result1.data.respondedAt}`);
          console.log(`   respondedBy: ${result1.data.respondedBy}\n`);
        } else {
          console.log(`❌ Erro: ${result1.error || 'Erro desconhecido'}\n`);
        }
        
        // Aguardar um pouco antes do próximo teste
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Testar com reação ❌
        console.log('🧪 Testando reação ❌ (deve atualizar para "não feito")...');
        const test2 = await fetch(`${API_BASE}${ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            waMessageId: waMessageId,
            reaction: '❌',
            reactor: '5511999999999'
          })
        });
        
        const result2 = await test2.json();
        console.log('📤 Resposta:', JSON.stringify(result2, null, 2));
        
        if (result2.success && result2.data) {
          console.log(`✅ Status atualizado para: ${result2.data.status}`);
          console.log(`   respondedAt: ${result2.data.respondedAt}`);
          console.log(`   respondedBy: ${result2.data.respondedBy}\n`);
        } else {
          console.log(`❌ Erro: ${result2.error || 'Erro desconhecido'}\n`);
        }
        
      } else {
        console.log('⚠️  Nenhuma solicitação encontrada com waMessageId. Crie uma solicitação primeiro!\n');
        console.log('💡 Para criar uma solicitação, use o frontend ou faça uma requisição POST para /api/escalacoes/solicitacoes\n');
      }
    } else {
      console.log('⚠️  Nenhuma solicitação encontrada. Crie uma solicitação primeiro!\n');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar solicitações:', error.message);
    console.error(`   Verifique se o servidor está rodando em ${API_BASE}\n`);
  }
}

// Executar teste
testAutoStatus().catch(console.error);

