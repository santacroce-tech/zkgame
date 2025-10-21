# ZKGame Proof Integration Flow Documentation

## Overview

This document provides a comprehensive step-by-step explanation of the proof generation and data flow for user movement in the ZKGame project. The system uses zero-knowledge proofs to enable private, verifiable game actions while maintaining the integrity of the game state.

## Architecture Overview

The ZKGame system consists of several key components:

1. **Frontend (React/Next.js)** - User interface and game state management
2. **Backend (Node.js/Express)** - Proof verification and game logic
3. **Smart Contracts (Solidity)** - On-chain state management and proof verification
4. **Zero-Knowledge Circuits (Circom)** - Proof generation and verification logic
5. **Proof Generation Service** - Client-side proof computation

## Generated Proofs

The system generates three main types of proofs:

### 1. Movement Proof (`movement.circom`)
- **Purpose**: Proves valid player movement through fog of war without revealing full position history
- **Inputs**: Player state, old position, new position, inventory, explored cells
- **Outputs**: Old state commitment, new state commitment, timestamp
- **Constraints**: Manhattan distance ≤ 1 or movement to previously explored area

### 2. Time Reward Proof (`timeReward.circom`)
- **Purpose**: Proves eligibility for time-based passive income without revealing full player history
- **Inputs**: Player state, time elapsed since last claim
- **Outputs**: Old state commitment, new state commitment, current time, reward amount
- **Constraints**: Minimum 1-hour interval between claims

### 3. Time Craft Proof (`timeCraft.circom`)
- **Purpose**: Proves player completed time-intensive crafting with computational proof of time passage
- **Inputs**: Player state, recipe requirements, VDF proof, materials
- **Outputs**: Old state commitment, new state commitment, crafted item
- **Constraints**: VDF verification, material availability, time requirements

## User Movement Flow - Step by Step

### Phase 1: User Interaction

1. **User Input**
   - User clicks on a map cell or uses keyboard controls (WASD/Arrow keys)
   - `GameMap.tsx` component handles the input and validates movement rules
   - Movement is only allowed to adjacent cells (Manhattan distance = 1) or previously explored areas

2. **Movement Validation**
   ```typescript
   const distance = Math.abs(x - player.position.x) + Math.abs(y - player.position.y)
   if (distance <= 1 || player.exploredCells.some(cell => cell.x === x && cell.y === y)) {
     // Valid movement
   }
   ```

### Phase 2: Proof Generation (ZK Mode)

When "ZK Magic Mode" is enabled and contracts are initialized:

3. **Proof Input Preparation**
   - `gameStore.ts` calls `movePlayerWithProof()`
   - Player state is collected from the game store
   - Proof inputs are prepared according to `MovementProofInputs` interface

4. **Circuit Input Preparation**
   ```typescript
   const proofInputs: MovementProofInputs = {
     playerId: player.playerId,
     oldX: player.position.x,
     oldY: player.position.y,
     newX: x,
     newY: y,
     inventory: Object.values(player.inventory),
     currency: player.currency,
     lastClaimTime: player.lastClaimTime,
     ownedStores: player.ownedStores,
     reputation: player.reputation,
     experience: player.experience,
     nonce: player.nonce,
     exploredCells: player.exploredCells.map(cell => cell.x * 1000 + cell.y),
     timestamp: Date.now()
   }
   ```

5. **Proof Generation**
   - `proofService.ts` calls `generateMovementProof()`
   - Uses snarkjs with Groth16 proving system
   - Loads circuit files: `movement.wasm` and `movement_final.zkey`
   - Generates proof using `groth16.fullProve()`

6. **Circuit Processing**
   - The `movement.circom` circuit processes the inputs
   - Verifies old state commitment using Poseidon hash
   - Enforces movement constraints (distance ≤ 1 or explored area)
   - Updates player state (position, experience, nonce, explored cells)
   - Computes new state commitment
   - Outputs public signals: `[oldCommitment, newCommitment, timestamp]`

### Phase 3: Contract Submission

7. **Proof Formatting**
   - `contractService.ts` formats the proof for smart contract submission
   - Converts proof components to BigInt format
   - Structures proof as `{a: [2], b: [2][2], c: [2]}`

8. **Smart Contract Interaction**
   - Calls `GameCore.move()` function with proof and public signals
   - Contract verifies proof using `ProofVerifier.verifyMovementProof()`
   - Verifies old state commitment matches current state
   - Updates player state commitment in `StateManager`

### Phase 4: State Update

9. **Local State Update**
   - Player state is updated in the game store
   - New position, experience (+10), nonce (+1), explored cells are updated
   - State is persisted to localStorage

10. **UI Update**
    - `GameMap.tsx` re-renders with new player position
    - Explored cells are visually updated
    - Movement controls are re-enabled

## Data Flow Diagram

```
User Input → GameMap → GameStore → ProofService → Circuit → Contract → StateManager
     ↓           ↓         ↓           ↓          ↓         ↓          ↓
  Click/Key → Validation → State → Proof Gen → ZK Proof → Verify → Update
     ↓           ↓         ↓           ↓          ↓         ↓          ↓
  Movement → Distance → Prepare → snarkjs → Groth16 → On-chain → Persist
```

## Component Interactions

### Frontend Components

1. **GameMap.tsx**
   - Renders 21x21 grid map
   - Handles user input (click/keyboard)
   - Manages movement validation
   - Shows proof generation progress

2. **GameContext.tsx**
   - Provides game state to components
   - Manages loading states and errors
   - Coordinates between UI and game store

3. **gameStore.ts (Zustand)**
   - Central state management
   - Handles both regular and proof-based movement
   - Manages proof generation status
   - Persists state to localStorage

### Services

1. **proofService.ts**
   - Generates zero-knowledge proofs
   - Handles circuit input preparation
   - Manages proof verification
   - Uses snarkjs for proof generation

2. **contractService.ts**
   - Manages smart contract interactions
   - Formats proofs for contract submission
   - Handles transaction submission and confirmation
   - Loads contract ABIs

### Backend

1. **server.js**
   - Express server with Socket.io for real-time communication
   - Proof verification endpoint (`/api/game/move`)
   - Contract integration
   - Player state management

### Smart Contracts

1. **GameCore.sol**
   - Main game logic contract
   - Handles all game actions (move, craft, claim, etc.)
   - Coordinates with other contracts
   - Emits events for game actions

2. **ProofVerifier.sol**
   - Verifies zero-knowledge proofs
   - Routes to appropriate verifier contracts
   - Handles different proof types

3. **StateManager.sol**
   - Manages player state commitments
   - Tracks player registrations
   - Handles state updates

## Proof Structure

### Movement Proof Example
```json
{
  "circuit": "movement",
  "from_position": {"x": 1, "y": 0},
  "to_position": {"x": 1, "y": 0},
  "player_id": 1760980622,
  "public_signals": [
    "0000000000000000000000000000000000000000000000000000000068f66e8e",
    "0000000000000000000000000000000000000000000000000000000068f66e8f",
    1760980634
  ],
  "timestamp": 1760980634
}
```

### Proof Components
- **pi_a**: First part of the proof (3 elements)
- **pi_b**: Second part of the proof (3x2 matrix)
- **pi_c**: Third part of the proof (3 elements)
- **publicSignals**: Public inputs/outputs visible to verifiers

## Security Considerations

1. **State Commitment Integrity**
   - Each player state is hashed using Poseidon hash function
   - State transitions are verified through commitment updates
   - Replay attacks prevented by nonce increments

2. **Movement Constraints**
   - Manhattan distance constraint prevents teleportation
   - Explored area verification allows strategic movement
   - Timestamp ensures proof freshness

3. **Proof Verification**
   - All proofs are verified on-chain before state updates
   - Public signals are validated against expected values
   - Circuit constraints ensure valid game logic

## Performance Considerations

1. **Proof Generation Time**
   - Movement proofs typically take 2-5 seconds to generate
   - Progress is shown to user during generation
   - Proofs are cached for potential reuse

2. **Gas Costs**
   - Contract interactions require gas fees
   - Proof verification has significant gas costs
   - Batch operations can reduce costs

3. **Client-Side Resources**
   - Circuit files (WASM, ZKey) are loaded from CDN
   - Proof generation is CPU intensive
   - Memory usage increases during proof generation

## Error Handling

1. **Proof Generation Failures**
   - Invalid inputs are caught and reported
   - Circuit compilation errors are handled gracefully
   - User is notified of proof generation issues

2. **Contract Interaction Failures**
   - Transaction failures are caught and reported
   - Gas estimation failures fall back to default limits
   - Network issues are handled with retries

3. **State Synchronization**
   - Local state is always updated after successful proof verification
   - Failed operations don't corrupt local state
   - State can be recovered from contract if needed

## Future Enhancements

1. **Optimized Circuits**
   - Reduce proof generation time
   - Minimize circuit constraints
   - Improve gas efficiency

2. **Batch Operations**
   - Combine multiple actions in single proof
   - Reduce transaction costs
   - Improve user experience

3. **Advanced Privacy**
   - Hide more game state information
   - Implement private auctions
   - Add anonymous trading

## Conclusion

The ZKGame proof integration provides a robust foundation for private, verifiable game actions. The system successfully balances privacy, security, and usability while maintaining the integrity of the game state. The modular architecture allows for easy extension and improvement of the proof system as the game evolves.

The movement flow demonstrates the complete integration of zero-knowledge proofs in a gaming context, from user interaction through proof generation to on-chain verification and state updates. This creates a new paradigm for blockchain gaming where players can maintain privacy while proving the validity of their actions.
