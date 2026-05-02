import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Logs',
  description: 'Real-time agent event stream — workflow steps, memory operations, API calls.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
