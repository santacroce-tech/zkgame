const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying ZKGame contracts...");

    // Get the contract factories
    const StateManager = await hre.ethers.getContractFactory("StateManager");
    const ProofVerifier = await hre.ethers.getContractFactory("ProofVerifier");
    const GameCore = await hre.ethers.getContractFactory("GameCore");

    // Deploy StateManager first
    console.log("📦 Deploying StateManager...");
    const stateManager = await StateManager.deploy();
    await stateManager.waitForDeployment();
    const stateManagerAddress = await stateManager.getAddress();
    console.log(`✅ StateManager deployed to: ${stateManagerAddress}`);

    // Deploy ProofVerifier
    console.log("📦 Deploying ProofVerifier...");
    const proofVerifier = await ProofVerifier.deploy();
    await proofVerifier.waitForDeployment();
    const proofVerifierAddress = await proofVerifier.getAddress();
    console.log(`✅ ProofVerifier deployed to: ${proofVerifierAddress}`);

    // Deploy GameCore with dependencies
    console.log("📦 Deploying GameCore...");
    const gameCore = await GameCore.deploy(proofVerifierAddress, stateManagerAddress);
    await gameCore.waitForDeployment();
    const gameCoreAddress = await gameCore.getAddress();
    console.log(`✅ GameCore deployed to: ${gameCoreAddress}`);

    // Save deployment addresses
    const deploymentInfo = {
        network: hre.network.name,
        contracts: {
            StateManager: stateManagerAddress,
            ProofVerifier: proofVerifierAddress,
            GameCore: gameCoreAddress,
        },
        timestamp: new Date().toISOString(),
    };

    const fs = require('fs');
    const path = require('path');
    const deploymentPath = path.join(__dirname, '..', 'deployments', `${hre.network.name}.json`);
    
    // Ensure deployments directory exists
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: ${deploymentPath}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log(`   StateManager: ${stateManagerAddress}`);
    console.log(`   ProofVerifier: ${proofVerifierAddress}`);
    console.log(`   GameCore: ${gameCoreAddress}`);
    
    console.log("\n🔧 Next steps:");
    console.log("   1. Update CLI configuration with contract addresses");
    console.log("   2. Compile circuits: npm run compile");
    console.log("   3. Generate trusted setup: npm run setup");
    console.log("   4. Test the system: npm run test");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
