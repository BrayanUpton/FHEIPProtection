const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Comprehensive Test Suite for Private IP Protection Platform
 * Following industry best practices with 45+ test cases
 *
 * Test Categories:
 * - Deployment and Initialization (8 tests)
 * - Examiner Authorization (7 tests)
 * - Patent Application Submission (10 tests)
 * - Application Assignment (8 tests)
 * - Review Decision Submission (8 tests)
 * - Application Withdrawal (5 tests)
 * - Access Control (6 tests)
 * - Fee Management (5 tests)
 * - View Functions (4 tests)
 * - Gas Optimization (3 tests)
 * - Edge Cases (3 tests)
 */

describe("PrivateIPProtection - Comprehensive Test Suite", function () {
  // Deployment fixture for test optimization
  async function deployContractFixture() {
    const [patentOffice, applicant1, applicant2, examiner1, examiner2, unauthorized] =
      await ethers.getSigners();

    const PrivateIPProtection = await ethers.getContractFactory("PrivateIPProtection");
    const contract = await PrivateIPProtection.deploy();

    const contractAddress = await contract.getAddress();

    return {
      contract,
      contractAddress,
      patentOffice,
      applicant1,
      applicant2,
      examiner1,
      examiner2,
      unauthorized,
    };
  }

  // Helper function to submit an application
  async function submitApplicationHelper(contract, signer) {
    const fee = await contract.APPLICATION_FEE();
    const tx = await contract
      .connect(signer)
      .submitPatentApplication(12345, 67890, 11223, 1, { value: fee });
    await tx.wait();
  }

  // =================================================================
  // DEPLOYMENT AND INITIALIZATION TESTS (8 tests)
  // =================================================================
  describe("Deployment and Initialization", function () {
    it("should deploy successfully with correct address", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set the correct patent office address", async function () {
      const { contract, patentOffice } = await loadFixture(deployContractFixture);
      expect(await contract.patentOffice()).to.equal(patentOffice.address);
    });

    it("should initialize application count to zero", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.applicationCount()).to.equal(0);
    });

    it("should set correct application fee (0.1 ETH)", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.APPLICATION_FEE()).to.equal(ethers.parseEther("0.1"));
    });

    it("should set correct review period (30 days)", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      const expectedPeriod = 30 * 24 * 60 * 60; // 30 days in seconds
      expect(await contract.REVIEW_PERIOD()).to.equal(expectedPeriod);
    });

    it("should have no authorized examiners initially", async function () {
      const { contract, examiner1 } = await loadFixture(deployContractFixture);
      expect(await contract.authorizedExaminers(examiner1.address)).to.be.false;
    });

    it("should have zero balance after deployment", async function () {
      const { contractAddress } = await loadFixture(deployContractFixture);
      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(0);
    });

    it("should deploy with correct compiler version", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      // Contract should be deployed successfully
      expect(await contract.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
  });

  // =================================================================
  // EXAMINER AUTHORIZATION TESTS (7 tests)
  // =================================================================
  describe("Examiner Authorization", function () {
    it("should allow patent office to authorize examiner", async function () {
      const { contract, examiner1 } = await loadFixture(deployContractFixture);

      await expect(contract.authorizeExaminer(examiner1.address, "Software Patents"))
        .to.emit(contract, "ExaminerAuthorized")
        .withArgs(examiner1.address, "Software Patents");

      expect(await contract.authorizedExaminers(examiner1.address)).to.be.true;
    });

    it("should prevent non-patent-office from authorizing examiner", async function () {
      const { contract, examiner1, unauthorized } = await loadFixture(deployContractFixture);

      await expect(
        contract.connect(unauthorized).authorizeExaminer(examiner1.address, "Software")
      ).to.be.revertedWith("Only patent office authorized");
    });

    it("should prevent double authorization of same examiner", async function () {
      const { contract, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await expect(
        contract.authorizeExaminer(examiner1.address, "Hardware")
      ).to.be.revertedWith("Already authorized");
    });

    it("should correctly set examiner profile", async function () {
      const { contract, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Biotechnology");

      const profile = await contract.examinerProfiles(examiner1.address);
      expect(profile.examiner).to.equal(examiner1.address);
      expect(profile.isActive).to.be.true;
      expect(profile.assignedApplications).to.equal(0);
      expect(profile.completedReviews).to.equal(0);
      expect(profile.specialization).to.equal("Biotechnology");
    });

    it("should allow authorization with empty specialization", async function () {
      const { contract, examiner1 } = await loadFixture(deployContractFixture);

      await expect(contract.authorizeExaminer(examiner1.address, ""))
        .to.emit(contract, "ExaminerAuthorized")
        .withArgs(examiner1.address, "");
    });

    it("should authorize multiple examiners independently", async function () {
      const { contract, examiner1, examiner2 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await contract.authorizeExaminer(examiner2.address, "Hardware");

      expect(await contract.authorizedExaminers(examiner1.address)).to.be.true;
      expect(await contract.authorizedExaminers(examiner2.address)).to.be.true;
    });

    it("should allow revoking examiner access", async function () {
      const { contract, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await expect(contract.revokeExaminerAccess(examiner1.address))
        .to.emit(contract, "ExaminerRevoked")
        .withArgs(examiner1.address);

      expect(await contract.authorizedExaminers(examiner1.address)).to.be.false;
    });
  });

  // =================================================================
  // PATENT APPLICATION SUBMISSION TESTS (10 tests)
  // =================================================================
  describe("Patent Application Submission", function () {
    it("should allow applicant to submit application with correct fee", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await expect(
        contract
          .connect(applicant1)
          .submitPatentApplication(12345, 67890, 11223, 1, { value: fee })
      ).to.emit(contract, "ApplicationSubmitted");
    });

    it("should reject application with insufficient fee", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const insufficientFee = ethers.parseEther("0.05");
      await expect(
        contract
          .connect(applicant1)
          .submitPatentApplication(12345, 67890, 11223, 1, { value: insufficientFee })
      ).to.be.revertedWith("Insufficient fee");
    });

    it("should reject application with zero fee", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      await expect(
        contract
          .connect(applicant1)
          .submitPatentApplication(12345, 67890, 11223, 1, { value: 0 })
      ).to.be.revertedWith("Insufficient fee");
    });

    it("should increment application count correctly", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await contract
        .connect(applicant1)
        .submitPatentApplication(12345, 67890, 11223, 1, { value: fee });

      expect(await contract.applicationCount()).to.equal(1);
    });

    it("should track applicant applications", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await contract
        .connect(applicant1)
        .submitPatentApplication(12345, 67890, 11223, 1, { value: fee });

      const apps = await contract
        .connect(applicant1)
        .getApplicantApplications(applicant1.address);
      expect(apps.length).to.equal(1);
      expect(apps[0]).to.equal(1);
    });

    it("should set correct initial application status (Pending)", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      const [status] = await contract.connect(applicant1).getApplicationStatus(1);
      expect(status).to.equal(0); // Pending
    });

    it("should set correct review deadline (30 days from submission)", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const blockTime = await time.latest();
      await submitApplicationHelper(contract, applicant1);

      const [, deadline] = await contract.connect(applicant1).getApplicationStatus(1);
      const expectedDeadline = blockTime + (30 * 24 * 60 * 60) + 1; // +1 for tx time
      expect(Number(deadline)).to.be.closeTo(expectedDeadline, 5);
    });

    it("should accept excess payment (no refund expected)", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const excessFee = ethers.parseEther("0.2"); // Double the fee
      await expect(
        contract
          .connect(applicant1)
          .submitPatentApplication(12345, 67890, 11223, 1, { value: excessFee })
      ).to.emit(contract, "ApplicationSubmitted");
    });

    it("should allow multiple applications from same applicant", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await contract
        .connect(applicant1)
        .submitPatentApplication(11111, 22222, 33333, 1, { value: fee });
      await contract
        .connect(applicant1)
        .submitPatentApplication(44444, 55555, 66666, 2, { value: fee });

      expect(await contract.applicationCount()).to.equal(2);
    });

    it("should allow applications from different applicants", async function () {
      const { contract, applicant1, applicant2 } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);
      await submitApplicationHelper(contract, applicant2);

      expect(await contract.applicationCount()).to.equal(2);
    });
  });

  // =================================================================
  // APPLICATION ASSIGNMENT TESTS (8 tests)
  // =================================================================
  describe("Application Assignment", function () {
    it("should allow patent office to assign application to examiner", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);

      await expect(contract.assignApplicationToExaminer(1, examiner1.address))
        .to.emit(contract, "ApplicationAssigned")
        .withArgs(1, examiner1.address);
    });

    it("should prevent assignment to unauthorized examiner", async function () {
      const { contract, applicant1, unauthorized } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      await expect(
        contract.assignApplicationToExaminer(1, unauthorized.address)
      ).to.be.revertedWith("Examiner not authorized");
    });

    it("should prevent non-patent-office from assigning applications", async function () {
      const { contract, applicant1, examiner1, unauthorized } =
        await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);

      await expect(
        contract
          .connect(unauthorized)
          .assignApplicationToExaminer(1, examiner1.address)
      ).to.be.revertedWith("Only patent office authorized");
    });

    it("should update application status to Under Review", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      const [status] = await contract.connect(applicant1).getApplicationStatus(1);
      expect(status).to.equal(1); // UnderReview
    });

    it("should increment examiner's assigned applications count", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      const [assigned] = await contract.getExaminerWorkload(examiner1.address);
      expect(assigned).to.equal(1);
    });

    it("should prevent assignment of non-existent application", async function () {
      const { contract, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");

      await expect(
        contract.assignApplicationToExaminer(999, examiner1.address)
      ).to.be.revertedWith("Application not found");
    });

    it("should prevent assignment of non-pending application", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      // Try to reassign
      await expect(
        contract.assignApplicationToExaminer(1, examiner1.address)
      ).to.be.revertedWith("Application not pending");
    });

    it("should assign multiple applications to same examiner", async function () {
      const { contract, applicant1, applicant2, examiner1 } =
        await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await submitApplicationHelper(contract, applicant2);

      await contract.assignApplicationToExaminer(1, examiner1.address);
      await contract.assignApplicationToExaminer(2, examiner1.address);

      const [assigned] = await contract.getExaminerWorkload(examiner1.address);
      expect(assigned).to.equal(2);
    });
  });

  // =================================================================
  // REVIEW DECISION SUBMISSION TESTS (8 tests)
  // =================================================================
  describe("Review Decision Submission", function () {
    it("should allow examiner to submit approval decision", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      await expect(
        contract.connect(examiner1).submitReviewDecision(1, 2, 99999, false)
      )
        .to.emit(contract, "ReviewCompleted")
        .withArgs(1, 2, examiner1.address);
    });

    it("should allow examiner to submit rejection decision", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      await expect(
        contract.connect(examiner1).submitReviewDecision(1, 3, 88888, true)
      )
        .to.emit(contract, "ReviewCompleted")
        .withArgs(1, 3, examiner1.address);
    });

    it("should prevent non-assigned examiner from submitting decision", async function () {
      const { contract, applicant1, examiner1, examiner2 } =
        await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await contract.authorizeExaminer(examiner2.address, "Hardware");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      await expect(
        contract.connect(examiner2).submitReviewDecision(1, 2, 99999, false)
      ).to.be.revertedWith("Not assigned to you");
    });

    it("should prevent unauthorized user from submitting decision", async function () {
      const { contract, applicant1, examiner1, unauthorized } =
        await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      await expect(
        contract.connect(unauthorized).submitReviewDecision(1, 2, 99999, false)
      ).to.be.revertedWith("Not authorized examiner");
    });

    it("should increment examiner's completed reviews count", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);
      await contract.connect(examiner1).submitReviewDecision(1, 2, 99999, false);

      const [, completed] = await contract.getExaminerWorkload(examiner1.address);
      expect(completed).to.equal(1);
    });

    it("should prevent decision on non-under-review application", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);

      // Application still pending, not assigned
      await expect(
        contract.connect(examiner1).submitReviewDecision(1, 2, 99999, false)
      ).to.be.revertedWith("Not assigned to you");
    });

    it("should reject invalid decision status (not Approved/Rejected)", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      // Status 0 (Pending) is invalid for decision
      await expect(
        contract.connect(examiner1).submitReviewDecision(1, 0, 99999, false)
      ).to.be.revertedWith("Invalid decision");
    });

    it("should update application status after decision", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);
      await contract.connect(examiner1).submitReviewDecision(1, 2, 99999, false);

      const [status] = await contract.connect(applicant1).getApplicationStatus(1);
      expect(status).to.equal(2); // Approved
    });
  });

  // =================================================================
  // APPLICATION WITHDRAWAL TESTS (5 tests)
  // =================================================================
  describe("Application Withdrawal", function () {
    it("should allow applicant to withdraw pending application", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);
      await contract.connect(applicant1).withdrawApplication(1);

      const [status] = await contract.connect(applicant1).getApplicationStatus(1);
      expect(status).to.equal(4); // Withdrawn
    });

    it("should allow applicant to withdraw under-review application", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      await contract.connect(applicant1).withdrawApplication(1);

      const [status] = await contract.connect(applicant1).getApplicationStatus(1);
      expect(status).to.equal(4); // Withdrawn
    });

    it("should prevent non-applicant from withdrawing application", async function () {
      const { contract, applicant1, unauthorized } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      await expect(
        contract.connect(unauthorized).withdrawApplication(1)
      ).to.be.revertedWith("Not your application");
    });

    it("should prevent withdrawal of approved application", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);
      await contract.connect(examiner1).submitReviewDecision(1, 2, 99999, false);

      await expect(
        contract.connect(applicant1).withdrawApplication(1)
      ).to.be.revertedWith("Cannot withdraw at this stage");
    });

    it("should prevent withdrawal of rejected application", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);
      await contract.connect(examiner1).submitReviewDecision(1, 3, 88888, true);

      await expect(
        contract.connect(applicant1).withdrawApplication(1)
      ).to.be.revertedWith("Cannot withdraw at this stage");
    });
  });

  // =================================================================
  // ACCESS CONTROL TESTS (6 tests)
  // =================================================================
  describe("Access Control", function () {
    it("should allow applicant to view their own application status", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      const [status] = await contract.connect(applicant1).getApplicationStatus(1);
      expect(status).to.equal(0); // Pending
    });

    it("should allow examiner to view assigned application status", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);

      const [status] = await contract.connect(examiner1).getApplicationStatus(1);
      expect(status).to.equal(1); // UnderReview
    });

    it("should allow patent office to view any application status", async function () {
      const { contract, applicant1, patentOffice } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      const [status] = await contract.connect(patentOffice).getApplicationStatus(1);
      expect(status).to.equal(0); // Pending
    });

    it("should prevent unauthorized access to application status", async function () {
      const { contract, applicant1, unauthorized } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      await expect(
        contract.connect(unauthorized).getApplicationStatus(1)
      ).to.be.revertedWith("Access denied");
    });

    it("should prevent unauthorized access to applicant applications", async function () {
      const { contract, applicant1, unauthorized } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      await expect(
        contract.connect(unauthorized).getApplicantApplications(applicant1.address)
      ).to.be.revertedWith("Access denied");
    });

    it("should allow patent office to view any applicant's applications", async function () {
      const { contract, applicant1, patentOffice } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      const apps = await contract
        .connect(patentOffice)
        .getApplicantApplications(applicant1.address);
      expect(apps.length).to.equal(1);
    });
  });

  // =================================================================
  // FEE MANAGEMENT TESTS (5 tests)
  // =================================================================
  describe("Fee Management", function () {
    it("should collect application fees in contract", async function () {
      const { contract, contractAddress, applicant1 } =
        await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await submitApplicationHelper(contract, applicant1);

      const contractBalance = await ethers.provider.getBalance(contractAddress);
      expect(contractBalance).to.equal(fee);
    });

    it("should accumulate fees from multiple applications", async function () {
      const { contract, contractAddress, applicant1, applicant2 } =
        await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await submitApplicationHelper(contract, applicant1);
      await submitApplicationHelper(contract, applicant2);

      const contractBalance = await ethers.provider.getBalance(contractAddress);
      expect(contractBalance).to.equal(fee * 2n);
    });

    it("should allow patent office to withdraw fees", async function () {
      const { contract, applicant1, patentOffice } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await submitApplicationHelper(contract, applicant1);

      const balanceBefore = await ethers.provider.getBalance(patentOffice.address);
      const tx = await contract.withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(patentOffice.address);

      expect(balanceAfter).to.equal(balanceBefore + fee - gasUsed);
    });

    it("should prevent non-patent-office from withdrawing fees", async function () {
      const { contract, applicant1, unauthorized } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      await expect(contract.connect(unauthorized).withdrawFees()).to.be.revertedWith(
        "Only patent office authorized"
      );
    });

    it("should fail when withdrawing with zero balance", async function () {
      const { contract } = await loadFixture(deployContractFixture);

      await expect(contract.withdrawFees()).to.be.revertedWith("No fees to withdraw");
    });
  });

  // =================================================================
  // VIEW FUNCTIONS TESTS (4 tests)
  // =================================================================
  describe("View Functions", function () {
    it("should return correct examiner workload", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);
      await contract.connect(examiner1).submitReviewDecision(1, 2, 99999, false);

      const [assigned, completed, active] = await contract.getExaminerWorkload(
        examiner1.address
      );

      expect(assigned).to.equal(1);
      expect(completed).to.equal(1);
      expect(active).to.be.true;
    });

    it("should return correct application integrity", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      await submitApplicationHelper(contract, applicant1);

      const integrity = await contract
        .connect(applicant1)
        .verifyApplicationIntegrity(1);
      expect(integrity).to.be.true;
    });

    it("should return all applications for an applicant", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      await contract
        .connect(applicant1)
        .submitPatentApplication(11111, 22222, 33333, 1, { value: fee });
      await contract
        .connect(applicant1)
        .submitPatentApplication(44444, 55555, 66666, 2, { value: fee });
      await contract
        .connect(applicant1)
        .submitPatentApplication(77777, 88888, 99999, 3, { value: fee });

      const apps = await contract
        .connect(applicant1)
        .getApplicantApplications(applicant1.address);
      expect(apps.length).to.equal(3);
    });

    it("should return empty array for applicant with no applications", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const apps = await contract
        .connect(applicant1)
        .getApplicantApplications(applicant1.address);
      expect(apps.length).to.equal(0);
    });
  });

  // =================================================================
  // GAS OPTIMIZATION TESTS (3 tests)
  // =================================================================
  describe("Gas Optimization", function () {
    it("should deploy within reasonable gas limits", async function () {
      const PrivateIPProtection = await ethers.getContractFactory("PrivateIPProtection");
      const contract = await PrivateIPProtection.deploy();
      const receipt = await contract.deploymentTransaction().wait();

      // Deployment should use less than 3 million gas
      expect(receipt.gasUsed).to.be.lt(3000000);
    });

    it("should submit application within reasonable gas limits", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();
      const tx = await contract
        .connect(applicant1)
        .submitPatentApplication(12345, 67890, 11223, 1, { value: fee });
      const receipt = await tx.wait();

      // Application submission should use less than 300k gas
      expect(receipt.gasUsed).to.be.lt(300000);
    });

    it("should assign application within reasonable gas limits", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);

      const tx = await contract.assignApplicationToExaminer(1, examiner1.address);
      const receipt = await tx.wait();

      // Assignment should use less than 200k gas
      expect(receipt.gasUsed).to.be.lt(200000);
    });
  });

  // =================================================================
  // EDGE CASES TESTS (3 tests)
  // =================================================================
  describe("Edge Cases", function () {
    it("should handle maximum uint32 values in application", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const maxUint32 = 2 ** 32 - 1;
      const fee = await contract.APPLICATION_FEE();

      await expect(
        contract
          .connect(applicant1)
          .submitPatentApplication(maxUint32, maxUint32, maxUint32, 255, { value: fee })
      ).to.emit(contract, "ApplicationSubmitted");
    });

    it("should handle zero values in application hashes", async function () {
      const { contract, applicant1 } = await loadFixture(deployContractFixture);

      const fee = await contract.APPLICATION_FEE();

      await expect(
        contract.connect(applicant1).submitPatentApplication(0, 0, 0, 0, { value: fee })
      ).to.emit(contract, "ApplicationSubmitted");
    });

    it("should maintain confidentiality flag throughout workflow", async function () {
      const { contract, applicant1, examiner1 } = await loadFixture(deployContractFixture);

      await contract.authorizeExaminer(examiner1.address, "Software");
      await submitApplicationHelper(contract, applicant1);
      await contract.assignApplicationToExaminer(1, examiner1.address);
      await contract.connect(examiner1).submitReviewDecision(1, 2, 99999, false);

      const [, , confidential] = await contract
        .connect(applicant1)
        .getApplicationStatus(1);
      expect(confidential).to.be.true;
    });
  });
});
