# GST Service Monitor
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GST SERVICE MONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Website"; Port=3000; Url="http://localhost:3000"},
    @{Name="Auth Service"; Port=8005; Url="http://localhost:8005/health"},
    @{Name="Payment Service"; Port=8006; Url="http://localhost:8006/health"}
)

foreach ($service in $services) {
    Write-Host "$($service.Name): " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "? RUNNING (port $($service.Port))" -ForegroundColor Green
        } else {
            Write-Host "? ERROR (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "? NOT RUNNING (port $($service.Port))" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "?? To view processes:" -ForegroundColor Yellow
Write-Host "   Get-Process -Name node, http-server" -ForegroundColor Gray
Write-Host ""
