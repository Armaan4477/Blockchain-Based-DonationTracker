import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, DEFAULT_CONTRACT_ADDRESS, DEFAULT_RPC_URL, LOCAL_CHAIN_ID, LOCAL_CHAIN_ID_HEX, DEMO_ACCOUNTS } from "../contracts/contractConfig";

const Web3Context = createContext();

export function Web3Provider({ children }) {
    // Theme state (light / dark)
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("dt_theme") || "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("dt_theme", theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    }, []);

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const contractRef = useRef(null);
    const [contractAddress, setContractAddress] = useState(() => {
        return localStorage.getItem("dt_contract_address") || DEFAULT_CONTRACT_ADDRESS;
    });
    const [contractOwner, setContractOwner] = useState(null);
    const [blockNumber, setBlockNumber] = useState(0);
    const [nodeConnected, setNodeConnected] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [walletMode, setWalletMode] = useState(null); // 'metamask' | 'demo' | null
    const [selectedDemoId, setSelectedDemoId] = useState("donor1");
    const [accountBalance, setAccountBalance] = useState("0.0000");
    const [adminBalance, setAdminBalance] = useState("0.0000");
    const [demoBalances, setDemoBalances] = useState({});
    const [isWrongNetwork, setIsWrongNetwork] = useState(false);

    // Toast Alert Helper
    const addToast = useCallback((title, message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Initialize Web3 Connection
    const initWeb3 = useCallback(async () => {
        try {
            // 1. Direct connection to local Geth RPC for baseline reads
            const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
            let activeProvider = directProvider;
            let isNodeLive = false;

            try {
                const bNum = await directProvider.getBlockNumber();
                setBlockNumber(bNum);
                setNodeConnected(true);
                isNodeLive = true;
            } catch (rpcErr) {
                console.warn("Direct Geth RPC offline:", rpcErr.message);
                setNodeConnected(false);
            }

            // 2. If MetaMask is installed and authorized on Local Geth network, restore session
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts && accounts.length > 0) {
                        const netHex = await window.ethereum.request({ method: "eth_chainId" });
                        if (netHex === LOCAL_CHAIN_ID_HEX || parseInt(netHex, 16) === Number(LOCAL_CHAIN_ID)) {
                            const browserProvider = new ethers.BrowserProvider(window.ethereum);
                            const activeSigner = await browserProvider.getSigner();
                            setSigner(activeSigner);
                            setAccount(accounts[0]);
                            setWalletMode("metamask");
                            activeProvider = browserProvider;
                        }
                    }
                } catch (e) {
                    console.warn("MetaMask auto-detection warning:", e);
                }
            }

            setProvider(activeProvider);

            // 3. Connect contract with auto-recovery for stale localStorage addresses
            let targetAddress = contractAddress;
            if (ethers.isAddress(targetAddress) && isNodeLive) {
                let code = await directProvider.getCode(targetAddress);
                // If stored address has no code, auto-fallback to DEFAULT_CONTRACT_ADDRESS
                if ((!code || code === "0x") && targetAddress !== DEFAULT_CONTRACT_ADDRESS) {
                    const defaultCode = await directProvider.getCode(DEFAULT_CONTRACT_ADDRESS);
                    if (defaultCode && defaultCode !== "0x") {
                        targetAddress = DEFAULT_CONTRACT_ADDRESS;
                        setContractAddress(DEFAULT_CONTRACT_ADDRESS);
                        localStorage.setItem("dt_contract_address", DEFAULT_CONTRACT_ADDRESS);
                    }
                }

                const isContractSame = contractRef.current && 
                    contractRef.current.target === targetAddress && 
                    contractRef.current.runner === activeProvider;

                if (!isContractSame) {
                    const c = new ethers.Contract(targetAddress, CONTRACT_ABI, activeProvider);
                    contractRef.current = c;
                    setContract(c);
                    try {
                        const owner = await c.owner();
                        setContractOwner(owner);
                    } catch {
                        setContractOwner(null);
                    }
                }
            }
        } catch (err) {
            console.error("Web3 init error:", err);
            setNodeConnected(false);
        }
    }, [contractAddress]);

    // Live Balance Polling for connected account, NGO Admin, and all demo accounts
    const refreshBalances = useCallback(async () => {
        try {
            const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);

            // 1. Fetch connected account balance
            if (account && ethers.isAddress(account)) {
                try {
                    const bal = await directProvider.getBalance(account);
                    setAccountBalance(Number(ethers.formatEther(bal)).toFixed(4));
                } catch (e) {
                    console.warn("Account balance fetch error:", e);
                }
            } else {
                setAccountBalance("0.0000");
            }

            // 2. Always fetch latest contract owner on-chain
            let currentOwner = contractOwner;
            if (contractAddress && ethers.isAddress(contractAddress)) {
                try {
                    const c = new ethers.Contract(contractAddress, CONTRACT_ABI, directProvider);
                    currentOwner = await c.owner();
                    if (currentOwner && ethers.isAddress(currentOwner)) {
                        setContractOwner(currentOwner);
                    }
                } catch (e) {
                    console.warn("Owner fetch error:", e);
                }
            }

            // 3. Fetch admin / contractOwner balance
            const adminAddr = currentOwner || DEMO_ACCOUNTS[0].address;
            if (adminAddr && ethers.isAddress(adminAddr)) {
                try {
                    const aBal = await directProvider.getBalance(adminAddr);
                    setAdminBalance(Number(ethers.formatEther(aBal)).toFixed(4));
                } catch (e) {
                    console.warn("Admin balance fetch error:", e);
                }
            }

            // 3. Fetch demo accounts balances
            const balancesMap = {};
            for (const demo of DEMO_ACCOUNTS) {
                try {
                    const dBal = await directProvider.getBalance(demo.address);
                    balancesMap[demo.id] = Number(ethers.formatEther(dBal)).toFixed(4);
                } catch {
                    balancesMap[demo.id] = "0.0000";
                }
            }
            setDemoBalances(balancesMap);

            // 4. Update block number
            try {
                const bNum = await directProvider.getBlockNumber();
                setBlockNumber(bNum);
                setNodeConnected(true);
            } catch {
                setNodeConnected(false);
            }
        } catch (err) {
            console.warn("Error refreshing balances:", err);
        }
    }, [account, contractOwner]);

    // 1. Run Web3 initialization on mount and when contractAddress changes
    useEffect(() => {
        initWeb3();
    }, [initWeb3]);

    // 2. Poll balances regularly (every 3 seconds)
    useEffect(() => {
        refreshBalances();
        const interval = setInterval(refreshBalances, 3000);
        return () => clearInterval(interval);
    }, [refreshBalances]);

    // 3. Monitor MetaMask network to detect if user switches to Mainnet
    useEffect(() => {
        if (!window.ethereum || walletMode !== "metamask") {
            setIsWrongNetwork(false);
            return;
        }

        const checkChain = async () => {
            try {
                const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
                const isWrong = chainIdHex !== LOCAL_CHAIN_ID_HEX && parseInt(chainIdHex, 16) !== Number(LOCAL_CHAIN_ID);
                setIsWrongNetwork(isWrong);
            } catch {
                setIsWrongNetwork(false);
            }
        };

        checkChain();
        const interval = setInterval(checkChain, 2000);
        return () => clearInterval(interval);
    }, [walletMode]);

    // 2. Register MetaMask event listeners once on mount
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = async (accounts) => {
            if (accounts.length === 0) {
                setAccount(null);
                setSigner(null);
                setWalletMode(null);
            } else {
                setAccount(accounts[0]);
                setWalletMode("metamask");
                setSelectedDemoId(null);
                try {
                    const bp = new ethers.BrowserProvider(window.ethereum);
                    const s = await bp.getSigner();
                    setSigner(s);
                    if (ethers.isAddress(contractAddress)) {
                        const c = new ethers.Contract(contractAddress, CONTRACT_ABI, s);
                        contractRef.current = c;
                        setContract(c);
                    }
                } catch (e) {
                    console.warn("Signer update error:", e);
                }
            }
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
        };
    }, [contractAddress]);

    // Connect Wallet Function - Forces MetaMask Popup to Open
    const connectWallet = async () => {
        if (!window.ethereum) {
            addToast("MetaMask Required", "Please install MetaMask extension in your browser.", "error");
            return;
        }

        try {
            // 1. Force MetaMask UI popup to open so user can pick their exact wallet account
            try {
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }]
                });
            } catch (permErr) {
                if (permErr.code === 4001) {
                    addToast("Cancelled", "MetaMask account selection was closed.", "info");
                    return;
                }
                if (permErr.code === -32002) {
                    addToast("MetaMask Open", "MetaMask popup is already waiting! Click the MetaMask fox icon in your browser toolbar.", "warning");
                    return;
                }
                console.warn("wallet_requestPermissions fallback:", permErr);
            }

            // 2. Read selected accounts
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts selected in MetaMask.");
            }

            // 3. Ensure network is Geth Localhost (Chain ID 1337)
            let currentChain = await window.ethereum.request({ method: "eth_chainId" });
            if (currentChain !== LOCAL_CHAIN_ID_HEX && parseInt(currentChain, 16) !== Number(LOCAL_CHAIN_ID)) {
                addToast("Switching Network", "Prompting MetaMask to switch to Monad Testnet...", "info");
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: LOCAL_CHAIN_ID_HEX }]
                    });
                } catch (switchErr) {
                    if (switchErr.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: LOCAL_CHAIN_ID_HEX,
                                chainName: "Monad Testnet",
                                rpcUrls: [DEFAULT_RPC_URL],
                                nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 }
                            }]
                        });
                    } else if (switchErr.code === 4001) {
                        addToast("Network Required", "Please approve network switch to Monad Testnet in MetaMask.", "warning");
                        return;
                    } else {
                        throw switchErr;
                    }
                }
            }

            // 4. Create fresh BrowserProvider after confirmation
            const p = new ethers.BrowserProvider(window.ethereum);
            const s = await p.getSigner();
            const addr = await s.getAddress();

            setProvider(p);
            setSigner(s);
            setAccount(addr);
            setWalletMode("metamask");
            setSelectedDemoId(null);

            // 5. Connect contract with MetaMask signer
            if (ethers.isAddress(contractAddress)) {
                const c = new ethers.Contract(contractAddress, CONTRACT_ABI, s);
                contractRef.current = c;
                setContract(c);
            }

            addToast("MetaMask Connected", `Active Wallet: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "success");
        } catch (err) {
            console.error("Failed to connect wallet:", err);
            let msg = err.message || "Failed to connect MetaMask";
            if (err.code === 4001 || msg.includes("rejected") || msg.includes("denied")) {
                msg = "Connection was cancelled in MetaMask.";
            } else if (msg.includes("already pending") || err.code === -32002) {
                msg = "MetaMask popup is already waiting for you! Click the MetaMask fox icon in your browser toolbar to approve.";
            }
            addToast("Connection Error", msg, "error");
        }
    };

    // Disconnect Wallet (Remove MetaMask / Return to Read-Only Explorer)
    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setSigner(null);
        setWalletMode(null);

        // Reset contract to read-only provider
        const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
        if (ethers.isAddress(contractAddress)) {
            const c = new ethers.Contract(contractAddress, CONTRACT_ABI, directProvider);
            contractRef.current = c;
            setContract(c);
        }
        addToast("Wallet Disconnected", "Returned to public read-only explorer mode.", "info");
    }, [contractAddress, addToast]);

    // Select Demo Account (No MetaMask Required!)
    const selectDemoAccount = useCallback((demoId) => {
        const demo = DEMO_ACCOUNTS.find(a => a.id === demoId) || DEMO_ACCOUNTS[1];
        try {
            const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
            const w = new ethers.Wallet(demo.privateKey, directProvider);
            setSigner(w);
            setAccount(demo.address);
            setWalletMode("demo");
            setSelectedDemoId(demo.id);

            if (ethers.isAddress(contractAddress)) {
                const c = new ethers.Contract(contractAddress, CONTRACT_ABI, w);
                contractRef.current = c;
                setContract(c);
            }

            addToast("Demo Account Active", `Signed in as ${demo.name} (No MetaMask required)`, "success");
            return true;
        } catch (err) {
            console.error("Demo account connect error:", err);
            addToast("Demo Connection Failed", err.message, "error");
            return false;
        }
    }, [contractAddress, addToast]);

    // Switch Network to Geth Localhost
    const switchNetwork = async () => {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: LOCAL_CHAIN_ID_HEX }]
            });
            addToast("Network Switched", "Connected to Monad Testnet", "success");
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: LOCAL_CHAIN_ID_HEX,
                            chainName: "Monad Testnet",
                            rpcUrls: [DEFAULT_RPC_URL],
                            nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 }
                        }]
                    });
                    addToast("Network Added", "Added and switched to Monad Testnet", "success");
                } catch (addError) {
                    console.error("Failed to add network:", addError);
                    addToast("Network Error", "Could not add Monad Testnet to MetaMask.", "error");
                }
            } else {
                console.error("Failed to switch network:", switchError);
            }
        }
    };

    // Ensure MetaMask is on Chain 1337 before any transaction
    const ensureCorrectNetwork = async () => {
        if (!window.ethereum || walletMode !== "metamask") return true;
        try {
            const chainId = await window.ethereum.request({ method: "eth_chainId" });
            if (chainId !== LOCAL_CHAIN_ID_HEX && parseInt(chainId, 16) !== Number(LOCAL_CHAIN_ID)) {
                addToast("Wrong Network", "MetaMask is on the wrong network! Prompting switch to Monad Testnet...", "warning");
                await switchNetwork();
                // Check once more after prompt
                const newChainId = await window.ethereum.request({ method: "eth_chainId" });
                return newChainId === LOCAL_CHAIN_ID_HEX || parseInt(newChainId, 16) === Number(LOCAL_CHAIN_ID);
            }
            return true;
        } catch (err) {
            console.warn("Network check error:", err);
            return false;
        }
    };

    // Update Contract Address
    const updateContractAddress = async (newAddr) => {
        const trimmed = (newAddr || "").trim();
        let normalizedAddr;
        try {
            normalizedAddr = ethers.getAddress(trimmed.toLowerCase());
        } catch {
            addToast("Invalid Address", "Please enter a valid 42-character Ethereum address (0x...)", "error");
            return false;
        }

        const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);

        // 1. Verify Geth is running
        try {
            await directProvider.getBlockNumber();
        } catch {
            setNodeConnected(false);
            addToast("RPC Offline", "Cannot connect to Monad Testnet. Please check your internet connection.", "error");
            return false;
        }

        // 2. Verify bytecode exists at the address
        try {
            const code = await directProvider.getCode(normalizedAddr);
            if (!code || code === "0x") {
                addToast("No Contract Found", `No smart contract bytecode deployed at ${normalizedAddr.substring(0, 10)}... on Monad Testnet.`, "error");
                setContractOwner(null);
                return false;
            }
        } catch (codeErr) {
            console.warn("Could not check bytecode:", codeErr);
        }

        setContractAddress(normalizedAddr);
        localStorage.setItem("dt_contract_address", normalizedAddr);

        try {
            const p = signer || directProvider;
            const c = new ethers.Contract(normalizedAddr, CONTRACT_ABI, p);
            setContract(c);
            const owner = await c.owner();
            setContractOwner(owner);
            addToast("Contract Loaded", `Connected to ${trimmed.substring(0, 8)}... (Owner: ${owner.substring(0, 6)}...)`, "success");
            return true;
        } catch (err) {
            console.error("Contract loading error:", err);
            setContractOwner(null);
            addToast("Load Error", "Could not fetch owner from contract at this address.", "error");
            return false;
        }
    };

    const resetToDefaultContract = () => {
        return updateContractAddress(DEFAULT_CONTRACT_ADDRESS);
    };

    const [faucetLoading, setFaucetLoading] = useState(false);

    // Faucet helper: Send 10 ETH to any account from Geth dev coinbase
    const requestFaucetEth = async (targetAccount = account) => {
        addToast("Use Monad Faucet", "Please visit the official Monad Testnet faucet to get test MON tokens.", "info");
        window.open("https://testnet.monad.xyz/", "_blank");
        return false;
    };

    // Claim Ownership helper for College Demo: Transfers ownership to whichever wallet is connected
    const claimOwnershipForAccount = async () => {
        if (!account) {
            addToast("Wallet Required", "Please connect MetaMask or select a demo account first.", "error");
            return false;
        }

        try {
            const directProvider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
            const readContract = new ethers.Contract(contractAddress, CONTRACT_ABI, directProvider);
            const currentOwner = await readContract.owner();

            // Find current owner in DEMO_ACCOUNTS
            const currentOwnerDemo = DEMO_ACCOUNTS.find(a => a.address.toLowerCase() === currentOwner.toLowerCase());
            if (!currentOwnerDemo) {
                addToast(
                    "Blockchain Security Notice 🛡️", 
                    `Contract is owned by personal wallet ${currentOwner.substring(0, 8)}... To transfer ownership, switch MetaMask to that account and use the Transfer form.`, 
                    "error"
                );
                return false;
            }
            const ownerWallet = new ethers.Wallet(currentOwnerDemo.privateKey, directProvider);
            const c = new ethers.Contract(contractAddress, CONTRACT_ABI, ownerWallet);

            addToast("Transferring Ownership", `Transferring admin privileges to ${account.substring(0, 6)}...`, "info");
            const tx = await c.transferOwnership(account);
            await tx.wait();

            setContractOwner(account);
            addToast("Ownership Claimed! 👑", `Your account is now the authorized NGO Admin!`, "success");
            return true;
        } catch (err) {
            console.error("Claim ownership error:", err);
            addToast("Transfer Failed", err.reason || err.message, "error");
            return false;
        }
    };

    return (
        <Web3Context.Provider value={{
            theme,
            toggleTheme,
            provider,
            signer,
            account,
            contract,
            contractAddress,
            contractOwner,
            blockNumber,
            nodeConnected,
            defaultContractAddress: DEFAULT_CONTRACT_ADDRESS,
            resetToDefaultContract,
            requestFaucetEth,
            claimOwnershipForAccount,
            faucetLoading,
            connectWallet,
            disconnectWallet,
            selectDemoAccount,
            demoAccounts: DEMO_ACCOUNTS,
            walletMode,
            selectedDemoId,
            switchNetwork,
            ensureCorrectNetwork,
            isWrongNetwork,
            accountBalance,
            adminBalance,
            demoBalances,
            refreshBalances,
            updateContractAddress,
            toasts,
            addToast,
            removeToast
        }}>
            {children}
        </Web3Context.Provider>
    );
}

export function useWeb3() {
    return useContext(Web3Context);
}
