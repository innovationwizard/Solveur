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

    // Get all tenants with usage statistics
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            users: {
              where: { status: 'ACTIVE' }
            }
          }
        },
        usage: {
          where: {
            type: 'API_CALLS'
          },
          select: {
            count: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data for the frontend
    const transformedTenants = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      usersCount: tenant._count.users,
      apiCallsCount: tenant.usage.reduce((sum, usage) => sum + usage.count, 0)
    }))

    return NextResponse.json({ tenants: transformedTenants })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
