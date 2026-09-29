# Student-Friendly Smart Contract Explanation: `DonationTracker.sol`

This document provides a line-by-line, conceptual explanation of `DonationTracker.sol` designed for undergraduate students preparing for code defense and viva examinations.

---

## 1. Compiler Directives & Licensing

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
```

- **`SPDX-License-Identifier: MIT`**: Indicates open-source licensing. This avoids compiler warnings regarding copyright ambiguity.
- **`pragma solidity ^0.8.20;`**: Specifies that the contract must be compiled with Solidity compiler version `0.8.20` or any newer compatible minor version (up to `0.9.0`). Solidity `0.8.x` features built-in overflow/underflow protection, removing the need for external libraries like `SafeMath`.

---

## 2. The Data Structure: `struct Donation`

```solidity
struct Donation {
    uint256 id;
    address donor;
    uint256 amount;
    string purpose;
    uint256 timestamp;
}
```

- **`struct`**: A custom composite user-defined data type in Solidity that bundles related fields together.
- **`uint256 id`**: An unsigned 256-bit integer serving as the unique, sequential identifier for the donation.
- **`address donor`**: A 20-byte Ethereum account address representing the wallet that initiated and signed the transaction.
- **`uint256 amount`**: The quantity of digital currency donated, recorded in **Wei** ($1\text{ ETH} = 10^{18}\text{ Wei}$).
- **`string purpose`**: A UTF-8 text string specifying the cause or category (e.g., "Education", "Medical").
- **`uint256 timestamp`**: The Unix epoch time (in seconds) corresponding to when the block containing this transaction was mined.

---

## 3. State Variables & Storage Layout

```solidity
address public owner;
uint256 public totalDonations;
uint256 public totalAmountDonated;
mapping(uint256 => Donation) private _donations;
```

- **State Variables**: Variables declared directly inside the contract body are permanently stored in Ethereum's persistent storage trie on the blockchain.
- **`owner`**: Stores the address of the authorized project administrator. Because it is marked `public`, Solidity automatically creates a free read getter function: `owner()`.
- **`totalDonations`**: Keeps track of how many donations have occurred. Also serves as an auto-incrementing counter for donation IDs.
- **`totalAmountDonated`**: Tracks the cumulative sum of all donations received over the lifetime of the contract.
- **`mapping(uint256 => Donation) private _donations`**: A key-value hash table where the key is the donation `id` and the value is the corresponding `Donation` struct. Lookups operate in constant $O(1)$ gas complexity.

---

## 4. Custom Errors (EIP-6093)

```solidity
error OnlyOwnerAllowed();
error DonationMustBeGreaterThanZero();
error EmptyPurpose();
error DonationNotFound(uint256 requestedId);
error NoFundsToWithdraw();
error InvalidAddress();
error TransferFailed();
error DirectTransferNotAllowed();
```

- **Why Custom Errors instead of `require(condition, "error string")`?**
  In earlier versions of Solidity, error strings consumed significant bytecode storage and gas. Custom errors (introduced in Solidity `0.8.4`) are encoded as 4-byte selectors. They drastically reduce contract deployment size and save gas whenever a transaction reverts.

---

## 5. Smart Contract Events

```solidity
event DonationReceived(
    uint256 indexed id,
    address indexed donor,
    uint256 amount,
    string purpose,
    uint256 timestamp
);

event Withdrawal(
    address indexed recipient,
    uint256 amount,
    uint256 timestamp
);
```

- **What are Events?**
  Events allow smart contracts to emit logs that are stored on the blockchain in transaction receipts. External user interfaces (like Remix, ethers.js, or mobile apps) can listen to these logs in real time.
- **The `indexed` keyword**:
  Allows up to three parameters to be indexed as searchable topics in Ethereum log bloom filters. This allows applications to quickly filter for "all donations made by address `0x...`" or "donation with ID `1`" without scanning every block.

---

## 6. Access Control: `modifier onlyOwner`

```solidity
modifier onlyOwner() {
    if (msg.sender != owner) {
        revert OnlyOwnerAllowed();
    }
    _;
}
```

- **Modifiers**: Reusable conditional guards that wrap around functions.
- **`msg.sender`**: A global EVM variable representing the address of the account directly calling the function.
- **The `_;` (merge point)**: Specifies where the actual function body executes after the condition check passes.

---

## 7. Constructor: Deployment Initialization

```solidity
constructor() {
    owner = msg.sender;
    emit OwnershipTransferred(address(0), msg.sender);
}
```

- Executes exactly once when the contract is deployed.
- Assigns the deployer's address (`msg.sender`) to `owner`.
- Emits `OwnershipTransferred` from `address(0)` to signify contract creation.

---

## 8. Core Transaction Functions

### A. The `donate` Function

```solidity
function donate(string calldata purpose) external payable returns (uint256 newDonationId) {
    if (msg.value == 0) revert DonationMustBeGreaterThanZero();
    if (bytes(purpose).length == 0) revert EmptyPurpose();

    totalDonations += 1;
    newDonationId = totalDonations;
    totalAmountDonated += msg.value;

    _donations[newDonationId] = Donation({
        id: newDonationId,
        donor: msg.sender,
        amount: msg.value,
        purpose: purpose,
        timestamp: block.timestamp
    });

    emit DonationReceived(
        newDonationId,
        msg.sender,
        msg.value,
        purpose,
        block.timestamp
    );

    return newDonationId;
}
```

- **`payable`**: Essential keyword! Without `payable`, any transaction attempting to send Ether (`msg.value > 0`) to the function will automatically revert.
- **`string calldata purpose`**: `calldata` is an immutable, non-modifiable data location for function arguments that saves significant gas compared to `memory`.
- **`msg.value`**: The exact quantity of Ether (in Wei) transferred with the transaction.
- **`block.timestamp`**: The timestamp of the current mined block.

---

### B. The `withdraw` Function & Checks-Effects-Interactions

```solidity
function withdraw() external onlyOwner {
    uint256 contractBalance = address(this).balance;

    if (contractBalance == 0) revert NoFundsToWithdraw();

    emit Withdrawal(owner, contractBalance, block.timestamp);

    (bool success, ) = payable(owner).call{value: contractBalance}("");
    if (!success) revert TransferFailed();
}
```

- **Checks-Effects-Interactions (CEI) Pattern**:
  1. **Checks**: Verify the caller is the owner (`onlyOwner`) and that funds exist (`contractBalance > 0`).
  2. **Effects**: Emit the `Withdrawal` event before transferring funds.
  3. **Interactions**: Perform the external call: `owner.call{value: contractBalance}("")`.
  Following this order ensures that even if the recipient were a malicious smart contract with a fallback loop, reentrancy attacks are mitigated.

---

## 9. Read-Only / View Functions

```solidity
function getDonation(uint256 id) external view returns (...) { ... }
function getDonationCount() external view returns (uint256) { ... }
function getTotalDonated() external view returns (uint256) { ... }
function getBalance() external view returns (uint256) { ... }
```

- **`view`**: Specifies that these functions only read state variables from the blockchain and do not modify storage.
- **Gas Cost for View Functions**:
  - When called externally by a user or web interface, `view` functions execute locally on the connected node and cost **zero gas**.
  - They provide instantaneous public transparency to any observer.

---

## 10. Fallback and Receive Safety Guards

```solidity
receive() external payable {
    revert DirectTransferNotAllowed();
}

fallback() external payable {
    revert DirectTransferNotAllowed();
}
```

- If an unsuspecting user attempts to send plain Ether directly to the contract address without calling `donate()`, the contract intentionally reverts. This guarantees that **every contribution must explicitly provide a categorical purpose**.
