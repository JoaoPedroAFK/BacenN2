# 🔧 Instruções para Corrigir o Renderer

## 📍 Repositório do Renderer

**URL:** https://github.com/joaosilva-source/whatsapp-api

## 🔍 Onde Procurar

### 1. Arquivo Principal
Abra o arquivo: **`index.js`**

### 2. Procure por este código:
```javascript
console.log('[AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅', {
  waMessageId: '...',
  reactorDigits: '...'
});
```

## ✅ O Que Adicionar

### Opção 1: Adicionar função e chamar

**1. Adicione esta função no início do arquivo (ou em um módulo separado):**

```javascript
/**
 * Função para atualizar status via reação do WhatsApp
 */
async function atualizarStatusViaReacao(waMessageId, reaction, reactorDigits) {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8090';
  const AUTO_STATUS_ENDPOINT = `${BACKEND_URL}/api/escalacoes/solicitacoes/auto-status`;

  try {
    const body = {
      waMessageId: waMessageId,
      reaction: reaction,
      reactor: reactorDigits
    };

    console.log('[AUTO-STATUS] Fazendo requisição HTTP...');
    console.log('[AUTO-STATUS] URL:', AUTO_STATUS_ENDPOINT);
    console.log('[AUTO-STATUS] Body:', JSON.stringify(body));

    const response = await fetch(AUTO_STATUS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('[AUTO-STATUS] Status HTTP:', response.status);

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
```

**2. Substitua o código que faz o log por:**

```javascript
// ANTES (só faz log):
console.log('[AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅', {
  waMessageId: '3EB077B9BE075B4BCD6C63',
  reactorDigits: '35257503981709'
});

// DEPOIS (faz log E requisição HTTP):
console.log('[AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅', {
  waMessageId: waMessageId,
  reactorDigits: reactorDigits
});

// Adicionar esta chamada:
await atualizarStatusViaReacao(waMessageId, reaction, reactorDigits);
```

### Opção 2: Adicionar diretamente no código existente

Se você encontrar algo como:

```javascript
if (reaction === '✅') {
  console.log('[AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅', {
    waMessageId: keyId,
    reactorDigits: reactorDigits
  });
  // AQUI ADICIONE A REQUISIÇÃO HTTP
}
```

**Substitua por:**

```javascript
if (reaction === '✅') {
  console.log('[AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅', {
    waMessageId: keyId,
    reactorDigits: reactorDigits
  });
  
  // ADICIONAR ESTE CÓDIGO:
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8090';
    const response = await fetch(`${BACKEND_URL}/api/escalacoes/solicitacoes/auto-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waMessageId: keyId,
        reaction: reaction,
        reactor: reactorDigits
      })
    });
    
    const result = await response.json();
    console.log('[AUTO-STATUS] ✅ Resposta:', result);
  } catch (error) {
    console.error('[AUTO-STATUS] ❌ Erro:', error.message);
  }
}
```

## 🔧 Configuração de Variável de Ambiente

No Render.com ou no arquivo `.env` do renderer, adicione:

```
BACKEND_URL=http://localhost:8090
```

**OU para produção:**

```
BACKEND_URL=http://172.16.50.66:8090
```

## 📝 Checklist

- [ ] Abrir arquivo `index.js` no repositório
- [ ] Encontrar o código que faz o log `[AUTO-STATUS/UPSERT]`
- [ ] Adicionar a função `atualizarStatusViaReacao()` ou código inline
- [ ] Chamar a função após detectar a reação
- [ ] Configurar variável de ambiente `BACKEND_URL`
- [ ] Testar localmente
- [ ] Fazer commit e push
- [ ] Deploy no Render.com

## 🧪 Teste

Após adicionar o código:

1. **Inicie o backend local:**
   ```bash
   cd backend
   node server.js
   ```

2. **Inicie o renderer local:**
   ```bash
   node index.js
   ```

3. **Envie uma reação ✅ no WhatsApp**

4. **Verifique os logs:**
   - Renderer deve mostrar: `[AUTO-STATUS] Fazendo requisição HTTP...`
   - Backend deve mostrar: `[AUTO-STATUS] Recebida requisição`

## 🚨 Importante

- Certifique-se de que o backend está rodando antes de testar
- Use `http://localhost:8090` para teste local
- Use o IP da máquina (`http://172.16.50.66:8090`) se o renderer estiver em outra máquina
- Adicione tratamento de erros para não quebrar o renderer se o backend estiver offline

