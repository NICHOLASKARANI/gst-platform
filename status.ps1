# GST Status Checker
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GST STATUS CHECKER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if processes are running
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Measure-Object
$httpProcesses = Get-Process -Name http-server -ErrorAction SilentlyContinue | Measure-Object

Write-Host "Node.js processes: " -NoNewline
if ($nodeProcesses.Count -ge 2) {
    Write-Host "? 2 running (Auth & Payment)" -ForegroundColor Green
} elseif ($nodeProcesses.Count -eq 1) {
    Write-Host "?? Only 1 running" -ForegroundColor Yellow
} else {
    Write-Host "? None running" -ForegroundColor Red
}

Write-Host "HTTP Server processes: " -NoNewline
if ($httpProcesses.Count -ge 1) {
    Write-Host "? 1 running (Website)" -ForegroundColor Green
} else {
    Write-Host "? None running" -ForegroundColor Red
}

Write-Host ""
Write-Host "?? Detailed process list:" -ForegroundColor Yellow
Get-Process -Name node, http-server -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, CPU -AutoSize

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
