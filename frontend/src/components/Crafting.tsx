import { useGame } from '../contexts/GameContext'

export function Crafting() {
  const { player } = useGame()

  if (!player) {
    return (
      <div className="text-center text-secondary">
        <div className="loading" style={{ margin: '0 auto 16px' }}></div>
        Loading crafting...
      </div>
    )
  }

  return (
    <div>
      <div className="text-center text-secondary">
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔨</div>
        <div>Crafting system coming soon...</div>
        <div className="text-sm mt-2">
          Create items using materials and recipes
        </div>
      </div>
    </div>
  )
}
