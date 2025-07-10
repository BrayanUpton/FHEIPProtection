const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Main deployment script for Private IP Protection Platform
 * Deploys the PrivateIPProtection contract to the specified network
 */
async function main() {
  console.log("Starting deployment process...\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("Deployer account has no ETH. Please fund the account before deploying.");
  }

  // Deploy PrivateIPProtection contract
  console.log("Deploying PrivateIPProtection contract...");
  const PrivateIPProtection = await hre.ethers.getContractFactory("PrivateIPProtection");

  const contract = await PrivateIPProtection.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("PrivateIPProtection deployed to:", contractAddress);

  // Get deployment transaction details
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log("Deployment transaction hash:", deployTx.hash);
    const receipt = await deployTx.wait();
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Block number:", receipt.blockNumber);
  }

  // Verify contract configuration
  const patentOffice = await contract.patentOffice();
  const applicationFee = await contract.APPLICATION_FEE();
  const reviewPeriod = await contract.REVIEW_PERIOD();

  console.log("\nContract Configuration:");
  console.log("Patent Office Address:", patentOffice);
  console.log("Application Fee:", hre.ethers.formatEther(applicationFee), "ETH");
  console.log("Review Period:", (Number(reviewPeriod) / 86400), "days");

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx ? deployTx.hash : null,
    blockNumber: deployTx ? (await deployTx.wait()).blockNumber : null,
    configuration: {
      patentOffice: patentOffice,
      applicationFee: hre.ethers.formatEther(applicationFee),
      reviewPeriod: `${Number(reviewPeriod) / 86400} days`,
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(
    deploymentsDir,
    `${network.name}-${contractAddress}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Display Etherscan link if on supported network
  if (network.chainId === 11155111n) {
    console.log(`\nView on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  console.log("\n✅ Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Verify the contract: npm run verify");
  console.log("2. Test interactions: npm run interact");
  console.log("3. Run simulations: npm run simulate");
  console.log(`\nDon't forget to update CONTRACT_ADDRESS in .env file: ${contractAddress}`);

  return contractAddress;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
