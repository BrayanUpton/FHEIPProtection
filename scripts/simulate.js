const hre = require("hardhat");
const {
  submitApplication,
  authorizeExaminer,
  assignApplication,
  getApplicationStatus,
  getExaminerWorkload,
  getApplicantApplications,
  displayContractInfo,
} = require("./interact");

/**
 * Simulation script for Private IP Protection Platform
 * Simulates a complete workflow from application submission to review
 */

// Generate random hash for testing
function randomHash() {
  return Math.floor(Math.random() * 4294967295); // Max uint32
}

// Generate random category (1-10)
function randomCategory() {
  return Math.floor(Math.random() * 10) + 1;
}

// Wait for a specified time
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateCompleteWorkflow() {
  console.log("=".repeat(70));
  console.log("Private IP Protection Platform - Complete Workflow Simulation");
  console.log("=".repeat(70));
  console.log();

  // Get signers
  const [patentOffice, applicant1, applicant2, examiner1, examiner2] =
    await hre.ethers.getSigners();

  console.log("👥 Participants:");
  console.log("Patent Office:", patentOffice.address);
  console.log("Applicant 1:", applicant1.address);
  console.log("Applicant 2:", applicant2.address);
  console.log("Examiner 1:", examiner1.address);
  console.log("Examiner 2:", examiner2.address);
  console.log();

  await wait(1000);

  // Display initial contract state
  await displayContractInfo();

  // Step 1: Authorize examiners
  console.log("📋 Step 1: Authorizing Examiners");
  console.log("-".repeat(70));
  await authorizeExaminer(examiner1.address, "Software and Computer Science");
  await wait(500);
  await authorizeExaminer(examiner2.address, "Biotechnology and Pharmaceuticals");
  await wait(1000);

  // Step 2: Submit patent applications
  console.log("📋 Step 2: Submitting Patent Applications");
  console.log("-".repeat(70));

  // Get contract with applicant1 signer
  const contract = await hre.ethers.getContractAt(
    "PrivateIPProtection",
    process.env.CONTRACT_ADDRESS || (await getContractAddress())
  );

  const applicationFee = await contract.APPLICATION_FEE();

  // Application 1 from applicant1
  console.log("\n📝 Application 1 (Applicant 1):");
  const tx1 = await contract.connect(applicant1).submitPatentApplication(
    randomHash(), // titleHash
    randomHash(), // descriptionHash
    randomHash(), // claimsHash
    1, // Software category
    { value: applicationFee }
  );
  const receipt1 = await tx1.wait();
  console.log("✅ Submitted - Transaction:", tx1.hash);
  await wait(500);

  // Application 2 from applicant1
  console.log("\n📝 Application 2 (Applicant 1):");
  const tx2 = await contract.connect(applicant1).submitPatentApplication(
    randomHash(),
    randomHash(),
    randomHash(),
    2, // Hardware category
    { value: applicationFee }
  );
  await tx2.wait();
  console.log("✅ Submitted - Transaction:", tx2.hash);
  await wait(500);

  // Application 3 from applicant2
  console.log("\n📝 Application 3 (Applicant 2):");
  const tx3 = await contract.connect(applicant2).submitPatentApplication(
    randomHash(),
    randomHash(),
    randomHash(),
    5, // Biotech category
    { value: applicationFee }
  );
  await tx3.wait();
  console.log("✅ Submitted - Transaction:", tx3.hash);
  await wait(1000);

  // Step 3: Check applicant's applications
  console.log("\n📋 Step 3: Checking Applicant Applications");
  console.log("-".repeat(70));
  await getApplicantApplications(applicant1.address);
  await wait(500);
  await getApplicantApplications(applicant2.address);
  await wait(1000);

  // Step 4: Assign applications to examiners
  console.log("📋 Step 4: Assigning Applications to Examiners");
  console.log("-".repeat(70));
  await assignApplication(1, examiner1.address);
  await wait(500);
  await assignApplication(2, examiner1.address);
  await wait(500);
  await assignApplication(3, examiner2.address);
  await wait(1000);

  // Step 5: Check examiner workloads
  console.log("📋 Step 5: Checking Examiner Workloads");
  console.log("-".repeat(70));
  await getExaminerWorkload(examiner1.address);
  await wait(500);
  await getExaminerWorkload(examiner2.address);
  await wait(1000);

  // Step 6: Check application statuses
  console.log("📋 Step 6: Checking Application Statuses");
  console.log("-".repeat(70));
  await getApplicationStatus(1);
  await wait(500);
  await getApplicationStatus(2);
  await wait(500);
  await getApplicationStatus(3);
  await wait(1000);

  // Step 7: Submit review decisions
  console.log("📋 Step 7: Submitting Review Decisions");
  console.log("-".repeat(70));

  // Examiner 1 approves application 1
  console.log("\n✅ Examiner 1 reviewing Application 1:");
  const reviewTx1 = await contract.connect(examiner1).submitReviewDecision(
    1,
    2, // Approved status
    randomHash(), // feedback hash
    false // Keep feedback confidential
  );
  await reviewTx1.wait();
  console.log("Decision: Approved (Confidential)");
  console.log("Transaction:", reviewTx1.hash);
  await wait(500);

  // Examiner 1 rejects application 2
  console.log("\n❌ Examiner 1 reviewing Application 2:");
  const reviewTx2 = await contract.connect(examiner1).submitReviewDecision(
    2,
    3, // Rejected status
    randomHash(),
    true // Make feedback public
  );
  await reviewTx2.wait();
  console.log("Decision: Rejected (Public)");
  console.log("Transaction:", reviewTx2.hash);
  await wait(500);

  // Examiner 2 approves application 3
  console.log("\n✅ Examiner 2 reviewing Application 3:");
  const reviewTx3 = await contract.connect(examiner2).submitReviewDecision(
    3,
    2, // Approved status
    randomHash(),
    false
  );
  await reviewTx3.wait();
  console.log("Decision: Approved (Confidential)");
  console.log("Transaction:", reviewTx3.hash);
  await wait(1000);

  // Step 8: Final status check
  console.log("\n📋 Step 8: Final Status Check");
  console.log("-".repeat(70));
  await getApplicationStatus(1);
  await wait(500);
  await getApplicationStatus(2);
  await wait(500);
  await getApplicationStatus(3);
  await wait(500);

  // Step 9: Final examiner workload
  console.log("📋 Step 9: Final Examiner Workloads");
  console.log("-".repeat(70));
  await getExaminerWorkload(examiner1.address);
  await wait(500);
  await getExaminerWorkload(examiner2.address);
  await wait(1000);

  // Step 10: Contract balance check
  console.log("📋 Step 10: Contract Financial Status");
  console.log("-".repeat(70));
  const contractBalance = await hre.ethers.provider.getBalance(
    await contract.getAddress()
  );
  console.log("Contract Balance:", hre.ethers.formatEther(contractBalance), "ETH");
  console.log(
    "Expected Balance:",
    hre.ethers.formatEther(applicationFee * 3n),
    "ETH (3 applications)"
  );
  console.log();

  // Simulation summary
  console.log("=".repeat(70));
  console.log("📊 Simulation Summary");
  console.log("=".repeat(70));
  console.log("✅ Total Applications Submitted: 3");
  console.log("✅ Total Examiners Authorized: 2");
  console.log("✅ Total Applications Assigned: 3");
  console.log("✅ Total Reviews Completed: 3");
  console.log("   - Approved: 2");
  console.log("   - Rejected: 1");
  console.log("✅ Total Fees Collected:", hre.ethers.formatEther(applicationFee * 3n), "ETH");
  console.log();
  console.log("🎉 Complete workflow simulation finished successfully!");
  console.log("=".repeat(70));
}

// Helper to get contract address
async function getContractAddress() {
  const fs = require("fs");
  const path = require("path");

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
      return deploymentData.contractAddress;
    }
  }

  throw new Error("Contract address not found. Please deploy the contract first.");
}

// Main simulation function
async function main() {
  const network = await hre.ethers.provider.getNetwork();

  if (network.chainId !== 31337n) {
    console.log("⚠️  Warning: This simulation is designed for local hardhat network.");
    console.log(`Current network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log("\nFor best results, run: npx hardhat node");
    console.log("Then deploy: npm run deploy:local");
    console.log("Finally simulate: npx hardhat run scripts/simulate.js --network localhost\n");
  }

  await simulateCompleteWorkflow();
}

// Execute simulation
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Simulation failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = { simulateCompleteWorkflow };
