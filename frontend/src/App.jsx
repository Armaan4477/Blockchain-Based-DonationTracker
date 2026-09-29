import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./context/Web3Context";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import ContractBar from "./components/ContractBar";
import MetricsGrid from "./components/MetricsGrid";
import DonorPortal from "./components/DonorPortal";
import AdminConsole from "./components/AdminConsole";
import LedgerExplorer from "./components/LedgerExplorer";
import UserManagement from "./components/UserManagement";
import LoginPage from "./components/LoginPage";
import ToastContainer from "./components/ToastContainer";

export default function App() {
    const { contract, contractAddress, nodeConnected } = useWeb3();
    const { isLoggedIn, isAdmin, isNGOOwner, isDonor } = useAuth();

    const [totalDonations, setTotalDonations] = useState(0);
    const [totalVolume, setTotalVolume] = useState("0.00");
    const [vaultBalance, setVaultBalance] = useState("0.00");
    const [donations, setDonations] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);

    // Fetch all on-chain data
    const fetchContractData = useCallback(async () => {
        if (!contract) return;

        setIsRefreshing(true);
        setLoadingRecords(true);

        try {
            const [count, totalDonatedWei, vaultBalWei] = await Promise.all([
                contract.getDonationCount(),
                contract.getTotalDonated(),
                contract.getBalance()
            ]);

            const countNum = Number(count);
            setTotalDonations(countNum);
            setTotalVolume(Number(ethers.formatEther(totalDonatedWei)).toFixed(4));
            setVaultBalance(Number(ethers.formatEther(vaultBalWei)).toFixed(4));

            // Fetch individual donation records
            const records = [];
            for (let id = 1; id <= countNum; id++) {
                const record = await contract.getDonation(id);
                records.push({
                    id: Number(record[0]),
                    donor: record[1],
                    amountWei: record[2],
                    amountEth: ethers.formatEther(record[2]),
                    purpose: record[3],
                    timestamp: Number(record[4])
                });
            }
            setDonations(records);

        } catch (err) {
            console.error("Error fetching contract data:", err);
        } finally {
            setIsRefreshing(false);
            setLoadingRecords(false);
        }
    }, [contract]);

    // Initial fetch when contract changes
    useEffect(() => {
        if (contract) {
            fetchContractData();

            // Subscribe to live contract events
            try {
                const onDonationReceived = () => { fetchContractData(); };
                const onWithdrawal = () => { fetchContractData(); };

                contract.on("DonationReceived", onDonationReceived);
                contract.on("Withdrawal", onWithdrawal);

                return () => {
                    contract.off("DonationReceived", onDonationReceived);
                    contract.off("Withdrawal", onWithdrawal);
                };
            } catch (e) {
                console.warn("Event listener warning:", e);
            }
        }
    }, [contract, fetchContractData]);

    // Show login page if not authenticated
    if (!isLoggedIn) {
        return (
            <>
                <LoginPage />
                <ToastContainer />
            </>
        );
    }

    // ── DONOR DASHBOARD ─────────────────────────────────────────────────────
    if (isDonor) {
        return (
            <div className="app-layout">
                <div className="app-container">
                    <Header />
                    <ContractBar
                        onRefresh={fetchContractData}
                        isRefreshing={isRefreshing}
                    />
                    <MetricsGrid
                        totalDonations={totalDonations}
                        totalVolume={totalVolume}
                        vaultBalance={vaultBalance}
                    />
                    <div className="workspace-grid workspace-single">
                        <DonorPortal onDonationSuccess={fetchContractData} />
                    </div>
                    <LedgerExplorer
                        donations={donations}
                        loading={loadingRecords}
                    />
                    <footer className="app-footer">
                        <p>Blockchain-Based Transparent Donation Tracking System &bull; BE Computer Engineering Mini-Project</p>
                        <p className="footer-sub">React.js Client-Side DApp &bull; Go-Ethereum (Geth) &bull; Solidity Smart Contract</p>
                    </footer>
                </div>
                <ToastContainer />
            </div>
        );
    }

    // ── NGO OWNER DASHBOARD ──────────────────────────────────────────────────
    if (isNGOOwner) {
        return (
            <div className="app-layout">
                <div className="app-container">
                    <Header />
                    <ContractBar
                        onRefresh={fetchContractData}
                        isRefreshing={isRefreshing}
                    />
                    <MetricsGrid
                        totalDonations={totalDonations}
                        totalVolume={totalVolume}
                        vaultBalance={vaultBalance}
                    />
                    <div className="workspace-grid">
                        <DonorPortal onDonationSuccess={fetchContractData} />
                        <AdminConsole
                            vaultBalance={vaultBalance}
                            onWithdrawSuccess={fetchContractData}
                        />
                    </div>
                    <LedgerExplorer
                        donations={donations}
                        loading={loadingRecords}
                    />
                    <footer className="app-footer">
                        <p>Blockchain-Based Transparent Donation Tracking System &bull; BE Computer Engineering Mini-Project</p>
                        <p className="footer-sub">React.js Client-Side DApp &bull; Go-Ethereum (Geth) &bull; Solidity Smart Contract</p>
                    </footer>
                </div>
                <ToastContainer />
            </div>
        );
    }

    // ── ADMIN DASHBOARD ──────────────────────────────────────────────────────
    // Admin sees everything: donor portal, admin console, user management, ledger
    return (
        <div className="app-layout">
            <div className="app-container">
                <Header />
                <ContractBar
                    onRefresh={fetchContractData}
                    isRefreshing={isRefreshing}
                />
                <MetricsGrid
                    totalDonations={totalDonations}
                    totalVolume={totalVolume}
                    vaultBalance={vaultBalance}
                />

                {/* User Management - Admin only */}
                <UserManagement />

                <div className="workspace-grid">
                    <DonorPortal onDonationSuccess={fetchContractData} />
                    <AdminConsole
                        vaultBalance={vaultBalance}
                        onWithdrawSuccess={fetchContractData}
                    />
                </div>

                <LedgerExplorer
                    donations={donations}
                    loading={loadingRecords}
                />

                <footer className="app-footer">
                    <p>Blockchain-Based Transparent Donation Tracking System &bull; BE Computer Engineering Mini-Project</p>
                    <p className="footer-sub">React.js Client-Side DApp &bull; Go-Ethereum (Geth) &bull; Solidity Smart Contract</p>
                </footer>
            </div>
            <ToastContainer />
        </div>
    );
}


