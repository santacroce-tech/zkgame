'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useGameStore } from '../stores/gameStore'

interface GameContextType {
  // State
  player: any
  activeCrafts: any[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  isGeneratingProof: boolean
  proofGenerationProgress: number
  currentProofStep: string
  isContractInitialized: boolean
  
  // Actions
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
  updatePlayerState: (updates: any) => void
  initializeContractService: (provider: any, config: any) => Promise<void>
  setProofGenerationStatus: (isGenerating: boolean, progress: number, step: string) => void
  
  // Enhanced storage management functions
  exportPlayerData: () => string
  importPlayerData: (jsonData: string) => { success: boolean; player?: any; error?: string }
  getAllStoredPlayers: () => Record<string, any>
  getBackups: () => any[]
  getStorageInfo: () => { size: number; players: number; backups: number }
  clearAllData: () => boolean
  restoreFromBackup: (backupId: string) => Promise<{ success: boolean; error?: string }>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const gameStore = useGameStore()
  
  return (
    <GameContext.Provider value={gameStore}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
