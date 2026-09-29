const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const devSignerAddress = (await provider.send("eth_accounts", []))[0];

    const abiPath = path.join(__dirname, "..", "build", "contracts_DonationTracker_sol_DonationTracker.abi");
    const binPath = path.join(__dirname, "..", "build", "contracts_DonationTracker_sol_DonationTracker.bin");
    
    const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    const bytecode = "0x" + fs.readFileSync(binPath, "utf8").trim();

    // 4 Test Accounts
    const admin = new ethers.Wallet("0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d", provider);
    const donor1 = new ethers.Wallet("0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1", provider);
    const donor2 = new ethers.Wallet("0x6370fd0332c6fa76721d2690c30768500caf1892965b1116388f32974bfe2d4f", provider);
    const donor3 = new ethers.Wallet("0x646f1ce2fd01a89aaec26709967929d5fb3e7e01a4ea1abbd86103e2138e8b76", provider);

    // Fund admin and donors with 50 ETH each for plenty of demo headroom
    for (const acc of [admin, donor1, donor2, donor3]) {
        const tx = await provider.send("eth_sendTransaction", [{
            from: devSignerAddress,
            to: acc.address,
            value: "0x" + ethers.parseEther("50.0").toString(16)
        }]);
        await provider.waitForTransaction(tx);
    }

    // Deploy contract (Starts with 0 donations)
    const factory = new ethers.ContractFactory(abi, bytecode, admin);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`DEPLOYED_CONTRACT_ADDRESS: ${contractAddress}`);
    console.log(`OWNER_ADDRESS: ${admin.address}`);
    console.log("CONTRACT_READY: Clean contract deployed with 0 donations.");

    // Save deployed address into frontend config default
    const configPath = path.join(__dirname, "..", "frontend", "src", "contracts", "contractConfig.js");
    let content = fs.readFileSync(configPath, "utf8");
    content = content.replace(/DEFAULT_CONTRACT_ADDRESS = "0x[a-fA-F0-9]+"/, `DEFAULT_CONTRACT_ADDRESS = "${contractAddress}"`);
    fs.writeFileSync(configPath, content);
    console.log("UPDATED_FRONTEND_CONFIG");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
