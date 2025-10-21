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
    <div className="space-y-4">
      {/* Crafting Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary-50 dark:bg-secondary-700 p-3 rounded-lg border border-secondary-200 dark:border-secondary-600">
          <div className="text-xs text-secondary font-medium">Active Crafts</div>
          <div className="text-lg font-bold text-primary">{activeCrafts.length}</div>
        </div>
        <div className="bg-secondary-50 dark:bg-secondary-700 p-3 rounded-lg border border-secondary-200 dark:border-secondary-600">
          <div className="text-xs text-secondary font-medium">Available Recipes</div>
          <div className="text-lg font-bold text-accent">{recipes.length}</div>
        </div>
      </div>

      {/* Start New Craft */}
      <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 border border-secondary-200 dark:border-secondary-600">
        <h4 className="text-base font-medium text-primary mb-3 flex items-center">
          <span className="mr-2">🔨</span>
          Begin Crafting
        </h4>
        <div className="space-y-3">
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
          
          <div className="text-sm text-secondary bg-secondary-100 dark:bg-secondary-600 p-2 rounded">
            <div className="font-medium mb-1">📋 Required Materials:</div>
            <div className="text-xs">
              {recipes.find(r => r.name === selectedRecipe)?.materials.map(m => 
                `${m.quantity} ${m.item.replace('_', ' ')}`
              ).join(', ')}
            </div>
          </div>
          
          <button
            onClick={handleStartCraft}
            disabled={isLoading}
            className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading w-4 h-4 mr-2"></div>
                Starting Craft...
              </div>
            ) : (
              '🔨 Begin Crafting'
            )}
          </button>
        </div>
      </div>
      
      {/* Active Crafts */}
      <div>
        <h4 className="text-base font-medium text-primary mb-3 flex items-center">
          <span className="mr-2">⚡</span>
          Active Crafts ({activeCrafts.length})
        </h4>
        {activeCrafts.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activeCrafts.map(craft => {
              const progress = getCraftProgress(craft)
              const timeRemaining = getTimeRemaining(craft)
              const isReady = progress >= 100
              
              return (
                <div key={craft.craftId} className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-3 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-medium text-primary capitalize">{craft.recipeName.replace('_', ' ')}</div>
                      <div className="text-xs text-secondary">
                        {isReady ? '✨ Ready for completion!' : `⏳ ${timeRemaining}s remaining`}
                      </div>
                    </div>
                    {isReady && (
                      <button
                        onClick={() => handleCompleteCraft(craft.craftId)}
                        className="btn-accent text-xs px-3 py-1"
                      >
                        ✨ Complete
                      </button>
                    )}
                  </div>
                  
                  <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-secondary py-8 text-center bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600">
            <div className="text-4xl mb-2">🔨</div>
            <div>No active crafts</div>
            <div className="text-xs mt-1">Begin your masterpiece!</div>
          </div>
        )}
      </div>
    </div>
  )
}
