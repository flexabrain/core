'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap, Shield, BookOpen, AlertCircle, CheckCircle, Clock, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  suggestions?: string[]
  metadata?: any
}

interface AgentInfo {
  name: string
  icon: any
  color: string
  description: string
  tier: string
}

const AGENTS: Record<string, AgentInfo> = {
  oracle: {
    name: 'Oracle',
    icon: Zap,
    color: 'yellow',
    description: 'The Predictor - Predictive analytics and forecasting',
    tier: 'Free'
  },
  sentinel: {
    name: 'Sentinel',
    icon: Shield,
    color: 'red',
    description: 'The Guardian - Monitoring and anomaly detection',
    tier: 'Pro'
  },
  sage: {
    name: 'Sage',
    icon: BookOpen,
    color: 'green',
    description: 'The Analyst - Business intelligence and insights',
    tier: 'Pro'
  }
}

const SAMPLE_QUERIES = {
  oracle: [
    "Predict Q2 sales based on 15% customer growth and new product launch",
    "What are the revenue trends for SaaS companies in 2025?",
    "Forecast demand for AI tools in the next 6 months"
  ],
  sentinel: [
    "Monitor system performance: CPU 85%, Memory 70%, Response time 2.3s",
    "Analyze data quality for customer database with 5% null values",
    "Detect anomalies in user login patterns"
  ],
  sage: [
    "Analyze customer segments for B2B SaaS with 10K users",
    "Strategic recommendations for entering European markets",
    "ROI analysis for $500K marketing automation investment"
  ]
}

export function AgentDemo() {
  const [selectedAgent, setSelectedAgent] = useState<string>('oracle')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Clear messages when switching agents
    setMessages([])
    setError(null)
  }, [selectedAgent])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/agents/${selectedAgent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: userMessage.content,
          userId: 'demo-user'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response from agent')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response.content,
        timestamp: new Date(),
        confidence: data.response.confidence,
        suggestions: data.response.suggestions,
        metadata: data.response.metadata
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        confidence: 0
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const useSampleQuery = (query: string) => {
    setInput(query)
  }

  const agent = AGENTS[selectedAgent]
  const AgentIcon = agent.icon

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-${agent.color}-100 flex items-center justify-center`}>
              <AgentIcon className={`h-6 w-6 text-${agent.color}-600`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{agent.name} Agent Demo</h3>
              <p className="text-gray-600 text-sm">{agent.description}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            agent.tier === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {agent.tier} Tier
          </div>
        </div>

        {/* Agent Selector */}
        <div className="flex space-x-2">
          {Object.entries(AGENTS).map(([key, agentInfo]) => {
            const Icon = agentInfo.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedAgent(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAgent === key
                    ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{agentInfo.name}</span>
                {agentInfo.tier === 'Pro' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Pro</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Try {agent.name} Agent
            </h4>
            <p className="text-gray-600 mb-6">
              Ask questions about {agent.description.toLowerCase()}
            </p>
            
            {/* Sample Queries */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Sample queries:</p>
              {SAMPLE_QUERIES[selectedAgent as keyof typeof SAMPLE_QUERIES].map((query, index) => (
                <button
                  key={index}
                  onClick={() => useSampleQuery(query)}
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className={`w-8 h-8 rounded-full bg-${agent.color}-100 flex items-center justify-center flex-shrink-0`}>
                <AgentIcon className={`h-4 w-4 text-${agent.color}-600`} />
              </div>
            )}
            
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              
              {message.role === 'assistant' && (
                <div className="mt-2 space-y-2">
                  {/* Confidence Score */}
                  {message.confidence !== undefined && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        {message.confidence > 0.7 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : message.confidence > 0.4 ? (
                          <Clock className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                      </div>
                      {message.metadata?.processingTime && (
                        <span>• {message.metadata.processingTime}ms</span>
                      )}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                      <div className="space-y-1">
                        {message.suggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => useSampleQuery(suggestion)}
                            className="block w-full text-left text-xs p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full bg-${agent.color}-100 flex items-center justify-center`}>
              <AgentIcon className={`h-4 w-4 text-${agent.color}-600`} />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">{agent.name} is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Ask ${agent.name} a question...`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {agent.tier === 'Free' ? 
            '✨ Oracle agent is free to use • 5 queries per day' : 
            '🔒 Pro agents require upgrade • Unlimited queries'
          }
        </div>
      </div>
    </div>
  )
}