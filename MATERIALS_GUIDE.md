# ZKGame Materials Guide

## How to Get Materials

### 1. Resource Gathering
The primary way to obtain materials is through resource gathering:

```bash
# Gather basic materials
zkgame gather --resource-type iron_ore --quantity 5
zkgame gather --resource-type wood --quantity 3
zkgame gather --resource-type water --quantity 2
zkgame gather --resource-type herb --quantity 1
zkgame gather --resource-type crystal --quantity 1
```

### 2. Available Resource Types
Based on the recipes in `config/recipes.json`, you can gather these materials:

**Basic Materials:**
- `iron_ore` - Used for basic tools and weapons
- `wood` - Used for basic tools and weapons
- `water` - Used for potions

**Advanced Materials:**
- `steel_ingot` - Used for armor (requires smelting iron_ore)
- `leather` - Used for armor
- `herb` - Used for magic potions
- `crystal` - Used for magic potions
- `gold_ingot` - Used for jewelry (requires smelting gold_ore)
- `gem` - Used for jewelry

### 3. Resource Gathering Rules
- **Cooldown**: 5 minutes (300 seconds) between gathering the same resource type
- **Experience**: 5 XP per resource gathered
- **Location-based**: Resources are gathered from your current location
- **Proof Generation**: Each gathering action generates a ZK proof

### 4. Crafting with Materials
Once you have materials, you can craft items:

```bash
# Check your inventory
zkgame status

# Start crafting (requires materials)
zkgame craft --recipe basic_tool
zkgame craft --recipe iron_sword
zkgame craft --recipe magic_potion
```

### 5. Available Recipes
- `basic_tool` - 1 iron_ore + 1 wood (15 min)
- `iron_sword` - 3 iron_ore + 1 wood (1 hour)
- `steel_armor` - 5 steel_ingot + 2 leather (2 hours)
- `magic_potion` - 2 herb + 1 water + 1 crystal (30 min)
- `golden_ring` - 2 gold_ingot + 1 gem (3 hours)

### 6. Trading (Future Feature)
Materials can also be obtained through trading with stores:
```bash
# Trade with stores (not yet implemented)
zkgame trade --store-id 1 --action buy --item iron_ore --quantity 10
```

### 7. Proof Files
All actions generate proof files in the `proofs/` directory:
- `gather_proof_<player_id>_<resource>_<timestamp>_<nonce>.json`
- `movement_proof_<player_id>_<timestamp>_<nonce>.json`
- `reward_proof_<player_id>_<timestamp>_<nonce>.json`

### 8. Smart Contract Integration
Each action submits a transaction to the smart contract:
- Movement: `GameCore.move()`
- Resource Gathering: `GameCore.gatherResources()`
- Reward Claims: `GameCore.claimReward()`

## Tips
1. **Gather regularly** - Resources have cooldowns, so gather different types
2. **Check inventory** - Use `zkgame status` to see what you have
3. **Plan crafting** - Some recipes require rare materials
4. **Explore locations** - Different areas may have different resources
5. **Save proofs** - Proof files are stored for verification
