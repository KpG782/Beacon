import { start } from 'workflow/api'
import { researchAgent } from '@/workflows/research'
import { loadMemory } from '@/lib/memory'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store — swap for DB in production
const briefs = new Map<string, Record<string, unknown>>()

export async function POST(req: NextRequest) {
  const brief = await req.json()

  // [Harness] start() is the workflow SDK's trigger — returns a durable Run
  const run = await start(researchAgent, [brief])

  // [Memory] Check if memory exists for this topic before the run starts
  const existingMemory = await loadMemory(brief.topic)

  const record = {
    runId: run.runId,
    topic: brief.topic,
    status: 'running',
    source: brief.source ?? 'dashboard',
    recurring: brief.recurring ?? false,
    runCount: (existingMemory?.runCount ?? 0) + 1,
    hasMemory: !!existingMemory,
    memoryFacts: existingMemory?.keyFacts.length ?? 0,
    createdAt: new Date().toISOString(),
  }

  briefs.set(run.runId, record)
  return NextResponse.json(record)
}

export async function GET() {
  return NextResponse.json(Array.from(briefs.values()))
}
