# Implementation Phases — Beacon

Maps the three orchestration layers (Context / Memory / Harness) onto the Beacon build order from `PLAN.md`.

---

## Phase Map

```
Orchestration Layer   │  PLAN.md Phase          │  Time     │  Status
──────────────────────┼─────────────────────────┼───────────┼──────────
Foundation            │  Phase 0 — Scaffold      │  30 min   │  DONE ✅
Foundation            │  Phase 1 — Groq + Types  │  15 min   │  DONE ✅
Context Engineering   │  Phase 2 — SerpAPI tool  │  30 min   │  DONE ✅
Memory Engineering    │  Phase 2.5 — lib/memory  │  45 min   │  DONE ✅
Context + Memory      │  Phase 3 — Workflow engine│  2–3 hrs  │  DONE ✅
Context               │  Phase 4 — Chat SDK       │  1–2 hrs  │  DONE ✅
Context + Memory      │  Phase 5 — v0 Dashboard   │  1–2 hrs  │  PENDING (page shells exist)
Context               │  Phase 6 — MCP server     │  30 min   │  DONE ✅
Harness               │  Phase 7 — Deploy + demo  │  1 hr     │  PENDING (fill .env.local → vercel)
Harness               │  Phase 3* — Logging + eval│  post-MVP │  FUTURE
```

---

## Layer 1 — Context Engineering

**When:** Phases 2, 3, 4, 6  
**Core deliverable:** `planQueries()` + `compressSerpResults()` + `buildMemoryContext()` working end-to-end

### Phase 2 — SerpAPI Tool
- Build `serpApiTool` (AI SDK tool format)
- Build `compressSerpResults()`, `extractAllUrls()`, `extractKeyFacts()`
- Validate: direct `serpApiTool.execute({ q: 'test', engine: 'google', num: 3 })` returns results

### Phase 3 — Workflow Engine (Context slice)
- Build `planQueries()` — scoutModel generates 5–10 queries as JSON
- Build `runSerpQuery()` — one SerpAPI call per query, parallel fan-out
- Build `synthesizeReport()` — synthModel writes cited report from compressed context
- Validate: curl to `/api/briefs` → report appears in workflow UI

### Phase 4 — Chat SDK
- Context engineering for the Slack bot: parse mention text, extract topic, detect recurring intent
- Inject memory status into the Slack reply ("Run #3 — focusing on what's new since...")

### Phase 6 — MCP Server
- Expose `research_brief` tool with context about memory state
- Return run URL + memory status in tool response

---

## Layer 2 — Memory Engineering

**When:** Phase 2.5, Phase 3  
**Core deliverable:** `lib/memory.ts` functions + Redis round-trip verified + delta reports working

### Phase 2.5 — Memory Layer
- Build `loadMemory()`, `saveMemory()`, `mergeUrls()`, `filterSeenUrls()`, `buildMemoryContext()`
- Validate: `saveMemory(mock)` → check Upstash dashboard → `loadMemory(topic)` returns it

### Phase 3 — Workflow Engine (Memory slice)
- Wire `loadMemoryStep()` as first step in `researchAgent()`
- Wire `filterSeenUrls()` between `runSerpQuery()` and `synthesizeReport()`
- Wire `saveMemoryStep()` as last step in `researchAgent()`
- Validate: Run same topic twice → Run #2 report contains "What Changed" section

**The demo moment:** Run 1 indexes 47 URLs. Run 2 loads 47 known URLs, finds 12 new ones, writes delta report.

---

## Layer 3 — Harness Engineering

**When:** Phase 7 (baseline), Phase 3* (full harness — post-MVP)

### Phase 7 — Deploy (Harness baseline)
- Verify Workflow SDK step idempotency works on Vercel (not just local)
- Confirm `sleep('7 days')` resumes correctly after deploy
- All env vars set in Vercel dashboard (not just `.env.local`)
- Pre-demo checklist from `PLAN.md` Phase 7

### Phase 3* — Full Harness (post-hackathon deadline)
- Add `lib/logger.ts` — structured step logging
- Add token cost tracking per run
- Build eval dataset: 50–100 golden topic/report pairs
- Add SerpAPI health-check before fan-out
- Set up Vercel log aggregation for observability metrics

---

## Tonight's Build Order

```
1. Phase 0  — Scaffold (30 min)
2. Phase 1  — Groq + types (15 min)
3. Phase 2  — SerpAPI tool (30 min)
4. Phase 2.5 — Memory layer (45 min)
5. Phase 3  — Workflow engine (2–3 hrs)
```

Stop here if time-boxed. Phases 0–3 = working agent with memory. Everything else is delivery surface.

---

## Deadline

**May 4, 2026** — Vercel Zero to Agent Hackathon submission.

Today is May 2, 2026. Two days remaining. Phases 0–5 are the minimum viable submission. Phases 6–7 complete the story.
