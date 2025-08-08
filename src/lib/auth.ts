import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantSlug: { label: 'Tenant', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // For admin routes, check superuser without tenant
          if (!credentials.tenantSlug) {
            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email,
                status: 'ACTIVE'
              },
              include: {
                tenant: true
              }
            })

            if (!user || !user.password || !user.isSuperuser) {
              return null
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(credentials.password, user.password)

            if (!isValidPassword) {
              return null
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              isSuperuser: user.isSuperuser,
              tenantId: user.tenantId,
              tenantSlug: user.tenant.slug
            }
          }

          // Regular tenant user authentication
          const tenant = await prisma.tenant.findUnique({
            where: { slug: credentials.tenantSlug },
            include: { users: true }
          })

          if (!tenant || tenant.status !== 'ACTIVE') {
            return null
          }

          // Find user in tenant
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
              tenantId: tenant.id,
              status: 'ACTIVE'
            }
          })

          if (!user || !user.password) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isSuperuser: user.isSuperuser,
            tenantId: tenant.id,
            tenantSlug: tenant.slug
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isSuperuser = user.isSuperuser
        token.tenantId = user.tenantId
        token.tenantSlug = user.tenantSlug
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isSuperuser = token.isSuperuser as boolean
        session.user.tenantId = token.tenantId as string
        session.user.tenantSlug = token.tenantSlug as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  session: {
    strategy: 'jwt'
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
} 