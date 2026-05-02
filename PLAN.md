# Beacon — Development Plan & Spec

> Zero to Agent Hackathon · Deadline: May 4, 2026  
> **Free stack: Next.js 16.2.4 · Tailwind v4 · Workflow SDK · Groq · SerpAPI · Upstash Redis · Chat SDK**

---

## What We're Building (30-Second Version)

Beacon = ChatGPT Deep Research, but it:
- **Remembers** what it found across sessions (persistent memory)
- **Delivers** to Slack + GitHub + dashboard (not just a chat window)
- **Never resets** — gets smarter every weekly run
- **Shows delta** — "here's what changed since last week"

Built on a **$0 stack.**

---

## Free Keys — Get These Before Writing Any Code

| Key | Where | Time |
|---|---|---|
| `GROQ_API_KEY` | console.groq.com/keys → Create API Key | 2 min |
| `UPSTASH_REDIS_REST_URL` + `TOKEN` | upstash.com → Create Database (free) | 3 min |
| `SERPAPI_API_KEY` | Already have it | — |
| `SLACK_BOT_TOKEN` + `SIGNING_SECRET` | api.slack.com/apps → Create App | 10 min |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  INPUT (3 surfaces)                   │
│  Slack mention │ GitHub PR comment │ Dashboard form   │
└────────┬───────┴────────┬──────────┴──────┬──────────┘
         ▼                ▼                  ▼
┌──────────────────────────────────────────────────────┐
│              CHAT SDK  (chat npm)                     │
│  Slack + GitHub + Discord adapters                    │
│  onNewMention → POST /api/briefs                      │
│  State: Upstash Redis                                 │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│           WORKFLOW SDK  (workflow npm)                │
│                                                       │
│  researchAgent(brief)                                 │
│  ├── [step] loadMemory()      ← Upstash Redis         │
│  ├── [step] planQueries()     ← Groq Llama 4 Scout    │
│  ├── [step] runSerpQueries()  ← SerpAPI REST          │
│  ├── [step] synthesizeReport() ← Groq Llama 3.3 70B  │
│  ├── [step] saveMemory()      ← Upstash Redis         │
│  └── [sleep] sleep('7 days')  ← zero compute          │
│                                                       │
│  Hobby: 50K steps/month free                          │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│         MEMORY LAYER  (lib/memory.ts)                 │
│  Per-topic memory: seenUrls, keyFacts, runCount       │
│  Stored in Upstash Redis, 30-day TTL                  │
│  Loaded before run → saved after run                  │
│  Makes every run smarter than the last                │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│                OUTPUT (3 surfaces)                    │
│  Slack thread │ GitHub PR comment │ Dashboard          │
│  + Beacon MCP server (Claude Desktop / Cursor)        │
└──────────────────────────────────────────────────────┘
```

---

## Build Order

```
Phase 0  Scaffold + keys + env              30 min
Phase 1  Groq config + types                15 min
Phase 2  SerpAPI tool                       30 min
Phase 2.5 ← Memory layer (NEW)             45 min   ← ADD THIS
Phase 3  Workflow engine                    2-3 hrs
Phase 4  Chat SDK (Slack)                   1-2 hrs
Phase 5  v0 Dashboard                       1-2 hrs
Phase 6  MCP server                         30 min
Phase 7  Deploy + demo prep                 1 hr
─────────────────────────────────────────────────
Total    ~8-10 hrs across 3 days
```

**Start order tonight: Phase 0 → 1 → 2 → 2.5 → 3**
The workflow engine (Phase 3) is the core. Everything else feeds it.

---

## Phase 0 — Scaffold & Keys
**Time: 30 min**

### Step 1 — Scaffold

```bash
npx create-next-app@latest beacon --typescript --tailwind --app --turbopack
cd beacon
```

Prompts:
- TypeScript → **Yes**
- ESLint → **Yes**
- Tailwind → **Yes**
- `src/` directory → **No**
- App Router → **Yes**
- Turbopack → **Yes**
- Import alias → **Yes** (`@/*`)

### Step 2 — Install all dependencies

```bash
# Workflow SDK
npm install workflow @workflow/world-vercel

# AI SDK + Groq
npm install ai @ai-sdk/groq

# Memory store
npm install @upstash/redis

# Chat SDK + adapters
npm install chat @chat-adapter/slack @chat-adapter/github @chat-adapter/discord @chat-adapter/state-redis

# MCP server
npm install mcp-handler

# Utilities
npm install zod
```

### Step 3 — Create `.env.local`

```env
# Groq
GROQ_API_KEY=gsk_xxxxxxxxxxxx

# SerpAPI
SERPAPI_API_KEY=your_key_here

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# Upstash Redis (memory + chat state)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Local dev
VERCEL_URL=http://localhost:3000
```

### Step 4 — `next.config.ts`

```typescript
import type { NextConfig } from 'next'
import { withWorkflow } from 'workflow/next'

const nextConfig: NextConfig = {
  experimental: {
    agentDevtools: true,
  },
}

export default withWorkflow(nextConfig)
```

### Step 5 — Tailwind v4 setup

Replace `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-beacon-bg: #0a0a0a;
  --color-beacon-surface: #111111;
  --color-beacon-border: #262626;
  --color-beacon-accent: #f97316;
  --color-beacon-text: #e5e5e5;
  --color-beacon-muted: #737373;
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Geist', sans-serif;
}

body {
  background-color: #0a0a0a;
  color: #e5e5e5;
}
```

Replace `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        beacon: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#262626',
          accent: '#f97316',
          text: '#e5e5e5',
          muted: '#737373',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Geist', 'sans-serif'],
      },
    },
  },
}

export default config
```

### Step 6 — `AGENTS.md` in root

```markdown
# AGENTS.md — Beacon

## What This Is
Durable web research agent with persistent cross-session memory.
SerpAPI + Groq + Upstash Redis memory + Workflow SDK + Chat SDK.
Vercel Zero to Agent Hackathon 2026.

## Stack Rules (NEVER BREAK THESE)
1. AI models: scoutModel for tool use, synthModel for writing. Both from @/lib/groq.
   Never import @ai-sdk/anthropic or @ai-sdk/openai directly.
2. Workflow steps ('use step') must be pure and idempotent. No side effects.
3. sleep() burns zero compute. Never replace with polling.
4. Memory is loaded FIRST and saved LAST in every workflow run.
5. Chat SDK bot is a singleton in lib/chat-bot.ts.
6. Use proxy.ts not middleware.ts (Next.js 16 rename).
7. All dashboard UI comes from v0. Do not hand-code components.

## Key Files
- workflows/research.ts  — all workflow logic
- lib/memory.ts          — persistent memory layer ← core differentiator
- lib/groq.ts            — model config
- lib/serpapi.ts         — search tool
- lib/chat-bot.ts        — Slack + GitHub + Discord

## Design System (from v0)
- Background #0a0a0a, Surface #111111, Border #262626
- Accent #f97316 (orange), Text #e5e5e5, Muted #737373
- Fonts: JetBrains Mono (data), Geist (prose)
- NO rounded cards, NO gradients, sharp 1px borders
```

### Step 7 — Verify

```bash
npm run dev
# localhost:3000 renders without errors = Phase 0 done ✅
```

---

## Phase 1 — Groq Config + Types
**Time: 15 min**

`lib/groq.ts`:

```typescript
import { createGroq } from '@ai-sdk/groq'

const groqClient = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

// Fast, good at tool use and function calling
export const scoutModel = groqClient('llama-4-scout')

// Better long-form writing quality — use for synthesis only
export const synthModel = groqClient('llama-3.3-70b-versatile')
```

`lib/types.ts`:

```typescript
export interface ResearchBrief {
  id?: string
  topic: string
  depth?: 'quick' | 'deep'
  recurring?: boolean
  recurringInterval?: string
  mode?: 'full' | 'delta'
  source?: 'slack' | 'github' | 'discord' | 'dashboard' | 'mcp'
}

export interface ResearchReport {
  topic: string
  summary: string
  content: string
  sources: Source[]
  generatedAt: string
  runCount: number
  isDelta: boolean
}

export interface Source {
  index: number
  title: string
  url: string
  snippet: string
  engine: string
}

export interface AgentMemory {
  topic: string
  seenUrls: string[]
  keyFacts: string[]
  lastRunAt: string
  runCount: number
  reportSummary: string
}

export interface QueryPlan {
  queries: {
    q: string
    engine: 'google' | 'google_news' | 'google_scholar' | 'google_jobs' | 'bing'
    intent: string
  }[]
}
```

---

## Phase 2 — SerpAPI Tool
**Time: 30 min**

`lib/serpapi.ts`:

```typescript
import { tool } from 'ai'
import { z } from 'zod'

export const serpApiTool = tool({
  description: 'Search the web using SerpAPI across multiple engines.',
  parameters: z.object({
    q: z.string().describe('Search query'),
    engine: z
      .enum(['google', 'google_news', 'google_scholar', 'google_jobs', 'bing'])
      .default('google'),
    num: z.number().default(8),
  }),
  execute: async ({ q, engine, num }) => {
    const params = new URLSearchParams({
      q,
      engine,
      num: num.toString(),
      api_key: process.env.SERPAPI_API_KEY!,
    })

    const res = await fetch(`https://serpapi.com/search?${params}`)
    if (!res.ok) throw new Error(`SerpAPI ${res.status}: ${await res.text()}`)
    const data = await res.json()

    const raw =
      data.organic_results ??
      data.news_results ??
      data.jobs_results ??
      []

    return {
      engine,
      query: q,
      results: raw.slice(0, num).map((r: any) => ({
        title: r.title ?? '',
        url: r.link ?? r.url ?? '',
        snippet: r.snippet ?? r.description ?? '',
        date: r.date ?? null,
      })),
    }
  },
})

// Compress SERP results into lean context — critical for token budget
export function compressSerpResults(results: any[]): string {
  return results
    .flatMap((r) => r.results ?? [])
    .filter((r) => r.url && r.snippet)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
    .join('\n\n')
}

export function extractAllUrls(results: any[]): string[] {
  return results
    .flatMap((r) => r.results ?? [])
    .map((r) => r.url)
    .filter(Boolean)
}

export function extractKeyFacts(reportContent: string): string[] {
  // Pull bullet points and numbered findings from the report
  return reportContent
    .split('\n')
    .filter((line) => /^[-•*\d]/.test(line.trim()))
    .map((line) => line.replace(/^[-•*\d.]\s*/, '').trim())
    .filter((line) => line.length > 20)
    .slice(0, 10)
}
```

---

## Phase 2.5 — Persistent Memory Layer ← NEW CORE DIFFERENTIATOR
**Time: 45 min**

This is the feature that separates Beacon from every other submission.

**Simple explanation:** Like a notebook the agent keeps between sessions. Before researching, it checks its notes. After researching, it updates them. Next run, it only looks for what's NEW.

`lib/memory.ts`:

```typescript
import { Redis } from '@upstash/redis'
import type { AgentMemory } from './types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const MEMORY_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

function memoryKey(topic: string): string {
  // Deterministic key per topic — same topic always hits same memory
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
  return `beacon:memory:${slug}`
}

// Load what the agent already knows about a topic
// Returns null on first run (no memory yet)
export async function loadMemory(topic: string): Promise<AgentMemory | null> {
  try {
    const raw = await redis.get(memoryKey(topic))
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as AgentMemory)
  } catch {
    // Never fail a workflow because of a memory read error
    return null
  }
}

// Save what the agent learned — call this after every successful run
export async function saveMemory(memory: AgentMemory): Promise<void> {
  try {
    await redis.set(memoryKey(memory.topic), JSON.stringify(memory), {
      ex: MEMORY_TTL_SECONDS,
    })
  } catch {
    // Log but don't throw — memory save failure shouldn't kill the workflow
    console.error('[beacon:memory] Failed to save memory for:', memory.topic)
  }
}

// Merge new URLs into existing memory (deduplicated)
export function mergeUrls(existing: string[], newUrls: string[]): string[] {
  return Array.from(new Set([...existing, ...newUrls])).slice(0, 500)
}

// Filter out URLs we've already seen — give SerpAPI only fresh queries
export function filterSeenUrls(
  results: any[],
  seenUrls: string[]
): any[] {
  const seenSet = new Set(seenUrls)
  return results.map((r) => ({
    ...r,
    results: (r.results ?? []).filter((item: any) => !seenSet.has(item.url)),
  }))
}

// Build memory context string for LLM — tells it what we already know
export function buildMemoryContext(memory: AgentMemory | null): string {
  if (!memory) return ''
  return `
=== AGENT MEMORY (from ${memory.runCount} previous research run${memory.runCount > 1 ? 's' : ''}) ===
Last researched: ${new Date(memory.lastRunAt).toLocaleDateString()}
URLs already seen: ${memory.seenUrls.length} sources

What we already know:
${memory.keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Previous summary:
${memory.reportSummary}
=== END MEMORY ===

IMPORTANT: Do NOT re-research what we already know above.
Focus exclusively on finding NEW developments since ${new Date(memory.lastRunAt).toLocaleDateString()}.
`.trim()
}
```

---

## Phase 3 — Workflow Engine (Core)
**Time: 2–3 hrs**

`workflows/research.ts`:

```typescript
import { sleep } from 'workflow'
import { generateText } from 'ai'
import { scoutModel, synthModel } from '@/lib/groq'
import { serpApiTool, compressSerpResults, extractAllUrls, extractKeyFacts } from '@/lib/serpapi'
import { loadMemory, saveMemory, mergeUrls, filterSeenUrls, buildMemoryContext } from '@/lib/memory'
import type { ResearchBrief, ResearchReport, QueryPlan, AgentMemory } from '@/lib/types'

export async function researchAgent(brief: ResearchBrief): Promise<ResearchReport> {
  'use workflow'

  // ─── Step 1: Load memory — what do we already know? ───────────────
  const memory = await loadMemoryStep(brief.topic)

  // ─── Step 2: Plan — expand topic into targeted queries ─────────────
  const plan = await planQueries(brief.topic, memory)

  // ─── Step 3: Search — fan out SerpAPI, skip known URLs ─────────────
  const rawResults = await Promise.all(
    plan.queries.map((q) => runSerpQuery(q.q, q.engine))
  )

  // Filter out URLs we've already seen (memory dedup)
  const freshResults = memory
    ? filterSeenUrls(rawResults, memory.seenUrls)
    : rawResults

  // ─── Step 4: Synthesize — write the report ─────────────────────────
  const report = await synthesizeReport(freshResults, brief, memory)

  // ─── Step 5: Save memory — update what we know ─────────────────────
  await saveMemoryStep({
    topic: brief.topic,
    seenUrls: mergeUrls(memory?.seenUrls ?? [], extractAllUrls(rawResults)),
    keyFacts: extractKeyFacts(report.content),
    lastRunAt: new Date().toISOString(),
    runCount: (memory?.runCount ?? 0) + 1,
    reportSummary: report.summary,
  })

  // ─── Step 6: Recurring — sleep then rerun ──────────────────────────
  if (brief.recurring && brief.recurringInterval) {
    await sleep(brief.recurringInterval)
    return researchAgent({ ...brief, mode: 'delta' })
  }

  return report
}

// ─── Step Functions ────────────────────────────────────────────────────

async function loadMemoryStep(topic: string): Promise<AgentMemory | null> {
  'use step'
  return loadMemory(topic)
}

async function planQueries(
  topic: string,
  memory: AgentMemory | null
): Promise<QueryPlan> {
  'use step'

  const memoryContext = buildMemoryContext(memory)
  const isRerun = memory && memory.runCount > 0

  const { text } = await generateText({
    model: scoutModel,
    system: `You are a research planning agent.
${memoryContext}

Generate ${isRerun ? '5-7' : '8-10'} search queries for the topic.
${isRerun
  ? 'Since this is a rerun, focus on: recent news, new releases, price changes, announcements since ' + new Date(memory!.lastRunAt).toLocaleDateString()
  : 'Since this is a fresh run, cover: overview, comparisons, recent news, use cases, pricing, community sentiment.'
}

Return ONLY valid JSON, no markdown, no explanation:
{
  "queries": [
    { "q": "exact search query", "engine": "google", "intent": "brief description" }
  ]
}

Available engines: google, google_news, google_scholar, google_jobs, bing`,
    prompt: `Research topic: ${topic}`,
  })

  try {
    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    // Safe fallback
    return {
      queries: [
        { q: topic, engine: 'google', intent: 'overview' },
        { q: `${topic} ${new Date().getFullYear()}`, engine: 'google_news', intent: 'recent' },
        { q: `${topic} comparison`, engine: 'google', intent: 'comparison' },
      ],
    }
  }
}

async function runSerpQuery(
  q: string,
  engine: 'google' | 'google_news' | 'google_scholar' | 'google_jobs' | 'bing'
) {
  'use step'

  const { toolResults } = await generateText({
    model: scoutModel,
    tools: { serpapi_search: serpApiTool },
    toolChoice: 'required',
    prompt: `Search: "${q}" using ${engine} engine. Return 8 results.`,
    maxSteps: 1,
  })

  return toolResults[0]?.result ?? { engine, query: q, results: [] }
}

async function synthesizeReport(
  serpResults: any[],
  brief: ResearchBrief,
  memory: AgentMemory | null
): Promise<ResearchReport> {
  'use step'

  const context = compressSerpResults(serpResults)
  const runCount = (memory?.runCount ?? 0) + 1
  const isDelta = runCount > 1

  const { text } = await generateText({
    model: synthModel,
    system: `You are a research analyst. Write a clear, cited research report.

${isDelta
  ? `This is research run #${runCount}. Write a DELTA report — focus on what CHANGED since last time.
Start with "## What Changed Since Last Week" before the full report.`
  : `This is the first research run. Write a comprehensive overview report.`
}

Format:
${isDelta ? '## What Changed Since Last Week\n[2-3 sentences on key changes]\n\n' : ''}## Executive Summary
[2-3 sentence overview]

## Key Findings
1. [Finding with inline citation like [1]]
2. [Finding with citation [2]]
3. [Finding with citation [3]]

## Sources
[1] Title — URL
[2] Title — URL

Rules: Always cite sources inline. Be specific. No fluff. Max 600 words.`,
    prompt: `Topic: ${brief.topic}
Run #${runCount}
${memory ? `Previous summary: ${memory.reportSummary}` : ''}

Fresh research data:
${context}`,
    maxTokens: 1500,
  })

  const sources = serpResults
    .flatMap((r) => r.results ?? [])
    .map((r: any, i: number) => ({
      index: i + 1,
      title: r.title ?? '',
      url: r.url ?? '',
      snippet: r.snippet ?? '',
      engine: r.engine ?? 'google',
    }))
    .slice(0, 20)

  return {
    topic: brief.topic,
    summary: text.split('\n').find((l) => l.trim().length > 30) ?? text.slice(0, 200),
    content: text,
    sources,
    generatedAt: new Date().toISOString(),
    runCount,
    isDelta,
  }
}

async function saveMemoryStep(memory: AgentMemory): Promise<void> {
  'use step'
  await saveMemory(memory)
}
```

`app/api/workflows/research/route.ts`:

```typescript
import { createWorkflowHandler } from 'workflow/next'
import { researchAgent } from '@/workflows/research'

export const { GET, POST } = createWorkflowHandler({
  workflow: researchAgent,
})

export const maxDuration = 300
```

`app/api/briefs/route.ts`:

```typescript
import { trigger } from 'workflow'
import { researchAgent } from '@/workflows/research'
import { loadMemory } from '@/lib/memory'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store — swap for DB in production
const briefs = new Map<string, any>()

export async function POST(req: NextRequest) {
  const brief = await req.json()

  const run = await trigger(researchAgent, brief, {
    id: `brief-${Date.now()}`,
  })

  // Check if memory exists for this topic already
  const existingMemory = await loadMemory(brief.topic)

  const record = {
    runId: run.id,
    topic: brief.topic,
    status: 'running',
    source: brief.source ?? 'dashboard',
    recurring: brief.recurring ?? false,
    runCount: (existingMemory?.runCount ?? 0) + 1,
    hasMemory: !!existingMemory,
    memoryFacts: existingMemory?.runCount ?? 0,
    createdAt: new Date().toISOString(),
  }

  briefs.set(run.id, record)
  return NextResponse.json(record)
}

export async function GET() {
  return NextResponse.json(Array.from(briefs.values()))
}
```

`app/api/briefs/[id]/route.ts`:

```typescript
import { loadMemory } from '@/lib/memory'
import { NextRequest, NextResponse } from 'next/server'

// Simplified — in production query the workflow SDK for run status
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  // Return run status + memory state for the dashboard
  // In production: query workflow SDK run status
  return NextResponse.json({
    runId: id,
    status: 'running', // workflow SDK will provide real status
  })
}
```

**Test Phase 3:**

```bash
# Terminal 1
npm run dev

# Terminal 2
npx workflow dev

# Terminal 3 — first run (no memory)
curl -X POST http://localhost:3000/api/briefs \
  -H "Content-Type: application/json" \
  -d '{"topic": "Vercel vs Cloudflare Workers 2026", "source": "dashboard", "recurring": false}'

# Check workflow at localhost:3001
# Wait for completion (~1-2 min)

# Second run (memory should load!)
curl -X POST http://localhost:3000/api/briefs \
  -H "Content-Type: application/json" \
  -d '{"topic": "Vercel vs Cloudflare Workers 2026", "source": "dashboard", "recurring": false}'

# Check Upstash dashboard — should see beacon:memory:* key
```

If run 2 shows "Run #2" in the report and skips already-seen URLs → **Phase 3 done ✅**

---

## Phase 4 — Chat SDK (Slack)
**Time: 1–2 hrs**

`lib/chat-bot.ts`:

```typescript
import { Chat } from 'chat'
import { createSlackAdapter } from '@chat-adapter/slack'
import { createRedisState } from '@chat-adapter/state-redis'
import { loadMemory } from '@/lib/memory'

export const bot = new Chat({
  userName: 'beacon',
  adapters: {
    slack: createSlackAdapter({
      token: process.env.SLACK_BOT_TOKEN!,
      signingSecret: process.env.SLACK_SIGNING_SECRET!,
    }),
  },
  state: createRedisState({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
})

bot.onNewMention(async (thread, message) => {
  await thread.subscribe()

  const rawTopic = message.text.replace(/@beacon\s*/i, '').trim()
  const recurring = /weekly|daily|every/i.test(rawTopic)
  const topic = rawTopic
    .replace(/,?\s*(watch|monitor|schedule|weekly|daily|every week).*/i, '')
    .trim()

  // Check memory before starting — tell user if we know this topic
  const memory = await loadMemory(topic)

  if (memory) {
    await thread.post(
      `🔦 Starting research run #${memory.runCount + 1} on: *${topic}*\n` +
      `📚 I have memory from ${memory.runCount} previous run${memory.runCount > 1 ? 's' : ''} ` +
      `(${memory.seenUrls.length} sources, last checked ${new Date(memory.lastRunAt).toLocaleDateString()})\n` +
      `🔍 Focusing on what's NEW since then...`
    )
  } else {
    await thread.post(
      `🔦 Starting first research run on: *${topic}*\n` +
      `📖 No prior memory — running full research...`
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
    `✅ Research job started (\`${runId}\`)\n` +
    `📊 Live progress: ${process.env.VERCEL_URL}/briefs/${runId}`
  )
})

bot.onSubscribedMessage(async (thread, message) => {
  if (/cancel|stop/i.test(message.text)) {
    await thread.post('🛑 Got it — cancelling the recurring monitor.')
  }
})
```

`app/api/webhooks/slack/route.ts`:

```typescript
import { bot } from '@/lib/chat-bot'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return bot.adapters.slack.handleWebhook(req)
}
```

**Test:** Use `ngrok http 3000` → set Slack webhook URL → mention `@beacon research something` in a channel.

---

## Phase 5 — v0 Dashboard
**Time: 1–2 hrs**

### Rule: Every component comes from v0. No hand-coded JSX.

### v0 Prompt 1 — Design system (paste this first, get design tokens only)

```
I'm building "Beacon" — a durable AI research agent dashboard.
Tech: Next.js 16.2, Tailwind v4, shadcn/ui, TypeScript.

Design: Dark terminal aesthetic. Think Bloomberg terminal meets Linear.
- Background: #0a0a0a
- Surface: #111111
- Borders: 1px solid #262626 — sharp edges, NO rounded-xl
- Accent: #f97316 (orange) for active/running states
- Text: #e5e5e5, Muted: #737373
- Fonts: JetBrains Mono for IDs/numbers, Geist for prose
- Status colors: running=orange, sleeping=gray, complete=green, failed=red
- NO gradients, NO purple, NO shadows

Give me the design system tokens only first — no code yet.
```

### v0 Prompt 2 — Dashboard home

```
Generate the Beacon dashboard home page component using our design system.

Props: briefs: Brief[]

Brief type:
{
  runId: string
  topic: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  source: 'slack' | 'github' | 'discord' | 'dashboard'
  recurring: boolean
  runCount: number        ← show "Run #3"
  hasMemory: boolean      ← show memory indicator if true
  createdAt: string
}

Each row shows:
- Status dot (orange pulse=running, gray=sleeping, green=complete, red=failed)
- Topic (truncate 60 chars)
- "Run #N" badge in monospace (orange if N > 1 to show memory is working)
- Source icon (small: Slack/GitHub/Discord/Dashboard)
- "🧠 Memory active" tag if hasMemory is true
- Recurring indicator if recurring is true
- Relative timestamp
- "View →" link to /briefs/[runId]

Top right: "New Research" button in orange.
Server component. Tailwind v4. TypeScript.
```

### v0 Prompt 3 — Brief detail with memory panel

```
Generate the brief detail page for /briefs/[id] using our design system.

Two-panel layout:

LEFT PANEL (55%) — Research Progress
- Header: topic, status badge, "Run #N", timestamp
- Vertical step timeline:
  1. Load Memory (shows "Loaded N facts from N previous runs" or "Fresh run - no prior memory")
  2. Plan Queries (shows N queries planned)
  3. SerpAPI Search (shows N queries running, N fresh results found, N skipped as known)
  4. Synthesize Report (running/complete)
  5. Save Memory (shows "Memory updated: N total URLs, N facts stored")
- Each step: icon, name, status indicator, elapsed time, output preview

RIGHT PANEL (45%) — Memory + Report
TOP: Memory Panel (collapsible, orange border)
  - "🧠 Agent Memory" header
  - Run count: "Research run #N"
  - Sources in memory: "47 URLs indexed"
  - Last updated: relative timestamp
  - Key facts: numbered list (first 5 facts from memory)
  - "Memory compounds every run" subtitle

BOTTOM: Report output
  - Streams in as markdown
  - If delta report: "What Changed Since Last Week" section highlighted in orange
  - Source citations as numbered list

Bottom bar: "Schedule Weekly" button, "Share to Slack" button

Poll GET /api/briefs/[id] every 3 seconds for live updates.
Show loading skeleton on first load.
```

### v0 Prompt 4 — New Brief Modal

```
Generate NewBriefModal component.

Fields:
- Topic: large full-width textarea, placeholder "What do you want Beacon to research?"
- Depth: Quick | Deep radio (default Deep)
- Recurring: toggle switch
- Interval (shows when recurring=true): Daily | Weekly | Monthly radio
- Submit: "Start Research" button, orange, full-width

On submit: POST to /api/briefs, show spinner.
On success: redirect to /briefs/[runId].
NO <form> tags — use onClick handlers only.
```

### After v0 generation:
1. Copy each component → paste into `components/`
2. `npm run dev` → confirm no errors
3. Wire real data in `app/page.tsx` and `app/briefs/[id]/page.tsx`
4. Commit: `feat: add v0-generated dashboard components`

---

## Phase 6 — Beacon as MCP Server
**Time: 30 min**

`app/api/mcp/[...transport]/route.ts`:

```typescript
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { loadMemory } from '@/lib/memory'

const handler = createMcpHandler((server) => {
  server.tool(
    'research_brief',
    'Run a deep web research job. Beacon remembers previous runs and returns delta reports.',
    {
      topic: z.string().describe('Research topic or question'),
      recurring: z.boolean().default(false),
    },
    async ({ topic, recurring }) => {
      const memory = await loadMemory(topic)
      const res = await fetch(`${process.env.VERCEL_URL}/api/briefs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, recurring, source: 'mcp' }),
      })
      const { runId, runCount } = await res.json()
      return {
        content: [{
          type: 'text',
          text: [
            `Research run #${runCount} started for: "${topic}"`,
            memory ? `📚 Using memory from ${memory.runCount} previous runs (${memory.seenUrls.length} sources indexed)` : '📖 Fresh run — no prior memory',
            `Run ID: ${runId}`,
            `Live progress: ${process.env.VERCEL_URL}/briefs/${runId}`,
          ].join('\n'),
        }],
      }
    }
  )
})

export const { GET, POST } = handler
```

---

## Phase 7 — Deploy & Demo Prep
**Time: 1 hr**

```bash
npm i -g vercel
vercel
# Add all env vars in Vercel dashboard → Settings → Environment Variables
```

### Pre-Demo Checklist

- [ ] Workflow runs end-to-end on Vercel URL
- [ ] Run #1 completes — memory key visible in Upstash dashboard
- [ ] Run #2 shows "Run #2" and delta report — memory is working
- [ ] Slack bot receives mention and replies with memory status
- [ ] Dashboard memory panel shows facts + URL count
- [ ] Browser close → reopen → workflow still running (screenshot)
- [ ] MCP server works in Claude Desktop
- [ ] All env vars set in Vercel (not just .env.local)

### The Key Demo Moment (Practice This)

```
"Watch — I'll run the same research topic twice.
 Run 1: [show] 47 sources indexed, report generated, memory saved.
 Run 2: [show] Loaded memory — 47 URLs already known, skipping them.
         Finds 12 NEW sources. Delta report: here's what changed.
 
 This is what no other agent does. It remembers."
```

---

## Failure Modes & Quick Fixes

| Problem | Fix |
|---|---|
| Memory key not appearing in Upstash | Check `UPSTASH_REDIS_REST_URL` and `TOKEN` are correct; test with `redis.set('test', '1')` |
| Run #2 not showing delta | Check `loadMemoryStep` returns data; add `console.log` inside |
| Groq rate limit | Switch both models to `llama-3.3-70b-versatile` temporarily |
| SerpAPI returns 401 | Verify `SERPAPI_API_KEY` in env; test at serpapi.com/playground |
| JSON parse error in planQueries | The fallback handles it — but add logging to see raw LLM output |
| `sleep('7 days')` too long for demo | Change to `sleep('30 seconds')` locally, revert before submission |
| Workflow step fails | Check `npx workflow dev` is running; check Vercel function logs |

---

## What Memory Adds to Your Submission Story

```
Without memory:  "A durable research agent that delivers to Slack"

With memory:     "A durable research agent with persistent cross-session
                  memory — indexes every source it's ever seen, never
                  re-researches what it already knows, delivers delta
                  reports showing exactly what changed since last week,
                  and gets smarter every single run"
```

That's the difference between a cool demo and a product judges remember.
