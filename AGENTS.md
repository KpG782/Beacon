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

## Orchestration Layer Rules
Every workflow step must declare its layer in a comment:
- // [Context] — per-request intelligence (planQueries, compressSerpResults)
- // [Memory] — cross-session state (loadMemory, saveMemory, filterSeenUrls)
- // [Harness] — reliability (step idempotency, error swallowing, fallbacks)

## Key Files
- workflows/research.ts  — all workflow logic
- lib/memory.ts          — persistent memory layer (core differentiator)
- lib/groq.ts            — model config
- lib/serpapi.ts         — search tool
- lib/chat-bot.ts        — Slack + GitHub + Discord

## Design System
- Background #0a0a0a, Surface #111111, Border #262626
- Accent #f97316 (orange), Text #e5e5e5, Muted #737373
- Fonts: JetBrains Mono (data), Geist (prose)
- NO rounded cards, NO gradients, sharp 1px borders
