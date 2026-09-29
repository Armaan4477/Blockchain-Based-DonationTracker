import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { DEFAULT_RPC_URL } from "../contracts/contractConfig";

const CATEGORIES = [
    { label: "🎓 Education", value: "Education" },
    { label: "🏥 Medical", value: "Medical" },
    { label: "🍲 Food Relief", value: "Food" },
    { label: "🚨 Disaster Relief", value: "Disaster Relief" }
];

const QUICK_AMOUNTS = ["0.1", "0.5", "1.0", "2.0"];

export default function DonorPortal({ onDonationSuccess }) {
    const { contract, signer, account, accountBalance, walletMode, ensureCorrectNetwork, switchNetwork, addToast } = useWeb3();
    const [selectedCategory, setSelectedCategory] = useState("Education");
    const [customCause, setCustomCause] = useState("Education");
    const [amount, setAmount] = useState("1.0");
    const [loading, setLoading] = useState(false);

    const handleCategorySelect = (val) => {
        setSelectedCategory(val);
        setCustomCause(val);
    };

    const handleDonation = async (e) => {
        e.preventDefault();

        if (!contract) {
            addToast("Action Required", "Smart contract is not connected or initialized.", "error");
            return;
        }

        if (!signer) {
            addToast("Wallet Required", "Please connect MetaMask or choose a Pre-Funded Demo Account to donate.", "error");
            return;
        }

        const cause = customCause.trim();
        if (!cause) {
            addToast("Cause Required", "Please enter or select a donation purpose.", "error");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            addToast("Invalid Amount", "Donation amount must be greater than zero.", "error");
            return;
        }

        setLoading(true);
        try {
            // Verify correct network for MetaMask
            if (walletMode === "metamask") {
                const networkOk = await ensureCorrectNetwork();
                if (!networkOk) {
                    setLoading(false);
                    return;
                }
            }

            const valueWei = ethers.parseEther(amount);
            
            // Check if wallet has sufficient ETH including gas fee buffer using live balance
            const currentBal = Number(accountBalance || "0");
            const requested = Number(amount || "0");
            const gasBuffer = 0.005;

            if (currentBal < requested + gasBuffer) {
                const maxPossible = Math.max(0, currentBal - gasBuffer);
                addToast(
                    "Insufficient Funds for Gas",
                    `Your balance is ${currentBal.toFixed(4)} ETH. An Ethereum transaction requires a tiny gas fee (~0.005 ETH). Maximum you can donate right now is ~${maxPossible.toFixed(4)} ETH.`,
                    "error"
                );
                setLoading(false);
                return;
            }

            addToast("Transaction Pending", `Submitting donation of ${amount} ETH for "${cause}"...`, "info");

            const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
            const liveNonce = await directProvider.getTransactionCount(account, "latest");

            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.donate(cause, { 
                value: valueWei,
                gasLimit: 850000,
                nonce: liveNonce
            });
            addToast("Mined in Mempool", `Tx Hash: ${tx.hash.substring(0, 10)}... Waiting for block...`, "info");

            const receipt = await tx.wait();
            addToast("Donation Confirmed! 🎉", `Block #${receipt.blockNumber}: Recorded ${amount} ETH for "${cause}"!`, "success");

            if (onDonationSuccess) {
                onDonationSuccess();
            }
        } catch (err) {
            console.error("Donation failed:", err);
            let rawMsg = err.reason || err.shortMessage || err.message || "";
            let userMsg = rawMsg;

            if (err.code === "ACTION_REJECTED" || rawMsg.toLowerCase().includes("rejected") || rawMsg.toLowerCase().includes("denied")) {
                userMsg = "Transaction was cancelled / rejected in MetaMask.";
            } else if (rawMsg.toLowerCase().includes("nonce") || rawMsg.toLowerCase().includes("replacement transaction")) {
                userMsg = "MetaMask Nonce Desync: In MetaMask, click Settings (gear icon) > Advanced > 'Clear activity tab data' while on Geth Localhost to sync nonces.";
            } else if (rawMsg.includes("coalesce") || rawMsg.includes("Internal JSON-RPC")) {
                if (window.ethereum) {
                    try {
                        const netHex = await window.ethereum.request({ method: "eth_chainId" });
                        if (netHex !== "0x539" && parseInt(netHex, 16) !== 1337) {
                            userMsg = "MetaMask is on the wrong network! Please switch MetaMask to 'Geth Localhost (Dev)'.";
                        } else {
                            userMsg = "MetaMask transaction failed. If the chain was reset, go to MetaMask Settings > Advanced > 'Clear activity tab data'.";
                        }
                    } catch {
                        userMsg = "MetaMask transaction failed. Please check your network and account balance.";
                    }
                } else {
                    userMsg = "Transaction failed. Please check your blockchain node connection.";
                }
            }
            addToast("Donation Failed", userMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel glass-card">
            <div className="panel-header">
                <div className="panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <h3>Donor Portal</h3>
                </div>
                <span className="badge badge-cyan">Public Access</span>
            </div>

            <form onSubmit={handleDonation} className="panel-body">
                <div className="form-group">
                    <label>Select Cause / Category</label>
                    <div className="category-chips">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                type="button"
                                className={`chip ${selectedCategory === cat.value ? "active" : ""}`}
                                onClick={() => handleCategorySelect(cat.value)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        className="form-control"
                        value={customCause}
                        onChange={(e) => {
                            setCustomCause(e.target.value);
                            setSelectedCategory("");
                        }}
                        placeholder="Or type a custom cause..."
                        required
                    />
                </div>

                <div className="form-group">
                    <div className="amount-label-row">
                        <label>Donation Amount (ETH)</label>
                        {account ? (
                            <span className="wallet-balance-indicator" title="Your current account balance on Geth">
                                Available: <strong>{accountBalance} ETH</strong>
                            </span>
                        ) : (
                            <span className="wallet-balance-indicator hint">
                                Connect wallet to donate
                            </span>
                        )}
                    </div>
                    <div className="amount-input-wrapper">
                        <input
                            type="number"
                            step="any"
                            min="0.0001"
                            className="form-control"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 1.0"
                            required
                        />
                        <span className="input-unit">ETH</span>
                    </div>

                    <div className="quick-amounts">
                        {QUICK_AMOUNTS.map(val => (
                            <button
                                key={val}
                                type="button"
                                className={`btn-quick ${amount === val ? "active" : ""}`}
                                onClick={() => setAmount(val)}
                            >
                                {val} ETH
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn btn-gradient btn-block"
                >
                    {loading ? (
                        <>
                            <span className="btn-spinner"></span>
                            <span>Submitting to Blockchain...</span>
                        </>
                    ) : (
                        <span>Make Transparent Donation</span>
                    )}
                </button>
            </form>
        </div>
    );
}
