// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./IERC7857.sol";

interface IVeriRWAINFT is IERC7857 {
    struct RWAAsset {
        string assetType;
        uint256 valuationUSD;
        string aiVerificationHash;
        uint256 verificationScore;
        uint256 timestamp;
        bool verified;
        string dataHash;
        bytes32 encryptedMetadataHash;
        uint256 computeTaskId;
        bytes32 fraudProofHash;
        uint256 lastUpdated;
    }

    function getAssetDetails(uint256 tokenId) external view returns (RWAAsset memory);
    function secureTransfer(address to, uint256 tokenId, bytes calldata encryptedData) external;
}

contract VeriRWAMarketplace is Ownable, ReentrancyGuard {
    IVeriRWAINFT public nftContract;
    IERC20 public paymentToken; // USDC or similar stablecoin

    uint256 public constant PLATFORM_FEE_BPS = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
        uint256 timestamp;
        bool verifiedOnly;
    }

    struct Offer {
        address buyer;
        uint256 amount;
        uint256 expiry;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256) public earnings;

    uint256 public totalVolume;
    uint256 public totalFees;
    address public feeCollector;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Unlisted(uint256 indexed tokenId, address indexed seller);
    event Sold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event OfferMade(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 expiry);
    event OfferAccepted(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);

    modifier onlyTokenOwner(uint256 tokenId) {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    constructor(address _nftContract, address _paymentToken, address _feeCollector) Ownable(msg.sender) {
        nftContract = IVeriRWAINFT(_nftContract);
        paymentToken = IERC20(_paymentToken);
        feeCollector = _feeCollector;
    }

    function listAsset(uint256 tokenId, uint256 price, bool verifiedOnly) external onlyTokenOwner(tokenId) {
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Already listed");

        // Check if asset is verified if verifiedOnly is true
        if (verifiedOnly) {
            IVeriRWAINFT.RWAAsset memory asset = nftContract.getAssetDetails(tokenId);
            require(asset.verified, "Asset not verified");
        }

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true,
            timestamp: block.timestamp,
            verifiedOnly: verifiedOnly
        });

        emit Listed(tokenId, msg.sender, price);
    }

    function unlistAsset(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(listings[tokenId].active, "Not listed");

        listings[tokenId].active = false;

        emit Unlisted(tokenId, msg.sender);
    }

    function buyAsset(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(msg.sender != listing.seller, "Cannot buy own asset");

        // Check verification requirement
        if (listing.verifiedOnly) {
            IVeriRWAINFT.RWAAsset memory asset = nftContract.getAssetDetails(tokenId);
            require(asset.verified, "Asset not verified");
        }

        uint256 price = listing.price;
        uint256 fee = (price * PLATFORM_FEE_BPS) / BASIS_POINTS;
        uint256 sellerAmount = price - fee;

        // Transfer payment
        require(paymentToken.transferFrom(msg.sender, listing.seller, sellerAmount), "Payment failed");
        require(paymentToken.transferFrom(msg.sender, feeCollector, fee), "Fee transfer failed");

        // Transfer NFT
        IERC721(nftContract).safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Update state
        listings[tokenId].active = false;
        earnings[listing.seller] += sellerAmount;
        totalVolume += price;
        totalFees += fee;

        emit Sold(tokenId, listing.seller, msg.sender, price);
    }

    function makeOffer(uint256 tokenId, uint256 amount, uint256 duration) external {
        require(amount > 0, "Offer must be greater than 0");
        require(duration > 0, "Duration must be positive");
        require(IERC721(nftContract).ownerOf(tokenId) != msg.sender, "Cannot offer on own asset");

        uint256 expiry = block.timestamp + duration;

        offers[tokenId].push(Offer({
            buyer: msg.sender,
            amount: amount,
            expiry: expiry,
            active: true
        }));

        // Lock payment tokens
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Payment lock failed");

        emit OfferMade(tokenId, msg.sender, amount, expiry);
    }

    function acceptOffer(uint256 tokenId, uint256 offerIndex) external onlyTokenOwner(tokenId) nonReentrant {
        require(offerIndex < offers[tokenId].length, "Invalid offer index");

        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.active, "Offer not active");
        require(offer.expiry > block.timestamp, "Offer expired");

        uint256 amount = offer.amount;
        uint256 fee = (amount * PLATFORM_FEE_BPS) / BASIS_POINTS;
        uint256 sellerAmount = amount - fee;

        // Transfer payments
        require(paymentToken.transfer(msg.sender, sellerAmount), "Payment failed");
        require(paymentToken.transfer(feeCollector, fee), "Fee transfer failed");

        // Transfer NFT
        IERC721(nftContract).safeTransferFrom(msg.sender, offer.buyer, tokenId);

        // Update state
        offer.active = false;
        if (listings[tokenId].active) {
            listings[tokenId].active = false;
        }
        earnings[msg.sender] += sellerAmount;
        totalVolume += amount;
        totalFees += fee;

        // Refund other offers
        _refundOtherOffers(tokenId, offerIndex);

        emit OfferAccepted(tokenId, msg.sender, offer.buyer, amount);
    }

    function _refundOtherOffers(uint256 tokenId, uint256 acceptedIndex) internal {
        Offer[] storage tokenOffers = offers[tokenId];

        for (uint256 i = 0; i < tokenOffers.length; i++) {
            if (i != acceptedIndex && tokenOffers[i].active) {
                tokenOffers[i].active = false;
                paymentToken.transfer(tokenOffers[i].buyer, tokenOffers[i].amount);
            }
        }
    }

    function withdrawExpiredOffer(uint256 tokenId, uint256 offerIndex) external {
        require(offerIndex < offers[tokenId].length, "Invalid offer index");

        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.buyer == msg.sender, "Not your offer");
        require(offer.active, "Offer not active");
        require(offer.expiry <= block.timestamp, "Offer not expired");

        offer.active = false;
        require(paymentToken.transfer(msg.sender, offer.amount), "Refund failed");
    }

    function getActiveOffers(uint256 tokenId) external view returns (Offer[] memory) {
        Offer[] memory tokenOffers = offers[tokenId];
        uint256 activeCount = 0;

        // Count active offers
        for (uint256 i = 0; i < tokenOffers.length; i++) {
            if (tokenOffers[i].active && tokenOffers[i].expiry > block.timestamp) {
                activeCount++;
            }
        }

        // Build active offers array
        Offer[] memory activeOffers = new Offer[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < tokenOffers.length; i++) {
            if (tokenOffers[i].active && tokenOffers[i].expiry > block.timestamp) {
                activeOffers[index] = tokenOffers[i];
                index++;
            }
        }

        return activeOffers;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        feeCollector = _feeCollector;
    }

    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
        }
    }
}