import { loadMemory } from '@/lib/memory'
import { NextRequest, NextResponse } from 'next/server'

// [Memory] Quick topic memory lookup for the UI — used by new brief form to preview prior state
export async function GET(req: NextRequest) {
  const raw   = req.nextUrl.searchParams.get('topic')
  const topic = raw?.trim().slice(0, 500)
  if (!topic) return NextResponse.json(null)
  try {
    const memory = await loadMemory(topic.trim())
    if (!memory) return NextResponse.json(null)
    return NextResponse.json({
      topic: memory.topic,
      runCount: memory.runCount,
      urlsIndexed: memory.seenUrls.length,
      factsStored: memory.keyFacts.length,
      lastRunAt: memory.lastRunAt,
      reportSummary: memory.reportSummary,
    })
  } catch {
    return NextResponse.json(null)
  }
}
