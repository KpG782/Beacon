import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Research Brief',
  description: 'Deploy a new autonomous research agent with persistent memory.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
