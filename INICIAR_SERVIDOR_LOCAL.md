# 🚀 Como Iniciar o Servidor Local

## 📋 Pré-requisitos

- Node.js instalado (versão 12 ou superior)
- Navegador web moderno

## 🔧 Passos para Iniciar

### 1. Verificar se Node.js está instalado

Abra o PowerShell ou CMD e execute:

```powershell
node --version
```

Se não estiver instalado, baixe em: https://nodejs.org/

### 2. Iniciar o Servidor

**Opção A: Usando npm (recomendado)**

```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
npm start
```

**Opção B: Diretamente com Node.js**

```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
node server.js
```

### 3. Acessar o Sistema

Abra seu navegador e acesse:

```
http://localhost:3000
```

## 🛑 Parar o Servidor

Pressione `Ctrl + C` no terminal onde o servidor está rodando.

## ⚙️ Configurações

### Alterar Porta

Edite o arquivo `server.js` e altere:

```javascript
const PORT = 3000; // Altere para a porta desejada
```

### Alterar Host

Edite o arquivo `server.js` e altere:

```javascript
const HOST = 'localhost'; // Altere para '0.0.0.0' para acessar de outros dispositivos na rede
```

## 🔍 Troubleshooting

**Problema: Porta já em uso**
- Altere a porta no `server.js` para outra (ex: 3001, 8080)
- Ou feche o programa que está usando a porta 3000

**Problema: Node.js não encontrado**
- Instale Node.js: https://nodejs.org/
- Reinicie o terminal após instalar

**Problema: Erro ao acessar arquivos**
- Certifique-se de que está na pasta correta
- Verifique se todos os arquivos estão presentes

## 📝 Notas

- O servidor é simples e adequado para desenvolvimento/testes locais
- Para produção, considere usar servidores mais robustos (Apache, Nginx, etc.)
- O servidor suporta arquivos estáticos (HTML, CSS, JS, imagens, etc.)

