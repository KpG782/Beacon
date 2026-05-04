import { getRun } from 'workflow/api'
import type { ResearchReport, QueryPlan, WebhookDeliveryState } from '@/lib/types'

const BRIEF_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const SYSTEM_SCOPE = '__system__'

export interface BriefRecord {
  userId?: string
  runId: string
  topic: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  source: string
  recurring: boolean
  runCount: number
  hasMemory: boolean
  memoryFacts: number
  createdAt: string
  updatedAt?: string
  currentStep?: string
  report?: string
  sources?: Array<{ title?: string; url: string; snippet?: string; index?: number; engine?: string }>
  error?: string
  frameworkId?: string
  queryPlan?: QueryPlan
  deltaUrls?: string[]
  webhookUrl?: string
  webhookDelivery?: WebhookDeliveryState
}

export interface LogEntry {
  id: string
  ts: string
  userId?: string
  level: 'info' | 'warn' | 'error' | 'success'
  category: 'workflow' | 'memory' | 'serpapi' | 'groq' | 'system'
  message: string
  runId?: string
}

export const briefStore = new Map<string, BriefRecord>()
export const logStore: LogEntry[] = []

function userScope(userId?: string): string {
  return userId?.trim() || SYSTEM_SCOPE
}

function briefIndexKey(userId?: string): string {
  return `beacon:user:${userScope(userId)}:briefs:index`
}

function briefKey(runId: string): string {
  return `beacon:brief:${runId}`
}

async function upstash(commands: (string | number)[][]): Promise<unknown[]> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return commands.map(() => null)

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`)
  const data = (await res.json()) as Array<{ result: unknown }>
  return data.map((entry) => entry.result)
}

const LOG_REDIS_KEY = 'beacon:logs'
const LOG_REDIS_CAP = 1000
const WEBHOOK_MAX_ATTEMPTS = 3

async function persistLog(log: LogEntry): Promise<void> {
  try {
    await upstash([
      ['LPUSH', LOG_REDIS_KEY, JSON.stringify(log)],
      ['LTRIM', LOG_REDIS_KEY, 0, LOG_REDIS_CAP - 1],
    ])
  } catch {}
}

export async function hydrateLogsFromRedis(limit = 200): Promise<LogEntry[]> {
  try {
    const [raws] = await upstash([['LRANGE', LOG_REDIS_KEY, 0, limit - 1]])
    if (!Array.isArray(raws)) return []
    return raws
      .filter((r): r is string => typeof r === 'string')
      .map((r) => JSON.parse(r) as LogEntry)
  } catch {
    return []
  }
}

export function appendLog(entry: Omit<LogEntry, 'id' | 'ts'>) {
  const log: LogEntry = {
    id: Math.random().toString(36).slice(2),
    ts: new Date().toISOString(),
    ...entry,
  }
  logStore.unshift(log)
  if (logStore.length > 500) logStore.length = 500
  persistLog(log).catch(() => {})
}

async function persistBriefRecord(record: BriefRecord): Promise<void> {
  try {
    const score = new Date(record.updatedAt ?? record.createdAt).getTime()
    await upstash([
      ['SET', briefKey(record.runId), JSON.stringify(record), 'EX', BRIEF_TTL_SECONDS],
      ['ZADD', briefIndexKey(record.userId), score, record.runId],
      ['EXPIRE', briefIndexKey(record.userId), BRIEF_TTL_SECONDS],
    ])
  } catch (error) {
    console.error('[beacon:brief-store] Failed to persist brief record:', error)
  }
}

async function loadPersistedBriefRecord(runId: string): Promise<BriefRecord | null> {
  try {
    const [raw] = await upstash([['GET', briefKey(runId)]])
    if (!raw || typeof raw !== 'string') return null
    return JSON.parse(raw) as BriefRecord
  } catch {
    return null
  }
}

export async function hydrateBriefRecord(runId: string): Promise<BriefRecord | null> {
  const existing = briefStore.get(runId)
  if (existing) return existing

  const persisted = await loadPersistedBriefRecord(runId)
  if (persisted) briefStore.set(runId, persisted)
  return persisted
}

export async function hydrateBriefIndex(userId?: string, limit = 50): Promise<BriefRecord[]> {
  try {
    const [ids] = await upstash([['ZREVRANGE', briefIndexKey(userId), 0, Math.max(0, limit - 1)]])
    if (!Array.isArray(ids) || ids.length === 0) return []

    const fetches = ids
      .filter((id): id is string => typeof id === 'string')
      .map((runId) => ['GET', briefKey(runId)] as (string | number)[])
    const raws = await upstash(fetches)
    const records = raws
      .filter((raw): raw is string => typeof raw === 'string')
      .map((raw) => JSON.parse(raw) as BriefRecord)
      .filter((record) => userScope(record.userId) === userScope(userId))

    for (const record of records) briefStore.set(record.runId, record)
    return records
  } catch {
    return Array.from(briefStore.values()).filter(
      (record) => userScope(record.userId) === userScope(userId)
    )
  }
}

export async function saveBriefRecord(record: BriefRecord): Promise<void> {
  briefStore.set(record.runId, record)
  await persistBriefRecord(record)
}

async function updateBrief(runId: string, update: Partial<BriefRecord>): Promise<BriefRecord | null> {
  const existing = briefStore.get(runId)
  if (!existing) return null

  const next = {
    ...existing,
    ...update,
    updatedAt: new Date().toISOString(),
  }
  briefStore.set(runId, next)
  await persistBriefRecord(next)
  return next
}

function shouldDeliverWebhook(record: BriefRecord): boolean {
  if (!record.webhookUrl || record.status !== 'complete') return false
  if (!record.webhookDelivery) return true
  if (record.webhookDelivery.status === 'pending') return true
  return record.webhookDelivery.status === 'failed' && record.webhookDelivery.attempts < WEBHOOK_MAX_ATTEMPTS
}

async function deliverWebhook(record: BriefRecord): Promise<BriefRecord> {
  const attempts = (record.webhookDelivery?.attempts ?? 0) + 1
  const lastAttemptAt = new Date().toISOString()

  const payload = {
    event: 'research.completed',
    runId: record.runId,
    topic: record.topic,
    status: record.status,
    source: record.source,
    recurring: record.recurring,
    frameworkId: record.frameworkId ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt ?? null,
    report: {
      content: record.report ?? null,
      sources: record.sources ?? [],
      runCount: record.runCount,
      hasMemory: record.hasMemory,
      queryPlan: record.queryPlan ?? null,
      deltaUrls: record.deltaUrls ?? [],
    },
  }

  try {
    const res = await fetch(record.webhookUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const failed = await updateBrief(record.runId, {
        webhookDelivery: {
          status: 'failed',
          attempts,
          lastAttemptAt,
          responseStatus: res.status,
          error: `HTTP ${res.status}`,
        },
      })
      const next = failed ?? {
        ...record,
        webhookDelivery: {
          status: 'failed' as const,
          attempts,
          lastAttemptAt,
          responseStatus: res.status,
          error: `HTTP ${res.status}`,
        },
      }
      appendLog({
        userId: record.userId,
        level: 'warn',
        category: 'workflow',
        message: `Webhook delivery failed for "${record.topic}" — HTTP ${res.status}`,
        runId: record.runId,
      })
      return next
    }

    const deliveredAt = new Date().toISOString()
    const delivered = await updateBrief(record.runId, {
      webhookDelivery: {
        status: 'delivered',
        attempts,
        lastAttemptAt,
        deliveredAt,
        responseStatus: res.status,
      },
    })
    const next = delivered ?? {
      ...record,
      webhookDelivery: {
        status: 'delivered' as const,
        attempts,
        lastAttemptAt,
        deliveredAt,
        responseStatus: res.status,
      },
    }
    appendLog({
      userId: record.userId,
      level: 'success',
      category: 'workflow',
      message: `Webhook delivered for "${record.topic}"`,
      runId: record.runId,
    })
    return next
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook error'
    const failed = await updateBrief(record.runId, {
      webhookDelivery: {
        status: 'failed',
        attempts,
        lastAttemptAt,
        error: message,
      },
    })
    const next = failed ?? {
      ...record,
      webhookDelivery: {
        status: 'failed' as const,
        attempts,
        lastAttemptAt,
        error: message,
      },
    }
    appendLog({
      userId: record.userId,
      level: 'warn',
      category: 'workflow',
      message: `Webhook delivery failed for "${record.topic}" — ${message}`,
      runId: record.runId,
    })
    return next
  }
}

export async function syncBriefRecord(runId: string): Promise<BriefRecord | null> {
  const record = await hydrateBriefRecord(runId)
  if (!record) return null

  if (record.status === 'complete' || record.status === 'failed') {
    if (shouldDeliverWebhook(record)) {
      return deliverWebhook(record)
    }
    return record
  }

  try {
    const run = getRun<ResearchReport>(runId)
    const status = await run.status

    if (status === 'completed') {
      const report = await run.returnValue
      const next = await updateBrief(runId, {
        topic: report.topic,
        status: 'complete',
        currentStep: 'saveMemory',
        report: report.content,
        sources: report.sources,
        runCount: report.runCount,
        queryPlan: report.queryPlan,
        deltaUrls: report.deltaUrls,
      })

      if (next) {
        appendLog({
          userId: next.userId,
          level: 'success',
          category: 'workflow',
          message: `Workflow completed: "${next.topic}" — report ready with ${next.sources?.length ?? 0} sources`,
          runId,
        })
      }

      if (next && shouldDeliverWebhook(next)) {
        return deliverWebhook(next)
      }

      return next
    }

    if (status === 'failed' || status === 'cancelled') {
      const next = await updateBrief(runId, {
        status: 'failed',
        error: `Workflow ${status}`,
      })

      if (next) {
        appendLog({
          userId: next.userId,
          level: 'error',
          category: 'workflow',
          message: `Workflow ${status}: "${next.topic}"`,
          runId,
        })
      }

      return next
    }

    return updateBrief(runId, { status: 'running' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown workflow sync error'
    appendLog({
      userId: record.userId,
      level: 'warn',
      category: 'system',
      message: `Workflow status sync failed for ${runId}: ${message}`,
      runId,
    })
    return record
  }
}
