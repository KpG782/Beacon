# Beacon

> Durable web research agent with persistent cross-session memory, framework-guided deep research, delta reruns, and self-healing multi-agent orchestration.

Built by [Ken Patrick Garcia](https://www.kenbuilds.tech) for the [Vercel Zero to Agent Hackathon](https://community.vercel.com/hackathons/zero-to-agent) 2026.

[Live Demo](https://beacon.vercel.app) · [API Docs](https://beacon.vercel.app/docs/api) · [MCP Docs](https://beacon.vercel.app/docs/mcp)

---

## Try It Now — No Signup Required

```bash
# Start a research run (3 free runs/day, no account needed)
curl -X POST https://beacon.vercel.app/api/demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer beacon_demo_key" \
  -d '{
    "topic": "AI coding agents market 2026",
    "objective": "Map the competitive landscape and identify whitespace",
    "frameworkId": "market-map",
    "depth": "quick"
  }'

# Response includes a runId:
# { "runId": "demo_abc123", "status": "running", "pollUrl": "/api/demo/demo_abc123" }

# Poll for results (usually ready in 30-60 seconds)
curl https://beacon.vercel.app/api/demo/demo_abc123 \
  -H "Authorization: Bearer beacon_demo_key"
```

**Bring your own keys for deep mode (10 runs/day, 3 parallel agents, full memory):**

```bash
curl -X POST https://beacon.vercel.app/api/demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer beacon_demo_key" \
  -d '{
    "topic": "AI coding agents market 2026",
    "objective": "Map the competitive landscape",
    "frameworkId": "porter",
    "depth": "deep",
    "userKeys": {
      "groqApiKey": "gsk_your_key_here",
      "serpApiKey": "your_serpapi_key"
    }
  }'
```

Get a free Groq key at [console.groq.com](https://console.groq.com). Get SerpAPI at [serpapi.com](https://serpapi.com).

---

## What Beacon Is

Beacon is a research agent that remembers what it already knows. On the first run, it builds a baseline — queries, sources, facts, synthesis. On every subsequent run for the same topic, it loads that memory first, skips already-seen URLs, and leads with what changed. The report you get on run 5 is not a repeat of run 1. It is the delta.

The core architecture is a durable multi-step workflow (Vercel Workflow SDK) that survives browser closes, network interruptions, and cold starts. Memory lives in Upstash Redis with a 30-day TTL. In deep mode, three parallel agent tracks (Exploration, Competitive, Signals) run concurrently, then a validator merges their outputs into one cited report.

---

## What Makes It Different

- **Memory that compounds.** Every run saves topic-scoped facts, seen URLs, and a summary to Redis. Run 2 filters what Run 1 already indexed. Run 5 surfaces only what Run 4 missed. Most research agents restart from zero every time.

- **Delta-first reporting.** The synthesis prompt explicitly receives prior memory context and is instructed to lead with changes, not repeat baselines. You get a signal-to-noise ratio that improves with each run.

- **47 research frameworks, not prompt flavors.** JTBD, SWOT, RICE, Porter's Five Forces, PESTLE, Blue Ocean, Problem-Solution Fit, Market Map, and 39 more — each with a `synthesisHint` that shapes query planning and synthesis, not just the report title.

- **Self-healing harness.** Every SerpAPI call retries up to 3 times. If a track agent returns empty synthesis, the workflow retries the synthesis step before the validator runs. Three layers of recovery before a run fails.

- **Token budget controls.** Standard (1k/4k), Enhanced (2k/8k), Max (4k/16k), and Custom tiers for track synthesis and final synthesis tokens. Users on Groq's free tier run Standard. Users on paid tiers unlock richer synthesis without code changes.

- **MCP server built-in.** Beacon exposes itself as an MCP tool server at `/api/mcp`. Any MCP-compatible client (Claude Desktop, custom agents) can trigger briefs, read memory, compare topics, and export data directly.

---

## How It Works

```
User submits topic + objective + frameworkId
         |
         v
POST /api/briefs  →  trigger(researchAgent, brief)
         |
         v
┌─────────────────────────────────────────────────────┐
│  Durable Workflow (survives browser close/restart)  │
│                                                     │
│  [1] loadMemory()     ← Upstash Redis               │
│         |                                           │
│  [2] planQueries()    ← Groq llama-4-scout          │
│         |                                           │
│  [3] Three parallel track agents:                   │
│       ├── Exploration  (broad landscape)            │
│       ├── Competitive  (players + gaps)             │
│       └── Signals      (weak signals + trends)      │
│         |   (each: SerpAPI fanout → synthesizeTrack)│
│         |                                           │
│  [4] validateAndMerge()  ← Groq llama-3.3-70b      │
│         |                                           │
│  [5] saveMemory()     ← Upstash Redis               │
│                                                     │
│  sleep('7 days')  →  tail-recurse for next run      │
└─────────────────────────────────────────────────────┘
         |
         v
Report → Dashboard / Slack / GitHub / MCP / Webhook
```

Steps 1 and 5 are the memory bookends. Everything in the middle is deterministic and idempotent — if a step fails, it replays from the last checkpoint, not from the beginning.

---

## Self-Healing Harness

Three retry patterns run automatically on every deep-mode research run:

**SerpAPI retries.** Each individual query retries up to 3 times with exponential backoff before marking the query failed. A failed query does not kill the run — it contributes zero results to that track.

**Empty synthesis retries.** If `synthesizeTrack` returns empty or near-empty output (fewer than 50 characters), the workflow retries the synthesis step once before passing the result to `validateAndMerge`. This catches Groq rate-limit edge cases and transient model errors.

**Memory save resilience.** `saveMemory` wraps its Redis write in a try/catch that never throws. A memory write failure is logged and swallowed — the research result is preserved even if the memory update fails.

---

## Research Frameworks

47 frameworks available via `frameworkId`. A sample:

| Framework | ID | Best For |
|---|---|---|
| Jobs To Be Done | `jtbd` | Identifying real user motivations |
| Problem-Solution Fit | `problem-solution-fit` | Early idea validation |
| SWOT | `swot` | Balanced opportunity/risk assessment |
| RICE Scoring | `rice` | Feature or idea prioritization |
| Porter's Five Forces | `porter` | Market structure and competition |
| PESTLE | `pestle` | Macro-environmental scanning |
| Blue Ocean | `blue-ocean` | Whitespace and differentiation |
| Market Map | `market-map` | Landscape overview and positioning |
| Opportunity Solution Tree | `opportunity-solution-tree` | Product strategy alignment |
| First Principles | `first-principles` | Assumption-free problem decomposition |

See all 47 at `/docs/frameworks` or via the MCP `list_frameworks` tool.

---

## Token Budgets

Each run has two synthesis phases: per-track synthesis (3 parallel) and final synthesis (single merge). Token budgets control how much context each phase gets.

| Preset | Track Tokens | Final Tokens | Best For |
|---|---|---|---|
| Standard | 1,000 | 4,000 | Groq free tier, quick runs |
| Enhanced | 2,000 | 8,000 | Paid Groq, richer synthesis |
| Max | 4,000 | 16,000 | Deep research, high-stakes topics |
| Custom | configurable | configurable | Power users, specific models |

The `tokenBudget` field is part of `ResearchBrief` — set it in the brief payload or select a preset from the `/briefs/new` UI. Standard works well for most quick-mode runs. Max is for when you need the model to hold more evidence in context during synthesis.

---

## API Reference

### Public Demo Endpoint

No signup. Rate-limited. Designed for evaluation and integration testing.

**POST /api/demo**

```bash
curl -X POST https://beacon.vercel.app/api/demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer beacon_demo_key" \
  -d '{
    "topic": "Notion vs Linear for engineering teams",
    "objective": "Compare workflows, pricing, and team adoption patterns",
    "frameworkId": "market-map",
    "depth": "quick"
  }'
```

Rate limits: 3 runs/day with `beacon_demo_key` (quick mode only). 10 runs/day with BYOK (deep mode unlocked).

**GET /api/demo/:runId**

```bash
curl https://beacon.vercel.app/api/demo/demo_abc123 \
  -H "Authorization: Bearer beacon_demo_key"
```

Response when complete:
```json
{
  "runId": "demo_abc123",
  "status": "complete",
  "topic": "Notion vs Linear for engineering teams",
  "report": "## Market Map: Notion vs Linear...",
  "sources": [...],
  "queryPlan": {...},
  "completedAt": "2026-05-04T10:03:12Z"
}
```

### Private API

Requires Clerk authentication and user-stored Groq + SerpAPI keys.

```bash
# Create a brief
POST /api/briefs
Authorization: Clerk session cookie

# List briefs
GET /api/briefs

# Get brief detail + report
GET /api/briefs/:id
```

Optional fields: `frameworkId`, `depth` (`quick` | `deep`), `timeframe`, `reportStyle`, `recurring`, `webhookUrl`, `tokenBudget`.

Full private API docs at [`/docs/api`](https://beacon.vercel.app/docs/api).

---

## MCP Server

Beacon exposes itself as an MCP server. Any MCP-compatible client can connect and use Beacon as a research tool without touching the HTTP API directly.

**Endpoint:**
```
https://beacon.vercel.app/api/mcp/sse
```

**Authentication:**
```
Authorization: Bearer <BEACON_MCP_TOKEN>
```

**Connect with Claude Desktop** — add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "beacon": {
      "url": "https://beacon.vercel.app/api/mcp/sse",
      "headers": {
        "Authorization": "Bearer your_mcp_token"
      }
    }
  }
}
```

**Available tools (10):**

| Tool | What It Does |
|---|---|
| `research_brief` | Trigger a new research run |
| `get_run_status` | Check run progress |
| `get_run_report` | Retrieve completed report |
| `get_topic_memory` | Read saved memory for a topic |
| `get_topic_delta` | Get delta since last run |
| `compare_topics` | Side-by-side topic comparison |
| `export_topic` | Serialize full topic memory as JSON |
| `list_frameworks` | Get all 47 framework IDs and descriptions |
| `list_briefs` | Paginated brief history |
| `get_brief` | Get one brief record |

---

## Coming Up

### Framework Consensus

The next major research feature. Instead of running one framework per brief, Beacon will run 3–5 frameworks in parallel over the same evidence base and compare their conclusions. JTBD might say "real user pain." RICE might say "high priority." Porter might say "structurally hostile market." That disagreement is not noise — it is the actual signal.

The three parallel track agents (Exploration/Competitive/Signals) already exist. The plan is to repurpose those agent slots as framework evaluators, have each return a structured JSON scorecard (`FrameworkScorecard`), and let `validateAndMerge` act as the meta-ranker. The UI would add a comparison matrix tab to the brief detail page, showing score, confidence, verdict, and top risk per framework — with disagreements flagged visually.

Design spec: [`docs/framework-consensus-brainstorm.md`](./docs/framework-consensus-brainstorm.md)

### Export and Data Portability

A brief's value is not just the prose report. It includes the query plan, source list, delta URLs, memory facts, and run metadata. Export gives users the full evidence package — not a black box answer.

The implementation path is client-side first: a `lib/export.ts` module with three pure helpers (`briefToMarkdown`, `sourcesToCsv`, `briefToJson`), wired to download buttons on the brief detail page via `URL.createObjectURL`. No new API routes needed. Later, API-level export endpoints (`GET /api/briefs/:id/export?format=json`) can be added for integration use cases.

A 300KB JSON export with sources, query plans, and memory facts is not just a utility — it is a trust signal. It shows the work behind the conclusion.

Design spec: [`docs/export-and-data-portability-brainstorm.md`](./docs/export-and-data-portability-brainstorm.md)

---

## Architecture

Beacon is organized around three engineering layers. Every workflow step comment declares which layer it belongs to.

**Context Engineering** — Optimize what the model sees per request.
- `planQueries()` builds targeted search queries from the topic + framework + memory context
- `compressSerpResults()` strips noise before synthesis
- `buildMemoryContext()` formats prior knowledge as LLM prompt context

**Memory Engineering** — Persist and evolve knowledge cross-session.
- `lib/memory.ts` reads and writes `AgentMemory` objects to Upstash Redis
- Deterministic key per topic: `beacon:memory:<slug>`
- `filterSeenUrls()` removes already-indexed URLs before synthesis
- `mergeUrls()` deduplicates and caps at 500 URLs per topic

**Harness Engineering** — System reliability, observability, recovery.
- Workflow SDK step idempotency — steps replay on failure without side effects
- Per-step logging (`// [Harness]` comments in `workflows/research.ts`)
- 3-retry SerpAPI calls, empty-synthesis retry, memory-save resilience
- `sleep('7 days')` burns zero compute between recurring runs

---

## Environment Variables

```env
# Core providers
GROQ_API_KEY=gsk_...
SERPAPI_API_KEY=...

# Auth (Clerk)
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...

# Upstash Redis
UPSTASH_REDIS_URL=https://...upstash.io
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Session / encryption / MCP
BEACON_SESSION_TOKEN=...
BEACON_MCP_TOKEN=...

# Demo endpoint key
BEACON_DEMO_KEY=beacon_demo_key

# Optional: chat integrations
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
GITHUB_APP_ID=...
GITHUB_PRIVATE_KEY=...
GITHUB_WEBHOOK_SECRET=...
DISCORD_TOKEN=...
DISCORD_PUBLIC_KEY=...

# Local / deployment base URL
VERCEL_URL=http://localhost:3000
```

Notes:
- `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_REST_*` are both used (different client paths).
- `BEACON_SESSION_TOKEN` is required for encrypted user-key storage.
- `BEACON_DEMO_KEY` defaults to `beacon_demo_key` in local dev; set a real secret in production.
- Discord env vars may be present even though the Discord webhook route is not production-enabled.

---

## Local Development

```bash
git clone https://github.com/KpG782/Beacon.git
cd Beacon
npm install
cp .env.local.example .env.local
# Fill in GROQ_API_KEY, SERPAPI_API_KEY, UPSTASH_*, CLERK_*, BEACON_*
```

Run the app (two terminals required):

```bash
# Terminal 1 — Next.js on localhost:3000
npm run dev

# Terminal 2 — Workflow SDK UI on localhost:3001
npx workflow dev
```

Test the demo endpoint locally:

```bash
curl -X POST http://localhost:3000/api/demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer beacon_demo_key" \
  -d '{"topic": "test topic", "depth": "quick"}'
```

Test a private run:

```bash
curl -X POST http://localhost:3000/api/briefs \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI coding agents", "source": "dashboard", "depth": "quick"}'
```

Recommended local flow:

1. Open `http://localhost:3000` to verify the homepage.
2. Hit `http://localhost:3000/api/demo` with the demo key to verify the public path.
3. Create a Clerk account and sign in.
4. Add Groq and SerpAPI keys in `/profile` or `/settings`.
5. Start a deep-mode run from `/briefs/new`.
6. Inspect `/memory`, `/graph`, and workflow logs at `localhost:3001`.

---

## Project Structure

```text
Beacon/
├── app/
│   ├── page.tsx
│   ├── trial/
│   ├── dashboard/
│   ├── briefs/
│   │   ├── new/
│   │   └── [id]/
│   ├── memory/
│   │   └── [slug]/
│   ├── graph/
│   ├── settings/
│   ├── profile/
│   ├── docs/
│   └── api/
│       ├── briefs/
│       ├── demo/            ← public no-auth endpoint
│       │   └── [runId]/     ← public polling endpoint
│       ├── trial/
│       ├── memory/
│       ├── logs/
│       ├── profile/keys/
│       ├── mcp/
│       └── webhooks/
├── workflows/
│   └── research.ts          ← core durable workflow
├── lib/
│   ├── memory.ts            ← topic memory layer
│   ├── brief-store.ts       ← brief persistence + webhook delivery
│   ├── ratelimit.ts         ← sliding-window rate limiter
│   ├── groq.ts              ← scoutModel + synthModel
│   ├── serpapi.ts           ← search tool + compression
│   ├── user-keys.ts         ← encrypted BYOK storage
│   ├── trial.ts             ← session-scoped sample briefs
│   └── types.ts             ← ResearchBrief, ResearchReport, AgentMemory
├── components/              ← all from v0, never hand-coded
├── docs/                    ← brainstorm docs + architecture specs
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

---

## Creator

**Ken Patrick Garcia**
AI Full-Stack Engineer
Manila, Philippines

- GitHub: [KpG782](https://github.com/KpG782)
- Portfolio: [kenbuilds.tech](https://www.kenbuilds.tech)
- LinkedIn: [ken-patrick-garcia-ba5430285](https://www.linkedin.com/in/ken-patrick-garcia-ba5430285)

---

## License

MIT
