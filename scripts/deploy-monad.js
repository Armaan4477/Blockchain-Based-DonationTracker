const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // Monad Testnet RPC
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
    
    // Get private key from environment variable
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("Please set your PRIVATE_KEY environment variable.");
        console.error("Example: export PRIVATE_KEY='your_private_key'");
        console.error("Note: Make sure your account has MON testnet tokens from the faucet.");
        process.exit(1);
    }

    const admin = new ethers.Wallet(privateKey, provider);
    console.log(`Deploying from account: ${admin.address}`);
    
    const balance = await provider.getBalance(admin.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} MON`);
    
    if (balance === 0n) {
        console.error("Error: Deployment account has 0 MON balance. Please get some tokens from the Monad faucet (https://testnet.monad.xyz/).");
        process.exit(1);
    }

    const abiPath = path.join(__dirname, "..", "build", "contracts_DonationTracker_sol_DonationTracker.abi");
    const binPath = path.join(__dirname, "..", "build", "contracts_DonationTracker_sol_DonationTracker.bin");
    
    if (!fs.existsSync(abiPath) || !fs.existsSync(binPath)) {
        console.error("Compiled contract files not found. Please compile the contract first.");
        process.exit(1);
    }

    const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    const bytecode = "0x" + fs.readFileSync(binPath, "utf8").trim();

    console.log("Deploying DonationTracker contract to Monad Testnet...");
    const factory = new ethers.ContractFactory(abi, bytecode, admin);
    const contract = await factory.deploy();
    
    console.log("Waiting for block confirmation...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`DEPLOYED_CONTRACT_ADDRESS: ${contractAddress}`);
    console.log(`OWNER_ADDRESS: ${admin.address}`);
    console.log("CONTRACT_READY: Clean contract deployed to Monad Testnet with 0 donations.");

    // Save deployed address into frontend config default
    const configPath = path.join(__dirname, "..", "frontend", "src", "contracts", "contractConfig.js");
    if (fs.existsSync(configPath)) {
        let content = fs.readFileSync(configPath, "utf8");
        content = content.replace(/DEFAULT_CONTRACT_ADDRESS = "0x[a-fA-F0-9]+"/, `DEFAULT_CONTRACT_ADDRESS = "${contractAddress}"`);
        fs.writeFileSync(configPath, content);
        console.log("UPDATED_FRONTEND_CONFIG with new Monad Testnet address.");
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
