import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processDocument } from '@/lib/documentProcessor'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const knowledgeBaseId = params.id

    // Verify knowledge base exists
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeBaseId }
    })

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      )
    }

    // Get documents
    const documents = await prisma.document.findMany({
      where: {
        knowledgeBaseId: knowledgeBaseId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform documents to include status
    const documentsWithStatus = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      status: (doc.metadata as any)?.status || 'active'
    }))

    return NextResponse.json({
      documents: documentsWithStatus
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const knowledgeBaseId = params.id

    // Verify knowledge base exists
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeBaseId }
    })

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      )
    }

    // Handle file upload
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedDocuments = []

    for (const file of files) {
      try {
        // Read file content
        const content = await file.text()
        
        // Create document record
        const document = await prisma.document.create({
          data: {
            title: file.name,
            content: content,
            knowledgeBaseId: knowledgeBaseId,
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              status: 'processing',
              uploadedAt: new Date().toISOString()
            }
          }
        })

        // Process document asynchronously (in a real app, this would be a background job)
        try {
          await processDocument(document.id, content, knowledgeBase.tenantId)
          
          // Update document status to active
          await prisma.document.update({
            where: { id: document.id },
            data: {
              metadata: {
                ...(document.metadata as any),
                status: 'active',
                processedAt: new Date().toISOString()
              }
            }
          })
        } catch (processingError) {
          console.error('Error processing document:', processingError)
          
          // Update document status to error
          await prisma.document.update({
            where: { id: document.id },
            data: {
              metadata: {
                ...(document.metadata as any),
                status: 'error',
                error: processingError instanceof Error ? processingError.message : 'Processing failed'
              }
            }
          })
        }

        uploadedDocuments.push({
          id: document.id,
          title: document.title,
          status: 'processing'
        })
      } catch (error) {
        console.error('Error uploading file:', error)
        // Continue with other files
      }
    }

    return NextResponse.json({
      message: `Uploaded ${uploadedDocuments.length} documents`,
      documents: uploadedDocuments
    })
  } catch (error) {
    console.error('Error uploading documents:', error)
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    )
  }
}
