import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const googleSSOSchema = z.object({
  tenantSlug: z.string().min(1),
  redirectTo: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = googleSSOSchema.parse(body)
    
    // In a real implementation, you would:
    // 1. Check if Google SSO is enabled for this tenant
    // 2. Generate OAuth state parameter
    // 3. Redirect to Google OAuth
    
    const googleAuthUrl = new URL('https://accounts.google.com/oauth/authorize')
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID || '')
    googleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/google/callback`)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile')
    googleAuthUrl.searchParams.set('state', JSON.stringify({
      tenantSlug: validatedData.tenantSlug,
      redirectTo: validatedData.redirectTo || '/dashboard'
    }))
    
    return NextResponse.json({
      url: googleAuthUrl.toString()
    })
    
  } catch (error) {
    console.error('Google SSO error:', error)
    return NextResponse.json(
      { error: 'SSO configuration error' },
      { status: 500 }
    )
  }
}
