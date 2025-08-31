const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    // Get contract address from deployment file or environment
    let contractAddress = process.argv[2] || process.env.CONTRACT_ADDRESS;

    // For localhost, use the standard Hardhat deployment address
    if (hre.network.name === "localhost" && !contractAddress) {
        contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        console.log("📍 Using localhost contract address:", contractAddress);
    }

    if (!contractAddress) {
        console.error("❌ Please provide contract address as argument or set CONTRACT_ADDRESS environment variable");
        process.exit(1);
    } console.log("🔍 Checking contract at:", contractAddress);
    console.log("📡 Network:", hre.network.name);
    console.log("👤 Caller:", deployer.address);

    try {
        // Get contract instance
        const FundMyScience = await ethers.getContractFactory("FundMyScience");
        const contract = FundMyScience.attach(contractAddress);

        // Check basic contract state
        console.log("\n📊 Contract Status:");
        console.log("═".repeat(40));

        const platformWallet = await contract.platformWallet();
        const platformFee = await contract.platformFeePercentage();
        const nextProjectId = await contract.nextProjectId();
        const isPaused = await contract.paused();
        const owner = await contract.owner();

        console.log(`Platform Wallet: ${platformWallet}`);
        console.log(`Platform Fee: ${platformFee.toString()} bps (${(Number(platformFee) / 100).toFixed(2)}%)`);
        console.log(`Next Project ID: ${nextProjectId.toString()}`);
        console.log(`Contract Paused: ${isPaused}`);
        console.log(`Contract Owner: ${owner}`);

        // Get contract balance
        const balance = await deployer.provider.getBalance(contractAddress);
        console.log(`Contract Balance: ${ethers.formatEther(balance)} ETH`);

        // If there are projects, show some stats
        const currentProjectId = Number(nextProjectId) - 1;
        if (currentProjectId > 0) {
            console.log("\n📈 Project Statistics:");
            console.log("═".repeat(40));

            let totalFundsRaised = BigInt(0);
            let activeProjects = 0;

            for (let i = 1; i <= currentProjectId; i++) {
                try {
                    const project = await contract.getProject(i);
                    const fundsRaised = project[5]; // fundsRaised is at index 5
                    const status = project[7]; // status is at index 7

                    totalFundsRaised += fundsRaised;
                    if (status === 1) activeProjects++; // Active status

                    console.log(`Project ${i}: ${ethers.formatEther(fundsRaised)} ETH raised, Status: ${status}`);
                } catch (error) {
                    console.log(`Project ${i}: Error fetching data`);
                }
            }

            console.log("─".repeat(40));
            console.log(`Total Projects: ${currentProjectId}`);
            console.log(`Active Projects: ${activeProjects}`);
            console.log(`Total Funds Raised: ${ethers.formatEther(totalFundsRaised)} ETH`);
        } else {
            console.log("\n📈 No projects created yet");
        }

        console.log("\n✅ Contract verification completed!");

    } catch (error) {
        console.error("❌ Error verifying contract:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
