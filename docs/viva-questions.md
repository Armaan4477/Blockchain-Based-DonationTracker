# Viva Voce Examination Questions & Answers

This document contains 25 high-frequency viva examination questions and model answers designed for the BE Computer Engineering defense of the **Blockchain-Based Transparent Donation Tracking System Using Smart Contracts**.

---

### Q1: What is a Blockchain?
**Answer:**
A blockchain is a decentralized, distributed, and append-only digital ledger of transactions duplicated across a network of computer systems (nodes). Transactions are grouped into cryptographic blocks linked together using cryptographic hashes (SHA-256 or Keccak-256), making past records tamper-resistant without requiring a centralized intermediary.

---

### Q2: What is Ethereum?
**Answer:**
Ethereum is an open-source, decentralized blockchain platform featuring smart-contract functionality. Unlike Bitcoin, which was designed primarily as a peer-to-peer electronic cash system, Ethereum is a general-purpose programmable blockchain powered by the Turing-complete Ethereum Virtual Machine (EVM).

---

### Q3: What is Geth?
**Answer:**
Geth (Go-Ethereum) is the official Golang client implementation of the Ethereum protocol. It operates as an Ethereum node, handling peer-to-peer networking, transaction pooling, consensus verification, block mining, EVM execution, and JSON-RPC API interfaces (over HTTP or WebSockets) for external applications.

---

### Q4: Why did we run Geth with the `--dev` flag?
**Answer:**
The `--dev` flag starts Geth in **Developer Mode**. It creates an isolated, local private test network using Proof-of-Authority (PoA) consensus with a pre-funded developer account. Blocks are mined instantly on demand whenever a transaction is submitted (`--dev.period 0`), allowing rapid testing without burning real financial assets or waiting for public testnet faucets.

---

### Q5: What is the Ethereum Virtual Machine (EVM)?
**Answer:**
The EVM is the sandboxed computation engine embedded in every Ethereum node that executes compiled smart contract bytecode. It maintains the deterministic global state of the Ethereum network, ensuring that all nodes arrive at the exact same state given the same sequence of transactions.

---

### Q6: What is Solidity?
**Answer:**
Solidity is a statically typed, contract-oriented high-level programming language designed specifically for authoring smart contracts that execute on the EVM. Its syntax is heavily influenced by C++, Python, and JavaScript.

---

### Q7: What is a Smart Contract?
**Answer:**
A smart contract is a self-executing program deployed directly to a blockchain address containing predefined business logic and state storage. Once deployed, its code cannot be altered, and functions execute automatically and deterministically when triggered by signed transactions.

---

### Q8: Why use Smart Contracts for a Donation System?
**Answer:**
Traditional donation platforms rely on centralized databases where administrators can modify records, misreport totals, or conceal fund movements. Smart contracts enforce rules mathematically: every contribution is immutably logged with the donor's address, amount, purpose, and timestamp, and funds can only be released according to programmed access controls.

---

### Q9: What is `msg.sender` in Solidity?
**Answer:**
`msg.sender` is a globally available variable in the EVM that returns the 20-byte address of the account (or contract) that directly invoked the current function execution. In our project, it captures the cryptographic identity of the donor during `donate()` and validates the administrator during `withdraw()`.

---

### Q10: What is `msg.value`?
**Answer:**
`msg.value` is an EVM global variable representing the amount of native cryptocurrency (Ether) in Wei transferred along with the transaction call to the contract.

---

### Q11: What is the purpose of the `payable` keyword?
**Answer:**
In Solidity, the `payable` modifier explicitly authorizes a function or address to receive Ether. If a caller attempts to send funds to a non-payable function, the EVM automatically throws an error and reverts the transaction to prevent accidental loss of funds.

---

### Q12: What is `block.timestamp`?
**Answer:**
`block.timestamp` returns the Unix epoch timestamp (seconds elapsed since January 1, 1970) of the current block, provided by the validator/miner. In our contract, it records the exact time each donation occurs.

---

### Q13: What are Events and why are they important?
**Answer:**
Events (such as `DonationReceived` and `Withdrawal`) write logs into Ethereum transaction receipts. External user interfaces, indexing services, and decentralized frontends can subscribe to and search these events. Logging via events is up to 10x cheaper in gas consumption than storing text strings in permanent contract storage.

---

### Q14: What is a Transaction Hash (`txHash`)?
**Answer:**
A transaction hash is a unique 32-byte Keccak-256 cryptographic digest that identifies a specific transaction on the blockchain. Anyone can use this hash to inspect transaction status, gas consumption, input parameters, and emitted event logs.

---

### Q15: What is an Ethereum Address?
**Answer:**
An Ethereum address is a 160-bit (20-byte) hexadecimal identifier derived from the last 20 bytes of the Keccak-256 hash of a user's public key (prefixed with `0x`).

---

### Q16: Why can't normal donors or unauthorized users withdraw funds?
**Answer:**
The `withdraw()` function is guarded by the `onlyOwner` modifier. The modifier executes a conditional check `if (msg.sender != owner) revert OnlyOwnerAllowed();` before any fund transfer logic. If an unauthorized address attempts to call `withdraw()`, the EVM halts execution and reverts the transaction state.

---

### Q17: What exact steps occur when `donate("Education")` is called?
**Answer:**
1. The EVM checks that Ether has been sent (`msg.value > 0`) and the purpose string is non-empty.
2. The contract increments `totalDonations` by 1.
3. `totalAmountDonated` increases by `msg.value`.
4. A new `Donation` struct is created and saved in the mapping with the donor's address, amount, purpose, and block timestamp.
5. The `DonationReceived` event is emitted.
6. The transferred Ether is held in the smart contract's custody balance.

---

### Q18: What exact steps occur when `withdraw()` is called?
**Answer:**
1. The caller is validated against the stored `owner` address.
2. The contract checks that its current balance is greater than zero.
3. The `Withdrawal` event is emitted.
4. The entire contract balance is transferred to the owner's address using low-level `.call{value: balance}("")`.
5. The contract's internal balance resets to 0.

---

### Q19: What is the Checks-Effects-Interactions (CEI) pattern?
**Answer:**
It is a fundamental security pattern in Solidity designed to prevent reentrancy attacks:
- **Checks**: Validate conditions, parameters, and access permissions.
- **Effects**: Modify internal contract state and emit events.
- **Interactions**: Execute external calls or send Ether to external addresses last.

---

### Q20: What is the difference between a Centralized Database and a Blockchain?
**Answer:**

| Attribute | Centralized Database (e.g. MySQL) | Blockchain (e.g. Ethereum / Geth) |
| :--- | :--- | :--- |
| **Control** | Single organization / DBA | Distributed network of nodes |
| **Data Mutability** | Records can be modified or deleted (CRUD) | Append-only ledger (immutable) |
| **Transparency** | Private to the organization | Publicly auditable by any connected client |
| **Trust Model** | Trust in database administrators | Trust in cryptography and consensus rules |

---

### Q21: What are the fundamental limitations of this blockchain donation project?
**Answer:**
1. **The Real-World Boundary (Oracle Problem)**: While the blockchain guarantees that digital currency collection and initial withdrawal are transparently recorded, it cannot physically verify whether the NGO used the withdrawn funds off-chain to purchase the promised goods.
2. **Cryptocurrency Volatility**: Donated cryptocurrencies fluctuate in purchasing power relative to local fiat currencies.
3. **Gas Fees**: Public blockchain transactions incur execution fees (gas), though this is minimized on layer-2 solutions or private consortia.

---

### Q22: What role did Remix IDE play in this project?
**Answer:**
Remix IDE served as our primary web-based developer interface and interactive front end. It compiled the Solidity contract to EVM bytecode and ABI, established the JSON-RPC connection to our local Geth node via port 8545, and provided an interactive graphical UI to execute transactions and inspect contract state variables.

---

### Q23: What is the difference between `calldata`, `memory`, and `storage` in Solidity?
**Answer:**
- **`storage`**: Persistent data stored permanently on the blockchain (state variables). Most expensive in gas.
- **`memory`**: Temporary, mutable data that exists only during function execution.
- **`calldata`**: Temporary, non-modifiable, read-only data location where external function arguments are stored. It is the cheapest in gas cost.

---

### Q24: What is Wei?
**Answer:**
Wei is the smallest denomination of Ether:
$$1\text{ Ether} = 10^{18}\text{ Wei}$$
Other common units include Gwei ($10^9\text{ Wei}$, typically used for gas price measurement).

---

### Q25: Why does our smart contract reject plain transfers in `receive()`?
**Answer:**
The `receive()` and `fallback()` functions explicitly revert with `DirectTransferNotAllowed()`. This intentional design ensures donors do not send unlabeled payments; every contribution is required to pass through `donate(string purpose)` so that its intended social cause is permanently indexed on-chain.
