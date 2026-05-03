import { start } from 'workflow/api'
import { NextRequest, NextResponse } from 'next/server'
import { researchAgent } from '@/workflows/research'
import { loadMemory } from '@/lib/memory'
import { appendLog, saveBriefRecord } from '@/lib/brief-store'
import { FRAMEWORK_IDS } from '@/lib/frameworks'
import {
  TRIAL_COOKIE_NAME,
  TRIAL_MAX_RUNS,
  consumeTrialRunAllowance,
  ensureTrialSessionId,
  getClientIp,
  trialUserId,
} from '@/lib/trial'

const VALID_DEPTHS = ['quick', 'deep'] as const

export async function POST(req: NextRequest) {
  const { sessionId, isNew } = ensureTrialSessionId(req)
  const ip = getClientIp(req)
  const allowance = await consumeTrialRunAllowance(sessionId, ip)

  if (!allowance.allowed) {
    const res = NextResponse.json(
      {
        error: `Trial limit reached. You can run up to ${TRIAL_MAX_RUNS} sample briefs before creating an account.`,
        remainingRuns: 0,
      },
      { status: 429, headers: { 'Retry-After': String(allowance.retryAfter) } }
    )
    if (isNew) {
      res.cookies.set(TRIAL_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    return res
  }

  const body = await req.json()
  const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 500) : ''
  if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 })

  const objective = typeof body.objective === 'string' ? body.objective.trim().slice(0, 300) : undefined
  const focus = typeof body.focus === 'string' ? body.focus.trim().slice(0, 300) : undefined
  const depth = VALID_DEPTHS.includes(body.depth) ? body.depth : 'quick'
  const timeframe = ['7d', '30d', '90d', 'all'].includes(body.timeframe) ? body.timeframe : '30d'
  const reportStyle = ['executive', 'bullet', 'memo', 'framework'].includes(body.reportStyle) ? body.reportStyle : 'executive'
  const frameworkId = typeof body.frameworkId === 'string' && FRAMEWORK_IDS.has(body.frameworkId)
    ? body.frameworkId
    : undefined

  const userId = trialUserId(sessionId)
  const brief = {
    userId,
    topic,
    objective,
    focus,
    source: 'dashboard' as const,
    depth,
    timeframe,
    reportStyle,
    recurring: false,
    frameworkId,
  }

  const existingMemory = await loadMemory(userId, topic)
  const run = await start(researchAgent, [brief])

  await saveBriefRecord({
    userId,
    runId: run.runId,
    topic,
    status: 'running',
    source: 'dashboard',
    recurring: false,
    runCount: (existingMemory?.runCount ?? 0) + 1,
    hasMemory: !!existingMemory,
    memoryFacts: existingMemory?.keyFacts.length ?? 0,
    createdAt: new Date().toISOString(),
    currentStep: 'loadMemory',
    frameworkId,
  })

  appendLog({
    userId,
    level: 'info',
    category: 'workflow',
    message: `Trial workflow started: "${topic}" — run #${(existingMemory?.runCount ?? 0) + 1}`,
    runId: run.runId,
  })

  const res = NextResponse.json({
    runId: run.runId,
    remainingRuns: allowance.remaining,
  })

  if (isNew) {
    res.cookies.set(TRIAL_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return res
}
