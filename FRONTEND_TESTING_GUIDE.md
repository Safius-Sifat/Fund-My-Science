# 🧪 Frontend Integration Testing Guide

## Current Setup Status ✅
- **Frontend**: Running on http://localhost:3000
- **Hardhat Node**: Running on http://localhost:8545
- **Contract Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Environment**: Properly configured

## 🦊 Step 1: MetaMask Setup

### Add Localhost Network to MetaMask:
1. Open MetaMask browser extension
2. Click network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" or "Custom RPC"
4. Enter these details:
   - **Network Name**: Hardhat Local
   - **New RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: (leave empty)
5. Click "Save"

### Import Test Account:
1. In MetaMask, click account icon → "Import Account"
2. Select "Private Key"
3. Use this Hardhat test account private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. This will import the account: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
5. You should see 10,000 ETH balance

## 🌐 Step 2: Frontend Testing

### Test 1: Wallet Connection
1. Go to http://localhost:3000
2. Look for "Connect Wallet" button
3. Click it and connect MetaMask
4. Verify:
   - ✅ Wallet address displays correctly
   - ✅ Network shows as "Hardhat Local" or "localhost"
   - ✅ Balance shows 10,000 ETH

### Test 2: Navigation Components
1. Check if blockchain status indicator shows:
   - ✅ Green dot indicating connection
   - ✅ "Blockchain connected" text
2. Look for wallet connection component in navigation

### Test 3: Project Creation (If Available)
1. Navigate to "Create Project" or similar page
2. Try creating a project with these test values:
   - **Title**: "Frontend Test Project"
   - **Description**: "Testing blockchain integration"
   - **Funding Goal**: 2.0 ETH
   - **Milestones**: Add 2-3 milestones totaling 2.0 ETH
3. Submit the form
4. Check MetaMask for transaction approval
5. Verify project creation succeeds

### Test 4: Project Listing
1. Go to projects page
2. Verify the test project appears
3. Check project details display correctly

## 🔧 Step 3: Developer Console Testing

Open browser dev tools (F12) and check:

### Web3 Context Status:
```javascript
// In browser console, check if Web3Context is working:
console.log("Checking Web3 status...");

// You should see contract initialization logs
// Look for: "📜 Contract initialized: 0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

### Network Information:
```javascript
// Check if MetaMask is connected to the right network
window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
  console.log('Chain ID:', parseInt(chainId, 16)); // Should be 31337
});

window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
  console.log('Connected account:', accounts[0]);
});
```

## 🚨 Common Issues & Solutions

### Issue 1: "Wrong Network" Warning
**Solution**: Make sure MetaMask is on "Hardhat Local" network (Chain ID 31337)

### Issue 2: Contract Not Found
**Solution**: 
- Verify contract address in .env.local matches deployment
- Restart frontend: `npm run dev`

### Issue 3: Transaction Fails
**Solution**:
- Reset MetaMask account: Settings → Advanced → Reset Account
- Make sure Hardhat node is running
- Check account has sufficient ETH

### Issue 4: Connection Issues
**Solution**:
- Refresh page and reconnect wallet
- Check MetaMask is unlocked
- Try different browser/incognito mode

## 📊 Testing Checklist

### Basic Functionality:
- [ ] MetaMask connects successfully
- [ ] Correct network detection (localhost/31337)
- [ ] Wallet address displays
- [ ] ETH balance shows (10,000 ETH)
- [ ] Blockchain status indicator works

### Contract Interaction:
- [ ] Can create projects
- [ ] Transaction prompts appear in MetaMask
- [ ] Transactions confirm on blockchain
- [ ] Project data displays correctly
- [ ] Error handling works (try invalid inputs)

### UI/UX:
- [ ] Loading states during transactions
- [ ] Success/error messages
- [ ] Responsive design works
- [ ] Navigation between pages

## 🎯 Advanced Testing (Optional)

### Multiple Accounts:
1. Import second test account:
   ```
   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   ```
2. Test switching between accounts
3. Test investments from different accounts

### Investment Testing:
1. Create a project with Account 1
2. Switch to Account 2 in MetaMask
3. Try investing in the project
4. Verify investment appears correctly

### Error Scenarios:
1. Try investing 0 ETH (should fail)
2. Try accessing non-existent project (should handle gracefully)
3. Try creating project with invalid milestones

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check MetaMask for pending transactions
3. Verify Hardhat node is still running
4. Check that contract address matches in .env.local

Ready to start testing! 🚀
