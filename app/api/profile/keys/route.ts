import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserKeys, saveUserKeys, maskKey } from '@/lib/user-keys'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const keys = await getUserKeys(userId)
  if (!keys) return NextResponse.json({ configured: false })

  // Never send actual keys back — only masked versions
  return NextResponse.json({
    configured: true,
    groq: keys.groqApiKey ? { masked: maskKey(keys.groqApiKey), set: true } : { set: false },
    serp: keys.serpApiKey ? { masked: maskKey(keys.serpApiKey), set: true } : { set: false },
    updatedAt: keys.updatedAt,
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json() as { groqApiKey?: string; serpApiKey?: string }
  if (!body.groqApiKey && !body.serpApiKey) {
    return NextResponse.json({ error: 'provide at least one key' }, { status: 400 })
  }

  // Merge with existing keys — don't wipe unset fields
  const existing = await getUserKeys(userId)
  await saveUserKeys(userId, {
    groqApiKey: body.groqApiKey || existing?.groqApiKey,
    serpApiKey: body.serpApiKey || existing?.serpApiKey,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { deleteUserKeys } = await import('@/lib/user-keys')
  await deleteUserKeys(userId)
  return NextResponse.json({ ok: true })
}
