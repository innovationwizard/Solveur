import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  createPersonality, 
  updatePersonality, 
  listPersonalities,
  getPersonality 
} from '@/lib/personalityService'
import { getTenantFromHeaders } from '@/lib/tenant'
import { z } from 'zod'

const personalitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tone: z.enum(['professional', 'friendly', 'casual', 'formal', 'enthusiastic']),
  style: z.enum(['concise', 'detailed', 'conversational', 'technical', 'inspirational', 'balanced']),
  expertise: z.array(z.string()),
  philosophy: z.record(z.string()),
  values: z.record(z.string()),
  brandVoice: z.string().optional(),
  customPrompt: z.string().optional(),
  context: z.record(z.any()).optional(),
  responseLength: z.enum(['short', 'medium', 'long']),
  language: z.string().default('en'),
  isActive: z.boolean().optional()
})

export async function GET(request: NextRequest) {
  try {
    const tenant = await getTenantFromHeaders()
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const personalityId = searchParams.get('id')

    if (personalityId) {
      // Get specific personality
      const personality = await prisma.personality.findFirst({
        where: {
          id: personalityId,
          tenantId: tenant.id
        }
      })

      if (!personality) {
        return NextResponse.json(
          { error: 'Personality not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ personality })
    } else {
      // List all personalities for tenant
      const personalities = await listPersonalities(tenant.id)
      return NextResponse.json({ personalities })
    }
  } catch (error) {
    console.error('Error fetching personalities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personalities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantFromHeaders()
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = personalitySchema.parse(body)

    // Deactivate other personalities if this one should be active
    if (validatedData.isActive !== false) {
      await prisma.personality.updateMany({
        where: { tenantId: tenant.id },
        data: { isActive: false }
      })
    }

    const personality = await createPersonality(tenant.id, {
      ...validatedData,
      isActive: validatedData.isActive !== false
    })

    if (!personality) {
      return NextResponse.json(
        { error: 'Failed to create personality' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Personality created successfully',
      personality
    })
  } catch (error) {
    console.error('Error creating personality:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create personality' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenant = await getTenantFromHeaders()
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const personalityId = searchParams.get('id')

    if (!personalityId) {
      return NextResponse.json(
        { error: 'Personality ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = personalitySchema.partial().parse(body)

    // Check if personality belongs to tenant
    const existingPersonality = await prisma.personality.findFirst({
      where: {
        id: personalityId,
        tenantId: tenant.id
      }
    })

    if (!existingPersonality) {
      return NextResponse.json(
        { error: 'Personality not found' },
        { status: 404 }
      )
    }

    // Deactivate other personalities if this one should be active
    if (validatedData.isActive === true) {
      await prisma.personality.updateMany({
        where: { 
          tenantId: tenant.id,
          id: { not: personalityId }
        },
        data: { isActive: false }
      })
    }

    const personality = await updatePersonality(personalityId, validatedData)

    if (!personality) {
      return NextResponse.json(
        { error: 'Failed to update personality' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Personality updated successfully',
      personality
    })
  } catch (error) {
    console.error('Error updating personality:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update personality' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenant = await getTenantFromHeaders()
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const personalityId = searchParams.get('id')

    if (!personalityId) {
      return NextResponse.json(
        { error: 'Personality ID is required' },
        { status: 400 }
      )
    }

    // Check if personality belongs to tenant
    const existingPersonality = await prisma.personality.findFirst({
      where: {
        id: personalityId,
        tenantId: tenant.id
      }
    })

    if (!existingPersonality) {
      return NextResponse.json(
        { error: 'Personality not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of the only active personality
    if (existingPersonality.isActive) {
      const activeCount = await prisma.personality.count({
        where: {
          tenantId: tenant.id,
          isActive: true
        }
      })

      if (activeCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only active personality' },
          { status: 400 }
        )
      }
    }

    await prisma.personality.delete({
      where: { id: personalityId }
    })

    return NextResponse.json({
      message: 'Personality deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting personality:', error)
    return NextResponse.json(
      { error: 'Failed to delete personality' },
      { status: 500 }
    )
  }
}
