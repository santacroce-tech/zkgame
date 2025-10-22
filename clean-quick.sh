#!/bin/bash

echo "🧹 Quick cleanup of ZKGame environment (essential parts only)..."

# Stop running processes
echo "Stopping running processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "hardhat node" 2>/dev/null || true

# Clean compiled circuits
echo "Cleaning compiled circuits..."
rm -rf build/
rm -rf cache/
rm -rf artifacts/

# Clean proofs
echo "Cleaning proofs..."
rm -rf proofs/

# Clean deployments
echo "Cleaning deployments..."
rm -f deployments/hardhat.json
rm -rf deployments/localhost/

# Clean Hardhat cache
echo "Cleaning Hardhat cache..."
npx hardhat clean 2>/dev/null || true

echo "✅ Quick cleanup complete!"
echo "Run 'npm install && npm run setup && npm run compile' to rebuild"
