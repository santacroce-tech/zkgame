'use client'

import { useGame } from '../contexts/GameContext'
import { useState, useEffect } from 'react'
import macroMapData from '../../../config/macro_map.json'

interface Area {
  id: number
  name: string
  type: 'street' | 'city' | 'country'
  description: string
  connections: number[]
  resources: string[]
  features: string[]
}

export function GameMap() {
  const { 
    player, 
    movePlayer, 
    movePlayerWithProof, 
    isLoading, 
    isGeneratingProof, 
    proofGenerationProgress, 
    currentProofStep,
    isContractInitialized 
  } = useGame()
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [useProofMovement, setUseProofMovement] = useState(true)
  const [areas] = useState<Area[]>(macroMapData.areas as Area[])

  if (!player) return null

  // Get current area from player position (assuming player.position now contains areaId)
  const currentArea = areas.find(area => Number(area.id) === player.position?.areaId) || areas[0]
  
  const handleAreaClick = async (area: Area) => {
    if (isLoading || isGeneratingProof) return
    
    // Check if area is connected to current area or previously explored
    const isConnected = currentArea.connections.includes(area.id)
    const isExplored = player.exploredAreas?.some((exploredArea: { id: number }) => exploredArea.id === area.id)
    
    if (isConnected || isExplored) {
      const areaId = Number(area.id)
      if (isValidAreaType(area.type)) {
        const areaType: 'street' | 'city' | 'country' = area.type
        if (useProofMovement && isContractInitialized) {
          await movePlayerWithProof(areaId, areaType)
        } else {
          await movePlayer(areaId, areaType)
        }
      }
    } else {
      setSelectedArea(area)
    }
  }

  const getAreaTypeColor = (type: string) => {
    switch (type) {
      case 'street':
        return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700'
      case 'city':
        return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
      case 'country':
        return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700'
      default:
        return 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
    }
  }

  const getAreaTypeIcon = (type: string) => {
    switch (type) {
      case 'street':
        return '🏘️'
      case 'city':
        return '🏙️'
      case 'country':
        return '🏰'
      default:
        return '📍'
    }
  }

  const isValidAreaType = (type: string): type is 'street' | 'city' | 'country' => {
    return type === 'street' || type === 'city' || type === 'country'
  }

  const renderArea = (area: Area) => {
    const isCurrentArea = Number(area.id) === currentArea.id
    const isConnected = currentArea.connections.includes(Number(area.id))
    const isExplored = player.exploredAreas?.some((exploredArea: { id: number }) => exploredArea.id === Number(area.id))
    const isSelected = selectedArea?.id === Number(area.id)
    const canMove = isConnected || isExplored

    let areaClass = `p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${getAreaTypeColor(area.type)}`
    
    if (isCurrentArea) {
      areaClass += ' ring-4 ring-yellow-400 ring-opacity-75 bg-yellow-100 dark:bg-yellow-900'
    } else if (isSelected) {
      areaClass += ' ring-4 ring-blue-400 ring-opacity-75'
    } else if (!canMove) {
      areaClass += ' opacity-50 cursor-not-allowed'
    }

    return (
      <div
        key={area.id}
        className={areaClass}
        onClick={() => handleAreaClick(area)}
        title={area.description}
      >
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{getAreaTypeIcon(area.type)}</span>
          <div>
            <h3 className="font-semibold text-lg">{area.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{area.type}</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          {area.description}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {area.resources.slice(0, 3).map((resource, index) => (
            <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              {resource}
            </span>
          ))}
          {area.resources.length > 3 && (
            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              +{area.resources.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {area.features.slice(0, 2).map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-xs">
              {feature}
            </span>
          ))}
          {area.features.length > 2 && (
            <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-xs">
              +{area.features.length - 2}
            </span>
          )}
        </div>
        
        {isCurrentArea && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
              Current Location
            </span>
          </div>
        )}
      </div>
    )
  }

  // Get available movement options
  const getAvailableDestinations = () => {
    const connectedAreas = currentArea.connections.map(id => 
      areas.find(area => area.id === id)
    ).filter(Boolean)
    
    const exploredAreas = player.exploredAreas?.map((exploredArea: { id: number }) => 
      areas.find(area => area.id === exploredArea.id)
    ).filter(Boolean) || []
    
    // Combine and deduplicate
    const allAvailable = [...connectedAreas, ...exploredAreas]
    const uniqueAreas = allAvailable.filter((area, index, self) => 
      index === self.findIndex(a => a?.id === area?.id)
    )
    
    return uniqueAreas.sort((a, b) => a!.name.localeCompare(b!.name))
  }

  const availableDestinations = getAvailableDestinations()

  const handleDestinationSelect = async (areaId: number) => {
    if (isLoading || isGeneratingProof) return
    
    const area = areas.find(a => a.id === areaId)
    if (!area || !isValidAreaType(area.type)) return
    
    const areaType: 'street' | 'city' | 'country' = area.type
    if (useProofMovement && isContractInitialized) {
      await movePlayerWithProof(areaId, areaType)
    } else {
      await movePlayer(areaId, areaType)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Current Location Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getAreaTypeIcon(currentArea.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-primary">{currentArea.name}</h3>
              <p className="text-sm text-secondary capitalize">{currentArea.type}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-secondary">Current Location</div>
            <div className="text-sm font-medium text-primary">
              {currentArea.description}
            </div>
          </div>
        </div>
      </div>

      {/* Movement Controls */}
      <div className="mb-6 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
          <h3 className="text-sm font-semibold text-primary">Travel to New Location</h3>
          <div className="flex items-center space-x-3">
            <label className="text-xs text-secondary font-medium">ZK Proof Mode</label>
            <input
              type="checkbox"
              checked={useProofMovement}
              onChange={(e) => setUseProofMovement(e.target.checked)}
              disabled={!isContractInitialized}
              className="w-4 h-4 rounded border-2 border-primary-500 bg-white dark:bg-secondary-700 text-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
        
        {/* Destination Selector */}
        <div className="mb-4">
          <label className="block text-xs text-secondary font-medium mb-2">
            Choose Destination:
          </label>
          <select
            onChange={(e) => {
              const areaId = parseInt(e.target.value)
              if (areaId) {
                handleDestinationSelect(areaId)
                e.target.value = '' // Reset selection
              }
            }}
            disabled={isLoading || isGeneratingProof || availableDestinations.length === 0}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {availableDestinations.length === 0 
                ? 'No destinations available' 
                : 'Select a destination...'
              }
            </option>
            {availableDestinations.map((area) => (
              <option key={area!.id} value={area!.id}>
                {getAreaTypeIcon(area!.type)} {area!.name} ({area!.type})
              </option>
            ))}
          </select>
        </div>
        
        {/* Proof Generation Status */}
        {isGeneratingProof && (
          <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-700 dark:text-primary-300 text-xs font-medium">Generating ZK Proof...</span>
              <span className="text-primary-600 dark:text-primary-400 text-xs font-medium">{proofGenerationProgress}%</span>
            </div>
            <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${proofGenerationProgress}%` }}
              ></div>
            </div>
            <p className="text-primary-600 dark:text-primary-400 text-xs">{currentProofStep}</p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-xs text-secondary mb-3">
            Select a destination from the dropdown to travel there
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">🏘️ Streets</span>
            <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded">🏙️ Cities</span>
            <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 rounded">🏰 Countries</span>
          </div>
        </div>
      </div>

      {/* Available Areas Preview */}
      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-semibold text-primary mb-3">Available Destinations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableDestinations.map((area) => {
            const isCurrentArea = area!.id === currentArea.id
            return (
              <div
                key={area!.id}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${getAreaTypeColor(area!.type)} ${
                  isCurrentArea ? 'ring-2 ring-yellow-400 opacity-75' : 'hover:shadow-md cursor-pointer'
                }`}
                onClick={() => !isCurrentArea && handleDestinationSelect(area!.id)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">{getAreaTypeIcon(area!.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{area!.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{area!.type}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                  {area!.description}
                </p>
                {isCurrentArea && (
                  <div className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                      Current Location
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
