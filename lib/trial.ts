import { randomUUID } from 'crypto'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

export const TRIAL_COOKIE_NAME = 'beacon-trial-session'
export const TRIAL_MAX_RUNS = 3
const TRIAL_WINDOW_SECS = 60 * 60 * 24 * 30

export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export function getTrialSessionId(req: NextRequest): string | null {
  return req.cookies.get(TRIAL_COOKIE_NAME)?.value ?? null
}

export function ensureTrialSessionId(req: NextRequest): { sessionId: string; isNew: boolean } {
  const existing = getTrialSessionId(req)
  if (existing) return { sessionId: existing, isNew: false }
  return { sessionId: randomUUID(), isNew: true }
}

export function trialUserId(sessionId: string): string {
  return `trial:${sessionId}`
}

export async function consumeTrialRunAllowance(sessionId: string, ip: string) {
  const [sessionLimit, ipLimit] = await Promise.all([
    rateLimit(sessionId, 'trial-runs-session', TRIAL_MAX_RUNS, TRIAL_WINDOW_SECS),
    rateLimit(ip, 'trial-runs-ip', TRIAL_MAX_RUNS, TRIAL_WINDOW_SECS),
  ])

  const allowed = sessionLimit.allowed && ipLimit.allowed
  const remaining = Math.min(sessionLimit.remaining, ipLimit.remaining)
  const retryAfter = Math.max(sessionLimit.retryAfter, ipLimit.retryAfter)

  return { allowed, remaining, retryAfter }
}
