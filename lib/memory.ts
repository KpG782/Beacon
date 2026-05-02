import { Redis } from '@upstash/redis'
import type { AgentMemory } from './types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const MEMORY_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

function memoryKey(topic: string): string {
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
  return `beacon:memory:${slug}`
}

// [Memory] Load what the agent already knows — null = first run
export async function loadMemory(topic: string): Promise<AgentMemory | null> {
  try {
    const raw = await redis.get(memoryKey(topic))
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
    await redis.set(memoryKey(memory.topic), JSON.stringify(memory), {
      ex: MEMORY_TTL_SECONDS,
    })
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
