import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { cn } from '@/lib/utils'
import { LayoutShell } from '@/components/layout/layout-shell'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

const APP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: 'Beacon — Autonomous Research Agent',
    template: '%s · Beacon',
  },
  description:
    'Durable web research agent with persistent cross-session memory. Fans out SerpAPI queries, synthesizes delta reports showing only what changed, and delivers to Slack, GitHub, and Discord.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'Beacon — Autonomous Research Agent',
    description:
      'Durable web research agent with persistent cross-session memory. Delta reports. Slack + GitHub delivery. Never restarts from zero.',
    url: APP_URL,
    siteName: 'Beacon',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beacon — Autonomous Research Agent',
    description:
      'Durable web research agent with persistent cross-session memory. Delta reports. Slack + GitHub delivery.',
  },
  keywords: [
    'research agent', 'AI agent', 'web research', 'persistent memory',
    'delta reports', 'Slack bot', 'GitHub', 'Vercel', 'durable workflow',
  ],
  authors: [{ name: 'KpG782', url: 'https://github.com/KpG782' }],
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark', inter.variable, spaceGrotesk.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
