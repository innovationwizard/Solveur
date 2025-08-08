import { generateEmbedding, generateResponse } from './openaiService'
import { searchSimilarContent } from './pineconeService'
import { TenantContext } from './tenant'
import { getPersonality, PersonalityConfig } from './personalityService'

export interface RAGOptions {
  companyId: string
  companyName?: string
  topK?: number
  minSimilarity?: number
  tenantContext?: TenantContext
}

export async function processQuery(
  query: string,
  options: RAGOptions
): Promise<string> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return 'I apologize, but the AI service is not properly configured. Please contact support.'
    }

    // Get tenant personality
    const personality = await getPersonality(options.companyId)
    if (!personality) {
      return 'I apologize, but the AI personality is not configured. Please contact your administrator.'
    }

    // Try to generate embedding for the user query
    let queryEmbedding: number[] | null = null
    try {
      queryEmbedding = await generateEmbedding(query)
    } catch (error) {
      console.error('Error generating embedding:', error)
      // Continue without embedding for demo purposes
    }
    
    // Search for relevant content
    let relevantContent: string[] = []
    
    if (queryEmbedding) {
      try {
        relevantContent = await searchSimilarContent(
          queryEmbedding,
          options.companyId,
          options.topK || 5
        )
      } catch (error) {
        console.error('Error searching similar content:', error)
        // Fall back to demo content
      }
    }
    
    // If no relevant content found, use demo content
    if (relevantContent.length === 0) {
      relevantContent = [
        'This is a demo response. In production, this would contain relevant information from your knowledge base.',
        'To get personalized responses, please upload your company documents to the knowledge base.'
      ]
    }
    
    const context = relevantContent.join('\n\n')
    const companyName = options.companyName || 'your company'
    
    // Generate response using personality
    const response = await generateResponse(query, context, personality, companyName)
    
    return response
  } catch (error) {
    console.error('Error processing query:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again.'
  }
}

// Demo knowledge base for testing
export const DEMO_KNOWLEDGE = {
  'demo': [
    {
      id: 'demo-1',
      content: 'Our company specializes in innovative software solutions for small and medium businesses. We offer 24/7 customer support and have been in business for over 10 years.',
      metadata: { type: 'company_info' }
    },
    {
      id: 'demo-2', 
      content: 'Our main products include CRM software, inventory management systems, and automated billing solutions. All products integrate seamlessly with existing business workflows.',
      metadata: { type: 'products' }
    },
    {
      id: 'demo-3',
      content: 'Customer support is available Monday through Friday 9 AM to 6 PM EST. For urgent issues, our emergency hotline is available 24/7. Average response time is under 2 hours.',
      metadata: { type: 'support' }
    },
    {
      id: 'demo-4',
      content: 'We offer three pricing tiers: Basic ($29/month), Professional ($79/month), and Enterprise (custom pricing). All plans include basic support, with priority support available on higher tiers.',
      metadata: { type: 'pricing' }
    },
    {
      id: 'demo-5',
      content: 'Our software is designed to be user-friendly and requires minimal training. We provide comprehensive documentation, video tutorials, and live training sessions for new customers.',
      metadata: { type: 'onboarding' }
    }
  ]
}

function getDemoContent(query: string, companyId: string): string[] {
  const demoContent = DEMO_KNOWLEDGE[companyId as keyof typeof DEMO_KNOWLEDGE] || DEMO_KNOWLEDGE['demo']
  
  // Simple keyword matching for demo purposes
  const queryLower = query.toLowerCase()
  const relevantItems = demoContent.filter(item => {
    const content = item.content.toLowerCase()
    const keywords = queryLower.split(' ').filter(word => word.length > 2)
    return keywords.some(keyword => content.includes(keyword))
  })
  
  // If no specific matches, return all content
  if (relevantItems.length === 0) {
    return demoContent.map(item => item.content)
  }
  
  return relevantItems.map(item => item.content)
}