// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FundMyScience
 * @dev Smart contract for decentralized research funding with milestone-based releases
 */
contract FundMyScience is ReentrancyGuard, Ownable, Pausable {
    struct Project {
        uint256 id;
        address researcher;
        string title;
        string ipfsHash; // IPFS hash for project details
        uint256 fundingGoal;
        uint256 fundsRaised;
        uint256 milestoneCount;
        ProjectStatus status;
        uint256 createdAt;
    }

    struct Milestone {
        uint256 projectId;
        uint256 milestoneIndex;
        string description;
        uint256 fundingAmount;
        uint256 targetDate;
        MilestoneStatus status;
        string evidenceHash; // IPFS hash for completion evidence
        uint256 approvedAt;
    }

    struct Investment {
        address investor;
        uint256 projectId;
        uint256 amount;
        uint256 timestamp;
    }

    enum ProjectStatus {
        Draft,
        Active,
        Completed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        InReview,
        Approved,
        Paid
    }

    // State variables
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) public projectMilestones;
    mapping(uint256 => Investment[]) public projectInvestments;
    mapping(address => uint256[]) public userProjects;
    mapping(address => uint256[]) public userInvestments;

    uint256 public nextProjectId = 1;
    uint256 public platformFeePercentage = 250; // 2.5%
    address public platformWallet;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed researcher,
        string title,
        uint256 fundingGoal
    );
    event InvestmentMade(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount
    );
    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        string evidenceHash
    );
    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        uint256 amount
    );
    event FundsReleased(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        address researcher,
        uint256 amount
    );
    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus newStatus
    );

    // Modifiers
    modifier onlyResearcher(uint256 projectId) {
        require(
            projects[projectId].researcher == msg.sender,
            "Only project researcher can call this"
        );
        _;
    }

    modifier validProject(uint256 projectId) {
        require(projects[projectId].id != 0, "Project does not exist");
        _;
    }

    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }

    /**
     * @dev Create a new research project
     */
    function createProject(
        string memory _title,
        string memory _ipfsHash,
        uint256 _fundingGoal,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneFunding,
        uint256[] memory _milestoneTargets
    ) external whenNotPaused returns (uint256) {
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(
            _milestoneDescriptions.length == _milestoneFunding.length,
            "Milestone arrays length mismatch"
        );
        require(
            _milestoneDescriptions.length == _milestoneTargets.length,
            "Milestone arrays length mismatch"
        );

        // Verify milestone funding adds up to total goal
        uint256 totalMilestoneFunding = 0;
        for (uint256 i = 0; i < _milestoneFunding.length; i++) {
            totalMilestoneFunding += _milestoneFunding[i];
        }
        require(
            totalMilestoneFunding == _fundingGoal,
            "Milestone funding must equal project goal"
        );

        uint256 projectId = nextProjectId++;

        projects[projectId] = Project({
            id: projectId,
            researcher: msg.sender,
            title: _title,
            ipfsHash: _ipfsHash,
            fundingGoal: _fundingGoal,
            fundsRaised: 0,
            milestoneCount: _milestoneDescriptions.length,
            status: ProjectStatus.Active,
            createdAt: block.timestamp
        });

        // Create milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            projectMilestones[projectId].push(
                Milestone({
                    projectId: projectId,
                    milestoneIndex: i,
                    description: _milestoneDescriptions[i],
                    fundingAmount: _milestoneFunding[i],
                    targetDate: _milestoneTargets[i],
                    status: MilestoneStatus.Pending,
                    evidenceHash: "",
                    approvedAt: 0
                })
            );
        }

        userProjects[msg.sender].push(projectId);

        emit ProjectCreated(projectId, msg.sender, _title, _fundingGoal);
        return projectId;
    }

    /**
     * @dev Invest in a research project
     */
    function investInProject(
        uint256 projectId
    ) external payable nonReentrant whenNotPaused validProject(projectId) {
        require(msg.value > 0, "Investment amount must be greater than 0");
        require(
            projects[projectId].status == ProjectStatus.Active,
            "Project is not active"
        );
        require(
            projects[projectId].researcher != msg.sender,
            "Researchers cannot invest in their own projects"
        );

        Project storage project = projects[projectId];
        require(
            project.fundsRaised + msg.value <= project.fundingGoal,
            "Investment exceeds funding goal"
        );

        project.fundsRaised += msg.value;

        // Record investment
        projectInvestments[projectId].push(
            Investment({
                investor: msg.sender,
                projectId: projectId,
                amount: msg.value,
                timestamp: block.timestamp
            })
        );

        userInvestments[msg.sender].push(projectId);

        emit InvestmentMade(projectId, msg.sender, msg.value);

        // Check if project is fully funded
        if (project.fundsRaised >= project.fundingGoal) {
            project.status = ProjectStatus.Completed;
            emit ProjectStatusChanged(projectId, ProjectStatus.Completed);
        }
    }

    /**
     * @dev Submit milestone completion evidence
     */
    function submitMilestoneEvidence(
        uint256 projectId,
        uint256 milestoneIndex,
        string memory evidenceHash
    ) external onlyResearcher(projectId) validProject(projectId) {
        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Invalid milestone index"
        );

        Milestone storage milestone = projectMilestones[projectId][
            milestoneIndex
        ];
        require(
            milestone.status == MilestoneStatus.Pending,
            "Milestone is not pending"
        );

        milestone.evidenceHash = evidenceHash;
        milestone.status = MilestoneStatus.InReview;

        emit MilestoneCompleted(projectId, milestoneIndex, evidenceHash);
    }

    /**
     * @dev Approve milestone and release funds (admin function)
     */
    function approveMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    ) external onlyOwner validProject(projectId) nonReentrant {
        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Invalid milestone index"
        );

        Milestone storage milestone = projectMilestones[projectId][
            milestoneIndex
        ];
        require(
            milestone.status == MilestoneStatus.InReview,
            "Milestone is not in review"
        );

        Project storage project = projects[projectId];
        require(
            project.fundsRaised >= milestone.fundingAmount,
            "Insufficient funds raised"
        );

        milestone.status = MilestoneStatus.Approved;
        milestone.approvedAt = block.timestamp;

        // Calculate platform fee
        uint256 platformFee = (milestone.fundingAmount *
            platformFeePercentage) / 10000;
        uint256 researcherAmount = milestone.fundingAmount - platformFee;

        // Transfer funds
        (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");

        (bool researcherSuccess, ) = project.researcher.call{
            value: researcherAmount
        }("");
        require(researcherSuccess, "Researcher payment failed");

        milestone.status = MilestoneStatus.Paid;

        emit MilestoneApproved(
            projectId,
            milestoneIndex,
            milestone.fundingAmount
        );
        emit FundsReleased(
            projectId,
            milestoneIndex,
            project.researcher,
            researcherAmount
        );
    }

    /**
     * @dev Get project details
     */
    function getProject(
        uint256 projectId
    )
        external
        view
        returns (
            uint256 id,
            address researcher,
            string memory title,
            string memory ipfsHash,
            uint256 fundingGoal,
            uint256 fundsRaised,
            uint256 milestoneCount,
            ProjectStatus status,
            uint256 createdAt
        )
    {
        Project memory project = projects[projectId];
        return (
            project.id,
            project.researcher,
            project.title,
            project.ipfsHash,
            project.fundingGoal,
            project.fundsRaised,
            project.milestoneCount,
            project.status,
            project.createdAt
        );
    }

    /**
     * @dev Get project milestones
     */
    function getProjectMilestones(
        uint256 projectId
    ) external view returns (Milestone[] memory) {
        return projectMilestones[projectId];
    }

    /**
     * @dev Get project investments
     */
    function getProjectInvestments(
        uint256 projectId
    ) external view returns (Investment[] memory) {
        return projectInvestments[projectId];
    }

    /**
     * @dev Get user's projects
     */
    function getUserProjects(
        address user
    ) external view returns (uint256[] memory) {
        return userProjects[user];
    }

    /**
     * @dev Get user's investments
     */
    function getUserInvestments(
        address user
    ) external view returns (uint256[] memory) {
        return userInvestments[user];
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Update platform wallet (only owner)
     */
    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        platformWallet = newWallet;
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
