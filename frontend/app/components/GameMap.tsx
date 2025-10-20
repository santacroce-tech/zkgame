'use client'

import { useGame } from '../contexts/GameContext'
import { useState } from 'react'

export function GameMap() {
  const { player, movePlayer, isLoading } = useGame()
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null)

  if (!player) return null

  const mapSize = 21 // 21x21 grid
  const center = Math.floor(mapSize / 2)
  
  const handleCellClick = async (x: number, y: number) => {
    if (isLoading) return
    
    const distance = Math.abs(x - player.position.x) + Math.abs(y - player.position.y)
    if (distance <= 1 || player.exploredCells.some((cell: { x: number; y: number }) => cell.x === x && cell.y === y)) {
      await movePlayer(x, y)
    } else {
      setSelectedCell({ x, y })
    }
  }

  const renderCell = (x: number, y: number) => {
    const isPlayerPosition = x === player.position.x && y === player.position.y
    const isExplored = player.exploredCells.some((cell: { x: number; y: number }) => cell.x === x && cell.y === y)
    const isAdjacent = Math.abs(x - player.position.x) + Math.abs(y - player.position.y) === 1
    const isSelected = selectedCell?.x === x && selectedCell?.y === y

    let cellClass = 'w-8 h-8 border border-gray-600 cursor-pointer transition-colors '
    
    if (isPlayerPosition) {
      cellClass += 'bg-game-accent border-game-accent '
    } else if (isExplored) {
      cellClass += 'bg-gray-700 hover:bg-gray-600 '
    } else if (isAdjacent) {
      cellClass += 'bg-gray-800 hover:bg-gray-700 '
    } else {
      cellClass += 'bg-gray-900 cursor-not-allowed '
    }

    if (isSelected) {
      cellClass += 'ring-2 ring-yellow-400 '
    }

    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        onClick={() => handleCellClick(x, y)}
        title={`(${x}, ${y})`}
      >
        {isPlayerPosition && (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
            P
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">World Map</h2>
        <div className="text-sm text-gray-400">
          Position: ({player.position.x}, {player.position.y})
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-21 gap-1 justify-center">
          {Array.from({ length: mapSize }, (_, row) =>
            Array.from({ length: mapSize }, (_, col) => {
              const x = col - center
              const y = row - center
              return renderCell(x, y)
            })
          )}
        </div>
      </div>
      
      {selectedCell && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Cannot move to ({selectedCell.x}, {selectedCell.y}). 
            You can only move to adjacent cells or previously explored areas.
          </p>
          <button
            onClick={() => setSelectedCell(null)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
