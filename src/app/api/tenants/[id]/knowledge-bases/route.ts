import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get knowledge bases with document counts
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: {
        tenantId: tenantId,
        isActive: true
      },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to include document count
    const knowledgeBasesWithCounts = knowledgeBases.map(kb => ({
      id: kb.id,
      name: kb.name,
      description: kb.description,
      isActive: kb.isActive,
      documentCount: kb._count.documents,
      createdAt: kb.createdAt,
      updatedAt: kb.updatedAt
    }))

    return NextResponse.json({
      knowledgeBases: knowledgeBasesWithCounts
    })
  } catch (error) {
    console.error('Error fetching knowledge bases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge bases' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id
    const { name, description } = await request.json()

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Create new knowledge base
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: {
        name: name || 'Default Knowledge Base',
        description: description || '',
        tenantId: tenantId,
        isActive: true
      }
    })

    return NextResponse.json({
      knowledgeBase: {
        id: knowledgeBase.id,
        name: knowledgeBase.name,
        description: knowledgeBase.description,
        isActive: knowledgeBase.isActive,
        documentCount: 0,
        createdAt: knowledgeBase.createdAt,
        updatedAt: knowledgeBase.updatedAt
      }
    })
  } catch (error) {
    console.error('Error creating knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to create knowledge base' },
      { status: 500 }
    )
  }
}
