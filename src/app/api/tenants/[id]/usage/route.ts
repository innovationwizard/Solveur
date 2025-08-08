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

    // Get usage statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // API calls today
    const apiCallsToday = await prisma.usage.findUnique({
      where: {
        tenantId_date_type: {
          tenantId: tenantId,
          date: today,
          type: 'API_CALLS'
        }
      }
    })

    // Total conversations
    const conversationsCount = await prisma.conversation.count({
      where: {
        tenantId: tenantId,
        status: 'ACTIVE'
      }
    })

    // Total users
    const usersCount = await prisma.user.count({
      where: {
        tenantId: tenantId,
        status: 'ACTIVE'
      }
    })

    // Total documents (placeholder - would need knowledge base integration)
    const documentsCount = 0 // This would come from knowledge base documents

    const stats = {
      apiCalls: apiCallsToday?.count || 0,
      conversations: conversationsCount,
      users: usersCount,
      documents: documentsCount
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching tenant usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    )
  }
}
