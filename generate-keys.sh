#!/bin/bash

echo "🔐 Generating missing trusted setup keys..."

# Check if Powers of Tau files exist
if [ ! -f "setup/movement_pot12_final.ptau" ]; then
    echo "❌ Powers of Tau file not found. Please run full setup first."
    exit 1
fi

# Generate proving keys for each circuit
echo "🔑 Generating proving keys..."

# Movement circuit
if [ -f "build/movement/movement.r1cs" ]; then
    echo "📦 Generating movement proving key..."
    snarkjs g16s build/movement/movement.r1cs setup/movement_pot12_final.ptau setup/movement_proving_key.json
    echo "✅ Movement proving key generated"
else
    echo "❌ Movement circuit not compiled"
fi

# TimeReward circuit  
if [ -f "build/timeReward/timeReward.r1cs" ]; then
    echo "📦 Generating timeReward proving key..."
    snarkjs g16s build/timeReward/timeReward.r1cs setup/movement_pot12_final.ptau setup/timeReward_proving_key.json
    echo "✅ TimeReward proving key generated"
else
    echo "❌ TimeReward circuit not compiled"
fi

# TimeCraft circuit
if [ -f "build/timeCraft/timeCraft.r1cs" ]; then
    echo "📦 Generating timeCraft proving key..."
    snarkjs g16s build/timeCraft/timeCraft.r1cs setup/movement_pot12_final.ptau setup/timeCraft_proving_key.json
    echo "✅ TimeCraft proving key generated"
else
    echo "❌ TimeCraft circuit not compiled"
fi

echo "🎉 Trusted setup keys generated successfully!"
