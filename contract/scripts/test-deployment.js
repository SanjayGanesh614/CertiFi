const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing deployed contracts...");
  
  const [owner] = await ethers.getSigners();
  console.log(`📝 Testing with account: ${owner.address}`);

  // Get contract instances
  const veriRWAINFT = await ethers.getContractAt("VeriRWAINFT", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  const veriRWAStaking = await ethers.getContractAt("VeriRWAStaking", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
  const veriRWAMarketplace = await ethers.getContractAt("VeriRWAMarketplace", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
  const zgIntegration = await ethers.getContractAt("VeriRWA0GIntegration", "0x5FbDB2315678afecb367f032d93F642f64180aa3");

  console.log("\n1️⃣ Checking contract owners...");
  console.log(`INFT Owner: ${await veriRWAINFT.owner()}`);
  console.log(`Staking Owner: ${await veriRWAStaking.owner()}`);
  console.log(`Marketplace Owner: ${await veriRWAMarketplace.owner()}`);
  console.log(`0G Integration Owner: ${await zgIntegration.owner()}`);

  console.log("\n2️⃣ Testing INFT functionality...");
  const tokenURI = "ipfs://QmTest";
  const assetId = ethers.encodeBytes32String("ASSET123");
  const verificationData = ethers.encodeBytes32String("verification");
  console.log("Minting a test NFT...");
  try {
    const mintTx = await veriRWAINFT.safeMint(
      owner.address,
      tokenURI,
      assetId,
      verificationData,
      { value: ethers.parseEther("0.1") }
    );
    await mintTx.wait();
    console.log("✅ NFT minted successfully");
    
    const tokenId = 1;
    console.log(`Token URI for ID ${tokenId}: ${await veriRWAINFT.tokenURI(tokenId)}`);
  } catch (error) {
    console.error("❌ NFT minting failed:", error.message);
  }

  console.log("\n3️⃣ Testing marketplace functionality...");
  try {
    const listingPrice = ethers.parseEther("1.0");
    console.log(`Approving marketplace to handle NFT...`);
    await veriRWAINFT.approve(veriRWAMarketplace.target, 1);
    console.log(`Listing NFT for ${ethers.formatEther(listingPrice)} ETH`);
    const listTx = await veriRWAMarketplace.listNFT(1, listingPrice);
    await listTx.wait();
    console.log("✅ NFT listed successfully");
  } catch (error) {
    console.error("❌ NFT listing failed:", error.message);
  }

  console.log("\n4️⃣ Testing staking functionality...");
  try {
    const stakeAmount = ethers.parseEther("100");
    console.log(`Staking ${ethers.formatEther(stakeAmount)} tokens...`);
    const stakeTx = await veriRWAStaking.stake(stakeAmount);
    await stakeTx.wait();
    console.log("✅ Tokens staked successfully");
  } catch (error) {
    console.error("❌ Staking failed:", error.message);
  }

  console.log("\n5️⃣ Testing 0G Integration...");
  try {
    const fileHash = "QmTestHash";
    const merkleRoot = ethers.ZeroHash;
    const fileSize = 1000;
    console.log("Submitting storage proof...");
    const proofTx = await zgIntegration.submitStorageProof(fileHash, merkleRoot, fileSize);
    await proofTx.wait();
    console.log("✅ Storage proof submitted successfully");
  } catch (error) {
    console.error("❌ Storage proof submission failed:", error.message);
  }

  console.log("\n✅ Contract testing completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });