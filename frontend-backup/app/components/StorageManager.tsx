'use client'

import { useGame } from '../contexts/GameContext'
import { useState, useRef } from 'react'

export function StorageManager() {
  const { 
    player, 
    exportPlayerData, 
    importPlayerData, 
    getAllStoredPlayers, 
    getBackups, 
    getStorageInfo, 
    clearAllData, 
    restoreFromBackup,
    isLoading,
    setError 
  } = useGame()
  
  const [showImport, setShowImport] = useState(false)
  const [importData, setImportData] = useState('')
  const [showBackups, setShowBackups] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const data = exportPlayerData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zkgame-save-${player?.name || 'player'}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export data')
    }
  }

  const handleImport = () => {
    try {
      const result = importPlayerData(importData)
      if (result.success) {
        setImportData('')
        setShowImport(false)
        setError(null)
      } else {
        setError(result.error || 'Import failed')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import data')
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportData(content)
      }
      reader.readAsText(file)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    const result = await restoreFromBackup(backupId)
    if (!result.success) {
      setError(result.error || 'Failed to restore backup')
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL saved data? This cannot be undone!')) {
      const success = clearAllData()
      if (!success) {
        setError('Failed to clear data')
      }
    }
  }

  const storageInfo = getStorageInfo()
  const backups = getBackups()
  const allPlayers = getAllStoredPlayers()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Storage Info */}
      <div className="bg-secondary-50 dark:bg-secondary-700 p-4 rounded-lg border border-secondary-200 dark:border-secondary-600">
        <h3 className="text-sm font-semibold text-primary mb-3">Storage Information</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-secondary">Total Size:</span>
            <span className="text-primary font-medium">{formatBytes(storageInfo.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Saved Players:</span>
            <span className="text-primary font-medium">{storageInfo.players}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Backups:</span>
            <span className="text-primary font-medium">{storageInfo.backups}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Current Player:</span>
            <span className="text-primary font-medium">{player?.name || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Export/Import Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            disabled={!player || isLoading}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📤 Export Save
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            className="btn-secondary text-sm"
          >
            📥 Import Save
          </button>
        </div>

        {showImport && (
          <div className="space-y-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600">
            <div>
              <label className="block text-xs text-secondary font-medium mb-2">
                Import from file:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary font-medium mb-2">
                Or paste JSON data:
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your save data here..."
                className="w-full h-20 px-2 py-1 text-xs border border-secondary-300 dark:border-secondary-600 rounded bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={!importData.trim() || isLoading}
                className="btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setShowImport(false)
                  setImportData('')
                }}
                className="btn-outline text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backups */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">Backups</h3>
          <button
            onClick={() => setShowBackups(!showBackups)}
            className="text-xs text-secondary hover:text-primary"
          >
            {showBackups ? 'Hide' : 'Show'} ({backups.length})
          </button>
        </div>

        {showBackups && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {backups.length === 0 ? (
              <div className="text-xs text-secondary text-center py-2">
                No backups available
              </div>
            ) : (
              backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-800 rounded border border-secondary-200 dark:border-secondary-600"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-primary truncate">
                      {backup.playerName}
                    </div>
                    <div className="text-xs text-secondary">
                      {formatDate(backup.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestoreBackup(backup.id)}
                    disabled={isLoading}
                    className="btn-outline text-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Restore
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* All Players */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary">All Saved Players</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {Object.keys(allPlayers).length === 0 ? (
            <div className="text-xs text-secondary text-center py-2">
              No saved players
            </div>
          ) : (
            Object.entries(allPlayers).map(([walletAddress, playerData]) => (
              <div
                key={walletAddress}
                className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-800 rounded border border-secondary-200 dark:border-secondary-600"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-primary truncate">
                    {playerData.name}
                  </div>
                  <div className="text-xs text-secondary truncate">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </div>
                </div>
                <div className="text-xs text-secondary">
                  Lv.{Math.floor(playerData.experience / 100) + 1}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <button
          onClick={handleClearAll}
          className="btn-outline text-xs w-full text-danger-600 dark:text-danger-400 border-danger-300 dark:border-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
        >
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  )
}
