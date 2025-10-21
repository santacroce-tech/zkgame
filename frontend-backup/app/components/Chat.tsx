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
    <div className="panel">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Chat
      </h3>
      
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center space-x-3 text-sm">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'status-connected' : 'status-disconnected'}`}></div>
          <span className="text-stone-400 font-medieval">
            {isConnected ? '🔗 Connected to the royal court' : '❌ Disconnected from court'}
          </span>
        </div>
        
        {/* Messages */}
        <div className="h-48 overflow-y-auto border-medieval rounded-lg p-4 bg-stone-800/50">
          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <span className="text-stone-500 text-xs font-medieval">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="ml-3 text-stone-200 font-medieval">{msg.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-stone-400 text-center py-6 font-medieval">
              🏰 The court awaits your words...
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Speak to the court..."
            className="input-medieval flex-1 text-sm"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="btn-medieval text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📢 Send
          </button>
        </form>
      </div>
    </div>
  )
}
