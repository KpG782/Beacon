# Beacon — Orchestration Architecture

The Beacon agent system is structured around three engineering layers. Every workflow step belongs to one or more layers.

---

## The Three Layers

```
                ┌──────────────────────────────────┐
                │         User Request              │
                │  (Slack / GitHub / Dashboard)     │
                └────────────────┬─────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Context Engineering   │  ← per request
                    │  planQueries()          │
                    │  runSerpQuery() × N     │
                    │  compressSerpResults()  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │          LLM            │
                    │  scoutModel (planning)  │
                    │  synthModel (writing)   │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼───────────────────────┐
        │                        │                       │
┌───────▼────────┐   ┌───────────▼──────────┐  ┌────────▼────────┐
│ Memory Layer   │   │   Tool Execution      │  │   Guardrails    │
│ lib/memory.ts  │   │   lib/serpapi.ts      │  │  JSON fallback  │
│ Upstash Redis  │   │   SerpAPI REST        │  │  error catches  │
└───────┬────────┘   └───────────┬──────────┘  └────────┬────────┘
        │                        │                       │
        └───────────┬────────────┴───────────────────────┘
                    │
          ┌─────────▼──────────────────────────────┐
          │         Harness Engineering             │
          │  Workflow SDK step idempotency          │
          │  sleep() zero-compute retry             │
          │  Console logging per step               │
          │  Eval dataset (Phase 3)                 │
          └─────────────────────────────────────────┘
```

---

## Layer → Step Mapping

| `workflows/research.ts` step | Context | Memory | Harness |
|---|:---:|:---:|:---:|
| `loadMemoryStep()` | | ✓ | ✓ |
| `planQueries()` | ✓ | ✓ | ✓ |
| `runSerpQuery()` × N | ✓ | | ✓ |
| `filterSeenUrls()` | | ✓ | |
| `synthesizeReport()` | ✓ | ✓ | ✓ |
| `saveMemoryStep()` | | ✓ | ✓ |
| `sleep('7 days')` | | | ✓ |

---

## Why All Three Layers Are Required

Most agent failures trace back to missing a layer:

| Missing layer | Symptom | Example |
|---|---|---|
| No Context Engineering | Hallucinations, vague reports | LLM given 10K tokens of raw SERP noise |
| No Memory Engineering | Every run starts from zero | Beacon re-researches what it already knows |
| No Harness Engineering | Silent failures, no visibility | SerpAPI returns 401 silently, run appears to succeed |

---

## Trade-offs

| Layer | Strength | Weakness | When it fails |
|---|---|---|---|
| Context Engineering | Fast to iterate | Token-expensive | Large docs, noisy RAG |
| Memory Engineering | Personalization / delta reports | Hard to maintain correctness | Stale or incorrect memory |
| Harness Engineering | Reliability + observability | Higher complexity | Overhead slows iteration |

---

## Key Heuristic

> If you cannot measure it, you cannot improve it.

Beacon's workflow steps are idempotent by Workflow SDK design — that's the foundation of the Harness layer. Observability (logging, cost tracking, evals) is built on top of that in Phase 3.

---

## Full Docs

- [`context-engineering.md`](./context-engineering.md) — per-request intelligence
- [`memory-engineering.md`](./memory-engineering.md) — cross-session state
- [`harness-engineering.md`](./harness-engineering.md) — system reliability
- [`implementation-phases.md`](./implementation-phases.md) — phase plan
