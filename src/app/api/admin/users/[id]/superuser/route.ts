import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSuperuserSchema = z.object({
  isSuperuser: z.boolean()
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
    const validatedData = updateSuperuserSchema.parse(body)

    // Update user superuser status
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isSuperuser: validatedData.isSuperuser }
    })

    // Log the action
    await prisma.superuserLog.create({
      data: {
        action: 'UPDATE_SUPERUSER_STATUS',
        details: {
          userId: user.id,
          oldStatus: !validatedData.isSuperuser,
          newStatus: validatedData.isSuperuser
        },
        userId: adminUser.id
      }
    })

    return NextResponse.json({
      message: 'User superuser status updated successfully',
      user: {
        id: user.id,
        isSuperuser: user.isSuperuser
      }
    })
  } catch (error) {
    console.error('Error updating user superuser status:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid superuser value' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
