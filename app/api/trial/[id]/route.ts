import { NextRequest, NextResponse } from 'next/server'
import { briefStore, hydrateBriefRecord, syncBriefRecord } from '@/lib/brief-store'
import { getTrialSessionId, trialUserId } from '@/lib/trial'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = getTrialSessionId(req)
  if (!sessionId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const record = await syncBriefRecord(id) ?? await hydrateBriefRecord(id) ?? briefStore.get(id)
  if (!record || record.userId !== trialUserId(sessionId)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json(record)
}
