@echo off
TITLE DonationTracker React Dashboard
color 0B

echo =====================================================================
echo   BLOCKCHAIN-BASED TRANSPARENT DONATION TRACKING SYSTEM
echo   React.js Web3 Frontend Dashboard
echo =====================================================================
echo.

cd "%~dp0..\frontend"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing React dependencies...
    call npm.cmd install
)

echo Starting Vite React Dev Server on http://localhost:5173...
echo.
start http://localhost:5173
call npm.cmd run dev -- --host

pause
