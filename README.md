# Beacon

> Durable web research agent with persistent memory, framework-guided deep research, delta reruns, and agent-facing delivery surfaces.

Built by [Ken Patrick Garcia](https://www.kenbuilds.tech) for the [Vercel Zero to Agent Hackathon](https://community.vercel.com/hackathons/zero-to-agent) 2026.

---

## What Beacon Is

Beacon is for research questions that need more than one pass.

Instead of re-running the same search from scratch every time, Beacon:
- plans targeted web research
- applies one of **47 research frameworks**
- stores topic memory across runs
- surfaces **what changed since last run**
- exposes the result through the app, MCP, HTTP, and chat-oriented entry points

The core product idea is simple:

> Run once for the baseline. Run again for what changed.

---

## Best Use Cases

- **Hackathon validation**: pressure-test whether a problem is real before you build.
- **Market tracking**: monitor a category, competitor, or platform weekly.
- **Framework-led research**: apply Jobs To Be Done, Problem / Solution Fit, SWOT, RICE, PESTLE, and more to the same topic.
- **Reusable team memory**: keep sources, facts, and summaries attached to the topic instead of losing them in chat history.

---

## Current Product Shape

### Public trial
- `/trial`
- no signup required
- up to **3 sample briefs**
- session-scoped data isolation
- optimized for fast evaluation

### Private app
- Clerk-authenticated
- signed-in users can create account-scoped briefs
- private runs require valid **Groq** and **SerpAPI** keys
- keys can be stored through the authenticated profile/settings flow

### Delivery and access surfaces
- Dashboard
- Memory Bank
- Research Graph
- HTTP API
- MCP transport
- Slack intake
- GitHub webhook route
- Discord webhook route currently exists but is intentionally disabled pending dependency hardening

### Webhook delivery
- `POST /api/briefs` accepts optional `webhookUrl`
- completed runs can POST their final payload to that callback URL
- delivery state is persisted on the brief record as `pending`, `delivered`, or `failed`

---

## How It Works

1. A user submits a topic, objective, focus area, and optional framework.
2. Beacon loads prior memory for that topic.
3. Beacon plans search queries with the scout model.
4. In `deep` mode, Beacon splits research across parallel tracks.
5. Search results are synthesized into a cited report.
6. Facts, URLs, and summaries are saved back into memory.
7. Future runs reuse the stored state and lead with deltas instead of repeating the baseline.

For recurring runs, Beacon can sleep and rerun later without burning compute during the wait.

---

## Why Beacon Is Different

| Capability | Generic Chat Research | Beacon |
|---|---|---|
| Cross-session topic memory | Usually resets | Persists by topic and user |
| Delta reruns | Repeats baseline | Focuses on changes |
| Research frameworks | Usually generic | 47 framework-guided modes |
| Visible provenance | Limited | Sources, memory, graph, logs |
| Recurring runs | Manual | Durable workflow + sleep |
| Webhook completion callback | Rare | Supported on private briefs |

---

## Architecture

Beacon is organized around three layers:

- **Context**: query planning, search fanout, synthesis
- **Memory**: durable per-topic state in Upstash Redis
- **Harness**: workflow durability, retry-safe orchestration, fallbacks

Important files:

- `workflows/research.ts` — workflow orchestration
- `lib/memory.ts` — topic memory layer
- `lib/brief-store.ts` — brief persistence, sync, and webhook delivery
- `lib/groq.ts` — model configuration
- `lib/serpapi.ts` — search tool
- `app/api/briefs/route.ts` — private briefs API
- `app/api/trial/route.ts` — public sample-brief API
- `app/api/mcp/[...transport]/route.ts` — MCP surface

---

## Current Surfaces

### Homepage
- `app/page.tsx`
- positions Beacon around validation, tracking, memory, graph provenance, and frameworks

### Trial flow
- `app/trial/page.tsx`
- best first-touch experience for non-authenticated users

### Dashboard
- `app/dashboard/page.tsx`
- account-scoped brief history and status

### Memory Bank
- `app/memory/page.tsx`
- topic memories plus export and source inspection

### Research Graph
- `app/graph/page.tsx`
- visual provenance and memory relationships

### Docs
- `/docs`, `/docs/api`, `/docs/mcp`, `/docs/security`, `/docs/roadmap`, etc.

---

## API Overview

### Trial API

Public sample-brief endpoint:

```http
POST /api/trial
```

Use this for no-signup evaluation. It is rate-limited and session-scoped.

Example:

```bash
curl -X POST http://localhost:3000/api/trial \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Validate a hackathon idea: AI expense categorization for freelancers",
    "objective": "Determine whether the problem is real and whether people already complain about it",
    "focus": "problem evidence, alternatives, market timing",
    "frameworkId": "problem-solution-fit",
    "depth": "quick",
    "timeframe": "30d",
    "reportStyle": "framework"
  }'
```

### Private briefs API

Authenticated endpoint:

```http
POST /api/briefs
GET /api/briefs
GET /api/briefs/[id]
```

Private runs require:
- active Clerk session
- valid Groq key
- valid SerpAPI key

Optional request fields include:
- `frameworkId`
- `depth`
- `timeframe`
- `reportStyle`
- `recurring`
- `webhookUrl`

The private API is documented further in [`/docs/api`](./app/docs/api/page.tsx).

---

## MCP Surface

Beacon exposes MCP over:

```text
/api/mcp/[...transport]
```

Current MCP surface includes:
- **10 tools**
- **3 resources**
- **3 prompts**

Representative tools:
- `research_brief`
- `get_run_status`
- `get_run_report`
- `get_topic_memory`
- `get_topic_delta`
- `compare_topics`
- `export_topic`
- `list_frameworks`

Authentication uses bearer token validation against:
- `BEACON_MCP_TOKEN`
- or `BEACON_SESSION_TOKEN` fallback

---

## Environment Variables

```env
# Core providers
GROQ_API_KEY=
SERPAPI_API_KEY=

# Auth
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Upstash Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Session / encryption / MCP
BEACON_SESSION_TOKEN=
BEACON_MCP_TOKEN=

# Optional chat integrations
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
DISCORD_TOKEN=
DISCORD_PUBLIC_KEY=

# Local / deployment base URL
VERCEL_URL=http://localhost:3000
```

Notes:
- `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_REST_*` are both used.
- `BEACON_SESSION_TOKEN` is required for encrypted user-key storage.
- Discord env vars may be present even though the Discord webhook route is not currently enabled for production use.

---

## Local Development

```bash
git clone https://github.com/KpG782/Beacon.git
cd Beacon
npm install
cp .env.local.example .env.local
```

Run the app:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx workflow dev
```

Recommended local flow:

1. Open `http://localhost:3000/trial` to verify the sample-brief path.
2. Create an account and sign in.
3. Add Groq and SerpAPI keys in `/profile` or `/settings`.
4. Start a private run from `/dashboard` or `/briefs/new`.
5. Inspect `/memory`, `/graph`, and `/logs`.

---

## Project Structure

```text
Beacon/
├── app/
│   ├── page.tsx
│   ├── trial/
│   ├── dashboard/
│   ├── memory/
│   ├── graph/
│   ├── settings/
│   ├── profile/
│   ├── docs/
│   └── api/
│       ├── briefs/
│       ├── trial/
│       ├── memory/
│       ├── logs/
│       ├── profile/keys/
│       ├── mcp/
│       └── webhooks/
├── workflows/
│   └── research.ts
├── lib/
│   ├── memory.ts
│   ├── brief-store.ts
│   ├── groq.ts
│   ├── serpapi.ts
│   ├── user-keys.ts
│   ├── trial.ts
│   └── types.ts
├── components/
├── docs/
├── AGENTS.md
└── README.md
```

---

## Known Boundaries

- The private API is not a public no-auth developer product yet.
- Discord intake is not fully production-ready.
- The security and legal pages are much stronger than before, but this is still not a formal enterprise compliance package.
- Webhook delivery exists, but signing, backoff policy, and public payload docs still need hardening.

---

## Creator

**Ken Patrick Garcia**  
AI Full-Stack Engineer  
Manila, Philippines

- GitHub: [KpG782](https://github.com/KpG782)
- Portfolio: [kenbuilds.tech](https://www.kenbuilds.tech)
- LinkedIn: [ken-patrick-garcia-ba5430285](https://www.linkedin.com/in/ken-patrick-garcia-ba5430285)

Beacon reflects Ken's work across AI automation, full-stack systems, workflow tooling, and research-oriented product design.

---

## License

MIT
