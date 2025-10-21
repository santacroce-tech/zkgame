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
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary-50 dark:bg-secondary-700 p-3 rounded-lg border border-secondary-200 dark:border-secondary-600">
          <div className="text-xs text-secondary font-medium">Total Items</div>
          <div className="text-lg font-bold text-primary">{inventoryItems.length}</div>
        </div>
        <div className="bg-secondary-50 dark:bg-secondary-700 p-3 rounded-lg border border-secondary-200 dark:border-secondary-600">
          <div className="text-xs text-secondary font-medium">Total Quantity</div>
          <div className="text-lg font-bold text-accent">
            {inventoryItems.reduce((sum, [, qty]) => sum + qty, 0)}
          </div>
        </div>
      </div>

      {/* Gather Resources */}
      <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 border border-secondary-200 dark:border-secondary-600">
        <h4 className="text-base font-medium text-primary mb-3 flex items-center">
          <span className="mr-2">⛏️</span>
          Gather Resources
        </h4>
        <div className="space-y-3">
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="input text-sm w-full"
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
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed px-4"
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
        <h4 className="text-base font-medium text-primary mb-3 flex items-center">
          <span className="mr-2">📦</span>
          Items ({inventoryItems.length})
        </h4>
        {inventoryItems.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {inventoryItems.map(([item, quantity]: [string, number]) => (
              <div key={item} className="flex justify-between items-center py-2 px-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                <span className="text-sm capitalize text-primary font-medium">{item.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-accent font-bold bg-accent-100 dark:bg-accent-900/20 px-2 py-1 rounded">
                    {quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-secondary py-8 text-center bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600">
            <div className="text-4xl mb-2">📦</div>
            <div>No items yet</div>
            <div className="text-xs mt-1">Start gathering resources!</div>
          </div>
        )}
      </div>
    </div>
  )
}
