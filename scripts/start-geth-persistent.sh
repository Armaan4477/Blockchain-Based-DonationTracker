#!/bin/bash
# Geth Local Blockchain (Persistent Mode) - Donation Tracker for macOS / Linux

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../geth-data"

echo "====================================================================="
echo "  BLOCKCHAIN-BASED TRANSPARENT DONATION TRACKING SYSTEM"
echo "  Local Ethereum Node (Geth Persistent Dev Mode)"
echo "====================================================================="
echo ""

# 1. Check if geth is installed
if ! command -v geth &> /dev/null; then
    echo "[ERROR] 'geth' executable not found in PATH!"
    echo "On macOS, install it using Homebrew:"
    echo "    brew tap ethereum/ethereum"
    echo "    brew install ethereum"
    echo ""
    echo "Or download the macOS binary from: https://geth.ethereum.org/downloads"
    exit 1
fi

# 2. Check if port 8545 is already in use
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "====================================================================="
    echo "  [ACTIVE] GETH BLOCKCHAIN IS ALREADY RUNNING ON PORT 8545"
    echo "====================================================================="
    echo "  - RPC URL: http://127.0.0.1:8545"
    echo "  - Chain ID: 1337"
    echo "A local node is already active. You can proceed with deployment or frontend."
    exit 0
fi

# 3. Ensure data directory exists
mkdir -p "$DATA_DIR"

echo "====================================================================="
echo "Starting Geth with Persistent Storage:"
echo "  - HTTP-RPC Interface : http://127.0.0.1:8545"
echo "  - Network / Chain ID : 1337 (0x539)"
echo "  - Data Directory     : $DATA_DIR"
echo "  - Mining Mode        : Instant (--dev.period 0)"
echo "====================================================================="
echo "Press Ctrl+C to stop the node."
echo ""

geth --dev \
  --datadir "$DATA_DIR" \
  --http \
  --http.addr 127.0.0.1 \
  --http.port 8545 \
  --http.corsdomain "*" \
  --http.api "eth,net,web3,txpool" \
  --http.vhosts "*" \
  --dev.period 0
