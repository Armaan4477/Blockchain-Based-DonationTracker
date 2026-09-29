@echo off
TITLE Geth Local Blockchain (Persistent Mode) - Donation Tracker
color 0B

echo =====================================================================
echo   BLOCKCHAIN-BASED TRANSPARENT DONATION TRACKING SYSTEM
echo   Local Ethereum Node (Geth Persistent Dev Mode)
echo =====================================================================
echo.

:: 1. Locate geth.exe
set GETH_EXE=geth
where geth >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Geth\geth.exe" (
        set "GETH_EXE=C:\Program Files\Geth\geth.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Geth\geth.exe" (
        set "GETH_EXE=%LOCALAPPDATA%\Programs\Geth\geth.exe"
    ) else (
        echo [ERROR] Geth executable not found!
        pause
        exit /b 1
    )
)

:: Check if Geth is already running on port 8545
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 8545); $c.Close(); exit 0 } catch { exit 1 }"
if %errorlevel% equ 0 (
    set BLOCK_HEIGHT=unknown
    for /f "delims=" %%B in ('node -e "fetch('http://127.0.0.1:8545', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({jsonrpc:'2.0', method:'eth_blockNumber', params:[], id:1})}).then(r=>r.json()).then(d=>console.log(parseInt(d.result, 16))).catch(()=>console.log('unknown'))" 2^>nul') do set BLOCK_HEIGHT=%%B

    color 0A
    echo =====================================================================
    echo   [ACTIVE] GETH BLOCKCHAIN IS ALREADY RUNNING AND HEALTHY!
    echo =====================================================================
    echo   - RPC URL        : http://127.0.0.1:8545
    echo   - Network / Chain: 1337 [Chain ID: 0x539]
    node -e "fetch('http://127.0.0.1:8545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method:'eth_blockNumber',params:[],id:1})}).then(r=>r.json()).then(d=>console.log('  - Current Block  : #' + parseInt(d.result,16))).catch(()=>console.log('  - Current Block  : Active'))"
    echo   - Status         : Online and accepting transactions
    echo =====================================================================
    echo.
    echo NOTE: Geth is running in the background. Only ONE copy of Geth
    echo can access the blockchain database at a time.
    echo.
    echo Choose an option:
    echo   [1] Keep background node running - Recommended [Press Enter]
    echo   [2] Stop background node and restart Geth in this visible window
    echo.
    set /p USER_CHOICE="Enter choice [1 or 2] (Default: 1): "
    if "%USER_CHOICE%"=="2" (
        echo.
        echo Stopping background Geth process...
        taskkill /F /IM geth.exe >nul 2>nul
        timeout /t 2 /nobreak >nul
        echo Starting fresh Geth node in this window...
        goto start_geth
    ) else (
        echo.
        echo Geth continues running in the background.
        echo You can safely close this status window.
        pause
        exit /b 0
    )
)

:start_geth

echo [OK] Using Geth at: "%GETH_EXE%"
echo.

set DATA_DIR=%~dp0..\geth-data
if not exist "%DATA_DIR%" (
    echo Creating persistent data directory at: %DATA_DIR%
    mkdir "%DATA_DIR%"
)

echo =====================================================================
echo Starting Geth with Persistent Storage:
echo   - HTTP-RPC Interface : http://127.0.0.1:8545
echo   - Network / Chain ID : 1337 (0x539)
echo   - Allowed CORS       : * (All origins: Remix, Vite Localhost)
echo   - Mining Mode        : Instant on transaction submission (--dev.period 0)
echo   - Data Directory     : %DATA_DIR%
echo =====================================================================
echo.
echo NOTE: Data, accounts, and deployed contracts are saved to %DATA_DIR%.
echo To stop Geth, press Ctrl+C in this window.
echo.

"%GETH_EXE%" --dev ^
  --datadir "%DATA_DIR%" ^
  --http ^
  --http.addr 127.0.0.1 ^
  --http.port 8545 ^
  --http.corsdomain "*" ^
  --http.api "eth,net,web3,txpool" ^
  --http.vhosts "*" ^
  --dev.period 0

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Geth closed with error code %errorlevel%.
    pause
)
