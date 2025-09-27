// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title VeriRWA0GIntegration
 * @dev Integration contract for 0G Network services (Storage, Compute, DA)
 * Handles verification proofs, data availability, and compute task management
 */
contract VeriRWA0GIntegration is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    struct StorageProof {
        string fileHash;        // 0G Storage file hash
        bytes32 merkleRoot;     // Merkle tree root from 0G Storage
        uint256 fileSize;       // File size in bytes
        uint256 timestamp;      // Upload timestamp
        address uploader;       // Address that uploaded the file
        bool verified;          // Whether storage proof is verified
    }

    struct ComputeTask {
        uint256 taskId;         // 0G Compute task ID
        string serviceId;       // AI service used (llama, deepseek, etc.)
        bytes32 inputHash;      // Hash of input data
        bytes32 outputHash;     // Hash of output data
        uint256 computeCost;    // Cost in OG tokens
        address requester;      // Task requester
        uint256 timestamp;      // Task completion timestamp
        bool verified;          // Whether task is verified
    }

    struct DAProof {
        bytes32 dataHash;       // Hash of data stored on 0G DA
        uint256 blockHeight;    // Block height on 0G DA
        bytes32 commitment;     // Data availability commitment
        bytes samplingProof;    // Sampling proof for verification
        uint256 timestamp;      // DA submission timestamp
        bool verified;          // Whether DA proof is verified
    }

    struct VerificationOracle {
        address oracle;         // Oracle address
        bool active;            // Whether oracle is active
        uint256 reputation;     // Oracle reputation score
        uint256 totalTasks;     // Total tasks verified
        uint256 lastActivity;   // Last activity timestamp
    }

    // State variables
    mapping(string => StorageProof) public storageProofs;
    mapping(uint256 => ComputeTask) public computeTasks;
    mapping(bytes32 => DAProof) public daProofs;
    mapping(address => VerificationOracle) public verificationOracles;
    mapping(uint256 => string[]) public assetStorageHashes; // Asset ID -> Storage hashes
    mapping(uint256 => uint256[]) public assetComputeTasks; // Asset ID -> Compute task IDs
    mapping(uint256 => bytes32[]) public assetDAProofs; // Asset ID -> DA proof hashes

    address public zgStorageIndexer;
    address public zgComputeBroker;
    address public zgDAContract;
    address public veriRWANFT;

    uint256 public constant ORACLE_REPUTATION_THRESHOLD = 70;
    uint256 public constant VERIFICATION_TIMEOUT = 7 days;

    event StorageProofSubmitted(string indexed fileHash, address indexed uploader, uint256 fileSize);
    event ComputeTaskRegistered(uint256 indexed taskId, string serviceId, address requester);
    event DAProofSubmitted(bytes32 indexed dataHash, uint256 blockHeight, bytes32 commitment);
    event VerificationCompleted(bytes32 indexed proofHash, address oracle, bool verified);
    event OracleRegistered(address indexed oracle, uint256 reputation);
    event OracleReputationUpdated(address indexed oracle, uint256 newReputation);

    modifier onlyVerifiedOracle() {
        require(verificationOracles[msg.sender].active, "Not a verified oracle");
        require(verificationOracles[msg.sender].reputation >= ORACLE_REPUTATION_THRESHOLD, "Insufficient reputation");
        _;
    }

    modifier onlyVeriRWANFT() {
        require(msg.sender == veriRWANFT, "Only VeriRWA NFT contract");
        _;
    }

    constructor(
        address _zgStorageIndexer,
        address _zgComputeBroker,
        address _zgDAContract
    ) Ownable(msg.sender) {
        zgStorageIndexer = _zgStorageIndexer;
        zgComputeBroker = _zgComputeBroker;
        zgDAContract = _zgDAContract;
    }

    /**
     * @dev Set VeriRWA NFT contract address
     */
    function setVeriRWANFT(address _veriRWANFT) external onlyOwner {
        veriRWANFT = _veriRWANFT;
    }

    /**
     * @dev Submit storage proof for 0G Storage file
     */
    function submitStorageProof(
        string memory fileHash,
        bytes32 merkleRoot,
        uint256 fileSize,
        uint256 assetId
    ) external {
        require(bytes(fileHash).length > 0, "Invalid file hash");
        require(merkleRoot != bytes32(0), "Invalid Merkle root");
        require(fileSize > 0, "Invalid file size");

        storageProofs[fileHash] = StorageProof({
            fileHash: fileHash,
            merkleRoot: merkleRoot,
            fileSize: fileSize,
            timestamp: block.timestamp,
            uploader: msg.sender,
            verified: false
        });

        // Link to asset if provided
        if (assetId > 0) {
            assetStorageHashes[assetId].push(fileHash);
        }

        emit StorageProofSubmitted(fileHash, msg.sender, fileSize);
    }

    /**
     * @dev Register compute task from 0G Compute Network
     */
    function registerComputeTask(
        uint256 taskId,
        string memory serviceId,
        bytes32 inputHash,
        bytes32 outputHash,
        uint256 computeCost,
        uint256 assetId
    ) external {
        require(taskId > 0, "Invalid task ID");
        require(bytes(serviceId).length > 0, "Invalid service ID");
        require(inputHash != bytes32(0), "Invalid input hash");
        require(outputHash != bytes32(0), "Invalid output hash");

        computeTasks[taskId] = ComputeTask({
            taskId: taskId,
            serviceId: serviceId,
            inputHash: inputHash,
            outputHash: outputHash,
            computeCost: computeCost,
            requester: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });

        // Link to asset if provided
        if (assetId > 0) {
            assetComputeTasks[assetId].push(taskId);
        }

        emit ComputeTaskRegistered(taskId, serviceId, msg.sender);
    }

    /**
     * @dev Submit data availability proof to 0G DA
     */
    function submitDAProof(
        bytes32 dataHash,
        uint256 blockHeight,
        bytes32 commitment,
        bytes memory samplingProof,
        uint256 assetId
    ) external {
        require(dataHash != bytes32(0), "Invalid data hash");
        require(blockHeight > 0, "Invalid block height");
        require(commitment != bytes32(0), "Invalid commitment");
        require(samplingProof.length > 0, "Invalid sampling proof");

        daProofs[dataHash] = DAProof({
            dataHash: dataHash,
            blockHeight: blockHeight,
            commitment: commitment,
            samplingProof: samplingProof,
            timestamp: block.timestamp,
            verified: false
        });

        // Link to asset if provided
        if (assetId > 0) {
            assetDAProofs[assetId].push(dataHash);
        }

        emit DAProofSubmitted(dataHash, blockHeight, commitment);
    }

    /**
     * @dev Verify storage proof using 0G Storage verification
     */
    function verifyStorageProof(
        string memory fileHash,
        bytes memory verificationData
    ) external onlyVerifiedOracle {
        require(bytes(storageProofs[fileHash].fileHash).length > 0, "Storage proof not found");
        require(!storageProofs[fileHash].verified, "Already verified");

        // In a real implementation, this would call 0G Storage indexer to verify
        // For now, we trust the oracle verification
        storageProofs[fileHash].verified = true;

        // Update oracle reputation
        _updateOracleReputation(msg.sender, true);

        emit VerificationCompleted(keccak256(bytes(fileHash)), msg.sender, true);
    }

    /**
     * @dev Verify compute task using 0G Compute verification
     */
    function verifyComputeTask(
        uint256 taskId,
        bytes memory verificationData
    ) external onlyVerifiedOracle {
        require(computeTasks[taskId].taskId != 0, "Compute task not found");
        require(!computeTasks[taskId].verified, "Already verified");

        // In a real implementation, this would call 0G Compute broker to verify
        // For now, we trust the oracle verification
        computeTasks[taskId].verified = true;

        // Update oracle reputation
        _updateOracleReputation(msg.sender, true);

        emit VerificationCompleted(keccak256(abi.encodePacked(taskId)), msg.sender, true);
    }

    /**
     * @dev Verify DA proof using 0G DA sampling
     */
    function verifyDAProof(
        bytes32 dataHash,
        bytes memory additionalProof
    ) external onlyVerifiedOracle {
        require(daProofs[dataHash].dataHash != bytes32(0), "DA proof not found");
        require(!daProofs[dataHash].verified, "Already verified");

        // In a real implementation, this would call 0G DA contract to verify sampling
        // For now, we trust the oracle verification
        daProofs[dataHash].verified = true;

        // Update oracle reputation
        _updateOracleReputation(msg.sender, true);

        emit VerificationCompleted(dataHash, msg.sender, true);
    }

    /**
     * @dev Register verification oracle
     */
    function registerOracle(address oracle, uint256 initialReputation) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        require(initialReputation <= 100, "Invalid reputation score");

        verificationOracles[oracle] = VerificationOracle({
            oracle: oracle,
            active: true,
            reputation: initialReputation,
            totalTasks: 0,
            lastActivity: block.timestamp
        });

        emit OracleRegistered(oracle, initialReputation);
    }

    /**
     * @dev Update oracle reputation based on verification performance
     */
    function _updateOracleReputation(address oracle, bool successful) internal {
        VerificationOracle storage oracleData = verificationOracles[oracle];
        oracleData.totalTasks += 1;
        oracleData.lastActivity = block.timestamp;

        if (successful) {
            // Increase reputation for successful verification
            if (oracleData.reputation < 100) {
                oracleData.reputation = oracleData.reputation + 1;
            }
        } else {
            // Decrease reputation for failed verification
            if (oracleData.reputation > 0) {
                oracleData.reputation = oracleData.reputation - 2;
            }
        }

        // Deactivate oracle if reputation falls too low
        if (oracleData.reputation < ORACLE_REPUTATION_THRESHOLD) {
            oracleData.active = false;
        }

        emit OracleReputationUpdated(oracle, oracleData.reputation);
    }

    /**
     * @dev Get asset storage proofs
     */
    function getAssetStorageProofs(uint256 assetId) external view returns (string[] memory) {
        return assetStorageHashes[assetId];
    }

    /**
     * @dev Get asset compute tasks
     */
    function getAssetComputeTasks(uint256 assetId) external view returns (uint256[] memory) {
        return assetComputeTasks[assetId];
    }

    /**
     * @dev Get asset DA proofs
     */
    function getAssetDAProofs(uint256 assetId) external view returns (bytes32[] memory) {
        return assetDAProofs[assetId];
    }

    /**
     * @dev Check if storage hash is verified
     */
    function isStorageVerified(string memory fileHash) external view returns (bool) {
        return storageProofs[fileHash].verified;
    }

    /**
     * @dev Check if compute task is verified
     */
    function isComputeTaskVerified(uint256 taskId) external view returns (bool) {
        return computeTasks[taskId].verified;
    }

    /**
     * @dev Check if DA proof is verified
     */
    function isDAProofVerified(bytes32 dataHash) external view returns (bool) {
        return daProofs[dataHash].verified;
    }

    /**
     * @dev Get complete verification status for asset
     */
    function getAssetVerificationStatus(uint256 assetId) external view returns (
        uint256 storageProofsCount,
        uint256 verifiedStorageProofs,
        uint256 computeTasksCount,
        uint256 verifiedComputeTasks,
        uint256 daProofsCount,
        uint256 verifiedDAProofs
    ) {
        string[] memory storageHashes = assetStorageHashes[assetId];
        uint256[] memory taskIds = assetComputeTasks[assetId];
        bytes32[] memory dataHashes = assetDAProofs[assetId];

        storageProofsCount = storageHashes.length;
        for (uint256 i = 0; i < storageHashes.length; i++) {
            if (storageProofs[storageHashes[i]].verified) {
                verifiedStorageProofs++;
            }
        }

        computeTasksCount = taskIds.length;
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (computeTasks[taskIds[i]].verified) {
                verifiedComputeTasks++;
            }
        }

        daProofsCount = dataHashes.length;
        for (uint256 i = 0; i < dataHashes.length; i++) {
            if (daProofs[dataHashes[i]].verified) {
                verifiedDAProofs++;
            }
        }
    }

    /**
     * @dev Update 0G service addresses
     */
    function update0GServiceAddresses(
        address _zgStorageIndexer,
        address _zgComputeBroker,
        address _zgDAContract
    ) external onlyOwner {
        zgStorageIndexer = _zgStorageIndexer;
        zgComputeBroker = _zgComputeBroker;
        zgDAContract = _zgDAContract;
    }
}