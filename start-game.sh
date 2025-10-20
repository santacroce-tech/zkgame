#!/bin/bash

echo "🎮 ZKGame - Starting Playable Web Version"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18.0.0 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "📦 Installing dependencies..."
npm run install:all

echo ""
echo "🚀 Starting Hardhat network..."
echo "   (This will run in the background)"
npx hardhat node &
HARDHAT_PID=$!

# Wait for Hardhat to start
echo "⏳ Waiting for Hardhat network to start..."
sleep 5

echo ""
echo "📋 Deploying contracts..."
npm run deploy

echo ""
echo "🎮 Starting ZKGame..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start the game
npm run start:game &
GAME_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping ZKGame..."
    kill $GAME_PID 2>/dev/null
    kill $HARDHAT_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for the game to finish
wait $GAME_PID
