# Beacon v2 — Multi-Agent Plan

**Goal:** Turn Beacon from a single durable research app into a shared research memory and execution layer that other agents can call directly.

Beacon today is already useful as a durable web research agent. It plans queries, runs SerpAPI fan-out, writes delta reports, and carries topic memory across sessions. But it is still mostly consumed as one app: dashboard, chat entrypoints, and a single `research_brief` MCP tool that starts a run.

The v2 opportunity is narrower and more important than "add more UI." Beacon should become infrastructure for other agents: a system that remembers prior evidence, knows what changed, and exposes that state over MCP, CLI, and durable read surfaces.

---

## The Decision

Beacon v2 should become:

1. A **research memory layer** for topic state other agents can reuse
2. A **delta engine** that tells agents what changed since the last run
3. A **durable execution backend** for recurring research and replay-safe runs

This is meaningfully different from "just another MCP tool that starts a run."

A thin MCP wrapper only gives outside agents a way to trigger Beacon. A real shared substrate gives them:
- prior topic memory before they reason
- source history they can audit
- run history they can inspect
- delta summaries they can consume without rerunning the full workflow

That distinction is the product decision for v2.

---

## Current State vs v2 State

| Area | Beacon today | Beacon v2 |
|---|---|---|
| MCP | One `research_brief` tool that starts a run | Full agent-facing read/write surface |
| Memory | One topic memory blob (`seenUrls`, `keyFacts`, `reportSummary`) | Separate topic memory, run ledger, source ledger, delta surfaces |
| Operator access | Dashboard + chat delivery | Dashboard + CLI + MCP |
| Reuse by other agents | Mostly indirect | First-class external integration path |

The key constraint: v2 should stay grounded in Beacon's existing architecture, not replace it.

---

## v2 Capability Plan

### MCP Expansion

Beacon already exposes `research_brief(topic, recurring)`. v2 should expand MCP into the primary agent-facing integration surface.

### Proposed MCP tools

#### `research_brief(topic, recurring)`
- Keep the existing write path
- Return run metadata plus memory status
- Stay the entrypoint for starting durable research

#### `get_topic_memory(topic)`
- Return the durable topic memory slice for a topic
- Intended payload: `keyFacts`, `reportSummary`, `lastRunAt`, `runCount`
- Primary use: let an outside agent preload Beacon's prior knowledge before reasoning

#### `get_topic_sources(topic)`
- Return the durable source ledger for a topic
- Include canonical URL list plus first-seen / last-seen style metadata when added
- Primary use: auditability and source reuse

#### `get_run_report(runId)`
- Return the stored report payload for a completed run
- Include summary, full content, source list, timestamps, and delta/full mode
- Primary use: let agents fetch finished work without scraping dashboard pages

#### `get_topic_delta(topic)`
- Return what changed since the prior completed run
- Should prefer a concise machine-usable summary, not only long-form prose
- Primary use: support "what changed since last week?" workflows

#### `list_runs(topic?)`
- Return recent runs globally or for a single topic
- Include run ID, topic, status, timestamps, and run mode
- Primary use: discovery, debugging, and operator audit

### CLI Expansion

MCP is for agent-to-agent usage. Beacon also needs a local operator and developer surface that does not depend on the dashboard.

### Proposed CLI commands

#### `beacon research`
- Start a research run from the terminal
- Mirrors `research_brief`

#### `beacon memory show`
- Print topic memory directly from durable storage
- Fast inspection for debugging memory state

#### `beacon delta`
- Print the latest delta summary for a topic
- Useful for recurring checks and shell workflows

#### `beacon sources`
- Print or export the source ledger for a topic
- Useful for manual audit and downstream tooling

#### `beacon runs list`
- Show recent runs, optionally filtered by topic
- Useful for operator visibility and troubleshooting

### Memory Model Expansion

Beacon's current `AgentMemory` blob is enough for a single app experience, but not enough for Beacon as shared infrastructure. v2 should make three durable artifacts first-class:

#### 1. Topic memory
- Long-term topic state
- Successor to today's `seenUrls`, `keyFacts`, `reportSummary`, `lastRunAt`, `runCount`
- Optimized for quick preload into another agent's prompt or planning step

#### 2. Run ledger
- One durable record per workflow run
- Should track run ID, topic, requested mode, timestamps, completion state, summary, and report location
- Makes `get_run_report` and `list_runs` possible without reconstructing history from topic memory

#### 3. Source ledger
- Durable record of source URLs associated with a topic and run history
- Should preserve enough provenance to answer:
  - what sources have we ever seen for this topic?
  - when did we first see them?
  - which run surfaced them?

These should be exposed as reusable external state for other agents, not only internal implementation details.

---

## Delivery Surfaces

### Dashboard
- Remains the operator UI
- Best place for humans to inspect runs, memory, and audits visually

### MCP
- Becomes the primary agent-facing integration surface
- Best place for Claude, Cursor, OpenAI, and internal agents to call Beacon programmatically

### CLI
- Becomes the human/operator/dev surface outside the browser
- Best place for local inspection, debugging, scripting, and demos

The point is not to create three separate products. It is to expose the same durable Beacon state through the right interface for each consumer.

---

## How The Three Engineering Layers Evolve

### Context Engineering

**v2 goal:** Use prior state more intelligently and package it for external agents.

### Additions
- Plan better searches using prior state, not only `reportSummary`
- Pass source-ledger context into planning so reruns can target gaps, not just avoid duplicates
- Package topic memory into compact external-agent payloads
- Add a machine-usable delta summary output alongside the long-form report

### Why it matters

Context engineering in v1 optimizes what Beacon sees right now. In v2, it also optimizes what *other agents* see when Beacon hands them memory and deltas.

### Memory Engineering

**v2 goal:** Separate topic state, run history, and source history into explicit durable artifacts.

### Additions
- Keep long-term topic memory
- Keep episodic run ledger
- Keep durable source ledger
- Define stable read shapes for MCP and CLI consumers

### Why it matters

Today Beacon remembers enough to produce a delta report. v2 should remember enough to let outside agents audit, reuse, and build on the system's prior work.

### Harness Engineering

**v2 goal:** Make Beacon safe and reliable as a backend other agents depend on.

### Additions
- Durable recurring scans
- Run reconciliation between requested work and completed work
- Replay-safe workflows for repeated external calls
- Observability for outside-agent usage
- Usage telemetry by surface: dashboard, chat, MCP, CLI

### Why it matters

Once Beacon becomes shared infrastructure, correctness is not only about a single report. It is also about whether external consumers can trust the state they receive and the runs they trigger.

---

## Workflow and Interface Additions

### Workflow additions

The core workflow order should stay the same:

```
load memory first
plan from prior state
search
filter / compare against durable source state
synthesize report + delta summary
save durable state last
```

v2 should add:
- run-ledger write at workflow start and completion
- source-ledger update during memory save
- delta artifact generation as a first-class output
- reconciliation logic for recurring and externally-triggered runs

### Interface additions

At the storage boundary, Beacon needs read models that are distinct from the internal workflow structs.

Example external shapes:

```typescript
type TopicMemoryView = {
  topic: string
  keyFacts: string[]
  reportSummary: string
  lastRunAt: string
  runCount: number
}

type TopicDeltaView = {
  topic: string
  currentRunId: string
  previousRunId?: string
  summary: string
  changedSources: string[]
  generatedAt: string
}

type RunRecord = {
  runId: string
  topic: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  mode: 'full' | 'delta'
  startedAt: string
  completedAt?: string
}
```

These are not final protocol contracts. They are the minimum shapes needed to make MCP and CLI useful in v2.

---

## Near-Term Phased Roadmap

### Phase 1 — Strengthen MCP Beyond `research_brief`
- Keep `research_brief`
- Clean up the current MCP response format
- Add the first read path for topic memory
- Make Beacon useful to external agents before adding broader operator tooling

### Phase 2 — Expose Read APIs for Memory, Sources, Runs, and Delta Summaries
- Add `get_topic_memory(topic)`
- Add `get_topic_sources(topic)`
- Add `get_run_report(runId)`
- Add `get_topic_delta(topic)`
- Add `list_runs(topic?)`
- Back these with explicit durable storage, not reconstructed ad hoc responses

### Phase 3 — Add CLI for Local and Operator Use
- Add `beacon research`
- Add `beacon memory show`
- Add `beacon delta`
- Add `beacon sources`
- Add `beacon runs list`
- Reuse the same underlying read models as MCP wherever possible

### Phase 4 — Add Agent-Facing Guardrails, Auth Assumptions, and Usage Telemetry
- Define who is allowed to read or trigger what
- Keep auth assumptions minimal and practical for hackathon-era v2
- Add usage telemetry by surface and tool
- Add observability for MCP and CLI usage, not just workflow execution

### Phase 5 — Define the Demo Story for "Beacon as Shared Memory Layer"
- Show Beacon answering repeat questions across runs
- Show another agent consuming Beacon memory before its own reasoning
- Show source audit and delta retrieval without opening the dashboard

This phase matters because the multi-agent story only lands if the demo shows Beacon as infrastructure, not just another UI with an API.

---

## Demo / Use Cases

### 1. Another coding or ops agent asks what changed since last week

Example flow:
- agent calls `get_topic_delta("pricing changes for vendor X")`
- Beacon returns the last delta summary plus changed sources
- agent decides whether a full rerun is necessary

This is the fastest proof that Beacon is more than one-shot search.

### 2. Claude / Cursor / OpenAI agent reuses Beacon memory before doing its own reasoning

Example flow:
- agent calls `get_topic_memory("open-source observability vendors")`
- agent uses Beacon's `keyFacts`, summary, and run timestamp as prior state
- agent then performs fresh reasoning or its own task-specific synthesis

Beacon becomes the memory substrate, not the final reasoning engine in every loop.

### 3. Product or market watchlist with recurring runs and manual source audit

Example flow:
- operator sets recurring topics
- Beacon keeps producing durable runs
- operator or another agent calls `beacon sources` or `get_topic_sources(topic)`
- source history is inspectable without reading every full report

This is where the dashboard, CLI, and MCP surfaces reinforce each other.

---

## Why This Is Unique

Most agents answer once.

Beacon should answer repeatedly, remember prior evidence, and expose that state to other agents.

That makes Beacon infrastructure, not just UI.

The differentiator is not "Beacon can search the web." Many agents can do that. The differentiator is:
- it remembers what it already found
- it tracks what changed over time
- it exposes that durable state through agent-friendly interfaces

That is the near-term v2 expansion worth building.
