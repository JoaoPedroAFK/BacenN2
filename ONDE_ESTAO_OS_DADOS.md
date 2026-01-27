# 📍 Onde Estão Armazenados os Dados - VeloHub

<!-- VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team -->

## 🗄️ Localização dos Dados no MongoDB

### 📊 Estrutura Completa

```
MongoDB Atlas
└── Cluster: velohubcentral.od7vwts.mongodb.net
    └── Database: console_conteudo
        └── Collection: Velonews
            └── Documentos (cada notícia)
                ├── _id: ObjectId
                ├── titulo: String
                ├── conteudo: String
                ├── isCritical: Boolean
                ├── solved: Boolean
                ├── images: Array [          ← IMAGENS AQUI
                │     {
                │       url: String,        // data:image/jpeg;base64,...
                │       data: String,        // Base64 puro
                │       type: String,        // image/jpeg, image/png, etc
                │       name: String         // nome do arquivo
                │     }
                │   ]
                ├── videos: Array [          ← VÍDEOS AQUI
                │     {
                │       url: String,        // data:video/mp4;base64,...
                │       data: String,        // Base64 puro
                │       type: String,        // video/mp4, video/webm, etc
                │       name: String         // nome do arquivo
                │     }
                │   ]
                ├── createdAt: Date
                └── updatedAt: Date
```

---

## 📋 Detalhes Técnicos

### 1. **Database**
- **Nome**: `console_conteudo`
- **Localização**: MongoDB Atlas (Cloud)
- **Cluster**: `velohubcentral.od7vwts.mongodb.net`

### 2. **Collection**
- **Nome**: `Velonews`
- **Tipo**: Collection MongoDB
- **Conteúdo**: Notícias do VeloHub

### 3. **Campo de Armazenamento**
- **Campo**: `images` (Array)
- **Campo**: `videos` (Array)
- **Formato**: Base64 dentro do documento
- **Não há arquivos físicos** - tudo está no banco de dados

---

## 🔍 Como Acessar

### Via MongoDB Atlas (Interface Web)

1. **Acesse**: https://cloud.mongodb.com
2. **Faça login** com suas credenciais
3. **Selecione o cluster**: `velohubcentral`
4. **Navegue até**:
   - Database: `console_conteudo`
   - Collection: `Velonews`
5. **Abra qualquer documento** que tenha imagens/vídeos
6. **Veja o campo** `images` ou `videos` com os dados em base64

### Via MongoDB Compass (Desktop)

1. **Conecte** usando a connection string:
   ```
   mongodb+srv://lucasgravina:nKQu8bSN6iZl8FPo@velohubcentral.od7vwts.mongodb.net/
   ```
2. **Navegue**:
   - Database: `console_conteudo`
   - Collection: `Velonews`
3. **Visualize** os documentos e seus campos

### Via Código (Node.js)

```javascript
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://lucasgravina:nKQu8bSN6iZl8FPo@velohubcentral.od7vwts.mongodb.net/';
const client = new MongoClient(uri);

await client.connect();
const db = client.db('console_conteudo');
const collection = db.collection('Velonews');

// Buscar notícia com imagens
const noticia = await collection.findOne({ 
  images: { $exists: true, $ne: [] } 
});

console.log('Imagens:', noticia.images);
// Cada imagem tem: { url, data (base64), type, name }
```

---

## 📦 Estrutura dos Dados

### Exemplo Real de um Documento

```javascript
{
  "_id": ObjectId("6928b8e61351b21a9750cdb0"),
  "titulo": "Nova Funcionalidade no Sistema",
  "conteudo": "Estamos lançando uma nova funcionalidade...",
  "isCritical": false,
  "solved": false,
  "images": [
    {
      "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
      "data": "/9j/4AAQSkZJRgABAQEAYABgAAD...",  // Base64 puro (sem prefixo)
      "type": "image/jpeg",
      "name": "screenshot.jpg"
    },
    {
      "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "type": "image/png",
      "name": "diagrama.png"
    }
  ],
  "videos": [
    {
      "url": "data:video/mp4;base64,AAAAIGZ0eXBpc29t...",
      "data": "AAAAIGZ0eXBpc29t...",
      "type": "video/mp4",
      "name": "tutorial.mp4"
    }
  ],
  "createdAt": ISODate("2025-01-31T10:00:00Z"),
  "updatedAt": ISODate("2025-01-31T10:00:00Z")
}
```

---

## 🔗 Rotas da API

### Endpoints que Acessam os Dados

1. **GET `/api/velo-news`**
   - **O que faz**: Busca todas as notícias
   - **Retorna**: Array com notícias incluindo `images` e `videos` em base64
   - **Localização**: `backend/server.js` (linha ~484)

2. **POST `/api/velo-news`**
   - **O que faz**: Cria nova notícia com imagens/vídeos
   - **Recebe**: JSON com `images` e `videos` em base64
   - **Salva em**: MongoDB → `console_conteudo.Velonews`
   - **Localização**: `backend/server.js` (linha ~576)

3. **PUT `/api/velo-news/:id`**
   - **O que faz**: Atualiza notícia existente
   - **Recebe**: JSON com `images` e `videos` atualizados
   - **Atualiza em**: MongoDB → `console_conteudo.Velonews`
   - **Localização**: `backend/server.js` (linha ~642)

---

## 💾 Formato de Armazenamento

### Base64

- **O que é**: Codificação binária em texto
- **Tamanho**: ~33% maior que o arquivo original
- **Exemplo**: 1MB de imagem = ~1.33MB no MongoDB

### Estrutura do Objeto

Cada imagem/vídeo é um objeto com:
- `url`: Data URL completo (`data:image/jpeg;base64,...`)
- `data`: Base64 puro (sem prefixo)
- `type`: MIME type (`image/jpeg`, `video/mp4`, etc)
- `name`: Nome original do arquivo

---

## 📊 Estatísticas

### Limites Atuais
- **Imagens**: Máximo 5MB cada
- **Vídeos**: Máximo 10MB cada
- **Formato**: Base64 armazenado no MongoDB

### Tamanho no Banco
- **1 imagem de 1MB** = ~1.33MB no MongoDB
- **1 vídeo de 10MB** = ~13.3MB no MongoDB
- **Sem arquivos físicos** - tudo no banco

---

## 🔍 Queries Úteis

### MongoDB Shell / Compass

```javascript
// Buscar notícias com imagens
db.Velonews.find({ images: { $exists: true, $ne: [] } })

// Contar notícias com imagens
db.Velonews.countDocuments({ images: { $exists: true, $ne: [] } })

// Buscar notícias com vídeos
db.Velonews.find({ videos: { $exists: true, $ne: [] } })

// Ver apenas campos de mídia
db.Velonews.findOne(
  { _id: ObjectId("...") }, 
  { images: 1, videos: 1, titulo: 1 }
)

// Buscar notícias com imagens maiores que X caracteres (base64)
db.Velonews.find({
  "images.data": { $exists: true, $ne: "" },
  $expr: { $gt: [{ $strLenCP: { $arrayElemAt: ["$images.data", 0] } }, 1000000] }
})
```

---

## 📝 Resumo para Responder Perguntas

### Onde estão as imagens/vídeos?

**Resposta curta:**
- **MongoDB Atlas** → Database `console_conteudo` → Collection `Velonews` → Campo `images`/`videos`

**Resposta detalhada:**
1. **Servidor**: MongoDB Atlas (Cloud)
2. **Database**: `console_conteudo`
3. **Collection**: `Velonews`
4. **Campo**: `images` (Array) e `videos` (Array)
5. **Formato**: Base64 dentro do documento
6. **Não há arquivos físicos** - tudo está no banco de dados

### Como acessar?

1. **Interface Web**: https://cloud.mongodb.com → Cluster `velohubcentral` → Database `console_conteudo` → Collection `Velonews`
2. **MongoDB Compass**: Conectar com connection string e navegar até a collection
3. **API**: `GET /api/velo-news` retorna todas as notícias com imagens/vídeos

### Tamanho e Limites?

- **Imagens**: Máx. 5MB cada (armazenado como base64 = ~6.65MB no banco)
- **Vídeos**: Máx. 10MB cada (armazenado como base64 = ~13.3MB no banco)
- **Formato**: Base64 (texto) dentro do documento MongoDB

---

## 🔐 Segurança

- **Acesso**: Requer credenciais MongoDB
- **Connection String**: Armazenada em variável de ambiente `MONGO_ENV`
- **Localização**: `backend/env` (não commitado no git)

---

## 📚 Arquivos Relacionados

- **Backend**: `backend/server.js` (endpoints POST/PUT/GET)
- **Frontend**: `src/components/VeloNewsAdmin.js` (upload)
- **Schema**: `listagem de schema de coleções do mongoD.rb`
- **Config**: `backend/env` (connection string)

