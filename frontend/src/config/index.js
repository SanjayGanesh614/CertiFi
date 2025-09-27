export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const CONTRACT_ADDRESSES = {
  VERIRWA_INFT: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  MARKETPLACE: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  STAKING: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
};

export const ZG_TESTNET_CONFIG = {
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