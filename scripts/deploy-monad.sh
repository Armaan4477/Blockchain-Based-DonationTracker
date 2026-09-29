#!/bin/bash

# Ensure PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable is not set."
    echo "Please set it using: export PRIVATE_KEY='your_private_key'"
    exit 1
fi

echo "Building contracts..."
forge build

echo "Deploying DonationTracker to Monad Testnet..."
# Run the deployment script and capture output
OUTPUT=$(forge script script/DeployMonad.s.sol:DeployMonad --rpc-url monad_testnet --broadcast --legacy)
echo "$OUTPUT"

# Extract deployed address
CONTRACT_ADDRESS=$(echo "$OUTPUT" | grep "DonationTracker deployed at:" | awk '{print $NF}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "Failed to extract contract address from deployment output."
    exit 1
fi

echo "Successfully deployed at: $CONTRACT_ADDRESS"

# Update the frontend config
CONFIG_PATH="frontend/src/contracts/contractConfig.js"
if [ -f "$CONFIG_PATH" ]; then
    # Use sed to replace the DEFAULT_CONTRACT_ADDRESS
    sed -i.bak -E "s/DEFAULT_CONTRACT_ADDRESS = \"0x[a-fA-F0-9]+\"/DEFAULT_CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/" "$CONFIG_PATH"
    rm -f "${CONFIG_PATH}.bak"
    echo "Updated $CONFIG_PATH with the new contract address."
else
    echo "Warning: Frontend config file not found at $CONFIG_PATH"
fi
