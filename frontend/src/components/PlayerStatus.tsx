import { useGame } from '../contexts/GameContext'
import { useState } from 'react'

export function PlayerStatus() {
  const { player, claimRewards, isLoading, isGeneratingProof, proofGenerationProgress, currentProofStep } = useGame()
  const [claimSuccess, setClaimSuccess] = useState(false)

  if (!player) {
    return (
      <div className="text-center text-secondary">
        <div className="loading" style={{ margin: '0 auto 16px' }}></div>
        Loading player data...
      </div>
    )
  }

  // TEMPORARY: Testing mode - 1 minute cooldown instead of 1 hour
  const COOLDOWN_TIME = 60000 // 1 minute
  const canClaimRewards = Date.now() - player.lastClaimTime >= COOLDOWN_TIME
  const timeUntilNextClaim = Math.max(0, COOLDOWN_TIME - (Date.now() - player.lastClaimTime))
  const secondsUntilClaim = Math.ceil(timeUntilNextClaim / 1000)
  
  // Debug logging
  console.log('PlayerStatus Debug:', {
    lastClaimTime: player.lastClaimTime,
    currentTime: Date.now(),
    timeElapsed: Date.now() - player.lastClaimTime,
    canClaimRewards,
    secondsUntilClaim,
    isLoading,
    testingMode: true
  })

  const handleClaimRewards = async () => {
    console.log('Claim button clicked!', { canClaimRewards, isLoading })
    if (canClaimRewards) {
      console.log('Calling claimRewards...')
      try {
        await claimRewards()
        setClaimSuccess(true)
        // Hide success message after 3 seconds
        setTimeout(() => setClaimSuccess(false), 3000)
      } catch (error) {
        console.error('Claim failed:', error)
      }
    } else {
      console.log('Cannot claim rewards yet')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
        <div>
          <div className="text-sm text-secondary">Level</div>
          <div className="text-2xl font-bold text-primary">
            {Math.floor(player.experience / 100) + 1}
          </div>
        </div>
        <div>
          <div className="text-sm text-secondary">Coins</div>
          <div className="text-2xl font-bold text-accent">
            {player.currency || 0}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
        <div>
          <div className="text-sm text-secondary">Experience</div>
          <div className="text-lg font-semibold text-primary">
            {player.experience || 0}
          </div>
        </div>
        <div>
          <div className="text-sm text-secondary">Reputation</div>
          <div className="text-lg font-semibold text-primary">
            {(player.reputation || 0).toFixed(1)}
          </div>
        </div>
      </div>
      
      {player.position && (
        <div>
          <div className="text-sm text-secondary">Location</div>
          <div className="text-sm text-primary">
            {player.position.city}, {player.position.country}
          </div>
        </div>
      )}

      {/* Claim Rewards Button */}
      <div className="pt-3">
        <button
          onClick={handleClaimRewards}
          disabled={!canClaimRewards || isLoading || isGeneratingProof}
          className="btn btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-3"
        >
          {isGeneratingProof ? (
            <div className="flex items-center justify-center">
              <div className="loading w-4 h-4 mr-2"></div>
              Generating Proof...
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center">
              <div className="loading w-4 h-4 mr-2"></div>
              Claiming...
            </div>
          ) : canClaimRewards ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">🎁</span>
              Claim Rewards
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="loading w-4 h-4 mr-2"></div>
              Wait {secondsUntilClaim}s (Testing)
            </div>
          )}
        </button>
        
        {/* Progress indicator for 2-phase claim process */}
        {isGeneratingProof && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">
              {currentProofStep}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${proofGenerationProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {proofGenerationProgress < 50 ? 'Phase 1: Generating Proof' : 'Phase 2: Submitting to Contract'}
            </div>
          </div>
        )}
      </div>

      {/* Testing Mode Indicator */}
      <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30 text-yellow-400 text-xs">
        🧪 Testing Mode: 1-minute cooldown
      </div>

      {claimSuccess && (
        <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30 text-green-400 text-sm">
          ✅ Rewards claimed successfully! Check the console for transaction details.
        </div>
      )}
    </div>
  )
}
