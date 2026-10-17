@echo off
cd /d "C:\Users\Mohib Qureshi\Desktop\Course cover app"

echo.
echo ════════════════════════════════════════════════════════════════
echo                  StudyMate - Single Port Setup
echo ════════════════════════════════════════════════════════════════
echo.

if not exist "node_modules" (
    echo Installing dependencies... Please wait...
    call npm install
    echo.
)

if not exist "frontend\dist" (
    echo Building frontend... Please wait...
    call npm run build
    echo.
)

echo.
echo ════════════════════════════════════════════════════════════════
echo                      Starting Application
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ Backend: http://localhost:5000
echo ✅ Frontend: http://localhost:5000
echo ✅ API: http://localhost:5000/api
echo.
echo Open your browser to: http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.
echo ════════════════════════════════════════════════════════════════
echo.

node backend/server.js

pause
