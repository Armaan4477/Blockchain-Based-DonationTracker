import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { DEFAULT_RPC_URL } from "../contracts/contractConfig";

export default function AdminConsole({ vaultBalance, onWithdrawSuccess }) {
    const { contract, signer, account, contractOwner, adminBalance, walletMode, ensureCorrectNetwork, switchNetwork, addToast, claimOwnershipForAccount, demoAccounts } = useWeb3();
    const [loading, setLoading] = useState(false);
    const [newOwner, setNewOwner] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);

    const isOwner = account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase();
    const isOwnerDemoAccount = demoAccounts && contractOwner 
        ? demoAccounts.some(a => a.address.toLowerCase() === contractOwner.toLowerCase()) 
        : false;

    const handleWithdraw = async () => {
        if (!contract) {
            addToast("Action Required", "Contract is not loaded.", "error");
            return;
        }

        if (!signer) {
            addToast("Wallet Required", "Connect wallet to execute withdrawal.", "error");
            return;
        }

        let ownerAddr = contractOwner;
        if (!ownerAddr && contract) {
            try {
                ownerAddr = await contract.owner();
            } catch (e) {
                console.warn("Live owner check error:", e);
            }
        }

        const effectiveIsOwner = account && ownerAddr && account.toLowerCase() === ownerAddr.toLowerCase();
        if (!effectiveIsOwner) {
            addToast("Unauthorized Access", `Only the registered owner (${ownerAddr ? ownerAddr.substring(0, 6) + "..." : "NGO Admin"}) can withdraw.`, "error");
            return;
        }

        if (Number(vaultBalance) === 0) {
            addToast("Notice", "Vault balance is already 0 ETH. Withdrawal will revert.", "info");
            return;
        }

        const confirmWithdraw = window.confirm(`Are you sure you want to withdraw all ${vaultBalance} ETH held in contract custody?`);
        if (!confirmWithdraw) return;

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

            addToast("Processing Withdrawal", "Sending withdrawal transaction to Geth node...", "info");
            const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
            const liveNonce = await directProvider.getTransactionCount(account, "latest");
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.withdraw({ gasLimit: 500000, nonce: liveNonce });
            const receipt = await tx.wait();

            addToast("Withdrawal Successful! 💸", `All funds released to Admin. Block #${receipt.blockNumber}`, "success");
            if (onWithdrawSuccess) {
                onWithdrawSuccess();
            }
        } catch (err) {
            console.error("Withdrawal error:", err);
            let rawMsg = err.reason || err.shortMessage || err.message || "";
            let userMsg = rawMsg;

            if (err.code === "ACTION_REJECTED" || rawMsg.toLowerCase().includes("rejected") || rawMsg.toLowerCase().includes("denied")) {
                userMsg = "Withdrawal was cancelled / rejected in MetaMask.";
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
                    userMsg = "Withdrawal failed. Please check your blockchain node connection.";
                }
            }
            addToast("Withdrawal Failed", userMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTransferOwnership = async (e) => {
        e.preventDefault();
        const target = newOwner.trim();
        if (!ethers.isAddress(target)) {
            addToast("Invalid Address", "Enter a valid Ethereum address for new owner.", "error");
            return;
        }

        setTransferLoading(true);
        try {
            const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
            const liveNonce = await directProvider.getTransactionCount(account, "latest");
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.transferOwnership(target, { gasLimit: 500000, nonce: liveNonce });
            await tx.wait();
            addToast("Ownership Transferred", `New Admin: ${target.substring(0, 8)}...`, "success");
            setNewOwner("");
            if (onWithdrawSuccess) {
                onWithdrawSuccess();
            }
        } catch (err) {
            addToast("Transfer Failed", err.reason || err.message, "error");
        } finally {
            setTransferLoading(false);
        }
    };

    return (
        <div className="panel glass-card">
            <div className="panel-header">
                <div className="panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <h3>NGO Admin Console</h3>
                </div>
                <span className={`badge ${isOwner ? "badge-emerald" : "badge-amber"}`}>
                    {isOwner ? "Authorized Admin" : "Viewer (Non-Admin)"}
                </span>
            </div>

            <div className="panel-body">
                <div className="info-box">
                    <p>
                        <strong>Withdrawal Policy:</strong> Funds stored in the smart contract can exclusively be claimed by the registered <code>owner</code> address. Any unauthorized withdrawal attempts automatically revert on-chain.
                    </p>
                </div>

                <div className="admin-stat-row">
                    <span>Vault Available to Withdraw:</span>
                    <strong className="highlight-text">{vaultBalance} ETH</strong>
                </div>

                <div className="admin-stat-row secondary-stat">
                    <span>{isOwner ? "Admin Wallet (Your MetaMask):" : "Admin Personal Wallet:"}</span>
                    <strong className="admin-wallet-bal">{adminBalance} ETH</strong>
                </div>

                <button 
                    onClick={handleWithdraw} 
                    disabled={loading} 
                    className="btn btn-danger btn-block"
                >
                    {loading ? (
                        <>
                            <span className="btn-spinner"></span>
                            <span>Processing Withdrawal...</span>
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Withdraw All Vault Funds</span>
                        </>
                    )}
                </button>

                {!isOwner && account && (
                    <div style={{ marginTop: "12px", padding: "10px", borderRadius: "8px", background: isOwnerDemoAccount ? "rgba(245, 158, 11, 0.08)" : "rgba(6, 182, 212, 0.08)", border: `1px solid ${isOwnerDemoAccount ? "rgba(245, 158, 11, 0.25)" : "rgba(6, 182, 212, 0.25)"}` }}>
                        <div style={{ fontSize: "0.82rem", color: isOwnerDemoAccount ? "var(--amber-accent)" : "var(--cyan-accent)", fontWeight: "600", marginBottom: "4px" }}>
                            {isOwnerDemoAccount ? "👑 Demo Access Control Note" : "🛡️ Blockchain Security Rule in Action"}
                        </div>
                        <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                            {isOwnerDemoAccount ? (
                                <>Your wallet is currently recognized as a <strong>Viewer</strong>. To test administrative withdrawals with this account:</>
                            ) : (
                                <>
                                    This contract is owned by <strong>{contractOwner ? contractOwner.substring(0, 8) + "..." : "another wallet"}</strong>. 
                                    On a secure blockchain, ownership cannot be claimed or stolen by unauthorized accounts. Only the current Owner can voluntarily transfer rights.
                                </>
                            )}
                        </p>
                        {isOwnerDemoAccount ? (
                            <button 
                                type="button" 
                                disabled={claimLoading}
                                onClick={async () => {
                                    setClaimLoading(true);
                                    await claimOwnershipForAccount();
                                    setClaimLoading(false);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: "0.78rem", padding: "5px 10px", borderColor: "var(--amber-accent)", color: "var(--amber-accent)" }}
                            >
                                {claimLoading ? "Transferring Owner..." : "👑 Make My Wallet the NGO Admin"}
                            </button>
                        ) : (
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                👉 To transfer ownership: Switch to Account 1 in MetaMask, and enter this account's address in the form below.
                            </div>
                        )}
                    </div>
                )}

                <details className="ownership-accordion">
                    <summary>Administrative: Transfer Contract Ownership</summary>
                    <form onSubmit={handleTransferOwnership} className="ownership-form">
                        <input
                            type="text"
                            value={newOwner}
                            onChange={(e) => setNewOwner(e.target.value)}
                            placeholder="New owner address (0x...)"
                            className="form-control form-control-sm"
                        />
                        <button type="submit" disabled={transferLoading} className="btn btn-secondary btn-sm">
                            {transferLoading ? "Transferring..." : "Transfer"}
                        </button>
                    </form>
                </details>
            </div>
        </div>
    );
}
