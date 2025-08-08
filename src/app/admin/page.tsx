'use client'

import { useState, useEffect } from 'react'
import { 
  Bot, 
  Users, 
  Building, 
  Database, 
  Settings, 
  Shield, 
  Activity,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Tenant {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: string
  usersCount: number
  apiCallsCount: number
}

interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  isSuperuser: boolean
  tenantId: string
  tenantName: string
}

interface SystemStats {
  totalTenants: number
  totalUsers: number
  totalApiCalls: number
  totalDocuments: number
  activeConversations: number
}

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState<'tenants' | 'users' | 'stats'>('stats')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Check superuser status
      const meResponse = await fetch('/api/admin/me')
      if (!meResponse.ok) {
        throw new Error('Unauthorized. Superuser access required.')
      }

      // Load system stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load tenants
      const tenantsResponse = await fetch('/api/admin/tenants')
      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json()
        setTenants(tenantsData.tenants)
      }

      // Load users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTenantStatusChange = async (tenantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update tenant status')
      }

      // Refresh tenant list
      loadDashboardData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update tenant status')
    }
  }

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      // Refresh user list
      loadDashboardData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user status')
    }
  }

  const handleSuperuserToggle = async (userId: string, isSuperuser: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/superuser`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuperuser })
      })

      if (!response.ok) {
        throw new Error('Failed to update superuser status')
      }

      // Refresh user list
      loadDashboardData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update superuser status')
    }
  }

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-primary-600 font-sora">Loading admin dashboard...</p>
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
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-primary-900 font-sora">Solveur Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadDashboardData()}
                  className="text-primary-600 hover:text-primary-900 p-2"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="text-error-600 hover:text-error-900 p-2 flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-sora">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-error-500" />
              <p className="text-error-700 font-sora">{error}</p>
            </div>
          </div>
        )}

        {/* View Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-primary-200 p-1 inline-flex">
            <button
              onClick={() => setCurrentView('stats')}
              className={`px-4 py-2 rounded-md font-medium font-sora ${
                currentView === 'stats'
                  ? 'bg-accent-500 text-white'
                  : 'text-primary-600 hover:text-primary-900'
              }`}
            >
              System Stats
            </button>
            <button
              onClick={() => setCurrentView('tenants')}
              className={`px-4 py-2 rounded-md font-medium font-sora ${
                currentView === 'tenants'
                  ? 'bg-accent-500 text-white'
                  : 'text-primary-600 hover:text-primary-900'
              }`}
            >
              Tenants
            </button>
            <button
              onClick={() => setCurrentView('users')}
              className={`px-4 py-2 rounded-md font-medium font-sora ${
                currentView === 'users'
                  ? 'bg-accent-500 text-white'
                  : 'text-primary-600 hover:text-primary-900'
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {currentView !== 'stats' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${currentView}...`}
                className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
              />
            </div>
          </div>
        )}

        {/* System Stats */}
        {currentView === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-500 font-sora">Total Tenants</p>
                    <p className="text-2xl font-bold text-primary-900 font-sora">
                      {stats.totalTenants}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-500 font-sora">Total Users</p>
                    <p className="text-2xl font-bold text-primary-900 font-sora">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-500 font-sora">Total API Calls</p>
                    <p className="text-2xl font-bold text-primary-900 font-sora">
                      {stats.totalApiCalls}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-info-600" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-500 font-sora">Total Documents</p>
                    <p className="text-2xl font-bold text-primary-900 font-sora">
                      {stats.totalDocuments}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-500 font-sora">Active Conversations</p>
                    <p className="text-2xl font-bold text-primary-900 font-sora">
                      {stats.activeConversations}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tenants List */}
        {currentView === 'tenants' && (
          <div className="bg-white rounded-lg border border-primary-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      API Calls
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-primary-200">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-primary-900 font-sora">
                              {tenant.name}
                            </div>
                            <div className="text-sm text-primary-500 font-sora">
                              {tenant.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 font-sora">
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={tenant.status}
                          onChange={(e) => handleTenantStatusChange(tenant.id, e.target.value)}
                          className="text-sm border-0 bg-transparent focus:ring-0 font-sora"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500 font-sora">
                        {tenant.usersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500 font-sora">
                        {tenant.apiCallsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => window.location.href = `https://${tenant.slug}.solveur.com/admin`}
                          className="text-accent-600 hover:text-accent-900 mr-4 font-sora"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users List */}
        {currentView === 'users' && (
          <div className="bg-white rounded-lg border border-primary-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Superuser
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider font-sora">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-primary-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-primary-900 font-sora">
                              {user.name || 'No name'}
                            </div>
                            <div className="text-sm text-primary-500 font-sora">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-900 font-sora">{user.tenantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 font-sora">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.status}
                          onChange={(e) => handleUserStatusChange(user.id, e.target.value)}
                          className="text-sm border-0 bg-transparent focus:ring-0 font-sora"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSuperuserToggle(user.id, !user.isSuperuser)}
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isSuperuser
                              ? 'bg-accent-100 text-accent-800'
                              : 'bg-primary-100 text-primary-800'
                          } font-sora`}
                        >
                          {user.isSuperuser ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => window.location.href = `https://${user.tenantId}.solveur.com/admin/users/${user.id}`}
                          className="text-accent-600 hover:text-accent-900 mr-4 font-sora"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
