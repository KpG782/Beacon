import { Suspense } from 'react'

async function getBriefs() {
  try {
    const res = await fetch(`${process.env.VERCEL_URL}/api/briefs`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function Home() {
  const briefs = await getBriefs()

  return (
    <main style={{ minHeight: '100vh', padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#f97316', fontFamily: 'monospace', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            BEACON
          </h1>
          <p style={{ color: '#737373', fontSize: '13px', margin: '4px 0 0' }}>
            Durable research agent · {briefs.length} active runs
          </p>
        </div>
        <a
          href="/briefs/new"
          style={{
            background: '#f97316',
            color: '#0a0a0a',
            padding: '8px 16px',
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            border: 'none',
          }}
        >
          + New Research
        </a>
      </div>

      {briefs.length === 0 ? (
        <div style={{ color: '#737373', fontFamily: 'monospace', fontSize: '13px', padding: '48px 0', textAlign: 'center' }}>
          No research runs yet. Start one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid #262626' }}>
          {briefs.map((brief: {
            runId: string
            status: string
            topic: string
            runCount: number
            hasMemory: boolean
            source: string
            recurring: boolean
            createdAt: string
          }) => (
            <a
              key={brief.runId}
              href={`/briefs/${brief.runId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: '#111111',
                textDecoration: 'none',
                borderBottom: '1px solid #262626',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: brief.status === 'running' ? '#f97316' : brief.status === 'complete' ? '#22c55e' : '#737373',
                flexShrink: 0,
              }} />
              <span style={{ color: '#e5e5e5', fontFamily: 'monospace', fontSize: '13px', flex: 1 }}>
                {brief.topic}
              </span>
              {brief.hasMemory && (
                <span style={{ color: '#737373', fontSize: '11px', fontFamily: 'monospace' }}>
                  memory
                </span>
              )}
              <span style={{ color: brief.runCount > 1 ? '#f97316' : '#737373', fontFamily: 'monospace', fontSize: '12px' }}>
                Run #{brief.runCount}
              </span>
              <span style={{ color: '#737373', fontFamily: 'monospace', fontSize: '11px' }}>
                {brief.source}
              </span>
              <span style={{ color: '#737373', fontSize: '11px' }}>→</span>
            </a>
          ))}
        </div>
      )}

      <div style={{ marginTop: '48px', padding: '16px', border: '1px solid #262626', color: '#737373', fontSize: '11px', fontFamily: 'monospace' }}>
        <p style={{ margin: '0 0 8px', color: '#f97316' }}>DASHBOARD NOTE</p>
        <p style={{ margin: 0 }}>
          This is the Phase 0 scaffold UI. Generate v0 components using the prompts in docs/ and paste them into components/ before the deadline.
        </p>
      </div>
    </main>
  )
}
