'use client'

import { useState, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import { Send } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface TenantInfo {
  id: string
  slug: string
  name: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [isLoadingTenant, setIsLoadingTenant] = useState(true)

  // Get tenant from URL or subdomain
  useEffect(() => {
    const getTenantInfo = async () => {
      try {
        const tenantSlug = getTenantFromSubdomain()
        
        if (tenantSlug) {
          const response = await fetch(`/api/tenants?slug=${tenantSlug}`)
          if (response.ok) {
            const data = await response.json()
            setTenant(data.tenant)
          } else {
            setError('Invalid tenant. Please check your URL or contact support.')
          }
        } else {
          setError('No tenant specified. Please access via your company subdomain.')
        }
      } catch (error) {
        setError('Unable to determine tenant. Please try again.')
      } finally {
        setIsLoadingTenant(false)
      }
    }

    getTenantInfo()
  }, [])

  const getTenantFromSubdomain = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]
      return subdomain !== 'localhost' && subdomain !== 'www' ? subdomain : null
    }
    return null
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !tenant) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenant.id,
          'x-tenant-slug': tenant.slug
        },
        body: JSON.stringify({ message: input, messages })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      // Add error message to chat
      const errorBubble: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorBubble])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingTenant) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-600 font-sora">Loading your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2 font-sora">Invalid Workspace</h3>
            <p className="text-primary-600 font-sora mb-4">
              {error || 'Unable to determine your organization. Please contact your administrator.'}
            </p>
            <a 
              href="/"
              className="text-accent-500 hover:text-accent-600 font-medium font-sora"
            >
              Return to homepage
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
      {/* Tenant Header */}
      <div className="border-b border-primary-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary-900 font-sora">{tenant.name}</h2>
              <p className="text-sm text-primary-500 font-sora">AI Support Assistant</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-400 font-sora">Workspace</p>
            <p className="text-sm font-medium text-primary-700 font-sora">{tenant.slug}.solveur.com</p>
          </div>
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-primary-500 py-8">
            <p className="font-sora">Welcome to {tenant.name}! Ask me anything about your business.</p>
            <p className="text-sm mt-2 font-sora">I can help with customer support, product questions, pricing, and more.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-500"></div>
                <span className="text-primary-600 font-sora">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-3">
            <p className="text-error-600 text-sm font-sora">{error}</p>
          </div>
        )}
      </div>
      
      <div className="border-t border-primary-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your business..."
            className="flex-1 border border-primary-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-accent-500 text-white p-2 rounded-lg hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-accent"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}