@echo off
TITLE Reset Blockchain - Clean Slate (0 Donations)
color 0E

echo =====================================================================
echo   DONATION TRACKER - 1-CLICK CLEAN SLATE RESET
echo =====================================================================
echo   This will:
echo     1. Stop running Geth node
echo     2. Clear blockchain data (reset blocks to #0 and donations to 0)
echo     3. Restart fresh persistent Geth node on port 8545
echo     4. Pre-fund demo accounts with 50 ETH each
echo     5. Deploy a clean smart contract
echo =====================================================================
echo.

set /p CONFIRM="Are you sure you want to reset all donations to 0? [Y/N] (Default: Y): "
if /i "%CONFIRM%"=="N" (
    echo Reset cancelled.
    pause
    exit /b 0
)

echo.
echo [1/4] Stopping any active Geth processes...
taskkill /F /IM geth.exe >nul 2>nul
timeout /t 2 /nobreak >nul

set "DATA_DIR=%~dp0..\geth-data"
echo [2/4] Wiping old blockchain data from %DATA_DIR%...
if exist "%DATA_DIR%" (
    rmdir /S /Q "%DATA_DIR%"
)
timeout /t 1 /nobreak >nul

echo [3/4] Launching fresh Geth node...
start "Geth Local Blockchain (Persistent Mode)" cmd /k "call ""%~dp0start-geth-persistent.bat"""

echo Waiting for Geth RPC to initialize...
:wait_rpc
timeout /t 2 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 8545); $c.Close(); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo Still waiting for Geth port 8545...
    goto wait_rpc
)
echo [OK] Geth node is online!

echo.
echo [4/4] Deploying fresh smart contract and funding accounts...
node "%~dp0deploy-fresh.js"

echo.
echo =====================================================================
echo   [SUCCESS] Clean Slate Complete!
echo   - Blockchain reset to Block #0
echo   - Total Donations: 0
echo   - All demo accounts funded with 50 ETH each
echo   - Default Admin Owner: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
echo =====================================================================
echo.
echo You can now open http://localhost:5173/ in any browser to test!
echo.
pause
