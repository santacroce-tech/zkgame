// Circuit 2: Time Reward Claim
// Proves eligibility for time-based passive income without revealing full player history

include "../utils/poseidon.circom";

template TimeRewardProof() {
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
    
    // Public inputs
    signal input oldStateCommitment;
    signal input newStateCommitment;
    signal input currentTime;
    signal input rewardAmount;
    
    // Output
    signal output out;
    
    // Constants
    var MIN_CLAIM_INTERVAL = 3600; // 1 hour in seconds
    var BASE_REWARD_RATE = 100; // Base reward per hour
    var MAX_CLAIM_INTERVAL = 86400; // 24 hours in seconds
    var INVENTORY_SIZE = 64;
    var STORES_SIZE = 10;
    var EXPLORED_SIZE = 1000;
    
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
    
    // Check minimum time interval has passed since last claim
    var timeElapsed = currentTime - lastClaimTime;
    timeElapsed >= MIN_CLAIM_INTERVAL;
    
    // Calculate reward based on time elapsed
    var hoursElapsed = timeElapsed / 3600;
    var baseReward = hoursElapsed * BASE_REWARD_RATE;
    
    // Apply reputation multiplier (simplified - in production use proper fixed-point arithmetic)
    var reputationMultiplier = reputation * 1000; // Scale up for integer arithmetic
    var adjustedReward = (baseReward * reputationMultiplier) / 1000;
    
    // Verify calculated reward matches claimed amount
    adjustedReward === rewardAmount;
    
    // Verify reward doesn't exceed maximum per claim
    var maxReward = MAX_CLAIM_INTERVAL / 3600 * BASE_REWARD_RATE;
    rewardAmount <= maxReward;
    
    // Update currency
    var updatedCurrency = currency + rewardAmount;
    
    // Update last claim time
    var updatedLastClaimTime = currentTime;
    
    // Increment nonce for replay protection
    var updatedNonce = nonce + 1;
    
    // Compute new state commitment
    component newStateHasher = Poseidon(12);
    newStateHasher.in[0] <== playerId;
    newStateHasher.in[1] <== positionX;
    newStateHasher.in[2] <== positionY;
    newStateHasher.in[3] <== updatedCurrency;
    newStateHasher.in[4] <== updatedLastClaimTime;
    newStateHasher.in[5] <== reputation;
    newStateHasher.in[6] <== experience;
    newStateHasher.in[7] <== updatedNonce;
    newStateHasher.in[8] <== inventoryHash;
    newStateHasher.in[9] <== storesHash;
    newStateHasher.in[10] <== exploredHash;
    newStateHasher.in[11] <== currentTime;
    
    // Verify new state commitment matches
    newStateHasher.out === newStateCommitment;
    
    out <== newStateHasher.out;
}

component main = TimeRewardProof();
