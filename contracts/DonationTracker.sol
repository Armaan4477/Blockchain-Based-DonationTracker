// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DonationTracker
 * @author College Mini-Project Team
 * @notice Transparent, blockchain-based donation tracking smart contract.
 * @dev Records donations on-chain with donor addresses, amounts, timestamps,
 *      and categorical purposes. Enforces strict administrative withdrawal controls.
 */
contract DonationTracker {

    // ==========================================
    // DATA STRUCTURES
    // ==========================================

    /**
     * @notice Represents an individual donation record.
     * @param id Unique sequential identifier for the donation.
     * @param donor Blockchain address of the donor.
     * @param amount Value of the donation in Wei.
     * @param purpose Intended cause or category for the donation.
     * @param timestamp Unix timestamp when the block was mined.
     */
    struct Donation {
        uint256 id;
        address donor;
        uint256 amount;
        string purpose;
        uint256 timestamp;
    }

    // ==========================================
    // STATE VARIABLES
    // ==========================================

    /// @notice Authorized administrator / NGO account address.
    address public owner;

    /// @notice Total number of donations recorded.
    uint256 public totalDonations;

    /// @notice Cumulative value of all donations received in Wei.
    uint256 public totalAmountDonated;

    /// @dev Internal mapping from sequential donation ID to Donation struct.
    mapping(uint256 => Donation) private _donations;

    // ==========================================
    // EVENTS
    // ==========================================

    /**
     * @notice Emitted whenever a donor successfully makes a donation.
     * @param id The unique donation ID.
     * @param donor The address that contributed the funds.
     * @param amount The donation amount in Wei.
     * @param purpose Description of the donation's purpose.
     * @param timestamp The block timestamp of the transaction.
     */
    event DonationReceived(
        uint256 indexed id,
        address indexed donor,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );

    /**
     * @notice Emitted when the contract administrator withdraws collected funds.
     * @param recipient The owner/admin address receiving the funds.
     * @param amount The amount withdrawn in Wei.
     * @param timestamp The block timestamp of the withdrawal.
     */
    event Withdrawal(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @notice Emitted when contract ownership is transferred to a new admin address.
     * @param previousOwner The address of the old administrator.
     * @param newOwner The address of the newly appointed administrator.
     */
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ==========================================
    // CUSTOM ERRORS (Gas-Efficient Error Handling)
    // ==========================================

    /// @dev Thrown when a non-owner account attempts an admin-only operation.
    error OnlyOwnerAllowed();

    /// @dev Thrown when a donation transaction has zero Ether attached.
    error DonationMustBeGreaterThanZero();

    /// @dev Thrown when an empty purpose string is provided.
    error EmptyPurpose();

    /// @dev Thrown when attempting to query a donation ID that does not exist.
    error DonationNotFound(uint256 requestedId);

    /// @dev Thrown when the owner attempts to withdraw but the contract balance is 0.
    error NoFundsToWithdraw();

    /// @dev Thrown when an invalid (zero) address is supplied for ownership transfer.
    error InvalidAddress();

    /// @dev Thrown when Ether transfer to the owner fails during withdrawal.
    error TransferFailed();

    /// @dev Thrown when plain Ether is sent directly without calling donate().
    error DirectTransferNotAllowed();

    // ==========================================
    // MODIFIERS
    // ==========================================

    /**
     * @dev Restricts execution to the authorized owner/NGO account.
     */
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OnlyOwnerAllowed();
        }
        _;
    }

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * @notice Deploys the contract and assigns deployer as the initial owner.
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ==========================================
    // CORE TRANSACTION FUNCTIONS
    // ==========================================

    /**
     * @notice Allows any user to contribute funds with a specified purpose.
     * @param purpose Categorical reason or initiative for the donation (e.g., "Education", "Medical").
     * @return newDonationId The assigned unique identifier for this donation.
     */
    function donate(string calldata purpose) external payable returns (uint256 newDonationId) {
        // Checks
        if (msg.value == 0) {
            revert DonationMustBeGreaterThanZero();
        }
        if (bytes(purpose).length == 0) {
            revert EmptyPurpose();
        }

        // Effects
        totalDonations += 1;
        newDonationId = totalDonations;
        totalAmountDonated += msg.value;

        _donations[newDonationId] = Donation({
            id: newDonationId,
            donor: msg.sender,
            amount: msg.value,
            purpose: purpose,
            timestamp: block.timestamp
        });

        // Event Emission
        emit DonationReceived(
            newDonationId,
            msg.sender,
            msg.value,
            purpose,
            block.timestamp
        );

        return newDonationId;
    }

    /**
     * @notice Allows the authorized owner to withdraw all funds currently held in the contract.
     * @dev Follows the Checks-Effects-Interactions pattern to prevent reentrancy attacks.
     */
    function withdraw() external onlyOwner {
        uint256 contractBalance = address(this).balance;

        // Checks
        if (contractBalance == 0) {
            revert NoFundsToWithdraw();
        }

        // Effects (Log the event before making external transfer)
        emit Withdrawal(owner, contractBalance, block.timestamp);

        // Interactions (Transfer Ether safely to owner)
        (bool success, ) = payable(owner).call{value: contractBalance}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Transfers administrative ownership to a new address.
     * @param newOwner Address of the new administrator.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert InvalidAddress();
        }
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // ==========================================
    // READ-ONLY / VIEW FUNCTIONS
    // ==========================================

    /**
     * @notice Retrieves the full record of a donation by its unique ID.
     * @param id Sequential donation identifier.
     * @return donationId Unique ID of the donation.
     * @return donor Address of the contributor.
     * @return amount Value donated in Wei.
     * @return purpose Purpose or cause specified by donor.
     * @return timestamp Block timestamp when the donation was made.
     */
    function getDonation(uint256 id)
        external
        view
        returns (
            uint256 donationId,
            address donor,
            uint256 amount,
            string memory purpose,
            uint256 timestamp
        )
    {
        if (id == 0 || id > totalDonations) {
            revert DonationNotFound(id);
        }

        Donation storage d = _donations[id];
        return (d.id, d.donor, d.amount, d.purpose, d.timestamp);
    }

    /**
     * @notice Returns the total number of donations recorded to date.
     * @return Total donation count.
     */
    function getDonationCount() external view returns (uint256) {
        return totalDonations;
    }

    /**
     * @notice Returns the cumulative amount of Ether donated since inception (in Wei).
     * @return Total donated amount in Wei.
     */
    function getTotalDonated() external view returns (uint256) {
        return totalAmountDonated;
    }

    /**
     * @notice Returns the current Ether balance held by the smart contract (in Wei).
     * @return Current contract balance in Wei.
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ==========================================
    // FALLBACK / RECEIVE GUARDS
    // ==========================================

    /**
     * @dev Reverts direct plain Ether transfers to ensure donors use `donate(purpose)`
     *      and properly record their purpose.
     */
    receive() external payable {
        revert DirectTransferNotAllowed();
    }

    /**
     * @dev Reverts arbitrary calls with unknown signatures.
     */
    fallback() external payable {
        revert DirectTransferNotAllowed();
    }
}
