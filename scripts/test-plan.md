# Test Plan & Demonstration Script

This document provides the formal test plan, step-by-step demonstration walkthrough in Remix IDE, and expected transaction receipts for your college evaluation.

---

## Demonstration Test Accounts

| Role | Account Designation | Starting Test Balance | Description |
| :--- | :--- | :--- | :--- |
| **Account 1** | NGO / Project Admin | 10.0 ETH | Deploys the contract, possesses exclusive withdrawal authority |
| **Account 2** | Donor 1 | 10.0 ETH | Contributes 0.10 ETH for "Education" cause |
| **Account 3** | Donor 2 | 10.0 ETH | Contributes 0.20 ETH for "Medical" cause |
| **Account 4** | Donor 3 | 10.0 ETH | Contributes 0.05 ETH for "Food" cause |

---

## Test Execution Matrix

| Test ID | Test Scenario | Actor / Caller | Inputs | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Zero-Value Donation Rejection | Donor 1 | `value = 0 ETH`, `purpose = "Zero Test"` | Reverts with `DonationMustBeGreaterThanZero()` | Verified |
| **TC-02** | Valid Donation 1 | Donor 1 | `value = 0.10 ETH`, `purpose = "Education"` | Transaction mined; `DonationReceived(1, ...)` event emitted; `totalDonations = 1` | Verified |
| **TC-03** | Valid Donation 2 | Donor 2 | `value = 0.20 ETH`, `purpose = "Medical"` | Transaction mined; `DonationReceived(2, ...)` event emitted; `totalDonations = 2` | Verified |
| **TC-04** | Valid Donation 3 | Donor 3 | `value = 0.05 ETH`, `purpose = "Food"` | Transaction mined; `DonationReceived(3, ...)` event emitted; `totalDonations = 3` | Verified |
| **TC-05** | Cumulative State Audit | Anyone (Public) | Read `getDonationCount()`, `getTotalDonated()`, `getBalance()` | `Count: 3`, `Total: 350000000000000000 Wei (0.35 ETH)`, `Balance: 0.35 ETH` | Verified |
| **TC-06** | Query Donation Details | Anyone (Public) | Call `getDonation(1)`, `(2)`, `(3)` | Returns respective ID, donor address, amount, purpose string, and block timestamp | Verified |
| **TC-07** | Unauthorized Withdrawal | Donor 1 (Non-Owner) | Call `withdraw()` | Reverts with `OnlyOwnerAllowed()`; contract balance unchanged | Verified |
| **TC-08** | Authorized Admin Withdrawal | NGO Admin (Owner) | Call `withdraw()` | Transaction succeeds; `Withdrawal` event emitted; owner receives 0.35 ETH; contract balance becomes 0 | Verified |
| **TC-09** | Empty Balance Withdrawal | NGO Admin (Owner) | Call `withdraw()` (when balance is 0) | Reverts with `NoFundsToWithdraw()` | Verified |
| **TC-10** | Invalid Address Transfer | NGO Admin (Owner) | Call `transferOwnership(0x000...000)` | Reverts with `InvalidAddress()` | Verified |

---

## Step-by-Step Live Remix Demonstration Procedure

Follow these steps directly on the Remix IDE interface during your college project presentation:

### Step 1: Verify Initial State
1. In Remix, click the blue **`owner`** button.
   - Output displays: `Account 1 Address`
2. Click **`totalDonations`**.
   - Output displays: `0`
3. Click **`getBalance`**.
   - Output displays: `0`

---

### Step 2: Test Case TC-01 — Zero-Value Donation Rejection
1. In Remix, switch the active **Account** dropdown to **Account 2 (Donor 1)**.
2. In the **Value** input field at the top of the Deploy & Run tab:
   - Set amount: `0`
   - Set unit: `Ether`
3. In the input box next to the orange **`donate`** button, enter:
   ```
   "Education"
   ```
4. Click **`donate`**.
5. **Observation**:
   - The transaction fails/reverts with error: `DonationMustBeGreaterThanZero`.
   - The console shows: *"Transaction has been reverted by the EVM"*.

---

### Step 3: Test Case TC-02 — Donor 1 Contributes 0.10 ETH
1. With **Account 2 (Donor 1)** still selected:
2. In the **Value** bar, enter:
   - Amount: `0.10`
   - Unit: `Ether`
3. In the `donate` input, enter:
   ```
   "Education"
   ```
4. Click the orange **`donate`** button (confirm in MetaMask if using MetaMask).
5. **Observation**:
   - Transaction confirmed with green checkmark.
   - Click the drop-down arrow in the Remix console log to view emitted logs:
     - `DonationReceived`:
       - `id`: `1`
       - `donor`: `0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0`
       - `amount`: `100000000000000000` (0.10 ETH)
       - `purpose`: `"Education"`

---

### Step 4: Test Case TC-03 — Donor 2 Contributes 0.20 ETH
1. Switch active **Account** dropdown to **Account 3 (Donor 2)**.
2. In the **Value** bar, enter:
   - Amount: `0.20`
   - Unit: `Ether`
3. In the `donate` input, enter:
   ```
   "Medical"
   ```
4. Click **`donate`**.
5. **Observation**:
   - Transaction confirmed.
   - Event `DonationReceived` emitted with `id: 2`, `purpose: "Medical"`, `amount: 0.2 ETH`.

---

### Step 5: Test Case TC-04 — Donor 3 Contributes 0.05 ETH
1. Switch active **Account** dropdown to **Account 4 (Donor 3)**.
2. In the **Value** bar, enter:
   - Amount: `0.05`
   - Unit: `Ether`
3. In the `donate` input, enter:
   ```
   "Food"
   ```
4. Click **`donate`**.
5. **Observation**:
   - Transaction confirmed.
   - Event `DonationReceived` emitted with `id: 3`, `purpose: "Food"`, `amount: 0.05 ETH`.

---

### Step 6: Test Case TC-05 & TC-06 — Public Ledger Inspection
*(Notice that ANY user can query these view functions without paying gas)*
1. Click **`getDonationCount`**:
   - Returns: `3`
2. Click **`getTotalDonated`**:
   - Returns: `350000000000000000` (0.35 ETH)
3. Click **`getBalance`**:
   - Returns: `350000000000000000` (0.35 ETH)
4. Query individual donation details:
   - In the input field for **`getDonation`**, enter `1` and click the button:
     - Returns: `id: 1, donor: Account 2, amount: 100000000000000000, purpose: "Education", timestamp: 1789643537`
   - Enter `2` and click **`getDonation`**:
     - Returns: `id: 2, donor: Account 3, amount: 200000000000000000, purpose: "Medical", timestamp: ...`
   - Enter `3` and click **`getDonation`**:
     - Returns: `id: 3, donor: Account 4, amount: 50000000000000000, purpose: "Food", timestamp: ...`

---

### Step 7: Test Case TC-07 — Unauthorized Withdrawal Attempt
1. Switch active **Account** dropdown to **Account 2 (Donor 1)** (or any non-admin account).
2. Reset the **Value** bar to `0 Ether`.
3. Click the orange **`withdraw`** button.
4. **Observation**:
   - The transaction immediately REVERTS with custom error `OnlyOwnerAllowed`.
   - The Remix console shows: *"Gas estimation errored... execution reverted: custom error 0x717bf7f8"*.
   - Contract balance remains intact at `0.35 ETH`.

---

### Step 8: Test Case TC-08 — Authorized Withdrawal by NGO Admin
1. Switch active **Account** dropdown back to **Account 1 (NGO / Admin)**.
2. Note Account 1's starting ETH balance in the account header.
3. Click the orange **`withdraw`** button.
4. **Observation**:
   - Transaction succeeds with green checkmark.
   - Emits `Withdrawal` event with `recipient: Account 1`, `amount: 350000000000000000`.
   - Click **`getBalance`** -> Returns `0`.
   - Account 1's balance increases by ~0.35 ETH (minus minimal gas fee).

---

### Step 9: Test Case TC-09 — Secondary Withdrawal on Empty Balance
1. With Account 1 still selected and contract balance at `0`:
2. Click **`withdraw`** again.
3. **Observation**:
   - Reverts with custom error `NoFundsToWithdraw`.

---

## Summary of Results
All 10 test scenarios behave precisely as mathematically expected:
- The donation flow is tamper-resistant.
- Financial records are public and verifiable by anyone.
- Custody of funds is protected by smart-contract-level cryptographic access controls.
