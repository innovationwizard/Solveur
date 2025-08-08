'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Building, Check } from 'lucide-react'

interface Tenant {
  id: string
  name: string
  slug: string
  status: string
}

export default function TenantSwitcher() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getCurrentTenant = async () => {
      try {
        const tenantSlug = getTenantFromSubdomain()
        if (tenantSlug) {
          const response = await fetch(`/api/tenants?slug=${tenantSlug}`)
          if (response.ok) {
            const data = await response.json()
            setCurrentTenant(data.tenant)
          }
        }
      } catch (error) {
        console.error('Error loading tenant:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getCurrentTenant()
  }, [])

  const getTenantFromSubdomain = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]
      return subdomain !== 'localhost' && subdomain !== 'www' ? subdomain : null
    }
    return null
  }

  const handleTenantSwitch = (tenant: Tenant) => {
    // In a real implementation, you would redirect to the new tenant's subdomain
    const newUrl = `https://${tenant.slug}.solveur.com${window.location.pathname}`
    window.location.href = newUrl
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-500"></div>
        <span className="text-sm text-primary-600 font-sora">Loading...</span>
      </div>
    )
  }

  if (!currentTenant) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
      >
        <div className="w-6 h-6 bg-accent-500 rounded flex items-center justify-center">
          <Building className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-primary-900 font-sora">
          {currentTenant.name}
        </span>
        <ChevronDown className="w-4 h-4 text-primary-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-primary-200 rounded-lg shadow-large z-50">
          <div className="p-3 border-b border-primary-200">
            <p className="text-xs text-primary-500 font-sora mb-2">Current Workspace</p>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-accent-500 rounded flex items-center justify-center">
                <Building className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-900 font-sora">
                  {currentTenant.name}
                </p>
                <p className="text-xs text-primary-500 font-sora">
                  {currentTenant.slug}.solveur.com
                </p>
              </div>
              <Check className="w-4 h-4 text-accent-500" />
            </div>
          </div>

          {availableTenants.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-primary-500 font-sora mb-2">Other Workspaces</p>
              <div className="space-y-1">
                {availableTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSwitch(tenant)}
                    className="w-full flex items-center space-x-2 px-2 py-2 rounded hover:bg-primary-50 transition-colors"
                  >
                    <div className="w-6 h-6 bg-primary-200 rounded flex items-center justify-center">
                      <Building className="w-3 h-3 text-primary-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-primary-900 font-sora">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-primary-500 font-sora">
                        {tenant.slug}.solveur.com
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t border-primary-200">
            <button className="w-full text-left text-sm text-accent-500 hover:text-accent-600 font-sora">
              Manage Workspaces
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
