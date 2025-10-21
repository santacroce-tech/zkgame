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
    <div className="panel">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Inventory
      </h3>
      
      <div className="space-y-4">
        {/* Gather Resources */}
        <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 border border-secondary-200 dark:border-secondary-600">
          <h4 className="text-base font-medium text-primary mb-3">Gather Resources</h4>
          <div className="space-y-3">
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="input text-sm"
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
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="loading w-4 h-4 mr-2"></div>
                    Gathering...
                  </div>
                ) : (
                  'Gather'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Inventory Items */}
        <div>
          <h4 className="text-base font-medium text-primary mb-3">Items</h4>
          {inventoryItems.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inventoryItems.map(([item, quantity]: [string, number]) => (
                <div key={item} className="flex justify-between items-center py-2 px-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600">
                  <span className="text-sm capitalize text-primary">{item.replace('_', ' ')}</span>
                  <span className="text-sm text-accent font-semibold">{quantity}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-secondary py-6 text-center bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600">
              No items yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
