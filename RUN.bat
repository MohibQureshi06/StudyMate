@echo off
cd /d "C:\Users\Mohib Qureshi\Desktop\Course cover app"
echo Installing dependencies...
call npm install
echo.
echo Building frontend...
call npm run build
echo.
echo Starting application on single port...
echo Backend + Frontend: http://localhost:5000
echo.
node backend/server.js
pause
