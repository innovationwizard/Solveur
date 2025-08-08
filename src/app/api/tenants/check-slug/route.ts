import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkSlugSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    // Validate slug format
    const validatedData = checkSlugSchema.parse({ slug })

    // Check if slug is reserved
    const reservedSlugs = [
      'www', 'api', 'admin', 'app', 'auth', 'dashboard', 'support',
      'help', 'docs', 'status', 'blog', 'mail', 'email', 'test',
      'demo', 'staging', 'dev', 'beta', 'alpha'
    ]

    if (reservedSlugs.includes(validatedData.slug)) {
      return NextResponse.json({
        available: false,
        reason: 'reserved'
      })
    }

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: validatedData.slug },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingTenant,
      slug: validatedData.slug
    })

  } catch (error) {
    console.error('Check slug error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
