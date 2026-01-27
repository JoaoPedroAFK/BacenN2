# 📱 Script para Obter IDs dos Grupos WhatsApp via Baileys
<!-- VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team -->

## 🎯 Objetivo

Script standalone para conectar ao WhatsApp via Baileys e listar todos os grupos com seus IDs, salvando os dados em arquivos JSON e TXT.

---

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **Dependências do Baileys** instaladas:
   ```bash
   npm install @whiskeysockets/baileys pino qrcode-terminal
   ```

---

## 🚀 Como Usar

### **1. Instalar Dependências (se necessário)**

Se você já tem o projeto Baileys-API rodando, as dependências já estão instaladas. Caso contrário:

```bash
npm install @whiskeysockets/baileys pino qrcode-terminal
```

### **2. Executar o Script**

```bash
node scripts/get-grupos-baileys.js
```

### **3. Escanear QR Code**

1. O script exibirá um QR Code no terminal
2. Abra o WhatsApp no celular
3. Vá em **Configurações** → **Aparelhos conectados**
4. Toque em **Conectar um aparelho**
5. Escaneie o QR Code exibido no terminal

### **4. Aguardar Conexão**

Após escanear o QR Code:
- O script conectará automaticamente
- Buscará todos os grupos
- Salvará os dados em arquivos

---

## 📁 Arquivos Gerados

O script cria 3 arquivos na raiz do projeto:

### **1. `grupos-whatsapp.json`**
Arquivo JSON completo com todas as informações dos grupos:
```json
{
  "atualizadoEm": "2025-01-31T10:00:00.000Z",
  "totalGrupos": 5,
  "grupos": [
    {
      "nome": "Nome do Grupo",
      "id": "120363123456789012@g.us",
      "descricao": "Descrição do grupo",
      "criadoEm": "2024-01-01T00:00:00.000Z",
      "participantes": 10,
      "admin": ["5511999999999@s.whatsapp.net"]
    }
  ]
}
```

### **2. `grupos-ids.txt`**
Arquivo de texto legível com nome e ID:
```
Total de grupos: 5
Atualizado em: 31/01/2025 10:00:00

Nome do Grupo | 120363123456789012@g.us
Outro Grupo | 120363987654321098@g.us
```

### **3. `grupos-ids-only.txt`**
Arquivo com apenas os IDs (um por linha) para uso em scripts:
```
120363123456789012@g.us
120363987654321098@g.us
120363111111111111@g.us
```

---

## 📊 Exemplo de Saída no Console

```
═══════════════════════════════════════════════════════
📱 Script de Listagem de Grupos WhatsApp (Baileys)
═══════════════════════════════════════════════════════

🔌 Iniciando conexão com WhatsApp...

═══════════════════════════════════════════════════════
📱 QR CODE GERADO! ESCANEIE COM SEU WHATSAPP AGORA!
═══════════════════════════════════════════════════════

[QR CODE AQUI]

✅ WHATSAPP CONECTADO!
📋 Buscando grupos...

═══════════════════════════════════════════════════════
📊 TOTAL DE GRUPOS ENCONTRADOS: 5
═══════════════════════════════════════════════════════

1. Grupo de Trabalho
   ID: 120363123456789012@g.us
   Participantes: 10

2. Suporte Técnico
   ID: 120363987654321098@g.us
   Participantes: 5

...

✅ Dados salvos em: grupos-whatsapp.json
✅ IDs salvos em: grupos-ids.txt
✅ IDs puros salvos em: grupos-ids-only.txt
```

---

## 🔧 Configurações

### **Pasta de Autenticação**

O script usa a pasta `auth/` na raiz do projeto para salvar as credenciais do WhatsApp. Se você já tem uma pasta `auth/` de outro projeto Baileys, pode reutilizá-la.

### **Reutilizar Autenticação**

Se você já tem a pasta `auth/` configurada:
- O script não pedirá QR Code novamente
- Conectará automaticamente usando as credenciais salvas

### **Limpar Autenticação**

Para forçar novo QR Code:
```bash
# Windows
rmdir /s /q auth

# Linux/Mac
rm -rf auth
```

---

## 📝 Estrutura dos Dados

### **Informações de Cada Grupo:**

- **nome**: Nome do grupo
- **id**: ID completo do grupo (formato: `120363123456789012@g.us`)
- **descricao**: Descrição do grupo (se houver)
- **criadoEm**: Data de criação (ISO format)
- **participantes**: Número de participantes
- **admin**: Array com IDs dos administradores

---

## ⚠️ Observações Importantes

1. **Autenticação**: Na primeira execução, será necessário escanear o QR Code
2. **Conexão**: O script mantém a conexão ativa enquanto estiver rodando
3. **Arquivos**: Os arquivos são salvos na raiz do projeto (mesmo diretório do script)
4. **Permissões**: Certifique-se de ter permissão para criar arquivos no diretório

---

## 🛠️ Troubleshooting

### **Erro: "Cannot find module '@whiskeysockets/baileys'"**

**Solução:**
```bash
npm install @whiskeysockets/baileys pino qrcode-terminal
```

### **QR Code não aparece**

**Solução:**
- Verifique se o terminal suporta caracteres especiais
- Tente aumentar o tamanho da fonte do terminal
- Use um terminal moderno (Windows Terminal, PowerShell, ou terminal Linux/Mac)

### **Erro de conexão**

**Solução:**
- Verifique sua conexão com a internet
- Certifique-se de que o WhatsApp Web não está aberto em outro lugar
- Limpe a pasta `auth/` e tente novamente

### **Grupos não aparecem**

**Solução:**
- Certifique-se de que está conectado corretamente
- Verifique se você realmente participa de grupos no WhatsApp
- Aguarde alguns segundos após a conexão

---

## 📚 Uso dos IDs

Os IDs dos grupos podem ser usados para:

1. **Enviar mensagens para grupos específicos**
2. **Configurar destinatários padrão**
3. **Automatizar envios**
4. **Integração com APIs**

### **Exemplo de Uso do ID:**

```javascript
const grupoId = "120363123456789012@g.us";
await sock.sendMessage(grupoId, { text: "Mensagem para o grupo" });
```

---

## ✅ Checklist de Execução

- [ ] Dependências instaladas
- [ ] Script executado
- [ ] QR Code escaneado
- [ ] Conexão estabelecida
- [ ] Grupos listados
- [ ] Arquivos gerados
- [ ] IDs copiados para uso

---

**Versão:** v1.0.0  
**Data:** 2025-01-31  
**Autor:** VeloHub Development Team
