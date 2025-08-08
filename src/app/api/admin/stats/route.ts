import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.isSuperuser) {
      return NextResponse.json(
        { error: 'Forbidden. Superuser access required.' },
        { status: 403 }
      )
    }

    // Get system-wide statistics
    const [
      totalTenants,
      totalUsers,
      totalDocuments,
      activeConversations,
      apiCallsStats
    ] = await Promise.all([
      prisma.tenant.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.user.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.document.count(),
      prisma.conversation.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.usage.aggregate({
        where: { type: 'API_CALLS' },
        _sum: { count: true }
      })
    ])

    return NextResponse.json({
      totalTenants,
      totalUsers,
      totalDocuments,
      activeConversations,
      totalApiCalls: apiCallsStats._sum.count || 0
    })
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
