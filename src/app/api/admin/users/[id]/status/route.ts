import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateUserSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
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

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!adminUser?.isSuperuser) {
      return NextResponse.json(
        { error: 'Forbidden. Superuser access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Update user status
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: validatedData.status }
    })

    // Log the action
    await prisma.superuserLog.create({
      data: {
        action: 'UPDATE_USER_STATUS',
        details: {
          userId: user.id,
          oldStatus: user.status,
          newStatus: validatedData.status
        },
        userId: adminUser.id
      }
    })

    return NextResponse.json({
      message: 'User status updated successfully',
      user: {
        id: user.id,
        status: user.status
      }
    })
  } catch (error) {
    console.error('Error updating user status:', error)
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
