import { auth } from '@clerk/nextjs/server'
import { briefStore, hydrateBriefRecord, saveBriefRecord, syncBriefRecord } from '@/lib/brief-store'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const record = await syncBriefRecord(id) ?? await hydrateBriefRecord(id) ?? briefStore.get(id)
  if (!record || record.userId !== userId) {
    return NextResponse.json({ runId: id, status: 'running', currentStep: 'loadMemory' })
  }
  return NextResponse.json(record)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const update = await req.json()
  const existing = briefStore.get(id)
  if (existing && existing.userId === userId) {
    await saveBriefRecord({ ...existing, ...update, updatedAt: new Date().toISOString() })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'not found' }, { status: 404 })
}
