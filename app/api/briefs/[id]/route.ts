import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // [Harness] In production: query workflow SDK for real run status
  return NextResponse.json({
    runId: id,
    status: 'running',
  })
}
