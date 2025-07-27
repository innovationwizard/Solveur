import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
  environment: process.env.PINECONE_HOST || '', // Use your host as environment
})

const indexName = process.env.PINECONE_INDEX_NAME || 'solveur'

export async function searchSimilarContent(
  embedding: number[],
  companyId: string,
  topK: number = 5
): Promise<string[]> {
  try {
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
    throw error
  }
}