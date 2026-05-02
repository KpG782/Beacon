import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Bank',
  description: 'Persistent cross-session knowledge indexed by Beacon across all research runs.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
