import { NextRequest, NextResponse } from 'next/server'
import { createTenant } from '@/lib/tenant'
import { hashPassword } from '@/lib/auth'
import { createIndustryBasedPersonality } from '@/lib/personalityService'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  industry: z.string().optional(),
  size: z.string().optional(),
  domain: z.string().url().optional(),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(2).max(100),
  ownerPassword: z.string().min(8),
  setup: z.object({
    integrations: z.array(z.string()).optional(),
    branding: z.object({
      logo: z.string().url().optional(),
      primaryColor: z.string().optional()
    }).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createTenantSchema.parse(body)
    
    // Check if tenant slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Organization subdomain is already taken' },
        { status: 409 }
      )
    }

    // Create tenant with additional data
    const newTenant = await prisma.tenant.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        domain: validatedData.domain,
        plan: 'FREE',
        status: 'ACTIVE',
        metadata: {
          industry: validatedData.industry,
          size: validatedData.size,
          setup: validatedData.setup
        }
      }
    })

    // Create industry-based personality
    const industry = validatedData.industry || 'technology'
    await createIndustryBasedPersonality(
      newTenant.id,
      industry,
      validatedData.name
    )

    // Hash the owner's password
    const hashedPassword = await hashPassword(validatedData.ownerPassword)

    // Create the owner user
    const owner = await prisma.user.create({
      data: {
        email: validatedData.ownerEmail,
        name: validatedData.ownerName,
        password: hashedPassword,
        role: 'OWNER',
        status: 'ACTIVE',
        tenantId: newTenant.id
      }
    })

    // Log tenant creation
    await prisma.auditLog.create({
      data: {
        action: 'TENANT_CREATED',
        resource: 'tenant',
        resourceId: newTenant.id,
        tenantId: newTenant.id,
        userId: owner.id,
        userEmail: owner.email,
        metadata: {
          tenantName: newTenant.name,
          tenantSlug: newTenant.slug,
          industry: validatedData.industry,
          size: validatedData.size
        }
      }
    })

    return NextResponse.json({
      message: 'Tenant created successfully',
      tenant: {
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
        domain: newTenant.domain
      },
      owner: {
        id: owner.id,
        email: owner.email,
        name: owner.name
      }
    })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
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

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        users: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    )
  }
} 