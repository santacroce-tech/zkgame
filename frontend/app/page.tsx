'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useGame } from './contexts/GameContext'
import { useSocket } from './contexts/SocketContext'
import { GameMap } from './components/GameMap'
import { PlayerStatus } from './components/PlayerStatus'
import { Inventory } from './components/Inventory'
import { Crafting } from './components/Crafting'
import { Chat } from './components/Chat'
import { useState } from 'react'

export default function GamePage() {
  const { player, isInitialized, initializePlayer, isLoading, error } = useGame()
  const { isConnected } = useSocket()
  const [playerName, setPlayerName] = useState('')
  const [showInventory, setShowInventory] = useState(false)
  const [showCrafting, setShowCrafting] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const handleInitialize = async () => {
    if (playerName.trim()) {
      await initializePlayer(playerName.trim())
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="card max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-game-accent mb-2">ZKGame</h1>
            <p className="text-gray-400">Zero-Knowledge Proof Game</p>
          </div>
          
          <div className="mb-6">
            <ConnectButton />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your player name"
                className="input w-full"
                onKeyPress={(e) => e.key === 'Enter' && handleInitialize()}
              />
            </div>
            
            <button
              onClick={handleInitialize}
              disabled={!playerName.trim() || isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Initializing...' : 'Start Game'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-game-bg">
      {/* Header */}
      <header className="bg-game-surface border-b border-game-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-game-accent">ZKGame</h1>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ConnectButton />
            <div className="text-sm text-gray-400">
              {player?.name} | Level {Math.floor(player?.experience / 100) + 1}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Game Map */}
        <div className="flex-1 p-4">
          <GameMap />
        </div>
        
        {/* Sidebar */}
        <div className="w-80 bg-game-surface border-l border-game-border p-4 space-y-4">
          <PlayerStatus />
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="btn-secondary flex-1"
            >
              Inventory
            </button>
            <button
              onClick={() => setShowCrafting(!showCrafting)}
              className="btn-secondary flex-1"
            >
              Craft
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="btn-secondary flex-1"
            >
              Chat
            </button>
          </div>
          
          {showInventory && <Inventory />}
          {showCrafting && <Crafting />}
          {showChat && <Chat />}
        </div>
      </div>
      
      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 max-w-sm">
          {error}
        </div>
      )}
    </div>
  )
}
