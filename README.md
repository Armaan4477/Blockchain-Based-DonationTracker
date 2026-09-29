# Blockchain-Based Transparent Donation Tracking System Using Smart Contracts

**Academic Level**: Bachelor of Engineering (B.E.) in Computer Engineering / Computer Science  
**Submitted Platform**: Remix IDE (Front End) + Geth (Blockchain Node) + Solidity (Smart Contract)  
**Smart Contract**: `DonationTracker.sol` (^0.8.20)  
**Local Network**: Go-Ethereum (Geth 1.17.x, Dev Mode, Chain ID: 1337)  

---

## 1. Project Title
**Blockchain-Based Transparent Donation Tracking System Using Smart Contracts**

---

## 2. Abstract
Charitable and non-governmental organizations (NGOs) often face public skepticism due to a lack of financial transparency, opaque recordkeeping, and potential mismanagement of public contributions. This project implements a decentralized, transparent donation tracking system utilizing Ethereum smart contracts, a local Go-Ethereum (Geth) blockchain node, and the Remix IDE web interface. 

Donors can contribute digital currency while specifying the categorical purpose of their donation (e.g., Education, Medical, Food). Every transaction is permanently recorded on-chain with a unique donation identifier, the donor's cryptographic address, the contribution amount, an immutable block timestamp, and the stated purpose. The smart contract acts as an autonomous custodian, maintaining an auditable public ledger while restricting fund withdrawals exclusively to the authorized NGO administrator via cryptographic access controls. This architecture demonstrates how distributed ledger technology eliminates reliance on centralized, alterable donation databases.

---

## 3. Problem Statement
Traditional philanthropy and crowdfunding platforms suffer from critical structural vulnerabilities:
1. **Centralized Authority**: Financial ledgers are stored in proprietary, private databases (e.g., MySQL, Oracle) controlled solely by the organization.
2. **Data Mutability**: Centralized database records can be altered, fabricated, or deleted by internal administrators without leaving an externally verifiable trail.
3. **Information Asymmetry**: Donors cannot independently verify total collections, live vault balances, or the authentic allocation of funds.
4. **Third-Party Intermediaries**: High transaction fees and delays are introduced by conventional banking channels and payment aggregators.

---

## 4. Objectives
- Develop a secure, gas-efficient Solidity smart contract (`DonationTracker.sol`) enforcing immutable donation logging and role-based withdrawal controls.
- Deploy and operate a local private Ethereum blockchain using Go-Ethereum (Geth) running in developer mode with JSON-RPC enabled.
- Integrate Remix IDE as the primary developer and user interaction interface, connecting to the local Geth node via Web3 / JSON-RPC.
- Implement cryptographic access control ensuring that unauthorized accounts cannot withdraw funds.
- Emit smart contract events (`DonationReceived`, `Withdrawal`) for real-time auditability.
- Provide a clear demonstration of transparent custody: anyone can publicly inspect cumulative collections, individual donation records, and smart-contract balance.

---

## 5. Existing System vs. Proposed System

### Existing Centralized Model
- **Data Flow**: Donor $\rightarrow$ Payment Gateway $\rightarrow$ Centralized Server $\rightarrow$ Private SQL Database.
- **Vulnerabilities**: Single point of failure, data alteration risks, lack of public verification, high administrative overhead.

### Proposed Blockchain Model
- **Data Flow**: Donor $\rightarrow$ Remix Web Interface $\rightarrow$ Geth Node (JSON-RPC) $\rightarrow$ `DonationTracker` Smart Contract $\rightarrow$ Immutable Distributed Ledger.
- **Advantages**: Cryptographic authenticity (`msg.sender`), tamper-proof storage, public auditability (`view` functions), and programmatic enforcement of escrow and withdrawal policies.

---

## 6. System Architecture

```
+--------------------------------------------------------------------------+
|                        PRESENTATION LAYER (FRONT END)                    |
|             Remix IDE Browser Interface (https://remix.ethereum.org)     |
|             - Solidity Compiler (0.8.20+)                                |
|             - Deploy & Run Environment (Injected / External HTTP)        |
|             - Interactive UI: donate(), withdraw(), getDonation()        |
+--------------------------------------------------------------------------+
                                    |
                                    v JSON-RPC (Port 8545)
+--------------------------------------------------------------------------+
|                        BLOCKCHAIN NODE LAYER (GETH)                      |
|                  Go-Ethereum Local Dev Chain (geth.exe)                   |
|             - Network ID: 1337                                           |
|             - Proof-of-Authority (PoA) Consensus                         |
|             - Instant Block Mining on Submission (--dev.period 0)        |
+--------------------------------------------------------------------------+
                                    |
                                    v EVM Execution
+--------------------------------------------------------------------------+
|                      SMART CONTRACT EXECUTION LAYER                      |
|                 DonationTracker.sol (Deployed Bytecode)                  |
|             - Checks-Effects-Interactions Pattern                        |
|             - Custom Errors (OnlyOwnerAllowed, NoFundsToWithdraw)        |
|             - State Mapping: mapping(uint256 => Donation)                |
|             - Emitted Event Logs: DonationReceived, Withdrawal           |
+--------------------------------------------------------------------------+
```

---

## 7. Technologies Used
- **Smart Contract Language**: Solidity (`^0.8.20`)
- **Blockchain Node**: Go-Ethereum (Geth `v1.17.5-stable`, 64-bit Windows)
- **Frontend & Interaction Interface**: Remix IDE (Web browser interface)
- **Signer / Key Management**: MetaMask Browser Extension / Geth JSON-RPC Accounts
- **Protocol**: Ethereum JSON-RPC over HTTP (Port `8545`)
- **Testing & Verification**: Node.js (`v22.x`) & Ethers.js (`v6.x`)

---

## 8. Smart Contract Functionality (`DonationTracker.sol`)

### State Variables & Data Structures
- `struct Donation`: Contains `id`, `donor`, `amount`, `purpose`, and `timestamp`.
- `address public owner`: The authorized administrator address set at contract deployment.
- `uint256 public totalDonations`: Sequential counter of total donations made.
- `uint256 public totalAmountDonated`: Cumulative Wei collected since inception.
- `mapping(uint256 => Donation) private _donations`: Key-value storage mapping donation ID to struct.

### Core Functions
1. `donate(string calldata purpose) external payable`: Accepts Ether, validates non-zero value and non-empty purpose, assigns a sequential ID, records state, emits `DonationReceived`, and returns the donation ID.
2. `getDonation(uint256 id) external view`: Publicly returns full donation details for any ID.
3. `getDonationCount() external view`: Returns `totalDonations`.
4. `getTotalDonated() external view`: Returns cumulative Ether received in Wei.
5. `getBalance() external view`: Returns current balance held in contract custody.
6. `withdraw() external onlyOwner`: Restricts withdrawal to `owner`; transfers contract balance using Checks-Effects-Interactions and emits `Withdrawal`.
7. `transferOwnership(address newOwner) external onlyOwner`: Transfers admin role with zero-address guard.

---

## 9. Setup & Installation (Windows)

### Prerequisites
- Windows 10 or 11 (64-bit)
- Go-Ethereum (Geth) installed (default path: `C:\Program Files\Geth\geth.exe`)
- Modern web browser (Chrome, Edge, or Brave)
- Node.js (v18+ or v22+)

### Step 1: Start the Local Geth Node
Run the included batch script to launch your private blockchain:
```cmd
cd "C:\Users\User\Desktop\BC PROJECT\scripts"
start-geth.bat
```
*Leave this command prompt open. Geth will start an HTTP-RPC listener on `http://127.0.0.1:8545` with CORS configured for Remix.*

### Step 2: Open Remix IDE
1. Open your browser and navigate to [https://remix.ethereum.org](https://remix.ethereum.org).
2. Create a new file in Remix's `contracts/` directory named `DonationTracker.sol`.
3. Copy the contract code from `contracts/DonationTracker.sol` in this repository and paste it into Remix.

### Step 3: Compile Contract in Remix
1. Click the **Solidity Compiler** tab on the left sidebar.
2. Select compiler version `0.8.20` or higher.
3. Click **Compile DonationTracker.sol**. Ensure a green checkmark appears.

### Step 4: Connect Remix to Geth
1. In Remix, click the **Deploy & Run Transactions** tab.
2. Under **Environment**, choose either:
   - **Injected Provider - MetaMask**: Connect MetaMask to Localhost RPC `http://127.0.0.1:8545`, Chain ID `1337`.
   - OR **Custom - External HTTP Provider**: Enter `http://127.0.0.1:8545`.
3. Verify that your account displays an available Ether balance.

---

## 10. College Demonstration Workflow & Test Scenarios

The system is demonstrated using four distinct local test accounts:

| Account | Role | Simulated Action |
| :--- | :--- | :--- |
| **Account 1** | NGO / Admin | Contract deployer, exclusive withdrawal authority |
| **Account 2** | Donor 1 | Donates **0.10 ETH** with purpose **"Education"** |
| **Account 3** | Donor 2 | Donates **0.20 ETH** with purpose **"Medical"** |
| **Account 4** | Donor 3 | Donates **0.05 ETH** with purpose **"Food"** |

### Execution Steps & Expected Results

#### Step 1: Deploy Contract
- Select **Account 1 (Admin)** in Remix.
- Click **Deploy**.
- Deployed address appears under "Deployed Contracts". Initial balance is `0 ETH`.

#### Step 2: Test Zero-Value Donation Rejection (Error Handling)
- Select **Account 2 (Donor 1)**.
- Set Value: `0 Ether`. Input Purpose: `"Zero Test"`.
- Click `donate`.
- **Result**: Transaction reverts with `DonationMustBeGreaterThanZero`.

#### Step 3: Donor 1 Contributes
- Value: `0.10 Ether`. Purpose: `"Education"`.
- Click `donate`.
- **Result**: Transaction confirmed. Emits `DonationReceived(id=1, donor=Account 2, amount=0.1 ETH, purpose="Education")`.

#### Step 4: Donor 2 Contributes
- Switch to **Account 3 (Donor 2)**. Value: `0.20 Ether`. Purpose: `"Medical"`.
- Click `donate`.
- **Result**: Transaction confirmed. Emits `DonationReceived(id=2, ...)`.

#### Step 5: Donor 3 Contributes
- Switch to **Account 4 (Donor 3)**. Value: `0.05 Ether`. Purpose: `"Food"`.
- Click `donate`.
- **Result**: Transaction confirmed. Emits `DonationReceived(id=3, ...)`.

#### Step 6: Public Transparency Inspection
- Click `getDonationCount` $\rightarrow$ Returns **`3`**.
- Click `getTotalDonated` $\rightarrow$ Returns **`350000000000000000`** (0.35 ETH).
- Click `getBalance` $\rightarrow$ Returns **`350000000000000000`** (0.35 ETH).
- Query `getDonation(1)`, `getDonation(2)`, `getDonation(3)` to show each donor's public record.

#### Step 7: Unauthorized Withdrawal Rejection (Security Enforcement)
- Switch to **Account 2 (Donor 1)**.
- Click `withdraw`.
- **Result**: Transaction **REVERTS** with `OnlyOwnerAllowed`. Contract balance remains intact at 0.35 ETH.

#### Step 8: Authorized Admin Withdrawal
- Switch to **Account 1 (Admin/NGO)**.
- Click `withdraw`.
- **Result**: Transaction succeeds. Emits `Withdrawal(recipient=Account 1, amount=0.35 ETH)`.
- Click `getBalance` $\rightarrow$ Returns **`0`**. Admin account receives 0.35 ETH.

---

## 11. Automated Verification Script
To prove 100% correct execution without relying on manual steps, run the included verification script:
```cmd
node scripts/verify-contract.js
```
This script connects to the running Geth node, deploys `DonationTracker.sol`, executes all 4 accounts, tests all 10 success/failure cases, and validates receipts automatically.

---

## 12. Companion Web GUI Dashboard (React.js + Ethers.js)
While the official college-submitted architecture remains **Remix IDE + Geth + Solidity**, a full-featured, client-side React.js Web3 dashboard is provided under `frontend/` to demonstrate how modern decentralized web applications interface with the smart contract:

- **Technologies**: React.js (v19), Vite (v8), Ethers.js (v6), Modern CSS (Dark Glassmorphism).
- **Features**:
  - Live Geth node connectivity indicator (Port 8545, Chain ID 1337, current block number).
  - MetaMask wallet connection & automatic network switching to Geth devnet.
  - Metrics cards: Total Donations, Donated Volume (ETH), and Escrow Vault Balance (ETH).
  - Interactive Donor Portal with category chips (Education, Medical, Food, Disaster Relief), amount quick-select buttons (+0.1, +0.5, +1.0, +2.0 ETH), and transaction status.
  - NGO Admin Console detecting owner wallet, vault withdrawal action, and ownership transfer.
  - Public Transparent Ledger explorer table displaying every on-chain donation with donor address (1-click clipboard copy), amount, cause, and verified block timestamp.
  - Real-time event subscription (`DonationReceived`, `Withdrawal`) auto-updating the UI.
- **How to Launch**:
  - Double-click `scripts/start-frontend.bat` (or run `scripts/open-gui.bat`).
  - The browser will automatically open `http://localhost:5173`.
  - Paste your deployed contract address from Remix and click **Load Contract**.

---

## 13. Project Limitations & Ethical Transparency
1. **The Real-World Boundary (The Oracle Problem)**: The smart contract provides complete transparency over who gave what amount, when, and how much was collected and initially withdrawn. However, once funds are transferred into the administrator's custody and converted into fiat or physical goods (e.g. purchasing medical supplies), physical off-chain auditing is required.
2. **Cryptocurrency Volatility**: Market price fluctuations can affect the real-world purchasing value of on-chain balances.

---

## 14. Future Scope
- **Multi-Signature Treasury (Gnosis Safe Model)**: Require multiple trustees/board members to sign withdrawal transactions rather than a single administrator.
- **Milestone-Based Escrow Release**: Release funds in tranches contingent on community voting or proof of completed charitable milestones.
- **IPFS Integration**: Store and link photographic proofs of expenditure and receipts directly on-chain.

---

## 15. Screenshots Checklist for Project Report
When preparing your official college project documentation and PowerPoint slides, capture the following screenshots:

1. **Geth Node Startup**: Command prompt showing `start-geth.bat` running with Geth listening on port 8545.
2. **Remix Compilation**: Solidity Compiler tab showing successful compilation of `DonationTracker.sol` with version `0.8.20` and green checkmark.
3. **Remix Environment Connection**: Deploy tab showing environment set to `Injected Provider` or `Custom - External HTTP Provider` connected to `http://127.0.0.1:8545`.
4. **Contract Deployment**: Deployed contract showing under "Deployed Contracts" with initial `owner` and zero balance.
5. **Zero-Donation Error**: Console showing transaction revert on 0 Ether contribution.
6. **Donor Transactions**: Successful `donate()` calls for Donors 1, 2, and 3 showing emitted logs in Remix terminal.
7. **Read-Only Ledger Verification**: Clicking `getDonationCount` (3), `getTotalDonated` (0.35 ETH), and `getDonation(1)`.
8. **Unauthorized Withdrawal Failure**: Red error message in Remix when Donor 1 attempts `withdraw()`.
9. **Authorized Admin Withdrawal**: Success receipt for Account 1 `withdraw()`, showing `getBalance` reducing to `0`.
10. **Automated Test Report**: Terminal output of `node scripts/verify-contract.js` showing 10 passed tests.
11. **Companion GUI Dashboard**: Web interface showing live on-chain metrics and the public transparent ledger table.

---

## 16. Conclusion
The **Blockchain-Based Transparent Donation Tracking System** demonstrates how smart contracts running on Go-Ethereum can fundamentally improve accountability in charitable fundraising. By eliminating mutable centralized databases, the platform guarantees that donation records cannot be retroactively altered, financial inflows remain publicly auditable, and custody is governed by cryptographic code rather than blind human trust.
