#!/bin/bash
# Start Vite React Frontend for macOS / Linux

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

echo "====================================================================="
echo "  BLOCKCHAIN-BASED TRANSPARENT DONATION TRACKING SYSTEM"
echo "  React.js Web3 Frontend Dashboard"
echo "====================================================================="
echo ""

cd "$FRONTEND_DIR" || exit 1

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing React dependencies..."
    npm install
fi

echo "Starting Vite React Dev Server on http://localhost:5173..."
echo ""

# Try to open in default browser on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open "http://localhost:5173") &
fi

npm run dev -- --host
