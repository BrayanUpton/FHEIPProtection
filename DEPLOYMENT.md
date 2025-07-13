# Deployment Guide

Complete guide for deploying the Private IP Protection Platform smart contracts.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Network Configuration](#network-configuration)
- [Deployment Process](#deployment-process)
- [Contract Verification](#contract-verification)
- [Post-Deployment](#post-deployment)
- [Deployment Information](#deployment-information)

## Prerequisites

### Required Software

- Node.js >= 16.0.0
- npm or yarn
- Git

### Required Accounts

1. **Ethereum Wallet**
   - Private key with sufficient ETH for deployment
   - Recommended: Use a dedicated deployment wallet

2. **Etherscan Account**
   - API key for contract verification
   - Get it at: https://etherscan.io/myapikey

3. **RPC Provider** (optional)
   - Alchemy, Infura, or QuickNode account
   - Free tier is sufficient for testing

## Network Configuration

### Supported Networks

#### 1. Local Hardhat Network (Development)

```javascript
{
  name: "hardhat",
  chainId: 31337,
  url: "http://127.0.0.1:8545"
}
```

**Use for**: Local development and testing

#### 2. Sepolia Testnet

```javascript
{
  name: "sepolia",
  chainId: 11155111,
  url: "https://rpc.sepolia.org"
}
```

**Use for**: Public testnet deployment and verification
**Faucet**: https://sepoliafaucet.com/

#### 3. Zama Sepolia (FHE-enabled)

```javascript
{
  name: "zamaSepolia",
  chainId: 8009,
  url: "https://devnet.zama.ai"
}
```

**Use for**: FHE-specific deployment
**Faucet**: Contact Zama for testnet tokens

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your `.env` file:
```env
# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ZAMA_SEPOLIA_RPC_URL=https://devnet.zama.ai

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Optional: Gas reporting
REPORT_GAS=false
```

## Deployment Process

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 3: Run Tests (Recommended)

```bash
npm test
```

Ensure all tests pass before deployment.

### Step 4: Deploy to Network

#### Local Deployment

Terminal 1 - Start local node:
```bash
npm run node
```

Terminal 2 - Deploy:
```bash
npm run deploy:local
```

#### Sepolia Testnet Deployment

```bash
npm run deploy
```

### Deployment Script Output

The deployment script will display:

```
Starting deployment process...

Network: sepolia
Chain ID: 11155111

Deploying contracts with account: 0x...
Account balance: 1.5 ETH

Deploying PrivateIPProtection contract...
PrivateIPProtection deployed to: 0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B
Deployment transaction hash: 0x...
Gas used: 2500000
Block number: 5000000

Contract Configuration:
Patent Office Address: 0x...
Application Fee: 0.1 ETH
Review Period: 30 days

Deployment info saved to: deployments/sepolia-0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B.json

View on Etherscan: https://sepolia.etherscan.io/address/0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B

✅ Deployment completed successfully!
```

### Deployment Artifacts

The deployment creates a JSON file in `deployments/` with:

```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B",
  "deployer": "0x...",
  "deploymentTime": "2024-10-26T10:30:00.000Z",
  "transactionHash": "0x...",
  "blockNumber": 5000000,
  "configuration": {
    "patentOffice": "0x...",
    "applicationFee": "0.1",
    "reviewPeriod": "30 days"
  }
}
```

## Contract Verification

### Step 1: Wait for Deployment Confirmation

Wait for 5-10 block confirmations before verifying.

### Step 2: Verify on Etherscan

```bash
npm run verify
```

Expected output:
```
Starting contract verification process...

Network: sepolia
Chain ID: 11155111

Contract address: 0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B

Verifying contract on Etherscan...
This may take a few moments...

✅ Contract verified successfully!
View verified contract: https://sepolia.etherscan.io/address/0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B#code
```

### Manual Verification

If automatic verification fails:

1. Go to Etherscan contract page
2. Click "Contract" tab → "Verify and Publish"
3. Fill in:
   - Compiler: v0.8.24
   - Optimization: Yes (200 runs)
   - Constructor Arguments: None
4. Paste contract code
5. Submit for verification

## Post-Deployment

### Step 1: Update Environment

Add contract address to `.env`:
```env
CONTRACT_ADDRESS=0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B
```

### Step 2: Test Contract Interaction

```bash
npm run interact
```

This will display contract information and confirm deployment.

### Step 3: Run Simulation (Optional)

Test the complete workflow:
```bash
npm run simulate
```

### Step 4: Update Frontend Configuration

If you have a frontend, update the contract address:

```javascript
// In your frontend config
const CONTRACT_ADDRESS = "0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B";
const CONTRACT_ABI = [...]; // Import from artifacts
```

## Deployment Information

### Current Deployment

**Network**: Zama Sepolia Testnet

**Contract Details**:
- Address: `0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B`
- Deployer: Patent Office address
- Block: Deployment block number
- Transaction: Deployment transaction hash

**Configuration**:
- Application Fee: 0.1 ETH
- Review Period: 30 days (2,592,000 seconds)
- Initial Application Count: 0

**Etherscan Link**:
https://sepolia.etherscan.io/address/0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B

### Estimated Deployment Costs

| Network | Estimated Gas | Estimated Cost (ETH) | USD (at $2000/ETH) |
|---------|---------------|----------------------|--------------------|
| Sepolia | ~2,500,000    | ~0.025               | ~$50               |
| Mainnet | ~2,500,000    | ~0.05                | ~$100              |

*Note: Actual costs vary based on gas prices*

### Gas Usage Breakdown

- Contract Deployment: ~2,500,000 gas
- Application Submission: ~200,000 gas
- Examiner Authorization: ~100,000 gas
- Application Assignment: ~150,000 gas
- Review Decision: ~180,000 gas

## Troubleshooting

### Deployment Fails

**Error**: "insufficient funds for gas * price + value"
- **Solution**: Ensure wallet has enough ETH (recommended: 0.1 ETH for testnet)

**Error**: "nonce too low"
- **Solution**: Reset MetaMask nonce or wait for pending transactions

### Verification Fails

**Error**: "Already Verified"
- **Solution**: Contract is already verified, no action needed

**Error**: "Invalid API key"
- **Solution**: Check ETHERSCAN_API_KEY in .env file

### RPC Issues

**Error**: "network does not support ENS"
- **Solution**: Use direct RPC URL instead of ENS names

**Error**: "timeout exceeded"
- **Solution**: Try a different RPC provider or increase timeout

## Best Practices

### Security

1. **Never commit private keys**
   - Always use .env files
   - Add .env to .gitignore

2. **Use dedicated deployment wallet**
   - Separate from main wallet
   - Only fund with necessary amount

3. **Verify contract source**
   - Always verify on Etherscan
   - Enables public audit

### Deployment Checklist

- [ ] All tests passing
- [ ] Contract compiled successfully
- [ ] Environment variables configured
- [ ] Wallet funded with sufficient ETH
- [ ] Network configuration correct
- [ ] Deployment script reviewed
- [ ] Contract deployed successfully
- [ ] Deployment artifacts saved
- [ ] Contract verified on Etherscan
- [ ] Contract address updated in .env
- [ ] Contract interaction tested
- [ ] Documentation updated

## Additional Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **Etherscan API**: https://docs.etherscan.io/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Zama Documentation**: https://docs.zama.ai/
- **Gas Price Tracker**: https://etherscan.io/gastracker

## Support

For deployment issues:
1. Check troubleshooting section above
2. Review Hardhat logs for detailed errors
3. Open an issue on GitHub
4. Contact project maintainers

---

Last updated: 2024-10-26
