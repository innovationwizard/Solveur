import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
  redirect: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signInSchema.parse(body)
    
    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { 
        slug: validatedData.tenantSlug,
        status: 'ACTIVE'
      }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant or tenant is not active' },
        { status: 404 }
      )
    }

    // Find user in tenant
    const user = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        tenantId: tenant.id,
        status: 'ACTIVE'
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)

    if (!isValidPassword) {
      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          resource: 'user',
          resourceId: user.id,
          tenantId: tenant.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            reason: 'invalid_password',
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          }
        }
      })

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        role: user.role
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // Log successful login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        resource: 'user',
        resourceId: user.id,
        tenantId: tenant.id,
        userId: user.id,
        userEmail: user.email,
        metadata: {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        updatedAt: new Date()
      }
    })

    // Set secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
        tenantSlug: tenant.slug
      }
    })

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Sign in error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
