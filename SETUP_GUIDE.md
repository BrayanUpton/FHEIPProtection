# Setup Guide - Private IP Protection Platform

Quick start guide for developers to set up and run the Private IP Protection Platform.

## Quick Start

### 1. Prerequisites Check

Ensure you have:
- Node.js >= 16.0.0 (`node --version`)
- npm or yarn (`npm --version`)
- Git (`git --version`)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd private-ip-protection-platform

# Install dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

Required variables:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 4. Compile & Test

```bash
# Compile smart contracts
npm run compile

# Run test suite
npm test

# Check code coverage
npm run test:coverage
```

### 5. Deploy

#### Local Development
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local

# Terminal 3: Run simulation
npm run simulate
```

#### Sepolia Testnet
```bash
# Deploy to Sepolia
npm run deploy

# Verify on Etherscan
npm run verify

# Interact with contract
npm run interact
```

## Project Structure

```
private-ip-protection-platform/
├── contracts/                      # Smart contracts
│   └── PrivateIPProtection.sol
├── scripts/                        # Deployment & interaction scripts
│   ├── deploy.js                   # Main deployment script
│   ├── verify.js                   # Etherscan verification
│   ├── interact.js                 # Contract interaction utilities
│   └── simulate.js                 # Workflow simulation
├── test/                           # Test suite
│   └── PrivateIPProtection.test.js
├── public/                         # Frontend files
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── vercel.json
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment template
├── README.md                       # Main documentation
├── DEPLOYMENT.md                   # Deployment guide
├── SETUP_GUIDE.md                  # This file
└── LICENSE                         # MIT License
```

## Available Scripts

### Development
- `npm run compile` - Compile smart contracts
- `npm run clean` - Clean artifacts and cache
- `npm run node` - Start local Hardhat node

### Testing
- `npm test` - Run all tests
- `npm run test:coverage` - Generate coverage report
- `REPORT_GAS=true npm test` - Run tests with gas reporting

### Deployment
- `npm run deploy:local` - Deploy to local network
- `npm run deploy` - Deploy to Sepolia testnet
- `npm run verify` - Verify contract on Etherscan

### Interaction
- `npm run interact` - Interact with deployed contract
- `npm run simulate` - Run complete workflow simulation

### Code Quality
- `npm run lint` - Lint Solidity files
- `npm run lint:fix` - Lint and auto-fix
- `npm run format` - Format code
- `npm run format:check` - Check code formatting

## Development Workflow

### 1. Local Development

```bash
# Start local node
npm run node

# In another terminal, deploy
npm run deploy:local

# Run simulation to test
npm run simulate
```

### 2. Writing Tests

Add tests in `test/` directory:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YourTest", function () {
  it("Should do something", async function () {
    // Your test code
  });
});
```

Run tests:
```bash
npm test
```

### 3. Deploying to Testnet

```bash
# Ensure .env is configured
# Deploy
npm run deploy

# Verify
npm run verify

# Test interaction
npm run interact
```

## Configuration Files

### hardhat.config.js
Main Hardhat configuration with:
- Solidity compiler settings
- Network configurations
- Plugin settings
- Gas reporter settings

### .env
Environment variables (never commit this file):
- Private keys
- RPC URLs
- API keys
- Configuration flags

### .prettierrc.json
Code formatting rules for:
- JavaScript files
- Solidity files

### .solhint.json
Solidity linting rules

## Troubleshooting

### "Cannot find module 'hardhat'"
```bash
npm install
```

### "insufficient funds"
- Fund your wallet with testnet ETH
- Sepolia faucet: https://sepoliafaucet.com/

### "nonce too low"
- Reset MetaMask account nonce
- Or wait for pending transactions

### Compilation errors
```bash
npm run clean
npm run compile
```

### Test failures
- Check network is running (for local tests)
- Ensure contracts are compiled
- Check .env configuration

## Getting Testnet ETH

### Sepolia
1. Visit https://sepoliafaucet.com/
2. Enter your wallet address
3. Complete captcha
4. Wait for ETH (usually < 1 minute)

### Zama Sepolia
Contact Zama team for testnet tokens

## Next Steps

1. **Read Documentation**
   - README.md - Project overview
   - DEPLOYMENT.md - Deployment guide
   - Contract comments - Implementation details

2. **Explore Code**
   - Review smart contract code
   - Check test cases
   - Examine deployment scripts

3. **Deploy Your Own**
   - Configure .env
   - Deploy to testnet
   - Verify on Etherscan

4. **Build Frontend**
   - Use public/ directory as template
   - Connect to your deployed contract
   - Customize UI/UX

## Useful Commands

```bash
# Check contract size
npm run compile && du -h artifacts/contracts/PrivateIPProtection.sol/PrivateIPProtection.json

# Check gas usage
REPORT_GAS=true npm test

# Format all files
npm run format

# Lint all Solidity files
npm run lint

# Clean and recompile
npm run clean && npm run compile

# View deployment info
cat deployments/*.json
```

## Support & Resources

### Documentation
- [Hardhat Docs](https://hardhat.org/docs)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Zama FHE Docs](https://docs.zama.ai/)

### Community
- GitHub Issues - Report bugs
- GitHub Discussions - Ask questions
- Pull Requests - Contribute

### Tools
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [Hardhat VSCode Extension](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity)

## Tips for Success

1. **Always test locally first**
   - Use `npm run node` for local testing
   - Run full test suite before deployment

2. **Keep private keys secure**
   - Never commit .env files
   - Use dedicated deployment wallets
   - Backup keys securely

3. **Verify contracts**
   - Always verify on Etherscan
   - Enables public audit
   - Builds trust

4. **Document changes**
   - Update README for new features
   - Add tests for new functionality
   - Comment complex code

5. **Use version control**
   - Commit frequently
   - Write clear commit messages
   - Use branches for features

## Common Tasks

### Add New Function
1. Edit contract in `contracts/`
2. Add tests in `test/`
3. Compile: `npm run compile`
4. Test: `npm test`
5. Deploy: `npm run deploy`

### Update Configuration
1. Edit `hardhat.config.js`
2. Update `.env` if needed
3. Test changes locally
4. Deploy to testnet

### Generate Coverage Report
```bash
npm run test:coverage
# View report in coverage/index.html
```

### Check Contract Security
```bash
npm run lint
# Review warnings
# Fix critical issues
```

## Checklist for Production

Before deploying to mainnet:

- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No critical security warnings
- [ ] Contract verified on testnet
- [ ] Gas optimizations reviewed
- [ ] Access controls tested
- [ ] Emergency procedures documented
- [ ] Multi-sig wallet configured
- [ ] Audit completed (if applicable)
- [ ] Documentation updated

---

**Need Help?** Open an issue on GitHub or check the documentation.

**Ready to Deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
