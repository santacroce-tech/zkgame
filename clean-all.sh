#!/bin/bash

echo "🧹 Starting comprehensive cleanup of ZKGame environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop any running processes
print_status "Stopping running processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "hardhat node" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true

# 1. Clean compiled circuit artifacts
print_status "Cleaning compiled circuit artifacts..."
rm -rf build/
rm -rf cache/
rm -rf artifacts/
print_success "Circuit build artifacts cleaned"

# 2. Clean proof generation artifacts
print_status "Cleaning proof generation artifacts..."
rm -rf proofs/
print_success "Proof artifacts cleaned"

# 3. Clean smart contract deployments
print_status "Cleaning smart contract deployments..."
rm -f deployments/hardhat.json
rm -rf deployments/localhost/
print_success "Contract deployment artifacts cleaned"

# 4. Clean trusted setup artifacts (optional - be careful!)
print_warning "Cleaning trusted setup artifacts..."
read -p "Do you want to delete trusted setup files? This will require regenerating them (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf setup/
    print_success "Trusted setup artifacts cleaned"
else
    print_status "Skipping trusted setup cleanup"
fi

# 5. Clean frontend build artifacts
print_status "Cleaning frontend build artifacts..."
rm -rf frontend/dist/
rm -rf frontend/node_modules/
rm -f frontend/package-lock.json
print_success "Frontend artifacts cleaned"

# 6. Clean backend artifacts
print_status "Cleaning backend artifacts..."
rm -rf backend/node_modules/
rm -f backend/package-lock.json
print_success "Backend artifacts cleaned"

# 7. Clean root node_modules
print_status "Cleaning root dependencies..."
rm -rf node_modules/
rm -f package-lock.json
print_success "Root dependencies cleaned"

# 8. Clean Rust build artifacts
print_status "Cleaning Rust build artifacts..."
rm -rf cli/target/
rm -rf vdf/target/
print_success "Rust build artifacts cleaned"

# 9. Clean frontend-backup artifacts
print_status "Cleaning frontend-backup artifacts..."
rm -rf frontend-backup/node_modules/
rm -f frontend-backup/package-lock.json
print_success "Frontend-backup artifacts cleaned"

# 10. Clean any temporary files
print_status "Cleaning temporary files..."
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true
print_success "Temporary files cleaned"

# 11. Clean Hardhat cache
print_status "Cleaning Hardhat cache..."
npx hardhat clean 2>/dev/null || true
print_success "Hardhat cache cleaned"

# 12. Clean any running Hardhat node data
print_status "Cleaning Hardhat node data..."
rm -rf .hardhat/
print_success "Hardhat node data cleaned"

print_success "🎉 Complete cleanup finished!"
print_status "To rebuild the environment, run:"
echo "  1. npm install"
echo "  2. npm run setup"
echo "  3. npm run compile"
echo "  4. npm run dev"
