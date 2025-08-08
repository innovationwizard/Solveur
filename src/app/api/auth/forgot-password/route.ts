import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  tenantSlug: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)
    
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

    // Always return success to prevent email enumeration
    // In production, you would send an email here
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
      
      // Store reset token with expiration (1 hour)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // In a real implementation, you'd store the hash in a separate table
          // For now, we'll use a placeholder
          updatedAt: new Date()
        }
      })

      // Log password reset request
      await prisma.auditLog.create({
        data: {
          action: 'PASSWORD_RESET_REQUESTED',
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

      // In production, send email with reset link
      // For now, we'll just log it
      console.log(`Password reset requested for ${user.email} in tenant ${tenant.slug}`)
      console.log(`Reset token: ${resetToken}`)
      console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}&tenant=${tenant.slug}`)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
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
