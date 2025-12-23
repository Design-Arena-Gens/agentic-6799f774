'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface CallLog {
  id: string
  timestamp: Date
  messages: Message[]
  status: 'active' | 'completed'
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startNewCall = () => {
    const newCallId = Date.now().toString()
    setCurrentCallId(newCallId)
    const welcomeMessage: Message = {
      role: 'assistant',
      content: "Hello! Thank you for calling our restaurant. I'm your AI assistant. How may I help you today? I can help with reservations, menu questions, hours, or directions.",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const endCall = () => {
    if (currentCallId && messages.length > 0) {
      const newLog: CallLog = {
        id: currentCallId,
        timestamp: new Date(),
        messages: [...messages],
        status: 'completed'
      }
      setCallLogs(prev => [newLog, ...prev])
    }
    setCurrentCallId(null)
    setMessages([])
    setInput('')
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Could you please repeat that?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateVoiceInput = () => {
    setIsListening(true)
    setTimeout(() => {
      setIsListening(false)
      setInput('I would like to make a reservation for 4 people tomorrow at 7 PM')
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🍽️ Restaurant Calling Agent</h1>
          <p className="text-gray-300">AI-powered phone assistant for reservations and inquiries</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Call Interface */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
            {!currentCallId ? (
              <div className="flex flex-col items-center justify-center h-[600px] space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">📞</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Ready to Answer</h2>
                  <p className="text-gray-300">Start a new call to begin assisting customers</p>
                </div>
                <button
                  onClick={startNewCall}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  📞 Start New Call
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-[600px]">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">Call in Progress</span>
                  </div>
                  <button
                    onClick={endCall}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    End Call
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/20 text-white border border-white/30'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-xl">{msg.role === 'user' ? '👤' : '🤖'}</span>
                          <div>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/20 text-white border border-white/30 p-4 rounded-2xl">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">🤖</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex space-x-2">
                  <button
                    onClick={simulateVoiceInput}
                    disabled={isListening}
                    className={`${
                      isListening ? 'bg-red-500 animate-pulse' : 'bg-purple-500 hover:bg-purple-600'
                    } text-white px-4 py-3 rounded-lg transition-all`}
                  >
                    {isListening ? '🎤 Listening...' : '🎤'}
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type customer message..."
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Call Logs & Info */}
          <div className="space-y-6">
            {/* Restaurant Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📋 Restaurant Info</h3>
              <div className="space-y-3 text-sm text-gray-200">
                <div>
                  <p className="font-semibold">Hours:</p>
                  <p>Mon-Thu: 11am-10pm</p>
                  <p>Fri-Sat: 11am-11pm</p>
                  <p>Sunday: 12pm-9pm</p>
                </div>
                <div>
                  <p className="font-semibold">Location:</p>
                  <p>123 Main Street</p>
                  <p>Downtown, CA 94102</p>
                </div>
                <div>
                  <p className="font-semibold">Specialties:</p>
                  <p>Italian Cuisine, Fresh Pasta</p>
                  <p>Wood-Fired Pizza</p>
                </div>
              </div>
            </div>

            {/* Call Logs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📞 Recent Calls</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {callLogs.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No calls yet</p>
                ) : (
                  callLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-300">
                          {log.timestamp.toLocaleString()}
                        </span>
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-white line-clamp-2">
                        {log.messages.find(m => m.role === 'user')?.content || 'No messages'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {log.messages.length} messages
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
