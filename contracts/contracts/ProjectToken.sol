// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ProjectToken
 * @dev ERC-20 token representing shares in a specific research project
 * Tokens are minted when investors fund the project through the escrow
 */
contract ProjectToken is ERC20, Ownable, Pausable {
    // The escrow contract that can mint tokens
    address public escrowContract;

    // Maximum supply (equal to funding goal)
    uint256 public immutable maxSupply;

    // Token metadata
    string public projectTitle;

    // Events
    event EscrowContractSet(address indexed escrowContract);
    event TokensMinted(address indexed to, uint256 amount, uint256 totalSupply);

    modifier onlyEscrow() {
        require(
            msg.sender == escrowContract,
            "Only escrow contract can mint tokens"
        );
        _;
    }

    constructor(
        string memory _projectTitle,
        string memory _symbol,
        uint256 _maxSupply
    ) ERC20(_projectTitle, _symbol) {
        require(_maxSupply > 0, "Max supply must be greater than 0");

        projectTitle = _projectTitle;
        maxSupply = _maxSupply;
    }

    /**
     * @dev Set the escrow contract address that can mint tokens
     * Can only be called once by the owner (ProjectFactory)
     */
    function setEscrowContract(address _escrowContract) external onlyOwner {
        require(
            _escrowContract != address(0),
            "Invalid escrow contract address"
        );
        require(escrowContract == address(0), "Escrow contract already set");

        escrowContract = _escrowContract;
        emit EscrowContractSet(_escrowContract);
    }

    /**
     * @dev Mint tokens to an investor
     * Can only be called by the escrow contract when funds are received
     */
    function mint(
        address to,
        uint256 amount
    ) external onlyEscrow whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Mint amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "Would exceed max supply");

        _mint(to, amount);
        emit TokensMinted(to, amount, totalSupply());
    }

    /**
     * @dev Get token information
     */
    function getTokenInfo()
        external
        view
        returns (
            string memory title,
            string memory tokenSymbol,
            uint256 currentSupply,
            uint256 maximumSupply,
            address escrow
        )
    {
        return (
            projectTitle,
            symbol(),
            totalSupply(),
            maxSupply,
            escrowContract
        );
    }

    /**
     * @dev Calculate token share percentage for an address
     */
    function getSharePercentage(
        address holder
    ) external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        return (balanceOf(holder) * 10000) / totalSupply(); // Returns basis points (100 = 1%)
    }

    /**
     * @dev Pause token transfers (only owner - should be used carefully)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers are paused");
    }
}
