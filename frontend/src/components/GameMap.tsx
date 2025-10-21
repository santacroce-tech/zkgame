
export function GameMap() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af'
    }}>
      <div className="text-center">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
        <div className="text-lg">Game Map</div>
        <div className="text-sm">Interactive world coming soon...</div>
      </div>
    </div>
  )
}
