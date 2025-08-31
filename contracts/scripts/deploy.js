const fs = require("fs");
const { ethers } = require("hardhat");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("🚀 Deploying contracts with the account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    // Check if balance is sufficient for deployment
    const minBalance = ethers.parseEther("0.01"); // Minimum 0.01 ETH
    if (balance < minBalance) {
        console.warn("⚠️  Warning: Account balance is low. Deployment may fail.");
    }

    // Deploy the FundMyScience contract
    console.log("📄 Getting contract factory...");
    const FundMyScience = await ethers.getContractFactory("FundMyScience");

    // Set platform wallet address
    const platformWallet = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
    console.log("🏛️  Platform wallet set to:", platformWallet);

    console.log("⏳ Deploying FundMyScience contract...");
    const fundMyScience = await FundMyScience.deploy(platformWallet);

    console.log("⏳ Waiting for deployment confirmation...");
    await fundMyScience.waitForDeployment();

    const contractAddress = await fundMyScience.getAddress();
    console.log("✅ FundMyScience deployed to:", contractAddress);

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const deployedCode = await deployer.provider.getCode(contractAddress);
    if (deployedCode === "0x") {
        throw new Error("❌ Contract deployment failed - no code at address");
    }

    // Test basic contract functionality
    console.log("🧪 Testing basic contract functionality...");
    try {
        const platformWalletFromContract = await fundMyScience.platformWallet();
        const platformFee = await fundMyScience.platformFeePercentage();
        const nextProjectId = await fundMyScience.nextProjectId();

        console.log("✅ Contract verification successful:");
        console.log("   Platform wallet:", platformWalletFromContract);
        console.log("   Platform fee:", platformFee.toString(), "bps");
        console.log("   Next project ID:", nextProjectId.toString());
    } catch (error) {
        console.error("❌ Contract verification failed:", error.message);
        throw error;
    }

    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        platformWallet: platformWallet,
        deployer: deployer.address,
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        deployedAt: new Date().toISOString(),
        blockNumber: await deployer.provider.getBlockNumber(),
        gasUsed: "estimated", // You can track this if needed
        txHash: fundMyScience.deploymentTransaction()?.hash
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n📋 Deployment Summary:");
    console.log("═".repeat(50));
    console.log(`Network: ${hre.network.name}`);
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Platform Wallet: ${platformWallet}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Deployed At: ${deploymentInfo.deployedAt}`);
    console.log(`Deployment file saved: ${deploymentFile}`);
    console.log("═".repeat(50));

    // Instructions for next steps
    console.log("\n📚 Next Steps:");
    console.log("1. Update your frontend environment variables:");
    console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS_${hre.network.name.toUpperCase()}=${contractAddress}`);
    console.log("2. If deploying to testnet/mainnet, verify the contract:");
    console.log(`   npm run verify:${hre.network.name} ${contractAddress} ${platformWallet}`);
    console.log("3. Update your Web3Context with the new contract address");

    return deploymentInfo;
}

// Enhanced error handling
main()
    .then((deploymentInfo) => {
        console.log("🎉 Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Deployment failed:");
        console.error(error);
        process.exit(1);
    });
