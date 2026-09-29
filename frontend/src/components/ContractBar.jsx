import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function ContractBar({ onRefresh, isRefreshing }) {
    const { contractAddress, updateContractAddress, contractOwner, resetToDefaultContract, defaultContractAddress } = useWeb3();
    const [inputAddress, setInputAddress] = useState(contractAddress || "");

    useEffect(() => {
        setInputAddress(contractAddress || "");
    }, [contractAddress]);

    const handleLoad = (e) => {
        e.preventDefault();
        updateContractAddress(inputAddress);
    };

    const shorten = (addr) => {
        if (!addr) return "Not Loaded";
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div className="contract-bar glass-card">
            <form onSubmit={handleLoad} className="contract-input-group">
                <label htmlFor="contractAddressInput">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    Smart Contract Address:
                </label>
                <input 
                    type="text" 
                    id="contractAddressInput"
                    value={inputAddress} 
                    onChange={(e) => setInputAddress(e.target.value)} 
                    placeholder="0x..." 
                    spellCheck="false"
                />
                <button type="submit" className="btn btn-primary btn-sm">Load Contract</button>
                {defaultContractAddress && inputAddress !== defaultContractAddress && (
                    <button 
                        type="button" 
                        onClick={() => {
                            setInputAddress(defaultContractAddress);
                            resetToDefaultContract();
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Load the freshly deployed contract address from config"
                    >
                        Use Default
                    </button>
                )}
            </form>

            <div className="contract-meta">
                <span className="meta-item">
                    Owner: <strong title={contractOwner}>{shorten(contractOwner)}</strong>
                </span>
                <button 
                    onClick={onRefresh} 
                    className="btn-icon" 
                    title="Refresh blockchain data"
                    style={{ transform: isRefreshing ? "rotate(360deg)" : "none", transition: "transform 0.5s ease" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                        <path d="M16 16h5v5"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}
