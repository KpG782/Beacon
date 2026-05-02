import { Chat } from 'chat'
import { createSlackAdapter } from '@chat-adapter/slack'
import { createRedisState } from '@chat-adapter/state-redis'
import { loadMemory } from '@/lib/memory'

// [Context] [Harness] Singleton Slack adapter — shared by bot and webhook route
// SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET are read from env vars automatically
export const slackAdapter = createSlackAdapter()

let _bot: Chat<{ slack: ReturnType<typeof createSlackAdapter> }> | null = null

// [Harness] Lazy singleton — initialized on first request so env vars are available
function getBot() {
  if (_bot) return _bot

  // [Memory] Requires UPSTASH_REDIS_URL (standard redis:// protocol, not REST)
  // Get from: Upstash dashboard → Database → Connect → ioredis
  const state = createRedisState({
    url: process.env.UPSTASH_REDIS_URL,
  })

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
