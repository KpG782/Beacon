import { start } from 'workflow/api'
import { researchAgent } from '@/workflows/research'
import { loadMemory } from '@/lib/memory'
import { appendLog, hydrateBriefIndex, saveBriefRecord, syncBriefRecord } from '@/lib/brief-store'
import { rateLimit, LIMITS } from '@/lib/ratelimit'
import { FRAMEWORK_IDS } from '@/lib/frameworks'
import { NextRequest, NextResponse } from 'next/server'

const VALID_SOURCES = ['slack', 'github', 'discord', 'dashboard', 'mcp'] as const
const VALID_DEPTHS  = ['quick', 'deep'] as const

export async function POST(req: NextRequest) {
  // Rate limit: 5 research runs per hour per IP — SerpAPI and Groq cost money
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl  = await rateLimit(ip, 'research', LIMITS.research.limit, LIMITS.research.windowSecs)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. You can run ${LIMITS.research.limit} research jobs per hour. Try again in ${Math.ceil(rl.retryAfter / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter), 'X-RateLimit-Remaining': '0' } }
    )
  }

  const body = await req.json()

  const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 500) : ''
  if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 })
  const objective = typeof body.objective === 'string' ? body.objective.trim().slice(0, 300) : undefined
  const focus = typeof body.focus === 'string' ? body.focus.trim().slice(0, 300) : undefined

  const source      = VALID_SOURCES.includes(body.source)  ? body.source  : 'dashboard'
  const depth       = VALID_DEPTHS.includes(body.depth)    ? body.depth   : 'deep'
  const timeframe   = ['7d', '30d', '90d', 'all'].includes(body.timeframe) ? body.timeframe : '30d'
  const reportStyle = ['executive', 'bullet', 'memo', 'framework'].includes(body.reportStyle) ? body.reportStyle : 'executive'
  const recurring   = typeof body.recurring === 'boolean'  ? body.recurring : false
  const frameworkId = typeof body.frameworkId === 'string' && FRAMEWORK_IDS.has(body.frameworkId)
    ? body.frameworkId
    : undefined

  // BYOK — accept user-supplied API keys; never log them
  const userKeys =
    body.userKeys &&
    (typeof body.userKeys.groqApiKey === 'string' || typeof body.userKeys.serpApiKey === 'string')
      ? {
          groqApiKey: typeof body.userKeys.groqApiKey === 'string' ? body.userKeys.groqApiKey : undefined,
          serpApiKey: typeof body.userKeys.serpApiKey === 'string' ? body.userKeys.serpApiKey : undefined,
        }
      : undefined

  const brief = { topic, objective, focus, source, depth, timeframe, reportStyle, recurring, frameworkId, userKeys }
  const run = await start(researchAgent, [brief])
  const existingMemory = await loadMemory(brief.topic)

  const record = {
    runId: run.runId,
    topic: brief.topic,
    status: 'running' as const,
    source: brief.source,
    recurring: brief.recurring,
    runCount: (existingMemory?.runCount ?? 0) + 1,
    hasMemory: !!existingMemory,
    memoryFacts: existingMemory?.keyFacts.length ?? 0,
    createdAt: new Date().toISOString(),
    currentStep: 'loadMemory',
    frameworkId: brief.frameworkId,
  }

  await saveBriefRecord(record)
  appendLog({
    level: 'info',
    category: 'workflow',
    message: `Workflow started: "${brief.topic}" — run #${record.runCount} via ${record.source}`,
    runId: run.runId,
  })
  if (existingMemory) {
    appendLog({
      level: 'success',
      category: 'memory',
      message: `Memory loaded: ${existingMemory.keyFacts.length} facts, ${existingMemory.seenUrls.length} URLs for "${brief.topic}"`,
      runId: run.runId,
    })
  } else {
    appendLog({
      level: 'info',
      category: 'memory',
      message: `First run for "${brief.topic}" — no prior memory`,
      runId: run.runId,
    })
  }

  return NextResponse.json(record)
}

export async function GET() {
  const records = await hydrateBriefIndex()
  const synced = await Promise.all(records.map((record) => syncBriefRecord(record.runId)))
  return NextResponse.json(
    synced
      .filter((record): record is NonNullable<typeof record> => !!record)
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
  )
}
