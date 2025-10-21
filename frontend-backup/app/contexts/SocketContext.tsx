'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  players: any[]
  messages: any[]
  sendMessage: (message: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [players, setPlayers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to game server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from game server')
      setIsConnected(false)
    })

    newSocket.on('player_moved', (data) => {
      console.log('Player moved:', data)
      setPlayers(prev => prev.map(p => 
        p.playerId === data.playerId ? { ...p, position: data.position } : p
      ))
    })

    newSocket.on('player_joined', (data) => {
      console.log('Player joined:', data)
      setPlayers(prev => [...prev, data])
    })

    newSocket.on('player_left', (data) => {
      console.log('Player left:', data)
      setPlayers(prev => prev.filter(p => p.playerId !== data.playerId))
    })

    newSocket.on('chat_message', (data) => {
      console.log('Chat message:', data)
      setMessages(prev => [...prev, data])
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const sendMessage = (message: string) => {
    if (socket && isConnected) {
      socket.emit('chat_message', { message, timestamp: Date.now() })
    }
  }

  const value = {
    socket,
    isConnected,
    players,
    messages,
    sendMessage,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
