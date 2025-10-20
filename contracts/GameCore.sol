// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProofVerifier.sol";
import "./StateManager.sol";

/**
 * @title GameCore
 * @dev Main game logic contract coordinating all actions
 * @notice This contract handles all game actions and coordinates with other contracts
 */
contract GameCore {
    ProofVerifier public immutable proofVerifier;
    StateManager public immutable stateManager;
    
    // Events
    event PlayerMoved(address indexed player, bytes32 newCommitment);
    event RewardClaimed(address indexed player, uint256 amount);
    event ItemCrafted(address indexed player, uint256 itemId);
    event StorePurchased(address indexed player, uint256 storeId);
    event TradeExecuted(address indexed player, address indexed store, uint256 itemType, uint256 quantity);
    event ResourcesGathered(address indexed player, uint256 locationId, uint256 resourceType);
    event StoreManaged(uint256 indexed store, uint8 actionType);
    
    // Game constants
    uint256 public constant MOVEMENT_XP = 10;
    uint256 public constant BASE_REWARD_RATE = 100; // per hour
    uint256 public constant MAX_CLAIM_INTERVAL = 24 hours;
    
    constructor(address _proofVerifier, address _stateManager) {
        proofVerifier = ProofVerifier(_proofVerifier);
        stateManager = StateManager(_stateManager);
    }
    
    /**
     * @dev Move player to new position
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function move(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyMovementProof(a, b, c, publicSignals),
            "Invalid movement proof"
        );
        
        bytes32 oldCommitment = bytes32(publicSignals[0]);
        bytes32 newCommitment = bytes32(publicSignals[1]);
        uint256 timestamp = publicSignals[2];
        
        // Verify old commitment matches current state
        require(
            stateManager.getPlayerCommitment(msg.sender) == oldCommitment,
            "State commitment mismatch"
        );
        
        // Update player state commitment
        stateManager.updatePlayerCommitment(msg.sender, newCommitment);
        
        emit PlayerMoved(msg.sender, newCommitment);
    }
    
    /**
     * @dev Claim time-based rewards
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function claimReward(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyTimeRewardProof(a, b, c, publicSignals),
            "Invalid reward proof"
        );
        
        bytes32 oldCommitment = bytes32(publicSignals[0]);
        bytes32 newCommitment = bytes32(publicSignals[1]);
        uint256 currentTime = publicSignals[2];
        uint256 rewardAmount = publicSignals[3];
        
        // Verify old commitment matches current state
        require(
            stateManager.getPlayerCommitment(msg.sender) == oldCommitment,
            "State commitment mismatch"
        );
        
        // Mint currency to player
        stateManager.mintCurrency(msg.sender, rewardAmount);
        
        // Update player state commitment
        stateManager.updatePlayerCommitment(msg.sender, newCommitment);
        
        emit RewardClaimed(msg.sender, rewardAmount);
    }
    
    /**
     * @dev Craft item with time-locked proof
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function craftItem(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyTimeCraftProof(a, b, c, publicSignals),
            "Invalid craft proof"
        );
        
        bytes32 oldCommitment = bytes32(publicSignals[0]);
        bytes32 newCommitment = bytes32(publicSignals[1]);
        uint256 currentTime = publicSignals[2];
        uint256 requiredIterations = publicSignals[3];
        uint256 itemId = publicSignals[4];
        
        // Verify old commitment matches current state
        require(
            stateManager.getPlayerCommitment(msg.sender) == oldCommitment,
            "State commitment mismatch"
        );
        
        // Update player state commitment
        stateManager.updatePlayerCommitment(msg.sender, newCommitment);
        
        emit ItemCrafted(msg.sender, itemId);
    }
    
    /**
     * @dev Purchase a store at current location
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function purchaseStore(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyStorePurchaseProof(a, b, c, publicSignals),
            "Invalid store purchase proof"
        );
        
        bytes32 oldCommitment = bytes32(publicSignals[0]);
        bytes32 newCommitment = bytes32(publicSignals[1]);
        uint256 storeId = publicSignals[2];
        uint256 storePrice = publicSignals[3];
        
        // Verify old commitment matches current state
        require(
            stateManager.getPlayerCommitment(msg.sender) == oldCommitment,
            "State commitment mismatch"
        );
        
        // Burn currency for purchase
        stateManager.burnCurrency(msg.sender, storePrice);
        
        // Create store state
        stateManager.createStore(storeId, msg.sender);
        
        // Update player state commitment
        stateManager.updatePlayerCommitment(msg.sender, newCommitment);
        
        emit StorePurchased(msg.sender, storeId);
    }
    
    /**
     * @dev Trade with a store
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function tradeWithStore(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyInventoryTradeProof(a, b, c, publicSignals),
            "Invalid trade proof"
        );
        
        bytes32 oldPlayerCommitment = bytes32(publicSignals[0]);
        bytes32 newPlayerCommitment = bytes32(publicSignals[1]);
        bytes32 oldStoreCommitment = bytes32(publicSignals[2]);
        bytes32 newStoreCommitment = bytes32(publicSignals[3]);
        uint8 tradeType = uint8(publicSignals[4]);
        
        // Verify commitments match current states
        require(
            stateManager.getPlayerCommitment(msg.sender) == oldPlayerCommitment,
            "Player state commitment mismatch"
        );
        
        // Update both player and store state commitments atomically
        stateManager.updatePlayerCommitment(msg.sender, newPlayerCommitment);
        stateManager.updateStoreCommitment(0, newStoreCommitment); // Store ID would be extracted from proof
        
        emit TradeExecuted(msg.sender, address(0), 0, 0); // Parameters would be extracted from proof
    }
    
    /**
     * @dev Manage store operations
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function manageStore(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyStoreManageProof(a, b, c, publicSignals),
            "Invalid store management proof"
        );
        
        bytes32 oldStoreCommitment = bytes32(publicSignals[0]);
        bytes32 newStoreCommitment = bytes32(publicSignals[1]);
        uint256 playerId = publicSignals[2];
        
        // Verify store ownership
        require(
            stateManager.getStoreOwner(0) == msg.sender, // Store ID would be extracted from proof
            "Not store owner"
        );
        
        // Update store state commitment
        stateManager.updateStoreCommitment(0, newStoreCommitment);
        
        emit StoreManaged(0, 0); // Parameters would be extracted from proof
    }
    
    /**
     * @dev Gather resources from current location
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function gatherResources(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyResourceGatherProof(a, b, c, publicSignals),
            "Invalid resource gathering proof"
        );
        
        bytes32 oldPlayerCommitment = bytes32(publicSignals[0]);
        bytes32 newPlayerCommitment = bytes32(publicSignals[1]);
        bytes32 oldLocationCommitment = bytes32(publicSignals[2]);
        bytes32 newLocationCommitment = bytes32(publicSignals[3]);
        
        // Verify commitments match current states
        require(
            stateManager.getPlayerCommitment(msg.sender) == oldPlayerCommitment,
            "Player state commitment mismatch"
        );
        
        // Update both player and location state commitments
        stateManager.updatePlayerCommitment(msg.sender, newPlayerCommitment);
        stateManager.updateLocationCommitment(0, newLocationCommitment); // Location ID would be extracted from proof
        
        emit ResourcesGathered(msg.sender, 0, 0); // Parameters would be extracted from proof
    }
    
    /**
     * @dev Travel to distant location with time-lock proof
     * @param a First part of the proof
     * @param b Second part of the proof
     * @param c Third part of the proof
     * @param publicSignals The public signals for the proof
     */
    function travelToLocation(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[6] memory publicSignals
    ) external {
        require(
            proofVerifier.verifyTimeTravelProof(a, b, c, publicSignals),
            "Invalid travel proof"
        );
        
        bytes32 oldCommitment = bytes32(publicSignals[0]);
        bytes32 newCommitment = bytes32(publicSignals[1]);
        uint256 travelDistance = publicSignals[2];
        uint256 arrivalTime = publicSignals[3];
        uint256 requiredIterations = publicSignals[4];
        uint256 travelCost = publicSignals[5];
        
        // Verify old commitment matches current state
        require(
            stateManager.getPlayerCommitment(msg.sender) == oldCommitment,
            "State commitment mismatch"
        );
        
        // Burn travel costs
        stateManager.burnCurrency(msg.sender, travelCost);
        
        // Update player state commitment
        stateManager.updatePlayerCommitment(msg.sender, newCommitment);
        
        emit PlayerMoved(msg.sender, newCommitment);
    }
}
