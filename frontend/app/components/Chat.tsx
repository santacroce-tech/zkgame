'use client'

import { useSocket } from '../contexts/SocketContext'
import { useState } from 'react'

export function Chat() {
  const { messages, sendMessage, isConnected } = useSocket()
  const [message, setMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && isConnected) {
      sendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Chat</h3>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-400">
            {isConnected ? 'Connected to chat' : 'Disconnected'}
          </span>
        </div>
        
        {/* Messages */}
        <div className="h-48 overflow-y-auto border border-game-border rounded-lg p-2 bg-game-bg">
          {messages.length > 0 ? (
            <div className="space-y-1">
              {messages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-400 text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="ml-2">{msg.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              No messages yet
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1 text-sm"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
