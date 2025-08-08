'use client'

import { useState, useEffect } from 'react'
import { 
  Bot, 
  Upload, 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import TenantSwitcher from '@/components/TenantSwitcher'

interface TenantInfo {
  id: string
  name: string
  slug: string
  plan: string
  status: string
}

interface KnowledgeBase {
  id: string
  name: string
  description: string
  isActive: boolean
  documentCount: number
  createdAt: string
  updatedAt: string
}

interface Document {
  id: string
  title: string
  content: string
  metadata: any
  createdAt: string
  updatedAt: string
  status: 'processing' | 'active' | 'error'
}

export default function KnowledgePage() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKB, setSelectedKB] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

  useEffect(() => {
    const loadKnowledgeData = async () => {
      try {
        const tenantSlug = getTenantFromSubdomain()
        
        if (tenantSlug) {
          const response = await fetch(`/api/tenants?slug=${tenantSlug}`)
          if (response.ok) {
            const data = await response.json()
            setTenant(data.tenant)
            
            // Load knowledge bases
            const kbResponse = await fetch(`/api/tenants/${data.tenant.id}/knowledge-bases`)
            if (kbResponse.ok) {
              const kbData = await kbResponse.json()
              setKnowledgeBases(kbData.knowledgeBases)
              if (kbData.knowledgeBases.length > 0) {
                setSelectedKB(kbData.knowledgeBases[0].id)
              }
            }
          } else {
            setError('Invalid tenant. Please check your URL or contact support.')
          }
        } else {
          setError('No tenant specified. Please access via your company subdomain.')
        }
      } catch (error) {
        setError('Unable to load knowledge base data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadKnowledgeData()
  }, [])

  useEffect(() => {
    if (selectedKB) {
      loadDocuments(selectedKB)
    }
  }, [selectedKB])

  const getTenantFromSubdomain = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]
      return subdomain !== 'localhost' && subdomain !== 'www' ? subdomain : null
    }
    return null
  }

  const loadDocuments = async (kbId: string) => {
    try {
      const response = await fetch(`/api/knowledge-bases/${kbId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedKB || uploadFiles.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      uploadFiles.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/knowledge-bases/${selectedKB}/documents`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setUploadFiles([])
        setShowUploadModal(false)
        loadDocuments(selectedKB)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadFiles(files)
  }

  const deleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadDocuments(selectedKB!)
      } else {
        setError('Failed to delete document')
      }
    } catch (error) {
      setError('Failed to delete document')
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-600 font-sora">Loading knowledge base...</p>
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
              <AlertCircle className="w-8 h-8 text-error-500" />
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
                href="/dashboard"
                className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora"
              >
                Dashboard
              </a>
              <a 
                href="/knowledge"
                className="text-accent-600 font-medium px-3 py-2 text-sm font-sora"
              >
                Knowledge Base
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
                Knowledge Base
              </h1>
              <p className="text-primary-600 font-sora">
                Upload and manage your company's knowledge base for AI-powered support.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors font-sora flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Documents</span>
            </button>
          </div>
        </div>

        {/* Knowledge Base Selection */}
        {knowledgeBases.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary-700 mb-2 font-sora">
              Select Knowledge Base
            </label>
            <select
              value={selectedKB || ''}
              onChange={(e) => setSelectedKB(e.target.value)}
              className="w-full max-w-md border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
            >
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name} ({kb.documentCount} documents)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
              />
            </div>
          </div>
          <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-900 px-3 py-2 rounded-lg border border-primary-300 font-sora">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg border border-primary-200 shadow-soft hover:shadow-medium transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 font-sora">{doc.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {doc.status === 'active' && (
                          <span className="flex items-center space-x-1 text-success-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                        {doc.status === 'processing' && (
                          <span className="flex items-center space-x-1 text-warning-600 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Processing</span>
                          </span>
                        )}
                        {doc.status === 'error' && (
                          <span className="flex items-center space-x-1 text-error-600 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>Error</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-primary-400 hover:text-primary-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-primary-400 hover:text-primary-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 text-error-400 hover:text-error-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-primary-600 text-sm font-sora mb-4 line-clamp-3">
                  {doc.content.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-primary-400 font-sora">
                  <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                  <button className="text-accent-500 hover:text-accent-600 flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2 font-sora">
              {searchTerm ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-primary-600 font-sora mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Upload your first document to get started with AI-powered support.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors font-sora"
              >
                Upload Your First Document
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 font-sora">
              Upload Documents
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 mb-2 font-sora">
                Select Files
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileSelect}
                className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-sora"
              />
            </div>

            {uploadFiles.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-primary-700 mb-2 font-sora">
                  Selected Files ({uploadFiles.length})
                </label>
                <div className="space-y-2">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-primary-50 rounded">
                      <span className="text-sm text-primary-700 font-sora">{file.name}</span>
                      <span className="text-xs text-primary-500 font-sora">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFiles([])
                }}
                className="px-4 py-2 text-primary-600 hover:text-primary-900 font-sora"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={uploading || uploadFiles.length === 0}
                className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed font-sora"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-error-50 border border-error-200 rounded-lg p-4 shadow-large">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-error-500" />
            <span className="text-error-700 font-sora">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
