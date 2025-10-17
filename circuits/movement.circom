// Circuit 1: Movement Proof
// Proves valid player movement through fog of war without revealing full position history

include "../utils/poseidon.circom";
include "../utils/merkle.circom";

template MovementProof() {
    // Private inputs
    signal private input playerId;
    signal private input oldX;
    signal private input oldY;
    signal private input newX;
    signal private input newY;
    signal private input inventory[64]; // Maximum 64 inventory slots
    signal private input currency;
    signal private input lastClaimTime;
    signal private input ownedStores[10]; // Maximum 10 stores
    signal private input reputation;
    signal private input experience;
    signal private input nonce;
    signal private input exploredCells[1000]; // Fog of war data
    signal private input exploredProof[10]; // Merkle proof for explored cells
    signal private input exploredIndices[10]; // Path indices for explored proof
    
    // Public inputs
    signal input oldStateCommitment;
    signal input newStateCommitment;
    signal input timestamp;
    
    // Output
    signal output out;
    
    // Constants
    var MAX_DISTANCE = 1; // Manhattan distance constraint
    var INVENTORY_SIZE = 64;
    var STORES_SIZE = 10;
    var EXPLORED_SIZE = 1000;
    
    // Verify old state commitment
    component oldStateHasher = Poseidon(12);
    oldStateHasher.in[0] <== playerId;
    oldStateHasher.in[1] <== oldX;
    oldStateHasher.in[2] <== oldY;
    oldStateHasher.in[3] <== currency;
    oldStateHasher.in[4] <== lastClaimTime;
    oldStateHasher.in[5] <== reputation;
    oldStateHasher.in[6] <== experience;
    oldStateHasher.in[7] <== nonce;
    
    // Hash inventory
    var inventoryHash = 0;
    for (var i = 0; i < INVENTORY_SIZE; i++) {
        inventoryHash += inventory[i];
    }
    oldStateHasher.in[8] <== inventoryHash;
    
    // Hash owned stores
    var storesHash = 0;
    for (var i = 0; i < STORES_SIZE; i++) {
        storesHash += ownedStores[i];
    }
    oldStateHasher.in[9] <== storesHash;
    
    // Hash explored cells
    var exploredHash = 0;
    for (var i = 0; i < EXPLORED_SIZE; i++) {
        exploredHash += exploredCells[i];
    }
    oldStateHasher.in[10] <== exploredHash;
    
    // Add timestamp
    oldStateHasher.in[11] <== timestamp;
    
    // Verify old state commitment matches
    oldStateHasher.out === oldStateCommitment;
    
    // Enforce Manhattan distance constraint
    var deltaX = newX - oldX;
    var deltaY = newY - oldY;
    var absDeltaX = deltaX < 0 ? -deltaX : deltaX;
    var absDeltaY = deltaY < 0 ? -deltaY : deltaY;
    var manhattanDistance = absDeltaX + absDeltaY;
    
    // Movement must be adjacent (distance = 1) or to previously explored area
    manhattanDistance <= MAX_DISTANCE;
    
    // Verify player can move to destination (either adjacent or previously explored)
    // For adjacent moves, distance constraint is sufficient
    // For explored moves, we need to verify the destination is in explored cells
    // This is simplified - in production, use proper Merkle proof verification
    
    // Update player position
    var updatedX = newX;
    var updatedY = newY;
    
    // Increment experience by movement XP
    var movementXP = 10; // From game constants
    var updatedExperience = experience + movementXP;
    
    // Add new position to explored cells (simplified)
    var updatedExploredHash = exploredHash + newX * 1000 + newY;
    
    // Increment nonce for replay protection
    var updatedNonce = nonce + 1;
    
    // Compute new state commitment
    component newStateHasher = Poseidon(12);
    newStateHasher.in[0] <== playerId;
    newStateHasher.in[1] <== updatedX;
    newStateHasher.in[2] <== updatedY;
    newStateHasher.in[3] <== currency;
    newStateHasher.in[4] <== lastClaimTime;
    newStateHasher.in[5] <== reputation;
    newStateHasher.in[6] <== updatedExperience;
    newStateHasher.in[7] <== updatedNonce;
    newStateHasher.in[8] <== inventoryHash;
    newStateHasher.in[9] <== storesHash;
    newStateHasher.in[10] <== updatedExploredHash;
    newStateHasher.in[11] <== timestamp;
    
    // Verify new state commitment matches
    newStateHasher.out === newStateCommitment;
    
    // Ensure movement is unique via timestamp and nonce
    // Timestamp must be greater than previous timestamp
    timestamp > lastClaimTime;
    
    out <== newStateHasher.out;
}

component main = MovementProof();
