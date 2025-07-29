import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes that don't need tenant context
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle tenant routing
  const tenant = await getTenantFromRequest(request)
  
  if (!tenant) {
    // Redirect to tenant selection or signup
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/auth/select-tenant', request.url))
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Add tenant context to headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenant.id)
  requestHeaders.set('x-tenant-slug', tenant.slug)

  // Check tenant status
  if (tenant.status !== 'ACTIVE') {
    if (pathname !== '/billing/suspended') {
      return NextResponse.redirect(new URL('/billing/suspended', request.url))
    }
  }

  // Check user authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: {
        id: token.sub,
        tenantId: tenant.id,
        status: 'ACTIVE'
      }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Add user context to headers
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

async function getTenantFromRequest(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl
  
  // Check for custom domain
  if (hostname !== 'localhost' && !hostname.includes('vercel.app')) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        domain: hostname,
        status: 'ACTIVE'
      }
    })
    return tenant
  }

  // Check for subdomain
  const subdomain = hostname.split('.')[0]
  if (subdomain && subdomain !== 'www') {
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug: subdomain,
        status: 'ACTIVE'
      }
    })
    return tenant
  }

  // Check for path-based routing (e.g., /tenant-slug/...)
  const pathSegments = pathname.split('/').filter(Boolean)
  if (pathSegments.length > 0) {
    const tenantSlug = pathSegments[0]
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug: tenantSlug,
        status: 'ACTIVE'
      }
    })
    return tenant
  }

  return null
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/conversations',
    '/knowledge-base',
    '/settings',
    '/billing',
    '/api/chat',
    '/api/conversations',
    '/api/knowledge-base'
  ]
  
  return protectedRoutes.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 