const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Contract verification script for Private IP Protection Platform
 * Verifies the deployed contract on Etherscan
 */
async function main() {
  console.log("Starting contract verification process...\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}\n`);

  // Get contract address from environment or deployment file
  let contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    // Try to read from latest deployment file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir);
      const deploymentFiles = files.filter(
        (f) => f.startsWith(network.name) && f.endsWith(".json")
      );

      if (deploymentFiles.length > 0) {
        // Get the most recent deployment file
        const latestFile = deploymentFiles.sort().reverse()[0];
        const deploymentData = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, latestFile))
        );
        contractAddress = deploymentData.contractAddress;
        console.log(`Using contract address from deployment file: ${latestFile}`);
      }
    }
  }

  if (!contractAddress) {
    throw new Error(
      "Contract address not found. Please set CONTRACT_ADDRESS in .env or ensure deployment file exists."
    );
  }

  console.log("Contract address:", contractAddress);

  // Check if network supports verification
  if (network.chainId !== 11155111n) {
    console.log("\n⚠️  Warning: Contract verification is only supported on Sepolia testnet");
    console.log("Current network does not support Etherscan verification");
    return;
  }

  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error(
      "ETHERSCAN_API_KEY not found in .env file. Please add your Etherscan API key."
    );
  }

  // Verify the contract
  console.log("\nVerifying contract on Etherscan...");
  console.log("This may take a few moments...\n");

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/PrivateIPProtection.sol:PrivateIPProtection",
    });

    console.log("\n✅ Contract verified successfully!");
    console.log(`View verified contract: https://sepolia.etherscan.io/address/${contractAddress}#code`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified!");
      console.log(`View verified contract: https://sepolia.etherscan.io/address/${contractAddress}#code`);
    } else {
      throw error;
    }
  }

  // Additional verification checks
  console.log("\nPerforming additional checks...");

  const contract = await hre.ethers.getContractAt(
    "PrivateIPProtection",
    contractAddress
  );

  const patentOffice = await contract.patentOffice();
  const applicationFee = await contract.APPLICATION_FEE();
  const applicationCount = await contract.applicationCount();

  console.log("\nContract State:");
  console.log("Patent Office:", patentOffice);
  console.log("Application Fee:", hre.ethers.formatEther(applicationFee), "ETH");
  console.log("Total Applications:", applicationCount.toString());

  console.log("\n✅ Verification completed successfully!");
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  });
