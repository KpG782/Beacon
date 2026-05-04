import { getGithubAdapter, getGithubBot } from '@/lib/github-bot'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    getGithubBot()
    return (getGithubAdapter() as { handleWebhook: (request: Request) => Promise<Response> | Response }).handleWebhook(req)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub webhook is not configured'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
