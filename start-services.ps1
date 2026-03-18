# Start all services directly (without Docker)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STARTING GST SERVICES DIRECTLY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start Auth Service
Write-Host "
?? Starting Auth Service (port 8005)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\auth-service; node server.js"
Start-Sleep -Seconds 2

# Start Payment Service
Write-Host "?? Starting Payment Service (port 8006)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\payment-service; node mpesa.js"
Start-Sleep -Seconds 2

# Start Web Server
Write-Host "?? Starting Web Server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform; npx http-server apps\web -p 3000"

Write-Host "
? All services started!" -ForegroundColor Green
Write-Host "?? Access your GST platform at: http://localhost:3000" -ForegroundColor Cyan
