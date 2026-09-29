import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";


const ROLE_META = {
    admin: { label: "Admin", cls: "role-admin", emoji: "🛡️" },
    ngo_owner: { label: "NGO Owner", cls: "role-ngo", emoji: "🏢" },
    donor: { label: "Donor", cls: "role-donor", emoji: "❤️" },
};

export default function Header() {
    const { 
        account, 
        connectWallet, 
        disconnectWallet, 
        nodeConnected, 
        blockNumber, 
        requestFaucetEth, 
        faucetLoading,
        theme,
        toggleTheme,
        walletMode,
        demoAccounts,
        selectedDemoId,
        selectDemoAccount,
        switchNetwork,
        isWrongNetwork,
        accountBalance,
        demoBalances
    } = useWeb3();

    const { currentUser, logout, isAdmin, isNGOOwner } = useAuth();
    const roleMeta = currentUser ? (ROLE_META[currentUser.role] || ROLE_META.donor) : null;

    const [demoMenuOpen, setDemoMenuOpen] = useState(false);

    const shortenAddress = (addr) => {
        if (!addr) return "";
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <header className="app-header">
            <div className="brand">
                <div className="brand-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                    </svg>
                </div>
                <div className="brand-text">
                    <div className="brand-title-row">
                        <h1>DonationTracker</h1>
                        <span className="version-pill">Monad Testnet</span>
                    </div>
                    <p className="brand-sub">Verifiable On-Chain Charitable Ledger</p>
                </div>
            </div>

            <div className="header-actions">
                {/* Logged-in User Identity */}
                {currentUser && (
                    <div className="user-identity-pill">
                        <span className={`auth-role-badge ${roleMeta?.cls}`}>
                            {roleMeta?.emoji} {roleMeta?.label}
                        </span>
                        <span className="user-identity-name">{currentUser.displayName || currentUser.username}</span>
                        <button
                            onClick={logout}
                            className="btn-logout"
                            title="Log out"
                            id="logout-btn"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                )}

                {/* Node Health Pill */}
                <div className={`node-pill ${nodeConnected ? "live" : "offline"}`} title={nodeConnected ? `Connected to Geth node (Block #${blockNumber})` : "Geth node offline"}>
                    <span className="node-indicator"></span>
                    <span className="node-text">
                        {nodeConnected ? `Block #${blockNumber}` : "Node Offline"}
                    </span>
                </div>

                {/* Theme Toggle (Light / Dark) */}
                <button 
                    onClick={toggleTheme} 
                    className="theme-toggle-btn"
                    title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    aria-label="Toggle theme"
                    id="theme-toggle-btn"
                >
                    {theme === "dark" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    )}
                </button>

                {/* Faucet button (available whenever account is connected) */}
                {account && (
                    <button 
                        onClick={() => requestFaucetEth()} 
                        disabled={faucetLoading}
                        className="btn-faucet"
                        title="Fund connected account with 10 local dev ETH"
                        id="faucet-eth-btn"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v8M12 18v4M4.93 4.93l5.66 5.66M13.41 13.41l5.66 5.66M2 12h8M18 12h4M4.93 19.07l5.66-5.66M13.41 10.59l5.66-5.66"/>
                        </svg>
                        <span>{faucetLoading ? "Funding..." : "Get 10 ETH"}</span>
                    </button>
                )}

                {/* Wrong Network Warning & Switcher Button */}
                {walletMode === "metamask" && isWrongNetwork && (
                    <button 
                        onClick={() => switchNetwork()}
                        className="btn-wrong-net"
                        style={{
                            background: "rgba(245, 158, 11, 0.15)",
                            border: "1px solid var(--amber-accent, #f59e0b)",
                            color: "var(--amber-accent, #f59e0b)",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.82rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                        title="MetaMask is currently on wrong network. Click to switch to Monad Testnet!"
                        id="switch-to-geth-btn"
                    >
                        <span>⚠️ Switch MetaMask to Geth</span>
                    </button>
                )}

                {/* Account & Connection Controls */}
                {account ? (
                    <div className="account-controls">
                        <div 
                            className="account-pill"
                            onClick={() => setDemoMenuOpen(prev => !prev)}
                            style={{ cursor: "pointer" }}
                            title="Click to switch between MetaMask and Demo accounts"
                        >
                            <span className="account-mode-tag">
                                {walletMode === "demo" ? "Demo" : "MetaMask"}
                            </span>
                            <span className="account-address" title={account}>
                                {shortenAddress(account)}
                            </span>
                            <span className="account-balance-tag" title="Current Wallet Balance on Geth">
                                {accountBalance} ETH
                            </span>
                        </div>

                        {/* Demo switcher while connected */}
                        <div className="demo-dropdown-container">
                            <button 
                                onClick={() => setDemoMenuOpen(prev => !prev)}
                                className="btn-demo-mode compact"
                                title="Switch demo accounts"
                                id="demo-account-select"
                            >
                                <span>Switch Demo</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {demoMenuOpen && (
                                <div className="demo-menu-dropdown">
                                    <div className="demo-menu-header">
                                        <span>Select Account</span>
                                        <span className="demo-header-sub">Live Geth Balance</span>
                                    </div>
                                    <button 
                                        type="button"
                                        className={`demo-account-item ${walletMode === "metamask" ? "active" : ""}`}
                                        onClick={() => {
                                            connectWallet();
                                            setDemoMenuOpen(false);
                                        }}
                                        style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.08))", marginBottom: "6px", paddingBottom: "8px" }}
                                    >
                                        <div className="demo-acc-top">
                                            <span className="demo-acc-name">🦊 MetaMask Wallet</span>
                                            <span className="demo-acc-bal" style={{ color: "var(--cyan-accent, #06b6d4)" }}>Extension</span>
                                        </div>
                                        <div className="demo-acc-addr">Connect personal MetaMask</div>
                                    </button>
                                    {demoAccounts.map(acc => (
                                        <button 
                                            key={acc.id}
                                            className={`demo-account-item ${account.toLowerCase() === acc.address.toLowerCase() ? "active" : ""}`}
                                            onClick={() => {
                                                selectDemoAccount(acc.id);
                                                setDemoMenuOpen(false);
                                            }}
                                        >
                                            <div className="demo-acc-top">
                                                <span className="demo-acc-name">{acc.name}</span>
                                                <span className="demo-acc-bal">{demoBalances[acc.id] || "0.0000"} ETH</span>
                                            </div>
                                            <div className="demo-acc-addr">{shortenAddress(acc.address)}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={disconnectWallet}
                            className="btn-disconnect"
                            title="Disconnect wallet and return to read-only mode"
                            id="disconnect-wallet-btn"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Disconnect</span>
                        </button>
                    </div>
                ) : (
                    <div className="connect-group">
                        <button 
                            onClick={connectWallet}
                            className="btn-primary-action"
                            title="Connect with MetaMask browser extension"
                            id="connect-metamask-btn"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                <path d="m22 10-4-3-4 3"></path>
                                <path d="M6 12h.01"></path>
                            </svg>
                            <span>Connect MetaMask</span>
                        </button>

                        <div className="demo-dropdown-container">
                            <button 
                                onClick={() => setDemoMenuOpen(prev => !prev)}
                                className="btn-demo-mode"
                                title="Use without MetaMask using local demo keys"
                                id="demo-account-select"
                            >
                                <span>No Wallet? Use Demo</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {demoMenuOpen && (
                                <div className="demo-menu-dropdown">
                                    <div className="demo-menu-header">
                                        <span>Pre-Funded Demo Accounts</span>
                                        <span className="demo-header-sub">Live Geth Balance</span>
                                    </div>
                                    {demoAccounts.map(acc => (
                                        <button 
                                            key={acc.id}
                                            className="demo-account-item"
                                            onClick={() => {
                                                selectDemoAccount(acc.id);
                                                setDemoMenuOpen(false);
                                            }}
                                        >
                                            <div className="demo-acc-top">
                                                <span className="demo-acc-name">{acc.name}</span>
                                                <span className="demo-acc-bal">{demoBalances[acc.id] || "0.0000"} ETH</span>
                                            </div>
                                            <div className="demo-acc-addr">{shortenAddress(acc.address)}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
