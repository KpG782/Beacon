import { NextResponse } from 'next/server'

export async function GET() {
  const check = (key: string) => !!(process.env[key] && process.env[key] !== 'your_vercel_token_here' && !process.env[key]?.includes('********'))

  return NextResponse.json({
    groq:      { ok: check('GROQ_API_KEY'),             label: 'Groq AI',        href: 'https://console.groq.com/keys' },
    serpapi:   { ok: check('SERPAPI_API_KEY'),           label: 'SerpAPI',        href: 'https://serpapi.com/manage-api-key' },
    redis:     { ok: check('UPSTASH_REDIS_REST_URL'),    label: 'Upstash Redis',  href: 'https://console.upstash.com' },
    slack:     { ok: check('SLACK_BOT_TOKEN'),           label: 'Slack',          href: 'https://api.slack.com/apps' },
    github:    { ok: check('GITHUB_APP_ID'),             label: 'GitHub App',     href: 'https://github.com/settings/apps' },
    discord:   { ok: check('DISCORD_TOKEN'),             label: 'Discord',        href: 'https://discord.com/developers/applications' },
  })
}
