import React from "react";
import { useWeb3 } from "../context/Web3Context";

export default function MetricsGrid({ totalDonations, totalVolume, vaultBalance }) {
    const { account, accountBalance, adminBalance } = useWeb3();

    return (
        <section className="metrics-grid">
            <div className="metric-card glass-card">
                <div className="metric-icon icon-cyan">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <div className="metric-info">
                    <span className="metric-label">Total Donations</span>
                    <h2 className="metric-value">{totalDonations}</h2>
                    <span className="metric-sub">Recorded on Geth blockchain</span>
                </div>
            </div>

            <div className="metric-card glass-card">
                <div className="metric-icon icon-emerald">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <div className="metric-info">
                    <span className="metric-label">Total Donated Volume</span>
                    <h2 className="metric-value">
                        {totalVolume} <span className="unit">ETH</span>
                    </h2>
                    <span className="metric-sub">Cumulative contributions</span>
                </div>
            </div>

            <div className="metric-card glass-card">
                <div className="metric-icon icon-purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                </div>
                <div className="metric-info">
                    <span className="metric-label">Contract Vault Balance</span>
                    <h2 className="metric-value">
                        {vaultBalance} <span className="unit">ETH</span>
                    </h2>
                    <span className="metric-sub">Currently held in escrow</span>
                </div>
            </div>

            <div className="metric-card glass-card">
                <div className="metric-icon icon-amber">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        <path d="M6 12h.01"></path>
                        <path d="m22 10-4-3-4 3"></path>
                    </svg>
                </div>
                <div className="metric-info">
                    <span className="metric-label">{account ? "Active Wallet Balance" : "Admin Wallet Balance"}</span>
                    <h2 className="metric-value">
                        {account ? accountBalance : adminBalance} <span className="unit">ETH</span>
                    </h2>
                    <span className="metric-sub">
                        {account ? "Available to donate / test" : "NGO Admin reserve on Geth"}
                    </span>
                </div>
            </div>
        </section>
    );
}
