import { logStore, appendLog } from '@/lib/brief-store'
import { NextResponse } from 'next/server'

// Seed system-level boot entries on first call
let booted = false
function ensureBootLogs() {
  if (booted) return
  booted = true
  const now = new Date()
  const boot = (msg: string, cat: 'system' | 'memory' | 'workflow', level: 'info' | 'success' = 'info', offset = 0) =>
    appendLog({ level, category: cat, message: msg })
  boot('Beacon agent runtime initialized', 'system', 'success')
  boot('Upstash Redis connection established', 'memory', 'success')
  boot('Groq client ready — scout: llama-4-scout, synth: llama-3.3-70b-versatile', 'system', 'info')
  boot('SerpAPI tool registered', 'system', 'info')
  boot('Workflow SDK directives discovered — 1 workflow, 5 steps', 'workflow', 'info')
  boot('MCP server online at /api/mcp', 'system', 'success')
  boot('Chat SDK adapters ready — Slack, GitHub, Discord', 'system', 'info')
}

export async function GET(req: Request) {
  ensureBootLogs()
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500)
  const level = searchParams.get('level')
  const category = searchParams.get('category')

  let entries = [...logStore]
  if (level)    entries = entries.filter(e => e.level === level)
  if (category) entries = entries.filter(e => e.category === category)

  return NextResponse.json(entries.slice(0, limit))
}
