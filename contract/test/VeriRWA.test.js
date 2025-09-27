const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeriRWA Contracts", function () {
  let nft, staking, marketplace, integration;
  let owner, addr1, addr2;
  let feeCollector, verificationOracle, zgStorageContract, zgComputeContract;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, feeCollector, verificationOracle, zgStorageContract, zgComputeContract] = await ethers.getSigners();

    // Deploy VeriRWAINFT
    const VeriRWAINFT = await ethers.getContractFactory("VeriRWAINFT");
    nft = await VeriRWAINFT.deploy(
      feeCollector.address,
      verificationOracle.address,
      zgStorageContract.address,
      zgComputeContract.address
    );
    await nft.waitForDeployment();

    // Deploy VeriRWAStaking
    const VeriRWAStaking = await ethers.getContractFactory("VeriRWAStaking");
    staking = await VeriRWAStaking.deploy(owner.address); // Using owner as 0G token for testing
    await staking.waitForDeployment();

    // Deploy VeriRWAMarketplace
    const VeriRWAMarketplace = await ethers.getContractFactory("VeriRWAMarketplace");
    marketplace = await VeriRWAMarketplace.deploy(
      nft.target,
      owner.address, // Using owner as payment token for testing
      feeCollector.address
    );
    await marketplace.waitForDeployment();

    // Deploy VeriRWA0GIntegration
    const VeriRWA0GIntegration = await ethers.getContractFactory("VeriRWA0GIntegration");
    integration = await VeriRWA0GIntegration.deploy(
      zgStorageContract.address,
      zgComputeContract.address,
      verificationOracle.address
    );
    await integration.waitForDeployment();
  });

  describe("VeriRWAINFT", function () {
    it("Should set the correct owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should set the correct fee collector", async function () {
      const currentFeeCollector = await nft.feeCollector();
      expect(currentFeeCollector).to.equal(feeCollector.address);
    });
  });

  describe("VeriRWAStaking", function () {
    it("Should set the correct staking token", async function () {
      const stakingTokenAddr = await staking.stakingToken();
      expect(stakingTokenAddr).to.equal(owner.address);
    });
  });

  describe("VeriRWAMarketplace", function () {
    it("Should set the correct NFT contract", async function () {
      const nftContract = await marketplace.nftContract();
      expect(nftContract).to.equal(nft.target);
    });

    it("Should set the correct fee collector", async function () {
      const currentFeeCollector = await marketplace.feeCollector();
      expect(currentFeeCollector).to.equal(feeCollector.address);
    });
  });

  describe("VeriRWA0GIntegration", function () {
    it("Should be owned by deployer", async function () {
      expect(await integration.owner()).to.equal(owner.address);
    });
  });
});