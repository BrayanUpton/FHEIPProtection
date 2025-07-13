# CI/CD Pipeline Documentation

Complete guide for Continuous Integration and Continuous Deployment workflows for the Private IP Protection Platform.

## Overview

This project uses GitHub Actions for automated testing, code quality checks, and deployment workflows. The CI/CD pipeline ensures code quality, security, and reliability before deployment.

## Workflows

### 1. Automated Tests (`test.yml`)

**Trigger Events**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Test Matrix**:
- **Node.js Versions**: 18.x, 20.x
- **Operating Systems**: Ubuntu Latest, Windows Latest
- **Total Configurations**: 4 (2 Node versions × 2 OS)

**Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js with npm caching
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run Solidity linter (Ubuntu only)
5. ✅ Check code formatting (Ubuntu only)
6. ✅ Compile smart contracts
7. ✅ Run test suite (67 tests)
8. ✅ Generate coverage report
9. ✅ Upload coverage to Codecov (Ubuntu 20.x only)

**File**: `.github/workflows/test.yml`

```yaml
name: Automated Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### 2. Code Quality Checks (`quality.yml`)

**Trigger Events**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Quality Checks**:
1. **Solidity Linting (Solhint)**
   - Checks code style
   - Enforces best practices
   - Validates naming conventions

2. **Code Formatting (Prettier)**
   - Ensures consistent formatting
   - Checks Solidity files
   - Verifies JavaScript/TypeScript files

3. **Contract Size Analysis**
   - Checks compiled contract sizes
   - Warns if contracts exceed 24KB limit
   - Reports size in KB for each contract

4. **Security Analysis (Slither)**
   - Static analysis for vulnerabilities
   - Continues on errors (informational)
   - Detects common security issues

5. **Gas Usage Reporting**
   - Generates detailed gas reports
   - Tracks gas consumption per function
   - Uploads report as artifact

**File**: `.github/workflows/quality.yml`

### 3. Testnet Deployment (`deploy.yml`)

**Trigger Events**:
- Manual workflow dispatch only
- Requires network selection (Sepolia/Localhost)

**Deployment Steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js environment
3. ✅ Install dependencies
4. ✅ Compile contracts
5. ✅ Run tests before deployment
6. ✅ Deploy to selected network
7. ✅ Verify contracts on Etherscan
8. ✅ Upload deployment artifacts

**File**: `.github/workflows/deploy.yml`

**Required Secrets**:
- `PRIVATE_KEY` - Deployer wallet private key
- `SEPOLIA_RPC_URL` - Sepolia RPC endpoint
- `ETHERSCAN_API_KEY` - Etherscan API key
- `CODECOV_TOKEN` - Codecov upload token (optional)

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are automatically enabled for all repositories. No additional setup required.

### 2. Configure Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions**

Add the following secrets:

#### Required for Deployment
```
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

#### Optional for Coverage
```
CODECOV_TOKEN=your_codecov_token_here
```

**Security Notes**:
- Never commit private keys to the repository
- Use a dedicated deployment wallet
- Rotate keys regularly
- Limit permissions on deployment wallet

### 3. Setup Codecov (Optional)

1. Visit [codecov.io](https://codecov.io/)
2. Sign in with GitHub
3. Add your repository
4. Copy the upload token
5. Add token to GitHub Secrets as `CODECOV_TOKEN`

### 4. Branch Protection Rules

Recommended branch protection for `main`:

**Settings → Branches → Add rule**:
- ✅ Require pull request before merging
- ✅ Require status checks to pass before merging
  - Select: `Test on Node.js 18.x and ubuntu-latest`
  - Select: `Test on Node.js 20.x and ubuntu-latest`
  - Select: `Code Quality Checks`
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ✅ Include administrators

## Workflow Status Badges

Add these badges to your README.md:

```markdown
![Tests](https://github.com/yourusername/private-ip-protection-platform/workflows/Automated%20Tests/badge.svg)
![Code Quality](https://github.com/yourusername/private-ip-protection-platform/workflows/Code%20Quality/badge.svg)
[![codecov](https://codecov.io/gh/yourusername/private-ip-protection-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/private-ip-protection-platform)
```

## Local Testing Before Push

Run these commands locally before pushing:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Check formatting
npm run format:check

# Auto-fix formatting
npm run format

# Compile contracts
npm run compile

# Run tests
npm test

# Generate coverage
npm run test:coverage

# Check gas usage
REPORT_GAS=true npm test
```

## Continuous Integration Workflow

### For Contributors

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test Locally**
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - GitHub Actions will automatically run
   - Wait for all checks to pass
   - Request review from maintainers

7. **Address Review Comments**
   - Make requested changes
   - Push updates
   - CI will re-run automatically

8. **Merge**
   - Maintainer merges after approval
   - CI runs on main branch
   - Deployment can be triggered manually

### For Maintainers

1. **Review Pull Request**
   - Check code quality
   - Review test coverage
   - Verify CI passes

2. **Approve and Merge**
   - Squash and merge recommended
   - Delete branch after merge

3. **Monitor Main Branch**
   - Ensure CI passes
   - Check coverage reports
   - Review gas usage

4. **Deploy to Testnet**
   - Go to Actions tab
   - Select "Deploy to Testnet"
   - Click "Run workflow"
   - Select network (Sepolia)
   - Confirm deployment

## CI/CD Best Practices

### Code Quality

1. **Always run linter before committing**
   ```bash
   npm run lint
   ```

2. **Format code automatically**
   ```bash
   npm run format
   ```

3. **Write tests for new features**
   - Aim for >80% coverage
   - Test edge cases
   - Test access control

4. **Keep contracts small**
   - Target <24KB per contract
   - Monitor gas usage
   - Optimize when needed

### Security

1. **Never commit secrets**
   - Use `.env` for local development
   - Use GitHub Secrets for CI/CD
   - Add `.env` to `.gitignore`

2. **Review security warnings**
   - Check Slither output
   - Address critical issues
   - Document known issues

3. **Test before deployment**
   - All tests must pass
   - Coverage >80%
   - No critical security issues

### Performance

1. **Optimize gas usage**
   - Monitor gas reports
   - Use efficient patterns
   - Minimize storage operations

2. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

3. **Use npm ci in CI**
   - Faster than npm install
   - Uses package-lock.json
   - Ensures consistent builds

## Troubleshooting

### CI Failures

#### Tests Failing
```bash
# Run locally
npm test

# Check specific test
npm test -- --grep "test name"

# View detailed output
npm test -- --reporter spec
```

#### Linter Errors
```bash
# View errors
npm run lint

# Auto-fix
npm run lint:fix
```

#### Formatting Issues
```bash
# Check formatting
npm run format:check

# Auto-fix
npm run format
```

#### Compilation Errors
```bash
# Clean and recompile
npm run clean
npm run compile
```

### Deployment Failures

#### Insufficient Funds
- Check deployer wallet balance
- Fund with testnet ETH
- Use faucet for Sepolia

#### Network Issues
- Verify RPC URL is correct
- Check network connectivity
- Try alternative RPC provider

#### Verification Failures
- Wait for block confirmations
- Check Etherscan API key
- Verify contract address

## Monitoring and Metrics

### GitHub Actions Dashboard

View workflow runs:
- Go to repository
- Click "Actions" tab
- See all workflow runs
- Click run for details

### Coverage Trends

View on Codecov:
- Visit codecov.io dashboard
- See coverage over time
- Check file-level coverage
- Review uncovered lines

### Gas Usage Reports

Download from artifacts:
1. Go to workflow run
2. Scroll to "Artifacts"
3. Download "gas-report"
4. Review gas consumption

## Automated Deployment

### Deployment Strategy

**Development Flow**:
```
feature → develop → main → testnet → mainnet
```

**Branches**:
- `feature/*` - Feature development
- `develop` - Integration testing
- `main` - Production-ready code
- `release/*` - Release preparation

**Deployment**:
- `develop` → Manual deploy to dev testnet
- `main` → Manual deploy to public testnet
- `release/*` → Manual deploy to mainnet

### Deployment Checklist

Before deploying:
- [ ] All tests passing
- [ ] Coverage >80%
- [ ] No linter errors
- [ ] Gas usage acceptable
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Deployment plan reviewed

## Future Enhancements

### Planned CI/CD Improvements

1. **Automated Dependency Updates**
   - Dependabot integration
   - Automated security patches
   - Version upgrade PRs

2. **Enhanced Security Scanning**
   - Mythril integration
   - Echidna fuzzing
   - Certora formal verification

3. **Performance Benchmarking**
   - Gas comparison over time
   - Contract size tracking
   - Deployment cost analysis

4. **Automated Documentation**
   - NatSpec generation
   - API documentation
   - Architecture diagrams

5. **Mainnet Deployment**
   - Multi-sig approval
   - Gradual rollout
   - Rollback procedures

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Hardhat CI Setup](https://hardhat.org/hardhat-runner/docs/advanced/continuous-integration)
- [Codecov Documentation](https://docs.codecov.com/)

### Tools
- [Solhint](https://github.com/protofire/solhint)
- [Prettier Solidity](https://github.com/prettier-solidity/prettier-plugin-solidity)
- [Slither](https://github.com/crytic/slither)

### Best Practices
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)
- [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

## Support

For CI/CD issues:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Check GitHub Actions status page
4. Open issue on repository

---

**Last Updated**: 2024-10-26
**Pipeline Version**: 1.0.0
**Maintained By**: Platform Development Team
