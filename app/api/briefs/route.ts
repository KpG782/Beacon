import { start } from 'workflow/api'
import { auth } from '@clerk/nextjs/server'
import { researchAgent } from '@/workflows/research'
import { loadMemory } from '@/lib/memory'
import { appendLog, hydrateBriefIndex, saveBriefRecord, syncBriefRecord } from '@/lib/brief-store'
import { rateLimit, LIMITS } from '@/lib/ratelimit'
import { FRAMEWORK_IDS } from '@/lib/frameworks'
import { getUserKeys } from '@/lib/user-keys'
import { NextRequest, NextResponse } from 'next/server'

const VALID_SOURCES = ['slack', 'github', 'discord', 'dashboard', 'mcp'] as const
const VALID_DEPTHS  = ['quick', 'deep'] as const

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

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
  const webhookUrl = typeof body.webhookUrl === 'string' ? body.webhookUrl.trim() : undefined

  let validWebhookUrl: string | undefined
  if (webhookUrl) {
    try {
      const parsed = new URL(webhookUrl)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ error: 'webhookUrl must use http or https' }, { status: 400 })
      }
      validWebhookUrl = parsed.toString()
    } catch {
      return NextResponse.json({ error: 'webhookUrl must be a valid URL' }, { status: 400 })
    }
  }

  const source      = VALID_SOURCES.includes(body.source)  ? body.source  : 'dashboard'
  const depth       = VALID_DEPTHS.includes(body.depth)    ? body.depth   : 'deep'
  const timeframe   = ['7d', '30d', '90d', 'all'].includes(body.timeframe) ? body.timeframe : '30d'
  const reportStyle = ['executive', 'bullet', 'memo', 'framework'].includes(body.reportStyle) ? body.reportStyle : 'executive'
  const recurring   = typeof body.recurring === 'boolean'  ? body.recurring : false
  const frameworkId = typeof body.frameworkId === 'string' && FRAMEWORK_IDS.has(body.frameworkId)
    ? body.frameworkId
    : undefined

  // Token budget — let users with higher Groq tier limits raise the output caps.
  // Clamp to [500, 8000] so a typo can't send a malformed request to Groq.
  const clampTokens = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(8000, Math.max(500, Math.round(v))) : undefined
  const rawBudget = body.tokenBudget && typeof body.tokenBudget === 'object' ? body.tokenBudget : null
  const tokenBudget = rawBudget
    ? {
        trackSynthTokens: clampTokens(rawBudget.trackSynthTokens),
        finalSynthTokens: clampTokens(rawBudget.finalSynthTokens),
      }
    : undefined
  const validTokenBudget =
    tokenBudget && (tokenBudget.trackSynthTokens !== undefined || tokenBudget.finalSynthTokens !== undefined)
      ? {
          trackSynthTokens: tokenBudget.trackSynthTokens ?? 1000,
          finalSynthTokens: tokenBudget.finalSynthTokens ?? 1800,
        }
      : undefined

  // BYOK — accept user-supplied API keys; never log them
  const bodyKeys =
    body.userKeys &&
    (typeof body.userKeys.groqApiKey === 'string' || typeof body.userKeys.serpApiKey === 'string')
      ? {
          groqApiKey: typeof body.userKeys.groqApiKey === 'string' ? body.userKeys.groqApiKey : undefined,
          serpApiKey: typeof body.userKeys.serpApiKey === 'string' ? body.userKeys.serpApiKey : undefined,
        }
      : undefined

  // Guardrail: both API keys must be available (stored or provided in request) before firing a workflow.
  const storedKeys = await getUserKeys(userId)
  const hasGroq = !!(bodyKeys?.groqApiKey || storedKeys?.groqApiKey)
  const hasSerp = !!(bodyKeys?.serpApiKey || storedKeys?.serpApiKey)
  if (!hasGroq || !hasSerp) {
    const missing = [!hasGroq && 'Groq', !hasSerp && 'SerpAPI'].filter(Boolean).join(' and ')
    return NextResponse.json(
      { error: `Missing API keys: ${missing}. Add them at /profile before running research.` },
      { status: 403 }
    )
  }

  const userKeys = bodyKeys

  const brief = {
    userId,
    topic,
    objective,
    focus,
    source,
    depth,
    timeframe,
    reportStyle,
    recurring,
    frameworkId,
    tokenBudget: validTokenBudget,
    userKeys,
    webhookUrl: validWebhookUrl,
  }
  const run = await start(researchAgent, [brief])
  const existingMemory = await loadMemory(userId, brief.topic)

  const record = {
    userId,
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
    webhookUrl: brief.webhookUrl,
    webhookDelivery: brief.webhookUrl ? { status: 'pending' as const, attempts: 0 } : undefined,
  }

  await saveBriefRecord(record)
  appendLog({
    userId,
    level: 'info',
    category: 'workflow',
    message: `Workflow started: "${brief.topic}" — run #${record.runCount} via ${record.source}`,
    runId: run.runId,
  })
  if (existingMemory) {
    appendLog({
      userId,
      level: 'success',
      category: 'memory',
      message: `Memory loaded: ${existingMemory.keyFacts.length} facts, ${existingMemory.seenUrls.length} URLs for "${brief.topic}"`,
      runId: run.runId,
    })
  } else {
    appendLog({
      userId,
      level: 'info',
      category: 'memory',
      message: `First run for "${brief.topic}" — no prior memory`,
      runId: run.runId,
    })
  }

  return NextResponse.json(record)
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const records = await hydrateBriefIndex(userId)
  const synced = await Promise.all(records.map((record) => syncBriefRecord(record.runId)))
  return NextResponse.json(
    synced
      .filter((record): record is NonNullable<typeof record> => !!record)
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
  )
}
