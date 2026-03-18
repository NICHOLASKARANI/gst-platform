Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STARTING GST PLATFORM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start Satellite Engine
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\satellite-engine; .\venv\Scripts\Activate.ps1; python main.py"
Start-Sleep -Seconds 2

# Start Weather AI
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\weather-ai-service; .\venv\Scripts\Activate.ps1; python main.py"
Start-Sleep -Seconds 2

# Start Location Service
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\location-service; npx ts-node src\index.ts"
Start-Sleep -Seconds 2

# Start API Gateway
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\api-gateway; npx ts-node src\index.ts"
Start-Sleep -Seconds 2

# Start Web Server
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform; npx http-server apps\web -p 3000"

Write-Host "
? ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "?? Access your GST platform at: http://localhost:3000" -ForegroundColor Cyan
