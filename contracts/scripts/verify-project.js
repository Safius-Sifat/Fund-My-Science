const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying project deployment on blockchain...");

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    console.log("📍 Contract address:", contractAddress);

    try {
        // Get contract instance
        const FundMyScience = await ethers.getContractFactory("FundMyScience");
        const contract = FundMyScience.attach(contractAddress);

        // Check if contract exists
        const code = await ethers.provider.getCode(contractAddress);
        console.log("📜 Contract code exists:", code !== "0x");

        // Get the latest project ID to see what projects exist
        try {
            const nextProjectId = await contract.nextProjectId();
            console.log("🔢 Next project ID:", nextProjectId.toString());
            console.log("📊 Total projects created:", (nextProjectId - 1n).toString());

            // Check the most recent projects
            for (let i = 1; i < nextProjectId; i++) {
                try {
                    const project = await contract.getProject(i);
                    console.log(`\n📋 Project ${i}:`);
                    console.log("  - ID:", project[0].toString());
                    console.log("  - Researcher:", project[1]);
                    console.log("  - Title:", project[2]);
                    console.log("  - IPFS Hash:", project[3]);
                    console.log("  - Funding Goal:", ethers.formatEther(project[4]), "ETH");
                    console.log("  - Funds Raised:", ethers.formatEther(project[5]), "ETH");
                    console.log("  - Milestone Count:", project[6].toString());
                    console.log("  - Status:", project[7]); // 0=Draft, 1=Active, 2=Completed, 3=Cancelled
                    console.log("  - Created At:", new Date(Number(project[8]) * 1000).toISOString());
                } catch (err) {
                    console.log(`❌ Error fetching project ${i}:`, err.message);
                }
            }
        } catch (err) {
            console.error("❌ Error getting project count:", err.message);
        }

        // Check recent events
        console.log("\n🎯 Checking recent ProjectCreated events...");
        try {
            const filter = contract.filters.ProjectCreated();
            const events = await contract.queryFilter(filter, -10); // Last 10 blocks

            console.log(`📅 Found ${events.length} ProjectCreated events:`);
            events.forEach((event, index) => {
                console.log(`\n  Event ${index + 1}:`);
                console.log("    - Project ID:", event.args[0].toString());
                console.log("    - Researcher:", event.args[1]);
                console.log("    - Title:", event.args[2]);
                console.log("    - Funding Goal:", ethers.formatEther(event.args[3]), "ETH");
                console.log("    - Block:", event.blockNumber);
                console.log("    - Transaction:", event.transactionHash);
            });
        } catch (err) {
            console.error("❌ Error fetching events:", err.message);
        }

    } catch (error) {
        console.error("❌ Error verifying project:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
