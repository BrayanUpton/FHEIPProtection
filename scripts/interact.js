const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Interactive script for Private IP Protection Platform
 * Provides functions to interact with the deployed contract
 */

// Helper function to get contract instance
async function getContract() {
  let contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const network = await hre.ethers.provider.getNetwork();
      const files = fs.readdirSync(deploymentsDir);
      const deploymentFiles = files.filter(
        (f) => f.startsWith(network.name) && f.endsWith(".json")
      );

      if (deploymentFiles.length > 0) {
        const latestFile = deploymentFiles.sort().reverse()[0];
        const deploymentData = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, latestFile))
        );
        contractAddress = deploymentData.contractAddress;
      }
    }
  }

  if (!contractAddress) {
    throw new Error("Contract address not found. Please deploy the contract first.");
  }

  return await hre.ethers.getContractAt("PrivateIPProtection", contractAddress);
}

// Display contract information
async function displayContractInfo() {
  console.log("📋 Contract Information\n");

  const contract = await getContract();
  const contractAddress = await contract.getAddress();

  const patentOffice = await contract.patentOffice();
  const applicationFee = await contract.APPLICATION_FEE();
  const reviewPeriod = await contract.REVIEW_PERIOD();
  const applicationCount = await contract.applicationCount();

  console.log("Contract Address:", contractAddress);
  console.log("Patent Office:", patentOffice);
  console.log("Application Fee:", hre.ethers.formatEther(applicationFee), "ETH");
  console.log("Review Period:", Number(reviewPeriod) / 86400, "days");
  console.log("Total Applications:", applicationCount.toString());
  console.log();
}

// Submit a patent application
async function submitApplication(titleHash, descriptionHash, claimsHash, category) {
  console.log("📝 Submitting Patent Application\n");

  const [signer] = await hre.ethers.getSigners();
  const contract = await getContract();
  const applicationFee = await contract.APPLICATION_FEE();

  console.log("Applicant:", signer.address);
  console.log("Fee:", hre.ethers.formatEther(applicationFee), "ETH");

  const tx = await contract.submitPatentApplication(
    titleHash,
    descriptionHash,
    claimsHash,
    category,
    { value: applicationFee }
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Application submitted!");
  console.log("Block number:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  // Get application ID from event
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "ApplicationSubmitted"
  );

  if (event) {
    const applicationId = event.args[0];
    console.log("Application ID:", applicationId.toString());
    return applicationId;
  }

  console.log();
}

// Authorize an examiner
async function authorizeExaminer(examinerAddress, specialization) {
  console.log("👨‍⚖️ Authorizing Examiner\n");

  const contract = await getContract();
  const [signer] = await hre.ethers.getSigners();

  console.log("Patent Office:", signer.address);
  console.log("Examiner:", examinerAddress);
  console.log("Specialization:", specialization);

  const tx = await contract.authorizeExaminer(examinerAddress, specialization);
  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Examiner authorized!");
  console.log("Block number:", receipt.blockNumber);
  console.log();
}

// Assign application to examiner
async function assignApplication(applicationId, examinerAddress) {
  console.log("📌 Assigning Application to Examiner\n");

  const contract = await getContract();

  console.log("Application ID:", applicationId);
  console.log("Examiner:", examinerAddress);

  const tx = await contract.assignApplicationToExaminer(
    applicationId,
    examinerAddress
  );
  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Application assigned!");
  console.log("Block number:", receipt.blockNumber);
  console.log();
}

// Get application status
async function getApplicationStatus(applicationId) {
  console.log("🔍 Application Status\n");

  const contract = await getContract();

  try {
    const [status, deadline, confidential] = await contract.getApplicationStatus(
      applicationId
    );

    const statusNames = ["Pending", "Under Review", "Approved", "Rejected", "Withdrawn"];
    console.log("Application ID:", applicationId);
    console.log("Status:", statusNames[status]);
    console.log("Review Deadline:", new Date(Number(deadline) * 1000).toLocaleString());
    console.log("Confidentiality Maintained:", confidential);
    console.log();
  } catch (error) {
    console.error("❌ Error getting status:", error.message);
    console.log();
  }
}

// Get examiner workload
async function getExaminerWorkload(examinerAddress) {
  console.log("📊 Examiner Workload\n");

  const contract = await getContract();

  try {
    const [assigned, completed, active] = await contract.getExaminerWorkload(
      examinerAddress
    );

    console.log("Examiner:", examinerAddress);
    console.log("Assigned Applications:", assigned.toString());
    console.log("Completed Reviews:", completed.toString());
    console.log("Active Status:", active);
    console.log();
  } catch (error) {
    console.error("❌ Error getting workload:", error.message);
    console.log();
  }
}

// Get applicant's applications
async function getApplicantApplications(applicantAddress) {
  console.log("📑 Applicant's Applications\n");

  const contract = await getContract();

  try {
    const applications = await contract.getApplicantApplications(applicantAddress);

    console.log("Applicant:", applicantAddress);
    console.log("Total Applications:", applications.length);
    console.log("Application IDs:", applications.map((id) => id.toString()).join(", "));
    console.log();

    return applications;
  } catch (error) {
    console.error("❌ Error getting applications:", error.message);
    console.log();
  }
}

// Main interaction menu
async function main() {
  console.log("=".repeat(60));
  console.log("Private IP Protection Platform - Interaction Script");
  console.log("=".repeat(60));
  console.log();

  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log();

  // Display contract info
  await displayContractInfo();

  // Example interactions (uncomment to use)

  // Example 1: Submit an application
  // const appId = await submitApplication(
  //   12345678,  // titleHash
  //   87654321,  // descriptionHash
  //   11223344,  // claimsHash
  //   1          // category
  // );

  // Example 2: Authorize an examiner
  // await authorizeExaminer(
  //   "0x1234567890123456789012345678901234567890",
  //   "Software Patents"
  // );

  // Example 3: Get application status
  // await getApplicationStatus(1);

  // Example 4: Get examiner workload
  // const [signer] = await hre.ethers.getSigners();
  // await getExaminerWorkload(signer.address);

  // Example 5: Get applicant's applications
  // const [signer] = await hre.ethers.getSigners();
  // await getApplicantApplications(signer.address);

  console.log("✅ Interaction script completed!");
  console.log("\nTo perform specific actions, uncomment the example code in this script.");
}

// Execute main function
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Error:");
      console.error(error);
      process.exit(1);
    });
}

// Export functions for use in other scripts
module.exports = {
  getContract,
  displayContractInfo,
  submitApplication,
  authorizeExaminer,
  assignApplication,
  getApplicationStatus,
  getExaminerWorkload,
  getApplicantApplications,
};
