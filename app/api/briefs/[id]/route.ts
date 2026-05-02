import { briefStore, hydrateBriefRecord, saveBriefRecord, syncBriefRecord } from '@/lib/brief-store'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const record = await syncBriefRecord(id) ?? await hydrateBriefRecord(id) ?? briefStore.get(id)
  if (!record) {
    return NextResponse.json({ runId: id, status: 'running', currentStep: 'loadMemory' })
  }
  return NextResponse.json(record)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const update = await req.json()
  const existing = briefStore.get(id)
  if (existing) {
    await saveBriefRecord({ ...existing, ...update, updatedAt: new Date().toISOString() })
  }
  return NextResponse.json({ ok: true })
}
