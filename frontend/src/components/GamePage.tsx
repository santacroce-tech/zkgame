import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi'
import { useGame } from '../contexts/GameContext'
import { useSocket } from '../contexts/SocketContext'
import { GameMap } from './GameMap'
import { PlayerStatus } from './PlayerStatus'
import { Inventory } from './Inventory'
import { Crafting } from './Crafting'
import { Chat } from './Chat'
import { StorageManager } from './StorageManager'
import { ethers } from 'ethers'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hardhat, localhost, mainnet, polygon, arbitrum, optimism } from 'viem/chains'

export default function GamePage() {
  const { address, isConnected: walletConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { 
    player, 
    isInitialized, 
    initializePlayer, 
    loadPlayerFromStorage, 
    isLoading, 
    error,
    initializeContractService,
    isContractInitialized 
  } = useGame()

  // Debug logging
  console.log('GamePage state:', {
    player,
    isInitialized,
    isLoading,
    error,
    isContractInitialized,
    walletConnected,
    address
  })
  const { isConnected } = useSocket()
  const [playerName, setPlayerName] = useState('')
  const [showInventory, setShowInventory] = useState(false)
  const [showCrafting, setShowCrafting] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showStorage, setShowStorage] = useState(false)
  const [burnerWallet, setBurnerWallet] = useState<any>(null)

  // Available networks
  const networks = [
    { id: localhost.id, name: 'Localhost', icon: '🏠' },
    { id: hardhat.id, name: 'Hardhat', icon: '⚒️' },
    { id: mainnet.id, name: 'Ethereum', icon: '🔷' },
    { id: polygon.id, name: 'Polygon', icon: '🟣' },
    { id: arbitrum.id, name: 'Arbitrum', icon: '🔵' },
    { id: optimism.id, name: 'Optimism', icon: '🔴' },
  ]

  const currentNetwork = networks.find(n => n.id === chainId) || networks[0]

  // Create burner wallet
  const createBurnerWallet = () => {
    const privateKey = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const client = createWalletClient({
      account,
      chain: hardhat,
      transport: http('http://127.0.0.1:8545')
    })
    setBurnerWallet({ account, client, privateKey })
    return { account, client, privateKey }
  }

  // Auto-load player when wallet connects
  useEffect(() => {
    if (address && walletConnected && !isInitialized) {
      loadPlayerFromStorage(address)
    }
  }, [address, walletConnected, isInitialized, loadPlayerFromStorage])

  // Initialize contract service when wallet connects
  useEffect(() => {
    if (walletClient && !isContractInitialized) {
      const provider = new ethers.BrowserProvider(walletClient)
      const config = {
        gameCoreAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        stateManagerAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        proofVerifierAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
      }
      initializeContractService(provider, config)
    }
  }, [walletClient, isContractInitialized, initializeContractService])

  // Initialize contract service with burner wallet
  useEffect(() => {
    if (burnerWallet && !isContractInitialized) {
      const provider = new ethers.BrowserProvider(burnerWallet.client)
      const config = {
        gameCoreAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        stateManagerAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        proofVerifierAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
      }
      initializeContractService(provider, config)
    }
  }, [burnerWallet, isContractInitialized, initializeContractService])

  // Show saved player name if available
  useEffect(() => {
    if (player && player.name && !playerName) {
      setPlayerName(player.name)
    }
  }, [player, playerName])

  const handleInitialize = async () => {
    console.log('Initializing player with name:', playerName.trim())
    console.log('Wallet address:', address || burnerWallet?.account?.address)
    console.log('Is loading:', isLoading)
    console.log('Error:', error)
    
    if (playerName.trim()) {
      const walletAddress = address || burnerWallet?.account?.address
      try {
        await initializePlayer(playerName.trim(), walletAddress)
        console.log('Player initialized successfully')
      } catch (err) {
        console.error('Failed to initialize player:', err)
      }
    }
  }

  const handleBurnerWallet = () => {
    const wallet = createBurnerWallet()
    // Auto-initialize player with burner wallet
    if (playerName.trim()) {
      initializePlayer(playerName.trim(), wallet.account.address)
    }
  }

  if (!isInitialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', margin: '0 16px' }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gradient mb-4">
              ZKGame
            </h1>
            <p className="text-secondary text-xl mb-2">
              Zero-Knowledge Proof Gaming Platform
            </p>
            <div className="text-secondary">
              "Privacy-preserving gameplay with cryptographic proofs"
            </div>
          </div>
          
          {/* Network Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Select Network</h3>
            <div className="flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => switchChain?.({ chainId: network.id })}
                  className="btn"
                  style={{
                    background: chainId === network.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(55, 65, 81, 0.8)',
                    border: chainId === network.id ? '2px solid #3b82f6' : '2px solid #4b5563',
                    padding: '12px',
                    minWidth: '80px'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{network.icon}</div>
                  <div className="text-sm font-medium text-primary">{network.name}</div>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <span className="text-secondary text-sm">Current: </span>
              <span className="text-sm font-medium text-primary">
                {currentNetwork.icon} {currentNetwork.name}
              </span>
            </div>
          </div>
          
          {/* Wallet Connection Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Connect Wallet</h3>
            <div className="space-y-4">
              <div className="flex" style={{ gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <ConnectButton />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="input" style={{ textAlign: 'center' }}>
                    {walletConnected ? '9,999.9 ETH' : '0.0 ETH'}
                  </div>
                </div>
              </div>
              <div className="text-secondary">or</div>
              <button
                onClick={handleBurnerWallet}
                disabled={isLoading}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading" style={{ marginRight: '8px' }}></div>
                    Creating...
                  </div>
                ) : (
                  '🎲 Use Burner Wallet'
                )}
              </button>
              <div className="text-secondary text-sm">
                Burner wallet is perfect for testing - no real funds needed!
              </div>
            </div>
          </div>
          
          {/* Player Name Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Choose Your Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your player name..."
                className="input"
                onKeyPress={(e) => e.key === 'Enter' && handleInitialize()}
              />
            </div>
            
            <button
              onClick={handleInitialize}
              disabled={!playerName.trim() || isLoading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading" style={{ marginRight: '8px' }}></div>
                  Initializing...
                </div>
              ) : (
                'Start Playing'
              )}
            </button>
          </div>
          
          {/* Status Section */}
          <div className="mt-8 space-y-3">
            <div className="text-sm">
              <span className="text-secondary">Wallet Status:</span>
              <span 
                className="text-sm font-medium"
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: walletConnected || burnerWallet ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: walletConnected || burnerWallet ? '#10b981' : '#f59e0b',
                  border: walletConnected || burnerWallet ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                {walletConnected ? 'Connected' : burnerWallet ? 'Burner Active' : 'Not Connected'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-secondary">Network:</span>
              <span className="text-sm font-medium text-primary" style={{ marginLeft: '8px' }}>
                {currentNetwork.icon} {currentNetwork.name}
              </span>
            </div>
            {(walletConnected || burnerWallet) && (
              <div className="text-sm">
                <span className="text-secondary">Address:</span>
                <span className="text-secondary text-sm" style={{ marginLeft: '8px' }}>
                  {(address || burnerWallet?.account?.address)?.slice(0, 6)}...{(address || burnerWallet?.account?.address)?.slice(-4)}
                </span>
              </div>
            )}
            {!player && (walletConnected || burnerWallet) && (
              <div 
                className="text-sm"
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                ⚠️ No saved player found for this wallet address
              </div>
            )}
          </div>
          
          {error && (
            <div 
              className="mt-6"
              style={{
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#fca5a5'
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      {/* Dashboard Header */}
      <header style={{ 
        background: 'rgba(17, 24, 39, 0.95)', 
        borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
        padding: '24px',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="container">
          <div className="flex justify-between items-center">
            <div className="flex items-center" style={{ gap: '24px' }}>
              <h1 className="text-3xl font-bold text-gradient">
                ZKGame Dashboard
              </h1>
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div className={`status-${isConnected ? 'connected' : 'disconnected'}`}></div>
                <span className="text-secondary text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center" style={{ gap: '16px' }}>
              <div className="flex items-center" style={{ gap: '8px' }}>
                <span className="text-secondary text-sm">Network:</span>
                <select
                  value={chainId}
                  onChange={(e) => switchChain?.({ chainId: Number(e.target.value) })}
                  style={{
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {networks.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.icon} {network.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <ConnectButton />
              
              <div className="flex items-center" style={{ gap: '8px' }}>
                <div className={`status-${isContractInitialized ? 'connected' : 'loading'}`}></div>
                <span className="text-secondary text-sm">
                  {isContractInitialized ? 'ZK Ready' : 'ZK Loading...'}
                </span>
              </div>
              
              <div 
                className="text-primary text-sm"
                style={{
                  padding: '4px 12px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}
              >
                {player?.name} | Level {Math.floor(player?.experience / 100) + 1}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="container" style={{ padding: '24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-4" style={{ gap: '24px' }}>
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Player Status */}
            <div className="card">
              <h2 className="text-lg font-semibold text-primary mb-4">
                👤 Player Status
              </h2>
              <PlayerStatus />
            </div>
            
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-semibold text-primary mb-4">
                ⚡ Quick Actions
              </h2>
              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                <button
                  onClick={() => setShowInventory(!showInventory)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px', padding: '8px' }}
                >
                  📦 Inventory
                </button>
                <button
                  onClick={() => setShowCrafting(!showCrafting)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px', padding: '8px' }}
                >
                  🔨 Crafting
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px', padding: '8px' }}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setShowStorage(!showStorage)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px', padding: '8px' }}
                >
                  💾 Storage
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:grid-cols-3" style={{ gridColumn: 'span 3' }}>
            {/* Game Map */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-primary mb-4">
                🗺️ Game World
              </h2>
              <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #4b5563' }}>
                <GameMap />
              </div>
            </div>
            
            {/* Inventory and Crafting */}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
              <div className="card">
                <h2 className="text-lg font-semibold text-primary mb-4">
                  📦 Inventory
                </h2>
                <Inventory />
              </div>
              
              <div className="card">
                <h2 className="text-lg font-semibold text-primary mb-4">
                  🔨 Crafting
                </h2>
                <Crafting />
              </div>
            </div>
            
            {/* Additional Sections */}
            {(showChat || showStorage) && (
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px', marginTop: '24px' }}>
                {showChat && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-primary mb-4">
                      💬 Chat
                    </h2>
                    <Chat />
                  </div>
                )}

                {showStorage && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-primary mb-4">
                      💾 Storage Manager
                    </h2>
                    <StorageManager />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            maxWidth: '300px',
            fontSize: '14px',
            backdropFilter: 'blur(10px)'
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
