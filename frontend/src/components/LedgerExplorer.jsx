import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function LedgerExplorer({ donations, loading }) {
    const [searchQuery, setSearchQuery] = useState("");
    const { addToast } = useWeb3();

    const shortenAddress = (addr) => {
        if (!addr) return "";
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        addToast("Copied", "Address copied to clipboard", "info");
    };

    const filteredDonations = donations.filter(d => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            d.purpose.toLowerCase().includes(q) ||
            d.donor.toLowerCase().includes(q) ||
            d.id.toString() === q
        );
    });

    return (
        <section className="ledger-section glass-card">
            <div className="ledger-header">
                <div>
                    <h3>Public Transparent Ledger</h3>
                    <p className="ledger-sub">Immutable, on-chain record of every contribution verified by smart contract consensus.</p>
                </div>
                <div className="ledger-filters">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by cause or donor address..."
                        className="form-control form-control-sm"
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="ledger-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Donor Address</th>
                            <th>Cause / Purpose</th>
                            <th>Amount</th>
                            <th>Mined Timestamp</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="table-empty">
                                    <div className="empty-state">
                                        <span className="spinner-small"></span>
                                        <p>Loading on-chain donation records from Geth node...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredDonations.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="table-empty">
                                    <div className="empty-state">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                            <line x1="2" y1="10" x2="22" y2="10"></line>
                                        </svg>
                                        <p>{donations.length === 0 ? "No donation records found on this contract yet." : "No records match your search filter."}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredDonations.map(d => {
                                const dateStr = new Date(d.timestamp * 1000).toLocaleString();
                                return (
                                    <tr key={d.id}>
                                        <td><span className="id-badge">#{d.id}</span></td>
                                        <td>
                                            <span className="addr-cell" title={d.donor}>
                                                {shortenAddress(d.donor)}
                                                <button 
                                                    className="btn-icon" 
                                                    style={{ width: "20px", height: "20px", padding: "2px" }}
                                                    onClick={() => copyToClipboard(d.donor)}
                                                    title="Copy Address"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                    </svg>
                                                </button>
                                            </span>
                                        </td>
                                        <td><span className="cause-tag">{d.purpose}</span></td>
                                        <td><span className="amount-cell">{Number(d.amountEth).toFixed(4)} ETH</span></td>
                                        <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{dateStr}</td>
                                        <td><span className="badge badge-emerald">Verified On-Chain</span></td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
