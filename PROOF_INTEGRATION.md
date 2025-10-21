# ZKGame Proof Integration

This document describes the zero-knowledge proof integration for the ZKGame frontend.

## Features Added

### 1. Proof Generation Service (`proofService.ts`)
- Generates movement proofs using snarkjs and groth16
- Handles circuit input preparation and state commitment computation
- Supports proof verification

### 2. Contract Service (`contractService.ts`)
- Manages wallet connections and smart contract interactions
- Submits proofs to the GameCore contract
- Handles transaction confirmation and error management

### 3. Enhanced Game Store
- Added `movePlayerWithProof()` method for proof-based movement
- Integrated proof generation status tracking
- Added contract service initialization

### 4. Updated UI Components
- **GameMap**: Added proof mode toggle and status indicators
- **Movement Controls**: Show proof generation progress
- **Header**: Display ZK system status

### 5. Backend Proof Verification
- Added snarkjs integration for proof verification
- Enhanced `/api/game/move` endpoint to verify proofs
- Loads verification keys on startup

## How It Works

### Movement with Proofs

1. **User clicks movement button** → GameMap component
2. **Check proof mode** → If enabled and contract initialized
3. **Generate proof** → proofService.generateMovementProof()
4. **Submit to contract** → contractService.submitMovementProof()
5. **Update player state** → Local state and localStorage

### Proof Generation Process

1. **Prepare inputs** → Convert player state to circuit inputs
2. **Load circuit files** → WASM and zkey files from public directory
3. **Generate proof** → Using snarkjs.groth16.fullProve()
4. **Format for contract** → Convert to contract-compatible format

### Contract Interaction

1. **Initialize service** → When wallet connects
2. **Load contract ABI** → From public/contracts directory
3. **Submit transaction** → With proof and public signals
4. **Wait for confirmation** → Handle success/error states

## File Structure

```
frontend/
├── app/
│   ├── services/
│   │   ├── proofService.ts      # Proof generation and verification
│   │   └── contractService.ts   # Smart contract interactions
│   ├── stores/
│   │   └── gameStore.ts         # Enhanced with proof methods
│   ├── contexts/
│   │   └── GameContext.tsx      # Updated interface
│   └── components/
│       └── GameMap.tsx          # Proof mode UI
├── public/
│   ├── circuits/
│   │   ├── movement.wasm        # Compiled circuit
│   │   ├── movement_final.zkey  # Proving key
│   │   └── movement_verification_key.json
│   └── contracts/
│       └── GameCore.json        # Contract ABI
```

## Configuration

### Contract Addresses
```typescript
const config = {
  gameCoreAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  stateManagerAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  proofVerifierAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
}
```

### Circuit Files
- **WASM**: `/circuits/movement.wasm`
- **Proving Key**: `/circuits/movement_final.zkey`
- **Verification Key**: `/circuits/movement_verification_key.json`

## Usage

### Enable Proof Mode
1. Connect wallet
2. Wait for "ZK Ready" status
3. Toggle "Proof Mode" checkbox in movement controls
4. Click movement buttons to generate and submit proofs

### Monitor Progress
- **Blue progress bar** shows proof generation progress
- **Status text** indicates current step
- **Button states** disable during proof generation

## Error Handling

- **Proof generation failures** → Show error message
- **Contract submission failures** → Retry or fallback to local movement
- **Network issues** → Graceful degradation
- **Invalid proofs** → Reject with clear error message

## Development Notes

### Circuit Requirements
- Movement circuit must be compiled and available
- Proving and verification keys must be generated
- Circuit inputs must match the expected format

### Performance Considerations
- Proof generation can take 10-30 seconds
- Consider caching proofs for repeated moves
- Implement proper loading states

### Security Notes
- Proofs are generated client-side
- Private inputs never leave the browser
- Only public signals and proofs are submitted to contracts

## Testing

1. **Start backend**: `npm run dev` in backend directory
2. **Start frontend**: `npm run dev` in frontend directory
3. **Connect wallet** and initialize player
4. **Toggle proof mode** and test movement
5. **Check console** for proof generation logs
6. **Verify backend** receives and validates proofs
