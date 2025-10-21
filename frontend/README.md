# ZKGame Frontend

A clean, simple frontend for the ZKGame zero-knowledge proof gaming platform built with Vite, React, and TypeScript.

## Features

- **Clean Architecture**: Simple Vite + React + TypeScript setup
- **No Complex Styling**: Custom CSS without Tailwind or other frameworks
- **Wallet Integration**: RainbowKit for wallet connection
- **Zero-Knowledge Proofs**: Integration with ZK proof generation and verification
- **Real-time Updates**: Socket.io for live game updates
- **Responsive Design**: Mobile-first responsive layout

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Wagmi** - Ethereum wallet integration
- **RainbowKit** - Wallet connection UI
- **Ethers.js** - Ethereum interactions
- **Socket.io** - Real-time communication
- **Zustand** - State management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs the app in development mode at `http://localhost:3000`

### Build

```bash
npm run build
```

Builds the app for production in the `dist` folder.

### Preview

```bash
npm run preview
```

Preview the production build locally.

## Project Structure

```
src/
├── components/          # React components
│   ├── GamePage.tsx    # Main game interface
│   ├── GameMap.tsx     # Game world map
│   ├── PlayerStatus.tsx # Player stats display
│   ├── Inventory.tsx   # Inventory management
│   ├── Crafting.tsx    # Crafting system
│   ├── Chat.tsx        # Chat interface
│   └── StorageManager.tsx # Storage management
├── contexts/           # React contexts
│   ├── GameContext.tsx # Game state management
│   └── SocketContext.tsx # Socket.io integration
├── services/           # Business logic
│   ├── contractService.ts # Smart contract interactions
│   └── proofService.ts    # ZK proof generation
├── stores/             # State stores
│   └── gameStore.ts    # Zustand game store
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## Key Features

### Wallet Integration
- Support for multiple wallets via RainbowKit
- Network switching (Localhost, Hardhat, Ethereum, Polygon, etc.)
- Burner wallet for testing

### Zero-Knowledge Proofs
- Movement proof generation and verification
- Privacy-preserving gameplay
- Cryptographic state commitments

### Game Interface
- Clean, modern dashboard design
- Real-time player status
- Interactive game map
- Inventory and crafting systems
- Chat and storage management

## Styling

The app uses custom CSS with utility classes for:
- Responsive grid layouts
- Modern button styles
- Card components
- Status indicators
- Loading animations
- Dark theme with gradients

## Development Notes

- No complex CSS frameworks - just clean, maintainable CSS
- TypeScript for type safety
- ESLint for code quality
- Vite for fast development and building
- Hot module replacement for instant updates

## Building for Production

The build process:
1. TypeScript compilation
2. Vite bundling and optimization
3. Asset processing and minification
4. Source map generation

Output is optimized for production with:
- Code splitting
- Tree shaking
- Asset optimization
- Gzip compression
