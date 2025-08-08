import { Pinecone } from '@pinecone-database/pinecone'

// Check if Pinecone is properly configured
const isPineconeConfigured = () => {
  return process.env.PINECONE_API_KEY && 
         process.env.PINECONE_HOST && 
         process.env.PINECONE_INDEX_NAME
}

let pinecone: Pinecone | null = null
let indexName: string | null = null

if (isPineconeConfigured()) {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_HOST!, // Use your host as environment
  })
  indexName = process.env.PINECONE_INDEX_NAME!
} else {
  console.warn('Pinecone not configured. Vector search will be disabled.')
}

export async function searchSimilarContent(
  embedding: number[],
  companyId: string,
  topK: number = 5
): Promise<string[]> {
  try {
    // If Pinecone is not configured, return empty array
    if (!pinecone || !indexName) {
      console.log('Pinecone not configured, skipping vector search')
      return []
    }

    const index = pinecone.index(indexName)
    
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: { companyId: companyId }
    })

    return queryResponse.matches?.map(match => 
      match.metadata?.content as string || ''
    ).filter(content => content.length > 0) || []
  } catch (error) {
    console.error('Error searching Pinecone:', error)
    return []
  }
}

export async function upsertDocument(
  id: string,
  embedding: number[],
  content: string,
  companyId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    // If Pinecone is not configured, skip upsert
    if (!pinecone || !indexName) {
      console.log('Pinecone not configured, skipping document upsert')
      return
    }

    const index = pinecone.index(indexName)
    
    await index.upsert([{
      id,
      values: embedding,
      metadata: {
        content,
        companyId,
        ...metadata,
        timestamp: new Date().toISOString()
      }
    }])
  } catch (error) {
    console.error('Error upserting to Pinecone:', error)
    // Don't throw error to prevent breaking the app
    console.warn('Document upsert failed, continuing without vector storage')
  }
}