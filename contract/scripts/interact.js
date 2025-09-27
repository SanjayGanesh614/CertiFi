const { ethers } = require("hardhat");

async function main() {
  const [owner, addr1] = await ethers.getSigners();
  console.log("Deploying and interacting with contracts using account:", owner.address);

  // Deploy contracts
  console.log("\nDeploying contracts...");
  
  // Deploy VeriRWAINFT
  const VeriRWAINFT = await ethers.getContractFactory("VeriRWAINFT");
  const nft = await VeriRWAINFT.deploy(
    owner.address, // feeCollector
    owner.address, // verificationOracle
    owner.address, // zgStorageContract
    owner.address  // zgComputeContract
  );
  await nft.waitForDeployment();
  console.log("VeriRWAINFT deployed to:", nft.target);

  // Deploy VeriRWAStaking
  const VeriRWAStaking = await ethers.getContractFactory("VeriRWAStaking");
  const staking = await VeriRWAStaking.deploy(owner.address);
  await staking.waitForDeployment();
  console.log("VeriRWAStaking deployed to:", staking.target);

  // Deploy VeriRWAMarketplace
  const VeriRWAMarketplace = await ethers.getContractFactory("VeriRWAMarketplace");
  const marketplace = await VeriRWAMarketplace.deploy(
    nft.target,
    owner.address,
    owner.address
  );
  await marketplace.waitForDeployment();
  console.log("VeriRWAMarketplace deployed to:", marketplace.target);

  // Deploy VeriRWA0GIntegration
  const VeriRWA0GIntegration = await ethers.getContractFactory("VeriRWA0GIntegration");
  const integration = await VeriRWA0GIntegration.deploy(
    owner.address,
    owner.address,
    owner.address
  );
  await integration.waitForDeployment();
  console.log("VeriRWA0GIntegration deployed to:", integration.target);

  // Example interactions
  console.log("\nInteracting with contracts:");

  // NFT Contract Interactions
  console.log("\nNFT Contract:");
  console.log("Owner:", await nft.owner());
  console.log("Fee Collector:", await nft.feeCollector());
  
  // Try to mint an NFT
  const tokenURI = "ipfs://QmExample";
  const assetId = "ASSET123";
  const metadata = ethers.encodeBytes32String("metadata");
  console.log("\nMinting NFT...");
  try {
    const tx = await nft.mint(tokenURI, assetId, metadata, { value: ethers.parseEther("0.1") });
    await tx.wait();
    console.log("NFT minted successfully!");
    console.log("Token URI for token 1:", await nft.tokenURI(1));
  } catch (error) {
    console.log("Minting failed:", error.message);
  }

  // Staking Contract Interactions
  console.log("\nStaking Contract:");
  console.log("Staking Token:", await staking.stakingToken());
  console.log("Total Staked:", await staking.totalStaked());
  console.log("Minimum Stake:", await staking.minimumStake());

  // Marketplace Contract Interactions
  console.log("\nMarketplace Contract:");
  console.log("NFT Contract Address:", await marketplace.nftContract());
  console.log("Fee Collector:", await marketplace.feeCollector());

  // List an NFT (if we minted one successfully)
  try {
    const listingPrice = ethers.parseEther("1");
    console.log("\nListing NFT for", ethers.formatEther(listingPrice), "ETH");
    const approveTx = await nft.approve(marketplace.target, 1);
    await approveTx.wait();
    const listTx = await marketplace.listNFT(1, listingPrice);
    await listTx.wait();
    console.log("NFT listed successfully!");
  } catch (error) {
    console.log("Listing failed:", error.message);
  }

  // Integration Contract Interactions
  console.log("\nIntegration Contract:");
  console.log("Owner:", await integration.owner());

  // Example of submitting a storage proof
  try {
    console.log("\nSubmitting storage proof...");
    const proof = {
      fileHash: "QmExample",
      merkleRoot: ethers.ZeroHash,
      fileSize: 1000,
      timestamp: Math.floor(Date.now() / 1000),
      uploader: owner.address,
      verified: false
    };
    const tx = await integration.submitStorageProof(proof.fileHash, proof.merkleRoot, proof.fileSize);
    await tx.wait();
    console.log("Storage proof submitted successfully!");
  } catch (error) {
    console.log("Storage proof submission failed:", error.message);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });