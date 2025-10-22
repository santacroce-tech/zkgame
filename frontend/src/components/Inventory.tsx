import { useGame } from '../contexts/GameContext'
import { useState } from 'react'

export function Inventory() {
  const { player, gatherResources, isLoading } = useGame()
  const [selectedResource, setSelectedResource] = useState('iron_ore')
  const [gatherQuantity, setGatherQuantity] = useState(1)

  if (!player) {
    return (
      <div className="text-center text-secondary">
        <div className="loading" style={{ margin: '0 auto 16px' }}></div>
        Loading inventory...
      </div>
    )
  }

  const inventory = player.inventory || {}
  const inventoryItems = Object.entries(inventory)
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
      {/* Gather Resources */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
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
              className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed px-4"
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
        {inventoryItems.length === 0 ? (
          <div className="text-center text-secondary">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            <div>Your inventory is empty</div>
            <div className="text-xs mt-1">Start gathering resources!</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {inventoryItems.map(([itemName, quantity], index) => (
              <div 
                key={index}
                className="flex justify-between items-center py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-sm capitalize text-primary font-medium">{itemName.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-accent font-bold bg-accent-500/20 px-2 py-1 rounded">
                    {quantity as number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
