'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return
    }

    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (session?.user && !session.user.isSuperuser) {
      router.push('/')
    }
  }, [session, status, router, pathname])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-primary-600 font-sora">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page or protected content
  return pathname === '/admin/login' || (session?.user?.isSuperuser && status === 'authenticated')
    ? children
    : null
}
