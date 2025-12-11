# 🚀 Sistema Velotax - Gestão de Reclamações BACEN

## 📋 **Visão Geral**

Sistema completo e moderno para gestão de reclamações BACEN, desenvolvido com identidade visual Velotax. O sistema permite registrar, gerenciar, buscar e analisar reclamações de forma eficiente e intuitiva.

### 🎯 **Funcionalidades Principais**

- 🔐 **Sistema de Autenticação** com 3 perfis (Administrador, Atendente, Usuário)
- 📋 **Fichas Detalhadas** com visualização completa e edição
- 🔍 **Busca Avançada** com múltiplos filtros e ordenação
- 📊 **Dashboard Completo** com KPIs e gráficos interativos
- 📈 **Sistema de Relatórios** robusto com 6 tipos diferentes
- 📥 **Importação de Dados** via Excel/CSV
- 🎨 **Design Responsivo** seguindo identidade Velotax

### ✅ Registro de Reclamações
- **Dados Básicos**: Data da reclamação, data de recebimento, prazo retorno BACEN, responsável
- **Dados do Cliente**: Nome, CPF (com validação), origem, telefone
- **Detalhes**: Motivo reduzido e detalhado da reclamação
- **Módulo de Contato**: Checkboxes para Atendimento, Reclame Aqui, BACEN, Procon, N2
- **Protocolos Anteriores**: Sistema dinâmico para adicionar múltiplos protocolos
- **Status**: Não Iniciado, Em Tratativa, Concluído, Respondido (com data)
- **Histórico de Tentativas**: Sistema para registrar tentativas de contato com data/hora, resultado e observações

### 📊 Dashboard
- Estatísticas em tempo real
- Contadores por status
- Visualização clara dos dados

### 📋 Lista de Reclamações
- **Visualização em Lista**: Cards expansíveis com informações resumidas
- **Busca**: Por nome do cliente, CPF ou motivo
- **Filtros**: Por status da reclamação
- **Detalhes Completos**: Expansão para ver todos os dados da reclamação

### 📈 Relatórios
- **Relatório por Período**: Filtrar por data inicial e final
- **Relatório por Status**: Análise estatística por status
- **Relatório por Responsável**: Performance dos responsáveis
- **Relatório Completo**: Todos os dados em tabela
- **Exportação**: Download em CSV

## 🏗️ **Arquitetura do Sistema**

### **Tecnologias Utilizadas**
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Storage**: LocalStorage (persistência local)
- **UI Framework**: Custom CSS com design system Velotax
- **Gráficos**: Implementação nativa com CSS/JavaScript
- **Importação**: Processamento de Excel/CSV client-side

### **Estrutura de Arquivos**
```
Bacen/
├── 📄 index.html                 # Página principal do sistema
├── 📄 importacao.html           # Página de importação de dados
├── 📄 VALIDACAO.md              # Guia de validação
├── 📄 README.md                 # Este arquivo
├── 📁 css/
│   ├── styles.css              # Estilos principais (cores Velotax)
│   ├── components.css          # Componentes reutilizáveis
│   └── theme-dark.css          # Tema escuro
└── 📁 js/
    ├── auth-system.js          # Autenticação e perfis
    ├── ficha-detalhada.js      # Fichas completas
    ├── busca-avancada.js       # Sistema de busca
    ├── dashboard-avancado.js  # Dashboard e métricas
    ├── relatorios-robusto.js   # Sistema de relatórios
    ├── importador-dados.js     # Importação Excel/CSV
    ├── theme-toggle.js         # Alternância de tema
    ├── main.js                 # Lógica principal
    └── demo-data.js            # Dados demo
```

## 🎨 **Identidade Visual Velotax**

### **Cores Oficiais**
```css
--azul-escuro: #000058      /* Azul principal */
--azul-royal: #1634FF      /* Azul secundário */
--azul-ciano: #1DFDB9      /* Azul claro */
--laranja-destaque: #FF8400 /* Laranja para destaques */
--cinza-escuro: #272A30    /* Cinza escuro */
--cinza-claro: #ECECEC     /* Cinza claro */
--rosa-vibrante: #FF00D7   /* Rosa vibrante */
--roxo-escuro: #791DD0     /* Roxo escuro */
```

### **Foco Visual**
- **Branco**: Fundo principal e containers
- **Azul**: Elementos primários eCTAs
- **Preto**: Textos e elementos de contraste

### **Design System**
- Tipografia moderna e legível
- Sombras sutis e gradientes
- Animações suaves (0.3s ease)
- Layout responsivo mobile-first

## 🔐 **Sistema de Autenticação**

### **Perfis de Usuário**

#### 👑 **Administrador**
- Controle total do sistema
- Gestão de usuários
- Acesso a todos os relatórios
- Configurações avançadas

#### 👤 **Atendente**
- Edição e gestão de fichas
- Busca e visualização
- Relatórios básicos
- Atualização de status

#### 👁️ **Usuário**
- Visualização limitada
- Busca restrita
- Relatórios resumidos
- Sem permissão de edição

### **Credenciais Demo**
```
Administrador: admin@velotax.com / admin123
Atendente:    atendente@velotax.com / atend123
Usuário:      usuario@velotax.com / user123
```

## 🚀 **Como Começar**

### **Pré-requisitos**
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Não requer instalação
- Funciona offline após carregamento

### **Passo 1: Acessar o Sistema**
```bash
# Abrir no navegador
start index.html
# ou
open index.html
```

### **Passo 2: Login Inicial**
1. Use credenciais demo
2. Explore o dashboard
3. Teste as funcionalidades

### **Passo 3: Importar Dados**
1. Vá para `importacao.html`
2. Arraste a planilha
3. Aguarde o processamento
4. Valide os resultados

### **Passo 4: Configurar Produção**
1. Alterar credenciais
2. Importar dados reais
3. Configurar backups
4. Treinar equipe

## 📊 **Dashboard e Métricas**

### **KPIs Principais**
- 📋 Total de Fichas
- ⏳ Em Tratativa
- ✅ Concluídos
- 📈 Taxa de Conclusão

### **Gráficos Interativos**
- 📊 Distribuição por Status
- 📍 Reclamações por Origem
- 👥 Performance por Responsável
- 💰 Valores Negociados

### **Filtros Temporais**
- Últimos 7 dias
- Últimos 30 dias
- Últimos 90 dias
- Este ano
- Todo o período

## 🔍 **Sistema de Busca Avançada**

### **Busca Textual**
- CPF, nome, motivo, observações
- Busca instantânea
- Destaque de resultados

### **Filtros Múltiplos**
- 📅 Período de datas
- 📊 Status da reclamação
- 📍 Origem do contato
- 👤 Responsável atribuído
- 📞 Módulos de contato
- 💰 Faixa de valores

### **Ordenação**
- Data de criação
- Nome do cliente
- CPF
- Status
- Responsável
- Valor negociado

## 📋 **Fichas Detalhadas**

### **Estrutura de Dados**
Baseado na planilha com 25 campos principais:
- Dados pessoais (nome, CPF, telefone)
- Informações da reclamação (data, motivo, origem)
- Contato e tentativas
- Protocolos e módulos
- Resolução e valores

### **Abas Organizadas**
1. **📝 Dados Básicos**: Informações principais
2. **📞 Contato**: Tentativas e módulos
3. **📄 Protocolos**: Protocolos anteriores
4. **✅ Resolução**: Status e resultado

### **Funcionalidades**
- Visualização completa
- Modo de edição inline
- Exportação em texto
- Histórico de alterações

## 📈 **Sistema de Relatórios**

### **Tipos Disponíveis**
1. **📅 Relatório por Período**: Análise temporal
2. **📊 Relatório por Status**: Distribuição estatística
3. **👥 Relatório por Responsável**: Performance individual
4. **📍 Relatório por Origem**: Análise por canal
5. **💰 Relatório Financeiro**: Valores negociados
6. **📋 Relatório Completo**: Todos os dados

### **Recursos**
- Filtros customizáveis
- Exportação múltiplos formatos
- Visualização profissional
- Análises estatísticas

## 📥 **Importação de Dados**

### **Formatos Suportados**
- ✅ Excel (.xlsx, .xls)
- ✅ CSV (.csv)
- ✅ Drag & Drop
- ✅ Upload tradicional

### **Mapeamento Automático**
- Detecção de campos
- Validação de dados
- Tratamento de erros
- Logs detalhados

### **Processo**
1. Arrastar ou selecionar arquivo
2. Validação automática
3. Mapeamento de campos
4. Importação com progresso
5. Relatório de resultados

## 💾 **Armazenamento**

- **LocalStorage**: Todos os dados são salvos localmente no navegador
- **Persistência**: Dados mantidos entre sessões
- **Backup**: Recomenda-se exportar relatórios regularmente

## 📱 **Responsividade e Acessibilidade**

### **Breakpoints**
- 📱 Mobile: 320px - 768px
- 📱 Tablet: 768px - 1024px
- 💻 Desktop: 1024px+

### **Adaptações**
- Layout em coluna única no mobile
- Botões maiores para toque
- Menus otimizados
- Scrolling horizontal mínimo

### **Acessibilidade**
- Contraste WCAG AA
- Navegação por teclado
- Labels descritivos
- Feedback visual claro

## 🔧 **Troubleshooting**

### **Problemas Comuns**

#### **Login não funciona**
```javascript
// Verificar console para erros
localStorage.clear(); // Limpar e tentar novamente
```

#### **Dados não aparecem**
```javascript
// Verificar localStorage
console.log(localStorage.getItem('velotax_fichas'));
// Adicionar dados demo se necessário
```

#### **Gráficos não carregam**
```javascript
// Verificar se há dados suficientes
// Recarregar página
```

### **Performance**
- Limpar localStorage periodicamente
- Evitar muitos dados em memória
- Usar dados demo para testes

## 📞 **Suporte e Contato**

### **Documentação**
- 📖 Guia de Validação: `VALIDACAO.md`
- 🎥 Vídeos tutoriais (em breve)
- 📚 Base de conhecimento online

### **Suporte Técnico**
- 📧 Email: suporte@velotax.com
- 📞 Telefone: (11) 4000-0000
- 💬 Chat online: 24/7

### **Comunidade**
- 🐛 Reportar bugs: GitHub Issues
- 💡 Sugestões: Feedback form
- 🔄 Updates: Newsletter mensal

## 🚀 **Roadmap Futuro**

### **Curto Prazo (1-2 meses)**
- [ ] Backend com banco de dados
- [ ] API RESTful
- [ ] Autenticação JWT
- [ ] Upload de arquivos

### **Médio Prazo (3-6 meses)**
- [ ] Aplicativo mobile
- [ ] Integração com APIs externas
- [ ] Inteligência artificial
- [ ] Automação de processos

### **Longo Prazo (6-12 meses)**
- [ ] Multi-tenant
- [ ] Advanced analytics
- [ ] Machine learning
- [ ] Blockchain integration

## 📄 **Licença e Termos**

Este projeto é propriedade intelectual da Velotax e está protegido por direitos autorais.

### **Uso Permitido**
- ✅ Uso interno da Velotax
- ✅ Modificação com autorização
- ✅ Distribuição controlada

### **Restrições**
- ❌ Uso comercial sem licença
- ❌ Distribuição pública
- ❌ Venda ou revenda

## 🎉 **Conclusão**

O Sistema Velotax representa uma solução completa e moderna para gestão de reclamações BACEN, com:

- ✅ **Interface intuitiva** e profissional
- ✅ **Funcionalidades robustas** e completas
- ✅ **Design responsivo** e acessível
- ✅ **Performance otimizada** e escalável
- ✅ **Identidade visual** consistente

**O sistema está pronto para uso imediato! 🚀**

---

*Desenvolvido com ❤️ pela equipe Velotax*
