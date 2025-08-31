const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("🧪 Creating test project...");
    console.log("📡 Network:", hre.network.name);
    console.log("👤 Deployer:", deployer.address);

    // Get contract address from deployment file or hardcoded for localhost
    let contractAddress = process.env.CONTRACT_ADDRESS;

    // For localhost, use the standard Hardhat deployment address
    if (hre.network.name === "localhost") {
        contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        console.log("📍 Using localhost contract address:", contractAddress);
    }

    if (!contractAddress) {
        console.error("❌ Contract address not found. Please set CONTRACT_ADDRESS environment variable or deploy to localhost");
        process.exit(1);
    }

    try {
        // Get contract instance
        const FundMyScience = await ethers.getContractFactory("FundMyScience");
        const contract = FundMyScience.attach(contractAddress);

        // Test project data
        const title = "Test AI Research Project";
        const ipfsHash = "QmTestHash123456789...";
        const fundingGoal = ethers.parseEther("5.0");
        const milestoneDescriptions = [
            "Research and Planning Phase",
            "Development and Implementation",
            "Testing and Documentation"
        ];
        const milestoneFunding = [
            ethers.parseEther("2.0"),
            ethers.parseEther("2.0"),
            ethers.parseEther("1.0")
        ];
        const milestoneTargets = [
            Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
            Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days
            Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)  // 90 days
        ];

        console.log("⏳ Creating project...");
        const tx = await contract.createProject(
            title,
            ipfsHash,
            fundingGoal,
            milestoneDescriptions,
            milestoneFunding,
            milestoneTargets
        );

        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();

        console.log("✅ Project created successfully!");
        console.log(`Transaction hash: ${receipt.hash}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);

        // Get the project ID from the event
        const projectCreatedEvent = receipt.logs.find(
            log => log.topics[0] === ethers.id("ProjectCreated(uint256,address,string,uint256)")
        );

        if (projectCreatedEvent) {
            const projectId = ethers.AbiCoder.defaultAbiCoder().decode(
                ["uint256"],
                projectCreatedEvent.topics[1]
            )[0];
            console.log(`Project ID: ${projectId.toString()}`);

            // Fetch and display project details
            console.log("\n📋 Project Details:");
            const project = await contract.getProject(projectId);
            console.log(`Title: ${project[2]}`);
            console.log(`Funding Goal: ${ethers.formatEther(project[4])} ETH`);
            console.log(`Milestone Count: ${project[6].toString()}`);

            // Fetch milestones
            const milestones = await contract.getProjectMilestones(projectId);
            console.log("\n🎯 Milestones:");
            milestones.forEach((milestone, index) => {
                console.log(`${index + 1}. ${milestone[2]} - ${ethers.formatEther(milestone[3])} ETH`);
            });
        }

        console.log("\n🎉 Test project creation completed!");

    } catch (error) {
        console.error("❌ Error creating test project:", error.message);
        if (error.data) {
            console.error("Error data:", error.data);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
