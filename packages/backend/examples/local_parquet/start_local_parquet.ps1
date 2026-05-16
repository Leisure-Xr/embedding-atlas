param(
    [string]$Dataset = "wine",
    [string]$Text = "",
    [string]$X = "projection_x",
    [string]$Y = "projection_y",
    [string]$Neighbors = "neighbors",
    [string]$HostAddress = "127.0.0.1",
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "../../../..")
$BackendDir = Join-Path $RepoRoot "packages/backend"
$BackendPort = 5055

switch -Regex ($Dataset) {
    "^(wine|wine-reviews|wine_reviews)$" {
        $DatasetPath = Join-Path $ScriptDir "wine_reviews_sample.parquet"
        if ([string]::IsNullOrWhiteSpace($Text)) { $Text = "description" }
        break
    }
    "^medmcqa$" {
        $DatasetPath = Join-Path $ScriptDir "medmcqa_sample.parquet"
        if ([string]::IsNullOrWhiteSpace($Text)) { $Text = "question" }
        break
    }
    default {
        $DatasetPath = $Dataset
        if ([string]::IsNullOrWhiteSpace($Text)) { $Text = "text" }
        break
    }
}

if (-not (Test-Path $DatasetPath)) {
    throw "Dataset not found: $DatasetPath"
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    throw "uv is required. Install it from https://docs.astral.sh/uv/."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm is required. Install Node.js/npm first."
}

Write-Host "Starting Embedding Atlas backend with:"
Write-Host "  dataset:   $DatasetPath"
Write-Host "  text:      $Text"
Write-Host "  x/y:       $X / $Y"
Write-Host "  neighbors: $Neighbors"
Write-Host ""
Write-Host "Backend: http://${HostAddress}:$BackendPort"
Write-Host "Viewer:  http://${HostAddress}:$FrontendPort"
Write-Host ""

$BackendArgs = @(
    "run", "embedding-atlas", $DatasetPath,
    "--text", $Text,
    "--x", $X,
    "--y", $Y,
    "--neighbors", $Neighbors,
    "--disable-projection",
    "--cors",
    "--host", $HostAddress,
    "--port", "$BackendPort",
    "--no-auto-port",
    "--static", "../viewer"
)

$BackendProcess = Start-Process `
    -FilePath "uv" `
    -ArgumentList $BackendArgs `
    -WorkingDirectory $BackendDir `
    -PassThru `
    -NoNewWindow

try {
    Start-Sleep -Seconds 3
    Push-Location $RepoRoot
    npm run dev -w "@embedding-atlas/viewer" -- --host $HostAddress --port $FrontendPort
}
finally {
    Pop-Location
    if ($BackendProcess -and -not $BackendProcess.HasExited) {
        Stop-Process -Id $BackendProcess.Id -Force
    }
}
