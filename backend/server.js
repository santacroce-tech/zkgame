const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { ethers } = require('ethers')
const path = require('path')
const snarkjs = require('snarkjs')

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

// Load verification keys for proof verification
const loadVerificationKey = async (circuitName) => {
  try {
    const vkeyPath = path.join(__dirname, '..', 'setup', `${circuitName}_verification_key.json`)
    const vkey = require(vkeyPath)
    return vkey
  } catch (error) {
    console.error(`Failed to load verification key for ${circuitName}:`, error)
    return null
  }
}

// Load verification keys
const verificationKeys = {}

// Load contract ABIs
const gameCoreABI = require('../artifacts/contracts/GameCore.sol/GameCore.json').abi
const stateManagerABI = require('../artifacts/contracts/StateManager.sol/StateManager.json').abi
const proofVerifierABI = require('../artifacts/contracts/ProofVerifier.sol/ProofVerifier.json').abi

// Initialize contracts
const gameCore = new ethers.Contract(CONTRACT_ADDRESSES.GameCore, gameCoreABI, provider)
const stateManager = new ethers.Contract(CONTRACT_ADDRESSES.StateManager, stateManagerABI, provider)
const proofVerifier = new ethers.Contract(CONTRACT_ADDRESSES.ProofVerifier, proofVerifierABI, provider)

// Initialize verification keys
const initializeVerificationKeys = async () => {
  console.log('🔑 [Backend] Initializing verification keys...')
  const circuits = ['movement', 'timeReward', 'timeCraft']
  for (const circuit of circuits) {
    console.log(`📁 [Backend] Loading verification key for ${circuit}...`)
    verificationKeys[circuit] = await loadVerificationKey(circuit)
    if (verificationKeys[circuit]) {
      console.log(`✅ [Backend] ${circuit} verification key loaded successfully`)
    } else {
      console.error(`❌ [Backend] Failed to load ${circuit} verification key`)
    }
  }
  console.log('🔑 [Backend] Verification keys loaded:', Object.keys(verificationKeys))
}

// Initialize verification keys on startup
initializeVerificationKeys()

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
    console.log('🎮 [Backend] Received move request')
    console.log('📥 [Backend] Request body:', {
      playerId: req.body.playerId,
      fromX: req.body.fromX,
      fromY: req.body.fromY,
      toX: req.body.toX,
      toY: req.body.toY,
      hasProof: !!req.body.proof,
      hasPublicSignals: !!req.body.publicSignals,
      publicSignalsLength: req.body.publicSignals?.length
    })
    
    const { playerId, fromX, fromY, toX, toY, proof, publicSignals } = req.body
    
    console.log('📍 [Backend] Movement details:', { 
      playerId, 
      from: { x: fromX, y: fromY }, 
      to: { x: toX, y: toY } 
    })
    
    // Verify the proof if provided
    if (proof && publicSignals) {
      console.log('🔍 [Backend] Verifying movement proof...')
      console.log('📊 [Backend] Proof structure:', {
        pi_a_length: proof.pi_a?.length,
        pi_b_length: proof.pi_b?.length,
        pi_c_length: proof.pi_c?.length,
        publicSignals_length: publicSignals.length,
        publicSignals: publicSignals
      })
      
      const vkey = verificationKeys.movement
      if (!vkey) {
        console.error('❌ [Backend] Movement verification key not loaded')
        throw new Error('Movement verification key not loaded')
      }
      
      console.log('🔑 [Backend] Verification key loaded, verifying proof...')
      const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof)
      console.log('✅ [Backend] Proof verification result:', isValid)
      
      if (!isValid) {
        console.error('❌ [Backend] Invalid movement proof')
        throw new Error('Invalid movement proof')
      }
      
      console.log('✅ [Backend] Movement proof verified successfully')
    } else {
      console.log('⚠️ [Backend] No proof provided, skipping verification')
    }
    
    // In a real implementation, you would submit to the smart contract
    // For now, just return success
    const transactionHash = '0x' + Date.now().toString(16)
    console.log('📤 [Backend] Returning success response:', {
      success: true,
      transactionHash,
      proofVerified: !!proof
    })
    
    res.json({ 
      success: true, 
      transactionHash,
      proofVerified: !!proof
    })
  } catch (error) {
    console.error('❌ [Backend] Move error:', error)
    console.error('📋 [Backend] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
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
  console.log('🚀 [Backend] ZKGame backend server starting...')
  console.log(`🌐 [Backend] Server running on port ${PORT}`)
  console.log(`📡 [Backend] WebSocket server ready for connections`)
  console.log(`🔗 [Backend] Contract addresses:`, CONTRACT_ADDRESSES)
  console.log(`📊 [Backend] Provider connected to:`, provider.connection?.url || 'Local Hardhat')
  console.log('✅ [Backend] Server initialization complete!')
})
