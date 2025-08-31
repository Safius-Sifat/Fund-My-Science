const { ethers } = require("hardhat");

async function main() {
    console.log("💰 Checking investments on blockchain...");

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const FundMyScience = await ethers.getContractFactory("FundMyScience");
    const contract = FundMyScience.attach(contractAddress);

    // Check project 3 (bachao) investments
    const projectId = 4;
    console.log(`\n🔍 Checking investments for Project ${projectId} (bachao):`);

    try {
        const investments = await contract.getProjectInvestments(projectId);
        console.log(`📊 Found ${investments.length} investments:`);

        investments.forEach((investment, index) => {
            console.log(`\n  Investment ${index + 1}:`);
            console.log("    - Investor:", investment[0]);
            console.log("    - Project ID:", investment[1].toString());
            console.log("    - Amount:", ethers.formatEther(investment[2]), "ETH");
            console.log("    - Timestamp:", new Date(Number(investment[3]) * 1000).toISOString());
        });

        // Check recent investment events
        console.log("\n🎯 Checking InvestmentMade events...");
        const filter = contract.filters.InvestmentMade();
        const events = await contract.queryFilter(filter);

        console.log(`📅 Found ${events.length} investment events:`);
        events.forEach((event, index) => {
            console.log(`\n  Event ${index + 1}:`);
            console.log("    - Project ID:", event.args[0].toString());
            console.log("    - Investor:", event.args[1]);
            console.log("    - Amount:", ethers.formatEther(event.args[2]), "ETH");
            console.log("    - Transaction:", event.transactionHash);
        });

    } catch (err) {
        console.error("❌ Error checking investments:", err.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
