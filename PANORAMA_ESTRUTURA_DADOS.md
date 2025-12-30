# 📊 PANORAMA COMPLETO - ESTRUTURA DE DADOS E FLUXO DE IMPORTAÇÃO
<!-- VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team -->

## 🎯 OBJETIVO
Este documento apresenta um panorama completo da estrutura de dados, fluxo de importação e possíveis causas de duplicação no sistema BacenN2.

---

## 📋 1. ESTRUTURA DA PLANILHA

### 1.1 Planilha: "Ação Bacen e Ouvidoria (1).xlsx"

A planilha contém **3 abas principais**:

#### **Aba 1: "Base Bacen"**
- **Tipo identificado**: `bacen`
- **Campos principais**:
  - Nome completo / Nome / Cliente
  - CPF / CPF Tratado
  - Telefone / Celular / Contato
  - Origem / Canal
  - Data entrada / Data Entrada / Data de Entrada / Data
  - Status
  - Responsável / Responsavel / Atendente
  - Motivo reduzido / Tipo / Categoria
  - Motivo Reclamação / Descrição / Observações
  - Finalizado em / Data Finalização
  - Enviar para cobrança? / Enviar Cobrança
  - PIX liberado ou excluído?
  - Aceitou liquidação Antecipada?
  - Prazo Bacen / Prazo BACEN
  - Reclame Aqui
  - Procon
  - Casos Críticos
  - Protocolos Central / Protocolo
  - Tentativas (1ª, 2ª, 3ª)
  - Mês

#### **Aba 2: "Base Ouvidoria"**
- **Tipo identificado**: `n2`
- **Campos principais**:
  - Nome completo / Nome / Cliente
  - CPF / CPF Tratado
  - Telefone / Celular / Contato
  - Origem / Canal
  - Data entrada / Data Entrada
  - Status
  - Responsável / Responsavel
  - Motivo reduzido / Tipo
  - Motivo Reclamação / Descrição
  - N2 Portabilidade?
  - Banco Origem / Banco de Origem
  - Banco Destino / Banco de Destino
  - Status Portabilidade
  - Finalizado em
  - Enviar para cobrança?
  - PIX liberado
  - Aceitou liquidação Antecipada?
  - Protocolos Central
  - Tentativas
  - Mês

#### **Aba 3: "Planilha Chatbot" ou "Chatbot"**
- **Tipo identificado**: `chatbot`
- **Campos principais**:
  - Nome completo / Nome / Cliente
  - **CPF (OBRIGATÓRIO para chatbot)**
  - Telefone / Celular
  - Canal Chatbot / Canal / Origem
  - Data entrada / Data
  - Status
  - Satisfação / Nota Avaliação
  - Resolvido Automaticamente?
  - Encaminhado para Humano?
  - Prazo Resposta
  - Produto / Tipo Produto
  - Motivo reduzido
  - Motivo Reclamação
  - Observações

---

## 🔄 2. FLUXO DE IMPORTAÇÃO

### 2.1 Processo de Importação (`importador-dados.js`)

```
1. USUÁRIO FAZ UPLOAD DA PLANILHA
   ↓
2. processarArquivo() - Detecta formato (Excel/CSV)
   ↓
3. processarExcel() - Lê todas as abas
   ↓
4. Filtrar abas permitidas:
   - "Base Bacen" → tipo: bacen
   - "Base Ouvidoria" → tipo: n2
   - "Planilha Chatbot" ou "Chatbot" → tipo: chatbot
   ↓
5. Para cada linha da planilha:
   a. identificarTipoDemanda() - Identifica tipo pela aba ou campos
   b. mapearParaFicha() - Mapeia campos da planilha para estrutura do sistema
   c. validarFicha() - Valida dados obrigatórios
   d. Adiciona ao array dadosImportados[]
   ↓
6. salvarDados() - Separa por tipo e salva
```

### 2.2 Identificação do Tipo (`identificarTipoDemanda()`)

**PRIORIDADE 1: Campo `_aba` (identificador da aba)**
```javascript
if (dadoBruto["_aba"]) {
    const aba = dadoBruto["_aba"].toString().toLowerCase().trim();
    
    if (aba.includes("planilha chatbot") || aba.includes("chatbot")) {
        return "chatbot";
    }
    if (aba.includes("ouvidoria")) {
        return "n2";
    }
    if (aba.includes("base bacen") || (aba.includes("base") && aba.includes("bacen"))) {
        return "bacen";
    }
}
```

**PRIORIDADE 2: Campos específicos de N2**
- N2 Portabilidade?
- Prazo N2
- Banco Origem / Banco Destino
- Status Portabilidade

**PRIORIDADE 3: Campos específicos de Chatbot**
- Canal Chatbot
- Resolvido Automaticamente?
- Encaminhado para Humano?
- Satisfação / Nota Avaliação

**PRIORIDADE 4: Campos específicos de BACEN**
- Bacen
- Prazo Bacen
- Reclame Aqui
- Procon

**PADRÃO**: Se não conseguir identificar, assume `bacen`

### 2.3 Mapeamento de Campos (`mapearParaFicha()`)

O sistema mapeia os campos da planilha para a estrutura interna:

```javascript
const ficha = {
    id: gerarId(),                    // ID único gerado
    nomeCliente: obterValor("Nome completo") || ...,
    nomeCompleto: obterValor("Nome completo") || ...,
    cpf: limparCPF(obterValor("CPF") || ...),
    cpfTratado: limparCPF(obterValor("CPF Tratado") || ...),
    telefone: obterValor("Telefone") || ...,
    origem: normalizarOrigem(obterValor("Origem") || ...),
    status: inferirStatus(dadoBruto, obterValor),
    dataCriacao: formatarData(obterValor("Data entrada") || ...),
    dataRecebimento: formatarData(obterValor("Data entrada") || ...),
    finalizadoEm: formatarData(obterValor("Finalizado em") || ...),
    responsavel: obterValor("Responsável") || ...,
    motivoReduzido: obterValor("Motivo reduzido") || ...,
    motivoDetalhado: obterValor("Motivo Reclamação") || ...,
    enviarCobranca: converterBooleano(obterValor("Enviar para cobrança?") || ...),
    observacoes: obterValor("Observações") || ...,
    mes: obterValor("Mês") || extrairMes(...),
    
    tipoDemanda: tipoDemanda,         // bacen, n2 ou chatbot
    
    modulosContato: {
        atendimento: converterBooleano(obterValor("Acionou a central?") || ...),
        n2: converterBooleano(obterValor("N2 Portabilidade?") || ...),
        reclameAqui: converterBooleano(obterValor("Reclame Aqui") || ...),
        bacen: converterBooleano(obterValor("Bacen") || ...),
        procon: converterBooleano(obterValor("Procon") || ...)
    },
    
    pixLiberado: converterBooleano(obterValor("PIX liberado ou excluído?") || ...),
    aceitouLiquidacao: converterBooleano(obterValor("Aceitou liquidação Antecipada?") || ...),
    
    tentativas: processarTentativas(dadoBruto),
    protocolos: processarProtocolos(obterValor("Protocolos Central") || ...),
    
    camposEspecificos: processarCamposEspecificos(dadoBruto, tipoDemanda, obterValor),
    
    concluido: !!obterValor("Finalizado em"),
    dataAtualizacao: new Date().toISOString()
};
```

---

## 💾 3. ESTRUTURA DE ARMAZENAMENTO NO FIREBASE

### 3.1 Caminhos no Firebase Realtime Database

```
Firebase Realtime Database
└── fichas_bacen/
    └── {id}/
        └── {dados da ficha}
└── fichas_n2/
    └── {id}/
        └── {dados da ficha}
└── fichas_chatbot/
    └── {id}/
        └── {dados da ficha}
```

**Exemplo de caminho completo:**
```
fichas_bacen/rec_1706630400000_abc123xyz/
```

### 3.2 Processo de Salvamento (`armazenamento-reclamacoes.js`)

```javascript
async salvar(tipo, reclamacao) {
    // 1. Garantir ID
    if (!reclamacao.id) {
        reclamacao.id = gerarId(); // Formato: rec_{timestamp}_{random}
    }
    
    // 2. Verificar Firebase
    if (this.usarFirebase && this.firebaseDB) {
        // Salvar no Firebase
        const caminho = `fichas_${tipo}/${reclamacao.id}`;
        await this.firebaseDB.salvar(tipo, reclamacao);
        // Firebase usa .set() que SUBSTITUI dados existentes (não duplica)
    } else {
        // Fallback: localStorage
        salvarLocalStorage(tipo, reclamacao, chave);
    }
}
```

### 3.3 Processo de Leitura (`armazenamento-reclamacoes.js`)

```javascript
async carregarTodos(tipo) {
    if (this.usarFirebase && this.firebaseDB) {
        // Carregar do Firebase
        const caminho = `fichas_${tipo}`;
        const dados = await this.firebaseDB.carregar(tipo);
        // Retorna array de fichas
        return dados;
    } else {
        // Fallback: localStorage
        const dados = localStorage.getItem(`velotax_reclamacoes_${tipo}`);
        return JSON.parse(dados || '[]');
    }
}
```

---

## 🔍 4. POSSÍVEIS CAUSAS DE DUPLICAÇÃO

### 4.1 Duplicação por ID Diferente

**Problema**: Mesma ficha importada múltiplas vezes gera IDs diferentes

**Causa**:
- `gerarId()` usa `Date.now()` + `Math.random()`
- Se importar a mesma planilha 2x, cada linha gera ID diferente
- Firebase salva como registros separados

**Solução**:
- Implementar verificação de duplicata antes de salvar
- Usar chave única baseada em: CPF + Nome + Data + Tipo
- Verificar se já existe antes de inserir

### 4.2 Duplicação por Tipo Incorreto

**Problema**: Mesma ficha salva em tipos diferentes (bacen E n2)

**Causa**:
- `identificarTipoDemanda()` pode identificar tipo incorreto
- Se aba não for reconhecida, pode assumir tipo errado
- Campos ambíguos podem causar identificação incorreta

**Solução**:
- Melhorar lógica de identificação
- Priorizar campo `_aba` (mais confiável)
- Adicionar validação cruzada

### 4.3 Duplicação por Salvamento Duplo

**Problema**: Dados salvos no Firebase E localStorage

**Causa**:
- Código antigo salvava em ambos
- Migração de localStorage para Firebase pode duplicar

**Solução**:
- Código atual já corrigido: NÃO salva em ambos
- Se Firebase ativo → apenas Firebase
- Se Firebase inativo → apenas localStorage

### 4.4 Duplicação por Múltiplas Importações

**Problema**: Importar mesma planilha múltiplas vezes

**Causa**:
- Não há verificação de duplicata na importação
- Cada importação cria novos IDs

**Solução**:
- Implementar verificação de duplicata na importação
- Usar chave única: CPF + Nome + Data + Tipo
- Atualizar existente em vez de criar novo

---

## 📊 5. ESTRUTURA DE DADOS FINAL NO FIREBASE

### 5.1 Estrutura de uma Ficha BACEN

```json
{
  "id": "rec_1706630400000_abc123xyz",
  "nomeCliente": "João Silva",
  "nomeCompleto": "João Silva",
  "cpf": "12345678901",
  "cpfTratado": "12345678901",
  "telefone": "(11) 99999-9999",
  "origem": "bacen",
  "status": "em-tratativa",
  "dataCriacao": "2025-01-30T10:00:00.000Z",
  "dataRecebimento": "2025-01-30T10:00:00.000Z",
  "finalizadoEm": "",
  "responsavel": "Maria Santos",
  "motivoReduzido": "Cobrança indevida",
  "motivoDetalhado": "Cliente reclama de cobrança indevida...",
  "enviarCobranca": false,
  "observacoes": "Cliente aguardando retorno",
  "mes": "Janeiro",
  "tipoDemanda": "bacen",
  "modulosContato": {
    "atendimento": true,
    "n2": false,
    "reclameAqui": true,
    "bacen": true,
    "procon": false
  },
  "pixLiberado": false,
  "aceitouLiquidacao": false,
  "tentativas": [
    {
      "dataHora": "2025-01-30T10:00:00.000Z",
      "resultado": "contatado",
      "observacoes": "Tentativa 1"
    }
  ],
  "protocolos": [
    {
      "numero": "123456",
      "canal": "Não informado",
      "data": "2025-01-30T10:00:00.000Z"
    }
  ],
  "camposEspecificos": {
    "prazoBacen": "2025-02-15T00:00:00.000Z",
    "reclameAqui": true,
    "procon": false,
    "casosCriticos": false
  },
  "concluido": false,
  "dataAtualizacao": "2025-01-30T10:00:00.000Z"
}
```

### 5.2 Estrutura de uma Ficha N2

```json
{
  "id": "rec_1706630400000_def456uvw",
  "nomeCliente": "Maria Santos",
  "cpf": "98765432100",
  "tipoDemanda": "n2",
  "camposEspecificos": {
    "bancoOrigem": "Banco A",
    "bancoDestino": "Banco B",
    "statusPortabilidade": "Em análise",
    "n2Portabilidade": true
  },
  // ... outros campos comuns
}
```

### 5.3 Estrutura de uma Ficha Chatbot

```json
{
  "id": "rec_1706630400000_ghi789rst",
  "nomeCliente": "Pedro Costa",
  "cpf": "11122233344",
  "tipoDemanda": "chatbot",
  "camposEspecificos": {
    "canalChatbot": "WhatsApp",
    "satisfacao": "5",
    "notaAvaliacao": "5",
    "resolvidoAutomaticamente": true,
    "encaminhadoParaHumano": false,
    "prazoResposta": "2025-01-30T10:00:00.000Z",
    "produto": "Crédito Pessoal"
  },
  // ... outros campos comuns
}
```

---

## 🔧 6. VERIFICAÇÕES ANTES DE RESETAR

### 6.1 Verificar Estrutura da Planilha

✅ **Verificar se a planilha tem as 3 abas corretas:**
- "Base Bacen"
- "Base Ouvidoria"
- "Planilha Chatbot" ou "Chatbot"

✅ **Verificar se os nomes das colunas estão corretos:**
- Nome completo / Nome / Cliente
- CPF / CPF Tratado
- Data entrada / Data Entrada
- Etc.

### 6.2 Verificar Mapeamento de Campos

✅ **Verificar se o sistema está mapeando corretamente:**
- Abrir console do navegador (F12)
- Importar planilha
- Verificar logs de mapeamento
- Verificar se `tipoDemanda` está correto

### 6.3 Verificar Salvamento no Firebase

✅ **Verificar se os dados estão sendo salvos corretamente:**
- Firebase Console → Realtime Database
- Verificar caminhos: `fichas_bacen`, `fichas_n2`, `fichas_chatbot`
- Verificar se há duplicatas (mesmo CPF + Nome + Data)

### 6.4 Verificar Leitura do Firebase

✅ **Verificar se os dados estão sendo lidos corretamente:**
- Abrir console do navegador (F12)
- Verificar logs de `carregarTodos()`
- Verificar se retorna array correto
- Verificar se não há duplicatas na leitura

---

## 🚨 7. RECOMENDAÇÕES PARA RESETAR E REIMPORTAR

### 7.1 Antes de Resetar

1. **Fazer backup dos dados atuais:**
   - Exportar dados do Firebase Console
   - Ou usar script de exportação

2. **Verificar duplicatas:**
   - Identificar registros duplicados
   - Documentar quais são duplicatas

3. **Limpar Firebase:**
   - Deletar caminhos: `fichas_bacen`, `fichas_n2`, `fichas_chatbot`
   - Ou usar script de limpeza

### 7.2 Durante a Importação

1. **Verificar logs:**
   - Abrir console do navegador (F12)
   - Acompanhar logs de importação
   - Verificar se tipos estão corretos

2. **Verificar salvamento:**
   - Verificar se dados estão sendo salvos no Firebase
   - Verificar se não há erros

### 7.3 Após a Importação

1. **Verificar dados:**
   - Contar registros por tipo
   - Verificar se não há duplicatas
   - Verificar se dados estão corretos

2. **Testar funcionalidades:**
   - Buscar fichas
   - Editar fichas
   - Filtrar por tipo

---

## 📝 8. CHECKLIST DE VERIFICAÇÃO

### ✅ Estrutura da Planilha
- [ ] Planilha tem 3 abas: "Base Bacen", "Base Ouvidoria", "Planilha Chatbot"
- [ ] Nomes das colunas estão corretos
- [ ] Dados estão preenchidos corretamente

### ✅ Importação
- [ ] Sistema identifica tipos corretamente
- [ ] Mapeamento de campos está correto
- [ ] Validação de dados está funcionando
- [ ] Logs de importação estão claros

### ✅ Salvamento
- [ ] Dados são salvos no Firebase (não localStorage)
- [ ] Caminhos no Firebase estão corretos
- [ ] IDs são únicos
- [ ] Não há duplicatas

### ✅ Leitura
- [ ] Dados são carregados do Firebase corretamente
- [ ] Tipos estão corretos
- [ ] Não há duplicatas na leitura
- [ ] Dados aparecem nas listas

---

## 🔍 9. PRÓXIMOS PASSOS

1. **Analisar planilha atual:**
   - Verificar estrutura
   - Verificar dados
   - Identificar possíveis problemas

2. **Verificar código de importação:**
   - Verificar se mapeamento está correto
   - Verificar se identificação de tipo está correta
   - Verificar se validação está funcionando

3. **Implementar verificação de duplicata:**
   - Criar função para verificar duplicatas
   - Usar chave única: CPF + Nome + Data + Tipo
   - Atualizar existente em vez de criar novo

4. **Testar importação:**
   - Importar planilha de teste
   - Verificar se dados estão corretos
   - Verificar se não há duplicatas

5. **Resetar e reimportar:**
   - Limpar Firebase
   - Importar planilha completa
   - Verificar resultados

---

**Documento criado em:** 2025-01-30  
**Versão:** v1.0.0  
**Status:** ✅ Completo - Pronto para análise

