param(
    [int[]]$Ports = @(5055, 5173)
)

$ErrorActionPreference = "Stop"

foreach ($Port in $Ports) {
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $connections) {
        Write-Host "Port ${Port}: no listening process found."
        continue
    }

    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($ProcessId in $processIds) {
        Write-Host "Port ${Port}: stopping process $ProcessId"
        Stop-Process -Id $ProcessId -Force
    }
}
