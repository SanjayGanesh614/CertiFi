import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

// Load environment variables
const { PRIVATE_KEY, OG_MAINNET_RPC, OG_TESTNET_RPC, ETHERSCAN_API_KEY } = process.env;

export default {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    "0g-mainnet": {
      url: OG_MAINNET_RPC || "https://rpc.0g.ai",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 16600,
      gasPrice: 20000000000,
    },
    "0g-testnet": {
      url: OG_TESTNET_RPC || "https://evmrpc-testnet.0g.ai",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 16602,
      gasPrice: 1000000000,
      gas: 8000000,
      timeout: 120000,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
