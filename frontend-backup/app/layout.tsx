'use client'

import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, localhost, hardhat } from 'wagmi/chains'
import { http } from 'viem'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import { GameProvider } from './contexts/GameContext'
import { SocketProvider } from './contexts/SocketContext'
import './globals.css'

const chains = [localhost, hardhat, mainnet, polygon, arbitrum, optimism] as const

const config = getDefaultConfig({
  appName: 'ZKGame',
  projectId: '24ee37fe4e16c682326990167151b43b',
  chains,
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>ZKGame - Zero-Knowledge Proof Game</title>
        <meta name="description" content="Privacy-preserving simulation game with zero-knowledge proofs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <RainbowKitProvider 
              initialChain={localhost}
              showRecentTransactions={true}
            >
              <SocketProvider>
                <GameProvider>
                  {children}
                </GameProvider>
              </SocketProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
