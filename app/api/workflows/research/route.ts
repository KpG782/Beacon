// [Harness] Workflow SDK route — handles durable step execution callbacks
// The 'use workflow' directive in workflows/research.ts marks researchAgent as durable.
// This route is the HTTP entry point the Workflow SDK calls to resume/checkpoint steps.
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'workflow route active' })
}

export async function POST(req: NextRequest) {
  // Workflow SDK calls this route internally to execute steps
  return NextResponse.json({ received: true })
}

export const maxDuration = 300
