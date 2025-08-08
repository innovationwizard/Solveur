'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building, 
  User, 
  Settings, 
  Rocket, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Bot
} from 'lucide-react'

interface TenantData {
  name: string
  slug: string
  industry: string
  size: string
}

interface AdminData {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface SetupData {
  integrations: string[]
  branding: {
    logo?: string
    primaryColor?: string
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [tenantData, setTenantData] = useState<TenantData>({
    name: '',
    slug: '',
    industry: '',
    size: ''
  })
  const [adminData, setAdminData] = useState<AdminData>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })
  const [setupData, setSetupData] = useState<SetupData>({
    integrations: [],
    branding: {}
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Validation states
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)

  const steps = [
    { id: 1, title: 'Organization', icon: Building },
    { id: 2, title: 'Admin Account', icon: User },
    { id: 3, title: 'Setup', icon: Settings },
    { id: 4, title: 'Get Started', icon: Rocket }
  ]

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Other'
  ]

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ]

  const integrations = [
    { id: 'slack', name: 'Slack', description: 'Connect your team chat' },
    { id: 'zendesk', name: 'Zendesk', description: 'Sync support tickets' },
    { id: 'salesforce', name: 'Salesforce', description: 'CRM integration' },
    { id: 'hubspot', name: 'HubSpot', description: 'Marketing automation' }
  ]

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTenantNameChange = (name: string) => {
    const slug = generateSlug(name)
    setTenantData(prev => ({ ...prev, name, slug }))
    
    // Check slug availability
    if (slug.length > 2) {
      checkSlugAvailability(slug)
    }
  }

  const checkSlugAvailability = async (slug: string) => {
    setIsCheckingSlug(true)
    try {
      const response = await fetch(`/api/tenants/check-slug?slug=${slug}`)
      const data = await response.json()
      setSlugAvailable(data.available)
    } catch (error) {
      setSlugAvailable(false)
    } finally {
      setIsCheckingSlug(false)
    }
  }

  const validateStep1 = () => {
    return tenantData.name.length > 0 && 
           tenantData.slug.length > 0 && 
           tenantData.industry && 
           tenantData.size &&
           slugAvailable === true
  }

  const validateStep2 = () => {
    return adminData.email.length > 0 && 
           adminData.password.length >= 8 &&
           adminData.firstName.length > 0 &&
           adminData.lastName.length > 0 &&
           acceptedTerms
  }

  const validateStep3 = () => {
    return true // Optional step
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return validateStep1()
      case 2: return validateStep2()
      case 3: return validateStep3()
      default: return true
    }
  }

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
      setError('')
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tenantData,
          ownerEmail: adminData.email,
          ownerName: `${adminData.firstName} ${adminData.lastName}`,
          ownerPassword: adminData.password,
          setup: setupData
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to dashboard
        router.push(`/dashboard?welcome=true`)
      } else {
        setError(data.error || 'Failed to create organization. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
          Organization Name *
        </label>
        <input
          id="orgName"
          type="text"
          value={tenantData.name}
          onChange={(e) => handleTenantNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your organization name"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Subdomain *
        </label>
        <div className="flex">
          <input
            id="slug"
            type="text"
            value={tenantData.slug}
            onChange={(e) => setTenantData(prev => ({ ...prev, slug: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your-company"
          />
          <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
            .solveur.com
          </span>
        </div>
        {isCheckingSlug && (
          <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
        )}
        {slugAvailable === true && (
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Subdomain is available
          </p>
        )}
        {slugAvailable === false && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Subdomain is taken
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <select
            id="industry"
            value={tenantData.industry}
            onChange={(e) => setTenantData(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
            Company Size *
          </label>
          <select
            id="size"
            value={tenantData.size}
            onChange={(e) => setTenantData(prev => ({ ...prev, size: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select size</option>
            {companySizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={adminData.firstName}
            onChange={(e) => setAdminData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={adminData.lastName}
            onChange={(e) => setAdminData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          value={adminData.email}
          onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={adminData.password}
            onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Must be at least 8 characters long
        </p>
      </div>

      <div className="flex items-start">
        <input
          id="terms"
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
          I agree to the{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </Link>
        </label>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Integrations (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your existing tools to get started faster
        </p>
        <div className="space-y-3">
          {integrations.map(integration => (
            <label key={integration.id} className="flex items-center">
              <input
                type="checkbox"
                checked={setupData.integrations.includes(integration.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSetupData(prev => ({
                      ...prev,
                      integrations: [...prev.integrations, integration.id]
                    }))
                  } else {
                    setSetupData(prev => ({
                      ...prev,
                      integrations: prev.integrations.filter(id => id !== integration.id)
                    }))
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                <p className="text-sm text-gray-500">{integration.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Branding (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize your organization's appearance
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              id="logo"
              type="url"
              value={setupData.branding.logo || ''}
              onChange={(e) => setSetupData(prev => ({
                ...prev,
                branding: { ...prev.branding, logo: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <input
              id="primaryColor"
              type="color"
              value={setupData.branding.primaryColor || '#3B82F6'}
              onChange={(e) => setSetupData(prev => ({
                ...prev,
                branding: { ...prev.branding, primaryColor: e.target.value }
              }))}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          You're all set!
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Your organization has been created successfully. Here's what you can do next:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Invite Team Members</h4>
          <p className="text-sm text-blue-700 mb-3">
            Add your team to collaborate on customer support
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            Invite Users →
          </button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Upload Knowledge Base</h4>
          <p className="text-sm text-green-700 mb-3">
            Import your documentation and FAQs
          </p>
          <button className="text-sm text-green-600 hover:text-green-500 font-medium">
            Upload Files →
          </button>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">Configure Integrations</h4>
          <p className="text-sm text-purple-700 mb-3">
            Connect your existing tools and workflows
          </p>
          <button className="text-sm text-purple-600 hover:text-purple-500 font-medium">
            Set Up Integrations →
          </button>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2">Customize Branding</h4>
          <p className="text-sm text-orange-700 mb-3">
            Add your logo and brand colors
          </p>
          <button className="text-sm text-orange-600 hover:text-orange-500 font-medium">
            Customize →
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900 font-sora">
              Welcome to Solveur
            </h1>
          </div>
          <p className="text-lg text-primary-600 font-sora">
            Let's get your organization set up in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <div className="flex items-center space-x-3">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Organization
                      <Rocket className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 