// 🧪 Frontend Web3 Testing Script
// Paste this in browser console to test Web3 integration

console.log("🔍 Starting Web3 Integration Test...");

// Test 1: Check if Web3 is available
if (typeof window.ethereum !== 'undefined') {
    console.log("✅ MetaMask detected!");
} else {
    console.error("❌ MetaMask not found! Please install MetaMask.");
}

// Test 2: Check network
async function checkNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdDecimal = parseInt(chainId, 16);
        console.log(`🌐 Current Chain ID: ${chainIdDecimal}`);

        if (chainIdDecimal === 31337) {
            console.log("✅ Connected to Hardhat localhost!");
        } else {
            console.warn("⚠️ Not on Hardhat network. Please switch to localhost:8545");
        }
    } catch (error) {
        console.error("❌ Failed to check network:", error);
    }
}

// Test 3: Check accounts
async function checkAccounts() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            console.log("✅ Wallet connected:", accounts[0]);

            // Check balance
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
            });
            const balanceEth = parseInt(balance, 16) / 1e18;
            console.log(`💰 Balance: ${balanceEth} ETH`);
        } else {
            console.warn("⚠️ No accounts connected. Please connect MetaMask.");
        }
    } catch (error) {
        console.error("❌ Failed to check accounts:", error);
    }
}

// Test 4: Check if contract address is available
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
console.log(`📜 Expected Contract Address: ${contractAddress}`);

// Test 5: Try to get contract code
async function checkContract() {
    try {
        const code = await window.ethereum.request({
            method: 'eth_getCode',
            params: [contractAddress, 'latest']
        });

        if (code && code !== '0x') {
            console.log("✅ Contract deployed and found!");
            console.log(`📏 Contract code length: ${code.length} characters`);
        } else {
            console.error("❌ Contract not found at address!");
        }
    } catch (error) {
        console.error("❌ Failed to check contract:", error);
    }
}

// Run all tests
async function runAllTests() {
    console.log("🚀 Running Web3 integration tests...");
    await checkNetwork();
    await checkAccounts();
    await checkContract();
    console.log("✅ Web3 integration test completed!");
}

// Export functions for manual testing
window.web3Test = {
    runAllTests,
    checkNetwork,
    checkAccounts,
    checkContract
};

console.log("💡 Available commands:");
console.log("- web3Test.runAllTests() - Run all tests");
console.log("- web3Test.checkNetwork() - Check network");
console.log("- web3Test.checkAccounts() - Check accounts");
console.log("- web3Test.checkContract() - Check contract");

// Auto-run tests
runAllTests();
