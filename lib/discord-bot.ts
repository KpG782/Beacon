import { Chat } from 'chat'
import { createDiscordAdapter } from '@chat-adapter/discord'
import { createRedisState } from '@chat-adapter/state-redis'
import { loadMemory } from '@/lib/memory'

let _bot: Chat<{ discord: ReturnType<typeof createDiscordAdapter> }> | null = null
let _discordAdapter: ReturnType<typeof createDiscordAdapter> | null = null

function requireDiscordEnv() {
  const missing: string[] = []
  if (!process.env.DISCORD_TOKEN) missing.push('DISCORD_TOKEN')
  if (!process.env.DISCORD_PUBLIC_KEY) missing.push('DISCORD_PUBLIC_KEY')
  if (!process.env.UPSTASH_REDIS_URL) missing.push('UPSTASH_REDIS_URL')
  if (missing.length > 0) {
    throw new Error(`Missing required Discord env vars: ${missing.join(', ')}`)
  }
}

export function getDiscordAdapter() {
  if (_discordAdapter) return _discordAdapter
  requireDiscordEnv()
  _discordAdapter = createDiscordAdapter()
  return _discordAdapter
}

export function getDiscordBot() {
  if (_bot) return _bot
  const discordAdapter = getDiscordAdapter()
  const state = createRedisState({ url: process.env.UPSTASH_REDIS_URL })

  _bot = new Chat({
    userName: 'beacon',
    adapters: { discord: discordAdapter },
    state,
  })

  _bot.onNewMention(async (thread, message) => {
    await thread.subscribe()

    const rawTopic = message.text.replace(/@beacon\s*/i, '').trim()
    const recurring = /weekly|daily|every/i.test(rawTopic)
    const topic = rawTopic
      .replace(/,?\s*(watch|monitor|schedule|weekly|daily|every week).*/i, '')
      .trim()

    const memory = await loadMemory(topic)

    if (memory) {
      await thread.post(
        `Starting research run #${memory.runCount + 1} on: **${topic}**\n` +
        `I have memory from ${memory.runCount} previous run${memory.runCount > 1 ? 's' : ''} ` +
        `(${memory.seenUrls.length} sources). Focusing on what's new...`
      )
    } else {
      await thread.post(`Starting first research run on: **${topic}**`)
    }

    const res = await fetch(`${process.env.VERCEL_URL}/api/briefs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, recurring, source: 'discord' }),
    })

    const { runId } = await res.json()
    await thread.post(
      `Research job started (\`${runId}\`)\n` +
      `Live progress: ${process.env.VERCEL_URL}/briefs/${runId}`
    )
  })

  return _bot
}
