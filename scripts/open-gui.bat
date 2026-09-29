@echo off
TITLE Launch Donation Tracker Complete System
color 0A

echo =====================================================================
echo   BLOCKCHAIN-BASED TRANSPARENT DONATION TRACKING SYSTEM
echo   Unified 1-Click Launcher (Geth Node + Smart Contract + React UI)
echo =====================================================================
echo.

:: 1. Check if Geth is running on port 8545
echo [1/3] Checking local Geth blockchain node status (Port 8545)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 8545); $c.Close(); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [INFO] Geth node is not running. Launching Geth in persistent dev mode...
    start "Geth Local Blockchain (Persistent Mode)" cmd /k "call ""%~dp0start-geth-persistent.bat"""
    
    echo Waiting for Geth RPC to initialize...
    :wait_geth
    timeout /t 2 /nobreak >nul
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 8545); $c.Close(); exit 0 } catch { exit 1 }"
    if %errorlevel% neq 0 (
        echo Still waiting for Geth node...
        goto wait_geth
    )
    echo [OK] Geth node is live on http://127.0.0.1:8545!
) else (
    echo [OK] Geth node is already running on port 8545.
)
echo.

:: 2. Deploy / verify contract & sample data
echo [2/3] Checking smart contract deployment and sample data...
node "%~dp0deploy-fresh.js"
if %errorlevel% neq 0 (
    echo [WARNING] Contract deployment check returned an error. Proceeding to frontend...
)
echo.

:: 3. Launch React frontend dashboard
echo [3/3] Launching React Dashboard...
call "%~dp0start-frontend.bat"
