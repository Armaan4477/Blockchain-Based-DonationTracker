# Step-by-Step Deployment Guide: Remix IDE + Geth

This guide provides the exact procedure to run your local Geth blockchain and deploy `DonationTracker.sol` using Remix IDE as your front-end interaction interface.

---

## Architecture Overview
```
+-------------------------------------------------------------+
|                      USER / DEMONSTRATOR                    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                 Remix IDE (Web Browser Frontend)            |
|                   https://remix.ethereum.org                |
|  - Compiles DonationTracker.sol                             |
|  - UI to trigger donate(), withdraw(), getDonation()        |
+-------------------------------------------------------------+
                              |
                              v JSON-RPC via Port 8545
+-------------------------------------------------------------+
|                 Local Geth Blockchain Node                  |
|                   (geth.exe in --dev mode)                  |
|  - Instant mining on transaction (--dev.period 0)           |
|  - Chain ID: 1337 (0x539)                                   |
|  - HTTP RPC: http://127.0.0.1:8545                          |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Ethereum EVM State                      |
|  - Smart Contract Bytecode & Storage                        |
|  - Account balances, transaction receipts, emitted events   |
+-------------------------------------------------------------+
```

---

## Phase 1: Start the Local Geth Blockchain Node

1. Navigate to the `scripts/` directory:
   ```cmd
   cd "C:\Users\User\Desktop\BC PROJECT\scripts"
   ```
2. Double-click or run `start-geth.bat`:
   ```cmd
   start-geth.bat
   ```
3. A command prompt window will open showing:
   ```
   [OK] Using Geth at: "C:\Program Files\Geth\geth.exe"
   ...
   HTTP server started endpoint=127.0.0.1:8545 auth=false prefix= cors=https://remix.ethereum.org...
   ```
4. **IMPORTANT**: Keep this command prompt window open throughout your demonstration. This is your active local blockchain node.

---

## Phase 2: Open and Configure Remix IDE

1. Open your web browser (Google Chrome or Brave recommended) and navigate to:
   ```
   https://remix.ethereum.org
   ```
2. In the left-hand sidebar, open the **File Explorer** tab (the top-left icon).
3. Under the `contracts/` directory in Remix, create a new file named:
   ```
   DonationTracker.sol
   ```
4. Open `contracts/DonationTracker.sol` from this repository, copy the entire code, and paste it into Remix's editor.

---

## Phase 3: Compile the Smart Contract

1. In Remix, click on the **Solidity Compiler** tab (3rd icon from top on the left sidebar).
2. Set the following settings:
   - **Compiler**: `0.8.20` (or any `0.8.x` version >= 0.8.20)
   - **Language**: `Solidity`
   - **EVM Version**: `default`
3. Click the blue button: **Compile DonationTracker.sol**.
4. A green checkmark will appear on the compiler icon indicating successful compilation with 0 errors.

---

## Phase 4: Connect Remix to Local Geth Node

You have two simple options to connect Remix to your local Geth node. **Method A (MetaMask)** is recommended because it makes switching between the 4 demo accounts visual and realistic.

### Method A: Injected Provider - MetaMask (Recommended)

1. Open the MetaMask browser extension.
2. Click the Network dropdown (top-left of MetaMask) -> **Add Network** -> **Add a network manually**.
3. Enter the following network details:
   - **Network Name**: `Geth Localhost`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
4. Click **Save** and switch to `Geth Localhost`.
5. Create or select 4 accounts in MetaMask:
   - **Account 1**: `NGO Admin`
   - **Account 2**: `Donor 1`
   - **Account 3**: `Donor 2`
   - **Account 4**: `Donor 3`
6. To fund your MetaMask accounts with local development ETH, open a command prompt in the project directory and run:
   ```cmd
   node scripts/fund-accounts.js <your_account_1_address> <your_account_2_address> ...
   ```
   Or run without arguments to fund the default demo accounts:
   ```cmd
   node scripts/fund-accounts.js
   ```
7. In Remix, open the **Deploy & Run Transactions** tab (4th icon from top on the left sidebar).
8. In the **Environment** dropdown, select:
   ```
   Injected Provider - MetaMask
   ```
9. Confirm the connection prompt in MetaMask. You will see your selected MetaMask account address and its ETH balance displayed in Remix.

---

### Method B: Custom - External HTTP Provider (Direct RPC)

If you do not want to use MetaMask, you can connect Remix directly to Geth:

1. In Remix, open the **Deploy & Run Transactions** tab.
2. In the **Environment** dropdown, scroll down and select:
   ```
   Custom - External HTTP Provider
   ```
3. A modal will ask for the Web3 Provider Endpoint:
   ```
   http://127.0.0.1:8545
   ```
4. Click **OK**.
5. Remix will connect directly to Geth and load the pre-funded Geth developer account (`0x71562b71999873db5b286df957af199ec94617f7`).

---

## Phase 5: Deploy the Contract

1. Ensure the **Contract** dropdown in Remix displays:
   ```
   DonationTracker - contracts/DonationTracker.sol
   ```
2. Ensure your active account in Remix is **Account 1 (NGO / Admin)**.
3. Click the orange **Deploy** button.
4. If using MetaMask, click **Confirm** on the MetaMask pop-up.
5. In Remix's bottom console, you will see a transaction confirmation with a green checkmark:
   ```
   [vm] from: 0x... to: DonationTracker.(constructor) value: 0 wei data: 0x... logs: 1 hash: 0x...
   ```
6. Look under the **Deployed Contracts** section at the bottom-left of Remix.
7. You will see:
   ```
   DONATIONTRACKER AT 0x... (MEMORY / GETHLOCALHOST)
   ```
8. Expand the deployed contract by clicking the arrow next to its name. You will see all callable functions:
   - **Orange buttons (State-changing write transactions)**:
     - `donate` (payable)
     - `withdraw`
     - `transferOwnership`
   - **Blue buttons (Read-only view queries)**:
     - `getBalance`
     - `getDonation`
     - `getDonationCount`
     - `getTotalDonated`
     - `owner`
     - `totalAmountDonated`
     - `totalDonations`

The contract is now deployed and ready for live demonstration!
