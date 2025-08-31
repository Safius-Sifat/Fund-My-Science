const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FundMyScience", function () {
    // Fixture to deploy the contract
    async function deployFundMyScienceFixture() {
        const [owner, researcher, investor1, investor2, platformWallet] = await ethers.getSigners();

        const FundMyScience = await ethers.getContractFactory("FundMyScience");
        const fundMyScience = await FundMyScience.deploy(platformWallet.address);

        return { fundMyScience, owner, researcher, investor1, investor2, platformWallet };
    }

    describe("Deployment", function () {
        it("Should set the right platform wallet", async function () {
            const { fundMyScience, platformWallet } = await loadFixture(deployFundMyScienceFixture);
            expect(await fundMyScience.platformWallet()).to.equal(platformWallet.address);
        });

        it("Should set the right platform fee percentage", async function () {
            const { fundMyScience } = await loadFixture(deployFundMyScienceFixture);
            expect(await fundMyScience.platformFeePercentage()).to.equal(250); // 2.5%
        });

        it("Should start with project ID 1", async function () {
            const { fundMyScience } = await loadFixture(deployFundMyScienceFixture);
            expect(await fundMyScience.nextProjectId()).to.equal(1);
        });

        it("Should set the deployer as owner", async function () {
            const { fundMyScience, owner } = await loadFixture(deployFundMyScienceFixture);
            expect(await fundMyScience.owner()).to.equal(owner.address);
        });
    });

    describe("Project Creation", function () {
        it("Should create a project successfully", async function () {
            const { fundMyScience, researcher } = await loadFixture(deployFundMyScienceFixture);

            const title = "AI Research Project";
            const ipfsHash = "QmTest123...";
            const fundingGoal = ethers.parseEther("10");
            const milestoneDescriptions = ["Research Phase", "Development Phase", "Testing Phase"];
            const milestoneFunding = [
                ethers.parseEther("3"),
                ethers.parseEther("4"),
                ethers.parseEther("3")
            ];
            const milestoneTargets = [
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
                Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days
                Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60  // 90 days
            ];

            await expect(
                fundMyScience.connect(researcher).createProject(
                    title,
                    ipfsHash,
                    fundingGoal,
                    milestoneDescriptions,
                    milestoneFunding,
                    milestoneTargets
                )
            ).to.emit(fundMyScience, "ProjectCreated")
                .withArgs(1, researcher.address, title, fundingGoal);

            // Verify project details
            const project = await fundMyScience.getProject(1);
            expect(project[0]).to.equal(1); // id
            expect(project[1]).to.equal(researcher.address); // researcher
            expect(project[2]).to.equal(title); // title
            expect(project[3]).to.equal(ipfsHash); // ipfsHash
            expect(project[4]).to.equal(fundingGoal); // fundingGoal
            expect(project[5]).to.equal(0); // fundsRaised
            expect(project[6]).to.equal(3); // milestoneCount
            expect(project[7]).to.equal(1); // status (Active)
        });

        it("Should fail if milestone funding doesn't match total goal", async function () {
            const { fundMyScience, researcher } = await loadFixture(deployFundMyScienceFixture);

            const title = "AI Research Project";
            const ipfsHash = "QmTest123...";
            const fundingGoal = ethers.parseEther("10");
            const milestoneDescriptions = ["Research Phase"];
            const milestoneFunding = [ethers.parseEther("5")]; // Only 5 ETH, but goal is 10 ETH
            const milestoneTargets = [Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60];

            await expect(
                fundMyScience.connect(researcher).createProject(
                    title,
                    ipfsHash,
                    fundingGoal,
                    milestoneDescriptions,
                    milestoneFunding,
                    milestoneTargets
                )
            ).to.be.revertedWith("Milestone funding must equal project goal");
        });

        it("Should fail if arrays have different lengths", async function () {
            const { fundMyScience, researcher } = await loadFixture(deployFundMyScienceFixture);

            const title = "AI Research Project";
            const ipfsHash = "QmTest123...";
            const fundingGoal = ethers.parseEther("10");
            const milestoneDescriptions = ["Research Phase", "Development Phase"];
            const milestoneFunding = [ethers.parseEther("10")]; // Different length
            const milestoneTargets = [Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60];

            await expect(
                fundMyScience.connect(researcher).createProject(
                    title,
                    ipfsHash,
                    fundingGoal,
                    milestoneDescriptions,
                    milestoneFunding,
                    milestoneTargets
                )
            ).to.be.revertedWith("Milestone arrays length mismatch");
        });
    });

    describe("Investments", function () {
        async function createProjectFixture() {
            const { fundMyScience, owner, researcher, investor1, investor2, platformWallet } = await loadFixture(deployFundMyScienceFixture);

            // Create a project
            const title = "AI Research Project";
            const ipfsHash = "QmTest123...";
            const fundingGoal = ethers.parseEther("10");
            const milestoneDescriptions = ["Research Phase", "Development Phase", "Testing Phase"];
            const milestoneFunding = [
                ethers.parseEther("3"),
                ethers.parseEther("4"),
                ethers.parseEther("3")
            ];
            const milestoneTargets = [
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60,
                Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60
            ];

            await fundMyScience.connect(researcher).createProject(
                title,
                ipfsHash,
                fundingGoal,
                milestoneDescriptions,
                milestoneFunding,
                milestoneTargets
            );

            return { fundMyScience, owner, researcher, investor1, investor2, platformWallet };
        }

        it("Should allow investments in active projects", async function () {
            const { fundMyScience, investor1 } = await loadFixture(createProjectFixture);

            const investmentAmount = ethers.parseEther("2");

            await expect(
                fundMyScience.connect(investor1).investInProject(1, { value: investmentAmount })
            ).to.emit(fundMyScience, "InvestmentMade")
                .withArgs(1, investor1.address, investmentAmount);

            // Check project funds raised
            const project = await fundMyScience.getProject(1);
            expect(project[5]).to.equal(investmentAmount); // fundsRaised
        });

        it("Should not allow investments of 0", async function () {
            const { fundMyScience, investor1 } = await loadFixture(createProjectFixture);

            await expect(
                fundMyScience.connect(investor1).investInProject(1, { value: 0 })
            ).to.be.revertedWith("Investment amount must be greater than 0");
        });

        it("Should not allow investments in non-existent projects", async function () {
            const { fundMyScience, investor1 } = await loadFixture(createProjectFixture);

            await expect(
                fundMyScience.connect(investor1).investInProject(999, { value: ethers.parseEther("1") })
            ).to.be.revertedWith("Project does not exist");
        });
    });

    describe("Milestone Management", function () {
        async function createAndFundProjectFixture() {
            const fixture = await loadFixture(deployFundMyScienceFixture);
            const { fundMyScience, researcher, investor1 } = fixture;

            // Create a project
            const title = "AI Research Project";
            const ipfsHash = "QmTest123...";
            const fundingGoal = ethers.parseEther("10");
            const milestoneDescriptions = ["Research Phase", "Development Phase", "Testing Phase"];
            const milestoneFunding = [
                ethers.parseEther("3"),
                ethers.parseEther("4"),
                ethers.parseEther("3")
            ];
            const milestoneTargets = [
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60,
                Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60
            ];

            await fundMyScience.connect(researcher).createProject(
                title,
                ipfsHash,
                fundingGoal,
                milestoneDescriptions,
                milestoneFunding,
                milestoneTargets
            );

            // Fund the project
            await fundMyScience.connect(investor1).investInProject(1, { value: ethers.parseEther("10") });

            return { ...fixture, projectId: 1 };
        }

        it("Should allow researcher to submit milestone evidence", async function () {
            const { fundMyScience, researcher, projectId } = await loadFixture(createAndFundProjectFixture);

            const evidenceHash = "QmEvidence123...";

            await expect(
                fundMyScience.connect(researcher).submitMilestoneEvidence(projectId, 0, evidenceHash)
            ).to.emit(fundMyScience, "MilestoneCompleted")
                .withArgs(projectId, 0, evidenceHash);
        });

        it("Should not allow non-researcher to submit milestone evidence", async function () {
            const { fundMyScience, investor1, projectId } = await loadFixture(createAndFundProjectFixture);

            const evidenceHash = "QmEvidence123...";

            await expect(
                fundMyScience.connect(investor1).submitMilestoneEvidence(projectId, 0, evidenceHash)
            ).to.be.revertedWith("Only project researcher can call this");
        });

        it("Should allow owner to approve milestones", async function () {
            const { fundMyScience, owner, researcher, projectId } = await loadFixture(createAndFundProjectFixture);

            // Submit evidence first
            const evidenceHash = "QmEvidence123...";
            await fundMyScience.connect(researcher).submitMilestoneEvidence(projectId, 0, evidenceHash);

            // Approve milestone
            await expect(
                fundMyScience.connect(owner).approveMilestone(projectId, 0)
            ).to.emit(fundMyScience, "MilestoneApproved")
                .withArgs(projectId, 0, ethers.parseEther("3"));
        });
    });

    describe("Administrative Functions", function () {
        it("Should allow owner to pause and unpause", async function () {
            const { fundMyScience, owner } = await loadFixture(deployFundMyScienceFixture);

            await fundMyScience.connect(owner).pause();
            expect(await fundMyScience.paused()).to.be.true;

            await fundMyScience.connect(owner).unpause();
            expect(await fundMyScience.paused()).to.be.false;
        });

        it("Should allow owner to update platform fee", async function () {
            const { fundMyScience, owner } = await loadFixture(deployFundMyScienceFixture);

            await fundMyScience.connect(owner).updatePlatformFee(300); // 3%
            expect(await fundMyScience.platformFeePercentage()).to.equal(300);
        });

        it("Should not allow setting platform fee above 10%", async function () {
            const { fundMyScience, owner } = await loadFixture(deployFundMyScienceFixture);

            await expect(
                fundMyScience.connect(owner).updatePlatformFee(1001) // 10.01%
            ).to.be.revertedWith("Fee cannot exceed 10%");
        });

        it("Should allow owner to update platform wallet", async function () {
            const { fundMyScience, owner, investor1 } = await loadFixture(deployFundMyScienceFixture);

            await fundMyScience.connect(owner).updatePlatformWallet(investor1.address);
            expect(await fundMyScience.platformWallet()).to.equal(investor1.address);
        });
    });

    describe("Gas Usage", function () {
        it("Should report gas usage for project creation", async function () {
            const { fundMyScience, researcher } = await loadFixture(deployFundMyScienceFixture);

            const title = "AI Research Project";
            const ipfsHash = "QmTest123...";
            const fundingGoal = ethers.parseEther("10");
            const milestoneDescriptions = ["Research Phase"];
            const milestoneFunding = [ethers.parseEther("10")];
            const milestoneTargets = [Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60];

            const tx = await fundMyScience.connect(researcher).createProject(
                title,
                ipfsHash,
                fundingGoal,
                milestoneDescriptions,
                milestoneFunding,
                milestoneTargets
            );

            const receipt = await tx.wait();
            console.log(`Project creation gas used: ${receipt.gasUsed.toString()}`);
        });
    });
});
