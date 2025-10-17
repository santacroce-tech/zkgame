// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StateManager
 * @dev Manages all on-chain state commitments and player data
 * @notice This contract stores state commitments and manages player data
 */
contract StateManager {
    // State variables
    mapping(address => bytes32) public playerCommitments;
    mapping(address => uint256) public currencyBalances;
    mapping(uint256 => bytes32) public storeCommitments;
    mapping(uint256 => bytes32) public locationCommitments;
    mapping(uint256 => address) public storeOwners;
    
    uint256 public globalEpoch;
    uint256 public nextStoreId;
    uint256 public nextLocationId;
    
    // Resource regeneration rates
    mapping(uint256 => uint256) public resourceRegenerationRates;
    
    // Events
    event PlayerInitialized(address indexed player, bytes32 commitment);
    event PlayerCommitmentUpdated(address indexed player, bytes32 newCommitment);
    event StoreCreated(uint256 indexed storeId, address indexed owner);
    event StoreCommitmentUpdated(uint256 indexed storeId, bytes32 newCommitment);
    event LocationCommitmentUpdated(uint256 indexed locationId, bytes32 newCommitment);
    event CurrencyMinted(address indexed player, uint256 amount);
    event CurrencyBurned(address indexed player, uint256 amount);
    
    constructor() {
        globalEpoch = 1;
        nextStoreId = 1;
        nextLocationId = 1;
    }
    
    /**
     * @dev Initialize a new player
     * @param player The player's address
     * @param commitment The initial state commitment
     */
    function initializePlayer(address player, bytes32 commitment) external {
        require(playerCommitments[player] == bytes32(0), "Player already initialized");
        
        playerCommitments[player] = commitment;
        currencyBalances[player] = 1000; // Starting currency
        
        emit PlayerInitialized(player, commitment);
    }
    
    /**
     * @dev Get player's current state commitment
     * @param player The player's address
     * @return The current state commitment
     */
    function getPlayerCommitment(address player) external view returns (bytes32) {
        return playerCommitments[player];
    }
    
    /**
     * @dev Update player's state commitment
     * @param player The player's address
     * @param newCommitment The new state commitment
     */
    function updatePlayerCommitment(address player, bytes32 newCommitment) external {
        require(playerCommitments[player] != bytes32(0), "Player not initialized");
        
        playerCommitments[player] = newCommitment;
        
        emit PlayerCommitmentUpdated(player, newCommitment);
    }
    
    /**
     * @dev Get store's current state commitment
     * @param storeId The store ID
     * @return The current state commitment
     */
    function getStoreCommitment(uint256 storeId) external view returns (bytes32) {
        return storeCommitments[storeId];
    }
    
    /**
     * @dev Update store's state commitment
     * @param storeId The store ID
     * @param newCommitment The new state commitment
     */
    function updateStoreCommitment(uint256 storeId, bytes32 newCommitment) external {
        require(storeCommitments[storeId] != bytes32(0), "Store does not exist");
        
        storeCommitments[storeId] = newCommitment;
        
        emit StoreCommitmentUpdated(storeId, newCommitment);
    }
    
    /**
     * @dev Create a new store
     * @param storeId The store ID
     * @param owner The store owner's address
     */
    function createStore(uint256 storeId, address owner) external {
        require(storeCommitments[storeId] == bytes32(0), "Store already exists");
        
        storeCommitments[storeId] = keccak256(abi.encodePacked(storeId, owner, block.timestamp));
        storeOwners[storeId] = owner;
        
        emit StoreCreated(storeId, owner);
    }
    
    /**
     * @dev Get store owner
     * @param storeId The store ID
     * @return The store owner's address
     */
    function getStoreOwner(uint256 storeId) external view returns (address) {
        return storeOwners[storeId];
    }
    
    /**
     * @dev Get location's current state commitment
     * @param locationId The location ID
     * @return The current state commitment
     */
    function getLocationCommitment(uint256 locationId) external view returns (bytes32) {
        return locationCommitments[locationId];
    }
    
    /**
     * @dev Update location's state commitment
     * @param locationId The location ID
     * @param newCommitment The new state commitment
     */
    function updateLocationCommitment(uint256 locationId, bytes32 newCommitment) external {
        locationCommitments[locationId] = newCommitment;
        
        emit LocationCommitmentUpdated(locationId, newCommitment);
    }
    
    /**
     * @dev Mint currency to a player
     * @param player The player's address
     * @param amount The amount to mint
     */
    function mintCurrency(address player, uint256 amount) external {
        require(playerCommitments[player] != bytes32(0), "Player not initialized");
        
        currencyBalances[player] += amount;
        
        emit CurrencyMinted(player, amount);
    }
    
    /**
     * @dev Burn currency from a player
     * @param player The player's address
     * @param amount The amount to burn
     */
    function burnCurrency(address player, uint256 amount) external {
        require(playerCommitments[player] != bytes32(0), "Player not initialized");
        require(currencyBalances[player] >= amount, "Insufficient currency");
        
        currencyBalances[player] -= amount;
        
        emit CurrencyBurned(player, amount);
    }
    
    /**
     * @dev Get player's currency balance
     * @param player The player's address
     * @return The currency balance
     */
    function getCurrencyBalance(address player) external view returns (uint256) {
        return currencyBalances[player];
    }
    
    /**
     * @dev Set resource regeneration rate for a location
     * @param locationId The location ID
     * @param rate The regeneration rate per hour
     */
    function setResourceRegenerationRate(uint256 locationId, uint256 rate) external {
        resourceRegenerationRates[locationId] = rate;
    }
    
    /**
     * @dev Get resource regeneration rate for a location
     * @param locationId The location ID
     * @return The regeneration rate per hour
     */
    function getResourceRegenerationRate(uint256 locationId) external view returns (uint256) {
        return resourceRegenerationRates[locationId];
    }
    
    /**
     * @dev Increment global epoch
     */
    function incrementEpoch() external {
        globalEpoch++;
    }
    
    /**
     * @dev Get next store ID
     * @return The next available store ID
     */
    function getNextStoreId() external returns (uint256) {
        uint256 id = nextStoreId;
        nextStoreId++;
        return id;
    }
    
    /**
     * @dev Get next location ID
     * @return The next available location ID
     */
    function getNextLocationId() external returns (uint256) {
        uint256 id = nextLocationId;
        nextLocationId++;
        return id;
    }
}
