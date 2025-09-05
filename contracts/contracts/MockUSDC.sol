// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes
 * This contract mimics the USDC token with 6 decimals
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6; // USDC has 6 decimals

    constructor() ERC20("Mock USD Coin", "USDC") {
        // Mint initial supply for testing (1 million USDC)
        _mint(msg.sender, 1_000_000 * 10 ** _decimals);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint tokens for testing purposes
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet function for testing - anyone can get 1000 USDC
     */
    function faucet() external {
        require(
            balanceOf(msg.sender) < 10000 * 10 ** _decimals,
            "Already have enough tokens"
        );
        _mint(msg.sender, 1000 * 10 ** _decimals); // 1000 USDC
    }

    /**
     * @dev Get tokens with a specific amount for testing
     */
    function getFaucetTokens(uint256 amount) external {
        require(amount <= 10000 * 10 ** _decimals, "Amount too large");
        _mint(msg.sender, amount);
    }
}
