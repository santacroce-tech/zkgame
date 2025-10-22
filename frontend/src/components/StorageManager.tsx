
import { useGame } from '../contexts/GameContext'
import { useState } from 'react'

export function StorageManager() {
  const { clearAllData, getStorageInfo, getAllStoredPlayers, getBackups } = useGame()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const storageInfo = getStorageInfo()
  const allPlayers = getAllStoredPlayers()
  const backups = getBackups()

  const handleClearAllData = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsClearing(true)
    try {
      const success = clearAllData()
      if (success) {
        console.log('✅ All data cleared successfully')
        setShowConfirm(false)
        // The game store will automatically reset the player state
      } else {
        console.error('❌ Failed to clear data')
      }
    } catch (error) {
      console.error('❌ Error clearing data:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const cancelClear = () => {
    setShowConfirm(false)
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">
          📊 Storage Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-secondary">Total Players:</span>
            <span className="text-primary ml-2 font-medium">{storageInfo.players}</span>
          </div>
          <div>
            <span className="text-secondary">Backups:</span>
            <span className="text-primary ml-2 font-medium">{storageInfo.backups}</span>
          </div>
          <div>
            <span className="text-secondary">Storage Size:</span>
            <span className="text-primary ml-2 font-medium">
              {(storageInfo.size / 1024).toFixed(2)} KB
            </span>
          </div>
          <div>
            <span className="text-secondary">Status:</span>
            <span className="text-green-400 ml-2 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Player Data */}
      {Object.keys(allPlayers).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">
            👥 Stored Players
          </h3>
          <div className="space-y-2">
            {Object.entries(allPlayers).map(([address, player]) => (
              <div key={address} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-primary font-medium">{player.name}</div>
                  <div className="text-secondary text-sm">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                <div className="text-sm text-secondary">
                  Level {Math.floor(player.experience / 100) + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backups */}
      {backups.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">
            💾 Recent Backups
          </h3>
          <div className="space-y-2">
            {backups.slice(0, 5).map((backup) => (
              <div key={backup.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-primary font-medium">{backup.playerName}</div>
                  <div className="text-secondary text-sm">
                    {new Date(backup.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-secondary">
                  {backup.walletAddress?.slice(0, 6)}...{backup.walletAddress?.slice(-4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Data */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">
          🗑️ Clear All Data
        </h3>
        <div className="space-y-4">
          <div className="text-secondary text-sm">
            This will permanently delete all player data, backups, and settings. 
            This action cannot be undone.
          </div>
          
          {!showConfirm ? (
            <button
              onClick={handleClearAllData}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              🗑️ Clear All Data
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 font-medium mb-2">⚠️ Confirm Data Deletion</div>
                <div className="text-red-300 text-sm">
                  Are you sure you want to delete all data? This will:
                </div>
                <ul className="text-red-300 text-sm mt-2 ml-4">
                  <li>• Remove all player saves</li>
                  <li>• Delete all backups</li>
                  <li>• Clear all settings</li>
                  <li>• Reset the game to initial state</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="btn btn-danger flex-1"
                >
                  {isClearing ? (
                    <div className="flex items-center justify-center">
                      <div className="loading" style={{ marginRight: '8px' }}></div>
                      Clearing...
                    </div>
                  ) : (
                    '🗑️ Yes, Delete Everything'
                  )}
                </button>
                <button
                  onClick={cancelClear}
                  disabled={isClearing}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
