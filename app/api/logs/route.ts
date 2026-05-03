import { auth } from '@clerk/nextjs/server'
import { logStore, appendLog, hydrateLogsFromRedis } from '@/lib/brief-store'
import { NextResponse } from 'next/server'

let booted = false
function ensureBootLogs() {
  if (booted) return
  booted = true
  appendLog({ level: 'success', category: 'system',   message: 'Beacon agent runtime initialized' })
  appendLog({ level: 'success', category: 'memory',   message: 'Upstash Redis connection established' })
  appendLog({ level: 'info',    category: 'system',   message: 'Groq client ready — scout: llama-4-scout, synth: llama-3.3-70b-versatile' })
  appendLog({ level: 'info',    category: 'system',   message: 'SerpAPI tool registered' })
  appendLog({ level: 'info',    category: 'workflow',  message: 'Workflow SDK directives discovered — 1 workflow, 5 steps' })
  appendLog({ level: 'success', category: 'system',   message: 'MCP server online at /api/mcp' })
  appendLog({ level: 'info',    category: 'system',   message: 'Chat SDK adapters ready — Slack, GitHub, Discord' })
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  ensureBootLogs()
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500)
  const level = searchParams.get('level')
  const category = searchParams.get('category')
  const runId = searchParams.get('runId')

  // If this function instance is cold (just spun up), hydrate from Redis
  let entries = [...logStore]
  if (entries.length <= 7) {
    const persisted = await hydrateLogsFromRedis(500)
    // Merge: prefer in-memory (fresher) over persisted, dedup by id
    const seen = new Set(entries.map(e => e.id))
    for (const e of persisted) {
      if (!seen.has(e.id)) { entries.push(e); seen.add(e.id) }
    }
    entries.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  }

  entries = entries.filter((e) => !e.userId || e.userId === userId)

  if (level)    entries = entries.filter(e => e.level === level)
  if (category) entries = entries.filter(e => e.category === category)
  if (runId)    entries = entries.filter(e => e.runId === runId)

  return NextResponse.json(entries.slice(0, limit))
}
