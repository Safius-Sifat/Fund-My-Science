// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ProjectEscrow.sol";
import "./ProjectToken.sol";

/**
 * @title ProjectFactory
 * @dev Simplified factory contract that creates project escrows
 */
contract ProjectFactory {
    // USDC contract address
    address public immutable usdcToken;

    // DAO address that can create projects
    address public daoAddress;

    // Platform wallet
    address public platformWallet;

    // Project tracking
    mapping(uint256 => address) public projectEscrows;
    uint256[] public allProjectIds;

    // Events
    event ProjectCreated(
        uint256 indexed databaseProjectId,
        address indexed escrowAddress,
        address indexed tokenAddress,
        address researcher,
        string title,
        uint256 fundingGoal
    );

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Only DAO can call this function");
        _;
    }

    constructor(
        address _usdcToken,
        address _daoAddress,
        address _platformWallet
    ) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_daoAddress != address(0), "Invalid DAO address");
        require(_platformWallet != address(0), "Invalid platform wallet");

        usdcToken = _usdcToken;
        daoAddress = _daoAddress;
        platformWallet = _platformWallet;
    }

    /**
     * @dev Creates a new project escrow and token contract
     * Can only be called by the DAO address after project approval
     * @param databaseProjectId The ID from the database (for mapping)
     * @param researcher Address of the researcher
     * @param title Project title
     * @param symbol Token symbol (e.g., "PROJ1")
     * @param fundingGoal Total funding goal in USDC (with decimals)
     * @param milestoneAmounts Array of milestone funding amounts
     * @param milestoneDescriptions Array of milestone descriptions
     * @return escrowAddress Address of the created escrow contract
     */
    function createProject(
        uint256 databaseProjectId,
        address researcher,
        string memory title,
        string memory symbol,
        uint256 fundingGoal,
        uint256[] memory milestoneAmounts,
        string[] memory milestoneDescriptions
    ) external onlyDAO returns (address escrowAddress) {
        require(researcher != address(0), "Invalid researcher address");
        require(fundingGoal > 0, "Funding goal must be greater than 0");
        require(
            milestoneAmounts.length > 0,
            "Must have at least one milestone"
        );
        require(
            milestoneAmounts.length == milestoneDescriptions.length,
            "Milestone arrays length mismatch"
        );
        require(
            projectEscrows[databaseProjectId] == address(0),
            "Project already exists"
        );

        // Verify milestone amounts sum to funding goal
        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(
                milestoneAmounts[i] > 0,
                "Milestone amount must be greater than 0"
            );
            totalMilestoneAmount += milestoneAmounts[i];
        }
        require(
            totalMilestoneAmount == fundingGoal,
            "Milestone amounts must equal funding goal"
        );

        // Create project token
        ProjectToken projectToken = new ProjectToken(
            title,
            symbol,
            fundingGoal // Initial supply will be minted as investors fund
        );

        // Create project escrow
        ProjectEscrow escrow = new ProjectEscrow(
            databaseProjectId,
            researcher,
            usdcToken,
            address(projectToken),
            daoAddress,
            platformWallet,
            250, // 2.5% platform fee
            fundingGoal,
            milestoneAmounts,
            milestoneDescriptions
        );

        // Set escrow as token minter
        projectToken.setEscrowContract(address(escrow));

        // Store mappings
        escrowAddress = address(escrow);
        projectEscrows[databaseProjectId] = escrowAddress;
        allProjectIds.push(databaseProjectId);

        emit ProjectCreated(
            databaseProjectId,
            escrowAddress,
            address(projectToken),
            researcher,
            title,
            fundingGoal
        );

        return escrowAddress;
    }

    /**
     * @dev Get escrow address for a database project ID
     */
    function getProjectEscrow(
        uint256 databaseProjectId
    ) external view returns (address) {
        return projectEscrows[databaseProjectId];
    }

    /**
     * @dev Get all project IDs created by this factory
     */
    function getAllProjectIds() external view returns (uint256[] memory) {
        return allProjectIds;
    }

    /**
     * @dev Get project count
     */
    function getProjectCount() external view returns (uint256) {
        return allProjectIds.length;
    }
}
