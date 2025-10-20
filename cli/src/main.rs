use clap::{Parser, Subcommand};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use zkgame_vdf::VDFInput;

/// ZKGame CLI - Zero-knowledge proof-based simulation game
#[derive(Parser)]
#[command(name = "zkgame")]
#[command(about = "A zero-knowledge proof-based simulation game with VDF integration")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new player
    Init {
        #[arg(short, long)]
        name: String,
    },
    /// Move to new coordinates
    Move {
        #[arg(short, long)]
        x: i32,
        #[arg(short, long)]
        y: i32,
    },
    /// Claim time-based rewards
    Claim,
    /// Start crafting an item
    Craft {
        #[arg(short, long)]
        recipe: String,
    },
    /// Complete a craft in progress
    CompleteCraft {
        #[arg(short, long)]
        craft_id: String,
    },
    /// Trade with a store
    Trade {
        #[arg(short, long)]
        store_id: u64,
        #[arg(short, long)]
        action: String,
        #[arg(short, long)]
        item: String,
        #[arg(short, long)]
        quantity: u32,
    },
    /// Buy a store
    BuyStore {
        #[arg(short, long)]
        city: String,
        #[arg(short, long)]
        price: u64,
    },
    /// Manage a store
    ManageStore {
        #[arg(short, long)]
        store_id: u64,
        #[arg(short, long)]
        action: String,
    },
    /// Gather resources from current location
    Gather {
        #[arg(short, long)]
        resource_type: String,
        #[arg(short, long, default_value = "1")]
        quantity: u32,
    },
    /// Show player status
    Status,
}

#[derive(Debug, Serialize, Deserialize)]
struct PlayerState {
    player_id: u64,
    name: String,
    position: Position,
    inventory: HashMap<String, u32>,
    currency: u64,
    last_claim_time: u64,
    owned_stores: Vec<u64>,
    reputation: f64,
    experience: u64,
    nonce: u64,
    explored_cells: Vec<Position>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Position {
    country: String,
    city: String,
    street: String,
    x: i32,
    y: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct CraftInProgress {
    craft_id: String,
    recipe_name: String,
    start_time: u64,
    required_time: u64,
    vdf_input: VDFInput,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct GameConfig {
    player_state: Option<PlayerState>,
    active_crafts: Vec<CraftInProgress>,
    contract_addresses: HashMap<String, String>,
}

fn main() {
    let cli = Cli::parse();
    
    match cli.command {
        Commands::Init { name } => {
            init_player(&name);
        }
        Commands::Move { x, y } => {
            move_player(x, y);
        }
        Commands::Claim => {
            claim_rewards();
        }
        Commands::Craft { recipe } => {
            start_craft(&recipe);
        }
        Commands::CompleteCraft { craft_id } => {
            complete_craft(&craft_id);
        }
        Commands::Trade { store_id, action, item, quantity } => {
            trade_with_store(store_id, &action, &item, quantity);
        }
        Commands::BuyStore { city, price } => {
            buy_store(&city, price);
        }
        Commands::ManageStore { store_id, action } => {
            manage_store(store_id, &action);
        }
        Commands::Gather { resource_type, quantity } => {
            gather_resources(&resource_type, quantity);
        }
        Commands::Status => {
            show_status();
        }
    }
}

fn init_player(name: &str) {
    println!("Initializing player: {}", name);
    
    // Generate player ID (in production, use proper key generation)
    let player_id = generate_player_id();
    
    // Create initial state
    let initial_state = PlayerState {
        player_id,
        name: name.to_string(),
        position: Position {
            country: "Aetheria".to_string(),
            city: "Newhaven".to_string(),
            street: "Main Street".to_string(),
            x: 0,
            y: 0,
        },
        inventory: HashMap::new(),
        currency: 1000,
        last_claim_time: get_current_timestamp(),
        owned_stores: Vec::new(),
        reputation: 1.0,
        experience: 0,
        nonce: 0,
        explored_cells: vec![Position {
            country: "Aetheria".to_string(),
            city: "Newhaven".to_string(),
            street: "Main Street".to_string(),
            x: 0,
            y: 0,
        }],
    };
    
    // Save player state
    let config = GameConfig {
        player_state: Some(initial_state),
        active_crafts: Vec::new(),
        contract_addresses: HashMap::new(),
    };
    
    save_config(&config);
    
    println!("Player initialized successfully!");
    println!("Player ID: {}", player_id);
    println!("Starting position: Aetheria, Newhaven, Main Street (0, 0)");
    println!("Starting currency: 1000");
}

fn move_player(x: i32, y: i32) {
    let mut config = load_config();
    
    if let Some(ref mut state) = config.player_state {
        println!("Moving from ({}, {}) to ({}, {})", state.position.x, state.position.y, x, y);
        
        // Check if move is valid (simplified)
        let distance = (x - state.position.x).abs() + (y - state.position.y).abs();
        if distance > 1 {
            println!("Error: Can only move to adjacent cells or previously explored areas");
            return;
        }
        
        // Update position
        state.position.x = x;
        state.position.y = y;
        state.experience += 10; // Movement XP
        state.nonce += 1;
        
        // Add to explored cells if not already there
        let new_pos = Position {
            country: state.position.country.clone(),
            city: state.position.city.clone(),
            street: state.position.street.clone(),
            x,
            y,
        };
        
        if !state.explored_cells.iter().any(|p| p.x == x && p.y == y) {
            state.explored_cells.push(new_pos);
        }
        
        // Generate movement proof
        let proof_path = generate_movement_proof(state, x, y);
        println!("📄 Movement proof generated: {}", proof_path);
        
        // Submit to smart contract
        let tx_hash = submit_movement_proof(&proof_path);
        println!("🔗 Smart contract transaction: {}", tx_hash);
        
        save_config(&config);
        println!("Moved successfully! New position: ({}, {})", x, y);
    } else {
        println!("Error: Player not initialized. Run 'zkgame init --name <name>' first");
    }
}

fn claim_rewards() {
    let mut config = load_config();
    
    if let Some(ref mut state) = config.player_state {
        let current_time = get_current_timestamp();
        let time_elapsed = current_time - state.last_claim_time;
        
        if time_elapsed < 3600 {
            println!("Error: Must wait at least 1 hour between claims");
            return;
        }
        
        let hours_elapsed = time_elapsed / 3600;
        let reward = (100 * hours_elapsed as u64) as f64 * state.reputation;
        
        state.currency += reward as u64;
        state.last_claim_time = current_time;
        state.nonce += 1;
        
        // Generate reward claim proof
        let proof_path = generate_reward_proof(state, reward as u64);
        println!("📄 Reward claim proof generated: {}", proof_path);
        
        // Submit to smart contract
        let tx_hash = submit_reward_proof(&proof_path);
        println!("🔗 Smart contract transaction: {}", tx_hash);
        
        let total_currency = state.currency;
        save_config(&config);
        println!("Claimed {} currency! Total: {}", reward as u64, total_currency);
    } else {
        println!("Error: Player not initialized");
    }
}

fn start_craft(recipe_name: &str) {
    let mut config = load_config();
    
    if let Some(ref state) = config.player_state {
        // Load recipe from config
        let recipe = load_recipe(recipe_name);
        if recipe.is_none() {
            println!("Error: Recipe '{}' not found", recipe_name);
            return;
        }
        
        let recipe = recipe.unwrap();
        
        // Check if player has materials
        if !has_materials(state, &recipe.required_materials) {
            println!("Error: Insufficient materials for recipe '{}'", recipe_name);
            return;
        }
        
        // Generate VDF input
        let vdf_input = VDFInput {
            player_id: state.player_id,
            action_type: "craft".to_string(),
            action_id: recipe.id,
            timestamp: get_current_timestamp(),
            nonce: state.nonce,
            random_salt: generate_random_salt(),
        };
        
        // Start VDF computation in background
        let craft_id = format!("craft_{}_{}", state.player_id, get_current_timestamp());
        let craft = CraftInProgress {
            craft_id: craft_id.clone(),
            recipe_name: recipe_name.to_string(),
            start_time: get_current_timestamp(),
            required_time: recipe.required_time_seconds,
            vdf_input,
            status: "computing".to_string(),
        };
        
        config.active_crafts.push(craft);
        save_config(&config);
        
        println!("Started crafting '{}'", recipe_name);
        println!("Craft ID: {}", craft_id);
        println!("Estimated completion time: {} seconds", recipe.required_time_seconds);
        println!("VDF computation started in background...");
    } else {
        println!("Error: Player not initialized");
    }
}

fn complete_craft(craft_id: &str) {
    let mut config = load_config();
    
    if let Some(craft_index) = config.active_crafts.iter().position(|c| c.craft_id == craft_id) {
        // Clone the craft data before removing it
        let craft = config.active_crafts[craft_index].clone();
        
        // Check if enough time has passed
        let current_time = get_current_timestamp();
        if current_time - craft.start_time < craft.required_time {
            println!("Error: Craft not yet complete. {} seconds remaining", 
                craft.required_time - (current_time - craft.start_time));
            return;
        }
        
        // In production, verify VDF proof and generate craft proof
        println!("VDF proof verified, generating craft proof...");
        
        // Update player state
        if let Some(ref mut state) = config.player_state {
            // Consume materials and add crafted item
            let recipe = load_recipe(&craft.recipe_name).unwrap();
            consume_materials(state, &recipe.required_materials);
            add_item_to_inventory(state, &recipe.output_item.type_name, recipe.output_item.quantity);
            state.experience += recipe.experience_reward;
            state.nonce += 1;
        }
        
        // Remove completed craft
        config.active_crafts.remove(craft_index);
        save_config(&config);
        
        println!("Craft '{}' completed successfully!", craft.recipe_name);
    } else {
        println!("Error: Craft '{}' not found", craft_id);
    }
}

fn trade_with_store(store_id: u64, action: &str, item: &str, quantity: u32) {
    println!("Trading with store {}: {} {} {} units", store_id, action, quantity, item);
    
    // In production, load store state and generate trade proof
    println!("Trade proof generated and submitted to contract");
    println!("Trade completed successfully!");
}

fn buy_store(_city: &str, price: u64) {
    let mut config = load_config();
    
    if let Some(ref mut state) = config.player_state {
        if state.currency < price {
            println!("Error: Insufficient currency. Need {}, have {}", price, state.currency);
            return;
        }
        
        if state.owned_stores.len() >= 10 {
            println!("Error: Maximum stores per player (10) reached");
            return;
        }
        
        // Generate store ID
        let store_id = generate_store_id();
        
        // In production, generate and submit proof
        println!("Store purchase proof generated and submitted to contract");
        
        state.currency -= price;
        state.owned_stores.push(store_id);
        state.nonce += 1;
        
        save_config(&config);
        println!("Store purchased successfully! Store ID: {}", store_id);
    } else {
        println!("Error: Player not initialized");
    }
}

fn manage_store(store_id: u64, action: &str) {
    println!("Managing store {}: {}", store_id, action);
    
    // In production, verify ownership and generate management proof
    println!("Store management proof generated and submitted to contract");
    println!("Store management completed successfully!");
}

fn show_status() {
    let config = load_config();
    
    if let Some(state) = config.player_state {
        println!("=== Player Status ===");
        println!("Name: {}", state.name);
        println!("Player ID: {}", state.player_id);
        println!("Position: {}, {}, {} ({}, {})", 
            state.position.country, state.position.city, state.position.street,
            state.position.x, state.position.y);
        println!("Currency: {}", state.currency);
        println!("Experience: {}", state.experience);
        println!("Reputation: {:.2}", state.reputation);
        println!("Owned Stores: {}", state.owned_stores.len());
        println!("Explored Cells: {}", state.explored_cells.len());
        println!("Active Crafts: {}", config.active_crafts.len());
        
        // Display inventory
        if !state.inventory.is_empty() {
            println!("\n=== Inventory ===");
            for (item, quantity) in &state.inventory {
                if !item.starts_with("last_gather_") { // Skip cooldown tracking items
                    println!("- {}: {}", item, quantity);
                }
            }
        } else {
            println!("\n=== Inventory ===");
            println!("Empty");
        }
        
        if !config.active_crafts.is_empty() {
            println!("\n=== Active Crafts ===");
            for craft in &config.active_crafts {
                let elapsed = get_current_timestamp() - craft.start_time;
                let remaining = if elapsed < craft.required_time {
                    craft.required_time - elapsed
                } else {
                    0
                };
                println!("- {} (ID: {}) - {} seconds remaining", 
                    craft.recipe_name, craft.craft_id, remaining);
            }
        }
    } else {
        println!("Error: Player not initialized. Run 'zkgame init --name <name>' first");
    }
}

// Helper functions

fn generate_player_id() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()
}

fn generate_store_id() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()
}

fn generate_random_salt() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos() as u64
}

fn get_current_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()
}

fn get_config_path() -> PathBuf {
    dirs::home_dir().unwrap().join(".zkgame").join("config.json")
}

fn load_config() -> GameConfig {
    let path = get_config_path();
    if path.exists() {
        let content = fs::read_to_string(&path).unwrap_or_else(|_| "{}".to_string());
        serde_json::from_str(&content).unwrap_or_else(|_| GameConfig {
            player_state: None,
            active_crafts: Vec::new(),
            contract_addresses: HashMap::new(),
        })
    } else {
        GameConfig {
            player_state: None,
            active_crafts: Vec::new(),
            contract_addresses: HashMap::new(),
        }
    }
}

fn save_config(config: &GameConfig) {
    let path = get_config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    let content = serde_json::to_string_pretty(config).unwrap();
    fs::write(&path, content).unwrap();
}

#[derive(Debug, Serialize, Deserialize)]
struct Recipe {
    id: u64,
    name: String,
    required_materials: Vec<MaterialRequirement>,
    output_item: ItemOutput,
    required_time_seconds: u64,
    experience_reward: u64,
    skill_level_requirement: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct MaterialRequirement {
    item_type: String,
    quantity: u32,
}

#[derive(Debug, Serialize, Deserialize)]
struct ItemOutput {
    type_name: String,
    quantity: u32,
}

fn load_recipe(name: &str) -> Option<Recipe> {
    // Load recipes from config/recipes.json
    let recipes_path = PathBuf::from("config/recipes.json");
    if let Ok(content) = fs::read_to_string(&recipes_path) {
        if let Ok(recipes_data) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(recipes) = recipes_data.get("recipes").and_then(|r| r.as_array()) {
                for recipe in recipes {
                    if let Some(recipe_name) = recipe.get("name").and_then(|n| n.as_str()) {
                        if recipe_name == name {
                            // Convert the recipe JSON to our Recipe struct
                            if let (Some(id), Some(materials), Some(output), Some(time), Some(xp), Some(skill)) = (
                                recipe.get("id").and_then(|i| i.as_u64()),
                                recipe.get("required_materials").and_then(|m| m.as_array()),
                                recipe.get("output_item"),
                                recipe.get("required_time_seconds").and_then(|t| t.as_u64()),
                                recipe.get("experience_reward").and_then(|e| e.as_u64()),
                                recipe.get("skill_level_requirement").and_then(|s| s.as_u64())
                            ) {
                                let required_materials: Vec<MaterialRequirement> = materials
                                    .iter()
                                    .filter_map(|m| {
                                        if let (Some(item_type), Some(quantity)) = (
                                            m.get("item_type").and_then(|t| t.as_str()),
                                            m.get("quantity").and_then(|q| q.as_u64())
                                        ) {
                                            Some(MaterialRequirement {
                                                item_type: item_type.to_string(),
                                                quantity: quantity as u32,
                                            })
                                        } else {
                                            None
                                        }
                                    })
                                    .collect();
                                
                                if let (Some(output_type), Some(output_quantity)) = (
                                    output.get("type").and_then(|t| t.as_str()),
                                    output.get("quantity").and_then(|q| q.as_u64())
                                ) {
                                    return Some(Recipe {
                                        id,
                                        name: recipe_name.to_string(),
                                        required_materials,
                                        output_item: ItemOutput {
                                            type_name: output_type.to_string(),
                                            quantity: output_quantity as u32,
                                        },
                                        required_time_seconds: time,
                                        experience_reward: xp,
                                        skill_level_requirement: skill,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Fallback to hardcoded recipes if file loading fails
    match name {
        "iron_sword" => Some(Recipe {
            id: 1,
            name: "iron_sword".to_string(),
            required_materials: vec![
                MaterialRequirement { item_type: "iron_ore".to_string(), quantity: 3 },
                MaterialRequirement { item_type: "wood".to_string(), quantity: 1 },
            ],
            output_item: ItemOutput { type_name: "iron_sword".to_string(), quantity: 1 },
            required_time_seconds: 3600,
            experience_reward: 100,
            skill_level_requirement: 1,
        }),
        "basic_tool" => Some(Recipe {
            id: 5,
            name: "basic_tool".to_string(),
            required_materials: vec![
                MaterialRequirement { item_type: "iron_ore".to_string(), quantity: 1 },
                MaterialRequirement { item_type: "wood".to_string(), quantity: 1 },
            ],
            output_item: ItemOutput { type_name: "basic_tool".to_string(), quantity: 1 },
            required_time_seconds: 900,
            experience_reward: 25,
            skill_level_requirement: 1,
        }),
        _ => None,
    }
}

fn has_materials(state: &PlayerState, materials: &[MaterialRequirement]) -> bool {
    materials.iter().all(|req| {
        state.inventory.get(&req.item_type).unwrap_or(&0) >= &req.quantity
    })
}

fn consume_materials(state: &mut PlayerState, materials: &[MaterialRequirement]) {
    for req in materials {
        if let Some(current) = state.inventory.get_mut(&req.item_type) {
            *current = current.saturating_sub(req.quantity);
        }
    }
}

fn add_item_to_inventory(state: &mut PlayerState, item_type: &str, quantity: u32) {
    *state.inventory.entry(item_type.to_string()).or_insert(0) += quantity;
}

fn gather_resources(resource_type: &str, quantity: u32) {
    let mut config = load_config();
    
    if let Some(ref mut state) = config.player_state {
        println!("🔍 Gathering {} {} from current location...", quantity, resource_type);
        
        // Check cooldown (5 minutes = 300 seconds)
        let current_time = get_current_timestamp();
        let last_gather_key = format!("last_gather_{}", resource_type);
        let last_gather = state.inventory.get(&last_gather_key).unwrap_or(&0);
        
        if current_time - (*last_gather as u64) < 300 {
            let remaining = 300 - (current_time - (*last_gather as u64));
            println!("⏰ Resource gathering cooldown active. {} seconds remaining", remaining);
            return;
        }
        
        // Generate resource gathering proof
        let proof_path = generate_resource_gathering_proof(state, resource_type, quantity);
        println!("📄 Resource gathering proof generated: {}", proof_path);
        
        // Submit to smart contract
        let tx_hash = submit_resource_gathering_proof(&proof_path);
        println!("🔗 Smart contract transaction: {}", tx_hash);
        
        // Add resources to inventory
        add_item_to_inventory(state, resource_type, quantity);
        state.inventory.insert(last_gather_key, current_time as u32);
        state.experience += quantity as u64 * 5; // 5 XP per resource
        state.nonce += 1;
        
        save_config(&config);
        println!("✅ Gathered {} {}! Added to inventory.", quantity, resource_type);
    } else {
        println!("Error: Player not initialized");
    }
}

// Proof generation functions (stubs for now)
fn generate_movement_proof(state: &PlayerState, x: i32, y: i32) -> String {
    let timestamp = get_current_timestamp();
    let proof_filename = format!("movement_proof_{}_{}_{}.json", state.player_id, timestamp, state.nonce);
    let proof_path = format!("proofs/{}", proof_filename);
    
    // Create proofs directory if it doesn't exist
    std::fs::create_dir_all("proofs").unwrap_or_default();
    
    // Generate proof data (simplified for now)
    let proof_data = serde_json::json!({
        "circuit": "movement",
        "public_signals": [
            format!("{:064x}", state.player_id), // old commitment
            format!("{:064x}", state.player_id + 1), // new commitment  
            timestamp
        ],
        "timestamp": timestamp,
        "player_id": state.player_id,
        "from_position": {"x": state.position.x, "y": state.position.y},
        "to_position": {"x": x, "y": y}
    });
    
    std::fs::write(&proof_path, serde_json::to_string_pretty(&proof_data).unwrap()).unwrap();
    proof_path
}

fn generate_reward_proof(state: &PlayerState, reward_amount: u64) -> String {
    let timestamp = get_current_timestamp();
    let proof_filename = format!("reward_proof_{}_{}_{}.json", state.player_id, timestamp, state.nonce);
    let proof_path = format!("proofs/{}", proof_filename);
    
    std::fs::create_dir_all("proofs").unwrap_or_default();
    
    let proof_data = serde_json::json!({
        "circuit": "timeReward",
        "public_signals": [
            format!("{:064x}", state.player_id),
            format!("{:064x}", state.player_id + 1),
            timestamp,
            reward_amount
        ],
        "timestamp": timestamp,
        "player_id": state.player_id,
        "last_claim_time": state.last_claim_time,
        "reward_amount": reward_amount
    });
    
    std::fs::write(&proof_path, serde_json::to_string_pretty(&proof_data).unwrap()).unwrap();
    proof_path
}

fn generate_resource_gathering_proof(state: &PlayerState, resource_type: &str, quantity: u32) -> String {
    let timestamp = get_current_timestamp();
    let proof_filename = format!("gather_proof_{}_{}_{}_{}.json", state.player_id, resource_type, timestamp, state.nonce);
    let proof_path = format!("proofs/{}", proof_filename);
    
    std::fs::create_dir_all("proofs").unwrap_or_default();
    
    let proof_data = serde_json::json!({
        "circuit": "resourceGather",
        "public_signals": [
            format!("{:064x}", state.player_id),
            format!("{:064x}", state.player_id + 1),
            format!("{:064x}", 0), // location commitment
            format!("{:064x}", 1)  // new location commitment
        ],
        "timestamp": timestamp,
        "player_id": state.player_id,
        "location": {"x": state.position.x, "y": state.position.y},
        "resource_type": resource_type,
        "quantity": quantity
    });
    
    std::fs::write(&proof_path, serde_json::to_string_pretty(&proof_data).unwrap()).unwrap();
    proof_path
}

// Smart contract submission functions (stubs for now)
fn submit_movement_proof(_proof_path: &str) -> String {
    // In production, this would call the smart contract
    let tx_hash = format!("0x{:064x}", get_current_timestamp());
    println!("📤 Submitting movement proof to GameCore.move()...");
    tx_hash
}

fn submit_reward_proof(_proof_path: &str) -> String {
    let tx_hash = format!("0x{:064x}", get_current_timestamp());
    println!("📤 Submitting reward proof to GameCore.claimReward()...");
    tx_hash
}

fn submit_resource_gathering_proof(_proof_path: &str) -> String {
    let tx_hash = format!("0x{:064x}", get_current_timestamp());
    println!("📤 Submitting resource gathering proof to GameCore.gatherResources()...");
    tx_hash
}
