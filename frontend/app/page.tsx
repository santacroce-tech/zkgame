'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWalletClient, useConnect } from 'wagmi'
import { useGame } from './contexts/GameContext'
import { useSocket } from './contexts/SocketContext'
import { GameMap } from './components/GameMap'
import { PlayerStatus } from './components/PlayerStatus'
import { Inventory } from './components/Inventory'
import { Crafting } from './components/Crafting'
import { Chat } from './components/Chat'
import { StorageManager } from './components/StorageManager'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hardhat } from 'viem/chains'

export default function GamePage() {
  const { address, isConnected: walletConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { connect, connectors } = useConnect()
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800">
        <div className="card max-w-lg w-full mx-4 p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">
              ZKGame
            </h1>
            <p className="text-secondary text-lg">
              Zero-Knowledge Proof Gaming Platform
            </p>
            <div className="mt-4 text-sm text-secondary">
              &ldquo;Privacy-preserving gameplay with cryptographic proofs&rdquo;
            </div>
          </div>
          
          {/* Wallet Connection Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4 text-center">Connect Wallet</h3>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <ConnectButton />
                </div>
              </div>
              <div className="text-center text-sm text-secondary">or</div>
              <button
                onClick={handleBurnerWallet}
                disabled={!playerName.trim() || isLoading}
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
              <div className="text-xs text-secondary text-center">
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
              disabled={!playerName.trim() || isLoading || (!walletConnected && !burnerWallet)}
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
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">Wallet Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                walletConnected || burnerWallet 
                  ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' 
                  : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
              }`}>
                {walletConnected ? 'Connected' : burnerWallet ? 'Burner Active' : 'Not Connected'}
              </span>
            </div>
            {(walletConnected || burnerWallet) && (
              <div className="text-xs text-secondary text-center">
                Address: {(address || burnerWallet?.account?.address)?.slice(0, 6)}...{(address || burnerWallet?.account?.address)?.slice(-4)}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg text-danger-700 dark:text-danger-300 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800">
      {/* Dashboard Header */}
      <header className="header p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gradient">
              ZKGame Dashboard
            </h1>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'status-connected' : 'status-disconnected'}`}></div>
              <span className="text-secondary text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
            <div className="w-full lg:w-auto">
              <ConnectButton />
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isContractInitialized ? 'status-connected' : 'status-loading'}`}></div>
              <span className="text-secondary text-xs">
                {isContractInitialized ? 'ZK Ready' : 'ZK Loading...'}
              </span>
            </div>
            <div className="text-primary text-sm bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg border border-primary-200 dark:border-primary-800">
              {player?.name} | Level {Math.floor(player?.experience / 100) + 1}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Player Info & Quick Actions */}
          <div className="xl:col-span-3 space-y-6">
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
                  className={`btn-secondary text-sm ${showInventory ? 'ring-2 ring-primary-500' : ''}`}
                >
                  📦 Inventory
                </button>
                <button
                  onClick={() => setShowCrafting(!showCrafting)}
                  className={`btn-secondary text-sm ${showCrafting ? 'ring-2 ring-primary-500' : ''}`}
                >
                  🔨 Crafting
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`btn-secondary text-sm ${showChat ? 'ring-2 ring-primary-500' : ''}`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setShowStorage(!showStorage)}
                  className={`btn-secondary text-sm ${showStorage ? 'ring-2 ring-primary-500' : ''}`}
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
                  className="btn-outline text-sm"
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
                      ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' 
                      : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                  }`}>
                    {walletConnected ? 'Connected' : burnerWallet ? 'Burner' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">ZK Proofs:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isContractInitialized 
                      ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' 
                      : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                  }`}>
                    {isContractInitialized ? 'Ready' : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Network:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isConnected 
                      ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' 
                      : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                  }`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                {(address || burnerWallet?.account?.address) && (
                  <div className="pt-2 border-t border-secondary-200 dark:border-secondary-700">
                    <div className="text-xs text-secondary break-all">
                      {(address || burnerWallet?.account?.address)?.slice(0, 10)}...{(address || burnerWallet?.account?.address)?.slice(-8)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="xl:col-span-9 space-y-6">
            {/* Game Map Section */}
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary flex items-center">
                  <span className="mr-2">🗺️</span>
                  Game World
                </h2>
                <div className="text-sm text-secondary bg-secondary-50 dark:bg-secondary-700 px-3 py-1 rounded-lg border border-secondary-200 dark:border-secondary-600">
                  {player?.position?.city}, {player?.position?.country}
                </div>
              </div>
              <div className="h-[500px]">
                <GameMap />
              </div>
            </div>
            
            {/* Dynamic Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {showInventory && (
                <div className="panel p-6">
                  <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <span className="mr-2">📦</span>
                    Inventory
                  </h2>
                  <Inventory />
                </div>
              )}
              
              {showCrafting && (
                <div className="panel p-6">
                  <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <span className="mr-2">🔨</span>
                    Crafting
                  </h2>
                  <Crafting />
                </div>
              )}
              
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
        <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg text-danger-700 dark:text-danger-300 max-w-sm text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
