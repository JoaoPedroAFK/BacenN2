# Script para instalar o servidor como serviço do Windows
# Execute como Administrador: PowerShell (como Administrador) > .\INSTALAR_SERVICO_WINDOWS.ps1

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 Instalando Servidor BACEN como Serviço do Windows" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Clique com botão direito no PowerShell e selecione 'Executar como administrador'" -ForegroundColor Yellow
    pause
    exit
}

$servicoNome = "SistemaBACENVelotax"
$caminhoProjeto = $PSScriptRoot
$caminhoNode = (Get-Command node).Source
$caminhoServer = Join-Path $caminhoProjeto "server.js"

Write-Host "📁 Caminho do projeto: $caminhoProjeto" -ForegroundColor Gray
Write-Host "📁 Caminho do Node.js: $caminhoNode" -ForegroundColor Gray
Write-Host "📁 Arquivo do servidor: $caminhoServer" -ForegroundColor Gray
Write-Host ""

# Verificar se NSSM está instalado
$nssmPath = Join-Path $caminhoProjeto "nssm.exe"
if (-not (Test-Path $nssmPath)) {
    Write-Host "📥 Baixando NSSM (Non-Sucking Service Manager)..." -ForegroundColor Yellow
    
    # Criar pasta temp
    $tempDir = Join-Path $env:TEMP "nssm_download"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    # Baixar NSSM
    $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
    $zipPath = Join-Path $tempDir "nssm.zip"
    
    try {
        Invoke-WebRequest -Uri $nssmUrl -OutFile $zipPath -UseBasicParsing
        Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
        
        # Copiar nssm.exe para o projeto (versão 64-bit)
        $nssmSource = Get-ChildItem -Path $tempDir -Filter "nssm.exe" -Recurse | Where-Object { $_.Directory.Name -eq "win64" } | Select-Object -First 1
        if ($nssmSource) {
            Copy-Item $nssmSource.FullName -Destination $nssmPath -Force
            Write-Host "✅ NSSM baixado e instalado" -ForegroundColor Green
        } else {
            throw "NSSM não encontrado no ZIP"
        }
    } catch {
        Write-Host "❌ Erro ao baixar NSSM: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Baixe manualmente em: https://nssm.cc/download" -ForegroundColor Yellow
        Write-Host "Extraia nssm.exe (win64) para a pasta do projeto" -ForegroundColor Yellow
        pause
        exit
    }
}

# Remover serviço existente se houver
$servicoExistente = Get-Service -Name $servicoNome -ErrorAction SilentlyContinue
if ($servicoExistente) {
    Write-Host "🔄 Removendo serviço existente..." -ForegroundColor Yellow
    & $nssmPath remove $servicoNome confirm
    Start-Sleep -Seconds 2
}

# Instalar novo serviço
Write-Host "📦 Instalando serviço..." -ForegroundColor Yellow
& $nssmPath install $servicoNome $caminhoNode "$caminhoServer"

# Configurar serviço
Write-Host "⚙️ Configurando serviço..." -ForegroundColor Yellow
& $nssmPath set $servicoNome AppDirectory $caminhoProjeto
& $nssmPath set $servicoNome DisplayName "Sistema BACEN Velotax"
& $nssmPath set $servicoNome Description "Servidor HTTP para Sistema de Gestão de Reclamações BACEN, N2 e Chatbot - Velotax"
& $nssmPath set $servicoNome Start SERVICE_AUTO_START
& $nssmPath set $servicoNome AppStdout (Join-Path $caminhoProjeto "logs\output.log")
& $nssmPath set $servicoNome AppStderr (Join-Path $caminhoProjeto "logs\error.log")

# Criar pasta de logs
$logsDir = Join-Path $caminhoProjeto "logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

# Iniciar serviço
Write-Host "🚀 Iniciando serviço..." -ForegroundColor Yellow
Start-Service -Name $servicoNome

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SERVIÇO INSTALADO E INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 O servidor está rodando em: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   - Parar serviço:   Stop-Service -Name $servicoNome" -ForegroundColor Gray
Write-Host "   - Iniciar serviço: Start-Service -Name $servicoNome" -ForegroundColor Gray
Write-Host "   - Status:          Get-Service -Name $servicoNome" -ForegroundColor Gray
Write-Host "   - Remover:         .\nssm.exe remove $servicoNome confirm" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 O servidor iniciará automaticamente quando o Windows iniciar!" -ForegroundColor Green
Write-Host ""

pause


