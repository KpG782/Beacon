import { getRun } from 'workflow/api'
import type { ResearchReport } from '@/lib/types'

const BRIEF_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const BRIEF_INDEX_KEY = 'beacon:briefs:index'

export interface BriefRecord {
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
}

export interface LogEntry {
  id: string
  ts: string
  level: 'info' | 'warn' | 'error' | 'success'
  category: 'workflow' | 'memory' | 'serpapi' | 'groq' | 'system'
  message: string
  runId?: string
}

export const briefStore = new Map<string, BriefRecord>()
export const logStore: LogEntry[] = []

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

export function appendLog(entry: Omit<LogEntry, 'id' | 'ts'>) {
  logStore.unshift({
    id: Math.random().toString(36).slice(2),
    ts: new Date().toISOString(),
    ...entry,
  })
  if (logStore.length > 500) logStore.length = 500
}

async function persistBriefRecord(record: BriefRecord): Promise<void> {
  try {
    const score = new Date(record.updatedAt ?? record.createdAt).getTime()
    await upstash([
      ['SET', briefKey(record.runId), JSON.stringify(record), 'EX', BRIEF_TTL_SECONDS],
      ['ZADD', BRIEF_INDEX_KEY, score, record.runId],
      ['EXPIRE', BRIEF_INDEX_KEY, BRIEF_TTL_SECONDS],
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

export async function hydrateBriefIndex(limit = 50): Promise<BriefRecord[]> {
  try {
    const [ids] = await upstash([['ZREVRANGE', BRIEF_INDEX_KEY, 0, Math.max(0, limit - 1)]])
    if (!Array.isArray(ids) || ids.length === 0) return []

    const fetches = ids
      .filter((id): id is string => typeof id === 'string')
      .map((runId) => ['GET', briefKey(runId)] as (string | number)[])
    const raws = await upstash(fetches)
    const records = raws
      .filter((raw): raw is string => typeof raw === 'string')
      .map((raw) => JSON.parse(raw) as BriefRecord)

    for (const record of records) briefStore.set(record.runId, record)
    return records
  } catch {
    return Array.from(briefStore.values())
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

export async function syncBriefRecord(runId: string): Promise<BriefRecord | null> {
  const record = await hydrateBriefRecord(runId)
  if (!record) return null

  if (record.status === 'complete' || record.status === 'failed') {
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
      })

      if (next) {
        appendLog({
          level: 'success',
          category: 'workflow',
          message: `Workflow completed: "${next.topic}" — report ready with ${next.sources?.length ?? 0} sources`,
          runId,
        })
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
      level: 'warn',
      category: 'system',
      message: `Workflow status sync failed for ${runId}: ${message}`,
      runId,
    })
    return record
  }
}
