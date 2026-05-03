import { Redis } from '@upstash/redis'
import '@/lib/polyfills'
import { NextResponse } from 'next/server'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Upstash Redis is not configured' }, { status: 500 })

  try {
    const { slug } = await params
    const key = `beacon:memory:${slug}`
    const value = await redis.get(key)
    if (!value) return NextResponse.json({ error: 'Memory entry not found' }, { status: 404 })

    const memory = typeof value === 'string' ? JSON.parse(value) : value
    return NextResponse.json({ ...memory, _key: key })
  } catch (err) {
    console.error('[beacon:memory:item:api]', err)
    return NextResponse.json({ error: 'Failed to load memory entry' }, { status: 500 })
  }
}
