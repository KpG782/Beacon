import { Chat } from 'chat'
import { createSlackAdapter } from '@chat-adapter/slack'
import { createRedisState } from '@chat-adapter/state-redis'
import { loadMemory } from '@/lib/memory'

let _bot: Chat<{ slack: ReturnType<typeof createSlackAdapter> }> | null = null
let _slackAdapter: ReturnType<typeof createSlackAdapter> | null = null

function requireSlackEnv() {
  const missing: string[] = []
  if (!process.env.SLACK_BOT_TOKEN) missing.push('SLACK_BOT_TOKEN')
  if (!process.env.SLACK_SIGNING_SECRET) missing.push('SLACK_SIGNING_SECRET')
  if (!process.env.UPSTASH_REDIS_URL) missing.push('UPSTASH_REDIS_URL')
  if (missing.length > 0) {
    throw new Error(`Missing required Slack env vars: ${missing.join(', ')}`)
  }
}

// [Context] [Harness] Singleton Slack adapter — shared by bot and webhook route
export function getSlackAdapter() {
  if (_slackAdapter) return _slackAdapter
  requireSlackEnv()
  _slackAdapter = createSlackAdapter()
  return _slackAdapter
}

// [Harness] Lazy singleton — initialized on first request so env vars are available
function getBot() {
  if (_bot) return _bot
  const slackAdapter = getSlackAdapter()

  // [Memory] Requires UPSTASH_REDIS_URL (standard redis:// protocol, not REST)
  // Get from: Upstash dashboard → Database → Connect → ioredis
  const state = createRedisState({ url: process.env.UPSTASH_REDIS_URL })

  _bot = new Chat({
    userName: 'beacon',
    adapters: { slack: slackAdapter },
    state,
  })

  _bot.onNewMention(async (thread, message) => {
    await thread.subscribe()

    const rawTopic = message.text.replace(/@beacon\s*/i, '').trim()
    const recurring = /weekly|daily|every/i.test(rawTopic)
    const topic = rawTopic
      .replace(/,?\s*(watch|monitor|schedule|weekly|daily|every week).*/i, '')
      .trim()

    // [Memory] Check memory before starting — tell user if this topic is known
    const memory = await loadMemory(topic)

    if (memory) {
      await thread.post(
        `Starting research run #${memory.runCount + 1} on: *${topic}*\n` +
        `I have memory from ${memory.runCount} previous run${memory.runCount > 1 ? 's' : ''} ` +
        `(${memory.seenUrls.length} sources, last checked ${new Date(memory.lastRunAt).toLocaleDateString()})\n` +
        `Focusing on what's NEW since then...`
      )
    } else {
      await thread.post(
        `Starting first research run on: *${topic}*\n` +
        `No prior memory — running full research...`
      )
    }

    const res = await fetch(`${process.env.VERCEL_URL}/api/briefs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        recurring,
        recurringInterval: recurring ? '7 days' : null,
        source: 'slack',
      }),
    })

    const { runId } = await res.json()
    await thread.post(
      `Research job started (\`${runId}\`)\n` +
      `Live progress: ${process.env.VERCEL_URL}/briefs/${runId}`
    )
  })

  _bot.onSubscribedMessage(async (thread, message) => {
    if (/cancel|stop/i.test(message.text)) {
      await thread.post('Got it — cancelling the recurring monitor.')
    }
  })

  return _bot
}

export { getBot }
