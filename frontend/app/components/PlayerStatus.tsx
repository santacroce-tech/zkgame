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
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Player Status</h3>
      
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-400">Name</div>
          <div className="font-medium">{player.name}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Level</div>
          <div className="font-medium">Level {Math.floor(player.experience / 100) + 1}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Experience</div>
          <div className="font-medium">{player.experience} XP</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Currency</div>
          <div className="font-medium text-game-accent">{player.currency} coins</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Reputation</div>
          <div className="font-medium">{player.reputation.toFixed(2)}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Location</div>
          <div className="font-medium">
            {player.position.city}, {player.position.country}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Explored Areas</div>
          <div className="font-medium">{player.exploredCells.length}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Owned Stores</div>
          <div className="font-medium">{player.ownedStores.length}/10</div>
        </div>
        
        <div className="pt-3 border-t border-game-border">
          <button
            onClick={handleClaimRewards}
            disabled={!canClaimRewards || isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {canClaimRewards ? 'Claim Rewards' : `Wait ${hoursUntilClaim}h`}
          </button>
        </div>
      </div>
    </div>
  )
}
