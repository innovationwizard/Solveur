import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTenantSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED'])
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const validatedData = updateTenantSchema.parse(body)

    // Update tenant status
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: { status: validatedData.status }
    })

    // Log the action
    await prisma.superuserLog.create({
      data: {
        action: 'UPDATE_TENANT_STATUS',
        details: {
          tenantId: tenant.id,
          oldStatus: tenant.status,
          newStatus: validatedData.status
        },
        userId: user.id
      }
    })

    return NextResponse.json({
      message: 'Tenant status updated successfully',
      tenant: {
        id: tenant.id,
        status: tenant.status
      }
    })
  } catch (error) {
    console.error('Error updating tenant status:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
