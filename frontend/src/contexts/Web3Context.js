import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ethers } from 'ethers';

// 0G Network Configuration
const ZG_TESTNET_CONFIG = {
  chainId: '0x40EA', // 16602
  chainName: '0G-Network-Testnet',
  nativeCurrency: {
    name: 'A0GI',
    symbol: 'A0GI',
    decimals: 18,
  },
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://chainscan-newton.0g.ai/'],
};

// Contract ABIs (simplified for key functions)
const VERIRWA_INFT_ABI = [
  "function mintRWAAsset(address to, string memory assetType, uint256 valuationUSD, string memory tokenURI, string memory dataHash, string memory aiVerificationHash, uint256 verificationScore, uint256 computeTaskId, bytes memory encryptedAIMetadata, bytes32 fraudProofHash) external returns (uint256)",
  "function getAssetDetails(uint256 tokenId) external view returns (tuple(string assetType, uint256 valuationUSD, string aiVerificationHash, uint256 verificationScore, uint256 timestamp, bool verified, string dataHash, bytes32 encryptedMetadataHash, uint256 computeTaskId, bytes32 fraudProofHash, uint256 lastUpdated))",
  "function secureTransfer(address to, uint256 tokenId, bytes calldata encryptedData) external",
  "function authorizeUsage(uint256 tokenId, address user, uint256 duration) external",
  "function getUsageAuthorization(uint256 tokenId, address user) external view returns (bool authorized, uint256 expiresAt)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function setAuthorizedAuditor(address auditor, bool authorized) external",
  "function authorizedAuditors(address) external view returns (bool)",
  "event AssetTokenized(uint256 indexed tokenId, address indexed owner, string assetType, uint256 valuation, string aiVerificationHash, uint256 computeTaskId)",
  "event SecureTransfer(address indexed from, address indexed to, uint256 indexed tokenId, bytes32 metadataHash)"
];

const MARKETPLACE_ABI = [
  "function listAsset(uint256 tokenId, uint256 price, bool verifiedOnly) external",
  "function buyAsset(uint256 tokenId) external",
  "function makeOffer(uint256 tokenId, uint256 amount, uint256 duration) external",
  "function acceptOffer(uint256 tokenId, uint256 offerIndex) external",
  "function getActiveOffers(uint256 tokenId) external view returns (tuple(address buyer, uint256 amount, uint256 expiry, bool active)[])",
  "function listings(uint256) external view returns (address seller, uint256 price, bool active, uint256 timestamp, bool verifiedOnly)",
  "event Listed(uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event Sold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)"
];

const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function calculatePendingRewards(address user) external view returns (uint256)",
  "function getStakeInfo(address user) external view returns (tuple(uint256 amount, uint256 timestamp, uint256 lastRewardTimestamp, uint256 accumulatedRewards))",
  "function validators(address) external view returns (bool)",
  "event Staked(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)"
];

// Web3 Context
const Web3Context = createContext();

// Initial state
const initialState = {
  isConnected: false,
  account: null,
  provider: null,
  signer: null,
  contracts: {
    veriRWAINFT: null,
    marketplace: null,
    staking: null,
  },
  balance: '0',
  chainId: null,
  isCorrectNetwork: false,
  loading: false,
  error: null,
};

// Reducer
function web3Reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'CONNECT_SUCCESS':
      return {
        ...state,
        isConnected: true,
        account: action.payload.account,
        provider: action.payload.provider,
        signer: action.payload.signer,
        chainId: action.payload.chainId,
        isCorrectNetwork: action.payload.isCorrectNetwork,
        balance: action.payload.balance,
        loading: false,
        error: null,
      };

    case 'SET_CONTRACTS':
      return {
        ...state,
        contracts: action.payload,
      };

    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };

    case 'DISCONNECT':
      return {
        ...initialState,
      };

    case 'NETWORK_CHANGED':
      return {
        ...state,
        chainId: action.payload.chainId,
        isCorrectNetwork: action.payload.isCorrectNetwork,
      };

    default:
      return state;
  }
}

// Web3 Provider Component
export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Check if wallet is connected on load
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          checkWalletConnection();
        }
      };

      const handleChainChanged = (chainId) => {
        const isCorrectNetwork = chainId === ZG_TESTNET_CONFIG.chainId;
        dispatch({
          type: 'NETWORK_CHANGED',
          payload: { chainId, isCorrectNetwork }
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Check wallet connection
  const checkWalletConnection = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to use VeriRWA.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      const account = accounts[0];

      // Check if on correct network
      const isCorrectNetwork = network.chainId.toString() === '16601';

      // Get balance
      const balanceWei = await provider.getBalance(account);
      const balance = ethers.formatEther(balanceWei);

      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: {
          account,
          provider,
          signer,
          chainId: network.chainId.toString(),
          isCorrectNetwork,
          balance,
        },
      });

      // Initialize contracts
      await initializeContracts(signer);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Initialize contracts
  const initializeContracts = async (signer) => {
    try {
      const contracts = {};

      // Get contract addresses from environment or use defaults
      const veriRWAINFTAddress = process.env.REACT_APP_VERIRWA_INFT_ADDRESS || '0x0000000000000000000000000000000000000000';
      const marketplaceAddress = process.env.REACT_APP_VERIRWA_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000';
      const stakingAddress = process.env.REACT_APP_VERIRWA_STAKING_ADDRESS || '0x0000000000000000000000000000000000000000';

      if (veriRWAINFTAddress !== '0x0000000000000000000000000000000000000000') {
        contracts.veriRWAINFT = new ethers.Contract(veriRWAINFTAddress, VERIRWA_INFT_ABI, signer);
      }

      if (marketplaceAddress !== '0x0000000000000000000000000000000000000000') {
        contracts.marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, signer);
      }

      if (stakingAddress !== '0x0000000000000000000000000000000000000000') {
        contracts.staking = new ethers.Contract(stakingAddress, STAKING_ABI, signer);
      }

      dispatch({ type: 'SET_CONTRACTS', payload: contracts });

    } catch (error) {
      console.error('Error initializing contracts:', error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to initialize contracts: ${error.message}` });
    }
  };

  // Switch to 0G Network
  const switchToZGNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ZG_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ZG_TESTNET_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add 0G Network to MetaMask');
        }
      } else {
        throw switchError;
      }
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    dispatch({ type: 'DISCONNECT' });
  };

  // Update balance
  const updateBalance = async () => {
    try {
      if (state.provider && state.account) {
        const balanceWei = await state.provider.getBalance(state.account);
        const balance = ethers.formatEther(balanceWei);
        dispatch({ type: 'UPDATE_BALANCE', payload: balance });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // INFT Contract Methods
  const mintRWAAsset = async (assetData) => {
    try {
      if (!state.contracts.veriRWAINFT) {
        throw new Error('VeriRWA INFT contract not initialized');
      }

      const tx = await state.contracts.veriRWAINFT.mintRWAAsset(
        assetData.to,
        assetData.assetType,
        assetData.valuationUSD,
        assetData.tokenURI,
        assetData.dataHash,
        assetData.aiVerificationHash,
        assetData.verificationScore,
        assetData.computeTaskId,
        assetData.encryptedAIMetadata,
        assetData.fraudProofHash
      );

      const receipt = await tx.wait();

      // Find the AssetTokenized event
      const event = receipt.logs.find(log => {
        try {
          const parsed = state.contracts.veriRWAINFT.interface.parseLog(log);
          return parsed.name === 'AssetTokenized';
        } catch {
          return false;
        }
      });

      const tokenId = event ? event.args.tokenId.toString() : null;

      return {
        hash: receipt.hash,
        tokenId,
        blockNumber: receipt.blockNumber,
        receipt
      };

    } catch (error) {
      console.error('Error minting RWA asset:', error);
      throw error;
    }
  };

  // Get asset details
  const getAssetDetails = async (tokenId) => {
    try {
      if (!state.contracts.veriRWAINFT) {
        throw new Error('VeriRWA INFT contract not initialized');
      }

      const details = await state.contracts.veriRWAINFT.getAssetDetails(tokenId);
      return details;
    } catch (error) {
      console.error('Error getting asset details:', error);
      throw error;
    }
  };

  // Get user's NFTs
  const getUserNFTs = async (address = state.account) => {
    try {
      if (!state.contracts.veriRWAINFT || !address) {
        return [];
      }

      const balance = await state.contracts.veriRWAINFT.balanceOf(address);
      const nfts = [];

      // This is a simplified approach - in production, you'd use events or a subgraph
      for (let i = 0; i < balance; i++) {
        try {
          // You might need to implement tokenOfOwnerByIndex or use events
          // For now, we'll return empty array and implement proper indexing later
        } catch (error) {
          console.warn('Error getting NFT at index:', i, error);
        }
      }

      return nfts;
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    }
  };

  // Marketplace methods
  const listAsset = async (tokenId, price, verifiedOnly = true) => {
    try {
      if (!state.contracts.marketplace) {
        throw new Error('Marketplace contract not initialized');
      }

      const tx = await state.contracts.marketplace.listAsset(tokenId, price, verifiedOnly);
      return await tx.wait();
    } catch (error) {
      console.error('Error listing asset:', error);
      throw error;
    }
  };

  const buyAsset = async (tokenId) => {
    try {
      if (!state.contracts.marketplace) {
        throw new Error('Marketplace contract not initialized');
      }

      const tx = await state.contracts.marketplace.buyAsset(tokenId);
      return await tx.wait();
    } catch (error) {
      console.error('Error buying asset:', error);
      throw error;
    }
  };

  // Staking methods
  const stake = async (amount) => {
    try {
      if (!state.contracts.staking) {
        throw new Error('Staking contract not initialized');
      }

      const tx = await state.contracts.staking.stake(ethers.parseEther(amount.toString()));
      return await tx.wait();
    } catch (error) {
      console.error('Error staking:', error);
      throw error;
    }
  };

  const getStakeInfo = async (address = state.account) => {
    try {
      if (!state.contracts.staking || !address) {
        return null;
      }

      const stakeInfo = await state.contracts.staking.getStakeInfo(address);
      const pendingRewards = await state.contracts.staking.calculatePendingRewards(address);
      const isValidator = await state.contracts.staking.validators(address);

      return {
        amount: ethers.formatEther(stakeInfo.amount),
        timestamp: stakeInfo.timestamp.toString(),
        accumulatedRewards: ethers.formatEther(stakeInfo.accumulatedRewards),
        pendingRewards: ethers.formatEther(pendingRewards),
        isValidator
      };
    } catch (error) {
      console.error('Error getting stake info:', error);
      return null;
    }
  };

  const value = {
    ...state,
    connectWallet,
    disconnect,
    switchToZGNetwork,
    updateBalance,
    mintRWAAsset,
    getAssetDetails,
    getUserNFTs,
    listAsset,
    buyAsset,
    stake,
    getStakeInfo,
    ZG_TESTNET_CONFIG,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Custom hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;