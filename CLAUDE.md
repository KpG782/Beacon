# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beacon is a **durable web research agent with persistent cross-session memory** built for the Vercel Zero to Agent Hackathon (deadline May 4, 2026). It accepts research briefs from Slack/GitHub/Discord/dashboard, fans out SerpAPI queries, synthesizes delta reports showing only what changed since last run, and delivers to Slack/GitHub/dashboard. The core differentiator is memory that compounds across runs — agents never restart from zero.

## Current Status

**Phases 0–6 complete. Build passes. Type-check clean.**

- Phase 0 ✅ Scaffold — Next.js 16.2.4, all deps installed, Tailwind v4, `proxy.ts`
- Phase 1 ✅ Groq + Types — `lib/groq.ts`, `lib/types.ts`
- Phase 2 ✅ SerpAPI — `lib/serpapi.ts`
- Phase 2.5 ✅ Memory — `lib/memory.ts` (Upstash Redis, 30-day TTL, delta dedup)
- Phase 3 ✅ Workflow engine — `workflows/research.ts` (all 5 steps wired, Harness logging)
- Phase 4 ✅ Chat SDK — `lib/chat-bot.ts`, `/api/webhooks/slack`
- Phase 5 ⏳ v0 Dashboard — page shells exist; generate components at v0.dev using prompts in PLAN.md Phase 5
- Phase 6 ✅ MCP server — `/api/mcp/[...transport]`
- Phase 7 ⏳ Deploy — fill `.env.local` keys → `vercel`

**Next action:** Fill in real API keys in `.env.local`, run `npm run dev` + `npx workflow dev`, then `curl -X POST http://localhost:3000/api/briefs -d '{"topic":"test","source":"dashboard"}'` to verify end-to-end.

## Dev Commands

```bash
# Initial scaffold (run once)
npx create-next-app@latest beacon --typescript --tailwind --app --turbopack

# Development (two terminals required)
npm run dev          # Next.js on localhost:3000
npx workflow dev     # Workflow SDK UI on localhost:3001

# Test a research run
curl -X POST http://localhost:3000/api/briefs \
  -H "Content-Type: application/json" \
  -d '{"topic": "your topic here", "source": "dashboard"}'

# Deploy
vercel
```

## Stack

| Layer | Package | Notes |
|---|---|---|
| Framework | `next` 16.2.4 | App Router, Turbopack |
| Workflow | `workflow` + `@workflow/world-vercel` | Durable steps via `'use workflow'` / `'use step'` |
| AI SDK | `ai` 4.x + `@ai-sdk/groq` | Two Groq models (see below) |
| Memory | `@upstash/redis` | Persistent cross-session memory, 30-day TTL |
| Chat SDK | `chat` + `@chat-adapter/slack` / `github` / `discord` | Unified `onNewMention` handler |
| Chat State | `@chat-adapter/state-redis` | Upstash Redis |
| MCP | `mcp-handler` | Beacon exposes itself as an MCP server |
| Validation | `zod` | |
| Styling | Tailwind v4 | Dark terminal aesthetic (see design system below) |

## Architecture

```
Slack / GitHub / Discord / Dashboard
        ↓ (Chat SDK onNewMention)
POST /api/briefs → trigger(researchAgent, brief)
        ↓ (Workflow SDK — durable, survives browser close)
workflows/research.ts
  [step] loadMemory()       ← lib/memory.ts → Upstash Redis
  [step] planQueries()      ← Groq llama-4-scout
  [step] runSerpQuery() ×N  ← lib/serpapi.ts → SerpAPI REST
  [step] synthesizeReport() ← Groq llama-3.3-70b-versatile
  [step] saveMemory()       ← lib/memory.ts → Upstash Redis
  [sleep('7 days')]         ← zero compute
        ↓
Output to Slack thread / GitHub PR comment / dashboard
```

## Agent Orchestration Layers

Beacon is structured around three engineering layers (see `docs/` for full specs):

| Layer | Goal | Beacon Implementation |
|---|---|---|
| **Context Engineering** | Optimize what the model sees per request | `planQueries()` + `compressSerpResults()` + `buildMemoryContext()` |
| **Memory Engineering** | Persist and evolve knowledge cross-session | `lib/memory.ts` + Upstash Redis (30-day TTL) |
| **Harness Engineering** | System reliability, evals, observability | Workflow SDK step idempotency + logging (Phase 3) |

**Rule:** Every workflow step comment must declare its layer: `// [Context]`, `// [Memory]`, or `// [Harness]`.

Full docs:
- `docs/orchestration-architecture.md` — master diagram + layer-to-step mapping
- `docs/context-engineering.md` — per-request intelligence
- `docs/memory-engineering.md` — cross-session state
- `docs/harness-engineering.md` — reliability + observability
- `docs/implementation-phases.md` — build order with layer coverage

## Key Files (when built)

- `workflows/research.ts` — all durable workflow logic; the core of the app
- `lib/memory.ts` — persistent memory layer; the key differentiator
- `lib/groq.ts` — exports `scoutModel` (llama-4-scout) and `synthModel` (llama-3.3-70b-versatile)
- `lib/serpapi.ts` — `serpApiTool` (AI SDK tool), `compressSerpResults`, `extractAllUrls`, `extractKeyFacts`
- `lib/chat-bot.ts` — singleton Chat SDK bot with Slack/GitHub/Discord adapters
- `lib/types.ts` — `ResearchBrief`, `ResearchReport`, `AgentMemory`, `QueryPlan`, `Source`
- `app/api/workflows/research/route.ts` — Workflow SDK handler (`createWorkflowHandler`)
- `app/api/briefs/route.ts` — POST triggers workflow, GET lists briefs
- `app/api/mcp/[...transport]/route.ts` — Beacon as MCP server
- `proxy.ts` — use this instead of `middleware.ts` (Next.js 16 rename)
- `components/` — ALL components generated by v0, never hand-coded

## Hard Rules (from AGENTS.md)

1. **Models:** always use `scoutModel` for tool use / planning, `synthModel` for writing. Both imported from `@/lib/groq`. Never import `@ai-sdk/anthropic` or `@ai-sdk/openai`.
2. **Workflow steps** (`'use step'`) must be pure and idempotent — no side effects outside the step.
3. **`sleep()`** burns zero compute — never replace with polling.
4. **Memory order:** load memory FIRST, save memory LAST in every workflow run.
5. **Chat SDK bot** is a singleton in `lib/chat-bot.ts`.
6. **Routing:** use `proxy.ts` not `middleware.ts` (Next.js 16 renamed it).
7. **Dashboard UI:** all components come from v0. Do not hand-code JSX components.

## Design System

Dark terminal aesthetic — Bloomberg meets Linear:
- Background `#0a0a0a`, Surface `#111111`, Border `1px solid #262626`
- Accent `#f97316` (orange) for active/running states
- Text `#e5e5e5`, Muted `#737373`
- Fonts: JetBrains Mono (IDs, numbers, data), Geist (prose)
- Status: running=orange pulse, sleeping=gray, complete=green, failed=red
- No rounded-xl cards, no gradients, no shadows, no purple

## Environment Variables

```env
GROQ_API_KEY=gsk_...
SERPAPI_API_KEY=...
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
GITHUB_APP_ID=...
GITHUB_PRIVATE_KEY=...
GITHUB_WEBHOOK_SECRET=...
DISCORD_TOKEN=...
DISCORD_PUBLIC_KEY=...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
VERCEL_URL=http://localhost:3000   # set to production URL on Vercel
```

## Memory Layer Design

`lib/memory.ts` uses a deterministic Redis key per topic (`beacon:memory:<slug>`) with 30-day TTL. Key functions:
- `loadMemory(topic)` — returns `AgentMemory | null`; null = first run
- `saveMemory(memory)` — never throws (memory failure shouldn't kill workflow)
- `buildMemoryContext(memory)` — formats memory into LLM prompt context telling the model what's already known
- `filterSeenUrls(results, seenUrls)` — removes already-indexed URLs from SerpAPI results
- `mergeUrls(existing, new)` — deduplicates, caps at 500 URLs

## Vercel Workflow SDK Patterns

```typescript
export async function researchAgent(brief: ResearchBrief) {
  'use workflow'                // marks function as durable

  const result = await myStep()
  await sleep('7 days')        // zero-compute sleep; workflow resumes after
  return researchAgent({...})  // tail-recurse for recurring runs
}

async function myStep() {
  'use step'                   // marks as idempotent durable step
  // ...
}
```

Workflow handler route: `createWorkflowHandler({ workflow: researchAgent })` with `maxDuration = 300`.
Trigger from API: `trigger(researchAgent, brief, { id: 'brief-...' })`.

## Common Failure Modes

| Problem | Fix |
|---|---|
| Memory not persisting | Check `UPSTASH_REDIS_REST_URL` + `TOKEN`; test with `redis.set('test', '1')` |
| Run #2 not showing delta | Add `console.log` in `loadMemoryStep` to confirm data returns |
| Groq rate limit | Switch both models to `llama-3.3-70b-versatile` temporarily |
| SerpAPI 401 | Verify `SERPAPI_API_KEY`; test at serpapi.com/playground |
| JSON parse error in planQueries | `planQueries` has a fallback — log raw LLM output to debug |
| `sleep('7 days')` too long for demo | Use `sleep('30 seconds')` locally; revert before submission |
| Workflow step fails | Confirm `npx workflow dev` is running; check Vercel function logs |
