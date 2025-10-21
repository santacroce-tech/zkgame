# 🎮 ZKGame - Playable Setup Guide

## Quick Start (Recommended)

### Option 1: One-Command Setup
```bash
./start-game.sh
```

This script will:
- Install all dependencies
- Start Hardhat network
- Deploy contracts
- Launch the game

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start Hardhat network (Terminal 1):**
   ```bash
   npx hardhat node
   ```

3. **Deploy contracts (Terminal 2):**
   ```bash
   npm run deploy
   ```

4. **Start the game (Terminal 3):**
   ```bash
   npm run start:game
   ```

5. **Open your browser:**
   - Game: http://localhost:3000
   - API: http://localhost:3001

## 🎯 How to Play

### 1. Connect Wallet
- Click "Connect Wallet" button
- Connect your MetaMask wallet
- Make sure you're on the Hardhat network (Chain ID: 31337)

### 2. Create Player
- Enter your player name
- Click "Start Game"
- You'll spawn at position (0,0) in Newhaven

### 3. Explore the World
- Click on adjacent cells to move
- Explore new areas to expand your known world
- Gain XP for each movement

### 4. Gather Resources
- Open the Inventory panel
- Select a resource type (iron ore, wood, stone, etc.)
- Click "Gather" to collect materials
- Wait 5 minutes between gathering the same resource

### 5. Craft Items
- Open the Crafting panel
- Select a recipe (Basic Tool, Iron Sword)
- Click "Start Crafting"
- Wait for the craft to complete
- Click "Complete" when ready

### 6. Claim Rewards
- Click "Claim Rewards" in Player Status
- Earn coins based on time elapsed and reputation
- Wait 1 hour between claims

### 7. Chat with Players
- Open the Chat panel
- Type messages to communicate with other players
- See real-time player movements on the map

## 🎮 Game Features

### World Map
- **21x21 grid** with fog of war
- **Click to move** to adjacent cells
- **Explore new areas** to expand your world
- **See other players** in real-time

### Inventory System
- **6 resource types:** Iron Ore, Wood, Stone, Herb, Water, Crystal
- **Gathering cooldowns:** 5 minutes per resource type
- **Real-time updates** when items are added

### Crafting System
- **Time-locked crafting:** Real time required
- **Basic Tool:** 15 minutes, 25 XP
- **Iron Sword:** 1 hour, 100 XP
- **Progress tracking** with visual indicators

### Multiplayer Features
- **Real-time chat** with all connected players
- **Player discovery** - see others on the map
- **Position synchronization** - watch others move
- **Connection status** indicators

### Economy
- **Passive income:** Claim hourly rewards
- **Reputation system:** Affects reward amounts
- **Currency management:** Track your coins
- **Store ownership:** Coming soon!

## 🔧 Technical Details

### Frontend (React/Next.js)
- **Port:** 3000
- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Web3:** Wagmi + RainbowKit

### Backend (Node.js/Express)
- **Port:** 3001
- **WebSocket:** Socket.io for real-time communication
- **API:** REST endpoints for game actions
- **Blockchain:** Ethers.js for contract interaction

### Smart Contracts
- **Network:** Hardhat Local (Chain ID: 31337)
- **GameCore:** 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
- **StateManager:** 0x5FbDB2315678afecb367f032d93F642f64180aa3
- **ProofVerifier:** 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

## 🐛 Troubleshooting

### "Cannot move to location"
- You can only move to adjacent cells or previously explored areas
- Check if the target cell is within 1 step of your position

### "Resource gathering cooldown"
- Wait 5 minutes between gathering the same resource type
- Try gathering different resources instead

### "Must wait between claims"
- Wait at least 1 hour between reward claims
- Check the timer in the Player Status panel

### Connection Issues
- Ensure Hardhat network is running: `npx hardhat node`
- Check that contracts are deployed: `npm run deploy`
- Verify backend server is running on port 3001
- Check browser console for WebSocket errors

### Wallet Issues
- Make sure MetaMask is installed and unlocked
- Switch to Hardhat network (Chain ID: 31337)
- Import a test account with some ETH

## 🚀 Next Steps

### For Players
1. **Explore the world** - discover new areas
2. **Gather resources** - collect materials for crafting
3. **Craft items** - create tools and weapons
4. **Interact with others** - chat and explore together
5. **Build your reputation** - claim rewards regularly

### For Developers
1. **Integrate ZK proofs** - connect to the existing circuits
2. **Add VDF time locks** - implement real time-locked actions
3. **Enhance multiplayer** - add guilds and trading
4. **Mobile optimization** - improve mobile experience
5. **Deploy to mainnet** - launch on a public network

## 📱 Mobile Support

The game works on mobile devices with:
- Touch-friendly controls
- Responsive design
- Optimized UI for small screens
- Progressive Web App capabilities

## 🎉 Enjoy Playing!

ZKGame is now fully playable with:
- ✅ Interactive web UI
- ✅ Real-time multiplayer
- ✅ Resource gathering
- ✅ Time-locked crafting
- ✅ Chat system
- ✅ Player discovery
- ✅ Wallet integration

**Start your adventure at http://localhost:3000!**
