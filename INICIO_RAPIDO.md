# ⚡ Início Rápido - Servidor Local

## 🚀 Como Iniciar (3 passos)

### 1️⃣ Abra o PowerShell na pasta do projeto

```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
```

### 2️⃣ Inicie o servidor

**Opção A - Script PowerShell (mais fácil):**
```powershell
.\INICIAR_SERVIDOR.ps1
```

**Opção B - Comando direto:**
```powershell
npm start
```

ou

```powershell
node server.js
```

### 3️⃣ Acesse no navegador

Abra seu navegador e vá para:

```
http://localhost:3000
```

## ✅ Pronto!

O sistema estará rodando localmente.

## 🛑 Para Parar

Pressione `Ctrl + C` no terminal onde o servidor está rodando.

## 📝 Notas Importantes

- ✅ Node.js já está instalado (v24.11.0)
- ✅ Servidor configurado na porta 3000
- ✅ Todos os arquivos estão prontos

## 🔧 Se precisar alterar a porta

Edite `server.js` e mude:
```javascript
const PORT = 3000; // Altere aqui
```

## 🌐 Acessar de outros dispositivos na rede

Edite `server.js` e mude:
```javascript
const HOST = '0.0.0.0'; // Em vez de 'localhost'
```

Depois acesse usando o IP da sua máquina:
```
http://SEU_IP:3000
```

