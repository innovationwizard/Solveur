import { NextRequest, NextResponse } from 'next/server'
import { createTenant } from '@/lib/tenant'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  domain: z.string().url().optional(),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(2).max(100),
  ownerPassword: z.string().min(8)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createTenantSchema.parse(body)
    
    // Check if tenant slug already exists
    const existingTenant = await createTenant({
      name: validatedData.name,
      slug: validatedData.slug,
      domain: validatedData.domain,
      ownerEmail: validatedData.ownerEmail,
      ownerName: validatedData.ownerName
    })

    if (!existingTenant) {
      return NextResponse.json(
        { error: 'Tenant creation failed' },
        { status: 500 }
      )
    }

    // Hash the owner's password
    const hashedPassword = await hashPassword(validatedData.ownerPassword)

    // Update the owner user with password
    const { prisma } = await import('@/lib/prisma')
    await prisma.user.updateMany({
      where: {
        email: validatedData.ownerEmail,
        tenantId: existingTenant.id
      },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({
      success: true,
      tenant: {
        id: existingTenant.id,
        name: existingTenant.name,
        slug: existingTenant.slug,
        domain: existingTenant.domain
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Tenant creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
        { status: 400 }
      )
    }

    const { getTenantBySlug } = await import('@/lib/tenant')
    const tenant = await getTenantBySlug(slug)

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Tenant lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 