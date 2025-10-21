import { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'

interface City {
  id: number
  name: string
  type: 'street' | 'city' | 'country'
  country: string
  city: string
  street?: string
  description: string
  requirements?: {
    level?: number
    reputation?: number
    currency?: number
  }
}

const AVAILABLE_CITIES: City[] = [
  {
    id: 1,
    name: 'Main Street',
    type: 'street',
    country: 'Aetheria',
    city: 'Newhaven',
    street: 'Main Street',
    description: 'The bustling main thoroughfare of Newhaven',
  },
  {
    id: 2,
    name: 'Market Square',
    type: 'street',
    country: 'Aetheria',
    city: 'Newhaven',
    street: 'Market Square',
    description: 'Where traders gather to sell their wares',
  },
  {
    id: 3,
    name: 'Newhaven',
    type: 'city',
    country: 'Aetheria',
    city: 'Newhaven',
    description: 'A prosperous trading city in Aetheria',
    requirements: { level: 2 }
  },
  {
    id: 4,
    name: 'Crystal Harbor',
    type: 'city',
    country: 'Aetheria',
    city: 'Crystal Harbor',
    description: 'A coastal city known for its crystal trade',
    requirements: { level: 3, reputation: 2.0 }
  },
  {
    id: 5,
    name: 'Aetheria',
    type: 'country',
    country: 'Aetheria',
    city: 'Aetheria',
    description: 'The great kingdom of Aetheria',
    requirements: { level: 5, reputation: 5.0, currency: 10000 }
  },
  {
    id: 6,
    name: 'Shadowmere',
    type: 'city',
    country: 'Aetheria',
    city: 'Shadowmere',
    description: 'A mysterious city shrouded in legend',
    requirements: { level: 8, reputation: 8.0 }
  }
]

export function CitySelector() {
  const { player, movePlayerWithProof, isLoading } = useGame()
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)
  const [proofCache, setProofCache] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  // Load proof cache from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('zkgame_proof_cache')
    if (cached) {
      try {
        setProofCache(JSON.parse(cached))
      } catch (e) {
        console.error('Failed to load proof cache:', e)
      }
    }
  }, [])

  // Save proof cache to localStorage
  const saveProofCache = (cityId: number) => {
    const newCache = { ...proofCache, [cityId]: true }
    setProofCache(newCache)
    localStorage.setItem('zkgame_proof_cache', JSON.stringify(newCache))
  }

  // Check if player meets requirements for a city
  const canVisitCity = (city: City): boolean => {
    if (!player) return false
    if (!city.requirements) return true

    const { level, reputation, currency } = city.requirements
    const playerLevel = Math.floor(player.experience / 100) + 1

    if (level && playerLevel < level) return false
    if (reputation && player.reputation < reputation) return false
    if (currency && player.currency < currency) return false

    return true
  }

  // Get available cities (filtered by requirements)
  const availableCities = AVAILABLE_CITIES.filter(city => canVisitCity(city))

  // Handle city selection and movement
  const handleCitySelect = async (cityId: number) => {
    if (!player) return

    setSelectedCityId(cityId)
    setError(null)

    const city = AVAILABLE_CITIES.find(c => c.id === cityId)
    if (!city) return

    // Check if we already have a proof for this city
    const hasProof = proofCache[cityId]
    
    try {
      setIsGeneratingProof(true)
      
      if (hasProof) {
        console.log(`Using cached proof for ${city.name}`)
        // Use cached proof - just move without generating new proof
        await movePlayerWithProof(cityId, city.type)
      } else {
        console.log(`Generating new proof for ${city.name}`)
        // Generate new proof and move
        await movePlayerWithProof(cityId, city.type)
        // Cache the proof for future visits
        saveProofCache(cityId)
      }
      
      console.log(`Successfully moved to ${city.name}`)
    } catch (err) {
      console.error('Failed to move to city:', err)
      setError(err instanceof Error ? err.message : 'Failed to move to city')
    } finally {
      setIsGeneratingProof(false)
    }
  }

  if (!player) {
    return (
      <div className="text-center text-secondary">
        <div className="loading" style={{ margin: '0 auto 16px' }}></div>
        Loading cities...
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-primary mb-4">
        🗺️ Travel to New Location
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Select Destination
          </label>
          <select
            value={selectedCityId || ''}
            onChange={(e) => {
              const cityId = parseInt(e.target.value)
              if (cityId) handleCitySelect(cityId)
            }}
            disabled={isLoading || isGeneratingProof}
            className="input w-full"
          >
            <option value="">Choose a destination...</option>
            {availableCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} {proofCache[city.id] ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedCityId && (
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
            {(() => {
              const city = AVAILABLE_CITIES.find(c => c.id === selectedCityId)
              if (!city) return null
              
              return (
                <div>
                  <div className="text-sm font-medium text-primary mb-1">
                    {city.name}
                  </div>
                  <div className="text-xs text-secondary mb-2">
                    {city.description}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary">
                      {city.country} → {city.city}
                      {city.street && ` → ${city.street}`}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      proofCache[city.id] 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {proofCache[city.id] ? 'Proof Cached' : 'New Proof Needed'}
                    </span>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {isGeneratingProof && (
          <div className="flex items-center justify-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="loading" style={{ marginRight: '8px' }}></div>
            <span className="text-sm text-blue-400">
              {proofCache[selectedCityId!] ? 'Using cached proof...' : 'Generating proof...'}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="text-xs text-secondary">
          <div className="mb-1">💡 Travel Tips:</div>
          <div>• ✓ = Proof already cached (instant travel)</div>
          <div>• New locations require proof generation</div>
          <div>• Higher level locations have requirements</div>
        </div>
      </div>
    </div>
  )
}
