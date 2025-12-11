# 📋 Instruções de Instalação e Uso - Sistema Velotax

## 🚀 Como Executar Localmente

Este é um sistema web estático que funciona diretamente no navegador, sem necessidade de servidor ou instalação de programas.

### Passo 1: Extrair os Arquivos

1. Extraia todos os arquivos do ZIP para uma pasta no seu computador
   - Exemplo: `C:\Users\SeuNome\Desktop\SistemaVelotax\`

### Passo 2: Abrir o Sistema

1. Navegue até a pasta onde você extraiu os arquivos
2. Encontre o arquivo `index.html`
3. **Clique duas vezes** no arquivo `index.html` para abrir no navegador padrão

   **OU**

4. Clique com o botão direito no `index.html`
5. Selecione "Abrir com" → Escolha seu navegador preferido (Chrome, Edge, Firefox, etc.)

### Passo 3: Primeiro Acesso

1. O sistema abrirá na tela de login
2. **Usuário padrão:** `admin`
3. **Senha padrão:** `admin123`
4. Após fazer login, você verá a página inicial com 3 cards:
   - 🏦 **BACEN** - Reclamações do Banco Central
   - 🔄 **N2** - Portabilidade bancária
   - 🤖 **Chatbot** - Demandas do chatbot

### Passo 4: Navegar pelo Sistema

- Clique em qualquer card para acessar a área específica
- Use os botões de navegação no topo para alternar entre:
  - 📊 Dashboard
  - ➕ Nova Ficha
  - 📋 Lista de Fichas
  - 📈 Relatórios

## ⚠️ Requisitos

- **Navegador moderno:** Chrome, Edge, Firefox ou Safari (versões recentes)
- **JavaScript habilitado:** Deve estar ativo por padrão
- **Não precisa de internet:** O sistema funciona completamente offline após o primeiro carregamento

## 📁 Estrutura de Arquivos

```
SistemaVelotax/
├── index.html          ← Página inicial (ABRIR ESTE ARQUIVO)
├── bacen.html          ← Página BACEN
├── n2.html             ← Página N2
├── chatbot.html        ← Página Chatbot
├── css/                ← Estilos do sistema
├── js/                 ← Funcionalidades JavaScript
├── img/                ← Imagens e logos
└── INSTRUCOES_INSTALACAO.md  ← Este arquivo
```

## 🔧 Solução de Problemas

### O sistema não abre
- Verifique se todos os arquivos foram extraídos corretamente
- Tente abrir com outro navegador
- Verifique se o JavaScript está habilitado no navegador

### As imagens não aparecem
- Verifique se a pasta `img/` está presente
- Certifique-se de que os arquivos de imagem estão na pasta correta

### O login não funciona
- Use: usuário `admin` e senha `admin123`
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Tente em modo anônimo/privado

### Dados não estão salvando
- O sistema usa o armazenamento local do navegador
- Certifique-se de que não está em modo anônimo/privado
- Verifique se o navegador permite armazenamento local

## 💾 Backup dos Dados

Os dados são salvos automaticamente no navegador. Para fazer backup:

1. Abra as Ferramentas de Desenvolvedor (F12)
2. Vá na aba "Application" (Chrome) ou "Armazenamento" (Firefox)
3. Expanda "Local Storage"
4. Copie os dados ou exporte conforme necessário

## 📞 Suporte

Em caso de dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Versão:** 1.0  
**Data:** 2024  
**Desenvolvido para:** Velotax













