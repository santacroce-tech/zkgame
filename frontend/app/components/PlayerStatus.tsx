'use client'

import { useGame } from '../contexts/GameContext'

export function PlayerStatus() {
  const { player, claimRewards, isLoading } = useGame()

  if (!player) return null

  const canClaimRewards = Date.now() - player.lastClaimTime >= 3600000 // 1 hour
  const timeUntilNextClaim = Math.max(0, 3600000 - (Date.now() - player.lastClaimTime))
  const hoursUntilClaim = Math.ceil(timeUntilNextClaim / 3600000)

  const handleClaimRewards = async () => {
    if (canClaimRewards) {
      await claimRewards()
    }
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Player Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-700 p-3 rounded-lg border border-dark-600">
          <div className="text-xs text-secondary font-medium">Level</div>
          <div className="text-primary font-bold text-xl">{Math.floor(player.experience / 100) + 1}</div>
        </div>
        
        <div className="bg-dark-700 p-3 rounded-lg border border-dark-600">
          <div className="text-xs text-secondary font-medium">XP</div>
          <div className="text-primary font-bold text-xl">{player.experience}</div>
        </div>
        
        <div className="bg-dark-700 p-3 rounded-lg border border-dark-600">
          <div className="text-xs text-secondary font-medium">Coins</div>
          <div className="text-accent font-bold text-xl">{player.currency}</div>
        </div>
        
        <div className="bg-dark-700 p-3 rounded-lg border border-dark-600">
          <div className="text-xs text-secondary font-medium">Reputation</div>
          <div className="text-primary font-bold text-xl">{player.reputation.toFixed(1)}</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-secondary mb-2">
            <span className="font-medium">Experience Progress</span>
            <span className="font-bold">{player.experience % 100}/100</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(player.experience % 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex justify-between items-center py-2 px-3 bg-dark-700 rounded-lg border border-dark-600">
          <span className="text-secondary">Explored:</span>
          <span className="text-primary font-bold">{player.exploredAreas?.length || 0}</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-dark-700 rounded-lg border border-dark-600">
          <span className="text-secondary">Stores:</span>
          <span className="text-primary font-bold">{player.ownedStores?.length || 0}/10</span>
        </div>
      </div>

      {/* Location */}
      <div className="bg-dark-700 p-3 rounded-lg border border-dark-600">
        <div className="text-xs text-secondary font-medium mb-1 flex items-center">
          <span className="mr-1">📍</span>
          Current Location
        </div>
        <div className="text-primary font-bold text-sm">
          {player.position?.city || 'Unknown'}, {player.position?.country || 'Unknown'}
        </div>
      </div>
      
      {/* Claim Rewards Button - Fixed spacing */}
      <div className="pt-3">
        <button
          onClick={handleClaimRewards}
          disabled={!canClaimRewards || isLoading}
          className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-3"
        >
          {canClaimRewards ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">🎁</span>
              Claim Rewards
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="loading w-4 h-4 mr-2"></div>
              Wait {hoursUntilClaim}h
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
