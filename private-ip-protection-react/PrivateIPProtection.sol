// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateIPProtection is SepoliaConfig {

    address public patentOffice;
    uint256 public applicationCount;
    uint256 public constant APPLICATION_FEE = 0.1 ether;
    uint256 public constant REVIEW_PERIOD = 30 days;

    enum ApplicationStatus {
        Pending,
        UnderReview,
        Approved,
        Rejected,
        Withdrawn
    }

    struct PatentApplication {
        address applicant;
        euint32 encryptedTitle; // Encrypted title hash
        euint32 encryptedDescription; // Encrypted description hash
        euint32 encryptedClaims; // Encrypted claims hash
        euint8 category; // Patent category (encrypted)
        uint256 submissionTime;
        uint256 reviewDeadline;
        ApplicationStatus status;
        address assignedExaminer;
        bool feePaid;
        bool confidentialityMaintained;
    }

    struct ExaminerProfile {
        address examiner;
        bool isActive;
        uint256 assignedApplications;
        uint256 completedReviews;
        string specialization;
    }

    struct ReviewDecision {
        address examiner;
        ApplicationStatus decision;
        euint32 encryptedFeedback;
        uint256 decisionTime;
        bool isPublic;
    }

    mapping(uint256 => PatentApplication) public applications;
    mapping(address => bool) public authorizedExaminers;
    mapping(uint256 => ReviewDecision) public reviewDecisions;
    mapping(address => ExaminerProfile) public examinerProfiles;
    mapping(address => uint256[]) public applicantApplications;
    mapping(uint256 => address[]) public applicationViewers;

    event ApplicationSubmitted(
        uint256 indexed applicationId,
        address indexed applicant,
        uint256 submissionTime
    );

    event ApplicationAssigned(
        uint256 indexed applicationId,
        address indexed examiner
    );

    event ReviewCompleted(
        uint256 indexed applicationId,
        ApplicationStatus decision,
        address indexed examiner
    );

    event ConfidentialityBreach(
        uint256 indexed applicationId,
        address indexed violator
    );

    event ExaminerAuthorized(address indexed examiner, string specialization);
    event ExaminerRevoked(address indexed examiner);

    modifier onlyPatentOffice() {
        require(msg.sender == patentOffice, "Only patent office authorized");
        _;
    }

    modifier onlyAuthorizedExaminer() {
        require(authorizedExaminers[msg.sender], "Not authorized examiner");
        _;
    }

    modifier onlyApplicantOrExaminer(uint256 applicationId) {
        require(
            applications[applicationId].applicant == msg.sender ||
            applications[applicationId].assignedExaminer == msg.sender ||
            msg.sender == patentOffice,
            "Access denied"
        );
        _;
    }

    constructor() {
        patentOffice = msg.sender;
        applicationCount = 0;
    }

    function submitPatentApplication(
        uint32 titleHash,
        uint32 descriptionHash,
        uint32 claimsHash,
        uint8 patentCategory
    ) external payable {
        require(msg.value >= APPLICATION_FEE, "Insufficient fee");

        applicationCount++;

        // Encrypt sensitive application data
        euint32 encryptedTitle = FHE.asEuint32(titleHash);
        euint32 encryptedDescription = FHE.asEuint32(descriptionHash);
        euint32 encryptedClaims = FHE.asEuint32(claimsHash);
        euint8 encryptedCategory = FHE.asEuint8(patentCategory);

        applications[applicationCount] = PatentApplication({
            applicant: msg.sender,
            encryptedTitle: encryptedTitle,
            encryptedDescription: encryptedDescription,
            encryptedClaims: encryptedClaims,
            category: encryptedCategory,
            submissionTime: block.timestamp,
            reviewDeadline: block.timestamp + REVIEW_PERIOD,
            status: ApplicationStatus.Pending,
            assignedExaminer: address(0),
            feePaid: true,
            confidentialityMaintained: true
        });

        // Grant access permissions for FHE operations
        FHE.allowThis(encryptedTitle);
        FHE.allowThis(encryptedDescription);
        FHE.allowThis(encryptedClaims);
        FHE.allowThis(encryptedCategory);
        FHE.allow(encryptedTitle, msg.sender);
        FHE.allow(encryptedDescription, msg.sender);
        FHE.allow(encryptedClaims, msg.sender);
        FHE.allow(encryptedCategory, msg.sender);

        applicantApplications[msg.sender].push(applicationCount);

        emit ApplicationSubmitted(applicationCount, msg.sender, block.timestamp);
    }

    function authorizeExaminer(address examiner, string memory specialization)
        external onlyPatentOffice
    {
        require(!authorizedExaminers[examiner], "Already authorized");

        authorizedExaminers[examiner] = true;
        examinerProfiles[examiner] = ExaminerProfile({
            examiner: examiner,
            isActive: true,
            assignedApplications: 0,
            completedReviews: 0,
            specialization: specialization
        });

        emit ExaminerAuthorized(examiner, specialization);
    }

    function assignApplicationToExaminer(uint256 applicationId, address examiner)
        external onlyPatentOffice
    {
        require(authorizedExaminers[examiner], "Examiner not authorized");
        require(applications[applicationId].applicant != address(0), "Application not found");
        require(applications[applicationId].status == ApplicationStatus.Pending, "Application not pending");

        applications[applicationId].assignedExaminer = examiner;
        applications[applicationId].status = ApplicationStatus.UnderReview;

        examinerProfiles[examiner].assignedApplications++;

        // Grant examiner access to encrypted data
        PatentApplication storage app = applications[applicationId];
        FHE.allow(app.encryptedTitle, examiner);
        FHE.allow(app.encryptedDescription, examiner);
        FHE.allow(app.encryptedClaims, examiner);
        FHE.allow(app.category, examiner);

        emit ApplicationAssigned(applicationId, examiner);
    }

    function submitReviewDecision(
        uint256 applicationId,
        ApplicationStatus decision,
        uint32 feedbackHash,
        bool makePublic
    ) external onlyAuthorizedExaminer {
        require(applications[applicationId].assignedExaminer == msg.sender, "Not assigned to you");
        require(applications[applicationId].status == ApplicationStatus.UnderReview, "Not under review");
        require(
            decision == ApplicationStatus.Approved ||
            decision == ApplicationStatus.Rejected,
            "Invalid decision"
        );

        euint32 encryptedFeedback = FHE.asEuint32(feedbackHash);

        applications[applicationId].status = decision;

        reviewDecisions[applicationId] = ReviewDecision({
            examiner: msg.sender,
            decision: decision,
            encryptedFeedback: encryptedFeedback,
            decisionTime: block.timestamp,
            isPublic: makePublic
        });

        examinerProfiles[msg.sender].completedReviews++;

        // Grant access to feedback
        FHE.allowThis(encryptedFeedback);
        FHE.allow(encryptedFeedback, applications[applicationId].applicant);
        if (makePublic) {
            // In a real implementation, this would be handled differently
            // for public access while maintaining some privacy controls
        }

        emit ReviewCompleted(applicationId, decision, msg.sender);
    }

    function withdrawApplication(uint256 applicationId) external {
        require(applications[applicationId].applicant == msg.sender, "Not your application");
        require(
            applications[applicationId].status == ApplicationStatus.Pending ||
            applications[applicationId].status == ApplicationStatus.UnderReview,
            "Cannot withdraw at this stage"
        );

        applications[applicationId].status = ApplicationStatus.Withdrawn;
    }

    function requestConfidentialAccess(uint256 applicationId) external {
        require(applications[applicationId].applicant != address(0), "Application not found");

        // Only specific roles can request access
        require(
            msg.sender == patentOffice ||
            authorizedExaminers[msg.sender] ||
            msg.sender == applications[applicationId].applicant,
            "Access denied"
        );

        applicationViewers[applicationId].push(msg.sender);

        // Grant limited access based on role
        PatentApplication storage app = applications[applicationId];
        if (authorizedExaminers[msg.sender]) {
            FHE.allow(app.encryptedTitle, msg.sender);
            FHE.allow(app.category, msg.sender);
        }
    }

    function verifyApplicationIntegrity(uint256 applicationId)
        external view onlyApplicantOrExaminer(applicationId)
        returns (bool)
    {
        PatentApplication storage app = applications[applicationId];
        return app.confidentialityMaintained && app.feePaid;
    }

    function getApplicationStatus(uint256 applicationId)
        external view
        returns (ApplicationStatus, uint256, bool)
    {
        PatentApplication storage app = applications[applicationId];
        require(
            app.applicant == msg.sender ||
            app.assignedExaminer == msg.sender ||
            msg.sender == patentOffice,
            "Access denied"
        );

        return (app.status, app.reviewDeadline, app.confidentialityMaintained);
    }

    function getApplicantApplications(address applicant)
        external view
        returns (uint256[] memory)
    {
        require(
            applicant == msg.sender ||
            msg.sender == patentOffice,
            "Access denied"
        );
        return applicantApplications[applicant];
    }

    function getExaminerWorkload(address examiner)
        external view
        returns (uint256 assigned, uint256 completed, bool active)
    {
        require(
            examiner == msg.sender ||
            msg.sender == patentOffice,
            "Access denied"
        );

        ExaminerProfile storage profile = examinerProfiles[examiner];
        return (profile.assignedApplications, profile.completedReviews, profile.isActive);
    }

    function emergencyRevealForDispute(uint256 applicationId)
        external onlyPatentOffice
    {
        require(applications[applicationId].applicant != address(0), "Application not found");

        // This would trigger a controlled decryption process for legal disputes
        PatentApplication storage app = applications[applicationId];

        // Request decryption of critical data for dispute resolution
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(app.encryptedTitle);

        FHE.requestDecryption(cts, this.processEmergencyReveal.selector);

        applications[applicationId].confidentialityMaintained = false;
    }

    function processEmergencyReveal(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory signatures
    ) external {
        FHE.checkSignatures(requestId, cleartexts, signatures);

        // Decode the revealed data
        uint32 titleHash = abi.decode(cleartexts, (uint32));

        // Process the revealed data for dispute resolution
        // Implementation would store or process the decrypted data as needed
    }

    function revokeExaminerAccess(address examiner) external onlyPatentOffice {
        require(authorizedExaminers[examiner], "Not an examiner");

        authorizedExaminers[examiner] = false;
        examinerProfiles[examiner].isActive = false;

        emit ExaminerRevoked(examiner);
    }

    function updatePatentOffice(address newOffice) external onlyPatentOffice {
        require(newOffice != address(0), "Invalid address");
        patentOffice = newOffice;
    }

    function withdrawFees() external onlyPatentOffice {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        payable(patentOffice).transfer(balance);
    }
}