# GST Service Monitor
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GST SERVICE MONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Auth Service
Write-Host "Auth Service (8005): " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8005/health" -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "? RUNNING" -ForegroundColor Green
    } else {
        Write-Host "? ERROR" -ForegroundColor Red
    }
} catch {
    Write-Host "? NOT RUNNING" -ForegroundColor Red
}

# Check Payment Service
Write-Host "Payment Service (8006): " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8006/health" -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "? RUNNING" -ForegroundColor Green
    } else {
        Write-Host "? ERROR" -ForegroundColor Red
    }
} catch {
    Write-Host "? NOT RUNNING" -ForegroundColor Red
}

# Check Website - just check if port is listening
Write-Host "Website (3000): " -NoNewline
$connection = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue -InformationLevel Quiet
if ($connection) {
    Write-Host "? RUNNING" -ForegroundColor Green
} else {
    Write-Host "? NOT RUNNING" -ForegroundColor Red
}

Write-Host ""
Write-Host "?? Running Processes:" -ForegroundColor Yellow
Get-Process -Name node, http-server -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, CPU -AutoSize
Write-Host ""
