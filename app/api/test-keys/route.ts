import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { groqApiKey, serpApiKey } = body as { groqApiKey?: string; serpApiKey?: string }

  const results: Record<string, { ok: boolean; error?: string; latencyMs?: number }> = {}

  if (groqApiKey) {
    const start = Date.now()
    try {
      const client = createGroq({ apiKey: groqApiKey })
      await generateText({
        model: client('llama-3.3-70b-versatile'),
        prompt: 'Say "ok" in one word.',
        maxTokens: 4,
      })
      results.groq = { ok: true, latencyMs: Date.now() - start }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.groq = {
        ok: false,
        latencyMs: Date.now() - start,
        error: msg.includes('401') || msg.includes('Invalid API Key') || msg.includes('invalid_api_key')
          ? 'Invalid API key'
          : msg.includes('429') || msg.includes('rate')
            ? 'Rate limit hit — key is valid but throttled'
            : 'Connection failed',
      }
    }
  }

  if (serpApiKey) {
    const start = Date.now()
    try {
      const params = new URLSearchParams({ q: 'test', engine: 'google', num: '1', api_key: serpApiKey })
      const res = await fetch(`https://serpapi.com/search?${params}`, { signal: AbortSignal.timeout(8000) })
      if (res.status === 401 || res.status === 403) {
        results.serpapi = { ok: false, latencyMs: Date.now() - start, error: 'Invalid API key' }
      } else if (res.status === 429) {
        results.serpapi = { ok: true, latencyMs: Date.now() - start, error: 'Rate limit hit — key is valid but throttled' }
      } else if (!res.ok) {
        results.serpapi = { ok: false, latencyMs: Date.now() - start, error: `SerpAPI returned ${res.status}` }
      } else {
        results.serpapi = { ok: true, latencyMs: Date.now() - start }
      }
    } catch (err) {
      results.serpapi = {
        ok: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error && err.name === 'TimeoutError' ? 'Request timed out' : 'Connection failed',
      }
    }
  }

  return NextResponse.json(results)
}
