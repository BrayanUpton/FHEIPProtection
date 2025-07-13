# GitHub Actions Setup Guide

Quick start guide for setting up GitHub Actions for the Private IP Protection Platform.

## Quick Setup (5 Minutes)

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/yourusername/private-ip-protection-platform.git

# Add all files
git add .

# Commit
git commit -m "Initial commit with CI/CD setup"

# Push to GitHub
git push -u origin main
```

### Step 2: Configure Repository Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### For Testing and Deployment

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PRIVATE_KEY` | Deployer wallet private key | `0x123abc...` |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint | `https://rpc.sepolia.org` |
| `ETHERSCAN_API_KEY` | Etherscan verification key | `ABC123...` |

#### For Coverage Reporting (Optional)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `CODECOV_TOKEN` | Codecov upload token | Visit [codecov.io](https://codecov.io) |

### Step 3: Enable GitHub Actions

GitHub Actions are enabled by default. Workflows will run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Step 4: Verify Workflows

1. Go to **Actions** tab in your repository
2. You should see three workflows:
   - ✅ Automated Tests
   - ✅ Code Quality
   - ✅ Deploy to Testnet

3. Push a commit to trigger workflows:
   ```bash
   git commit --allow-empty -m "Trigger CI/CD"
   git push
   ```

4. Watch workflows run in the Actions tab

## Workflow Details

### 1. Automated Tests

**File**: `.github/workflows/test.yml`

**Runs on**:
- Node.js 18.x and 20.x
- Ubuntu and Windows

**Steps**:
1. Install dependencies
2. Run linter (Ubuntu only)
3. Check formatting (Ubuntu only)
4. Compile contracts
5. Run 67 tests
6. Generate coverage
7. Upload to Codecov

**Status**: ✅ Should pass on first run

### 2. Code Quality

**File**: `.github/workflows/quality.yml`

**Checks**:
1. Solidity linting (Solhint)
2. Code formatting (Prettier)
3. Contract size analysis
4. Security analysis (Slither)
5. Gas usage reporting

**Status**: ✅ Should pass on first run

### 3. Deploy to Testnet

**File**: `.github/workflows/deploy.yml`

**Trigger**: Manual only

**How to Run**:
1. Go to **Actions** tab
2. Select **Deploy to Testnet**
3. Click **Run workflow**
4. Choose network (Sepolia)
5. Click **Run workflow** button

## Codecov Setup (Optional)

### 1. Sign Up for Codecov

1. Visit [codecov.io](https://codecov.io)
2. Click **Sign up with GitHub**
3. Authorize Codecov

### 2. Add Repository

1. In Codecov dashboard, click **Add Repository**
2. Find your repository
3. Click **Setup**

### 3. Get Upload Token

1. Click on your repository in Codecov
2. Go to **Settings** → **General**
3. Copy the **Repository Upload Token**

### 4. Add Token to GitHub

1. Go to GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Name: `CODECOV_TOKEN`
5. Value: Paste the token
6. Click **Add secret**

### 5. Verify Integration

1. Push a commit
2. Wait for tests to complete
3. Check Codecov dashboard
4. Coverage report should appear

## Branch Protection

### Recommended Settings for `main` Branch

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Select: `Test on Node.js 18.x and ubuntu-latest`
     - Select: `Test on Node.js 20.x and ubuntu-latest`
     - Select: `Code Quality Checks`
   - ✅ Require conversation resolution before merging
   - ✅ Require linear history
5. Click **Create**

## Status Badges

### Add to README.md

```markdown
# Private IP Protection Platform

![Tests](https://github.com/yourusername/private-ip-protection-platform/workflows/Automated%20Tests/badge.svg)
![Code Quality](https://github.com/yourusername/private-ip-protection-platform/workflows/Code%20Quality/badge.svg)
[![codecov](https://codecov.io/gh/yourusername/private-ip-protection-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/private-ip-protection-platform)
```

Replace `yourusername` with your GitHub username.

## Testing Locally Before Push

Always test locally before pushing:

```bash
# Run all checks
npm run lint
npm run format:check
npm run compile
npm test
npm run test:coverage

# Fix issues
npm run lint:fix
npm run format

# Commit when all pass
git add .
git commit -m "Your message"
git push
```

## Common Issues

### Issue 1: Workflow Not Running

**Solution**: Check that:
- Workflows are in `.github/workflows/` directory
- Files have `.yml` extension
- YAML syntax is valid
- Workflows are on `main` or `develop` branch

### Issue 2: Test Failures

**Solution**:
```bash
# Run locally first
npm test

# Check specific failures
npm test -- --grep "failing test name"
```

### Issue 3: Deployment Failures

**Solution**: Check that:
- All secrets are configured
- Private key has ETH for gas
- RPC URL is accessible
- Etherscan API key is valid

### Issue 4: Coverage Upload Fails

**Solution**:
- Verify `CODECOV_TOKEN` is set
- Check Codecov is not down
- Token has correct permissions
- Repository is added in Codecov

## Workflow Triggers

### Automatic Triggers

**Push to main or develop**:
```bash
git push origin main
```

**Pull Request**:
```bash
# Create PR on GitHub
# Workflows run automatically
```

### Manual Triggers

**Deployment**:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose options
5. Click "Run workflow" button

## Monitoring

### View Workflow Runs

1. Go to repository
2. Click **Actions** tab
3. See all workflow runs
4. Click on a run for details
5. View logs for each step

### Download Artifacts

1. Go to completed workflow run
2. Scroll to **Artifacts** section
3. Download:
   - Gas report
   - Deployment info
   - Coverage data

## Next Steps

After setup:

1. ✅ Push code to trigger workflows
2. ✅ Verify all checks pass
3. ✅ Set up branch protection
4. ✅ Add status badges to README
5. ✅ Configure Codecov (optional)
6. ✅ Test deployment workflow
7. ✅ Review gas reports
8. ✅ Monitor coverage trends

## Advanced Configuration

### Custom Triggers

Add to workflow file:

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:     # Manual trigger
  release:
    types: [published]   # On release
```

### Matrix Testing

Already configured for:
- Node.js: 18.x, 20.x
- OS: Ubuntu, Windows

To add more:

```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]
    os: [ubuntu-latest, macos-latest, windows-latest]
```

### Secrets Management

Best practices:
- Use different keys for dev/prod
- Rotate keys regularly
- Use minimal permissions
- Monitor usage in audit log

## Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] All secrets configured
- [ ] Workflows running successfully
- [ ] Tests passing (67/67)
- [ ] Code coverage >80%
- [ ] Linter passing
- [ ] Formatter passing
- [ ] Branch protection enabled
- [ ] Status badges added
- [ ] Documentation updated
- [ ] Team members notified

## Support

### Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### Getting Help

1. Check workflow logs
2. Review this guide
3. Check GitHub Actions status
4. Open issue in repository
5. Contact maintainers

---

**Setup Time**: ~5 minutes
**Difficulty**: Easy
**Prerequisites**: GitHub account, repository access
**Support**: Available in repository issues
