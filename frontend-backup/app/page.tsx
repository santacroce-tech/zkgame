'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWalletClient, useConnect, useChainId, useSwitchChain } from 'wagmi'
import { useGame } from './contexts/GameContext'
import { useSocket } from './contexts/SocketContext'
import { GameMap } from './components/GameMap'
import { PlayerStatus } from './components/PlayerStatus'
import { Inventory } from './components/Inventory'
import { Crafting } from './components/Crafting'
import { Chat } from './components/Chat'
import { StorageManager } from './components/StorageManager'
import { ClientOnly } from './components/ClientOnly'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hardhat, localhost, mainnet, polygon, arbitrum, optimism } from 'viem/chains'

export default function GamePage() {
  const { address, isConnected: walletConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { connect, connectors } = useConnect()
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
  const { isConnected } = useSocket()
  const [playerName, setPlayerName] = useState('')
  const [showInventory, setShowInventory] = useState(false)
  const [showCrafting, setShowCrafting] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showStorage, setShowStorage] = useState(false)
  const [burnerWallet, setBurnerWallet] = useState<any>(null)

  // Available networks
  const networks = [
    { id: localhost.id, name: 'Localhost', icon: '🏠', color: 'network-localhost' },
    { id: hardhat.id, name: 'Hardhat', icon: '⚒️', color: 'network-hardhat' },
    { id: mainnet.id, name: 'Ethereum', icon: '🔷', color: 'network-mainnet' },
    { id: polygon.id, name: 'Polygon', icon: '🟣', color: 'network-mainnet' },
    { id: arbitrum.id, name: 'Arbitrum', icon: '🔵', color: 'network-mainnet' },
    { id: optimism.id, name: 'Optimism', icon: '🔴', color: 'network-mainnet' },
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
    if (playerName.trim()) {
      const walletAddress = address || burnerWallet?.account?.address
      await initializePlayer(playerName.trim(), walletAddress)
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
      <ClientOnly fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full mx-4 p-8 glow-effect">
            <div className="text-center">
              <div className="loading w-8 h-8 mx-auto mb-4"></div>
              <p className="text-secondary">Loading...</p>
            </div>
          </div>
        </div>
      }>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full mx-4 p-8 glow-effect">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gradient mb-4">
              ZKGame
            </h1>
            <p className="text-secondary text-xl mb-2">
              Zero-Knowledge Proof Gaming Platform
            </p>
            <div className="text-sm text-secondary">
              &ldquo;Privacy-preserving gameplay with cryptographic proofs&rdquo;
            </div>
          </div>
          
          {/* Network Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Select Network</h3>
            <div className="flex flex-wrap gap-3">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => switchChain?.({ chainId: network.id })}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    chainId === network.id
                      ? 'border-blue-500 bg-blue-500/10 scale-105'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{network.icon}</div>
                  <div className="text-sm font-medium text-primary">{network.name}</div>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <span className="text-xs text-secondary">Current: </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${currentNetwork.color}`}>
                {currentNetwork.icon} {currentNetwork.name}
              </span>
            </div>
          </div>
          
          {/* Wallet Connection Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Connect Wallet</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <ConnectButton />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-300">
                    {walletConnected ? '9,999.9 ETH' : '0.0 ETH'}
                  </div>
                </div>
              </div>
              <div className="text-sm text-secondary">or</div>
              <button
                onClick={handleBurnerWallet}
                disabled={isLoading}
                className="btn-outline w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading w-5 h-5 mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  '🎲 Use Burner Wallet'
                )}
              </button>
              <div className="text-xs text-secondary">
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
                className="input text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleInitialize()}
              />
            </div>
            
            <button
              onClick={handleInitialize}
              disabled={!playerName.trim() || isLoading}
              className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading w-5 h-5 mr-2"></div>
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
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                walletConnected || burnerWallet 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {walletConnected ? 'Connected' : burnerWallet ? 'Burner Active' : 'Not Connected'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-secondary">Network:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${currentNetwork.color}`}>
                {currentNetwork.icon} {currentNetwork.name}
              </span>
            </div>
            {(walletConnected || burnerWallet) && (
              <div className="text-sm">
                <span className="text-secondary">Address:</span>
                <span className="ml-2 text-xs text-secondary">
                  {(address || burnerWallet?.account?.address)?.slice(0, 6)}...{(address || burnerWallet?.account?.address)?.slice(-4)}
                </span>
              </div>
            )}
            {!player && (walletConnected || burnerWallet) && (
              <div className="text-xs text-yellow-400 bg-yellow-500/20 p-2 rounded-lg border border-yellow-500/30">
                ⚠️ No saved player found for this wallet address
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
      </ClientOnly>
    )
  }

  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-2xl w-full mx-4 p-8 glow-effect">
          <div className="text-center">
            <div className="loading w-8 h-8 mx-auto mb-4"></div>
            <p className="text-secondary">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Enhanced Dashboard Header */}
      <header className="header p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gradient">
                  ZKGame Dashboard
                </h1>
                <div className="hidden lg:flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'status-connected' : 'status-disconnected'}`}></div>
                  <span className="text-secondary text-sm">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
              {/* Network Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-secondary text-sm">Network:</span>
                <select
                  value={chainId}
                  onChange={(e) => switchChain?.({ chainId: Number(e.target.value) })}
                  className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {networks.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.icon} {network.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full lg:w-auto">
                <ConnectButton />
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isContractInitialized ? 'status-connected' : 'status-loading'}`}></div>
                <span className="text-secondary text-xs">
                  {isContractInitialized ? 'ZK Ready' : 'ZK Loading...'}
                </span>
              </div>
              <div className="text-primary text-sm bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30">
                {player?.name} | Level {Math.floor(player?.experience / 100) + 1}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid - Centered */}
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar - Player Info & Quick Actions */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:space-y-6">
            {/* Player Status Card */}
            <div className="panel p-6">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Player Status
              </h2>
              <PlayerStatus />
            </div>
            
            {/* Quick Actions Card */}
            <div className="panel p-6">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowInventory(!showInventory)}
                  className={`btn-secondary text-sm py-2 ${showInventory ? 'ring-2 ring-primary-500' : ''}`}
                >
                  📦 Inventory
                </button>
                <button
                  onClick={() => setShowCrafting(!showCrafting)}
                  className={`btn-secondary text-sm py-2 ${showCrafting ? 'ring-2 ring-primary-500' : ''}`}
                >
                  🔨 Crafting
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`btn-secondary text-sm py-2 ${showChat ? 'ring-2 ring-primary-500' : ''}`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setShowStorage(!showStorage)}
                  className={`btn-secondary text-sm py-2 ${showStorage ? 'ring-2 ring-primary-500' : ''}`}
                >
                  💾 Storage
                </button>
                <button
                  onClick={() => {
                    setShowInventory(false)
                    setShowCrafting(false)
                    setShowChat(false)
                    setShowStorage(false)
                  }}
                  className="btn-outline text-sm py-2 col-span-2"
                >
                  🗺️ Map Only
                </button>
              </div>
            </div>
            
            {/* System Status Card */}
            <div className="panel p-6">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <span className="mr-2">🔧</span>
                System Status
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Wallet:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    walletConnected || burnerWallet 
                      ? 'bg-success-500/20 text-success-400 border border-success-500/30' 
                      : 'bg-warning-500/20 text-warning-400 border border-warning-500/30'
                  }`}>
                    {walletConnected ? 'Connected' : burnerWallet ? 'Burner' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">ZK Proofs:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isContractInitialized 
                      ? 'bg-success-500/20 text-success-400 border border-success-500/30' 
                      : 'bg-warning-500/20 text-warning-400 border border-warning-500/30'
                  }`}>
                    {isContractInitialized ? 'Ready' : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Network:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isConnected 
                      ? 'bg-success-500/20 text-success-400 border border-success-500/30' 
                      : 'bg-warning-500/20 text-warning-400 border border-warning-500/30'
                  }`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                {(address || burnerWallet?.account?.address) && (
                  <div className="pt-2 border-t border-dark-600">
                    <div className="text-xs text-secondary break-all">
                      {(address || burnerWallet?.account?.address)?.slice(0, 10)}...{(address || burnerWallet?.account?.address)?.slice(-8)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content Area - Always Visible Dashboard */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4 lg:space-y-6">
            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Player Level */}
              <div className="panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Level</p>
                    <p className="text-2xl font-bold text-primary">{Math.floor(player?.experience / 100) + 1}</p>
                  </div>
                  <div className="text-3xl">⭐</div>
                </div>
              </div>
              
              {/* Currency */}
              <div className="panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Coins</p>
                    <p className="text-2xl font-bold text-accent">{player?.currency || 0}</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>
              
              {/* Experience */}
              <div className="panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Experience</p>
                    <p className="text-2xl font-bold text-primary">{player?.experience || 0}</p>
                  </div>
                  <div className="text-3xl">⚡</div>
                </div>
              </div>
              
              {/* Reputation */}
              <div className="panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Reputation</p>
                    <p className="text-2xl font-bold text-primary">{(player?.reputation || 0).toFixed(1)}</p>
                  </div>
                  <div className="text-3xl">🏆</div>
                </div>
              </div>
            </div>

            {/* Game Map Section */}
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary flex items-center">
                  <span className="mr-2">🗺️</span>
                  Game World
                </h2>
                <div className="text-sm text-secondary bg-dark-700 px-3 py-1 rounded-lg border border-dark-600">
                  {player?.position?.city}, {player?.position?.country}
                </div>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden border border-dark-600">
                <GameMap />
              </div>
            </div>
            
            {/* Always Visible Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory - Always Visible */}
              <div className="panel p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <span className="mr-2">📦</span>
                  Inventory
                </h2>
                <Inventory />
              </div>
              
              {/* Crafting - Always Visible */}
              <div className="panel p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <span className="mr-2">🔨</span>
                  Crafting
                </h2>
                <Crafting />
              </div>
            </div>

            {/* Additional Sections - Toggleable */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {showChat && (
                <div className="panel p-6">
                  <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <span className="mr-2">💬</span>
                    Chat
                  </h2>
                  <Chat />
                </div>
              )}

              {showStorage && (
                <div className="panel p-6">
                  <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <span className="mr-2">💾</span>
                    Storage Manager
                  </h2>
                  <StorageManager />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 p-4 bg-danger-500/20 border border-danger-500/30 rounded-lg text-danger-400 max-w-sm text-sm backdrop-blur-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
    </ClientOnly>
  )
}
