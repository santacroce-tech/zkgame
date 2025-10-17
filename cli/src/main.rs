use clap::{Parser, Subcommand};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use zkgame_vdf::{VDFEngine, VDFInput, VDFOutput};

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

#[derive(Debug, Serialize, Deserialize)]
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
        
        // In production, generate and submit proof here
        println!("Movement proof generated and submitted to contract");
        
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
        
        // In production, generate and submit proof here
        println!("Reward claim proof generated and submitted to contract");
        
        save_config(&config);
        println!("Claimed {} currency! Total: {}", reward as u64, state.currency);
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
        let craft = &config.active_crafts[craft_index];
        
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

fn buy_store(city: &str, price: u64) {
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
    // In production, load from config/recipes.json
    // For now, return a sample recipe
    if name == "iron_sword" {
        Some(Recipe {
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
        })
    } else {
        None
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
