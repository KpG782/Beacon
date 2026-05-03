import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { LayoutShell } from '@/components/layout/layout-shell'
import { beaconClerkAppearance } from '@/lib/clerk'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-space-grotesk' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Autonomous Research Agent`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: `${SITE_NAME} — Autonomous Research Agent`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Beacon — Autonomous research agent with persistent memory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Autonomous Research Agent`,
    description: SITE_DESCRIPTION,
    images: ['/opengraph-image'],
  },
  keywords: [
    'research agent', 'AI agent', 'web research', 'persistent memory',
    'delta reports', 'Slack bot', 'GitHub', 'Vercel', 'durable workflow',
  ],
  authors: [{ name: 'KpG782', url: 'https://github.com/KpG782' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark', geistSans.variable, geistMono.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' }}
      >
        <ClerkProvider appearance={beaconClerkAppearance}>
          <LayoutShell>{children}</LayoutShell>
        </ClerkProvider>
      </body>
    </html>
  )
}
