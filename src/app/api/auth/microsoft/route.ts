import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const microsoftSSOSchema = z.object({
  tenantSlug: z.string().min(1),
  redirectTo: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = microsoftSSOSchema.parse(body)
    
    // In a real implementation, you would:
    // 1. Check if Microsoft SSO is enabled for this tenant
    // 2. Generate OAuth state parameter
    // 3. Redirect to Microsoft OAuth
    
    const microsoftAuthUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
    microsoftAuthUrl.searchParams.set('client_id', process.env.MICROSOFT_CLIENT_ID || '')
    microsoftAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/microsoft/callback`)
    microsoftAuthUrl.searchParams.set('response_type', 'code')
    microsoftAuthUrl.searchParams.set('scope', 'openid email profile')
    microsoftAuthUrl.searchParams.set('state', JSON.stringify({
      tenantSlug: validatedData.tenantSlug,
      redirectTo: validatedData.redirectTo || '/dashboard'
    }))
    
    return NextResponse.json({
      url: microsoftAuthUrl.toString()
    })
    
  } catch (error) {
    console.error('Microsoft SSO error:', error)
    return NextResponse.json(
      { error: 'SSO configuration error' },
      { status: 500 }
    )
  }
}
