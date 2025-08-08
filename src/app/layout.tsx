import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://solveur.pro'),
  title: 'Solveur - AI Business Problem Solver',
  description: 'Deploy AI customer support agents in 24 hours. Transform your business knowledge into intelligent AI agents that handle customer inquiries, reduce support tickets, and scale your customer service instantly.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  icons: {
    icon: [
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Solveur - AI Business Problem Solver',
    description: 'Deploy AI customer support agents in 24 hours. Transform your business knowledge into intelligent AI agents that handle customer inquiries, reduce support tickets, and scale your customer service instantly.',
    url: 'https://solveur.pro',
    siteName: 'Solveur',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Solveur - AI Business Problem Solver',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solveur - AI Business Problem Solver',
    description: 'Deploy AI customer support agents in 24 hours. Transform your business knowledge into intelligent AI agents.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { AuthProvider } from '@/providers/session'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}