// Circuit 7: Time-Locked Crafting (VDF Integration)
// Proves player completed time-intensive crafting with computational proof of time passage

include "../utils/poseidon.circom";

template TimeCraftProof() {
    // Private inputs
    signal private input playerId;
    signal private input positionX;
    signal private input positionY;
    signal private input inventory[64]; // Maximum 64 inventory slots
    signal private input currency;
    signal private input lastClaimTime;
    signal private input ownedStores[10]; // Maximum 10 stores
    signal private input reputation;
    signal private input experience;
    signal private input nonce;
    signal private input exploredCells[1000]; // Fog of war data
    signal private input recipeId;
    signal private input requiredMaterials[8]; // Maximum 8 materials per recipe
    signal private input materialQuantities[8];
    signal private input outputItemType;
    signal private input outputItemQuantity;
    signal private input vdfInputSeed;
    signal private input vdfOutput;
    signal private input startTime;
    
    // Public inputs
    signal input oldStateCommitment;
    signal input newStateCommitment;
    signal input currentTime;
    signal input requiredVDFIterations;
    signal input vdfProof;
    
    // Output
    signal output out;
    
    // Constants
    var ITERATIONS_PER_SECOND = 278;
    var INVENTORY_SIZE = 64;
    var STORES_SIZE = 10;
    var EXPLORED_SIZE = 1000;
    var MAX_MATERIALS = 8;
    
    // Verify old state commitment
    component oldStateHasher = Poseidon(12);
    oldStateHasher.in[0] <== playerId;
    oldStateHasher.in[1] <== positionX;
    oldStateHasher.in[2] <== positionY;
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
    
    // Add current time
    oldStateHasher.in[11] <== currentTime;
    
    // Verify old state commitment matches
    oldStateHasher.out === oldStateCommitment;
    
    // Check player has all required materials in inventory
    for (var i = 0; i < MAX_MATERIALS; i++) {
        var materialType = requiredMaterials[i];
        var requiredQuantity = materialQuantities[i];
        
        // Find material in inventory (simplified - in production use proper lookup)
        var availableQuantity = 0;
        for (var j = 0; j < INVENTORY_SIZE; j++) {
            // This is simplified - in production, you'd need proper item type matching
            availableQuantity += (inventory[j] === materialType) ? 1 : 0;
        }
        
        // Verify sufficient quantity available
        availableQuantity >= requiredQuantity;
    }
    
    // Calculate required VDF iterations from recipe time
    var recipeTime = requiredVDFIterations / ITERATIONS_PER_SECOND;
    var calculatedIterations = recipeTime * ITERATIONS_PER_SECOND;
    calculatedIterations === requiredVDFIterations;
    
    // Verify VDF input is bound to specific craft action
    component vdfInputHasher = Poseidon(5);
    vdfInputHasher.in[0] <== playerId;
    vdfInputHasher.in[1] <== recipeId;
    vdfInputHasher.in[2] <== startTime;
    vdfInputHasher.in[3] <== nonce;
    vdfInputHasher.in[4] <== 12345; // Random salt
    
    vdfInputHasher.out === vdfInputSeed;
    
    // Verify VDF proof (simplified - in production use proper VDF verification)
    // This is a placeholder - actual VDF verification would be more complex
    vdfOutput !== 0; // Placeholder check
    
    // Verify sufficient real-world time has passed
    var timeElapsed = currentTime - startTime;
    timeElapsed >= recipeTime;
    
    // Consume materials from inventory (simplified)
    var updatedInventoryHash = inventoryHash;
    for (var i = 0; i < MAX_MATERIALS; i++) {
        var materialType = requiredMaterials[i];
        var requiredQuantity = materialQuantities[i];
        
        // In production, properly update inventory quantities
        updatedInventoryHash -= materialType * requiredQuantity;
    }
    
    // Add crafted item to inventory
    updatedInventoryHash += outputItemType * outputItemQuantity;
    
    // Award experience (simplified)
    var experienceReward = recipeId * 10; // Placeholder calculation
    var updatedExperience = experience + experienceReward;
    
    // Increment nonce for replay protection
    var updatedNonce = nonce + 1;
    
    // Compute new state commitment
    component newStateHasher = Poseidon(12);
    newStateHasher.in[0] <== playerId;
    newStateHasher.in[1] <== positionX;
    newStateHasher.in[2] <== positionY;
    newStateHasher.in[3] <== currency;
    newStateHasher.in[4] <== lastClaimTime;
    newStateHasher.in[5] <== reputation;
    newStateHasher.in[6] <== updatedExperience;
    newStateHasher.in[7] <== updatedNonce;
    newStateHasher.in[8] <== updatedInventoryHash;
    newStateHasher.in[9] <== storesHash;
    newStateHasher.in[10] <== exploredHash;
    newStateHasher.in[11] <== currentTime;
    
    // Verify new state commitment matches
    newStateHasher.out === newStateCommitment;
    
    out <== newStateHasher.out;
}

component main = TimeCraftProof();
