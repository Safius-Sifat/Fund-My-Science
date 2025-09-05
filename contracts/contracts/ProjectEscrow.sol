// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ProjectToken.sol";

/**
 * @title ProjectEscrow
 * @dev Individual escrow contract for each research project
 * Handles USDC investments and milestone-based fund releases
 */
contract ProjectEscrow is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Project details
    uint256 public immutable databaseProjectId;
    address public immutable researcher;
    IERC20 public immutable usdcToken;
    ProjectToken public immutable projectToken;
    address public immutable daoAddress;
    address public immutable platformWallet;
    uint256 public immutable platformFeePercentage;
    uint256 public immutable fundingGoal;

    // Funding state
    uint256 public totalFunded;
    bool public fundingCompleted;

    // Milestone tracking
    struct Milestone {
        string description;
        uint256 amount;
        bool released;
        uint256 releasedAt;
    }

    Milestone[] public milestones;
    uint256 public milestonesReleased;

    // Investment tracking
    struct Investment {
        address investor;
        uint256 amount;
        uint256 tokensReceived;
        uint256 timestamp;
    }

    Investment[] public investments;
    mapping(address => uint256) public investorContributions;
    mapping(address => uint256) public investorTokens;
    address[] public investorList;

    // Events
    event InvestmentReceived(
        address indexed investor,
        uint256 usdcAmount,
        uint256 tokensReceived,
        uint256 totalFunded
    );

    event MilestoneReleased(
        uint256 indexed milestoneIndex,
        uint256 amount,
        uint256 platformFee,
        uint256 researcherAmount
    );

    event FundingCompleted(uint256 totalAmount, uint256 investorCount);
    event EmergencyWithdraw(address indexed to, uint256 amount);

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Only DAO can call this function");
        _;
    }

    modifier onlyResearcher() {
        require(
            msg.sender == researcher,
            "Only researcher can call this function"
        );
        _;
    }

    modifier fundingActive() {
        require(!fundingCompleted, "Funding period has ended");
        require(totalFunded < fundingGoal, "Funding goal already reached");
        _;
    }

    constructor(
        uint256 _databaseProjectId,
        address _researcher,
        address _usdcToken,
        address _projectToken,
        address _daoAddress,
        address _platformWallet,
        uint256 _platformFeePercentage,
        uint256 _fundingGoal,
        uint256[] memory _milestoneAmounts,
        string[] memory _milestoneDescriptions
    ) {
        require(_researcher != address(0), "Invalid researcher address");
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_projectToken != address(0), "Invalid project token address");
        require(_daoAddress != address(0), "Invalid DAO address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(
            _milestoneAmounts.length > 0,
            "Must have at least one milestone"
        );

        databaseProjectId = _databaseProjectId;
        researcher = _researcher;
        usdcToken = IERC20(_usdcToken);
        projectToken = ProjectToken(_projectToken);
        daoAddress = _daoAddress;
        platformWallet = _platformWallet;
        platformFeePercentage = _platformFeePercentage;
        fundingGoal = _fundingGoal;

        // Initialize milestones
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            milestones.push(
                Milestone({
                    description: _milestoneDescriptions[i],
                    amount: _milestoneAmounts[i],
                    released: false,
                    releasedAt: 0
                })
            );
        }
    }

    /**
     * @dev Fund the project with USDC
     * Investor must approve USDC spending before calling this function
     */
    function fund(
        uint256 amount
    ) external nonReentrant whenNotPaused fundingActive {
        require(amount > 0, "Investment amount must be greater than 0");
        require(
            msg.sender != researcher,
            "Researcher cannot invest in their own project"
        );
        require(
            totalFunded + amount <= fundingGoal,
            "Investment would exceed funding goal"
        );

        // Transfer USDC from investor
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate tokens to mint (1:1 ratio with USDC)
        uint256 tokensToMint = amount;

        // Mint project tokens to investor
        projectToken.mint(msg.sender, tokensToMint);

        // Update investor tracking
        if (investorContributions[msg.sender] == 0) {
            investorList.push(msg.sender);
        }
        investorContributions[msg.sender] += amount;
        investorTokens[msg.sender] += tokensToMint;

        // Record investment
        investments.push(
            Investment({
                investor: msg.sender,
                amount: amount,
                tokensReceived: tokensToMint,
                timestamp: block.timestamp
            })
        );

        // Update total funded
        totalFunded += amount;

        emit InvestmentReceived(msg.sender, amount, tokensToMint, totalFunded);

        // Check if funding is completed
        if (totalFunded >= fundingGoal) {
            fundingCompleted = true;
            emit FundingCompleted(totalFunded, investorList.length);
        }
    }

    /**
     * @dev Release a milestone payment to the researcher
     * Can only be called by the DAO after milestone completion verification
     */
    function releaseMilestone(
        uint256 milestoneIndex
    ) external onlyDAO nonReentrant {
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(
            !milestones[milestoneIndex].released,
            "Milestone already released"
        );
        require(
            milestoneIndex == milestonesReleased,
            "Must release milestones in order"
        );

        Milestone storage milestone = milestones[milestoneIndex];
        uint256 releaseAmount = milestone.amount;

        // Ensure we have enough funds to release
        require(
            usdcToken.balanceOf(address(this)) >= releaseAmount,
            "Insufficient funds in escrow"
        );

        // Calculate platform fee
        uint256 platformFee = (releaseAmount * platformFeePercentage) / 10000;
        uint256 researcherAmount = releaseAmount - platformFee;

        // Mark milestone as released
        milestone.released = true;
        milestone.releasedAt = block.timestamp;
        milestonesReleased++;

        // Transfer platform fee
        if (platformFee > 0) {
            usdcToken.safeTransfer(platformWallet, platformFee);
        }

        // Transfer funds to researcher
        usdcToken.safeTransfer(researcher, researcherAmount);

        emit MilestoneReleased(
            milestoneIndex,
            releaseAmount,
            platformFee,
            researcherAmount
        );
    }

    /**
     * @dev Get project information
     */
    function getProjectInfo()
        external
        view
        returns (
            uint256 projectId,
            address researcherAddress,
            uint256 goal,
            uint256 funded,
            uint256 remaining,
            uint256 investorCount,
            bool completed,
            uint256 milestonesTotal,
            uint256 milestonesReleasedCount
        )
    {
        return (
            databaseProjectId,
            researcher,
            fundingGoal,
            totalFunded,
            fundingGoal - totalFunded,
            investorList.length,
            fundingCompleted,
            milestones.length,
            milestonesReleased
        );
    }

    /**
     * @dev Get milestone information
     */
    function getMilestone(
        uint256 index
    )
        external
        view
        returns (
            string memory description,
            uint256 amount,
            bool released,
            uint256 releasedAt
        )
    {
        require(index < milestones.length, "Invalid milestone index");
        Milestone memory milestone = milestones[index];
        return (
            milestone.description,
            milestone.amount,
            milestone.released,
            milestone.releasedAt
        );
    }

    /**
     * @dev Get all milestones
     */
    function getAllMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    /**
     * @dev Get investment information for an address
     */
    function getInvestorInfo(
        address investor
    )
        external
        view
        returns (
            uint256 totalContribution,
            uint256 tokenBalance,
            uint256 sharePercentage
        )
    {
        uint256 contribution = investorContributions[investor];
        uint256 tokens = investorTokens[investor];
        uint256 share = totalFunded > 0
            ? (contribution * 10000) / totalFunded
            : 0; // Basis points

        return (contribution, tokens, share);
    }

    /**
     * @dev Get all investors
     */
    function getAllInvestors() external view returns (address[] memory) {
        return investorList;
    }

    /**
     * @dev Get investment count
     */
    function getInvestmentCount() external view returns (uint256) {
        return investments.length;
    }

    /**
     * @dev Get investment by index
     */
    function getInvestment(
        uint256 index
    ) external view returns (Investment memory) {
        require(index < investments.length, "Invalid investment index");
        return investments[index];
    }

    /**
     * @dev Emergency withdrawal function (only DAO)
     * Should only be used in case of critical issues
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyDAO {
        require(to != address(0), "Invalid withdrawal address");
        require(
            amount <= usdcToken.balanceOf(address(this)),
            "Insufficient balance"
        );

        usdcToken.safeTransfer(to, amount);
        emit EmergencyWithdraw(to, amount);
    }

    /**
     * @dev Pause the contract (only DAO)
     */
    function pause() external onlyDAO {
        _pause();
    }

    /**
     * @dev Unpause the contract (only DAO)
     */
    function unpause() external onlyDAO {
        _unpause();
    }
}
