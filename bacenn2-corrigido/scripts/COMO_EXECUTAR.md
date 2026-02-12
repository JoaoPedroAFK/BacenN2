# 📍 Onde Executar o Script

## 🗂️ Estrutura de Pastas

```
C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\
├── scripts\                          ← VOCÊ VAI TRABALHAR AQUI
│   ├── clear-firebase-data.js        ← Script principal
│   ├── package.json                  ← Dependências
│   └── service-account-key.json      ← (você vai criar este arquivo)
├── functions\
│   └── user_privacy.json             ← Configuração (já existe)
└── ...
```

## 🚀 Passo a Passo

### **Passo 1: Navegar até a pasta scripts**

Abra o PowerShell ou Terminal e execute:

```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\scripts"
```

**OU** se você já estiver na pasta raiz do projeto:

```powershell
cd scripts
```

### **Passo 2: Instalar dependências**

**Execute nesta pasta (`scripts`):**

```powershell
npm install
```

Isso vai criar a pasta `node_modules` dentro de `scripts/`.

### **Passo 3: Configurar credenciais**

**Opção A - Service Account Key (Recomendado):**

1. Baixe o Service Account Key do Firebase Console
2. Salve como: `C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\scripts\service-account-key.json`

**Opção B - Google Cloud CLI:**

```powershell
gcloud auth application-default login
```

### **Passo 4: Executar o script**

**Ainda na pasta `scripts`, execute:**

```powershell
npm start
```

**OU:**

```powershell
node clear-firebase-data.js
```

## ✅ Resumo dos Comandos

```powershell
# 1. Ir para a pasta scripts
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\scripts"

# 2. Instalar dependências (só na primeira vez)
npm install

# 3. Executar o script
npm start
```

## ⚠️ Importante

- **SEMPRE execute os comandos dentro da pasta `scripts`**
- O script procura automaticamente o arquivo `user_privacy.json` na pasta `functions/` (pasta pai)
- O `service-account-key.json` deve estar na mesma pasta do script (`scripts/`)

## 🔍 Verificar se está na pasta correta

Execute:

```powershell
pwd
```

Deve mostrar:
```
C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\scripts
```

Ou verifique se os arquivos existem:

```powershell
dir
```

Deve listar:
- `clear-firebase-data.js`
- `package.json`
- `README.md`

