import { getSlackAdapter, getBot } from '@/lib/chat-bot'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // [Harness] Initialize bot lazily on first request (env vars available at runtime)
    getBot()
    return getSlackAdapter().handleWebhook(req)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Slack webhook is not configured'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
