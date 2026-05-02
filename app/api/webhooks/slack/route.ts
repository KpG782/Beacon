import { slackAdapter, getBot } from '@/lib/chat-bot'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // [Harness] Initialize bot lazily on first request (env vars available at runtime)
  getBot()
  return slackAdapter.handleWebhook(req)
}
