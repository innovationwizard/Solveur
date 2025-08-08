import { prisma } from './prisma'
import { generateEmbedding } from './openaiService'
import { upsertDocument as upsertToVectorStore } from './pineconeService'

export async function processDocument(
  documentId: string,
  content: string,
  tenantId: string
) {
  try {
    console.log(`Processing document ${documentId} for tenant ${tenantId}`)

    // Generate embedding for the document content
    const embedding = await generateEmbedding(content)
    
    if (!embedding) {
      throw new Error('Failed to generate embedding for document')
    }

    // Update document with embedding
    await prisma.document.update({
      where: { id: documentId },
      data: {
        embedding: embedding,
        vectorId: documentId // Use document ID as vector ID
      }
    })

    // Store in vector database
    await upsertToVectorStore(
      documentId,
      embedding,
      content,
      tenantId
    )

    console.log(`Successfully processed document ${documentId}`)
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error)
    throw error
  }
}

export async function processKnowledgeBase(knowledgeBaseId: string) {
  try {
    console.log(`Processing knowledge base ${knowledgeBaseId}`)

    // Get all documents in the knowledge base
    const documents = await prisma.document.findMany({
      where: {
        knowledgeBaseId: knowledgeBaseId
      }
    })

    // Process each document
    for (const document of documents) {
      try {
        await processDocument(document.id, document.content, document.knowledgeBase.tenantId)
      } catch (error) {
        console.error(`Error processing document ${document.id}:`, error)
        // Continue with other documents
      }
    }

    console.log(`Successfully processed knowledge base ${knowledgeBaseId}`)
  } catch (error) {
    console.error(`Error processing knowledge base ${knowledgeBaseId}:`, error)
    throw error
  }
}

export async function deleteDocumentFromVectorStore(documentId: string) {
  try {
    // In a real implementation, you would delete from the vector store
    // For now, we'll just log the deletion
    console.log(`Deleting document ${documentId} from vector store`)
    
    // If using Pinecone, you would call:
    // await deleteFromPinecone(documentId)
  } catch (error) {
    console.error(`Error deleting document ${documentId} from vector store:`, error)
    throw error
  }
}
