// Smart Contract Configuration for DonationTracker.sol

export const CONTRACT_ABI = [
    "function donate(string calldata purpose) external payable returns (uint256 newDonationId)",
    "function withdraw() external",
    "function transferOwnership(address newOwner) external",
    "function getDonation(uint256 id) external view returns (uint256 donationId, address donor, uint256 amount, string memory purpose, uint256 timestamp)",
    "function getDonationCount() external view returns (uint256)",
    "function getTotalDonated() external view returns (uint256)",
    "function getBalance() external view returns (uint256)",
    "function owner() external view returns (address)",
    "function totalDonations() external view returns (uint256)",
    "function totalAmountDonated() external view returns (uint256)",
    "event DonationReceived(uint256 indexed id, address indexed donor, uint256 amount, string purpose, uint256 timestamp)",
    "event Withdrawal(address indexed recipient, uint256 amount, uint256 timestamp)",
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];

export const DEFAULT_CONTRACT_ADDRESS = "0x56dd12a8663806c6b971D6e39796237599A6a24C";
export const DEFAULT_RPC_URL = "https://testnet-rpc.monad.xyz/";
export const LOCAL_CHAIN_ID = 10143n;
export const LOCAL_CHAIN_ID_HEX = "0x279F";

export const DEMO_ACCOUNTS = [
    {
        id: "admin",
        name: "NGO Admin (Owner)",
        address: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
        privateKey: "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
    },
    {
        id: "donor1",
        name: "Donor 1 (Alice)",
        address: "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
        privateKey: "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1"
    },
    {
        id: "donor2",
        name: "Donor 2 (Bob)",
        address: "0x3Bd442d4A38Ab5dA0B25C7C10290BD5CCC614b08",
        privateKey: "0x6370fd0332c6fa76721d2690c30768500caf1892965b1116388f32974bfe2d4f"
    },
    {
        id: "donor3",
        name: "Donor 3 (Charlie)",
        address: "0x794940f0d55B4dD6081a69B17E37BDb18E135a22",
        privateKey: "0x646f1ce2fd01a89aaec26709967929d5fb3e7e01a4ea1abbd86103e2138e8b76"
    }
];
