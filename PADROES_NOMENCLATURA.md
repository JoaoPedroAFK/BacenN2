# 📋 Padrões de Nomenclatura - VeloHub

<!-- VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team -->

## 🎯 Regra Geral

**SEMPRE que algo for adicionado no VeloHub, deve seguir estes dois padrões:**

1. **snake_case** (`exemplo_exemplo`) - Para campos de conteúdo em português
2. **camelCase** (`exemploExemplo`) - Para campos técnicos/metadados

---

## 📝 Padrões por Tipo de Campo

### 1. Campos de Conteúdo (Português) → **snake_case**

**Exemplos existentes:**
- `artigo_titulo`
- `artigo_conteudo`
- `categoria_titulo`
- `categoria_id`
- `avaliacao_id`

**Quando usar:**
- Títulos, conteúdos, descrições em português
- IDs de relacionamento
- Campos que representam dados do negócio em português

### 2. Campos Técnicos/Metadados → **camelCase**

**Exemplos existentes:**
- `colaboradorNome`
- `palavrasChave`
- `isCritical`
- `createdAt`
- `updatedAt`
- `userEmail`
- `userName`
- `sessionId`
- `isActive`
- `hasQuiz`
- `quizId`

**Quando usar:**
- Campos booleanos (`is`, `has`)
- Datas (`createdAt`, `updatedAt`)
- IDs técnicos (`sessionId`, `quizId`)
- Metadados do sistema
- Campos de arrays técnicos (`images`, `videos`)

---

## 📦 Estrutura de Arrays

### Arrays de Imagens/Vídeos

```javascript
images: [
  {
    url: String,        // camelCase (técnico)
    data: String,       // camelCase (técnico) - base64
    type: String,       // camelCase (técnico) - MIME type
    name: String        // camelCase (técnico) - nome do arquivo
  }
]
```

**Padrão:** Todos os campos dentro do objeto são `camelCase` porque são técnicos.

---

## ✅ Exemplos Corretos

### ✅ Correto - Velonews
```javascript
{
  titulo: String,              // Português simples (sem underscore)
  conteudo: String,            // Português simples
  isCritical: Boolean,         // camelCase (técnico)
  solved: Boolean,             // camelCase (técnico)
  images: Array,              // camelCase (técnico)
  videos: Array,               // camelCase (técnico)
  createdAt: Date,            // camelCase (técnico)
  updatedAt: Date             // camelCase (técnico)
}
```

### ✅ Correto - Artigos
```javascript
{
  artigo_titulo: String,       // snake_case (conteúdo português)
  artigo_conteudo: String,     // snake_case (conteúdo português)
  categoria_titulo: String,     // snake_case (conteúdo português)
  createdAt: Date,             // camelCase (técnico)
  updatedAt: Date              // camelCase (técnico)
}
```

### ✅ Correto - Escalações
```javascript
{
  colaboradorNome: String,     // camelCase (técnico)
  waMessageId: String,         // camelCase (técnico)
  respondedAt: Date,            // camelCase (técnico)
  respondedBy: String,          // camelCase (técnico)
  createdAt: Date,              // camelCase (técnico)
  updatedAt: Date               // camelCase (técnico)
}
```

---

## ❌ Exemplos Incorretos

### ❌ Evitar
```javascript
// ❌ Misturar padrões
{
  artigoTitulo: String,        // Deveria ser artigo_titulo
  colaborador_nome: String,    // Deveria ser colaboradorNome
  is_critical: Boolean,        // Deveria ser isCritical
  created_at: Date,            // Deveria ser createdAt
}
```

---

## 🔍 Checklist ao Adicionar Novos Campos

- [ ] É um campo de conteúdo em português? → Use `snake_case` (`exemplo_exemplo`)
- [ ] É um campo técnico/metadado? → Use `camelCase` (`exemploExemplo`)
- [ ] É um campo booleano? → Use `camelCase` com prefixo `is` ou `has` (`isActive`, `hasQuiz`)
- [ ] É uma data? → Use `camelCase` com sufixo `At` (`createdAt`, `updatedAt`)
- [ ] É um ID técnico? → Use `camelCase` com sufixo `Id` (`sessionId`, `quizId`)
- [ ] É um array técnico? → Use `camelCase` no plural (`images`, `videos`)

---

## 📚 Referências

- **Schema MongoDB**: `listagem de schema de coleções do mongoD.rb`
- **Backend**: `backend/server.js`
- **Frontend**: `src/components/`, `src/services/`

---

## ⚠️ IMPORTANTE

**NUNCA altere campos existentes sem autorização explícita!**

Este documento serve como **guia para novos campos** e **padronização futura**.

