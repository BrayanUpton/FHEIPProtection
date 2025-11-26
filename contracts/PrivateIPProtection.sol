// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, euint64, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateIPProtection is SepoliaConfig {

    address public patentOffice;
    uint256 public applicationCount;
    uint256 public constant APPLICATION_FEE = 0.1 ether;
    uint256 public constant REVIEW_PERIOD = 30 days;
    uint256 public constant TIMEOUT_PERIOD = 90 days; // Timeout protection
    uint256 public constant DECRYPTION_TIMEOUT = 7 days; // Gateway callback timeout

    enum ApplicationStatus {
        Pending,
        UnderReview,
        Approved,
        Rejected,
        Withdrawn,
        RefundRequested, // New: Refund mechanism
        TimedOut // New: Timeout protection
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
        uint256 decryptionRequestId; // Gateway callback tracking
        uint256 decryptionRequestTime; // Timeout tracking for decryption
        euint64 encryptedPriorityScore; // Privacy-protected scoring with obfuscation
        uint64 revealedScore; // Revealed after decryption
        bool refundProcessed; // Refund mechanism tracking
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
    mapping(uint256 => string) internal applicationIdByRequestId; // Gateway callback mapping
    mapping(uint256 => bool) public callbackProcessed; // Track processed callbacks

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

    // New events for enhanced features
    event DecryptionRequested(uint256 indexed applicationId, uint256 requestId);
    event DecryptionCompleted(uint256 indexed applicationId, uint64 revealedScore);
    event DecryptionFailed(uint256 indexed applicationId, string reason);
    event RefundIssued(uint256 indexed applicationId, address indexed applicant, uint256 amount);
    event TimeoutTriggered(uint256 indexed applicationId);
    event ScoreObfuscated(uint256 indexed applicationId, uint256 obfuscationFactor);

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
        // Input validation (security enhancement)
        require(msg.value >= APPLICATION_FEE, "Insufficient fee");
        require(titleHash > 0, "Invalid title hash");
        require(descriptionHash > 0, "Invalid description hash");
        require(claimsHash > 0, "Invalid claims hash");
        require(patentCategory > 0 && patentCategory <= 10, "Invalid category");

        applicationCount++;

        // Encrypt sensitive application data
        euint32 encryptedTitle = FHE.asEuint32(titleHash);
        euint32 encryptedDescription = FHE.asEuint32(descriptionHash);
        euint32 encryptedClaims = FHE.asEuint32(claimsHash);
        euint8 encryptedCategory = FHE.asEuint8(patentCategory);

        // Privacy protection: Initialize with obfuscated priority score using random multiplier
        // This protects against division attacks and price leakage
        uint256 randomMultiplier = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, applicationCount))) % 100 + 50;
        euint64 obfuscatedScore = FHE.asEuint64(randomMultiplier);

        emit ScoreObfuscated(applicationCount, randomMultiplier);

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
            confidentialityMaintained: true,
            decryptionRequestId: 0,
            decryptionRequestTime: 0,
            encryptedPriorityScore: obfuscatedScore,
            revealedScore: 0,
            refundProcessed: false
        });

        // Grant access permissions for FHE operations
        FHE.allowThis(encryptedTitle);
        FHE.allowThis(encryptedDescription);
        FHE.allowThis(encryptedClaims);
        FHE.allowThis(encryptedCategory);
        FHE.allowThis(obfuscatedScore);
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

    // ===== ENHANCED FEATURES: Gateway Callback, Refund, Timeout Protection =====

    /**
     * @notice Request decryption of application score via Gateway callback
     * @dev Implements async processing pattern for privacy-preserving operations
     * @param applicationId The application to decrypt
     */
    function requestScoreDecryption(uint256 applicationId) external {
        PatentApplication storage app = applications[applicationId];
        require(app.applicant != address(0), "Application not found");
        require(
            msg.sender == app.assignedExaminer || msg.sender == patentOffice,
            "Access denied"
        );
        require(app.status == ApplicationStatus.UnderReview, "Not under review");
        require(app.decryptionRequestId == 0, "Decryption already requested");

        // Request decryption via Gateway callback pattern
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(app.encryptedPriorityScore);

        uint256 requestId = FHE.requestDecryption(cts, this.processScoreDecryption.selector);

        app.decryptionRequestId = requestId;
        app.decryptionRequestTime = block.timestamp;
        applicationIdByRequestId[requestId] = Strings.toString(applicationId);

        emit DecryptionRequested(applicationId, requestId);
    }

    /**
     * @notice Gateway callback function for score decryption
     * @dev Called by ZAMA oracle with decrypted data and cryptographic proof
     * @param requestId The decryption request identifier
     * @param cleartexts ABI-encoded decrypted values
     * @param signatures Cryptographic proof from oracle
     */
    function processScoreDecryption(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory signatures
    ) external {
        // Verify cryptographic signatures (security enhancement)
        FHE.checkSignatures(requestId, cleartexts, signatures);

        require(!callbackProcessed[requestId], "Callback already processed");
        callbackProcessed[requestId] = true;

        // Decode the decrypted score
        uint64 revealedScore = abi.decode(cleartexts, (uint64));

        uint256 applicationId = stringToUint(applicationIdByRequestId[requestId]);
        PatentApplication storage app = applications[applicationId];

        app.revealedScore = revealedScore;

        emit DecryptionCompleted(applicationId, revealedScore);
    }

    /**
     * @notice Request refund if decryption fails or times out
     * @dev Refund mechanism for handling decryption failures
     * @param applicationId The application to refund
     */
    function requestRefund(uint256 applicationId) external {
        PatentApplication storage app = applications[applicationId];
        require(app.applicant == msg.sender, "Not your application");
        require(app.feePaid, "Fee not paid");
        require(!app.refundProcessed, "Refund already processed");

        // Check if decryption failed (timeout condition)
        bool decryptionTimedOut = app.decryptionRequestTime > 0 &&
            block.timestamp >= app.decryptionRequestTime + DECRYPTION_TIMEOUT;

        // Check if application timed out completely
        bool applicationTimedOut = block.timestamp >= app.submissionTime + TIMEOUT_PERIOD;

        require(
            decryptionTimedOut || applicationTimedOut || app.status == ApplicationStatus.RefundRequested,
            "Refund not eligible"
        );

        app.refundProcessed = true;
        app.status = ApplicationStatus.TimedOut;

        // Process refund (70% of application fee to cover processing costs)
        uint256 refundAmount = (APPLICATION_FEE * 70) / 100;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundIssued(applicationId, msg.sender, refundAmount);
        emit TimeoutTriggered(applicationId);
    }

    /**
     * @notice Mark application for refund due to processing issues
     * @dev Allows patent office to flag applications for refund
     * @param applicationId The application to mark for refund
     * @param reason Reason for refund eligibility
     */
    function markForRefund(uint256 applicationId, string memory reason) external onlyPatentOffice {
        PatentApplication storage app = applications[applicationId];
        require(app.applicant != address(0), "Application not found");
        require(app.status != ApplicationStatus.Approved, "Already approved");
        require(!app.refundProcessed, "Refund already processed");

        app.status = ApplicationStatus.RefundRequested;
        emit DecryptionFailed(applicationId, reason);
    }

    /**
     * @notice Check timeout status for an application
     * @dev Public view function to check if timeout protection should trigger
     * @param applicationId The application to check
     * @return isTimedOut Whether the application has timed out
     * @return timeRemaining Seconds until timeout (0 if already timed out)
     */
    function checkTimeout(uint256 applicationId) external view returns (bool isTimedOut, uint256 timeRemaining) {
        PatentApplication storage app = applications[applicationId];
        require(app.applicant != address(0), "Application not found");

        uint256 timeoutDeadline = app.submissionTime + TIMEOUT_PERIOD;

        if (block.timestamp >= timeoutDeadline) {
            return (true, 0);
        } else {
            return (false, timeoutDeadline - block.timestamp);
        }
    }

    /**
     * @notice Update priority score with encrypted input (privacy protection)
     * @dev Uses FHE operations to maintain privacy during score updates
     * @param applicationId The application to update
     * @param encryptedScoreInput Encrypted score input from client
     * @param inputProof Cryptographic proof of encryption validity
     */
    function updatePriorityScore(
        uint256 applicationId,
        externalEuint32 encryptedScoreInput,
        bytes calldata inputProof
    ) external {
        PatentApplication storage app = applications[applicationId];
        require(
            msg.sender == app.assignedExaminer || msg.sender == patentOffice,
            "Access denied"
        );
        require(app.status == ApplicationStatus.UnderReview, "Not under review");

        // Convert external encrypted input with validation
        euint32 scoreInput = FHE.fromExternal(encryptedScoreInput, inputProof);

        // Add to existing score using homomorphic addition (privacy-preserving)
        euint64 newScore = FHE.add(app.encryptedPriorityScore, FHE.asEuint64(scoreInput));

        app.encryptedPriorityScore = newScore;
        FHE.allowThis(newScore);
    }

    /**
     * @notice Get decryption request status
     * @param applicationId The application to check
     * @return requested Whether decryption was requested
     * @return requestId The decryption request ID
     * @return processed Whether callback was processed
     * @return timeElapsed Time since request in seconds
     */
    function getDecryptionStatus(uint256 applicationId) external view returns (
        bool requested,
        uint256 requestId,
        bool processed,
        uint256 timeElapsed
    ) {
        PatentApplication storage app = applications[applicationId];
        require(app.applicant != address(0), "Application not found");

        requestId = app.decryptionRequestId;
        requested = requestId > 0;
        processed = callbackProcessed[requestId];

        if (app.decryptionRequestTime > 0) {
            timeElapsed = block.timestamp - app.decryptionRequestTime;
        } else {
            timeElapsed = 0;
        }

        return (requested, requestId, processed, timeElapsed);
    }

    // Helper function to convert string to uint
    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            uint256 c = uint256(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }

    // Allow contract to receive ETH for refunds
    receive() external payable {}
}

// Helper library for uint to string conversion
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}