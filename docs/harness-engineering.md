# Harness Engineering — Beacon

**Goal:** Make the agent system reliable, testable, observable, and safe.

This is the layer most engineers skip. It's the difference between a demo and a production system.

---

## What Beacon Already Has (Built-in)

### Workflow SDK Step Idempotency
Every function marked `'use step'` is automatically:
- Retried on failure (Workflow SDK handles this)
- Deduplicated on replay (same step ID → same result)
- Checkpointed (workflow survives process restarts, browser close, Vercel cold starts)

This is the foundation of Beacon's Harness layer — it comes for free from the Workflow SDK.

### `sleep()` Zero-Compute Durability
```typescript
await sleep('7 days')
```
The workflow pauses with zero compute. No polling, no cron job, no timeout. The Harness layer's reliability primitive for recurring runs.

### Silent Error Swallowing in Memory
`loadMemory()` and `saveMemory()` catch all Redis errors and return gracefully. Memory failure never cascades to workflow failure.

### JSON Parse Fallback in `planQueries()`
If the LLM returns malformed JSON, a hardcoded 3-query fallback fires:
```typescript
{ q: topic, engine: 'google', intent: 'overview' }
{ q: `${topic} ${year}`, engine: 'google_news', intent: 'recent' }
{ q: `${topic} comparison`, engine: 'google', intent: 'comparison' }
```

---

## What Beacon Needs to Add (Phase 3 — Post-Deploy)

### 1. Step-Level Logging

Each step should emit a structured log line:
```
[beacon:step] loadMemory   topic="X"   result=hit   runCount=3   ms=42
[beacon:step] planQueries  topic="X"   queries=7    ms=1204
[beacon:step] runSerpQuery q="X"       results=8    ms=890
[beacon:step] synthesize   topic="X"   tokens=1247  ms=3100
[beacon:step] saveMemory   topic="X"   urls=63      facts=10     ms=88
```

### 2. Token Cost Tracking

After each `generateText()` call, log usage:
```typescript
console.log(`[beacon:tokens] step=${stepName} prompt=${usage.promptTokens} completion=${usage.completionTokens}`)
```

Track per-run total cost at the `researchAgent` level.

### 3. Eval Dataset (50–100 queries)

Golden Q&A pairs to regression-test `synthesizeReport()`:
- Input: topic + mock SERP results
- Expected output: report contains specific facts, correct citation format, delta section present if runCount > 1
- Run on every prompt change

### 4. SerpAPI Health Check

Before fanning out all N queries, verify the key works:
```typescript
// Single test query — if 401, abort with clear error
```

### 5. Observability Targets

| Metric | Target | Where |
|---|---|---|
| `planQueries()` latency | < 2s P95 | Vercel function logs |
| `runSerpQuery()` latency | < 1.5s P95 per query | Vercel function logs |
| `synthesizeReport()` latency | < 5s P95 | Vercel function logs |
| Token cost per run | < $0.05 | Log aggregation |
| SerpAPI success rate | > 99% | Log aggregation |
| Memory hit rate (run > 1) | track over time | Upstash dashboard |

---

## Failure Modes + Mitigations

| Failure | Detection | Fix |
|---|---|---|
| Silent model hallucination | Confidence scoring (Phase 3) | Secondary validation model |
| Tool misuse (wrong API called) | Tool schema validation (AI SDK enforces) | Strict `toolChoice: 'required'` |
| SerpAPI 401 | Log `res.status` in `serpApiTool.execute` | Verify `SERPAPI_API_KEY`; check serpapi.com/playground |
| Groq rate limit | Log 429 response | Switch both models to `llama-3.3-70b-versatile` |
| JSON parse error | Fallback in `planQueries()` | Log raw LLM output for debugging |
| Memory save failure | `console.error` in `saveMemory()` | Check Upstash URL + token; test with `redis.set('test','1')` |
| Workflow step hangs | Workflow SDK timeout (built-in) | Check `npx workflow dev` is running |

---

## Test Strategy

### Tool Correctness
- Mock `SERPAPI_API_KEY` in test env
- Assert `serpApiTool.execute()` returns `{ engine, query, results[] }` shape

### Synthesizer Quality
- Feed fixed SERP context → assert report contains expected citation format
- Feed runCount=2 context → assert "What Changed" section present

### Memory Round-Trip
- `saveMemory(mock)` → `loadMemory(topic)` → assert identical
- `mergeUrls([...500], [...10])` → assert length stays at 500
- `filterSeenUrls(results, seenUrls)` → assert seen URLs absent from output

---

## Files (current)

- `workflows/research.ts` — all `'use step'` functions with built-in retry
- `lib/memory.ts` — silent error handling
- `lib/serpapi.ts` — `serpApiTool` with error throw on non-200

## Files (Phase 3 additions)

- `lib/logger.ts` — structured step logging
- `lib/cost-tracker.ts` — token usage aggregation
- `evals/` — golden dataset + eval runner
