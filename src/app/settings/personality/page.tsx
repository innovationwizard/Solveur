'use client'

import { useState, useEffect } from 'react'
import { 
  Bot, 
  Settings, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Heart,
  Target,
  MessageSquare,
  Palette,
  BookOpen,
  Zap
} from 'lucide-react'
import TenantSwitcher from '@/components/TenantSwitcher'

interface Personality {
  id: string
  name: string
  description?: string
  tone: string
  style: string
  expertise: string[]
  philosophy: Record<string, string>
  values: Record<string, string>
  brandVoice?: string
  customPrompt?: string
  context: Record<string, any>
  responseLength: string
  language: string
  isActive: boolean
}

interface TenantInfo {
  id: string
  slug: string
  name: string
}

export default function PersonalityPage() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [currentPersonality, setCurrentPersonality] = useState<Personality | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tone: 'professional',
    style: 'balanced',
    expertise: [] as string[],
    philosophy: {} as Record<string, string>,
    values: {} as Record<string, string>,
    brandVoice: '',
    customPrompt: '',
    responseLength: 'medium',
    language: 'en'
  })

  // Available options
  const tones = [
    { value: 'professional', label: 'Professional', icon: Target },
    { value: 'friendly', label: 'Friendly', icon: Heart },
    { value: 'casual', label: 'Casual', icon: MessageSquare },
    { value: 'formal', label: 'Formal', icon: BookOpen },
    { value: 'enthusiastic', label: 'Enthusiastic', icon: Sparkles }
  ]

  const styles = [
    { value: 'concise', label: 'Concise', description: 'Short and to the point' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive explanations' },
    { value: 'conversational', label: 'Conversational', description: 'Natural dialogue style' },
    { value: 'technical', label: 'Technical', description: 'Expert-level explanations' },
    { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
    { value: 'balanced', label: 'Balanced', description: 'Adaptive to context' }
  ]

  const expertiseAreas = [
    'customer-support',
    'sales',
    'technical',
    'strategic',
    'creative',
    'analytical',
    'innovative'
  ]

  const responseLengths = [
    { value: 'short', label: 'Short (1-2 sentences)' },
    { value: 'medium', label: 'Medium (3-5 sentences)' },
    { value: 'long', label: 'Long (detailed explanations)' }
  ]

  useEffect(() => {
    loadTenantAndPersonalities()
  }, [])

  const loadTenantAndPersonalities = async () => {
    try {
      const tenantSlug = getTenantFromSubdomain()
      if (!tenantSlug) {
        setError('No tenant specified. Please access via your company subdomain.')
        return
      }

      const response = await fetch(`/api/tenants?slug=${tenantSlug}`)
      if (!response.ok) {
        setError('Invalid tenant. Please check your URL or contact support.')
        return
      }

      const data = await response.json()
      setTenant(data.tenant)

      // Load personalities
      const personalitiesResponse = await fetch('/api/personalities', {
        headers: {
          'x-tenant-id': data.tenant.id,
          'x-tenant-slug': data.tenant.slug
        }
      })

      if (personalitiesResponse.ok) {
        const personalitiesData = await personalitiesResponse.json()
        setPersonalities(personalitiesData.personalities)
        
        // Set current active personality
        const activePersonality = personalitiesData.personalities.find((p: Personality) => p.isActive)
        if (activePersonality) {
          setCurrentPersonality(activePersonality)
          setFormData({
            name: activePersonality.name,
            description: activePersonality.description || '',
            tone: activePersonality.tone,
            style: activePersonality.style,
            expertise: activePersonality.expertise,
            philosophy: activePersonality.philosophy,
            values: activePersonality.values,
            brandVoice: activePersonality.brandVoice || '',
            customPrompt: activePersonality.customPrompt || '',
            responseLength: activePersonality.responseLength,
            language: activePersonality.language
          })
        }
      }
    } catch (error) {
      setError('Unable to load personality configuration.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTenantFromSubdomain = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]
      return subdomain !== 'localhost' && subdomain !== 'www' ? subdomain : null
    }
    return null
  }

  const handleSave = async () => {
    if (!tenant) return

    setIsSaving(true)
    setError(null)

    try {
      const url = currentPersonality 
        ? `/api/personalities?id=${currentPersonality.id}`
        : '/api/personalities'

      const response = await fetch(url, {
        method: currentPersonality ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant.id,
          'x-tenant-slug': tenant.slug
        },
        body: JSON.stringify({
          ...formData,
          isActive: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save personality')
      }

      await loadTenantAndPersonalities()
      setShowCreateForm(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save personality')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (personalityId: string) => {
    if (!tenant || !confirm('Are you sure you want to delete this personality?')) return

    try {
      const response = await fetch(`/api/personalities?id=${personalityId}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': tenant.id,
          'x-tenant-slug': tenant.slug
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete personality')
      }

      await loadTenantAndPersonalities()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete personality')
    }
  }

  const addPhilosophyEntry = () => {
    setFormData(prev => ({
      ...prev,
      philosophy: { ...prev.philosophy, [`philosophy_${Object.keys(prev.philosophy).length + 1}`]: '' }
    }))
  }

  const updatePhilosophy = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      philosophy: { ...prev.philosophy, [key]: value }
    }))
  }

  const removePhilosophy = (key: string) => {
    setFormData(prev => {
      const newPhilosophy = { ...prev.philosophy }
      delete newPhilosophy[key]
      return { ...prev, philosophy: newPhilosophy }
    })
  }

  const addValueEntry = () => {
    setFormData(prev => ({
      ...prev,
      values: { ...prev.values, [`value_${Object.keys(prev.values).length + 1}`]: '' }
    }))
  }

  const updateValue = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      values: { ...prev.values, [key]: value }
    }))
  }

  const removeValue = (key: string) => {
    setFormData(prev => {
      const newValues = { ...prev.values }
      delete newValues[key]
      return { ...prev, values: newValues }
    })
  }

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-primary-600 font-sora">Loading personality configuration...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary-900 mb-2 font-sora">Invalid Tenant</h2>
          <p className="text-primary-600 font-sora">{error}</p>
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
                href="/dashboard"
                className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora"
              >
                Dashboard
              </a>
              <a 
                href="/knowledge"
                className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora"
              >
                Knowledge Base
              </a>
              <a 
                href="/settings/personality"
                className="text-accent-600 font-medium px-3 py-2 text-sm font-sora"
              >
                AI Personality
              </a>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2 font-sora">
                AI Personality Configuration
              </h1>
              <p className="text-primary-600 font-sora">
                Customize how your AI assistant communicates with your team and customers
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium font-sora flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Personality</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-error-500" />
              <p className="text-error-700 font-sora">{error}</p>
            </div>
          </div>
        )}

        {/* Personality List */}
        {personalities.length > 0 && !showCreateForm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-900 mb-4 font-sora">Your Personalities</h2>
            <div className="grid gap-4">
              {personalities.map((personality) => (
                <div
                  key={personality.id}
                  className={`bg-white border rounded-lg p-6 ${
                    personality.isActive ? 'border-accent-300 bg-accent-50' : 'border-primary-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-primary-900 font-sora">
                          {personality.name}
                        </h3>
                        {personality.isActive && (
                          <span className="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-xs font-medium font-sora">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setCurrentPersonality(personality)
                          setFormData({
                            name: personality.name,
                            description: personality.description || '',
                            tone: personality.tone,
                            style: personality.style,
                            expertise: personality.expertise,
                            philosophy: personality.philosophy,
                            values: personality.values,
                            brandVoice: personality.brandVoice || '',
                            customPrompt: personality.customPrompt || '',
                            responseLength: personality.responseLength,
                            language: personality.language
                          })
                          setShowCreateForm(true)
                        }}
                        className="text-primary-600 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(personality.id)}
                        className="text-error-600 hover:text-error-900 p-2 rounded-lg hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {personality.description && (
                    <p className="text-primary-600 mt-2 font-sora">{personality.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-primary-500 font-sora">
                    <span>Tone: {personality.tone}</span>
                    <span>Style: {personality.style}</span>
                    <span>Expertise: {personality.expertise.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white border border-primary-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary-900 font-sora">
                {currentPersonality ? 'Edit Personality' : 'Create New Personality'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setCurrentPersonality(null)
                  setFormData({
                    name: '',
                    description: '',
                    tone: 'professional',
                    style: 'balanced',
                    expertise: [],
                    philosophy: {},
                    values: {},
                    brandVoice: '',
                    customPrompt: '',
                    responseLength: 'medium',
                    language: 'en'
                  })
                }}
                className="text-primary-600 hover:text-primary-900 font-sora"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2 font-sora">
                    Personality Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                    placeholder="e.g., Professional, Customer-Focused"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2 font-sora">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                    placeholder="Brief description of this personality"
                  />
                </div>
              </div>

              {/* Tone and Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-3 font-sora">
                    Communication Tone
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {tones.map((tone) => {
                      const Icon = tone.icon
                      return (
                        <button
                          key={tone.value}
                          onClick={() => setFormData(prev => ({ ...prev, tone: tone.value }))}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            formData.tone === tone.value
                              ? 'border-accent-500 bg-accent-50 text-accent-700'
                              : 'border-primary-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium font-sora">{tone.label}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-3 font-sora">
                    Communication Style
                  </label>
                  <div className="space-y-2">
                    {styles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setFormData(prev => ({ ...prev, style: style.value }))}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          formData.style === style.value
                            ? 'border-accent-500 bg-accent-50 text-accent-700'
                            : 'border-primary-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="font-medium font-sora">{style.label}</div>
                        <div className="text-sm text-primary-600 font-sora">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expertise Areas */}
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-3 font-sora">
                  Areas of Expertise
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {expertiseAreas.map((expertise) => (
                    <button
                      key={expertise}
                      onClick={() => toggleExpertise(expertise)}
                      className={`p-3 rounded-lg border transition-colors ${
                        formData.expertise.includes(expertise)
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <span className="font-medium font-sora capitalize">
                        {expertise.replace('-', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Philosophical Foundations */}
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-3 font-sora">
                  Philosophical Foundations
                </label>
                <div className="space-y-3">
                  {Object.entries(formData.philosophy).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updatePhilosophy(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                        placeholder="e.g., Innovation: We believe in pushing boundaries..."
                      />
                      <button
                        onClick={() => removePhilosophy(key)}
                        className="text-error-600 hover:text-error-900 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addPhilosophyEntry}
                    className="text-accent-600 hover:text-accent-700 font-medium font-sora flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Philosophy</span>
                  </button>
                </div>
              </div>

              {/* Core Values */}
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-3 font-sora">
                  Core Values
                </label>
                <div className="space-y-3">
                  {Object.entries(formData.values).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateValue(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                        placeholder="e.g., Excellence: Delivering the highest quality..."
                      />
                      <button
                        onClick={() => removeValue(key)}
                        className="text-error-600 hover:text-error-900 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addValueEntry}
                    className="text-accent-600 hover:text-accent-700 font-medium font-sora flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Value</span>
                  </button>
                </div>
              </div>

              {/* Brand Voice */}
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-2 font-sora">
                  Brand Voice
                </label>
                <textarea
                  value={formData.brandVoice}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandVoice: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                  placeholder="Describe your company's voice and communication style..."
                />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-2 font-sora">
                  Custom Instructions
                </label>
                <textarea
                  value={formData.customPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                  placeholder="Additional instructions for the AI (optional)..."
                />
              </div>

              {/* Response Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2 font-sora">
                    Response Length
                  </label>
                  <select
                    value={formData.responseLength}
                    onChange={(e) => setFormData(prev => ({ ...prev, responseLength: e.target.value }))}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                  >
                    {responseLengths.map((length) => (
                      <option key={length.value} value={length.value}>
                        {length.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2 font-sora">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-primary-200">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-primary-600 hover:text-primary-900 font-medium font-sora"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name}
                  className="bg-accent-500 hover:bg-accent-600 disabled:bg-primary-300 text-white px-6 py-2 rounded-lg font-medium font-sora flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Personality</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {personalities.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2 font-sora">
              No Personalities Configured
            </h3>
            <p className="text-primary-600 mb-6 font-sora">
              Create your first AI personality to customize how your assistant communicates.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium font-sora"
            >
              Create First Personality
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
