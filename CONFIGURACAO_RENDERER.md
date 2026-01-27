# 🔧 Configuração do Renderer no Render.com

## ❌ Problema Atual

O renderer está tentando acessar `http://localhost:8090`, mas como está rodando no Render.com (servidor remoto), `localhost` não funciona.

**Erro:**
```
[AUTO-STATUS] ❌ Erro ao fazer requisição: fetch failed
```

## ✅ Solução

### Opção 1: Configurar Variável de Ambiente no Render.com (RECOMENDADO)

1. Acesse o painel do Render.com
2. Vá em **Environment** (Variáveis de Ambiente)
3. Adicione:

```
BACKEND_URL=https://velohub-278491073220.us-east1.run.app
```

**OU para teste local (se o backend estiver acessível publicamente):**

```
BACKEND_URL=http://172.16.50.66:8090
```

### Opção 2: Usar URL de Produção (Fallback)

O código já tem fallback para a URL de produção:
```
https://velohub-278491073220.us-east1.run.app
```

Mas é melhor configurar explicitamente via variável de ambiente.

## 📋 URLs Disponíveis

### Produção (GCP Cloud Run)
```
https://velohub-278491073220.us-east1.run.app
```

### Local (se backend estiver acessível publicamente)
```
http://172.16.50.66:8090
```

**⚠️ ATENÇÃO:** Para usar URL local, o backend precisa estar acessível publicamente (não apenas localhost).

## 🔧 Como Configurar no Render.com

1. Acesse: https://dashboard.render.com
2. Selecione o serviço do WhatsApp API
3. Vá em **Environment**
4. Clique em **Add Environment Variable**
5. Adicione:
   - **Key:** `BACKEND_URL`
   - **Value:** `https://velohub-278491073220.us-east1.run.app`
6. Salve e faça redeploy

## 🧪 Teste

Após configurar:

1. **Envie uma reação ✅ no WhatsApp**
2. **Verifique os logs do renderer:**
   ```
   [AUTO-STATUS] Fazendo requisição HTTP...
   [AUTO-STATUS] URL: https://velohub-278491073220.us-east1.run.app/api/escalacoes/solicitacoes/auto-status
   [AUTO-STATUS] ✅ Resposta do backend: ...
   ```

3. **Verifique os logs do backend:**
   ```
   [AUTO-STATUS] Recebida requisição: ...
   [AUTO-STATUS] ✅ Solicitação encontrada: ...
   ```

## 🚨 Importante

- O backend precisa estar **rodando e acessível publicamente**
- Se estiver testando local, use o IP da máquina (`172.16.50.66:8090`) e não `localhost`
- Para produção, use sempre a URL do GCP Cloud Run

