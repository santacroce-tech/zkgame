import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { proofService, MovementProofInputs } from '../services/proofService'
import { contractService, ContractConfig } from '../services/contractService'

// localStorage helper functions
const STORAGE_KEY = 'zkgame_player_data'
const BACKUP_KEY = 'zkgame_backups'
const SETTINGS_KEY = 'zkgame_settings'

// Enhanced storage functions with better error handling and validation
const savePlayerToStorage = (player: PlayerState) => {
  if (typeof window !== 'undefined') {
    try {
      const existingData = getAllStoredPlayers()
      const playerData = {
        ...existingData,
        [player.walletAddress || 'default']: {
          ...player,
          lastSaved: Date.now(),
          version: '1.0.0'
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData))
      
      // Create backup
      createBackup(player)
      
      console.log('✅ Player data saved to localStorage')
    } catch (error) {
      console.error('❌ Error saving player to storage:', error)
      throw new Error('Failed to save player data')
    }
  }
}

const loadPlayerFromStorage = (walletAddress: string): PlayerState | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const playerData = JSON.parse(stored)
    const player = playerData[walletAddress]
    
    if (!player) return null
    
    // Validate player data structure
    if (!validatePlayerData(player)) {
      console.warn('⚠️ Invalid player data structure, attempting to fix...')
      return fixPlayerData(player)
    }
    
    return player
  } catch (error) {
    console.error('❌ Error loading player from storage:', error)
    return null
  }
}

const getAllStoredPlayers = (): Record<string, PlayerState> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    
    const playerData = JSON.parse(stored)
    
    // Validate and fix all player data
    const validatedData: Record<string, PlayerState> = {}
    for (const [key, player] of Object.entries(playerData)) {
      if (validatePlayerData(player as PlayerState)) {
        validatedData[key] = player as PlayerState
      } else {
        console.warn(`⚠️ Fixing invalid player data for ${key}`)
        validatedData[key] = fixPlayerData(player as PlayerState)
      }
    }
    
    return validatedData
  } catch (error) {
    console.error('❌ Error loading all players from storage:', error)
    return {}
  }
}

// Data validation and fixing functions
const validatePlayerData = (player: any): player is PlayerState => {
  return (
    player &&
    typeof player.playerId === 'string' &&
    typeof player.name === 'string' &&
    typeof player.position === 'object' &&
    typeof player.inventory === 'object' &&
    typeof player.currency === 'number' &&
    typeof player.experience === 'number' &&
    typeof player.reputation === 'number' &&
    typeof player.lastClaimTime === 'number' &&
    Array.isArray(player.ownedStores) &&
    Array.isArray(player.exploredAreas) &&
    typeof player.nonce === 'number'
  )
}

const fixPlayerData = (player: any): PlayerState => {
  return {
    playerId: player.playerId || Date.now().toString(),
    name: player.name || 'Unknown Player',
    walletAddress: player.walletAddress,
    position: player.position || {
      areaId: 1,
      areaType: 'street',
      country: 'Aetheria',
      city: 'Newhaven',
      street: 'Main Street',
    },
    inventory: player.inventory || {},
    currency: typeof player.currency === 'number' ? player.currency : 1000,
    experience: typeof player.experience === 'number' ? player.experience : 0,
    reputation: typeof player.reputation === 'number' ? player.reputation : 1.0,
    lastClaimTime: typeof player.lastClaimTime === 'number' ? player.lastClaimTime : Date.now() - 3600000,
    ownedStores: Array.isArray(player.ownedStores) ? player.ownedStores : [],
    exploredAreas: Array.isArray(player.exploredAreas) ? player.exploredAreas : [{ id: 1, type: 'street' }],
    nonce: typeof player.nonce === 'number' ? player.nonce : 0,
  }
}

// Backup and export/import functions
const createBackup = (player: PlayerState) => {
  if (typeof window === 'undefined') return
  
  try {
    const backups = getBackups()
    const backup = {
      id: `backup_${Date.now()}`,
      playerId: player.playerId,
      playerName: player.name,
      walletAddress: player.walletAddress,
      timestamp: Date.now(),
      data: player
    }
    
    // Keep only last 10 backups
    const updatedBackups = [backup, ...backups].slice(0, 10)
    localStorage.setItem(BACKUP_KEY, JSON.stringify(updatedBackups))
  } catch (error) {
    console.error('❌ Error creating backup:', error)
  }
}

const getBackups = (): any[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(BACKUP_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('❌ Error loading backups:', error)
    return []
  }
}

const exportPlayerData = (player: PlayerState): string => {
  const exportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    player: player,
    metadata: {
      gameVersion: '1.0.0',
      exportType: 'player_save'
    }
  }
  return JSON.stringify(exportData, null, 2)
}

const importPlayerData = (jsonData: string): { success: boolean; player?: PlayerState; error?: string } => {
  try {
    const data = JSON.parse(jsonData)
    
    if (!data.player) {
      return { success: false, error: 'Invalid save file: No player data found' }
    }
    
    if (!validatePlayerData(data.player)) {
      return { success: false, error: 'Invalid save file: Player data structure is invalid' }
    }
    
    const player = fixPlayerData(data.player)
    return { success: true, player }
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to import save file: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

const clearAllData = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(BACKUP_KEY)
    localStorage.removeItem(SETTINGS_KEY)
    return true
  } catch (error) {
    console.error('❌ Error clearing all data:', error)
    return false
  }
}

const getStorageInfo = () => {
  if (typeof window === 'undefined') return { size: 0, players: 0, backups: 0 }
  
  try {
    const players = getAllStoredPlayers()
    const backups = getBackups()
    
    let totalSize = 0
    if (localStorage.getItem(STORAGE_KEY)) {
      totalSize += localStorage.getItem(STORAGE_KEY)!.length
    }
    if (localStorage.getItem(BACKUP_KEY)) {
      totalSize += localStorage.getItem(BACKUP_KEY)!.length
    }
    
    return {
      size: totalSize,
      players: Object.keys(players).length,
      backups: backups.length
    }
  } catch (error) {
    console.error('❌ Error getting storage info:', error)
    return { size: 0, players: 0, backups: 0 }
  }
}

export interface PlayerState {
  playerId: string
  name: string
  walletAddress?: string
  position: {
    areaId: number
    areaType: 'street' | 'city' | 'country'
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
  exploredAreas: Array<{ id: number; type: string }>
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
  isGeneratingProof: boolean
  proofGenerationProgress: number
  currentProofStep: string
  contractConfig: ContractConfig | null
  isContractInitialized: boolean
}

export interface GameActions {
  initializePlayer: (name: string, walletAddress?: string) => Promise<void>
  loadPlayerFromStorage: (walletAddress: string) => Promise<void>
  movePlayer: (areaId: number, areaType: 'street' | 'city' | 'country') => Promise<void>
  movePlayerWithProof: (areaId: number, areaType: 'street' | 'city' | 'country') => Promise<void>
  claimRewards: () => Promise<void>
  startCraft: (recipeName: string) => Promise<void>
  completeCraft: (craftId: string) => Promise<void>
  gatherResources: (resourceType: string, quantity: number) => Promise<void>
  buyStore: (city: string, price: number) => Promise<void>
  tradeWithStore: (storeId: number, action: string, item: string, quantity: number) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updatePlayerState: (updates: Partial<PlayerState>) => void
  initializeContractService: (provider: any, config: ContractConfig) => Promise<void>
  setProofGenerationStatus: (isGenerating: boolean, progress: number, step: string) => void
  
  // Enhanced storage management functions
  exportPlayerData: () => string
  importPlayerData: (jsonData: string) => { success: boolean; player?: PlayerState; error?: string }
  getAllStoredPlayers: () => Record<string, PlayerState>
  getBackups: () => any[]
  getStorageInfo: () => { size: number; players: number; backups: number }
  clearAllData: () => boolean
  restoreFromBackup: (backupId: string) => Promise<{ success: boolean; error?: string }>
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
      isGeneratingProof: false,
      proofGenerationProgress: 0,
      currentProofStep: '',
      contractConfig: null,
      isContractInitialized: false,

      // Actions
      initializePlayer: async (name: string, walletAddress?: string) => {
        console.log('Store: initializePlayer called with:', { name, walletAddress })
        set({ isLoading: true, error: null })
        try {
          // Check if player already exists for this wallet
          if (walletAddress) {
            const existingPlayer = loadPlayerFromStorage(walletAddress)
            if (existingPlayer) {
              set({ 
                player: existingPlayer, 
                isInitialized: true, 
                isLoading: false 
              })
              return
            }
          }

          // Generate player ID
          const playerId = Date.now().toString()
          
          // Create initial state
          const initialPlayer: PlayerState = {
            playerId,
            name,
            walletAddress,
            position: {
              areaId: 1,
              areaType: 'street',
              country: 'Aetheria',
              city: 'Newhaven',
              street: 'Main Street',
            },
            inventory: {},
            currency: 1000,
            experience: 0,
            reputation: 1.0,
            lastClaimTime: Date.now() - 3600000, // Set to 1 hour ago so new players can claim immediately
            ownedStores: [],
            exploredAreas: [{ id: 1, type: 'street' }],
            nonce: 0,
          }

          // Save to localStorage
          savePlayerToStorage(initialPlayer)

          console.log('Store: Player created successfully:', initialPlayer)
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

      loadPlayerFromStorage: async (walletAddress: string) => {
        set({ isLoading: true, error: null })
        try {
          const storedPlayer = loadPlayerFromStorage(walletAddress)
          if (storedPlayer) {
            set({ 
              player: storedPlayer, 
              isInitialized: true, 
              isLoading: false 
            })
          } else {
            set({ 
              error: 'No saved player found for this wallet address',
              isLoading: false 
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load player',
            isLoading: false 
          })
        }
      },

      movePlayer: async (areaId: number, areaType: 'street' | 'city' | 'country') => {
        const { player } = get()
        if (!player) return

        set({ isLoading: true, error: null })
        try {
          // Check if move is valid (simplified - in production, check area connections)
          if (areaId === player.position.areaId) {
            throw new Error('Already in this area')
          }

          // Calculate movement XP based on area type
          let movementXP = 0
          if (areaType === 'street') {
            movementXP = 5
          } else if (areaType === 'city') {
            movementXP = 15
          } else if (areaType === 'country') {
            movementXP = 30
          }

          // Update position
          const newPosition = { 
            ...player.position, 
            areaId, 
            areaType 
          }
          const newExploredAreas = [...player.exploredAreas]
          
          // Add to explored areas if not already there
          if (!newExploredAreas.some(area => area.id === areaId)) {
            newExploredAreas.push({ id: areaId, type: areaType })
          }

          const updatedPlayer = {
            ...player,
            position: newPosition,
            exploredAreas: newExploredAreas,
            experience: player.experience + movementXP,
            nonce: player.nonce + 1,
          }

          // Save to localStorage
          savePlayerToStorage(updatedPlayer)

          set({
            player: updatedPlayer,
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to move player',
            isLoading: false 
          })
        }
      },

      movePlayerWithProof: async (areaId: number, areaType: 'street' | 'city' | 'country') => {
        const { player, isContractInitialized } = get()
        if (!player) {
          console.error('❌ [GameStore] No player found for movement')
          return
        }

        console.log('🎮 [GameStore] Starting macro movement with proof...')
        console.log('📍 [GameStore] Movement details:', {
          from: { areaId: player.position.areaId, areaType: player.position.areaType },
          to: { areaId, areaType },
          playerId: player.playerId,
          isContractInitialized
        })

        set({ isLoading: true, error: null })
        try {
          // Check if move is valid
          if (areaId === player.position.areaId) {
            throw new Error('Already in this area')
          }

          // Generate proof
          console.log('🔍 [GameStore] Starting proof generation...')
          set({ isGeneratingProof: true, proofGenerationProgress: 0, currentProofStep: 'Preparing inputs...' })
          
          const proofInputs: MovementProofInputs = {
            playerId: player.playerId,
            oldAreaId: player.position.areaId,
            oldAreaType: player.position.areaType === 'street' ? 1 : player.position.areaType === 'city' ? 2 : 3,
            newAreaId: areaId,
            newAreaType: areaType === 'street' ? 1 : areaType === 'city' ? 2 : 3,
            inventory: Object.values(player.inventory),
            currency: player.currency,
            lastClaimTime: player.lastClaimTime,
            ownedStores: player.ownedStores,
            reputation: player.reputation,
            experience: player.experience,
            nonce: player.nonce,
            exploredAreas: player.exploredAreas.map(area => area.id),
            timestamp: Date.now()
          }

          console.log('📋 [GameStore] Proof inputs prepared:', {
            playerId: proofInputs.playerId,
            oldPosition: { areaId: proofInputs.oldAreaId, areaType: proofInputs.oldAreaType },
            newPosition: { areaId: proofInputs.newAreaId, areaType: proofInputs.newAreaType },
            inventoryLength: proofInputs.inventory.length,
            currency: proofInputs.currency,
            timestamp: proofInputs.timestamp
          })

          set({ proofGenerationProgress: 25, currentProofStep: 'Generating proof...' })
          
          console.log('⚙️ [GameStore] Calling proof service...')
          const proof = await proofService.generateMovementProof(proofInputs)
          console.log('✅ [GameStore] Proof generated successfully!')
          
          set({ proofGenerationProgress: 75, currentProofStep: 'Submitting to contract...' })

          // Submit to contract if initialized
          if (isContractInitialized) {
            console.log('📡 [GameStore] Submitting proof to contract...')
            const result = await contractService.submitMovementProof(proof)
            console.log('📊 [GameStore] Contract submission result:', result)
            if (!result.success) {
              throw new Error(result.error || 'Failed to submit proof to contract')
            }
            console.log('✅ [GameStore] Proof submitted to contract successfully!')
          } else {
            console.log('⚠️ [GameStore] Contract not initialized, skipping submission')
          }

          set({ proofGenerationProgress: 100, currentProofStep: 'Updating player state...' })

          // Calculate movement XP based on area type
          let movementXP = 0
          if (areaType === 'street') {
            movementXP = 5
          } else if (areaType === 'city') {
            movementXP = 15
          } else if (areaType === 'country') {
            movementXP = 30
          }

          // Update player state
          console.log('🔄 [GameStore] Updating player state...')
          const newPosition = { 
            ...player.position, 
            areaId, 
            areaType 
          }
          const newExploredAreas = [...player.exploredAreas]
          
          if (!newExploredAreas.some(area => area.id === areaId)) {
            newExploredAreas.push({ id: areaId, type: areaType })
            console.log('🗺️ [GameStore] Added new explored area:', { id: areaId, type: areaType })
          }

          const updatedPlayer = {
            ...player,
            position: newPosition,
            exploredAreas: newExploredAreas,
            experience: player.experience + movementXP,
            nonce: player.nonce + 1,
          }

          console.log('💾 [GameStore] Saving updated player to storage...')
          savePlayerToStorage(updatedPlayer)

          set({
            player: updatedPlayer,
            isLoading: false,
            isGeneratingProof: false,
            proofGenerationProgress: 0,
            currentProofStep: '',
          })

          console.log('✅ [GameStore] Macro movement completed successfully!')
        } catch (error) {
          console.error('❌ [GameStore] Movement failed:', error)
          console.error('📋 [GameStore] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          })
          set({ 
            error: error instanceof Error ? error.message : 'Failed to move player with proof',
            isLoading: false,
            isGeneratingProof: false,
            proofGenerationProgress: 0,
            currentProofStep: '',
          })
        }
      },

      claimRewards: async () => {
        console.log('🎯 [GameStore] claimRewards called')
        const { player, isContractInitialized } = get()
        if (!player) {
          console.log('❌ [GameStore] No player found, returning')
          return
        }

        console.log('✅ [GameStore] Player found:', player)
        console.log('🔧 [GameStore] Contract service status:', {
          isContractInitialized,
          hasContractService: !!contractService,
          contractServiceType: typeof contractService,
          contractServiceConstructor: contractService?.constructor?.name,
          contractServiceMethods: contractService ? Object.getOwnPropertyNames(Object.getPrototypeOf(contractService)) : 'No contract service'
        })
        
        set({ isLoading: true, error: null })
        try {
          const currentTime = Date.now()
          const timeElapsed = currentTime - player.lastClaimTime
          
          console.log('⏰ [GameStore] Time check:', { currentTime, lastClaimTime: player.lastClaimTime, timeElapsed })
          
          // TEMPORARY: Reduce cooldown to 1 minute for testing
          const COOLDOWN_TIME = 60000 // 1 minute instead of 1 hour
          console.log('🧪 [GameStore] Using testing cooldown:', COOLDOWN_TIME / 1000, 'seconds')
          
          if (timeElapsed < COOLDOWN_TIME) {
            const remainingSeconds = Math.ceil((COOLDOWN_TIME - timeElapsed) / 1000)
            throw new Error(`Must wait at least ${remainingSeconds} seconds between claims (testing mode)`)
          }

          const hoursElapsed = timeElapsed / 3600000
          const reward = Math.floor(100 * hoursElapsed * player.reputation)
          
          console.log('💰 [GameStore] Calculating reward:', { hoursElapsed, reward, reputation: player.reputation })

          // If contract is initialized, generate proof and submit to contract
          if (isContractInitialized && contractService) {
            console.log('🔐 [GameStore] Contract initialized - starting 2-phase claim process...')
            
            // PHASE 1: Generate Time Reward Proof
            console.log('📋 [GameStore] ===== PHASE 1: GENERATING PROOF =====')
            set({ proofGenerationProgress: 10, currentProofStep: 'Preparing proof inputs...' })
            
            // Prepare proof inputs
            const proofInputs = {
              playerId: player.playerId,
              positionX: player.position.areaId, // Using areaId as position for now
              positionY: 0, // Simplified for now
              inventory: Object.values(player.inventory || {}),
              currency: player.currency,
              lastClaimTime: player.lastClaimTime,
              ownedStores: player.ownedStores || [],
              reputation: player.reputation,
              experience: player.experience,
              nonce: player.nonce,
              exploredCells: player.exploredAreas?.map(area => area.id) || [],
              currentTime: currentTime,
              rewardAmount: reward
            }

            console.log('📋 [GameStore] Time reward proof inputs prepared:', proofInputs)
            set({ proofGenerationProgress: 30, currentProofStep: 'Generating zero-knowledge proof...' })

            // Generate proof
            console.log('⚙️ [GameStore] Calling proofService.generateTimeRewardProof...')
            const proof = await proofService.generateTimeRewardProof(proofInputs)
            console.log('✅ [GameStore] PHASE 1 COMPLETE: Time reward proof generated successfully!')
            set({ proofGenerationProgress: 50, currentProofStep: 'Proof generated, preparing transaction...' })

            // PHASE 2: Submit to Contract (This should trigger MetaMask)
            console.log('📡 [GameStore] ===== PHASE 2: SUBMITTING TO CONTRACT =====')
            set({ proofGenerationProgress: 70, currentProofStep: 'Submitting proof to contract (MetaMask popup should appear)...' })
            
            console.log('📡 [GameStore] Calling contractService.submitTimeRewardProof...')
            console.log('🔍 [GameStore] About to trigger MetaMask transaction...')
            
            const result = await contractService.submitTimeRewardProof(proof)
            console.log('📊 [GameStore] PHASE 2 COMPLETE: Contract submission result:', result)
            
            if (!result.success) {
              console.error('❌ [GameStore] Contract submission failed:', result.error)
              throw new Error(result.error || 'Failed to submit time reward proof to contract')
            }
            
            console.log('✅ [GameStore] CLAIM COMPLETE: Time reward proof submitted to contract successfully!')
            console.log('🔗 [GameStore] Transaction hash:', result.hash)
            set({ proofGenerationProgress: 100, currentProofStep: 'Transaction confirmed!' })
          } else {
            console.log('⚠️ [GameStore] Contract not initialized, updating local state only')
            console.log('🔍 [GameStore] Contract initialization details:', {
              isContractInitialized,
              hasContractService: !!contractService,
              contractServiceConstructor: contractService?.constructor?.name,
              contractServiceMethods: contractService ? Object.getOwnPropertyNames(Object.getPrototypeOf(contractService)) : 'No contract service',
              gameStoreState: {
                isContractInitialized: get().isContractInitialized,
                contractConfig: get().contractConfig
              }
            })
            
            // Update player state with current time as lastClaimTime
            const finalCurrentTime = Date.now()
            const updatedPlayer = {
              ...player,
              currency: player.currency + reward,
              lastClaimTime: finalCurrentTime,
              nonce: player.nonce + 1,
            }
            
            // Save to localStorage
            savePlayerToStorage(updatedPlayer)
            
            set({
              player: updatedPlayer,
              isLoading: false,
            })
          }
          
          console.log('Reward claimed successfully!')
        } catch (error) {
          console.error('Error claiming rewards:', error)
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

      buyStore: async (_city: string, price: number) => {
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
          const updatedPlayer = { ...player, ...updates }
          savePlayerToStorage(updatedPlayer)
          set({ player: updatedPlayer })
        }
      },

      initializeContractService: async (provider: any, config: ContractConfig) => {
        console.log('🔧 [GameStore] Initializing contract service...', {
          hasProvider: !!provider,
          config,
          providerType: typeof provider
        })
        try {
          await contractService.initialize(provider, config)
          console.log('✅ [GameStore] Contract service initialized successfully!')
          set({ 
            contractConfig: config, 
            isContractInitialized: true 
          })
        } catch (error) {
          console.error('❌ [GameStore] Contract service initialization failed:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize contract service',
            isContractInitialized: false 
          })
        }
      },

      setProofGenerationStatus: (isGenerating: boolean, progress: number, step: string) => {
        set({ 
          isGeneratingProof: isGenerating, 
          proofGenerationProgress: progress, 
          currentProofStep: step 
        })
      },

      // Enhanced storage management functions
      exportPlayerData: () => {
        const { player } = get()
        if (!player) {
          throw new Error('No player data to export')
        }
        return exportPlayerData(player)
      },

      importPlayerData: (jsonData: string) => {
        const result = importPlayerData(jsonData)
        if (result.success && result.player) {
          savePlayerToStorage(result.player)
          set({ player: result.player, isInitialized: true })
        }
        return result
      },

      getAllStoredPlayers: () => {
        return getAllStoredPlayers()
      },

      getBackups: () => {
        return getBackups()
      },

      getStorageInfo: () => {
        return getStorageInfo()
      },

      clearAllData: () => {
        const success = clearAllData()
        if (success) {
          set({ 
            player: null, 
            isInitialized: false, 
            activeCrafts: [],
            error: null 
          })
        }
        return success
      },

      restoreFromBackup: async (backupId: string) => {
        set({ isLoading: true, error: null })
        try {
          const backups = getBackups()
          const backup = backups.find(b => b.id === backupId)
          
          if (!backup) {
            return { success: false, error: 'Backup not found' }
          }

          if (!validatePlayerData(backup.data)) {
            return { success: false, error: 'Backup data is corrupted' }
          }

          const player = fixPlayerData(backup.data)
          savePlayerToStorage(player)
          
          set({ 
            player, 
            isInitialized: true, 
            isLoading: false 
          })
          
          return { success: true }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to restore backup',
            isLoading: false 
          })
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to restore backup' 
          }
        }
      },
    }),
    {
      name: 'game-store',
    }
  )
)
