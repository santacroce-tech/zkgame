'use client'

import { useGame } from '../contexts/GameContext'
import { useState } from 'react'

export function Inventory() {
  const { player, gatherResources, isLoading } = useGame()
  const [selectedResource, setSelectedResource] = useState('iron_ore')
  const [gatherQuantity, setGatherQuantity] = useState(1)

  if (!player) return null

  const inventoryItems = Object.entries(player.inventory)
    .filter(([key]) => !key.startsWith('last_gather_'))
    .sort(([a], [b]) => a.localeCompare(b)) as [string, number][]

  const handleGatherResources = async () => {
    await gatherResources(selectedResource, gatherQuantity)
  }

  const resourceOptions = [
    { value: 'iron_ore', label: 'Iron Ore' },
    { value: 'wood', label: 'Wood' },
    { value: 'stone', label: 'Stone' },
    { value: 'herb', label: 'Herb' },
    { value: 'water', label: 'Water' },
    { value: 'crystal', label: 'Crystal' },
  ]

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Inventory</h3>
      
      <div className="space-y-4">
        {/* Gather Resources */}
        <div className="border border-game-border rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Gather Resources</h4>
          <div className="space-y-2">
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="input w-full text-sm"
            >
              {resourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <input
                type="number"
                min="1"
                max="10"
                value={gatherQuantity}
                onChange={(e) => setGatherQuantity(parseInt(e.target.value) || 1)}
                className="input flex-1 text-sm"
              />
              <button
                onClick={handleGatherResources}
                disabled={isLoading}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Gather
              </button>
            </div>
          </div>
        </div>
        
        {/* Inventory Items */}
        <div>
          <h4 className="text-sm font-medium mb-2">Items</h4>
          {inventoryItems.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {inventoryItems.map(([item, quantity]: [string, number]) => (
                <div key={item} className="flex justify-between items-center py-1 px-2 bg-game-bg rounded">
                  <span className="text-sm capitalize">{item.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-game-accent">{quantity}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 py-4 text-center">
              Inventory is empty
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
