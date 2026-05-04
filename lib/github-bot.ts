import { Chat } from 'chat'
import * as GitHubAdapterModule from '@chat-adapter/github'
import { createRedisState } from '@chat-adapter/state-redis'
import { loadMemory } from '@/lib/memory'

type GitHubAdapterFactory = typeof GitHubAdapterModule & {
  createGitHubAdapter?: () => unknown
}

function requireGitHubFactory() {
  const factory = (GitHubAdapterModule as GitHubAdapterFactory).createGitHubAdapter
  if (!factory) {
    throw new Error('@chat-adapter/github does not export createGitHubAdapter in this build')
  }
  return factory
}

type GitHubAdapter = ReturnType<ReturnType<typeof requireGitHubFactory>>

let _bot: Chat<{ github: never }> | null = null
let _githubAdapter: GitHubAdapter | null = null

function requireGithubEnv() {
  const missing: string[] = []
  if (!process.env.GITHUB_APP_ID) missing.push('GITHUB_APP_ID')
  if (!process.env.GITHUB_PRIVATE_KEY) missing.push('GITHUB_PRIVATE_KEY')
  if (!process.env.GITHUB_WEBHOOK_SECRET) missing.push('GITHUB_WEBHOOK_SECRET')
  if (!process.env.UPSTASH_REDIS_URL) missing.push('UPSTASH_REDIS_URL')
  if (missing.length > 0) {
    throw new Error(`Missing required GitHub env vars: ${missing.join(', ')}`)
  }
}

export function getGithubAdapter() {
  if (_githubAdapter) return _githubAdapter
  requireGithubEnv()
  _githubAdapter = requireGitHubFactory()()
  return _githubAdapter
}

export function getGithubBot() {
  if (_bot) return _bot
  const githubAdapter = getGithubAdapter()
  const state = createRedisState({ url: process.env.UPSTASH_REDIS_URL })

  _bot = new Chat({
    userName: 'beacon',
    adapters: { github: githubAdapter } as never,
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
        `Prior memory: ${memory.runCount} run${memory.runCount > 1 ? 's' : ''}, ` +
        `${memory.seenUrls.length} sources indexed. Focusing on what's new...`
      )
    } else {
      await thread.post(`Starting first research run on: **${topic}**`)
    }

    const res = await fetch(`${process.env.VERCEL_URL}/api/briefs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, recurring, source: 'github' }),
    })

    const { runId } = await res.json()
    await thread.post(
      `Research job started (\`${runId}\`)\n` +
      `Live progress: ${process.env.VERCEL_URL}/briefs/${runId}`
    )
  })

  return _bot
}
