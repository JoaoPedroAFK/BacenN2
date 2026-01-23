# 🚀 Baileys Helper - Script Genérico para Projetos com Baileys

<!-- VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team -->

## 📋 Descrição

Script genérico e portável para trabalhar com Baileys em qualquer projeto. Funciona automaticamente detectando a estrutura do projeto e oferecendo comandos úteis para gerenciar conexões WhatsApp.

## ✨ Funcionalidades

- ✅ **Detecção automática** de Baileys e dependências
- ✅ **Conexão WhatsApp** com QR Code
- ✅ **Listagem de grupos** e contatos
- ✅ **Envio de mensagens** via linha de comando
- ✅ **Verificação de status** da conexão
- ✅ **Informações do projeto** e dependências
- ✅ **Portável** - funciona em qualquer projeto

## 📦 Instalação

### 1. Copiar o Script

Copie o arquivo `baileys-helper.js` para a pasta `scripts/` do seu projeto (ou qualquer pasta).

### 2. Instalar Dependências

Certifique-se de que as dependências estão instaladas:

```bash
npm install @whiskeysockets/baileys pino qrcode-terminal
```

## 🚀 Como Usar

### Comandos Básicos

```bash
# Ver ajuda
node scripts/baileys-helper.js

# Conectar ao WhatsApp
node scripts/baileys-helper.js connect

# Listar grupos
node scripts/baileys-helper.js groups

# Listar contatos
node scripts/baileys-helper.js contacts

# Verificar status
node scripts/baileys-helper.js status

# Ver informações do projeto
node scripts/baileys-helper.js info

# Enviar mensagem
node scripts/baileys-helper.js send --to "5511999999999@s.whatsapp.net" --msg "Olá!"
```

## 📖 Comandos Detalhados

### `connect`
Conecta ao WhatsApp e mantém a conexão ativa.

```bash
node scripts/baileys-helper.js connect
```

**O que faz:**
- Cria diretório `auth/` se não existir
- Gera QR Code para escanear
- Mantém conexão ativa
- Reconecta automaticamente em caso de desconexão

**Quando usar:**
- Testar conexão
- Manter sessão ativa
- Desenvolvimento e testes

---

### `groups`
Lista todos os grupos do WhatsApp.

```bash
node scripts/baileys-helper.js groups
```

**O que faz:**
- Conecta ao WhatsApp
- Busca todos os grupos
- Exibe lista no console
- Salva em `grupos-baileys.json`

**Saída:**
```
📊 Total de grupos: 5

1. Grupo de Trabalho
   ID: 120363400851545835@g.us
   Participantes: 25

2. Família
   ID: 120363400851545836@g.us
   Participantes: 10
```

**Arquivos gerados:**
- `grupos-baileys.json` - Lista completa em JSON

---

### `contacts`
Lista contatos do WhatsApp.

```bash
node scripts/baileys-helper.js contacts
```

**O que faz:**
- Conecta ao WhatsApp
- Busca contatos
- Exibe no console (primeiros 20)

---

### `status`
Verifica status da conexão atual.

```bash
node scripts/baileys-helper.js status
```

**O que exibe:**
- Status da conexão (conectado/não conectado)
- Status do socket
- Existência do diretório auth

---

### `send`
Envia mensagem para um JID específico.

```bash
node scripts/baileys-helper.js send --to "5511999999999@s.whatsapp.net" --msg "Olá, esta é uma mensagem de teste!"
```

**Parâmetros:**
- `--to` - JID do destinatário (obrigatório)
- `--msg` - Mensagem a enviar (obrigatório)

**Formatos de JID:**
- Individual: `5511999999999@s.whatsapp.net`
- Grupo: `120363400851545835@g.us`

---

### `info`
Exibe informações do projeto e dependências.

```bash
node scripts/baileys-helper.js info
```

**O que exibe:**
- Nome e versão do projeto
- Diretório atual
- Versão do Node.js
- Status das dependências (Baileys, Pino, QRCode Terminal)

## 🔧 Configuração

### Diretório de Autenticação

Por padrão, o script usa o diretório `auth/` na raiz do projeto. Para alterar, edite a constante `AUTH_DIR` no script:

```javascript
const AUTH_DIR = 'auth'; // Altere para o diretório desejado
```

### Configurações de Conexão

As configurações de conexão podem ser ajustadas na constante `CONFIG`:

```javascript
const CONFIG = {
  browser: ['Baileys Helper', 'Chrome', '1.0.0'],
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 30000,
  markOnlineOnConnect: true
};
```

## 📁 Estrutura de Arquivos

Após usar o script, você terá:

```
seu-projeto/
├── scripts/
│   └── baileys-helper.js      # Script principal
├── auth/                      # Diretório de autenticação (criado automaticamente)
│   ├── creds.json
│   └── ...
├── grupos-baileys.json        # Lista de grupos (gerado pelo comando groups)
└── package.json
```

## 🛠️ Integração em Outros Projetos

### 1. Copiar o Script

```bash
# Copiar para o projeto ReportsDAY
cp scripts/baileys-helper.js /caminho/para/ReportsDAY/scripts/
```

### 2. Instalar Dependências no Projeto Destino

```bash
cd /caminho/para/ReportsDAY
npm install @whiskeysockets/baileys pino qrcode-terminal
```

### 3. Usar o Script

```bash
node scripts/baileys-helper.js connect
```

## ⚠️ Troubleshooting

### Erro: "Baileys não está instalado"

**Solução:**
```bash
npm install @whiskeysockets/baileys
```

### Erro: "Cannot find module 'pino'"

**Solução:**
```bash
npm install pino
```

### QR Code não aparece

**Solução:**
- Certifique-se de que `qrcode-terminal` está instalado
- Verifique se o terminal suporta caracteres especiais
- Tente em outro terminal

### Conexão cai frequentemente

**Solução:**
- Verifique sua conexão de internet
- Aumente `keepAliveIntervalMs` na configuração
- Verifique se não há múltiplas instâncias rodando

### Deslogado (loggedOut)

**Solução:**
- O script limpa automaticamente a pasta `auth/`
- Execute novamente para gerar novo QR Code
- Escaneie o QR Code novamente

## 📝 Exemplos de Uso

### Exemplo 1: Obter IDs dos Grupos

```bash
# Conectar e listar grupos
node scripts/baileys-helper.js groups

# O resultado será salvo em grupos-baileys.json
```

### Exemplo 2: Testar Envio de Mensagem

```bash
# Enviar mensagem de teste
node scripts/baileys-helper.js send \
  --to "5511999999999@s.whatsapp.net" \
  --msg "Teste do Baileys Helper"
```

### Exemplo 3: Verificar Dependências

```bash
# Antes de usar, verificar se tudo está instalado
node scripts/baileys-helper.js info
```

## 🔒 Segurança

- ⚠️ **Nunca commite** a pasta `auth/` no Git
- ⚠️ Adicione `auth/` ao `.gitignore`
- ⚠️ Mantenha as credenciais seguras
- ⚠️ Use variáveis de ambiente para configurações sensíveis

## 📚 Referências

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [Baileys GitHub](https://github.com/WhiskeySockets/Baileys)

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique se todas as dependências estão instaladas
2. Execute `node scripts/baileys-helper.js info` para diagnóstico
3. Verifique os logs de erro no console

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-31  
**Autor:** VeloHub Development Team
