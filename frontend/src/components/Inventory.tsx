import { useGame } from '../contexts/GameContext'

export function Inventory() {
  const { player } = useGame()

  if (!player) {
    return (
      <div className="text-center text-secondary">
        <div className="loading" style={{ margin: '0 auto 16px' }}></div>
        Loading inventory...
      </div>
    )
  }

  const inventory = player.inventory || {}
  const inventoryItems = Object.entries(inventory)
  
  console.log('Inventory component - player:', player)
  console.log('Inventory component - inventory:', inventory)
  console.log('Inventory component - inventoryItems:', inventoryItems)

  return (
    <div>
      {inventoryItems.length === 0 ? (
        <div className="text-center text-secondary">
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
          <div>Your inventory is empty</div>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: '8px' }}>
          {inventoryItems.map(([itemName, quantity], index) => (
            <div 
              key={index}
              style={{
                padding: '8px',
                background: 'rgba(55, 65, 81, 0.5)',
                borderRadius: '6px',
                border: '1px solid #4b5563'
              }}
            >
              <div className="text-sm font-medium text-primary">{itemName}</div>
              <div className="text-xs text-secondary">Qty: {quantity as number}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
