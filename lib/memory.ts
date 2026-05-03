import type { AgentMemory } from './types'

const MEMORY_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const SYSTEM_SCOPE = '__system__'

function normalizeTopicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

function memoryScope(userId?: string): string {
  return userId?.trim() || SYSTEM_SCOPE
}

export function memoryKey(topic: string, userId?: string): string {
  return `beacon:user:${memoryScope(userId)}:memory:${normalizeTopicSlug(topic)}`
}

export function memoryPrefix(userId?: string): string {
  return `beacon:user:${memoryScope(userId)}:memory:`
}

export function memoryKeyFromSlug(slug: string, userId?: string): string {
  return `${memoryPrefix(userId)}${slug}`
}

function resolveMemoryArgs(
  topicOrUserId: string,
  maybeTopic?: string
): { topic: string; userId?: string } {
  return maybeTopic
    ? { userId: topicOrUserId, topic: maybeTopic }
    : { topic: topicOrUserId }
}

// [Harness] Thin wrapper over Upstash REST pipeline — no SDK, no EventTarget dependency
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
  const data = (await res.json()) as Array<{ result: unknown; error?: string }>
  return data.map(d => d.result)
}

// [Memory] Load what the agent already knows — null = first run
export async function loadMemory(topic: string): Promise<AgentMemory | null>
export async function loadMemory(userId: string, topic: string): Promise<AgentMemory | null>
export async function loadMemory(topicOrUserId: string, maybeTopic?: string): Promise<AgentMemory | null> {
  const { topic, userId } = resolveMemoryArgs(topicOrUserId, maybeTopic)
  try {
    const [raw] = await upstash([['GET', memoryKey(topic, userId)]])
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as AgentMemory)
  } catch {
    // [Harness] Never fail a workflow because of a memory read error
    return null
  }
}

// [Memory] Save what the agent learned — never throws
export async function saveMemory(memory: AgentMemory): Promise<void> {
  try {
    const scoped = { ...memory, userId: memoryScope(memory.userId) }
    await upstash([['SET', memoryKey(memory.topic, scoped.userId), JSON.stringify(scoped), 'EX', MEMORY_TTL_SECONDS]])
  } catch {
    // [Harness] Log but don't throw — memory save failure should not kill the workflow
    console.error('[beacon:memory] Failed to save memory for:', memory.topic)
  }
}

// [Memory] Merge new URLs into existing (deduplicated, capped at 500)
export function mergeUrls(existing: string[], newUrls: string[]): string[] {
  return Array.from(new Set([...existing, ...newUrls])).slice(0, 500)
}

// [Memory] Remove already-seen URLs from SerpAPI results — generates delta reports
export function filterSeenUrls(
  results: Array<{ results?: Array<{ url?: string }> }>,
  seenUrls: string[]
): Array<{ results?: Array<{ url?: string }> }> {
  const seenSet = new Set(seenUrls)
  return results.map((r) => ({
    ...r,
    results: (r.results ?? []).filter((item) => !seenSet.has(item.url ?? '')),
  }))
}

// [Memory] Scan Redis for all stored topic memories (used by MCP search and list)
export async function listAllMemories(userId?: string): Promise<AgentMemory[]> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return []
  try {
    let cursor = 0
    const keys: string[] = []
    const prefix = memoryPrefix(userId)
    do {
      const res = await fetch(`${url}/scan/${cursor}?match=${encodeURIComponent(prefix)}*&count=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) break
      const data = await res.json() as { result: [string, string[]] }
      cursor = Number(data.result[0])
      keys.push(...data.result[1])
    } while (cursor !== 0)
    if (keys.length === 0) return []
    const pipeline = keys.map((k) => ['GET', k])
    const batchRes = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    })
    if (!batchRes.ok) return []
    const rows = (await batchRes.json()) as Array<{ result: string | null }>
    return rows
      .map((r) => r.result)
      .filter((v): v is string => typeof v === 'string')
      .map((v) => JSON.parse(v) as AgentMemory)
  } catch {
    return []
  }
}

// [Context] Format memory as LLM prompt context — injected into planQueries system prompt
export function buildMemoryContext(memory: AgentMemory | null): string {
  if (!memory) return ''
  return `
=== AGENT MEMORY (from ${memory.runCount} previous research run${memory.runCount > 1 ? 's' : ''}) ===
Last researched: ${new Date(memory.lastRunAt).toLocaleDateString()}
URLs already seen: ${memory.seenUrls.length} sources

What we already know:
${memory.keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Previous summary:
${memory.reportSummary}
=== END MEMORY ===

IMPORTANT: Do NOT re-research what we already know above.
Focus exclusively on finding NEW developments since ${new Date(memory.lastRunAt).toLocaleDateString()}.
`.trim()
}
