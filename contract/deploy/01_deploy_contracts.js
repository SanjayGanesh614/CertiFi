const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy VeriRWAINFT
  const VeriRWAINFT = await ethers.getContractFactory("VeriRWAINFT");
  const nft = await VeriRWAINFT.deploy(
    deployer.address, // feeCollector
    deployer.address, // verificationOracle
    deployer.address, // zgStorageContract
    deployer.address  // zgComputeContract
  );
  await nft.waitForDeployment();
  console.log("VeriRWAINFT deployed to:", nft.target);

  // Deploy VeriRWAStaking
  const VeriRWAStaking = await ethers.getContractFactory("VeriRWAStaking");
  const staking = await VeriRWAStaking.deploy(deployer.address); // Assuming 0G token address
  await staking.waitForDeployment();
  console.log("VeriRWAStaking deployed to:", staking.target);

  // Deploy VeriRWAMarketplace
  const VeriRWAMarketplace = await ethers.getContractFactory("VeriRWAMarketplace");
  const marketplace = await VeriRWAMarketplace.deploy(
    nft.target,
    deployer.address, // paymentToken
    deployer.address  // feeCollector
  );
  await marketplace.waitForDeployment();
  console.log("VeriRWAMarketplace deployed to:", marketplace.target);

  // Deploy VeriRWA0GIntegration
  const VeriRWA0GIntegration = await ethers.getContractFactory("VeriRWA0GIntegration");
  const integration = await VeriRWA0GIntegration.deploy(
    deployer.address, // zgStorageContract
    deployer.address, // zgComputeContract
    deployer.address  // verificationOracle
  );
  await integration.waitForDeployment();
  console.log("VeriRWA0GIntegration deployed to:", integration.target);

  console.log("All contracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
