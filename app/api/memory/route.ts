import { auth } from '@clerk/nextjs/server'
import { Redis } from '@upstash/redis'
import '@/lib/polyfills'
import { NextResponse } from 'next/server'
import { memoryPrefix } from '@/lib/memory'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const redis = getRedis()
  if (!redis) return NextResponse.json([])
  try {
    const keys: string[] = []
    let cursor = 0
    const prefix = memoryPrefix(userId)
    do {
      const [next, batch] = await redis.scan(cursor, { match: `${prefix}*`, count: 100 })
      cursor = Number(next)
      keys.push(...(batch as string[]))
    } while (cursor !== 0)

    if (keys.length === 0) return NextResponse.json([])

    const values = await Promise.all(keys.map(k => redis.get(k)))
    const memories = values
      .map((v, i) => {
        if (!v) return null
        const mem = typeof v === 'string' ? JSON.parse(v) : v
        return { ...mem, _key: keys[i] }
      })
      .filter(Boolean)
      .sort((a: { lastRunAt?: string }, b: { lastRunAt?: string }) =>
        new Date(b.lastRunAt ?? 0).getTime() - new Date(a.lastRunAt ?? 0).getTime()
      )

    return NextResponse.json(memories)
  } catch (err) {
    console.error('[beacon:memory:api]', err)
    return NextResponse.json([])
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const redis = getRedis()
  if (!redis) return NextResponse.json({ ok: false, error: 'Upstash Redis is not configured' }, { status: 500 })
  try {
    const { key } = await req.json()
    if (!key?.startsWith(memoryPrefix(userId))) return NextResponse.json({ ok: false }, { status: 400 })
    await redis.del(key)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
