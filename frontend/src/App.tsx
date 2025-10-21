import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, localhost, hardhat } from 'wagmi/chains'
import { http } from 'viem'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import { GameProvider } from './contexts/GameContext'
import { SocketProvider } from './contexts/SocketContext'
import GamePage from './components/GamePage'
import './index.css'

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider 
          initialChain={localhost}
          showRecentTransactions={true}
        >
          <SocketProvider>
            <GameProvider>
              <GamePage />
            </GameProvider>
          </SocketProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default App
