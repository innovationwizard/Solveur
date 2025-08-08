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
      { url: '/solveur_logo_small.png', sizes: '32x32', type: 'image/png' },
      { url: '/solveur_logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/solveur_logo_small.png',
    apple: '/solveur_logo.png',
  },
  openGraph: {
    title: 'Solveur - AI Business Problem Solver',
    description: 'Deploy AI customer support agents in 24 hours. Transform your business knowledge into intelligent AI agents that handle customer inquiries, reduce support tickets, and scale your customer service instantly.',
    url: 'https://solveur.pro',
    siteName: 'Solveur',
    images: [
      {
        url: '/solveur_logo.png',
        width: 1200,
        height: 630,
        alt: 'Solveur - AI Business Problem Solver',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solveur - AI Business Problem Solver',
    description: 'Deploy AI customer support agents in 24 hours. Transform your business knowledge into intelligent AI agents.',
    images: ['/solveur_logo.png'],
  },
  other: {
    // WhatsApp-specific meta tags
    'whatsapp-meta': 'true',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'og:image:alt': 'Solveur - AI Business Problem Solver',
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