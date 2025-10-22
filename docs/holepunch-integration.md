# Game Migration Prompt: Add Holepunch P2P Backend to Circom/EVM Game

## Context
I have an existing game that uses:
- **Circom** for ZK proof circuits
- **EVM smart contracts** for state validation and proof verification
- **Blockchain** as the primary backend for state storage

I want to migrate to a hybrid architecture that uses:
- **Holepunch (Pear Runtime)** for real-time P2P gameplay and off-chain state management
- **EVM** only for critical state validation, proof verification, and NFT minting
- **Circom ZK proofs** to bridge between P2P gameplay and on-chain verification

## Requirements

### 1. Architecture Goals
- Move real-time gameplay to P2P using Holepunch's Hyperswarm and Hypercore
- Keep game state synchronized across all connected players without centralized servers
- Use EVM only for:
  - Verifying ZK proofs of game achievements/items
  - Minting NFTs when players want to certify items
  - Storing permanent, valuable game state
- Maintain game consistency and prevent cheating despite P2P architecture
- Allow players to convert in-game achievements to on-chain NFTs at any time

### 2. Technical Stack Integration
**Current Stack:**
- Circom circuits for game logic proofs
- Solidity smart contracts for verification
- [Specify your current frontend framework]
- [Specify your current web3 library: ethers.js, viem, etc.]

**Add to Stack:**
- Pear Runtime (Holepunch's P2P platform)
- Hyperswarm for peer discovery and networking
- Hypercore for distributed append-only game state log
- Hyperdrive (if needed for asset sharing)
- Bare.js runtime for cross-platform compatibility

### 3. Game State Management Strategy

#### Off-Chain (Holepunch P2P):
- Real-time player actions (movement, combat, trading, etc.)
- Temporary inventory and stats
- Session-based gameplay
- Quick synchronization between players

#### On-Chain (EVM):
- Verified achievements requiring ZK proofs
- Minted NFTs for certified items
- Permanent ownership records
- Token rewards and economy
- High-value state that needs immutability

### 4. Consistency & Anti-Cheat Mechanisms

Implement the following to maintain game consistency:

**A. Deterministic Game Logic**
- All players run identical game logic
- Use the same RNG seeds shared via Hypercore
- Validate state transitions locally before broadcasting

**B. Peer Witnessing System**
- Critical actions broadcast to all peers in session
- Peers independently validate actions against game rules
- Conflicting states trigger dispute resolution

**C. State Synchronization**
- Use Hypercore as single source of truth for game session
- Append-only log ensures chronological ordering
- Players sync from Hypercore on join/reconnect

**D. Proof-Based Validation**
- Players generate ZK proofs for claimed achievements
- Peers can request proofs for verification
- Invalid proofs result in state rollback or player ejection

**E. Checkpoint System**
- Periodically commit state hashes to EVM for anchoring
- Allows recovery from major disputes
- Optional: use state channels for session-based gameplay

### 5. Implementation Requirements

#### Phase 1: Core P2P Infrastructure
```javascript
// Example structure - adapt to your needs
class GameP2PBackend {
  // Initialize Holepunch components
  - Setup Hyperswarm for peer discovery
  - Create Hypercore for game state log
  - Implement peer connection management
  - Handle peer join/leave events
}
```

#### Phase 2: State Synchronization
```javascript
// Synchronize game state across peers
class StateSyncManager {
  - Append game actions to Hypercore
  - Listen for peer state updates
  - Validate incoming state changes
  - Handle state conflicts
  - Implement eventual consistency model
}
```

#### Phase 3: ZK Proof Integration
```javascript
// Bridge P2P gameplay to EVM via proofs
class ProofBridge {
  - Generate Circom proofs from P2P game state
  - Cache proofs locally
  - Submit proofs to EVM when player requests
  - Handle proof verification responses
  - Update P2P state after on-chain confirmation
}
```

#### Phase 4: Anti-Cheat & Validation
```javascript
// Ensure consistency and prevent cheating
class GameValidator {
  - Validate peer actions against game rules
  - Implement consensus among peers
  - Handle dispute resolution
  - Slash/ban malicious players
  - Implement rollback mechanisms
}
```

### 6. Specific Migration Tasks

**Task 1: Identify State Boundaries**
- List all game state currently stored on-chain
- Categorize which state can move to P2P (temporary, frequent updates)
- Determine what must remain on-chain (valuable, permanent)

**Task 2: Adapt Circom Circuits**
- Review existing circuits
- Determine which proofs are needed for P2P → EVM bridge
- Add circuits for proving P2P game session validity if needed
- Optimize proof generation for client-side execution

**Task 3: Refactor Smart Contracts**
- Remove unnecessary on-chain state storage
- Add endpoints for proof verification + NFT minting
- Implement checkpoint/anchor system if using state channels
- Add dispute resolution mechanisms

**Task 4: Build P2P Game Engine**
- Port real-time game logic to run on Pear Runtime
- Implement Hypercore-based state management
- Add peer communication protocols
- Build synchronization mechanisms

**Task 5: Create Proof Generation Pipeline**
- Implement client-side proof generation using existing Circom circuits
- Cache proofs for later submission
- Build UI for players to mint NFTs from achievements
- Handle proof submission to smart contracts

**Task 6: Testing & Consistency Validation**
- Test with multiple peers joining/leaving
- Simulate network partitions and recovery
- Test cheat attempts and validation
- Verify state consistency across peers
- Load test proof generation performance

### 7. Code Structure Suggestions

```
project/
├── circuits/                    # Existing Circom circuits
│   ├── game-logic.circom
│   └── achievement-proof.circom
├── contracts/                   # Refactored Solidity contracts
│   ├── GameVerifier.sol        # Proof verification
│   └── GameNFT.sol            # NFT minting
├── p2p-backend/               # NEW: Holepunch backend
│   ├── game-engine.js         # Core game logic
│   ├── state-manager.js       # Hypercore state sync
│   ├── peer-network.js        # Hyperswarm networking
│   ├── validator.js           # Anti-cheat validation
│   └── proof-bridge.js        # P2P → EVM bridge
├── frontend/                   # Existing frontend
│   └── [adapt to connect to P2P backend]
└── shared/                     # Shared game logic
    └── game-rules.js          # Deterministic rules used by all peers
```

### 8. Key Questions to Address

Before implementation, please provide:

1. **What specific game actions happen frequently** that would benefit from P2P? (e.g., movement, combat, chat)

2. **What achievements/items should be mintable as NFTs?** What proofs are needed?

3. **How many players typically play together?** (affects P2P network topology)

4. **What's your cheat prevention strategy?** How punitive should it be?

5. **Do you need cross-session persistence?** Or can each game session be isolated?

6. **Which EVM chains are you targeting?** (affects gas costs for proof verification)

7. **What's your current game state structure?** (helps plan migration)

8. **Are there existing players with on-chain state?** (need migration strategy)

### 9. Expected Outcomes

After migration:
- ✅ Real-time gameplay without blockchain latency
- ✅ Significantly reduced gas costs (only for minting/verification)
- ✅ No centralized server infrastructure needed
- ✅ Players maintain true ownership of certified items
- ✅ Game remains playable even if blockchain is congested
- ✅ Scalable to more players without infrastructure costs
- ✅ Privacy-preserving gameplay with ZK proofs for achievements

### 10. Migration Approach

Please implement this migration as follows:

**Option A: Incremental Migration**
1. Keep existing EVM backend fully functional
2. Add P2P layer alongside it
3. Gradually move features from on-chain to P2P
4. Allow hybrid mode during transition

**Option B: Parallel Development**
1. Build complete P2P version separately
2. Test thoroughly with new players
3. Create migration tool for existing players
4. Cut over when P2P version is stable

**Option C: [Your preference]**

---

## Deliverables Requested

1. **Architecture diagram** showing P2P ↔ EVM interaction
2. **Updated codebase** with Holepunch integration
3. **State synchronization protocol** specification
4. **Anti-cheat validation rules** implementation
5. **Migration guide** for existing on-chain state
6. **Testing suite** for consistency validation
7. **Documentation** for P2P game mechanics

## Additional Considerations

- **Network resilience**: Handle peers going offline mid-game
- **Reconnection logic**: Allow players to rejoin and sync state
- **Bandwidth optimization**: Minimize P2P data transfer
- **Mobile support**: Ensure Bare.js works on mobile devices
- **Browser compatibility**: Test P2P in different browsers
- **Proof generation performance**: May need Web Workers for heavy circuits

---

Please implement this migration while maintaining:
- **Game consistency** across all peers
- **Cheat prevention** through validation and proofs
- **Smooth player experience** during state synchronization
- **Backward compatibility** with existing on-chain assets (if applicable)
- **Security** of both P2P and blockchain components