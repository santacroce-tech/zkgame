import { useGame } from '../contexts/GameContext'

export function PlayerStatus() {
  const { player } = useGame()

  if (!player) {
    return (
      <div className="text-center text-secondary">
        <div className="loading" style={{ margin: '0 auto 16px' }}></div>
        Loading player data...
      </div>
    )
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
    </div>
  )
}
