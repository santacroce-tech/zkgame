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
  
  // Actions
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
  updatePlayerState: (updates: any) => void
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
