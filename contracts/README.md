# FundMyScience Smart Contracts

This directory contains the smart contracts and deployment scripts for the FundMyScience decentralized research funding platform.

## 📁 Structure

```
contracts/
├── FundMyScience.sol          # Main smart contract
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies and scripts
├── .env.example              # Environment variables template
├── scripts/
│   ├── deploy.js             # Deployment script
│   ├── verify-deployment.js  # Contract verification script
│   └── create-test-project.js # Test project creation
└── test/
    └── FundMyScience.test.js # Comprehensive test suite
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Start Local Network

```bash
npm run node
```

### 6. Deploy to Local Network

```bash
npm run deploy:localhost
```

## 📋 Available Scripts

- `npm run compile` - Compile smart contracts
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:gas` - Run tests with gas reporting
- `npm run deploy:localhost` - Deploy to local Hardhat network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run deploy:mainnet` - Deploy to Ethereum mainnet
- `npm run verify:sepolia` - Verify contract on Sepolia
- `npm run verify:mainnet` - Verify contract on Mainnet
- `npm run node` - Start local Hardhat network
- `npm run clean` - Clean compilation artifacts

## 🌐 Networks

### Local Development
- **Network**: Hardhat Local
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: Set in SEPOLIA_RPC_URL environment variable
- **Faucet**: [Sepolia Faucet](https://sepoliafaucet.com/)

### Mainnet
- **Chain ID**: 1
- **RPC URL**: Set in MAINNET_RPC_URL environment variable

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Required for testnet/mainnet deployment
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional
PLATFORM_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
REPORT_GAS=true
```

### Contract Configuration

- **Platform Fee**: 2.5% (250 basis points)
- **Solidity Version**: 0.8.19
- **OpenZeppelin Version**: 4.9.3

## 🧪 Testing

The test suite includes comprehensive tests for:

- ✅ Contract deployment
- ✅ Project creation and validation
- ✅ Investment handling
- ✅ Milestone management
- ✅ Administrative functions
- ✅ Access controls
- ✅ Gas usage optimization

Run tests with:

```bash
# Basic tests
npm test

# With gas reporting
npm run test:gas

# With coverage
npm run test:coverage
```

## 🚀 Deployment

### Local Deployment

1. Start local network:
```bash
npm run node
```

2. Deploy contract:
```bash
npm run deploy:localhost
```

3. Verify deployment:
```bash
node scripts/verify-deployment.js <CONTRACT_ADDRESS>
```

4. Create test project:
```bash
node scripts/create-test-project.js <CONTRACT_ADDRESS>
```

### Testnet Deployment

1. Setup environment variables in `.env`
2. Fund your deployment account with testnet ETH
3. Deploy:
```bash
npm run deploy:sepolia
```

4. Verify on Etherscan:
```bash
npm run verify:sepolia <CONTRACT_ADDRESS> <PLATFORM_WALLET_ADDRESS>
```

### Mainnet Deployment

⚠️ **CAUTION**: Mainnet deployment requires real ETH and should be done carefully.

1. Double-check all configurations
2. Ensure sufficient ETH for deployment
3. Deploy:
```bash
npm run deploy:mainnet
```

4. Verify on Etherscan:
```bash
npm run verify:mainnet <CONTRACT_ADDRESS> <PLATFORM_WALLET_ADDRESS>
```

## 📊 Contract Features

### Project Management
- Create research projects with milestone-based funding
- IPFS integration for project metadata
- Flexible milestone configuration
- Project status tracking

### Investment System
- Direct ETH investments
- Transparent fund tracking
- Investor protection mechanisms
- Investment history

### Milestone System
- Evidence-based milestone completion
- Admin approval process
- Automatic fund release
- Time-based tracking

### Administrative Controls
- Platform fee management (max 10%)
- Contract pause/unpause functionality
- Platform wallet management
- Owner-only functions

### Security Features
- ReentrancyGuard protection
- Access control mechanisms
- Pausable functionality
- Input validation

## 🔍 Verification

After deployment, verify your contract works correctly:

```bash
# Check contract status
node scripts/verify-deployment.js <CONTRACT_ADDRESS>

# Create a test project
node scripts/create-test-project.js <CONTRACT_ADDRESS>
```

## 📚 Integration

To integrate with your frontend:

1. Copy the contract address from deployment
2. Update your environment variables:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x...
```

3. Use the contract ABI from `artifacts/contracts/FundMyScience.sol/FundMyScience.json`

## 🐛 Troubleshooting

### Common Issues

1. **"insufficient funds for intrinsic transaction cost"**
   - Ensure your account has enough ETH for gas fees

2. **"nonce too high"**
   - Reset your MetaMask account or use `--reset` flag

3. **"contract not deployed"**
   - Verify the contract address and network

4. **"execution reverted"**
   - Check function parameters and contract state

### Getting Help

1. Check the test suite for usage examples
2. Review Hardhat documentation
3. Check OpenZeppelin documentation for inherited contracts

## 📄 License

MIT License - see LICENSE file for details.
