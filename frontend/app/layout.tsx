'use client'

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { GameProvider } from './contexts/GameContext'
import { SocketProvider } from './contexts/SocketContext'
import './globals.css'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    arbitrum,
    optimism,
    {
      id: 31337,
      name: 'Hardhat',
      network: 'hardhat',
      nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
        public: { http: ['http://127.0.0.1:8545'] },
      },
    },
  ],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'ZKGame',
  projectId: 'zkgame-dapp',
  chains,
})

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>ZKGame - Zero-Knowledge Proof Game</title>
        <meta name="description" content="Privacy-preserving simulation game with zero-knowledge proofs" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <WagmiConfig config={config}>
          <RainbowKitProvider chains={chains}>
            <SocketProvider>
              <GameProvider>
                {children}
              </GameProvider>
            </SocketProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
