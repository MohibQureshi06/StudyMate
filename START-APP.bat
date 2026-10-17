@echo off
REM StudyMate - Application Startup Script for Windows

echo.
echo ========================================
echo     StudyMate - Exam Prep Manager
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Starting StudyMate Application
echo ========================================
echo.
echo Backend will start on:  http://localhost:5000
echo Frontend will start on: http://localhost:5173
echo.
echo Application will open automatically...
echo.

REM Start the development servers
call npm run dev

pause
