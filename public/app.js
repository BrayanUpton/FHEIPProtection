// Contract configuration
const CONTRACT_ADDRESS = "0xCE563F9eCa84893C97c1212E0CdFeA823ae7d76B"; // Update this with your deployed contract address
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            }
        ],
        "name": "ApplicationAssigned",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "applicant",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "submissionTime",
                "type": "uint256"
            }
        ],
        "name": "ApplicationSubmitted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "violator",
                "type": "address"
            }
        ],
        "name": "ConfidentialityBreach",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "specialization",
                "type": "string"
            }
        ],
        "name": "ExaminerAuthorized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            }
        ],
        "name": "ExaminerRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "enum PrivateIPProtection.ApplicationStatus",
                "name": "decision",
                "type": "uint8"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            }
        ],
        "name": "ReviewCompleted",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "APPLICATION_FEE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "REVIEW_PERIOD",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "applicationCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "applicantApplications",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "applications",
        "outputs": [
            {
                "internalType": "address",
                "name": "applicant",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "submissionTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reviewDeadline",
                "type": "uint256"
            },
            {
                "internalType": "enum PrivateIPProtection.ApplicationStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "assignedExaminer",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "feePaid",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "confidentialityMaintained",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            }
        ],
        "name": "assignApplicationToExaminer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "specialization",
                "type": "string"
            }
        ],
        "name": "authorizeExaminer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "authorizedExaminers",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            }
        ],
        "name": "emergencyRevealForDispute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "examinerProfiles",
        "outputs": [
            {
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "assignedApplications",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "completedReviews",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "specialization",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "applicant",
                "type": "address"
            }
        ],
        "name": "getApplicantApplications",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            }
        ],
        "name": "getApplicationStatus",
        "outputs": [
            {
                "internalType": "enum PrivateIPProtection.ApplicationStatus",
                "name": "",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            }
        ],
        "name": "getExaminerWorkload",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "assigned",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "completed",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "patentOffice",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "cleartexts",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "signatures",
                "type": "bytes"
            }
        ],
        "name": "processEmergencyReveal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            }
        ],
        "name": "requestConfidentialAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "reviewDecisions",
        "outputs": [
            {
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            },
            {
                "internalType": "enum PrivateIPProtection.ApplicationStatus",
                "name": "decision",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "decisionTime",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isPublic",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "examiner",
                "type": "address"
            }
        ],
        "name": "revokeExaminerAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint32",
                "name": "titleHash",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "descriptionHash",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "claimsHash",
                "type": "uint32"
            },
            {
                "internalType": "uint8",
                "name": "patentCategory",
                "type": "uint8"
            }
        ],
        "name": "submitPatentApplication",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            },
            {
                "internalType": "enum PrivateIPProtection.ApplicationStatus",
                "name": "decision",
                "type": "uint8"
            },
            {
                "internalType": "uint32",
                "name": "feedbackHash",
                "type": "uint32"
            },
            {
                "internalType": "bool",
                "name": "makePublic",
                "type": "bool"
            }
        ],
        "name": "submitReviewDecision",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOffice",
                "type": "address"
            }
        ],
        "name": "updatePatentOffice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            }
        ],
        "name": "verifyApplicationIntegrity",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "applicationId",
                "type": "uint256"
            }
        ],
        "name": "withdrawApplication",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Global variables
let provider = null;
let signer = null;
let contract = null;
let userAddress = null;

// Application status mapping
const STATUS_NAMES = {
    0: 'Pending',
    1: 'Under Review',
    2: 'Approved',
    3: 'Rejected',
    4: 'Withdrawn'
};

// Utility functions
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');

    messageElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatEther(weiValue) {
    return ethers.utils.formatEther(weiValue);
}

// Wallet connection
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showNotification('Please install MetaMask to use this application', 'error');
            return;
        }

        showLoading();

        // Request wallet connection
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        // Initialize contract
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Update UI
        updateWalletUI();

        // Load contract info
        await loadContractInfo();

        showNotification('Wallet connected successfully', 'success');

    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet', 'error');
    } finally {
        hideLoading();
    }
}

async function updateWalletUI() {
    if (!userAddress) return;

    const connectBtn = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const addressElement = document.getElementById('walletAddress');
    const balanceElement = document.getElementById('walletBalance');

    connectBtn.style.display = 'none';
    walletInfo.classList.remove('hidden');

    addressElement.textContent = formatAddress(userAddress);

    try {
        const balance = await provider.getBalance(userAddress);
        balanceElement.textContent = `${formatEther(balance)} ETH`;
    } catch (error) {
        balanceElement.textContent = 'Error loading balance';
    }
}

async function loadContractInfo() {
    try {
        const appCount = await contract.applicationCount();
        const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);

        document.getElementById('appCount').textContent = appCount.toString();
        document.getElementById('contractBalance').textContent = formatEther(contractBalance);
    } catch (error) {
        console.error('Error loading contract info:', error);
    }
}

// Patent application submission
async function submitPatentApplication(event) {
    event.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const title = document.getElementById('patentTitle').value;
        const description = document.getElementById('patentDescription').value;
        const claims = document.getElementById('patentClaims').value;
        const category = parseInt(document.getElementById('patentCategory').value);

        // Hash the sensitive data
        const titleHash = hashString(title);
        const descriptionHash = hashString(description);
        const claimsHash = hashString(claims);

        // Submit transaction
        const tx = await contract.submitPatentApplication(
            titleHash,
            descriptionHash,
            claimsHash,
            category,
            { value: ethers.utils.parseEther("0.1") }
        );

        await tx.wait();

        showNotification('Patent application submitted successfully!', 'success');
        document.getElementById('patentForm').reset();

        // Refresh contract info
        await loadContractInfo();

    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('Failed to submit application', 'error');
    } finally {
        hideLoading();
    }
}

// Load user applications
async function loadMyApplications() {
    if (!contract || !userAddress) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const applicationIds = await contract.getApplicantApplications(userAddress);
        const applicationsList = document.getElementById('applicationsList');

        if (applicationIds.length === 0) {
            applicationsList.innerHTML = '<p>No applications found.</p>';
            return;
        }

        let html = '';

        for (const id of applicationIds) {
            try {
                const [status, deadline, confidential] = await contract.getApplicationStatus(id);

                html += `
                    <div class="application-item">
                        <div class="application-header">
                            <span class="application-id">Application #${id}</span>
                            <span class="status-badge status-${STATUS_NAMES[status].toLowerCase().replace(' ', '-')}">${STATUS_NAMES[status]}</span>
                        </div>
                        <p><strong>Review Deadline:</strong> ${new Date(deadline * 1000).toLocaleDateString()}</p>
                        <p><strong>Confidentiality:</strong> ${confidential ? 'Maintained' : 'Compromised'}</p>
                    </div>
                `;
            } catch (error) {
                console.error(`Error loading application ${id}:`, error);
            }
        }

        applicationsList.innerHTML = html;

    } catch (error) {
        console.error('Error loading applications:', error);
        showNotification('Failed to load applications', 'error');
    } finally {
        hideLoading();
    }
}

// Check application status
async function checkApplicationStatus() {
    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const applicationId = document.getElementById('applicationId').value;

        if (!applicationId) {
            showNotification('Please enter an application ID', 'error');
            return;
        }

        const [status, deadline, confidential] = await contract.getApplicationStatus(applicationId);

        const resultDiv = document.getElementById('statusResult');
        resultDiv.innerHTML = `
            <h3>Application #${applicationId}</h3>
            <p><strong>Status:</strong> <span class="status-badge status-${STATUS_NAMES[status].toLowerCase().replace(' ', '-')}">${STATUS_NAMES[status]}</span></p>
            <p><strong>Review Deadline:</strong> ${new Date(deadline * 1000).toLocaleDateString()}</p>
            <p><strong>Confidentiality:</strong> ${confidential ? 'Maintained' : 'Compromised'}</p>
        `;

    } catch (error) {
        console.error('Error checking status:', error);
        showNotification('Failed to check application status', 'error');
    } finally {
        hideLoading();
    }
}

// Examiner functions
async function loadExaminerWorkload() {
    if (!contract || !userAddress) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const [assigned, completed, active] = await contract.getExaminerWorkload(userAddress);

        const workloadDiv = document.getElementById('examinerWorkload');
        workloadDiv.innerHTML = `
            <div class="workload-stat">
                <h3>${assigned}</h3>
                <p>Assigned Applications</p>
            </div>
            <div class="workload-stat">
                <h3>${completed}</h3>
                <p>Completed Reviews</p>
            </div>
            <div class="workload-stat">
                <h3>${active ? 'Active' : 'Inactive'}</h3>
                <p>Status</p>
            </div>
        `;

    } catch (error) {
        console.error('Error loading workload:', error);
        showNotification('Failed to load examiner workload', 'error');
    } finally {
        hideLoading();
    }
}

async function submitReviewDecision(event) {
    event.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const applicationId = document.getElementById('reviewApplicationId').value;
        const decision = parseInt(document.getElementById('reviewDecision').value);
        const feedback = document.getElementById('reviewFeedback').value;
        const makePublic = document.getElementById('makePublic').checked;

        const feedbackHash = hashString(feedback);

        const tx = await contract.submitReviewDecision(
            applicationId,
            decision,
            feedbackHash,
            makePublic
        );

        await tx.wait();

        showNotification('Review decision submitted successfully!', 'success');
        document.getElementById('reviewForm').reset();

    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Failed to submit review decision', 'error');
    } finally {
        hideLoading();
    }
}

// Admin functions
async function authorizeExaminer(event) {
    event.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const examinerAddress = document.getElementById('examinerAddress').value;
        const specialization = document.getElementById('specialization').value;

        const tx = await contract.authorizeExaminer(examinerAddress, specialization);
        await tx.wait();

        showNotification('Examiner authorized successfully!', 'success');
        document.getElementById('examinerForm').reset();

    } catch (error) {
        console.error('Error authorizing examiner:', error);
        showNotification('Failed to authorize examiner', 'error');
    } finally {
        hideLoading();
    }
}

async function assignApplication(event) {
    event.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const applicationId = document.getElementById('assignApplicationId').value;
        const examinerAddress = document.getElementById('assignExaminerAddress').value;

        const tx = await contract.assignApplicationToExaminer(applicationId, examinerAddress);
        await tx.wait();

        showNotification('Application assigned successfully!', 'success');
        document.getElementById('assignForm').reset();

    } catch (error) {
        console.error('Error assigning application:', error);
        showNotification('Failed to assign application', 'error');
    } finally {
        hideLoading();
    }
}

async function withdrawFees() {
    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    try {
        showLoading();

        const tx = await contract.withdrawFees();
        await tx.wait();

        showNotification('Fees withdrawn successfully!', 'success');
        await loadContractInfo();

    } catch (error) {
        console.error('Error withdrawing fees:', error);
        showNotification('Failed to withdraw fees', 'error');
    } finally {
        hideLoading();
    }
}

// Tab switching
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active classes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active classes
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();

    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    // Patent submission
    document.getElementById('patentForm').addEventListener('submit', submitPatentApplication);

    // Application status
    document.getElementById('loadApplications').addEventListener('click', loadMyApplications);
    document.getElementById('checkStatus').addEventListener('click', checkApplicationStatus);

    // Examiner functions
    document.getElementById('loadWorkload').addEventListener('click', loadExaminerWorkload);
    document.getElementById('reviewForm').addEventListener('submit', submitReviewDecision);

    // Admin functions
    document.getElementById('examinerForm').addEventListener('submit', authorizeExaminer);
    document.getElementById('assignForm').addEventListener('submit', assignApplication);
    document.getElementById('withdrawFees').addEventListener('click', withdrawFees);

    // Notification close
    document.getElementById('closeNotification').addEventListener('click', () => {
        document.getElementById('notification').classList.add('hidden');
    });

    // Auto-connect if wallet was previously connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            userAddress = null;
            contract = null;
            signer = null;
            provider = null;

            document.getElementById('connectWallet').style.display = 'block';
            document.getElementById('walletInfo').classList.add('hidden');
        } else {
            // Account changed, reconnect
            connectWallet();
        }
    });

    window.ethereum.on('chainChanged', () => {
        // Reload page on network change
        window.location.reload();
    });
}