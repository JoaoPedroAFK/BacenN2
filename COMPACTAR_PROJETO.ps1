# Script para compactar o projeto para envio
# Execute este script no PowerShell

$pastaOrigem = Get-Location
$nomeArquivo = "SistemaVelotax_BACEN_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
$caminhoDestino = Join-Path $pastaOrigem ".." $nomeArquivo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPACTANDO PROJETO PARA ENVIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arquivos e pastas a incluir
$itensParaIncluir = @(
    "index.html",
    "bacen.html",
    "n2.html",
    "chatbot.html",
    "classificacao.html",
    "importacao.html",
    "css",
    "js",
    "img",
    "INSTRUCOES_INSTALACAO.md",
    "GUIA_TESTE_VANESSA.md",
    "LEIA-ME.txt"
)

Write-Host "Incluindo arquivos..." -ForegroundColor Yellow

# Criar arquivo ZIP
Compress-Archive -Path $itensParaIncluir -DestinationPath $caminhoDestino -Force

if (Test-Path $caminhoDestino) {
    $tamanho = (Get-Item $caminhoDestino).Length / 1MB
    Write-Host ""
    Write-Host "✓ Arquivo criado com sucesso!" -ForegroundColor Green
    Write-Host "  Nome: $nomeArquivo" -ForegroundColor White
    Write-Host "  Tamanho: $([math]::Round($tamanho, 2)) MB" -ForegroundColor White
    Write-Host "  Local: $caminhoDestino" -ForegroundColor White
    Write-Host ""
    Write-Host "Agora você pode enviar este arquivo ZIP!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Erro ao criar arquivo ZIP" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")













