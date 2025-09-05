const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Factory Pattern deployment...\n");

    // Get deployer account
    const [deployer, daoAddress, platformWallet] = await ethers.getSigners();
    console.log("📋 Deployment Account:", deployer.address);
    console.log("🏛️  DAO Address:", daoAddress.address);
    console.log("💰 Platform Wallet:", platformWallet.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💎 Account Balance:", ethers.formatEther(balance), "ETH\n");

    try {
        // 1. Deploy Mock USDC (for testing)
        console.log("📄 Deploying MockUSDC...");
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        const usdcToken = await MockUSDC.deploy();
        await usdcToken.waitForDeployment();
        const usdcAddress = await usdcToken.getAddress();
        console.log("✅ MockUSDC deployed to:", usdcAddress);

        // 2. Deploy ProjectFactory
        console.log("\n📄 Deploying ProjectFactory...");
        const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
        const factory = await ProjectFactory.deploy(
            usdcAddress,
            daoAddress.address,
            platformWallet.address
        );
        await factory.waitForDeployment();
        const factoryAddress = await factory.getAddress();
        console.log("✅ ProjectFactory deployed to:", factoryAddress);

        // 3. Verify deployments
        console.log("\n🔍 Verifying deployments...");

        // Check USDC
        const usdcName = await usdcToken.name();
        const usdcDecimals = await usdcToken.decimals();
        console.log(`   USDC: ${usdcName}, ${usdcDecimals} decimals`);

        // Check Factory
        const projectCount = await factory.getProjectCount();
        console.log(`   Factory: ${projectCount} projects created`);

        // 4. Fund deployer with test USDC (handle existing balance)
        console.log("\n🪙 Checking USDC balance...");
        const deployerBalance = await usdcToken.balanceOf(deployer.address);
        console.log(`   Current USDC balance: ${ethers.formatUnits(deployerBalance, 6)} USDC`);

        if (deployerBalance < ethers.parseUnits("1000", 6)) {
            console.log("   Getting test USDC tokens...");
            try {
                await usdcToken.faucet();
                const newBalance = await usdcToken.balanceOf(deployer.address);
                console.log(`   New USDC balance: ${ethers.formatUnits(newBalance, 6)} USDC`);
            } catch (error) {
                console.log("   Note: Faucet failed (probably already have enough tokens)");
            }
        } else {
            console.log("   Already have sufficient USDC tokens");
        }

        // 5. Test project creation
        console.log("\n🧪 Creating test project...");
        const testProjectTx = await factory.connect(daoAddress).createProject(
            1, // database project ID
            deployer.address, // researcher
            "Test Quantum Research Project",
            "TQRP",
            ethers.parseUnits("10000", 6), // 10,000 USDC goal
            [
                ethers.parseUnits("3000", 6), // Milestone 1: 3,000 USDC
                ethers.parseUnits("4000", 6), // Milestone 2: 4,000 USDC
                ethers.parseUnits("3000", 6)  // Milestone 3: 3,000 USDC
            ],
            [
                "Complete literature review and hypothesis formation",
                "Develop prototype and initial testing",
                "Final validation and publication preparation"
            ]
        );

        const receipt = await testProjectTx.wait();
        console.log("✅ Test project created successfully!");

        // Find project creation event
        const projectCreatedEvent = receipt.logs.find(log => {
            try {
                const parsed = factory.interface.parseLog(log);
                return parsed.name === 'ProjectCreated';
            } catch {
                return false;
            }
        });

        if (projectCreatedEvent) {
            const parsed = factory.interface.parseLog(projectCreatedEvent);
            console.log(`   Escrow Address: ${parsed.args.escrowAddress}`);
            console.log(`   Token Address: ${parsed.args.tokenAddress}`);
        }

        // 6. Final summary
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("=".repeat(60));
        console.log("📋 Contract Addresses:");
        console.log(`   MockUSDC:       ${usdcAddress}`);
        console.log(`   ProjectFactory: ${factoryAddress}`);
        console.log("=".repeat(60));
        console.log("\n📝 Environment Variables for Frontend:");
        console.log(`NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS=${factoryAddress}`);
        console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
        console.log("\n🔧 Next Steps:");
        console.log("1. Update your .env.local with the addresses above");
        console.log("2. Connect MetaMask to localhost:8545");
        console.log("3. Import the deployer private key to MetaMask for testing");
        console.log("4. Visit /blockchain-demo to test the Factory pattern");
        console.log("\n🎯 Ready to test the complete Factory pattern implementation!");

    } catch (error) {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    }
}

// Error handling
main()
    .then(() => {
        console.log("\n✅ Script completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Script failed with error:");
        console.error(error);
        process.exit(1);
    });
