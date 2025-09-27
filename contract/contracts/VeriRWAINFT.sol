// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./IERC7857.sol";

/**
 * @title VeriRWAINFT - Intelligent Real World Asset NFT
 * @dev Implementation of ERC-7857 INFT standard for AI-verified RWA tokenization
 * Integrates with 0G Network for storage, compute, and verification
 */
contract VeriRWAINFT is ERC721, ERC721URIStorage, IERC7857, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 private _nextTokenId;
    uint256 public constant PLATFORM_FEE_BPS = 100; // 1%
    uint256 public constant VERIFICATION_THRESHOLD = 70; // 70% AI verification score threshold

    struct RWAAsset {
        string assetType;           // Type of real world asset
        uint256 valuationUSD;       // AI-verified valuation in USD
        string aiVerificationHash;  // 0G Storage hash of AI verification data
        uint256 verificationScore;  // AI verification confidence score (0-100)
        uint256 timestamp;          // Creation timestamp
        bool verified;              // Whether asset meets verification threshold
        string dataHash;            // 0G Storage hash for asset documents
        bytes32 encryptedMetadataHash; // Hash of encrypted AI metadata
        uint256 computeTaskId;      // 0G Compute task ID for verification
        bytes32 fraudProofHash;     // 0G DA hash for fraud detection proof
        uint256 lastUpdated;        // Last verification update
    }

    struct UsageAuthorization {
        bool authorized;
        uint256 expiresAt;
        bytes32 authHash;
    }

    struct VerificationProof {
        bytes32 metadataHash;
        bytes signature;
        uint256 timestamp;
        address oracle;
    }

    mapping(uint256 => RWAAsset) public rwaAssets;
    mapping(uint256 => uint256) public assetPrices;
    mapping(uint256 => mapping(address => UsageAuthorization)) public usageAuthorizations;
    mapping(uint256 => bytes) public encryptedMetadata;
    mapping(uint256 => VerificationProof) public verificationProofs;
    mapping(address => bool) public authorizedAuditors;
    mapping(uint256 => uint256) public originalTokens; // For cloned tokens

    address public stakingContract;
    address public feeCollector;
    address public verificationOracle;
    address public zgStorageContract;
    address public zgComputeContract;

    event AssetTokenized(
        uint256 indexed tokenId,
        address indexed owner,
        string assetType,
        uint256 valuation,
        string aiVerificationHash,
        uint256 computeTaskId
    );

    event AssetVerified(
        uint256 indexed tokenId,
        uint256 verificationScore,
        bytes32 fraudProofHash
    );

    event AssetPriceUpdated(uint256 indexed tokenId, uint256 newPrice);

    event AIVerificationUpdated(
        uint256 indexed tokenId,
        string newVerificationHash,
        uint256 newScore,
        uint256 newComputeTaskId
    );

    modifier onlyAuditor() {
        require(authorizedAuditors[msg.sender], "Not authorized auditor");
        _;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _;
    }

    constructor(
        address _feeCollector,
        address _verificationOracle,
        address _zgStorageContract,
        address _zgComputeContract
    ) ERC721("VeriRWA Intelligent NFT", "VINFT") Ownable(msg.sender) {
        feeCollector = _feeCollector;
        verificationOracle = _verificationOracle;
        zgStorageContract = _zgStorageContract;
        zgComputeContract = _zgComputeContract;
        _nextTokenId = 1;
    }

    /**
     * @dev Mint new RWA INFT with AI verification
     */
    function mintRWAAsset(
        address to,
        string memory assetType,
        uint256 valuationUSD,
        string memory tokenURI,
        string memory dataHash,
        string memory aiVerificationHash,
        uint256 verificationScore,
        uint256 computeTaskId,
        bytes memory encryptedAIMetadata,
        bytes32 fraudProofHash
    ) external onlyAuditor nonReentrant returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        bytes32 metadataHash = keccak256(encryptedAIMetadata);

        rwaAssets[tokenId] = RWAAsset({
            assetType: assetType,
            valuationUSD: valuationUSD,
            aiVerificationHash: aiVerificationHash,
            verificationScore: verificationScore,
            timestamp: block.timestamp,
            verified: verificationScore >= VERIFICATION_THRESHOLD,
            dataHash: dataHash,
            encryptedMetadataHash: metadataHash,
            computeTaskId: computeTaskId,
            fraudProofHash: fraudProofHash,
            lastUpdated: block.timestamp
        });

        encryptedMetadata[tokenId] = encryptedAIMetadata;
        assetPrices[tokenId] = valuationUSD;

        emit AssetTokenized(tokenId, to, assetType, valuationUSD, aiVerificationHash, computeTaskId);
        emit EncryptedMetadataUpdated(tokenId, metadataHash);
        emit AssetVerified(tokenId, verificationScore, fraudProofHash);

        return tokenId;
    }

    /**
     * @dev ERC-7857: Secure transfer with metadata re-encryption
     */
    function secureTransfer(
        address to,
        uint256 tokenId,
        bytes calldata newEncryptedData
    ) external override onlyTokenOwner(tokenId) {
        require(to != address(0), "Transfer to zero address");

        // Re-encrypt metadata for new owner
        bytes32 newMetadataHash = keccak256(newEncryptedData);
        encryptedMetadata[tokenId] = newEncryptedData;
        rwaAssets[tokenId].encryptedMetadataHash = newMetadataHash;
        rwaAssets[tokenId].lastUpdated = block.timestamp;

        // Clear any existing usage authorizations
        // Note: In production, you might want to handle this differently

        // Perform the transfer
        _transfer(msg.sender, to, tokenId);

        emit SecureTransfer(msg.sender, to, tokenId, newMetadataHash);
        emit EncryptedMetadataUpdated(tokenId, newMetadataHash);
    }

    /**
     * @dev ERC-7857: Clone INFT token
     */
    function clone(uint256 tokenId, address to) external override onlyTokenOwner(tokenId) returns (uint256) {
        require(to != address(0), "Clone to zero address");

        uint256 newTokenId = _nextTokenId++;
        RWAAsset memory originalAsset = rwaAssets[tokenId];

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI(tokenId));

        // Copy asset data but mark as clone
        rwaAssets[newTokenId] = RWAAsset({
            assetType: originalAsset.assetType,
            valuationUSD: originalAsset.valuationUSD,
            aiVerificationHash: originalAsset.aiVerificationHash,
            verificationScore: originalAsset.verificationScore,
            timestamp: block.timestamp,
            verified: originalAsset.verified,
            dataHash: originalAsset.dataHash,
            encryptedMetadataHash: originalAsset.encryptedMetadataHash,
            computeTaskId: originalAsset.computeTaskId,
            fraudProofHash: originalAsset.fraudProofHash,
            lastUpdated: block.timestamp
        });

        // Copy encrypted metadata
        encryptedMetadata[newTokenId] = encryptedMetadata[tokenId];
        assetPrices[newTokenId] = assetPrices[tokenId];
        originalTokens[newTokenId] = tokenId;

        emit TokenCloned(tokenId, newTokenId, to);

        return newTokenId;
    }

    /**
     * @dev ERC-7857: Authorize temporary usage
     */
    function authorizeUsage(
        uint256 tokenId,
        address user,
        uint256 duration
    ) external override onlyTokenOwner(tokenId) {
        require(user != address(0), "Authorize to zero address");
        require(duration > 0, "Duration must be positive");

        uint256 expiresAt = block.timestamp + duration;
        bytes32 authHash = keccak256(abi.encodePacked(tokenId, user, expiresAt, block.timestamp));

        usageAuthorizations[tokenId][user] = UsageAuthorization({
            authorized: true,
            expiresAt: expiresAt,
            authHash: authHash
        });

        emit UsageAuthorized(tokenId, user, duration, expiresAt);
    }

    /**
     * @dev ERC-7857: Verify metadata with oracle
     */
    function verifyMetadata(uint256 tokenId, bytes calldata proof) external view override returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        VerificationProof memory storedProof = verificationProofs[tokenId];
        if (storedProof.oracle == address(0)) {
            return false;
        }

        // Verify signature from oracle
        bytes32 messageHash = keccak256(abi.encodePacked(
            tokenId,
            rwaAssets[tokenId].encryptedMetadataHash,
            storedProof.timestamp
        )).toEthSignedMessageHash();

        address signer = messageHash.recover(storedProof.signature);
        return signer == verificationOracle;
    }

    /**
     * @dev Update AI verification with new 0G Compute results
     */
    function updateAIVerification(
        uint256 tokenId,
        string memory newVerificationHash,
        uint256 newScore,
        uint256 newComputeTaskId,
        bytes32 newFraudProofHash,
        bytes memory newEncryptedMetadata
    ) external onlyAuditor validTokenId(tokenId) {
        require(newScore <= 100, "Invalid verification score");

        rwaAssets[tokenId].aiVerificationHash = newVerificationHash;
        rwaAssets[tokenId].verificationScore = newScore;
        rwaAssets[tokenId].verified = newScore >= VERIFICATION_THRESHOLD;
        rwaAssets[tokenId].computeTaskId = newComputeTaskId;
        rwaAssets[tokenId].fraudProofHash = newFraudProofHash;
        rwaAssets[tokenId].lastUpdated = block.timestamp;

        if (newEncryptedMetadata.length > 0) {
            bytes32 newMetadataHash = keccak256(newEncryptedMetadata);
            rwaAssets[tokenId].encryptedMetadataHash = newMetadataHash;
            encryptedMetadata[tokenId] = newEncryptedMetadata;
            emit EncryptedMetadataUpdated(tokenId, newMetadataHash);
        }

        emit AIVerificationUpdated(tokenId, newVerificationHash, newScore, newComputeTaskId);
        emit AssetVerified(tokenId, newScore, newFraudProofHash);
    }

    /**
     * @dev Set verification proof from oracle
     */
    function setVerificationProof(
        uint256 tokenId,
        bytes32 metadataHash,
        bytes memory signature
    ) external {
        require(msg.sender == verificationOracle, "Only oracle can set proof");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        verificationProofs[tokenId] = VerificationProof({
            metadataHash: metadataHash,
            signature: signature,
            timestamp: block.timestamp,
            oracle: msg.sender
        });

        emit MetadataVerified(tokenId, true, keccak256(signature));
    }

    /**
     * @dev ERC-7857: Get encrypted metadata hash
     */
    function getEncryptedMetadataHash(uint256 tokenId) external view override returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return rwaAssets[tokenId].encryptedMetadataHash;
    }

    /**
     * @dev ERC-7857: Get usage authorization
     */
    function getUsageAuthorization(uint256 tokenId, address user)
        external
        view
        override
        returns (bool authorized, uint256 expiresAt)
    {
        UsageAuthorization memory auth = usageAuthorizations[tokenId][user];
        return (auth.authorized && auth.expiresAt > block.timestamp, auth.expiresAt);
    }

    /**
     * @dev ERC-7857: Get verification oracle
     */
    function getVerificationOracle() external view override returns (address) {
        return verificationOracle;
    }

    /**
     * @dev ERC-7857: Update verification oracle
     */
    function updateVerificationOracle(address newOracle) external override onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        verificationOracle = newOracle;
    }

    /**
     * @dev Update asset price
     */
    function updateAssetPrice(uint256 tokenId, uint256 newPrice) external validTokenId(tokenId) {
        require(
            ownerOf(tokenId) == msg.sender || authorizedAuditors[msg.sender],
            "Not authorized to update price"
        );

        assetPrices[tokenId] = newPrice;
        emit AssetPriceUpdated(tokenId, newPrice);
    }

    /**
     * @dev Set authorized auditor
     */
    function setAuthorizedAuditor(address auditor, bool authorized) external onlyOwner {
        authorizedAuditors[auditor] = authorized;
    }

    /**
     * @dev Set staking contract
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        stakingContract = _stakingContract;
    }

    /**
     * @dev Get complete asset details
     */
    function getAssetDetails(uint256 tokenId) external view validTokenId(tokenId) returns (RWAAsset memory) {
        return rwaAssets[tokenId];
    }

    /**
     * @dev Get encrypted metadata (only owner or authorized)
     */
    function getEncryptedMetadata(uint256 tokenId) external view returns (bytes memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(
            ownerOf(tokenId) == msg.sender ||
            authorizedAuditors[msg.sender] ||
            usageAuthorizations[tokenId][msg.sender].authorized,
            "Not authorized to view metadata"
        );

        return encryptedMetadata[tokenId];
    }

    /**
     * @dev Check if token is a clone
     */
    function isClone(uint256 tokenId) external view returns (bool, uint256) {
        return (originalTokens[tokenId] != 0, originalTokens[tokenId]);
    }

    /**
     * @dev Get 0G Network integration details
     */
    function get0GIntegration(uint256 tokenId) external view validTokenId(tokenId) returns (
        string memory storageHash,
        string memory verificationHash,
        uint256 computeTaskId,
        bytes32 fraudProofHash
    ) {
        RWAAsset memory asset = rwaAssets[tokenId];
        return (asset.dataHash, asset.aiVerificationHash, asset.computeTaskId, asset.fraudProofHash);
    }

    /**
     * @dev Override tokenURI to include INFT metadata
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface to include ERC-7857
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC7857).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}