# Context Engineering — Beacon

**Goal:** Optimize what the model sees *right now*, per request.

---

## What It Controls

- Prompt structure (system / user messages and their content)
- Tool selection context (which tools, in what order)
- Retrieved content (SerpAPI results, compressed to fit token budget)
- Memory injection (only the relevant slice of prior knowledge)

---

## How Beacon Implements It

### `planQueries()` — scoutModel decides what to search

The system prompt is dynamically constructed based on whether memory exists:

```
Fresh run:   "Cover overview, comparisons, recent news, use cases, pricing"  (8–10 queries)
Rerun:       "Focus on new releases, price changes since <date>"              (5–7 queries)
```

Memory context from `buildMemoryContext()` is prepended to the system prompt. This means the model knows what's already been researched before it plans new queries — it will not waste queries on ground already covered.

### `runSerpQuery()` — tool execution

Each query runs as a separate Workflow SDK step using `serpApiTool` (AI SDK tool). The model is forced to call the tool (`toolChoice: 'required'`), not reason its way to an answer. Max 8 results per call.

### `compressSerpResults()` — token budget management

Raw SerpAPI JSON is noisy. `compressSerpResults()` reduces each result to:
```
[N] Title
Snippet
URL: https://...
```

This cuts the context passed to `synthesizeReport()` from ~8K tokens to ~2K, keeping synthesis within Groq's rate limits and improving output quality.

### `filterSeenUrls()` — relevance filter

Before synthesis, URLs already in memory are removed from the result set. The model only synthesizes fresh content — no repeated citations from prior runs.

---

## Key Problems + Beacon's Fixes

| Problem | Fix |
|---|---|
| Irrelevant context → hallucinations | `compressSerpResults()` strips noise; only title + snippet + URL |
| Too much context → latency + cost | Top-8 per query; `maxTokens: 1500` on synthesis |
| Poor structure → degraded reasoning | Explicit JSON output format for `planQueries()` with a safe fallback |
| Context doesn't reflect prior state | `buildMemoryContext()` injects prior `keyFacts` + `reportSummary` |

---

## Failure Mode: Context Overload

**Problem:** Too many SERP chunks degrade answer quality.

**Mitigations in Beacon:**
- `compressSerpResults()` — compression before synthesis
- Top-k = 8 per query (not 20)
- `filterSeenUrls()` — removes already-indexed results
- `maxTokens: 1500` — synthesis hard cap

**Future improvement (Phase 3):** Add reranking (BM25 + embedding similarity) to select the highest-signal chunks before synthesis.

---

## Files

- `lib/serpapi.ts` — `serpApiTool`, `compressSerpResults()`, `filterSeenUrls()`
- `lib/memory.ts` — `buildMemoryContext()`
- `workflows/research.ts` — `planQueries()`, `runSerpQuery()`, `synthesizeReport()`
- `lib/groq.ts` — `scoutModel` (planning/tool use), `synthModel` (writing)
