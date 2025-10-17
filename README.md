# ZKGame - Zero-Knowledge Proof-Based Simulation Game

A revolutionary simulation game that combines zero-knowledge proofs with Verifiable Delay Functions (VDF) to create a privacy-preserving, time-locked gaming experience. Players navigate through a fog-of-war world, gather resources, craft items, and participate in a player-driven economy while maintaining complete privacy.

## 🌟 Features

- **Zero-knowledge proof-based gameplay** - All actions are cryptographically proven without revealing private information
- **Complete player privacy** - Inventories, positions, and wealth remain private while being verifiable on-chain
- **Time-locked actions using VDF** - Crafting, travel, and building require computational proof of time passage
- **Fog of war exploration** - Discover new areas and expand your known world
- **Player-owned economy** - Purchase and manage stores, set prices, and trade with other players
- **Resource gathering and crafting** - Collect materials and create valuable items with time requirements
- **Decentralized state management** - All game state is managed through cryptographic commitments

## 🛠 Prerequisites

Before you begin, ensure you have the following software installed:

- **Node.js** (v18.0.0 or higher) and npm
- **Rust** (latest stable version) and Cargo
- **Circom compiler** (v2.1.6 or higher)
- **snarkjs** (v0.7.0 or higher)
- **Hardhat** (v2.19.0 or higher)
- **GMP library** (for VDF computations)

### Installation Commands

```bash
# Install Node.js dependencies
npm install

# Install Circom
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --git https://github.com/iden3/circom.git

# Install snarkjs
npm install -g snarkjs

# Install GMP (Ubuntu/Debian)
sudo apt-get install libgmp-dev

# Install GMP (macOS)
brew install gmp
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zkgame
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Build Rust components (VDF and CLI)**
   ```bash
   # Build VDF library
   cd vdf
   cargo build --release
   cd ..
   
   # Build CLI tool
   cd cli
   cargo build --release
   cd ..
   ```

4. **Compile circuits**
   ```bash
   npm run compile
   ```

5. **Generate trusted setup parameters**
   ```bash
   npm run setup
   ```

6. **Deploy contracts to local network**
   ```bash
   npx hardhat node &
   npm run deploy
   ```

7. **Configure CLI with contract addresses**
   ```bash
   # The deployment script will output contract addresses
   # Update the CLI configuration with these addresses
   ```

## 🎮 Quick Start Guide

1. **Initialize a player**
   ```bash
   ./target/release/zkgame init --name "Alice"
   ```

2. **Check your status**
   ```bash
   ./target/release/zkgame status
   ```

3. **Move to a new location**
   ```bash
   ./target/release/zkgame move --x 1 --y 0
   ```

4. **Claim time-based rewards**
   ```bash
   ./target/release/zkgame claim
   ```

5. **Start crafting an item**
   ```bash
   ./target/release/zkgame craft --recipe "iron_sword"
   ```

6. **Complete the craft (after waiting)**
   ```bash
   ./target/release/zkgame complete-craft --craft-id "craft_1234567890_1234567890"
   ```

## 📖 CLI Reference

### Commands

#### `init --name <player_name>`
Initialize a new player with the specified name.

**Example:**
```bash
zkgame init --name "Alice"
```

#### `move --x <coord> --y <coord>`
Move to new coordinates. Must be adjacent to current position or previously explored area.

**Example:**
```bash
zkgame move --x 1 --y 0
```

#### `claim`
Claim time-based passive income rewards.

**Example:**
```bash
zkgame claim
```

#### `craft --recipe <recipe_name>`
Start crafting an item using the specified recipe.

**Example:**
```bash
zkgame craft --recipe "iron_sword"
```

#### `complete-craft --craft-id <id>`
Complete a craft that has finished processing.

**Example:**
```bash
zkgame complete-craft --craft-id "craft_1234567890_1234567890"
```

#### `trade --store-id <id> --action <buy|sell> --item <item_name> --quantity <amount>`
Trade with a store.

**Example:**
```bash
zkgame trade --store-id 1 --action buy --item "iron_sword" --quantity 1
```

#### `buy-store --city <city_name> --price <amount>`
Purchase a store in the specified city.

**Example:**
```bash
zkgame buy-store --city "Newhaven" --price 1000
```

#### `manage-store --store-id <id> --action <set_price|restock|withdraw>`
Manage your store operations.

**Example:**
```bash
zkgame manage-store --store-id 1 --action set_price
```

#### `status`
Display current player status and game state.

**Example:**
```bash
zkgame status
```

## 🏗 Development Guide

### Adding New Circuits

1. Create a new `.circom` file in the `circuits/` directory
2. Follow the existing circuit patterns for input/output structure
3. Add the circuit to the compilation script
4. Update the ProofVerifier contract with the new verification function
5. Add corresponding tests

### Modifying Game Constants

Edit `config/game_constants.json` to adjust:
- Movement costs and XP rewards
- Base reward rates
- Crafting requirements
- Store prices
- Resource regeneration rates

### Creating New Recipes

Add new recipes to `config/recipes.json`:
```json
{
  "id": 6,
  "name": "magic_sword",
  "required_materials": [
    {"item_type": "iron_sword", "quantity": 1},
    {"item_type": "magic_crystal", "quantity": 2}
  ],
  "output_item": {"type": "magic_sword", "quantity": 1},
  "required_time_seconds": 7200,
  "experience_reward": 200,
  "skill_level_requirement": 3
}
```

### Testing Changes

```bash
# Run circuit tests
npm run test:circuits

# Run contract tests
npm run test:contracts

# Run integration tests
npm run test:integration
```

## 🏛 Architecture Overview

### How PLONK Proofs Maintain Privacy

ZKGame uses PLONK (Permutation-based zk-SNARK) circuits to prove the validity of game actions without revealing private information:

1. **Private Inputs**: Player state, inventory, position, etc.
2. **Public Inputs**: State commitments, timestamps, action types
3. **Constraints**: Mathematical relationships that must be satisfied
4. **Proof Generation**: Cryptographic proof that constraints are met
5. **Verification**: Fast verification without revealing private data

### How VDF Provides Time-Locks

Verifiable Delay Functions ensure time-locked actions:

1. **Sequential Computation**: VDF requires sequential squaring operations
2. **Time Binding**: Computation time maps to real-world time (278 iterations/second)
3. **Proof Generation**: Wesolowski proof proves correct computation
4. **Circuit Integration**: VDF verification happens inside PLONK circuits
5. **Action Binding**: VDF input is bound to specific player actions

### How State Commitments Work

Game state is managed through cryptographic commitments:

1. **Off-chain State**: Private player data stored locally
2. **State Hashing**: Poseidon hash of complete state
3. **On-chain Commitment**: Only hash stored on blockchain
4. **Proof Verification**: Circuits verify state transitions
5. **Privacy Preservation**: No private data exposed on-chain

### Contract Interaction Flow

1. **Player Action**: CLI generates proof for game action
2. **Proof Submission**: Proof sent to GameCore contract
3. **Verification**: ProofVerifier validates the proof
4. **State Update**: StateManager updates commitments
5. **Event Emission**: Game events logged for indexing

## 🔧 Troubleshooting

### Common Issues

#### Proof Generation Failures
- **Issue**: Circuit compilation errors
- **Solution**: Check circuit syntax and constraint logic
- **Debug**: Use `circom --verbose` for detailed error messages

#### VDF Computation Errors
- **Issue**: VDF computation fails or is too slow
- **Solution**: Ensure GMP library is properly installed
- **Debug**: Check system resources and VDF calibration

#### State Synchronization Issues
- **Issue**: Local state doesn't match on-chain state
- **Solution**: Verify contract addresses and network connection
- **Debug**: Check commitment hashes and transaction logs

#### Gas Estimation Problems
- **Issue**: Transactions fail due to gas estimation
- **Solution**: Increase gas limit or optimize circuit constraints
- **Debug**: Use Hardhat's gas reporting features

### Getting Help

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review circuit and contract documentation
3. Join our community Discord
4. Read the troubleshooting guide

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Circom** - Circuit compilation framework
- **snarkjs** - Zero-knowledge proof generation and verification
- **Hardhat** - Ethereum development environment
- **Rust** - VDF implementation language
- **Poseidon** - Hash function for state commitments

## 🚧 Roadmap

### Phase 1: Foundation ✅
- [x] VDF implementation in Rust
- [x] Basic circuit utilities
- [x] Movement circuit
- [x] Smart contract deployment
- [x] Minimal CLI

### Phase 2: Core Mechanics (In Progress)
- [ ] Time reward circuit
- [ ] Resource gathering circuit
- [ ] Inventory trade circuit
- [ ] Extended CLI commands
- [ ] Integration tests

### Phase 3: Advanced Features (Planned)
- [ ] Store purchase and management circuits
- [ ] Time-locked crafting with VDF
- [ ] Time-locked travel
- [ ] Complete store economy
- [ ] Comprehensive testing

### Phase 4: Optimization and Polish (Planned)
- [ ] Circuit optimization
- [ ] Batch proof verification
- [ ] VDF checkpoint system
- [ ] Enhanced CLI UX
- [ ] Security audit

---

**Welcome to ZKGame - where privacy meets gameplay!** 🎮🔐