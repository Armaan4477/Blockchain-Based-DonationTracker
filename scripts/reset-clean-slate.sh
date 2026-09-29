#!/bin/bash
# Reset Blockchain - Clean Slate (0 Donations) for macOS / Linux

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
DATA_DIR="$ROOT_DIR/geth-data"

echo "====================================================================="
echo "  DONATION TRACKER - 1-CLICK CLEAN SLATE RESET"
echo "====================================================================="
echo "  This will:"
echo "    1. Stop any running Geth node"
echo "    2. Clear blockchain data (reset blocks to #0 and donations to 0)"
echo "    3. Restart fresh persistent Geth node on port 8545"
echo "    4. Pre-fund demo accounts with 50 ETH each"
echo "    5. Deploy a clean smart contract"
echo "====================================================================="
echo ""

read -p "Are you sure you want to reset all donations to 0? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Reset cancelled."
    exit 0
fi

echo ""
echo "[1/4] Stopping any active Geth processes..."
killall geth 2>/dev/null
pkill -f geth 2>/dev/null
sleep 2

echo "[2/4] Wiping old blockchain data from $DATA_DIR..."
rm -rf "$DATA_DIR"
mkdir -p "$DATA_DIR"
sleep 1

echo "[3/4] Launching fresh Geth node..."
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
echo "[OK] Geth node is online!"

echo ""
echo "[4/4] Deploying fresh smart contract and funding accounts..."
node "$SCRIPT_DIR/deploy-fresh.js"

echo ""
echo "====================================================================="
echo "  [SUCCESS] Clean Slate Complete!"
echo "  - Blockchain reset to Block #0"
echo "  - Total Donations: 0"
echo "  - All demo accounts funded with 50 ETH each"
echo "  - Default Admin Owner: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
echo "====================================================================="
echo ""
echo "You can now open http://localhost:5173/ in any browser to test!"
echo ""
