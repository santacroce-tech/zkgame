const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { ethers } = require('ethers')
const path = require('path')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Contract addresses (from hardhat deployment)
const CONTRACT_ADDRESSES = {
  GameCore: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  StateManager: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  ProofVerifier: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
}

// Connect to local Hardhat network
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

// Load contract ABIs
const gameCoreABI = require('../artifacts/contracts/GameCore.sol/GameCore.json').abi
const stateManagerABI = require('../artifacts/contracts/StateManager.sol/StateManager.json').abi
const proofVerifierABI = require('../artifacts/contracts/ProofVerifier.sol/ProofVerifier.json').abi

// Initialize contracts
const gameCore = new ethers.Contract(CONTRACT_ADDRESSES.GameCore, gameCoreABI, provider)
const stateManager = new ethers.Contract(CONTRACT_ADDRESSES.StateManager, stateManagerABI, provider)
const proofVerifier = new ethers.Contract(CONTRACT_ADDRESSES.ProofVerifier, proofVerifierABI, provider)

// Store connected players
const connectedPlayers = new Map()

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.on('player_join', (playerData) => {
    console.log('Player joined:', playerData)
    connectedPlayers.set(socket.id, {
      ...playerData,
      socketId: socket.id,
      lastSeen: Date.now()
    })
    
    // Broadcast to other players
    socket.broadcast.emit('player_joined', playerData)
    
    // Send current players to new player
    const players = Array.from(connectedPlayers.values())
    socket.emit('players_list', players)
  })

  socket.on('player_move', (moveData) => {
    console.log('Player moved:', moveData)
    
    // Update player position
    const player = connectedPlayers.get(socket.id)
    if (player) {
      player.position = moveData.position
      player.lastSeen = Date.now()
      
      // Broadcast to other players
      socket.broadcast.emit('player_moved', {
        playerId: player.playerId,
        position: moveData.position
      })
    }
  })

  socket.on('chat_message', (messageData) => {
    console.log('Chat message:', messageData)
    
    const player = connectedPlayers.get(socket.id)
    if (player) {
      const chatMessage = {
        playerId: player.playerId,
        playerName: player.name,
        message: messageData.message,
        timestamp: Date.now()
      }
      
      // Broadcast to all players
      io.emit('chat_message', chatMessage)
    }
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
    
    const player = connectedPlayers.get(socket.id)
    if (player) {
      // Broadcast player left
      socket.broadcast.emit('player_left', {
        playerId: player.playerId,
        playerName: player.name
      })
      
      connectedPlayers.delete(socket.id)
    }
  })
})

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.get('/api/contracts', (req, res) => {
  res.json(CONTRACT_ADDRESSES)
})

app.get('/api/players', (req, res) => {
  const players = Array.from(connectedPlayers.values())
  res.json(players)
})

app.post('/api/game/move', async (req, res) => {
  try {
    const { playerId, fromX, fromY, toX, toY, proof } = req.body
    
    // In a real implementation, you would:
    // 1. Verify the proof using snarkjs
    // 2. Submit the transaction to the smart contract
    // 3. Wait for confirmation
    
    console.log('Move request:', { playerId, fromX, fromY, toX, toY })
    
    // For now, just return success
    res.json({ success: true, transactionHash: '0x' + Date.now().toString(16) })
  } catch (error) {
    console.error('Move error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/game/craft', async (req, res) => {
  try {
    const { playerId, recipeName, proof } = req.body
    
    console.log('Craft request:', { playerId, recipeName })
    
    // In a real implementation, you would verify the proof and submit to contract
    res.json({ success: true, craftId: `craft_${playerId}_${Date.now()}` })
  } catch (error) {
    console.error('Craft error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/game/claim', async (req, res) => {
  try {
    const { playerId, proof } = req.body
    
    console.log('Claim request:', { playerId })
    
    // In a real implementation, you would verify the proof and submit to contract
    res.json({ success: true, rewardAmount: 100 })
  } catch (error) {
    console.error('Claim error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/game/gather', async (req, res) => {
  try {
    const { playerId, resourceType, quantity, proof } = req.body
    
    console.log('Gather request:', { playerId, resourceType, quantity })
    
    // In a real implementation, you would verify the proof and submit to contract
    res.json({ success: true, gatheredAmount: quantity })
  } catch (error) {
    console.error('Gather error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/out')))

// Catch all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/out/index.html'))
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 ZKGame backend server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready for connections`)
  console.log(`🔗 Contract addresses:`, CONTRACT_ADDRESSES)
})
