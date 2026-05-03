import { NextResponse } from 'next/server'

async function checkRedis(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return { ok: false, latencyMs: 0, error: 'Not configured' }
  const start = Date.now()
  try {
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    })
    const latencyMs = Date.now() - start
    if (!res.ok) return { ok: false, latencyMs, error: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: err instanceof Error ? err.message : 'Unknown' }
  }
}

async function checkGroq(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const key = process.env.GROQ_API_KEY
  if (!key) return { ok: false, latencyMs: 0, error: 'Not configured' }
  const start = Date.now()
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    })
    const latencyMs = Date.now() - start
    if (res.status === 401) return { ok: false, latencyMs, error: 'Invalid API key' }
    if (!res.ok) return { ok: false, latencyMs, error: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: err instanceof Error ? err.message : 'Unknown' }
  }
}

async function checkSerpApi(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const key = process.env.SERPAPI_API_KEY
  if (!key) return { ok: false, latencyMs: 0, error: 'Not configured' }
  const start = Date.now()
  try {
    const params = new URLSearchParams({ q: 'health', engine: 'google', num: '1', api_key: key })
    const res = await fetch(`https://serpapi.com/search?${params}`, { signal: AbortSignal.timeout(6000) })
    const latencyMs = Date.now() - start
    if (res.status === 401 || res.status === 403) return { ok: false, latencyMs, error: 'Invalid API key' }
    if (res.status === 429) return { ok: true, latencyMs }
    if (!res.ok) return { ok: false, latencyMs, error: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: err instanceof Error ? err.message : 'Unknown' }
  }
}

export async function GET() {
  const [redis, groq, serpapi] = await Promise.all([checkRedis(), checkGroq(), checkSerpApi()])

  const allOk = redis.ok && groq.ok && serpapi.ok
  const status = allOk ? 200 : 503

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      services: { redis, groq, serpapi },
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
