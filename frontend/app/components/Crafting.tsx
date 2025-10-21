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
    <div className="panel">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Crafting
      </h3>
      
      <div className="space-y-6">
        {/* Start New Craft */}
        <div className="border-medieval rounded-lg p-4">
          <h4 className="text-lg font-medieval text-stone-300 mb-4">🔨 Begin Crafting</h4>
          <div className="space-y-4">
            <select
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="input-medieval w-full text-sm"
            >
              {recipes.map(recipe => (
                <option key={recipe.name} value={recipe.name}>
                  {recipe.displayName}
                </option>
              ))}
            </select>
            
            <div className="text-sm text-stone-400 font-medieval">
              📋 Required Materials: {recipes.find(r => r.name === selectedRecipe)?.materials.map(m => 
                `${m.quantity} ${m.item.replace('_', ' ')}`
              ).join(', ')}
            </div>
            
            <button
              onClick={handleStartCraft}
              disabled={isLoading}
              className="btn-medieval w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-medieval w-4 h-4 mr-2"></div>
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
          <h4 className="text-lg font-medieval text-stone-300 mb-4">⚡ Active Crafts</h4>
          {activeCrafts.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {activeCrafts.map(craft => {
                const progress = getCraftProgress(craft)
                const timeRemaining = getTimeRemaining(craft)
                const isReady = progress >= 100
                
                return (
                  <div key={craft.craftId} className="border-medieval rounded-lg p-3 bg-stone-800/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-sm font-medieval text-stone-200">{craft.recipeName.replace('_', ' ')}</div>
                        <div className="text-xs text-stone-400 font-medieval">
                          {isReady ? '✨ Ready for completion!' : `⏳ ${timeRemaining}s remaining`}
                        </div>
                      </div>
                      {isReady && (
                        <button
                          onClick={() => handleCompleteCraft(craft.craftId)}
                          className="btn-gold text-xs"
                        >
                          ✨ Complete
                        </button>
                      )}
                    </div>
                    
                    <div className="w-full bg-stone-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-gold-500 to-gold-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-stone-400 py-6 text-center font-medieval border-medieval rounded-lg">
              🔨 No active crafts - begin your masterpiece!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
