// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IERC7857 - Intelligent NFT (INFT) Interface
 * @dev Interface for ERC-7857 Intelligent NFTs with encrypted metadata and secure transfers
 * Based on 0G Network INFT standard for AI-powered NFTs
 */
interface IERC7857 is IERC721 {

    /**
     * @dev Emitted when encrypted metadata is updated for a token
     */
    event EncryptedMetadataUpdated(uint256 indexed tokenId, bytes32 indexed metadataHash);

    /**
     * @dev Emitted when a token is transferred with re-encrypted metadata
     */
    event SecureTransfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        bytes32 metadataHash
    );

    /**
     * @dev Emitted when usage authorization is granted
     */
    event UsageAuthorized(
        uint256 indexed tokenId,
        address indexed user,
        uint256 duration,
        uint256 expiresAt
    );

    /**
     * @dev Emitted when a token is cloned
     */
    event TokenCloned(uint256 indexed originalTokenId, uint256 indexed clonedTokenId, address indexed to);

    /**
     * @dev Emitted when metadata verification is performed
     */
    event MetadataVerified(uint256 indexed tokenId, bool verified, bytes32 proofHash);

    /**
     * @dev Transfer token with encrypted metadata re-encryption
     * @param to Address to transfer the token to
     * @param tokenId Token ID to transfer
     * @param encryptedData Re-encrypted metadata for the new owner
     */
    function secureTransfer(address to, uint256 tokenId, bytes calldata encryptedData) external;

    /**
     * @dev Clone an INFT token for a new owner
     * @param tokenId Token ID to clone
     * @param to Address to receive the cloned token
     * @return newTokenId The ID of the newly cloned token
     */
    function clone(uint256 tokenId, address to) external returns (uint256 newTokenId);

    /**
     * @dev Authorize temporary usage of an INFT
     * @param tokenId Token ID to authorize
     * @param user Address to authorize
     * @param duration Duration of authorization in seconds
     */
    function authorizeUsage(uint256 tokenId, address user, uint256 duration) external;

    /**
     * @dev Verify encrypted metadata integrity using TEE/ZKP proof
     * @param tokenId Token ID to verify
     * @param proof Cryptographic proof for verification
     * @return verified True if metadata is verified
     */
    function verifyMetadata(uint256 tokenId, bytes calldata proof) external view returns (bool verified);

    /**
     * @dev Get encrypted metadata hash for a token
     * @param tokenId Token ID
     * @return metadataHash Hash of the encrypted metadata
     */
    function getEncryptedMetadataHash(uint256 tokenId) external view returns (bytes32 metadataHash);

    /**
     * @dev Check if a user has authorization to use a token
     * @param tokenId Token ID
     * @param user User address
     * @return authorized True if user is authorized
     * @return expiresAt Timestamp when authorization expires
     */
    function getUsageAuthorization(uint256 tokenId, address user)
        external
        view
        returns (bool authorized, uint256 expiresAt);

    /**
     * @dev Get the oracle address used for verification
     * @return oracle Address of the verification oracle
     */
    function getVerificationOracle() external view returns (address oracle);

    /**
     * @dev Update the verification oracle (only owner)
     * @param newOracle New oracle address
     */
    function updateVerificationOracle(address newOracle) external;
}