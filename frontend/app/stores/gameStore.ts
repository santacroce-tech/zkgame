'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface PlayerState {
  playerId: string
  name: string
  position: {
    x: number
    y: number
    country: string
    city: string
    street: string
  }
  inventory: Record<string, number>
  currency: number
  experience: number
  reputation: number
  lastClaimTime: number
  ownedStores: number[]
  exploredCells: Array<{ x: number; y: number }>
  nonce: number
}

export interface CraftInProgress {
  craftId: string
  recipeName: string
  startTime: number
  requiredTime: number
  status: 'computing' | 'ready' | 'completed'
}

export interface GameState {
  player: PlayerState | null
  activeCrafts: CraftInProgress[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export interface GameActions {
  initializePlayer: (name: string) => Promise<void>
  movePlayer: (x: number, y: number) => Promise<void>
  claimRewards: () => Promise<void>
  startCraft: (recipeName: string) => Promise<void>
  completeCraft: (craftId: string) => Promise<void>
  gatherResources: (resourceType: string, quantity: number) => Promise<void>
  buyStore: (city: string, price: number) => Promise<void>
  tradeWithStore: (storeId: number, action: string, item: string, quantity: number) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updatePlayerState: (updates: Partial<PlayerState>) => void
}

export const useGameStore = create<GameState & GameActions>()(
  devtools(
    (set, get) => ({
      // State
      player: null,
      activeCrafts: [],
      isLoading: false,
      error: null,
      isInitialized: false,

      // Actions
      initializePlayer: async (name: string) => {
        set({ isLoading: true, error: null })
        try {
          // Generate player ID
          const playerId = Date.now().toString()
          
          // Create initial state
          const initialPlayer: PlayerState = {
            playerId,
            name,
            position: {
              x: 0,
              y: 0,
              country: 'Aetheria',
              city: 'Newhaven',
              street: 'Main Street',
            },
            inventory: {},
            currency: 1000,
            experience: 0,
            reputation: 1.0,
            lastClaimTime: Date.now(),
            ownedStores: [],
            exploredCells: [{ x: 0, y: 0 }],
            nonce: 0,
          }

          set({ 
            player: initialPlayer, 
            isInitialized: true, 
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize player',
            isLoading: false 
          })
        }
      },

      movePlayer: async (x: number, y: number) => {
        const { player } = get()
        if (!player) return

        set({ isLoading: true, error: null })
        try {
          // Check if move is valid
          const distance = Math.abs(x - player.position.x) + Math.abs(y - player.position.y)
          if (distance > 1) {
            throw new Error('Can only move to adjacent cells or previously explored areas')
          }

          // Update position
          const newPosition = { ...player.position, x, y }
          const newExploredCells = [...player.exploredCells]
          
          // Add to explored cells if not already there
          if (!newExploredCells.some(cell => cell.x === x && cell.y === y)) {
            newExploredCells.push({ x, y })
          }

          set({
            player: {
              ...player,
              position: newPosition,
              exploredCells: newExploredCells,
              experience: player.experience + 10,
              nonce: player.nonce + 1,
            },
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to move player',
            isLoading: false 
          })
        }
      },

      claimRewards: async () => {
        const { player } = get()
        if (!player) return

        set({ isLoading: true, error: null })
        try {
          const currentTime = Date.now()
          const timeElapsed = currentTime - player.lastClaimTime
          
          if (timeElapsed < 3600000) { // 1 hour
            throw new Error('Must wait at least 1 hour between claims')
          }

          const hoursElapsed = timeElapsed / 3600000
          const reward = Math.floor(100 * hoursElapsed * player.reputation)

          set({
            player: {
              ...player,
              currency: player.currency + reward,
              lastClaimTime: currentTime,
              nonce: player.nonce + 1,
            },
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to claim rewards',
            isLoading: false 
          })
        }
      },

      startCraft: async (recipeName: string) => {
        const { player, activeCrafts } = get()
        if (!player) return

        set({ isLoading: true, error: null })
        try {
          // Load recipe (simplified)
          const recipes: Record<string, any> = {
            iron_sword: {
              required_materials: [
                { item_type: 'iron_ore', quantity: 3 },
                { item_type: 'wood', quantity: 1 }
              ],
              required_time_seconds: 3600,
              experience_reward: 100,
            },
            basic_tool: {
              required_materials: [
                { item_type: 'iron_ore', quantity: 1 },
                { item_type: 'wood', quantity: 1 }
              ],
              required_time_seconds: 900,
              experience_reward: 25,
            }
          }

          const recipe = recipes[recipeName]
          if (!recipe) {
            throw new Error(`Recipe '${recipeName}' not found`)
          }

          // Check materials
          const hasMaterials = recipe.required_materials.every((req: any) => 
            (player.inventory[req.item_type] || 0) >= req.quantity
          )

          if (!hasMaterials) {
            throw new Error(`Insufficient materials for recipe '${recipeName}'`)
          }

          const craftId = `craft_${player.playerId}_${Date.now()}`
          const craft: CraftInProgress = {
            craftId,
            recipeName,
            startTime: Date.now(),
            requiredTime: recipe.required_time_seconds * 1000,
            status: 'computing',
          }

          set({
            activeCrafts: [...activeCrafts, craft],
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start craft',
            isLoading: false 
          })
        }
      },

      completeCraft: async (craftId: string) => {
        const { player, activeCrafts } = get()
        if (!player) return

        set({ isLoading: true, error: null })
        try {
          const craftIndex = activeCrafts.findIndex(c => c.craftId === craftId)
          if (craftIndex === -1) {
            throw new Error(`Craft '${craftId}' not found`)
          }

          const craft = activeCrafts[craftIndex]
          const currentTime = Date.now()
          
          if (currentTime - craft.startTime < craft.requiredTime) {
            const remaining = Math.ceil((craft.requiredTime - (currentTime - craft.startTime)) / 1000)
            throw new Error(`Craft not yet complete. ${remaining} seconds remaining`)
          }

          // Complete the craft
          const recipes: Record<string, any> = {
            iron_sword: {
              required_materials: [
                { item_type: 'iron_ore', quantity: 3 },
                { item_type: 'wood', quantity: 1 }
              ],
              output_item: { type: 'iron_sword', quantity: 1 },
              experience_reward: 100,
            },
            basic_tool: {
              required_materials: [
                { item_type: 'iron_ore', quantity: 1 },
                { item_type: 'wood', quantity: 1 }
              ],
              output_item: { type: 'basic_tool', quantity: 1 },
              experience_reward: 25,
            }
          }

          const recipe = recipes[craft.recipeName]
          
          // Consume materials
          const newInventory = { ...player.inventory }
          recipe.required_materials.forEach((req: any) => {
            newInventory[req.item_type] = (newInventory[req.item_type] || 0) - req.quantity
          })

          // Add crafted item
          newInventory[recipe.output_item.type] = (newInventory[recipe.output_item.type] || 0) + recipe.output_item.quantity

          // Remove completed craft
          const newActiveCrafts = activeCrafts.filter(c => c.craftId !== craftId)

          set({
            player: {
              ...player,
              inventory: newInventory,
              experience: player.experience + recipe.experience_reward,
              nonce: player.nonce + 1,
            },
            activeCrafts: newActiveCrafts,
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to complete craft',
            isLoading: false 
          })
        }
      },

      gatherResources: async (resourceType: string, quantity: number) => {
        const { player } = get()
        if (!player) return

        set({ isLoading: true, error: null })
        try {
          const currentTime = Date.now()
          const lastGatherKey = `last_gather_${resourceType}`
          const lastGather = player.inventory[lastGatherKey] || 0

          if (currentTime - lastGather < 300000) { // 5 minutes
            const remaining = Math.ceil((300000 - (currentTime - lastGather)) / 1000)
            throw new Error(`Resource gathering cooldown active. ${remaining} seconds remaining`)
          }

          const newInventory = { ...player.inventory }
          newInventory[resourceType] = (newInventory[resourceType] || 0) + quantity
          newInventory[lastGatherKey] = currentTime

          set({
            player: {
              ...player,
              inventory: newInventory,
              experience: player.experience + quantity * 5,
              nonce: player.nonce + 1,
            },
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to gather resources',
            isLoading: false 
          })
        }
      },

      buyStore: async (city: string, price: number) => {
        const { player } = get()
        if (!player) return

        set({ isLoading: true, error: null })
        try {
          if (player.currency < price) {
            throw new Error(`Insufficient currency. Need ${price}, have ${player.currency}`)
          }

          if (player.ownedStores.length >= 10) {
            throw new Error('Maximum stores per player (10) reached')
          }

          const storeId = Date.now()

          set({
            player: {
              ...player,
              currency: player.currency - price,
              ownedStores: [...player.ownedStores, storeId],
              nonce: player.nonce + 1,
            },
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to buy store',
            isLoading: false 
          })
        }
      },

      tradeWithStore: async (storeId: number, action: string, item: string, quantity: number) => {
        set({ isLoading: true, error: null })
        try {
          // Simplified trade implementation
          console.log(`Trading with store ${storeId}: ${action} ${quantity} ${item}`)
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to trade',
            isLoading: false 
          })
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      updatePlayerState: (updates: Partial<PlayerState>) => {
        const { player } = get()
        if (player) {
          set({ player: { ...player, ...updates } })
        }
      },
    }),
    {
      name: 'game-store',
    }
  )
)
