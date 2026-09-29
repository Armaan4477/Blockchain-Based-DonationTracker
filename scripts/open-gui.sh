#!/bin/bash
# Unified 1-Click Launcher for macOS / Linux
# Launches Geth Node, deploys contract, and starts React UI

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
DATA_DIR="$ROOT_DIR/geth-data"

echo "====================================================================="
echo "  BLOCKCHAIN-BASED TRANSPARENT DONATION TRACKING SYSTEM"
echo "  Unified Launcher (Geth Node + Smart Contract + React UI)"
echo "====================================================================="
echo ""

# 1. Check Geth command
if ! command -v geth &> /dev/null; then
    echo "[ERROR] 'geth' executable not found in PATH!"
    echo "Please install Geth before running this script:"
    echo "  brew tap ethereum/ethereum && brew install ethereum"
    exit 1
fi

# 2. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] 'node' executable not found in PATH!"
    echo "Please install Node.js (v18+) from https://nodejs.org"
    exit 1
fi

# Install root dependencies if missing
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "[INFO] Installing root dependencies (ethers)..."
    cd "$ROOT_DIR" && npm install
fi

# 3. Check / Start Geth Node
echo "[1/3] Checking local Geth blockchain node on port 8545..."
if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[INFO] Starting Geth background node..."
    mkdir -p "$DATA_DIR"
    geth --dev \
      --datadir "$DATA_DIR" \
      --http \
      --http.addr 127.0.0.1 \
      --http.port 8545 \
      --http.corsdomain "*" \
      --http.api "eth,net,web3,txpool" \
      --http.vhosts "*" \
      --dev.period 0 > "$ROOT_DIR/geth.log" 2>&1 &
    
    echo "Waiting for Geth RPC to initialize..."
    while ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; do
        sleep 1
    done
    echo "[OK] Geth node is live on http://127.0.0.1:8545 (PID: $!)"
else
    echo "[OK] Geth node is already running on port 8545."
fi
echo ""

# 4. Deploy contract & initialize accounts
echo "[2/3] Deploying smart contract & funding demo accounts..."
node "$SCRIPT_DIR/deploy-fresh.js"
if [ $? -ne 0 ]; then
    echo "[WARNING] Contract deployment script had an issue. Checking frontend..."
fi
echo ""

# 5. Start Frontend
echo "[3/3] Launching React Dashboard..."
cd "$ROOT_DIR/frontend" || exit 1
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    npm install
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open "http://localhost:5173") &
fi

npm run dev -- --host
