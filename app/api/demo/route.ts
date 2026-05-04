import { start } from 'workflow/api'
import { researchAgent } from '@/workflows/research'
import { saveBriefRecord } from '@/lib/brief-store'
import { rateLimit } from '@/lib/ratelimit'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_KEY = process.env.BEACON_DEMO_KEY ?? 'beacon_demo_key'

function demoUserId(ip: string) {
  return `demo-${ip.replace(/[^a-z0-9]/gi, '-').slice(0, 24)}`
}

export function validateDemoKey(req: NextRequest): boolean {
  const bearer = req.headers.get('Authorization')?.replace(/^Bearer /, '') ?? ''
  const header = req.headers.get('x-beacon-key') ?? ''
  return bearer === DEMO_KEY || header === DEMO_KEY
}

// ── POST /api/demo — start a demo research run ────────────────────────────────
// No signup required. Server-key runs: 3/day, quick mode.
// BYOK (userKeys provided): 10/day, deep mode allowed.

export async function POST(req: NextRequest) {
  if (!validateDemoKey(req)) {
    return NextResponse.json(
      { error: 'Missing or invalid demo key. Use: Authorization: Bearer beacon_demo_key' },
      { status: 401 }
    )
  }

  const ip     = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const body   = await req.json().catch(() => ({})) as Record<string, unknown>
  const keys   = (body.userKeys ?? {}) as Record<string, unknown>
  const hasGroq = typeof keys.groqApiKey === 'string' && (keys.groqApiKey as string).length > 0
  const hasSerp = typeof keys.serpApiKey === 'string' && (keys.serpApiKey as string).length > 0
  const hasByok = hasGroq || hasSerp

  // BYOK users get 10 runs/day; server-key users get 3/day to control API costs
  const rl = await rateLimit(ip, hasByok ? 'demo-byok' : 'demo', hasByok ? 10 : 3, 86400)
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: hasByok
          ? 'BYOK demo limit reached (10/day). Sign up for unlimited access.'
          : 'Free demo limit reached (3/day). Pass your own Groq + SerpAPI keys for 10 runs/day, or sign up.',
      },
      { status: 429, headers: { 'Retry-After': '86400' } }
    )
  }

  const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 200) : ''
  if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 })

  // Server-key runs are locked to quick mode; BYOK unlocks deep mode
  const depth: 'quick' | 'deep' = hasByok && body.depth === 'deep' ? 'deep' : 'quick'

  const userId = demoUserId(ip)
  const brief = {
    userId,
    topic,
    objective: typeof body.objective === 'string' ? body.objective.trim().slice(0, 200) : undefined,
    focus:     typeof body.focus     === 'string' ? body.focus.trim().slice(0, 200)     : undefined,
    depth,
    timeframe: '30d' as const,
    reportStyle: 'executive' as const,
    source: 'dashboard' as const,
    userKeys: hasByok
      ? { groqApiKey: hasGroq ? String(keys.groqApiKey) : undefined, serpApiKey: hasSerp ? String(keys.serpApiKey) : undefined }
      : undefined,
  }

  const run = await start(researchAgent, [brief])

  await saveBriefRecord({
    userId,
    runId: run.runId,
    topic,
    status: 'running',
    source: 'dashboard',
    recurring: false,
    runCount: 1,
    hasMemory: false,
    memoryFacts: 0,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({
    runId: run.runId,
    demo: true,
    mode: hasByok ? 'byok' : 'server-keys',
    depth,
    remaining: rl.remaining,
    pollUrl: `/api/demo/${run.runId}`,
    eta: depth === 'deep' ? '~90s' : '~45s',
    message: `Run started. Poll GET /api/demo/${run.runId} every 5s until status is "complete".`,
  })
}
