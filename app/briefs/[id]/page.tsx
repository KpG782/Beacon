'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface BriefStatus {
  runId: string
  status: string
  topic?: string
  runCount?: number
  hasMemory?: boolean
}

export default function BriefPage() {
  const params = useParams()
  const id = params.id as string
  const [status, setStatus] = useState<BriefStatus | null>(null)

  useEffect(() => {
    const poll = async () => {
      const res = await fetch(`/api/briefs/${id}`)
      if (res.ok) setStatus(await res.json())
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [id])

  return (
    <main style={{ minHeight: '100vh', padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <a href="/" style={{ color: '#737373', fontFamily: 'monospace', fontSize: '12px', textDecoration: 'none' }}>
        ← Back
      </a>
      <div style={{ marginTop: '24px' }}>
        <p style={{ color: '#737373', fontFamily: 'monospace', fontSize: '11px', margin: '0 0 4px' }}>
          Run ID: {id}
        </p>
        <div style={{ color: '#f97316', fontFamily: 'monospace', fontSize: '13px', margin: '0 0 24px' }}>
          Status: {status?.status ?? 'loading...'}
        </div>

        <div style={{ color: '#737373', fontFamily: 'monospace', fontSize: '12px', padding: '24px', border: '1px solid #262626' }}>
          <p style={{ margin: '0 0 8px', color: '#f97316' }}>PHASE 5 PLACEHOLDER</p>
          <p style={{ margin: 0 }}>
            Generate the brief detail component from v0.dev using the prompts in PLAN.md Phase 5,
            then replace this page with the generated component.
          </p>
        </div>
      </div>
    </main>
  )
}
