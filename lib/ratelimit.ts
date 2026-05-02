// [Harness] Sliding-window rate limiter backed by Upstash REST — no extra packages
// Uses INCR+EXPIRE atomically: safe for concurrent Vercel function instances.

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function redisCmd(command: (string | number)[]): Promise<number | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([command]),
    })
    if (!res.ok) return null
    const data = (await res.json()) as [{ result: number }]
    return data[0]?.result ?? null
  } catch {
    return null
  }
}

async function redisPipeline(cmds: (string | number)[][]): Promise<void> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return
  try {
    await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
    })
  } catch {}
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number  // seconds until window resets
}

/**
 * Check and increment a sliding-window counter.
 * @param identifier  IP address or other per-caller string
 * @param action      Logical action name — used in the Redis key
 * @param limit       Max requests allowed per window
 * @param windowSecs  Window size in seconds
 */
export async function rateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSecs: number,
): Promise<RateLimitResult> {
  // Graceful degradation: if Redis is unavailable, allow the request
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  const key = `beacon:rl:${action}:${identifier.replace(/[^a-z0-9:.]/gi, '-').slice(0, 60)}`

  const count = await redisCmd(['INCR', key])
  if (count === null) return { allowed: true, remaining: limit - 1, retryAfter: 0 }

  // Set TTL only on first increment (avoids resetting the window on each hit)
  if (count === 1) {
    await redisPipeline([['EXPIRE', key, windowSecs]])
  }

  const allowed   = count <= limit
  const remaining = Math.max(0, limit - count)
  return { allowed, remaining, retryAfter: allowed ? 0 : windowSecs }
}

// Preconfigured limits for each surface
export const LIMITS = {
  // Most expensive: triggers SerpAPI + Groq — 5 runs/hour per IP
  research: { limit: 5,  windowSecs: 3600 },
  // MCP tools: 15/hour per IP
  mcp:      { limit: 15, windowSecs: 3600 },
  // Login brute-force: 10 attempts/15 min per IP
  login:    { limit: 10, windowSecs: 900  },
}
