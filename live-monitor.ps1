# GST Auto Monitor - Press Ctrl+C to stop
while ($true) {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  GST LIVE MONITOR (refreshes every 5s)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Check Auth Service
    Write-Host "Auth Service (8005): " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8005/health" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "? RUNNING" -ForegroundColor Green
        } else {
            Write-Host "? ERROR" -ForegroundColor Red
        }
    } catch {
        Write-Host "? DOWN" -ForegroundColor Red
    }

    # Check Payment Service
    Write-Host "Payment Service (8006): " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8006/health" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "? RUNNING" -ForegroundColor Green
        } else {
            Write-Host "? ERROR" -ForegroundColor Red
        }
    } catch {
        Write-Host "? DOWN" -ForegroundColor Red
    }

    # Check Website
    Write-Host "Website (3000): " -NoNewline
    $connection = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        Write-Host "? RUNNING" -ForegroundColor Green
    } else {
        Write-Host "? DOWN" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "?? Running Processes:" -ForegroundColor Yellow
    Get-Process -Name node, http-server -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, CPU -AutoSize

    Write-Host ""
    Write-Host "? Last checked: 19:09:37" -ForegroundColor Gray
    Write-Host "Press Ctrl+C to exit"
    
    Start-Sleep -Seconds 5
}
