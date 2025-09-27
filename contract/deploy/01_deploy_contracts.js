const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contracts with account:", deployer);

  // Deploy VeriRWA NFT contract
  const nftContract = await deploy("VeriRWANFT", {
    from: deployer,
    args: [deployer], // Fee collector address
    log: true,
    waitConfirmations: 1,
  });

  console.log("VeriRWANFT deployed to:", nftContract.address);

  // Mock 0G token address for staking (replace with actual 0G token)
  const mockStakingToken = "0x0000000000000000000000000000000000000000"; // Replace with actual 0G token

  // Deploy Staking contract
  const stakingContract = await deploy("VeriRWAStaking", {
    from: deployer,
    args: [mockStakingToken],
    log: true,
    waitConfirmations: 1,
  });

  console.log("VeriRWAStaking deployed to:", stakingContract.address);

  // Mock USDC address for marketplace (replace with actual USDC on 0G)
  const mockPaymentToken = "0x0000000000000000000000000000000000000000"; // Replace with actual USDC

  // Deploy Marketplace contract
  const marketplaceContract = await deploy("VeriRWAMarketplace", {
    from: deployer,
    args: [nftContract.address, mockPaymentToken, deployer],
    log: true,
    waitConfirmations: 1,
  });

  console.log("VeriRWAMarketplace deployed to:", marketplaceContract.address);

  // Setup contracts
  const nft = await ethers.getContractAt("VeriRWANFT", nftContract.address);
  const staking = await ethers.getContractAt("VeriRWAStaking", stakingContract.address);

  // Set staking contract in NFT
  await nft.setStakingContract(stakingContract.address);
  console.log("Staking contract set in NFT");

  // Set deployer as authorized auditor
  await nft.setAuthorizedAuditor(deployer, true);
  console.log("Deployer set as authorized auditor");

  console.log("\n=== Deployment Summary ===");
  console.log("VeriRWANFT:", nftContract.address);
  console.log("VeriRWAStaking:", stakingContract.address);
  console.log("VeriRWAMarketplace:", marketplaceContract.address);
  console.log("=========================");
};

module.exports.tags = ["VeriRWA"];