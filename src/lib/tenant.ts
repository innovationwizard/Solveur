import { headers } from 'next/headers'
import { prisma } from './prisma'

export interface TenantContext {
  id: string
  slug: string
  name: string
  plan: string
  status: string
  settings: Record<string, any>
}

export interface UserContext {
  id: string
  email: string
  name?: string
  role: string
  tenantId: string
}

export async function getTenantFromHeaders(): Promise<TenantContext | null> {
  try {
    const headersList = await headers()
    const tenantId = headersList.get('x-tenant-id')
    const tenantSlug = headersList.get('x-tenant-slug')

    if (!tenantId || !tenantSlug) {
      return null
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        status: true,
        settings: true
      }
    })

    return tenant
  } catch (error) {
    console.error('Error getting tenant from headers:', error)
    return null
  }
}

export async function getUserFromHeaders(): Promise<UserContext | null> {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userRole = headersList.get('x-user-role')
    const tenantId = headersList.get('x-tenant-id')

    if (!userId || !tenantId) {
      return null
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: tenantId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true
      }
    })

    return user
  } catch (error) {
    console.error('Error getting user from headers:', error)
    return null
  }
}

export async function getTenantById(tenantId: string): Promise<TenantContext | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        status: true,
        settings: true
      }
    })

    return tenant
  } catch (error) {
    console.error('Error getting tenant by ID:', error)
    return null
  }
}

export async function getTenantBySlug(slug: string): Promise<TenantContext | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        status: true,
        settings: true
      }
    })

    return tenant
  } catch (error) {
    console.error('Error getting tenant by slug:', error)
    return null
  }
}

export async function createTenant(data: {
  name: string
  slug: string
  domain?: string
  ownerEmail: string
  ownerName?: string
}): Promise<TenantContext | null> {
  try {
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        domain: data.domain,
        users: {
          create: {
            email: data.ownerEmail,
            name: data.ownerName,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      },
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        status: true,
        settings: true
      }
    })

    return tenant
  } catch (error) {
    console.error('Error creating tenant:', error)
    return null
  }
}

export function getTenantUrl(tenant: TenantContext, path: string = ''): string {
  if (process.env.NODE_ENV === 'development') {
    return `http://${tenant.slug}.localhost:3000${path}`
  }
  
  // In production, you might use custom domains or subdomains
  return `https://${tenant.slug}.yourdomain.com${path}`
}

export function getPlanLimits(plan: string) {
  const limits = {
    FREE: {
      users: 1,
      conversations: 100,
      documents: 10,
      apiCalls: 1000,
      storage: 100 * 1024 * 1024 // 100MB
    },
    STARTER: {
      users: 5,
      conversations: 1000,
      documents: 100,
      apiCalls: 10000,
      storage: 1024 * 1024 * 1024 // 1GB
    },
    PROFESSIONAL: {
      users: 25,
      conversations: 10000,
      documents: 1000,
      apiCalls: 100000,
      storage: 10 * 1024 * 1024 * 1024 // 10GB
    },
    ENTERPRISE: {
      users: -1, // unlimited
      conversations: -1,
      documents: -1,
      apiCalls: -1,
      storage: -1
    }
  }

  return limits[plan as keyof typeof limits] || limits.FREE
} 