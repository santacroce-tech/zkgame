const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameCore", function () {
    let gameCore;
    let stateManager;
    let proofVerifier;
    let owner;
    let player1;
    let player2;

    beforeEach(async function () {
        [owner, player1, player2] = await ethers.getSigners();

        // Deploy StateManager
        const StateManager = await ethers.getContractFactory("StateManager");
        stateManager = await StateManager.deploy();
        await stateManager.waitForDeployment();

        // Deploy ProofVerifier
        const ProofVerifier = await ethers.getContractFactory("ProofVerifier");
        proofVerifier = await ProofVerifier.deploy();
        await proofVerifier.waitForDeployment();

        // Deploy GameCore
        const GameCore = await ethers.getContractFactory("GameCore");
        gameCore = await GameCore.deploy(
            await proofVerifier.getAddress(),
            await stateManager.getAddress()
        );
        await gameCore.waitForDeployment();
    });

    describe("Player Initialization", function () {
        it("Should allow player initialization", async function () {
            const commitment = ethers.keccak256(ethers.toUtf8Bytes("test commitment"));
            
            await stateManager.initializePlayer(player1.address, commitment);
            
            const playerCommitment = await stateManager.getPlayerCommitment(player1.address);
            expect(playerCommitment).to.equal(commitment);
        });
    });

    describe("Movement", function () {
        beforeEach(async function () {
            const commitment = ethers.keccak256(ethers.toUtf8Bytes("test commitment"));
            await stateManager.initializePlayer(player1.address, commitment);
        });

        it("Should process valid movement", async function () {
            // Mock proof data (in production, these would be real proof components)
            const a = [ethers.BigNumber.from("1"), ethers.BigNumber.from("2")];
            const b = [[ethers.BigNumber.from("3"), ethers.BigNumber.from("4")], 
                      [ethers.BigNumber.from("5"), ethers.BigNumber.from("6")]];
            const c = [ethers.BigNumber.from("7"), ethers.BigNumber.from("8")];
            const publicSignals = [
                ethers.keccak256(ethers.toUtf8Bytes("old commitment")),
                ethers.keccak256(ethers.toUtf8Bytes("new commitment")),
                ethers.BigNumber.from("1234567890")
            ];

            // Since proof verification is mocked to return true, this should succeed
            await expect(gameCore.connect(player1).move(a, b, c, publicSignals))
                .to.emit(gameCore, "PlayerMoved")
                .withArgs(player1.address, publicSignals[1]);
        });

        it("Should reject movement with state commitment mismatch", async function () {
            const a = [ethers.BigNumber.from("1"), ethers.BigNumber.from("2")];
            const b = [[ethers.BigNumber.from("3"), ethers.BigNumber.from("4")], 
                      [ethers.BigNumber.from("5"), ethers.BigNumber.from("6")]];
            const c = [ethers.BigNumber.from("7"), ethers.BigNumber.from("8")];
            const publicSignals = [
                ethers.keccak256(ethers.toUtf8Bytes("wrong commitment")), // Wrong commitment
                ethers.keccak256(ethers.toUtf8Bytes("new commitment")),
                ethers.BigNumber.from("1234567890")
            ];

            await expect(gameCore.connect(player1).move(a, b, c, publicSignals))
                .to.be.revertedWith("State commitment mismatch");
        });
    });

    describe("Reward Claims", function () {
        beforeEach(async function () {
            const commitment = ethers.keccak256(ethers.toUtf8Bytes("test commitment"));
            await stateManager.initializePlayer(player1.address, commitment);
        });

        it("Should process valid reward claim", async function () {
            const a = [ethers.BigNumber.from("1"), ethers.BigNumber.from("2")];
            const b = [[ethers.BigNumber.from("3"), ethers.BigNumber.from("4")], 
                      [ethers.BigNumber.from("5"), ethers.BigNumber.from("6")]];
            const c = [ethers.BigNumber.from("7"), ethers.BigNumber.from("8")];
            const publicSignals = [
                ethers.keccak256(ethers.toUtf8Bytes("old commitment")),
                ethers.keccak256(ethers.toUtf8Bytes("new commitment")),
                ethers.BigNumber.from("1234567890"),
                ethers.BigNumber.from("100") // Reward amount
            ];

            await expect(gameCore.connect(player1).claimReward(a, b, c, publicSignals))
                .to.emit(gameCore, "RewardClaimed")
                .withArgs(player1.address, 100);
        });
    });

    describe("Store Operations", function () {
        beforeEach(async function () {
            const commitment = ethers.keccak256(ethers.toUtf8Bytes("test commitment"));
            await stateManager.initializePlayer(player1.address, commitment);
        });

        it("Should process store purchase", async function () {
            const a = [ethers.BigNumber.from("1"), ethers.BigNumber.from("2")];
            const b = [[ethers.BigNumber.from("3"), ethers.BigNumber.from("4")], 
                      [ethers.BigNumber.from("5"), ethers.BigNumber.from("6")]];
            const c = [ethers.BigNumber.from("7"), ethers.BigNumber.from("8")];
            const publicSignals = [
                ethers.keccak256(ethers.toUtf8Bytes("old commitment")),
                ethers.keccak256(ethers.toUtf8Bytes("new commitment")),
                ethers.BigNumber.from("1"), // Store ID
                ethers.BigNumber.from("1000") // Store price
            ];

            await expect(gameCore.connect(player1).purchaseStore(a, b, c, publicSignals))
                .to.emit(gameCore, "StorePurchased")
                .withArgs(player1.address, 1);
        });
    });
});
