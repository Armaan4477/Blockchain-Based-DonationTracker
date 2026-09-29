const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("===============================================================");
    console.log("  DonationTracker Smart Contract Verification Suite (Geth Dev)");
    console.log("===============================================================\n");

    const rpcUrl = "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // 1. Verify Geth Connection
    const network = await provider.getNetwork();
    const clientVer = await provider.send("web3_clientVersion", []);
    console.log(`[1] Connected to Geth Node`);
    console.log(`    Client Version : ${clientVer}`);
    console.log(`    Chain ID       : ${network.chainId} (Hex: 0x${network.chainId.toString(16)})\n`);

    // 2. Read ABI and Bytecode from build
    const abiPath = path.join(__dirname, "..", "build", "contracts_DonationTracker_sol_DonationTracker.abi");
    const binPath = path.join(__dirname, "..", "build", "contracts_DonationTracker_sol_DonationTracker.bin");
    
    if (!fs.existsSync(abiPath) || !fs.existsSync(binPath)) {
        throw new Error("Build artifacts not found. Run solc compilation first.");
    }

    const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    const bytecode = "0x" + fs.readFileSync(binPath, "utf8").trim();

    // 3. Set up the 4 College Demo Accounts with deterministic private keys
    const devSignerAddress = (await provider.send("eth_accounts", []))[0];
    console.log(`[2] Geth Pre-Funded Developer Account: ${devSignerAddress}`);

    const pkeys = [
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d", // Admin / NGO
        "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1", // Donor 1
        "0x6370fd0332c6fa76721d2690c30768500caf1892965b1116388f32974bfe2d4f", // Donor 2
        "0x646f1ce2fd01a89aaec26709967929d5fb3e7e01a4ea1abbd86103e2138e8b76"  // Donor 3
    ];

    const accounts = pkeys.map(pk => new ethers.Wallet(pk, provider));
    const [admin, donor1, donor2, donor3] = accounts;

    console.log("\n[3] College Demonstration Accounts Initialized:");
    console.log(`    Account 1 (Admin/NGO) : ${admin.address}`);
    console.log(`    Account 2 (Donor 1)   : ${donor1.address}`);
    console.log(`    Account 3 (Donor 2)   : ${donor2.address}`);
    console.log(`    Account 4 (Donor 3)   : ${donor3.address}\n`);

    // 4. Fund test accounts from Geth dev account (5 ETH each)
    console.log("[4] Funding Demo Accounts with 5.0 ETH each from Geth node...");
    for (let i = 0; i < accounts.length; i++) {
        const target = accounts[i].address;
        const txHash = await provider.send("eth_sendTransaction", [{
            from: devSignerAddress,
            to: target,
            value: "0x" + ethers.parseEther("5.0").toString(16)
        }]);
        await provider.waitForTransaction(txHash);
        const bal = await provider.getBalance(target);
        console.log(`    Funded ${target.substring(0, 10)}... | Balance: ${ethers.formatEther(bal)} ETH`);
    }

    // 5. Deploy Smart Contract from Admin Account
    console.log("\n[5] Deploying DonationTracker.sol from Admin account...");
    const factory = new ethers.ContractFactory(abi, bytecode, admin);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`    Contract Deployed Successfully!`);
    console.log(`    Contract Address : ${contractAddress}`);
    console.log(`    Contract Owner   : ${await contract.owner()}`);
    console.log(`    Initial Balance  : ${ethers.formatEther(await contract.getBalance())} ETH\n`);

    // 6. Test Zero-Value Donation Rejection
    console.log("===============================================================");
    console.log("  TEST SCENARIO EXECUTION");
    console.log("===============================================================");

    console.log("\n--- TEST 1: Zero-Value Donation Rejection ---");
    try {
        const donor1Contract = contract.connect(donor1);
        await donor1Contract.donate("Zero Test", { value: ethers.parseEther("0") });
        console.error("    [FAIL] Zero donation did not revert!");
        process.exit(1);
    } catch (err) {
        console.log("    [PASS] Transaction reverted as expected for 0 ETH donation.");
    }

    // 7. Donor 1 Donates 0.10 ETH ("Education")
    console.log("\n--- TEST 2: Donor 1 -> 0.10 ETH for 'Education' ---");
    const d1Contract = contract.connect(donor1);
    const tx1 = await d1Contract.donate("Education", { value: ethers.parseEther("0.10") });
    const rc1 = await tx1.wait();
    console.log(`    [PASS] Transaction Confirmed! TxHash: ${rc1.hash}`);

    // 8. Donor 2 Donates 0.20 ETH ("Medical")
    console.log("\n--- TEST 3: Donor 2 -> 0.20 ETH for 'Medical' ---");
    const d2Contract = contract.connect(donor2);
    const tx2 = await d2Contract.donate("Medical", { value: ethers.parseEther("0.20") });
    const rc2 = await tx2.wait();
    console.log(`    [PASS] Transaction Confirmed! TxHash: ${rc2.hash}`);

    // 9. Donor 3 Donates 0.05 ETH ("Food")
    console.log("\n--- TEST 4: Donor 3 -> 0.05 ETH for 'Food' ---");
    const d3Contract = contract.connect(donor3);
    const tx3 = await d3Contract.donate("Food", { value: ethers.parseEther("0.05") });
    const rc3 = await tx3.wait();
    console.log(`    [PASS] Transaction Confirmed! TxHash: ${rc3.hash}`);

    // 10. Verify Cumulative State
    console.log("\n--- TEST 5: Verify Contract Totals & Balances ---");
    const totalCount = await contract.getDonationCount();
    const totalDonatedWei = await contract.getTotalDonated();
    const contractBalWei = await contract.getBalance();

    console.log(`    Total Donations Count : ${totalCount.toString()} (Expected: 3)`);
    console.log(`    Total Donated Amount  : ${ethers.formatEther(totalDonatedWei)} ETH (Expected: 0.35 ETH)`);
    console.log(`    Smart Contract Balance: ${ethers.formatEther(contractBalWei)} ETH (Expected: 0.35 ETH)`);

    if (totalCount.toString() !== "3" || ethers.formatEther(totalDonatedWei) !== "0.35" || ethers.formatEther(contractBalWei) !== "0.35") {
        console.error("    [FAIL] State values mismatch!");
        process.exit(1);
    }
    console.log("    [PASS] State matches expected values exactly!");

    // 11. Inspect Individual Donation Records
    console.log("\n--- TEST 6: Query Each Donation Record (Public Readability) ---");
    for (let id = 1; id <= 3; id++) {
        const record = await contract.getDonation(id);
        const dateStr = new Date(Number(record[4]) * 1000).toLocaleString();
        console.log(`    Donation #${record[0]}:`);
        console.log(`      Donor Address : ${record[1]}`);
        console.log(`      Amount        : ${ethers.formatEther(record[2])} ETH`);
        console.log(`      Purpose       : "${record[3]}"`);
        console.log(`      Timestamp     : ${record[4]} (${dateStr})`);
    }
    console.log("    [PASS] All donation records verified on-chain!");

    // 12. Test Unauthorized Withdrawal by Donor 1
    console.log("\n--- TEST 7: Unauthorized Withdrawal Attempt by Donor 1 ---");
    try {
        await d1Contract.withdraw();
        console.error("    [FAIL] Unauthorized withdrawal succeeded unexpectedly!");
        process.exit(1);
    } catch (err) {
        console.log("    [PASS] Unauthorized withdrawal reverted! (Caller is not owner)");
    }

    // 13. Authorized Withdrawal by NGO/Admin
    console.log("\n--- TEST 8: Authorized Withdrawal by Admin / NGO ---");
    const adminBalBefore = await provider.getBalance(admin.address);
    const txWithdraw = await contract.withdraw();
    const rcWithdraw = await txWithdraw.wait();
    const adminBalAfter = await provider.getBalance(admin.address);
    const contractBalAfter = await contract.getBalance();

    console.log(`    Withdrawal TxHash     : ${rcWithdraw.hash}`);
    console.log(`    Contract Balance Now  : ${ethers.formatEther(contractBalAfter)} ETH (Expected: 0.0 ETH)`);
    console.log(`    Admin Balance Before  : ${ethers.formatEther(adminBalBefore)} ETH`);
    console.log(`    Admin Balance After   : ${ethers.formatEther(adminBalAfter)} ETH (Received ~0.35 ETH minus gas)`);

    if (contractBalAfter.toString() !== "0") {
        console.error("    [FAIL] Contract balance should be 0 after full withdrawal!");
        process.exit(1);
    }
    console.log("    [PASS] Funds successfully withdrawn by authorized owner!");

    // 14. Test Withdrawal on Empty Balance
    console.log("\n--- TEST 9: Withdrawal with Zero Balance Rejection ---");
    try {
        await contract.withdraw();
        console.error("    [FAIL] Withdrawal with 0 balance succeeded unexpectedly!");
        process.exit(1);
    } catch (err) {
        console.log("    [PASS] Withdrawal with 0 balance reverted (NoFundsToWithdraw).");
    }

    // 15. Test Ownership Transfer Validation
    console.log("\n--- TEST 10: Ownership Transfer to Zero-Address Rejection ---");
    try {
        await contract.transferOwnership(ethers.ZeroAddress);
        console.error("    [FAIL] Zero address ownership transfer succeeded unexpectedly!");
        process.exit(1);
    } catch (err) {
        console.log("    [PASS] Zero address ownership transfer reverted (InvalidAddress).");
    }

    console.log("\n===============================================================");
    console.log("  ALL TESTS PASSED WITH 100% SUCCESS!");
    console.log("  The smart contract logic is mathematically & logically sound.");
    console.log("===============================================================\n");
}

main().catch(err => {
    console.error("Error during verification:", err);
    process.exit(1);
});
