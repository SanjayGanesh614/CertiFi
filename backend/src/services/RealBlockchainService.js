const { ethers } = require('ethers');
const { ZG_TESTNET_CONFIG } = require('../config/network');

class RealBlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {
      veriRWAINFT: null,
      marketplace: null,
      staking: null,
    };
  }

  async initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(ZG_TESTNET_CONFIG.rpcUrls[0]);
      
      // Initialize signer using private key from env
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      }

      // Initialize contract instances
      if (process.env.VERIRWA_INFT_ADDRESS) {
        this.contracts.veriRWAINFT = new ethers.Contract(
          process.env.VERIRWA_INFT_ADDRESS,
          require('../abis/VeriRWAINFT.json'),
          this.signer || this.provider
        );
      }

      if (process.env.MARKETPLACE_ADDRESS) {
        this.contracts.marketplace = new ethers.Contract(
          process.env.MARKETPLACE_ADDRESS,
          require('../abis/VeriRWAMarketplace.json'),
          this.signer || this.provider
        );
      }

      if (process.env.STAKING_ADDRESS) {
        this.contracts.staking = new ethers.Contract(
          process.env.STAKING_ADDRESS,
          require('../abis/VeriRWAStaking.json'),
          this.signer || this.provider
        );
      }

      console.log('✅ Blockchain service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  async getAssetDetails(tokenId) {
    try {
      return await this.contracts.veriRWAINFT.getAssetDetails(tokenId);
    } catch (error) {
      console.error(`Failed to get asset details for token ${tokenId}:`, error);
      throw error;
    }
  }

  async getMarketListings() {
    try {
      // Implementation depends on your marketplace contract
      const listingCount = await this.contracts.marketplace.getListingCount();
      const listings = [];
      
      for (let i = 0; i < listingCount; i++) {
        const listing = await this.contracts.marketplace.listings(i);
        if (listing.active) {
          listings.push({
            tokenId: i,
            seller: listing.seller,
            price: listing.price,
            timestamp: listing.timestamp,
            verifiedOnly: listing.verifiedOnly
          });
        }
      }
      
      return listings;
    } catch (error) {
      console.error('Failed to get market listings:', error);
      throw error;
    }
  }

  async getStakingInfo(address) {
    try {
      const stakeInfo = await this.contracts.staking.getStakeInfo(address);
      const pendingRewards = await this.contracts.staking.calculatePendingRewards(address);
      
      return {
        stakedAmount: stakeInfo.amount,
        stakingTimestamp: stakeInfo.timestamp,
        lastRewardTimestamp: stakeInfo.lastRewardTimestamp,
        accumulatedRewards: stakeInfo.accumulatedRewards,
        pendingRewards
      };
    } catch (error) {
      console.error(`Failed to get staking info for ${address}:`, error);
      throw error;
    }
  }
}

module.exports = RealBlockchainService;