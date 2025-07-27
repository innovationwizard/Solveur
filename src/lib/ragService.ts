import { generateEmbedding, generateResponse } from './openaiService'
import { searchSimilarContent } from './pineconeService'

export interface RAGOptions {
  companyId: string
  companyName?: string
  topK?: number
  minSimilarity?: number
}

export async function processQuery(
  query: string,
  options: RAGOptions
): Promise<string> {
  try {
    // Generate embedding for the user query
    const queryEmbedding = await generateEmbedding(query)
    
    // Search for relevant content in the company's knowledge base
    const relevantContent = await searchSimilarContent(
      queryEmbedding,
      options.companyId,
      options.topK || 5
    )
    
    // Create context from retrieved content
    const context = relevantContent.length > 0
      ? relevantContent.join('\n\n')
      : 'No specific company information available for this query.'
    
    // Generate response using OpenAI with context
    const response = await generateResponse(
      query,
      context,
      options.companyName || 'the company'
    )
    
    return response
  } catch (error) {
    console.error('Error in RAG processing:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again.'
  }
}

// Demo knowledge base for testing
export const DEMO_KNOWLEDGE = {
  'demo-company': [
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
    }
  ]
}