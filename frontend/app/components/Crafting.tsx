'use client'

import { useGame } from '../contexts/GameContext'
import { useState } from 'react'

export function Crafting() {
  const { player, activeCrafts, startCraft, completeCraft, isLoading } = useGame()
  const [selectedRecipe, setSelectedRecipe] = useState('basic_tool')

  if (!player) return null

  const recipes = [
    {
      name: 'basic_tool',
      displayName: 'Basic Tool',
      materials: [
        { item: 'iron_ore', quantity: 1 },
        { item: 'wood', quantity: 1 }
      ],
      time: '15 min',
      xp: 25
    },
    {
      name: 'iron_sword',
      displayName: 'Iron Sword',
      materials: [
        { item: 'iron_ore', quantity: 3 },
        { item: 'wood', quantity: 1 }
      ],
      time: '1 hour',
      xp: 100
    }
  ]

  const handleStartCraft = async () => {
    await startCraft(selectedRecipe)
  }

  const handleCompleteCraft = async (craftId: string) => {
    await completeCraft(craftId)
  }

  const getCraftProgress = (craft: any) => {
    const elapsed = Date.now() - craft.startTime
    const progress = Math.min(elapsed / craft.requiredTime, 1)
    return Math.floor(progress * 100)
  }

  const getTimeRemaining = (craft: any) => {
    const elapsed = Date.now() - craft.startTime
    const remaining = Math.max(craft.requiredTime - elapsed, 0)
    return Math.ceil(remaining / 1000)
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Crafting</h3>
      
      <div className="space-y-4">
        {/* Start New Craft */}
        <div className="border border-game-border rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Start Crafting</h4>
          <div className="space-y-2">
            <select
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="input w-full text-sm"
            >
              {recipes.map(recipe => (
                <option key={recipe.name} value={recipe.name}>
                  {recipe.displayName}
                </option>
              ))}
            </select>
            
            <div className="text-xs text-gray-400">
              {recipes.find(r => r.name === selectedRecipe)?.materials.map(m => 
                `${m.quantity} ${m.item.replace('_', ' ')}`
              ).join(', ')}
            </div>
            
            <button
              onClick={handleStartCraft}
              disabled={isLoading}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              Start Crafting
            </button>
          </div>
        </div>
        
        {/* Active Crafts */}
        <div>
          <h4 className="text-sm font-medium mb-2">Active Crafts</h4>
          {activeCrafts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeCrafts.map(craft => {
                const progress = getCraftProgress(craft)
                const timeRemaining = getTimeRemaining(craft)
                const isReady = progress >= 100
                
                return (
                  <div key={craft.craftId} className="border border-game-border rounded-lg p-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium">{craft.recipeName.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-400">
                          {isReady ? 'Ready!' : `${timeRemaining}s remaining`}
                        </div>
                      </div>
                      {isReady && (
                        <button
                          onClick={() => handleCompleteCraft(craft.craftId)}
                          className="btn-secondary text-xs"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                    
                    <div className="w-full bg-game-bg rounded-full h-2">
                      <div
                        className="bg-game-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400 py-4 text-center">
              No active crafts
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
