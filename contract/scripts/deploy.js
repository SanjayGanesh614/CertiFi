const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying VeriRWA INFT contracts to 0G Testnet...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying with account: ${deployer.address}`);

    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} OG`);

    if (balance < ethers.parseEther("0.1")) {
        console.warn("⚠️  Low balance - consider getting more OG tokens from faucet");
    }

    // Deploy contracts
    const deploymentResults = {};

    try {
        // 1. Deploy VeriRWA0GIntegration first (dependency for INFT)
        console.log("\n1️⃣ Deploying VeriRWA0GIntegration...");
        const VeriRWA0GIntegration = await ethers.getContractFactory("VeriRWA0GIntegration");
        const zgIntegration = await VeriRWA0GIntegration.deploy(
            "0x0000000000000000000000000000000000000001", // Placeholder for 0G Storage Indexer
            "0x0000000000000000000000000000000000000002", // Placeholder for 0G Compute Broker
            "0x0000000000000000000000000000000000000003", // Placeholder for 0G DA Contract
            { gasLimit: 5000000 }
        );
        await zgIntegration.waitForDeployment();
        const zgIntegrationAddress = await zgIntegration.getAddress();
        deploymentResults.zgIntegration = zgIntegrationAddress;
        console.log(`✅ VeriRWA0GIntegration deployed at: ${zgIntegrationAddress}`);

        // 2. Deploy VeriRWAINFT (ERC-7857 INFT)
        console.log("\n2️⃣ Deploying VeriRWAINFT (ERC-7857 INFT)...");
        const VeriRWAINFT = await ethers.getContractFactory("VeriRWAINFT");
        const veriRWAINFT = await VeriRWAINFT.deploy(
            deployer.address,    // Fee collector
            deployer.address,    // Verification oracle (initially deployer)
            zgIntegrationAddress, // 0G Storage contract
            zgIntegrationAddress, // 0G Compute contract
            { gasLimit: 6000000 }
        );
        await veriRWAINFT.waitForDeployment();
        const veriRWAINFTAddress = await veriRWAINFT.getAddress();
        deploymentResults.veriRWAINFT = veriRWAINFTAddress;
        console.log(`✅ VeriRWAINFT deployed at: ${veriRWAINFTAddress}`);

        // 3. Deploy VeriRWAStaking
        console.log("\n3️⃣ Deploying VeriRWAStaking...");
        const VeriRWAStaking = await ethers.getContractFactory("VeriRWAStaking");
        const veriRWAStaking = await VeriRWAStaking.deploy(
            "0x0000000000000000000000000000000000000000", // Placeholder for OG token address
            { gasLimit: 3000000 }
        );
        await veriRWAStaking.waitForDeployment();
        const veriRWAStakingAddress = await veriRWAStaking.getAddress();
        deploymentResults.veriRWAStaking = veriRWAStakingAddress;
        console.log(`✅ VeriRWAStaking deployed at: ${veriRWAStakingAddress}`);

        // 4. Deploy VeriRWAMarketplace
        console.log("\n4️⃣ Deploying VeriRWAMarketplace...");
        const VeriRWAMarketplace = await ethers.getContractFactory("VeriRWAMarketplace");
        const veriRWAMarketplace = await VeriRWAMarketplace.deploy(
            veriRWAINFTAddress,   // INFT contract
            "0x0000000000000000000000000000000000000000", // Placeholder for payment token (USDC)
            deployer.address,     // Fee collector
            { gasLimit: 4000000 }
        );
        await veriRWAMarketplace.waitForDeployment();
        const veriRWAMarketplaceAddress = await veriRWAMarketplace.getAddress();
        deploymentResults.veriRWAMarketplace = veriRWAMarketplaceAddress;
        console.log(`✅ VeriRWAMarketplace deployed at: ${veriRWAMarketplaceAddress}`);

        // 5. Setup initial configuration
        console.log("\n⚙️ Setting up initial configuration...");

        // Set INFT contract in 0G Integration
        await zgIntegration.setVeriRWANFT(veriRWAINFTAddress);
        console.log("✅ Set VeriRWAINFT address in 0G Integration");

        // Set staking contract in INFT
        await veriRWAINFT.setStakingContract(veriRWAStakingAddress);
        console.log("✅ Set staking contract in VeriRWAINFT");

        // Set deployer as authorized auditor
        await veriRWAINFT.setAuthorizedAuditor(deployer.address, true);
        console.log("✅ Set deployer as authorized auditor");

        // Register deployer as verification oracle in 0G Integration
        await zgIntegration.registerOracle(deployer.address, 100); // 100% reputation
        console.log("✅ Registered deployer as verification oracle");

        // Verification
        console.log("\n🧪 Verifying deployment...");
        const nftName = await veriRWAINFT.name();
        const nftSymbol = await veriRWAINFT.symbol();
        console.log(`INFT: ${nftName} (${nftSymbol})`);

        // Check if contracts support ERC-7857
        const supportsINFT = await veriRWAINFT.supportsInterface("0x12345678"); // Placeholder interface ID
        console.log(`ERC-7857 Support: ${supportsINFT}`);

        console.log("\n🎉 All contracts deployed successfully!");
        console.log("\n📋 Deployment Summary:");
        console.log("=" .repeat(50));
        Object.entries(deploymentResults).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });

        console.log("\n🔗 Explorer Links:");
        Object.entries(deploymentResults).forEach(([name, address]) => {
            console.log(`${name}: https://explorer-testnet.0g.ai/address/${address}`);
        });

        // Save deployment addresses to file
        const fs = require('fs');
        const deploymentData = {
            network: "0G Testnet",
            chainId: 16601,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: deploymentResults,
            configuration: {
                feeCollector: deployer.address,
                verificationOracle: deployer.address,
                platformFeeBPS: 100,
                verificationThreshold: 70,
                minimumStake: "1000000000000000000000" // 1000 OG tokens
            }
        };

        fs.writeFileSync(
            './deployed-contracts.json',
            JSON.stringify(deploymentData, null, 2)
        );
        console.log("\n💾 Deployment data saved to deployed-contracts.json");

        // Generate .env update suggestions
        console.log("\n📝 Add these to your .env file:");
        console.log("=" .repeat(50));
        console.log(`VERIRWA_INFT_ADDRESS=${deploymentResults.veriRWAINFT}`);
        console.log(`VERIRWA_STAKING_ADDRESS=${deploymentResults.veriRWAStaking}`);
        console.log(`VERIRWA_MARKETPLACE_ADDRESS=${deploymentResults.veriRWAMarketplace}`);
        console.log(`VERIRWA_0G_INTEGRATION_ADDRESS=${deploymentResults.zgIntegration}`);

        console.log("\n🔗 Verify contracts on 0G Explorer:");
        console.log("https://explorer-testnet.0g.ai/");

        return deploymentData;

    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };