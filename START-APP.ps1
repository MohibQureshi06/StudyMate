# StudyMate - Application Startup Script for PowerShell

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "     StudyMate - Exam Prep Manager" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting StudyMate Application" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend will start on:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend will start on: http://localhost:5173" -ForegroundColor Green
Write-Host "`nApplication is starting...`n" -ForegroundColor Yellow

# Start the development servers
npm run dev

Read-Host "Press Enter to exit"
