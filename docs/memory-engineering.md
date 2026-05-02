# Memory Engineering — Beacon

**Goal:** Persist and evolve knowledge about a research topic across sessions.

This is Beacon's core differentiator. Every other research agent starts from zero. Beacon does not.

---

## Memory Types in Beacon

| Type | What it stores | Where |
|---|---|---|
| **Short-term** | Step outputs within a single run | Workflow SDK (in-flight) |
| **Long-term structured** | `seenUrls[]` — every URL ever indexed | Upstash Redis |
| **Long-term semantic** | `keyFacts[]` — bullet findings extracted from reports | Upstash Redis |
| **Episodic** | `reportSummary` — one-paragraph digest of last report | Upstash Redis |

---

## Redis Key Design

```
beacon:memory:<slug>
```

`slug` is deterministic per topic: lowercased, non-alphanumeric stripped, spaces → hyphens, capped at 80 chars.

Same topic string always hits the same key. No topic-to-ID mapping needed.

**TTL:** 30 days (`60 * 60 * 24 * 30` seconds). Refreshed on every `saveMemory()` call.

---

## `AgentMemory` Shape

```typescript
interface AgentMemory {
  topic: string         // original topic string
  seenUrls: string[]   // all URLs ever returned by SerpAPI for this topic
  keyFacts: string[]   // up to 10 bullet findings from last report
  lastRunAt: string    // ISO timestamp of last completed run
  runCount: number     // increments every run — shown in UI as "Run #N"
  reportSummary: string // first paragraph of last report
}
```

---

## Core Functions (`lib/memory.ts`)

### `loadMemory(topic)` → `AgentMemory | null`
- Returns `null` on first run (no key in Redis)
- Never throws — Redis failures return `null` silently
- Called in `loadMemoryStep()` at the start of every workflow run

### `saveMemory(memory)` → `void`
- Never throws — failures are logged but don't kill the workflow
- Called in `saveMemoryStep()` at the end of every workflow run
- Resets TTL to 30 days on every save

### `buildMemoryContext(memory)` → `string`
- Formats `AgentMemory` into a prompt-ready block injected into `planQueries()` system prompt
- Tells the model: what's already known, when it was last checked, what NOT to re-research

### `mergeUrls(existing, new)` → `string[]`
- Deduplicates with `Set`, caps at 500 URLs
- Prevents unbounded memory growth

### `filterSeenUrls(results, seenUrls)` → `SerpResult[]`
- Removes already-indexed URLs from SerpAPI results before synthesis
- This is what generates delta reports — the model only sees fresh content

---

## Memory Flow Per Run

```
Run starts
  ↓
loadMemoryStep()   → returns memory (or null if first run)
  ↓
planQueries()      → injects memory.keyFacts + reportSummary into system prompt
  ↓
runSerpQuery() × N → returns raw results
  ↓
filterSeenUrls()   → strips seenUrls → only fresh content remains
  ↓
synthesizeReport() → writes "What Changed Since Last Week" if runCount > 1
  ↓
saveMemoryStep()   → mergeUrls + new keyFacts + updated reportSummary → Redis
```

---

## Problems + Mitigations

| Problem | Beacon's mitigation |
|---|---|
| Memory drift (wrong info persists) | 30-day TTL auto-expires stale memory; `keyFacts` are re-extracted fresh each run |
| Unbounded growth | `mergeUrls()` caps at 500 URLs; `keyFacts` capped at 10 |
| Redis failure kills workflow | `loadMemory()` and `saveMemory()` both swallow errors silently |
| Wrong memory retrieved | Deterministic key per topic — no fuzzy matching, no retrieval errors |

---

## The Delta Report Effect

On run #2+, `synthesizeReport()` receives:
- `buildMemoryContext()` in the system prompt (what we already know)
- SerpAPI results with `seenUrls` removed (only new sources)
- Explicit instruction: "Write a DELTA report — what changed since last time"

Result: a report section titled "What Changed Since Last Week" containing only genuinely new findings.

---

## Files

- `lib/memory.ts` — all memory functions
- `lib/types.ts` — `AgentMemory` interface
- `workflows/research.ts` — `loadMemoryStep()`, `saveMemoryStep()`, `filterSeenUrls()` calls
