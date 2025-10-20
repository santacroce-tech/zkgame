#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 Generating trusted setup parameters...');

const buildDir = path.join(__dirname, '..', 'build');
const setupDir = path.join(__dirname, '..', 'setup');

// Ensure setup directory exists
if (!fs.existsSync(setupDir)) {
    fs.mkdirSync(setupDir, { recursive: true });
}

// Circuits that need trusted setup (only the ones that are actually compiled)
const circuits = [
    'movement',
    'timeReward',
    'timeCraft'
];

// Generate trusted setup for each circuit
for (const circuit of circuits) {
    console.log(`🔑 Generating trusted setup for ${circuit}...`);
    
    const r1csPath = path.join(buildDir, circuit, `${circuit}.r1cs`);
    const wasmPath = path.join(buildDir, circuit, `${circuit}.wasm`);
    const setupPath = path.join(setupDir, circuit);
    
    try {
        // Phase 1: Powers of Tau
        console.log(`  📊 Phase 1: Powers of Tau for ${circuit}...`);
        execSync(`snarkjs ptn bn128 12 ${setupPath}_pot12_0000.ptau -v`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        // Contribute to Phase 1
        execSync(`snarkjs ptc ${setupPath}_pot12_0000.ptau ${setupPath}_pot12_0001.ptau --name="First contribution" -v`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        // Phase 2: Circuit-specific setup
        console.log(`  🔧 Phase 2: Circuit-specific setup for ${circuit}...`);
        execSync(`snarkjs pt2 ${setupPath}_pot12_0001.ptau ${setupPath}_pot12_final.ptau -v`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        // Generate proving key
        execSync(`snarkjs g16s ${r1csPath} ${setupPath}_pot12_final.ptau ${setupPath}_proving_key.json`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        // Generate verification key
        execSync(`snarkjs zkev ${setupPath}_proving_key.json ${setupPath}_verification_key.json`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        console.log(`✅ Trusted setup completed for ${circuit}`);
    } catch (error) {
        console.error(`❌ Failed to generate trusted setup for ${circuit}:`, error.message);
        process.exit(1);
    }
}

console.log('🎉 All trusted setup parameters generated successfully!');
console.log('📁 Setup files are in the setup/ directory');
