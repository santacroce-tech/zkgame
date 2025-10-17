#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Compiling ZKGame circuits...');

// Ensure build directory exists
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Circuit files to compile
const circuits = [
    'movement',
    'timeReward',
    'storePurchase',
    'inventoryTrade',
    'storeManagement',
    'resourceGathering',
    'timeCraft',
    'timeTravel',
    'timeBuild'
];

// Compile each circuit
for (const circuit of circuits) {
    console.log(`📦 Compiling ${circuit} circuit...`);
    
    const circuitPath = path.join(__dirname, '..', 'circuits', `${circuit}.circom`);
    const outputPath = path.join(buildDir, `${circuit}`);
    
    try {
        // Compile circuit
        execSync(`circom ${circuitPath} --r1cs --wasm --sym --c -o ${outputPath}`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        console.log(`✅ ${circuit} circuit compiled successfully`);
    } catch (error) {
        console.error(`❌ Failed to compile ${circuit} circuit:`, error.message);
        process.exit(1);
    }
}

console.log('🎉 All circuits compiled successfully!');
