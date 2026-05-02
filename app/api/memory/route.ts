import { Redis } from '@upstash/redis'
import '@/lib/polyfills'
import { NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET() {
  try {
    const keys: string[] = []
    let cursor = 0
    do {
      const [next, batch] = await redis.scan(cursor, { match: 'beacon:memory:*', count: 100 })
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
  try {
    const { key } = await req.json()
    if (!key?.startsWith('beacon:memory:')) return NextResponse.json({ ok: false }, { status: 400 })
    await redis.del(key)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
