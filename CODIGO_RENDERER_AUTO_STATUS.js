/**
 * CÓDIGO PARA ADICIONAR NO RENDERER
 * 
 * Este código deve ser adicionado onde está o log:
 * [AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅
 */

// Configuração da URL do backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8090';
const AUTO_STATUS_ENDPOINT = `${BACKEND_URL}/api/escalacoes/solicitacoes/auto-status`;

/**
 * Função para atualizar status via reação do WhatsApp
 * @param {string} waMessageId - ID da mensagem do WhatsApp
 * @param {string} reaction - Emoji da reação (✅ ou ❌)
 * @param {string} reactorDigits - Número do usuário que reagiu
 */
async function atualizarStatusViaReacao(waMessageId, reaction, reactorDigits) {
  console.log('[AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅', {
    waMessageId,
    reactorDigits
  });

  try {
    // Preparar body da requisição
    const body = {
      waMessageId: waMessageId,
      reaction: reaction,
      reactor: reactorDigits
    };

    console.log('[AUTO-STATUS] Fazendo requisição HTTP...');
    console.log('[AUTO-STATUS] URL:', AUTO_STATUS_ENDPOINT);
    console.log('[AUTO-STATUS] Body:', JSON.stringify(body));

    // Fazer requisição HTTP
    const response = await fetch(AUTO_STATUS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('[AUTO-STATUS] Status HTTP:', response.status);
    console.log('[AUTO-STATUS] Status Text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AUTO-STATUS] ❌ Erro HTTP:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('[AUTO-STATUS] ✅ Resposta do backend:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('[AUTO-STATUS] ✅ Status atualizado com sucesso!');
      console.log('[AUTO-STATUS] Novo status:', result.data?.status);
    } else {
      console.error('[AUTO-STATUS] ❌ Erro na resposta:', result.error);
    }

    return result;
  } catch (error) {
    console.error('[AUTO-STATUS] ❌ Erro ao fazer requisição:', error.message);
    console.error('[AUTO-STATUS] Stack:', error.stack);
    throw error;
  }
}

/**
 * EXEMPLO DE USO:
 * 
 * Quando detectar a reação, chame:
 */
// No código onde está o log [AUTO-STATUS/UPSERT]
if (reaction === '✅' || reaction === '❌') {
  await atualizarStatusViaReacao(
    waMessageId,  // Ex: '3EB077B9BE075B4BCD6C63'
    reaction,     // Ex: '✅'
    reactorDigits // Ex: '35257503981709'
  );
}

/**
 * VARIÁVEL DE AMBIENTE:
 * 
 * No renderer, configure:
 * BACKEND_URL=http://localhost:8090
 * 
 * Ou para produção:
 * BACKEND_URL=http://172.16.50.66:8090
 */

