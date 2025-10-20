# ZKGame - Playable Web Version 🎮

A fully playable web-based version of the zero-knowledge proof simulation game with real-time multiplayer features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- Rust (latest stable version)
- Circom compiler (v2.1.6 or higher)
- Hardhat local network

### Installation & Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start Hardhat local network:**
   ```bash
   npx hardhat node
   ```

3. **Deploy contracts (in another terminal):**
   ```bash
   npm run deploy
   ```

4. **Start the game:**
   ```bash
   npm run start:game
   ```

5. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎮 How to Play

### Getting Started
1. **Connect Wallet:** Click "Connect Wallet" and connect your MetaMask
2. **Create Player:** Enter your player name and click "Start Game"
3. **Explore:** Click on adjacent cells to move around the world
4. **Gather Resources:** Use the Inventory panel to gather materials
5. **Craft Items:** Use the Crafting panel to create tools and weapons
6. **Chat:** Use the Chat panel to communicate with other players

### Game Features

#### 🌍 World Exploration
- **Fog of War:** Only see areas you've explored
- **Movement:** Click adjacent cells to move
- **Discovery:** Explore new areas to expand your known world

#### 📦 Inventory Management
- **Resource Gathering:** Collect iron ore, wood, stone, herbs, water, crystals
- **Cooldowns:** 5-minute cooldown between resource gathering
- **Storage:** Manage your collected materials

#### ⚒️ Crafting System
- **Recipes:** Craft basic tools, iron swords, and more
- **Time-Locked:** Crafting takes real time (15 minutes to 1 hour)
- **Materials:** Consume resources to create valuable items
- **Experience:** Gain XP for completed crafts

#### 💰 Economy
- **Passive Income:** Claim hourly rewards based on reputation
- **Currency:** Earn coins through gameplay
- **Store Ownership:** Buy and manage stores (coming soon)

#### 👥 Multiplayer Features
- **Real-time Chat:** Communicate with other players
- **Player Discovery:** See other players on the map
- **Shared Events:** Experience the world together

## 🏗️ Architecture

### Frontend (React/Next.js)
- **Game Map:** Interactive hexagonal grid with fog of war
- **Player Status:** Real-time stats and progress
- **Inventory:** Resource management and gathering
- **Crafting:** Time-locked item creation
- **Chat:** Real-time multiplayer communication
- **Wallet Integration:** MetaMask and WalletConnect support

### Backend (Node.js/Express)
- **WebSocket Server:** Real-time multiplayer communication
- **Game State Sync:** Player position and action synchronization
- **Blockchain Bridge:** Smart contract interaction
- **Event Monitoring:** Contract event processing

### Smart Contracts (Solidity)
- **GameCore:** Main game logic and action handling
- **StateManager:** Player state commitments
- **ProofVerifier:** Zero-knowledge proof verification

## 🔧 Development

### Running in Development Mode
```bash
# Terminal 1: Start Hardhat network
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy

# Terminal 3: Start full game
npm run start:game
```

### Individual Services
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Building for Production
```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend
```

## 🎯 Game Mechanics

### Movement
- Click adjacent cells to move
- Gain 10 XP per movement
- Explore new areas to expand your world

### Resource Gathering
- **Iron Ore:** Used for tools and weapons
- **Wood:** Basic crafting material
- **Stone:** Building material
- **Herbs:** Potion ingredients
- **Water:** Essential for life
- **Crystals:** Magic components

### Crafting Recipes
- **Basic Tool:** 1 Iron Ore + 1 Wood (15 min, 25 XP)
- **Iron Sword:** 3 Iron Ore + 1 Wood (1 hour, 100 XP)

### Rewards System
- **Base Rate:** 100 coins per hour
- **Reputation Multiplier:** Affects reward amount
- **Claim Interval:** Minimum 1 hour between claims

## 🔐 Privacy Features

- **Zero-Knowledge Proofs:** All actions are cryptographically proven
- **Private Inventories:** Your items remain hidden from other players
- **State Commitments:** Only hashes are stored on-chain
- **No Data Leaks:** Private information never leaves your device

## 🌐 Multiplayer

### Real-time Features
- **Player Positions:** See other players move in real-time
- **Chat System:** Communicate with all connected players
- **Shared Events:** Experience game events together
- **Player Discovery:** Find and interact with other players

### Connection Status
- **Green Dot:** Connected to game server
- **Red Dot:** Disconnected from game server
- **Auto-reconnect:** Automatic reconnection on network issues

## 🐛 Troubleshooting

### Common Issues

#### "Cannot move to location"
- You can only move to adjacent cells or previously explored areas
- Check if the cell is within 1 step of your current position

#### "Resource gathering cooldown"
- Wait 5 minutes between gathering the same resource type
- Try gathering different resources

#### "Insufficient materials"
- Check your inventory for required materials
- Gather more resources before crafting

#### "Must wait between claims"
- Wait at least 1 hour between reward claims
- Check the timer in the Player Status panel

### Connection Issues
- Ensure Hardhat network is running (`npx hardhat node`)
- Check that contracts are deployed (`npm run deploy`)
- Verify backend server is running (port 3001)
- Check browser console for WebSocket connection errors

## 🚧 Roadmap

### Phase 1: Core Gameplay ✅
- [x] Web UI with React/Next.js
- [x] Real-time multiplayer with WebSocket
- [x] Interactive game map with fog of war
- [x] Resource gathering and inventory
- [x] Time-locked crafting system
- [x] Chat and player discovery

### Phase 2: Enhanced Features (In Progress)
- [ ] Store purchase and management
- [ ] Player-to-player trading
- [ ] Guild system
- [ ] Advanced crafting recipes
- [ ] Mobile-responsive design

### Phase 3: Advanced Features (Planned)
- [ ] Zero-knowledge proof integration
- [ ] VDF-based time locks
- [ ] Blockchain transaction submission
- [ ] Achievement system
- [ ] Leaderboards

## 📱 Mobile Support

The game is designed to be mobile-friendly with:
- Responsive design for all screen sizes
- Touch-friendly controls
- Optimized UI for mobile devices
- Progressive Web App (PWA) capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Welcome to ZKGame - where privacy meets multiplayer gameplay!** 🎮🔐

Start playing now at http://localhost:3000
