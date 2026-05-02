# 🔦 Beacon

> **Autonomous web research agent with persistent memory** — runs deep SerpAPI investigations while you're offline, remembers what it learned, delivers delta reports showing exactly what changed, and delivers to Slack, GitHub PRs, and a live dashboard.

Built for the [Vercel Zero to Agent Hackathon](https://community.vercel.com/hackathons/zero-to-agent) · April 24 – May 4, 2026

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/beacon)

---

## The Problem

Knowledge workers spend **4–8 hours/week** on manual web research. AI agents exist — but they reset to zero every session. ChatGPT Deep Research doesn't remember what it found last week. It re-researches everything from scratch, delivers nowhere useful, and can't tell you what actually changed.

**Two problems in one:**
1. No persistent memory across sessions — agents always start from zero
2. No delivery — findings stay inside the chat, never reach Slack or GitHub

## The Solution

Beacon is a **durable research agent with persistent cross-session memory** that:

1. Accepts a research brief from **Slack, GitHub, Discord, or the dashboard**
2. **Loads memory** — checks what it already knows about this topic from previous runs
3. Fans out **SerpAPI queries** focused only on finding NEW information
4. Synthesizes a **delta report** — "here's what changed since last week"
5. **Saves what it learned** back to memory — compounds over time
6. Delivers to **Slack thread**, **GitHub PR comment**, or **live dashboard**
7. **Sleeps and reruns weekly** — gets smarter every run, never resets

---

## Edge Over ChatGPT Deep Research

| Feature | ChatGPT Deep Research | Beacon |
|---|---|---|
| Persistent memory across sessions | ❌ Resets every time | ✅ Compounds every run |
| Delta reports (what changed) | ❌ Full reset every time | ✅ "Since last week: X changed" |
| Delivers to Slack | ❌ | ✅ |
| Delivers to GitHub PR | ❌ | ✅ |
| Scheduled weekly reruns | ❌ | ✅ |
| Survives browser close | ❌ | ✅ Durable workflow |
| Live progress dashboard | ❌ | ✅ v0-generated |
| Visible agent memory | ❌ | ✅ Dashboard memory panel |

---

## Track Coverage (All Three)

| Track | How Beacon Uses It |
|---|---|
| 🔁 **Vercel Workflow SDK** | Durable research jobs via `'use workflow'` / `'use step'`; `sleep('7 days')` for recurring monitors; memory persists across sleep cycles |
| 🎨 **v0 + MCPs** | v0-generated dashboard with memory visualization panel; SerpAPI as AI SDK tool; Beacon exposes its own MCP server for Claude Desktop / Cursor |
| 💬 **Chat SDK** | Single `onNewMention` handler on Slack + GitHub + Discord; delta reports posted with run count ("Research run #3 — here's what changed") |

---

## 100% Free Stack

| Tool | Cost | Notes |
|---|---|---|
| Next.js 16.2.4 on Vercel Hobby | **Free** | Workflow SDK included on Hobby |
| Vercel Workflow SDK | **Free** | 50,000 steps/month on Hobby |
| Groq (Llama 4 Scout + Llama 3.3 70B) | **Free tier** | console.groq.com |
| SerpAPI | **Free** | Your existing key |
| v0 | **Free** | Your existing credits |
| Upstash Redis | **Free tier** | Memory store + Chat SDK state |
| Chat SDK | **Free** | npm package |

**Total cost to ship: $0**

---

## Stack Versions

| Layer | Package | Version |
|---|---|---|
| Framework | `next` | **16.2.4** |
| Styling | `tailwindcss` | **v4** |
| Workflow | `workflow` | latest GA |
| AI SDK | `ai` | 4.x |
| Groq Provider | `@ai-sdk/groq` | latest |
| Chat SDK | `chat` | latest |
| Slack Adapter | `@chat-adapter/slack` | latest |
| GitHub Adapter | `@chat-adapter/github` | latest |
| Discord Adapter | `@chat-adapter/discord` | latest |
| Chat State | `@chat-adapter/state-redis` | latest |
| MCP Server | `mcp-handler` | latest |
| Redis Client | `@upstash/redis` | latest |
| Validation | `zod` | latest |
| Runtime | Node.js | ≥ 18.17 |

---

## Project Structure

```
beacon/
├── AGENTS.md
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Dashboard home (v0-generated)
│   ├── briefs/
│   │   ├── page.tsx                  # All briefs list
│   │   └── [id]/
│   │       └── page.tsx              # Live brief + memory panel (v0-generated)
│   └── api/
│       ├── briefs/
│       │   ├── route.ts              # POST → start / GET → list
│       │   └── [id]/
│       │       └── route.ts          # GET status + report + memory
│       ├── workflows/
│       │   └── research/
│       │       └── route.ts          # WDK workflow endpoint
│       ├── webhooks/
│       │   ├── slack/route.ts
│       │   ├── github/route.ts
│       │   └── discord/route.ts
│       └── mcp/
│           └── [...transport]/
│               └── route.ts          # Beacon-as-MCP-server
├── workflows/
│   └── research.ts                   # Core durable workflow
├── lib/
│   ├── groq.ts                       # Groq model instances
│   ├── serpapi.ts                    # SerpAPI tool + helpers
│   ├── memory.ts                     # ← Persistent agent memory layer
│   ├── chat-bot.ts                   # Chat SDK bot
│   └── types.ts                      # Shared types
├── components/                       # ALL from v0
│   ├── BriefsList.tsx
│   ├── BriefCard.tsx
│   ├── ResearchProgress.tsx
│   ├── ReportView.tsx
│   └── MemoryPanel.tsx               # ← Shows agent memory state
├── proxy.ts
├── next.config.ts
├── tailwind.config.ts
└── .env.local.example
```

---

## How It Works End to End

```
Run 1 — User in Slack: "@beacon research Vercel vs Cloudflare, weekly"
        ↓
Chat SDK → POST /api/briefs → trigger(researchAgent, brief)
        ↓
  [Step 1] loadMemory()        No memory yet — fresh run
  [Step 2] planQueries()       Scout: cover all angles (full research)
  [Step 3] runSerpQueries()    SerpAPI: Google + News + Scholar
  [Step 4] synthesizeReport()  70B: full cited report
  [Step 5] saveMemory()        Stores: URLs seen, key facts, summary
  [Step 6] sleep('7 days')     Zero compute while sleeping
        ↓
Slack: "Research run #1 complete — full report attached"

────────────────── 7 days later ──────────────────

Run 2 — Workflow wakes from sleep, reruns automatically
        ↓
  [Step 1] loadMemory()        Loads: 23 URLs seen, 8 key facts known
  [Step 2] planQueries()       Scout: "find what CHANGED since [date]"
  [Step 3] runSerpQueries()    SerpAPI: skips known URLs, finds new ones
  [Step 4] synthesizeReport()  70B: delta report — only what changed
  [Step 5] saveMemory()        Updates memory: now 31 URLs, 12 facts
  [Step 6] sleep('7 days')     Back to sleep
        ↓
Slack: "Research run #2 — here's what changed since last week: [delta]"
```

---

## Environment Variables

```env
# Groq — free at console.groq.com/keys
GROQ_API_KEY=gsk_xxxxxxxxxxxx

# SerpAPI — you already have this
SERPAPI_API_KEY=your_serpapi_key

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# GitHub
GITHUB_APP_ID=...
GITHUB_PRIVATE_KEY=...
GITHUB_WEBHOOK_SECRET=...

# Discord
DISCORD_TOKEN=...
DISCORD_PUBLIC_KEY=...

# Upstash Redis — memory store + Chat SDK state (free at upstash.com)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Local dev
VERCEL_URL=http://localhost:3000
```

---

## Quick Start

```bash
git clone https://github.com/yourusername/beacon
cd beacon
npm install
cp .env.local.example .env.local
# Fill in keys

# Terminal 1
npm run dev

# Terminal 2
npx workflow dev

# Test a research run
curl -X POST http://localhost:3000/api/briefs \
  -H "Content-Type: application/json" \
  -d '{"topic": "SerpAPI vs Exa vs Brave Search 2026", "source": "dashboard"}'

# Open workflow UI
open http://localhost:3001
```

---

## Demo Script (3 min)

| Time | Scene | What to Show |
|---|---|---|
| 0:00–0:15 | Slack | `@beacon research X, watch weekly` → reply with run #1 |
| 0:15–0:50 | Vercel Dashboard | Workflow steps running, memory being saved |
| 0:50–1:00 | Drama | Close browser → reopen → still running |
| 1:00–1:30 | v0 Dashboard | Brief detail — progress + **memory panel** (URLs seen, facts known) |
| 1:30–2:00 | Slack | Run #1 report posted |
| 2:00–2:20 | Fast-forward | Show run #2 — delta report, "here's what changed" |
| 2:20–2:40 | GitHub | PR comment → inline research reply |
| 2:40–3:00 | Claude Desktop | Call `research_brief` via MCP tool |

---

## License

MIT — built for the Vercel Zero to Agent Hackathon 2026
