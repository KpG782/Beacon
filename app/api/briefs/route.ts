import { start } from 'workflow/api'
import { researchAgent } from '@/workflows/research'
import { loadMemory } from '@/lib/memory'
import { appendLog, hydrateBriefIndex, saveBriefRecord, syncBriefRecord } from '@/lib/brief-store'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const brief = await req.json()
  const run = await start(researchAgent, [brief])
  const existingMemory = await loadMemory(brief.topic)

  const record = {
    runId: run.runId,
    topic: brief.topic,
    status: 'running' as const,
    source: brief.source ?? 'dashboard',
    recurring: brief.recurring ?? false,
    runCount: (existingMemory?.runCount ?? 0) + 1,
    hasMemory: !!existingMemory,
    memoryFacts: existingMemory?.keyFacts.length ?? 0,
    createdAt: new Date().toISOString(),
    currentStep: 'loadMemory',
  }

  await saveBriefRecord(record)
  appendLog({
    level: 'info',
    category: 'workflow',
    message: `Workflow started: "${brief.topic}" — run #${record.runCount} via ${record.source}`,
    runId: run.runId,
  })
  if (existingMemory) {
    appendLog({
      level: 'success',
      category: 'memory',
      message: `Memory loaded: ${existingMemory.keyFacts.length} facts, ${existingMemory.seenUrls.length} URLs for "${brief.topic}"`,
      runId: run.runId,
    })
  } else {
    appendLog({
      level: 'info',
      category: 'memory',
      message: `First run for "${brief.topic}" — no prior memory`,
      runId: run.runId,
    })
  }

  return NextResponse.json(record)
}

export async function GET() {
  const records = await hydrateBriefIndex()
  const synced = await Promise.all(records.map((record) => syncBriefRecord(record.runId)))
  return NextResponse.json(
    synced
      .filter((record): record is NonNullable<typeof record> => !!record)
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
  )
}
