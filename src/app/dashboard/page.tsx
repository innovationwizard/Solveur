'use client'

import { useState, useEffect } from 'react'
import { Bot, Users, MessageSquare, FileText, BarChart3, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import TenantSwitcher from '@/components/TenantSwitcher'
import ChatInterface from '@/components/ChatInterface'

interface TenantInfo {
  id: string
  name: string
  slug: string
  plan: string
  status: string
}

interface UsageStats {
  apiCalls: number
  conversations: number
  documents: number
  users: number
}

export default function DashboardPage() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const tenantSlug = getTenantFromSubdomain()
        
        if (tenantSlug) {
          const response = await fetch(`/api/tenants?slug=${tenantSlug}`)
          if (response.ok) {
            const data = await response.json()
            setTenant(data.tenant)
            
            // Load usage stats
            const statsResponse = await fetch(`/api/tenants/${data.tenant.id}/usage`)
            if (statsResponse.ok) {
              const statsData = await statsResponse.json()
              setUsageStats(statsData)
            }
          } else {
            setError('Invalid tenant. Please check your URL or contact support.')
          }
        } else {
          setError('No tenant specified. Please access via your company subdomain.')
        }
      } catch (error) {
        setError('Unable to load dashboard data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const getTenantFromSubdomain = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]
      return subdomain !== 'localhost' && subdomain !== 'www' ? subdomain : null
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-600 font-sora">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="flex items-center justify-center h-screen">
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
    <div className="min-h-screen bg-primary-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-primary-900 font-sora">Solveur</h1>
              </div>
              <TenantSwitcher />
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/knowledge"
                className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora"
              >
                Knowledge Base
              </a>
              <a 
                href="/settings/personality"
                className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora"
              >
                AI Personality
              </a>
              <button className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora">
                Settings
              </button>
              <button className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora">
                Help
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-error-600 hover:text-error-900 px-3 py-2 text-sm font-medium font-sora flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2 font-sora">
            Welcome back to {tenant.name}
          </h1>
          <p className="text-primary-600 font-sora">
            Your AI support assistant is ready to help your customers.
          </p>
        </div>

        {/* Stats Grid */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-primary-500 font-sora">API Calls</p>
                  <p className="text-2xl font-bold text-primary-900 font-sora">{usageStats.apiCalls}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-primary-500 font-sora">Users</p>
                  <p className="text-2xl font-bold text-primary-900 font-sora">{usageStats.users}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-primary-500 font-sora">Conversations</p>
                  <p className="text-2xl font-bold text-primary-900 font-sora">{usageStats.conversations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-info-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-primary-500 font-sora">Documents</p>
                  <p className="text-2xl font-bold text-primary-900 font-sora">{usageStats.documents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Info */}
        <div className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-1 font-sora">
                Current Plan: {tenant.plan}
              </h3>
              <p className="text-primary-600 font-sora">
                Workspace: {tenant.slug}.solveur.com
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tenant.status === 'ACTIVE' 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-error-100 text-error-800'
              }`}>
                {tenant.status}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-4 font-sora">
            AI Support Assistant
          </h2>
          <ChatInterface />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft hover:shadow-medium transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary-900 ml-3 font-sora">
                Invite Team Members
              </h3>
            </div>
            <p className="text-primary-600 font-sora mb-4">
              Add your team to collaborate on customer support and manage your AI assistant.
            </p>
            <button className="text-accent-500 hover:text-accent-600 font-medium font-sora">
              Invite Users →
            </button>
          </div>

          <a 
            href="/knowledge"
            className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft hover:shadow-medium transition-all duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary-900 ml-3 font-sora">
                Manage Knowledge Base
              </h3>
            </div>
            <p className="text-primary-600 font-sora mb-4">
              Upload and organize your documentation, FAQs, and product information to train your AI assistant.
            </p>
            <span className="text-success-500 hover:text-success-600 font-medium font-sora">
              Manage Documents →
            </span>
          </a>

          <a 
            href="/settings/personality"
            className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft hover:shadow-medium transition-all duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary-900 ml-3 font-sora">
                Configure AI Personality
              </h3>
            </div>
            <p className="text-primary-600 font-sora mb-4">
              Customize how your AI assistant communicates with your team and customers.
            </p>
            <span className="text-accent-500 hover:text-accent-600 font-medium font-sora">
              Manage Personality →
            </span>
          </a>

          <div className="bg-white p-6 rounded-lg border border-primary-200 shadow-soft hover:shadow-medium transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary-900 ml-3 font-sora">
                Configure Integrations
              </h3>
            </div>
            <p className="text-primary-600 font-sora mb-4">
              Connect your existing tools like Slack, Zendesk, and Salesforce for seamless workflows.
            </p>
            <button className="text-warning-500 hover:text-warning-600 font-medium font-sora">
              Set Up Integrations →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 