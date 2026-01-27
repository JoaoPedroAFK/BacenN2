# 📱 Exemplo de Uso - ReportsDAY

<!-- VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team -->

## 🎯 Como Usar o Baileys Helper no ReportsDAY

### Passo 1: Copiar o Script

Copie o arquivo `baileys-helper.js` para o repositório ReportsDAY:

```bash
# Se estiver no VeloHub
cp scripts/baileys-helper.js /caminho/para/ReportsDAY/scripts/

# Ou baixe diretamente do GitHub
```

### Passo 2: Instalar Dependências no ReportsDAY

```bash
cd /caminho/para/ReportsDAY
npm install @whiskeysockets/baileys pino qrcode-terminal
```

### Passo 3: Usar o Script

#### Exemplo 1: Conectar ao WhatsApp

```bash
node scripts/baileys-helper.js connect
```

**O que acontece:**
1. Script verifica se Baileys está instalado
2. Cria diretório `auth/` se necessário
3. Gera QR Code
4. Você escaneia com WhatsApp
5. Conexão estabelecida

#### Exemplo 2: Listar Grupos para Integração

```bash
node scripts/baileys-helper.js groups
```

**Resultado:**
- Lista todos os grupos no console
- Salva em `grupos-baileys.json`
- Você pode usar os IDs para integrar no ReportsDAY

#### Exemplo 3: Verificar Status

```bash
node scripts/baileys-helper.js status
```

**Útil para:**
- Verificar se está conectado
- Diagnosticar problemas
- Verificar estrutura do projeto

## 🔗 Integração com ReportsDAY

### Usar IDs dos Grupos no Código

Após executar `groups`, você terá um arquivo `grupos-baileys.json`:

```json
{
  "grupos": [
    {
      "nome": "Grupo de Monitoramento",
      "id": "120363400851545835@g.us",
      "participantes": 25
    }
  ],
  "total": 1,
  "atualizadoEm": "2025-01-31T12:00:00.000Z"
}
```

Use esses IDs no seu código ReportsDAY:

```javascript
// No seu código ReportsDAY
const GRUPO_MONITORAMENTO = "120363400851545835@g.us";

// Enviar notificação
await enviarMensagem(GRUPO_MONITORAMENTO, "Sistema online!");
```

## 📋 Checklist de Integração

- [ ] Script copiado para ReportsDAY
- [ ] Dependências instaladas
- [ ] Teste de conexão realizado
- [ ] Grupos listados e IDs obtidos
- [ ] IDs integrados no código ReportsDAY
- [ ] Teste de envio de mensagem realizado

## 🚀 Próximos Passos

1. **Integrar no ReportsDAY:**
   - Adicionar função de envio de notificações
   - Usar IDs dos grupos obtidos
   - Configurar alertas automáticos

2. **Automatizar:**
   - Criar script de monitoramento
   - Integrar com sistema de relatórios
   - Configurar notificações automáticas

---

**Nota:** Este script é genérico e funciona em qualquer projeto com Baileys, não apenas no ReportsDAY.
