/**
 * Helper script to fund any MetaMask or test account with local development ETH
 * from Geth's pre-funded developer account.
 *
 * Usage:
 *   node scripts/fund-accounts.js [address1] [address2] ...
 *
 * Example:
 *   node scripts/fund-accounts.js 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
 */

const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Check connection
    try {
        await provider.getBlockNumber();
    } catch (err) {
        console.error("[ERROR] Could not connect to Geth at http://127.0.0.1:8545.");
        console.error("Make sure start-geth.bat is running!");
        process.exit(1);
    }

    const devSignerAddress = (await provider.send("eth_accounts", []))[0];
    console.log(`Using Geth Developer Account: ${devSignerAddress}`);

    // Default 4 college demonstration accounts if none provided in CLI
    let targets = process.argv.slice(2);
    if (targets.length === 0) {
        targets = [
            "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", // Account 1 (Admin/NGO)
            "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0", // Account 2 (Donor 1)
            "0x3Bd442d4A38Ab5dA0B25C7C10290BD5CCC614b08", // Account 3 (Donor 2)
            "0x794940f0d55B4dD6081a69B17E37BDb18E135a22"  // Account 4 (Donor 3)
        ];
        console.log("No specific addresses supplied. Funding default 4 college demo accounts:");
    } else {
        console.log(`Funding ${targets.length} custom address(es):`);
    }

    const amountEth = "10.0";
    const amountWeiHex = "0x" + ethers.parseEther(amountEth).toString(16);

    for (const address of targets) {
        if (!ethers.isAddress(address)) {
            console.warn(`[SKIP] Invalid Ethereum address: ${address}`);
            continue;
        }

        try {
            const txHash = await provider.send("eth_sendTransaction", [{
                from: devSignerAddress,
                to: address,
                value: amountWeiHex
            }]);
            await provider.waitForTransaction(txHash);
            const bal = await provider.getBalance(address);
            console.log(`[OK] Funded ${address} with ${amountEth} ETH | Current Balance: ${ethers.formatEther(bal)} ETH`);
        } catch (err) {
            console.error(`[ERROR] Failed to fund ${address}:`, err.message);
        }
    }

    console.log("\nAccounts are ready for Remix / MetaMask demonstration!");
}

main();
