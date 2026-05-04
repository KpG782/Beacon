import { syncBriefRecord } from '@/lib/brief-store'
import { validateDemoKey } from '../route'
import { NextRequest, NextResponse } from 'next/server'

// ── GET /api/demo/:runId — poll a demo run for status and report ──────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  if (!validateDemoKey(req)) {
    return NextResponse.json({ error: 'Missing or invalid demo key' }, { status: 401 })
  }

  const { runId } = await params

  if (!runId?.startsWith('wrun_')) {
    return NextResponse.json(
      { error: 'Invalid run ID — use the runId returned by POST /api/demo' },
      { status: 400 }
    )
  }

  const record = await syncBriefRecord(runId)
  if (!record) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  return NextResponse.json({
    runId: record.runId,
    status: record.status,
    topic: record.topic,
    currentStep: record.currentStep,
    report: record.status === 'complete' ? record.report : undefined,
    sources: record.status === 'complete' ? record.sources?.slice(0, 5) : undefined,
    completedAt: record.updatedAt,
    demo: true,
  })
}
