# Export And Data Portability Brainstorm

This note captures a likely high-value Beacon feature area: make it easy for users to export, copy, audit, and reuse all research data, not just the final report text.

## Core Thesis

Beacon should not behave like a closed report generator.
It should behave like a research system that produces reusable research assets.

For serious researchers, operators, founders, and analysts, the final report is only one part of the value.
They also need:

- the source list
- the query plan
- the raw evidence
- the delta between runs
- the saved memory
- the provenance behind each conclusion

If Beacon makes that portable, it becomes much more trustworthy and much more useful.

## Why This Matters

Most users do not only want to read the answer.
They often want to do one of these things next:

- audit the evidence
- move the sources into Notion or Sheets
- compare runs over time
- build their own dashboard
- cite sources externally
- continue the work in another tool
- archive the run outside Beacon
- share the run with teammates

If the product traps that data inside the UI, Beacon feels like a black box.
If the product exports the full research package, Beacon feels like infrastructure.

## The Main Product Principle

Export should be treated as a first-class feature, not a tiny utility button.

The system should support multiple export formats because different users need different shapes:

- Markdown for humans
- CSV for spreadsheets
- JSON for systems
- later maybe NDJSON for large-scale pipelines

## What Users Probably Need To Export

### 1. Report Export

This is the simplest layer.

It should include:
- final report content
- summary
- title or topic
- framework used
- citations
- run metadata

Best formats:
- copy to clipboard
- markdown download
- maybe PDF later

This is the most shareable output, but not the most complete.

### 2. Evidence Export

This is the most important export for researchers who care about auditability.

It should include:
- source URL
- title
- snippet
- search engine
- query that found it
- position in results
- whether it was new this run
- whether it was already seen in memory
- whether it was used in the final report

Best formats:
- CSV
- JSON

This makes Beacon much more inspectable and defensible.

### 3. Research Package Export

This is the “everything about this run” bundle.

It should include:
- topic
- objective
- focus
- framework
- depth
- timeframe
- query plan
- raw or normalized sources
- final report
- delta URLs
- memory facts used
- run metadata

Best format:
- JSON

This should probably become Beacon’s canonical export artifact.

### 4. Memory Export

This is the long-term memory ledger for one topic or one user.

It should include:
- topic
- seen URLs
- key facts
- fact sources
- report summary
- run count
- last run timestamp
- run history if available

Best formats:
- JSON
- maybe markdown summary

This is important for portability, backup, and trust.

### 5. Comparative Export

If Beacon adds multi-framework comparison later, users should be able to export:

- per-framework scorecards
- per-framework verdicts
- confidence values
- disagreement metrics
- final merged ranking

Best formats:
- JSON
- CSV for ranking tables

## Recommended Export Surfaces

The product should probably not expose one generic “Export” button only.
It should expose a few clear actions tied to user intent.

Suggested actions:

- `Copy Report`
- `Download Markdown`
- `Download Sources CSV`
- `Download Full Run JSON`
- `Export Topic Memory`
- `Copy Citations`

That covers most real use cases without overcomplicating the UI.

## Best Canonical Export Shape

Beacon should probably define one canonical run package for JSON export.

Example:

```json
{
  "runId": "wrun_123",
  "topic": "AI coding agents",
  "objective": "Compare products and pricing",
  "focus": "pricing, launches, enterprise traction",
  "frameworkId": "market-map",
  "depth": "deep",
  "timeframe": "30d",
  "source": "dashboard",
  "createdAt": "2026-05-04T10:00:00.000Z",
  "updatedAt": "2026-05-04T10:03:00.000Z",
  "queryPlan": {
    "queries": []
  },
  "sources": [],
  "report": {
    "content": "...",
    "summary": "...",
    "deltaUrls": []
  },
  "memory": {
    "runCount": 3,
    "keyFacts": [],
    "factSources": [],
    "seenUrls": []
  }
}
```

This one package could support:

- manual downloads
- API retrieval
- notebook workflows
- external tooling
- future re-import
- internal debugging

## Provenance Fields That Matter

If Beacon wants to feel serious to researchers, source-level provenance matters a lot.

Useful fields per source:

- `url`
- `title`
- `snippet`
- `engine`
- `query`
- `position`
- `retrievedAt`
- `isDelta`
- `isSeenBefore`
- `usedInFinalReport`
- `citationIndex`

These fields help users answer important questions:

- Which query found this source?
- Which engine produced the strongest evidence?
- What was actually new this run?
- Which sources made it into the report?
- Which sources were found but not trusted enough to cite?

## Researcher Behavior This Supports

This export model matches how real researchers and operators behave after reading a report.

Typical downstream actions:

- export sources to a spreadsheet
- cluster URLs by theme or domain
- compare multiple runs side by side
- review which evidence came from which query
- manually verify the strongest claims
- hand the package to a teammate
- build another report in a different tool

In other words, exports are not just “nice to have.”
They are how Beacon’s work gets reused.

## UI Ideas

### On Brief Detail Page

Good location:
[app/briefs/[id]/page.tsx](/Users/kuya/Documents/Beacon/app/briefs/[id]/page.tsx:1)

Possible actions:
- copy markdown
- download report
- export sources CSV
- export full JSON

This is the most obvious place because the user is already reading a specific run.

### On Memory Detail Page

Good location:
[app/memory/[slug]/page.tsx](/Users/kuya/Documents/Beacon/app/memory/[slug]/page.tsx:1)

Possible actions:
- export memory JSON
- copy fact list
- export seen URLs CSV

This makes memory feel portable instead of trapped.

### On Graph Page

Good location:
[app/graph/page.tsx](/Users/kuya/Documents/Beacon/app/graph/page.tsx:1)

Possible actions:
- export graph data JSON
- export nodes/edges CSV
- copy selected node data

That would make the graph useful as a data surface, not only a visual surface.

## API Opportunities

The export model should probably exist both in the UI and in the API.

Possible future endpoints:

- `GET /api/briefs/:id/export?format=json`
- `GET /api/briefs/:id/export?format=md`
- `GET /api/briefs/:id/export?format=csv&type=sources`
- `GET /api/memory/:slug/export?format=json`

This would make Beacon easier to integrate into other systems and agent workflows.

## Strongest Initial Version

A good first release would be:

1. `Copy Report`
2. `Download Markdown`
3. `Download Sources CSV`
4. `Download Full Run JSON`
5. `Export Topic Memory JSON`

That is enough to make Beacon feel much more researcher-friendly without inventing a large export platform on day one.

## Implementation Direction

The easiest path is probably:

1. define one canonical run export schema
2. add serialization helpers in `lib/brief-store.ts` or a new export helper module
3. add UI actions on run detail and memory detail pages
4. add API endpoints later if needed

A clean future module could look like:

```ts
type RunExportPackage = {
  runId: string
  topic: string
  objective?: string
  focus?: string
  frameworkId?: string
  depth?: string
  timeframe?: string
  queryPlan?: unknown
  sources: unknown[]
  report?: {
    content?: string
    summary?: string
    deltaUrls?: string[]
  }
  memory?: {
    runCount?: number
    keyFacts?: string[]
    factSources?: string[]
    seenUrls?: string[]
  }
}
```

## Biggest Product Risk

The main risk is exporting too little and pretending the report is the whole artifact.

If Beacon only exports final prose, users lose:

- reproducibility
- auditability
- portability
- trust

The real Beacon asset is not only the report.
It is:

- the report
- the evidence
- the process
- the memory
- the provenance

## Short Thesis

If Beacon wants to serve real researchers well, it should make all research assets easy to copy, export, audit, and reuse.

The product should feel like:
"I can take everything Beacon learned and use it anywhere,"
not:
"I can only read the answer inside Beacon."

---

## Current State: What's Already Available

No new data model work is needed for basic export. All the fields required for a complete export package already exist on `BriefRecord` in `lib/brief-store.ts`:

- `report` — the final synthesized markdown
- `sources` — array of source objects with URL, title, snippet, and metadata
- `queryPlan` — the structured query plan from `planQueries()`
- `deltaUrls` — URLs that were new this run (not in prior memory)
- `frameworkId` — the research framework used
- `createdAt` / `updatedAt` — run timestamps
- `topic` — the research topic slug

The MCP `export_topic` tool already serializes topic memory as JSON. The brief detail page (`/briefs/[id]`) already has the full `BriefRecord` loaded at render time.

This means the gap is not data availability — it is the absence of download surface. The data is there. The buttons are not.

## Implementation Path (Client-side First, No New API Routes)

Add a `lib/export.ts` module with three pure functions. These are string transforms only — no fetch calls, no async, no side effects:

```ts
// lib/export.ts

export function briefToMarkdown(record: BriefRecord): string {
  // formats: topic header, metadata block (framework, depth, timeframe, dates),
  // report content, then a Sources section with numbered URLs
}

export function sourcesToCsv(sources: BriefRecord['sources']): string {
  // CSV header: url, title, snippet, engine, query, isDelta, citationIndex
  // one row per source, values escaped for RFC 4180 compliance
}

export function briefToJson(record: BriefRecord): string {
  // serializes full canonical export object (matches the RunExportPackage shape
  // already defined in this doc) as pretty-printed JSON
}
```

On the brief detail page (`/briefs/[id]/page.tsx`), each function wires to a button that triggers a client-side download:

```ts
// No API round-trip needed
const blob = new Blob([briefToMarkdown(record)], { type: 'text/markdown' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `${record.topic}-report.md`
a.click()
URL.revokeObjectURL(url)
```

This works entirely in the browser. No new API routes. No auth complexity. No additional backend surface to maintain. The brief detail page already has the data; the download is just a serialization call.

## Phase 1 Checklist

Concrete items to ship for the first export release:

- [x] `lib/export.ts` with `briefToMarkdown`, `sourcesToCsv`, and `briefToJson`
- [x] "Copy Report" button on `/briefs/[id]` — uses `navigator.clipboard.writeText`
- [x] "Download Markdown" button on `/briefs/[id]` — `briefToMarkdown` + Blob download
- [x] "Download Sources CSV" button on `/briefs/[id]` — `sourcesToCsv` + Blob download
- [x] "Download Full JSON" button on `/briefs/[id]` — `briefToJson` + Blob download
- [x] "Export Memory JSON" button on `/memory/[slug]` — serializes `AgentMemory` from Redis
- [ ] Update MCP docs to note that `export_topic` is the API path for the same data that "Export Memory JSON" surfaces in the UI

These are additive UI changes. They do not touch the data model, the workflow, or any existing API routes.

## What NOT to Build First

API endpoints (`GET /api/briefs/:id/export?format=json`) add auth complexity and maintenance overhead without adding capability beyond what client-side download already provides.

The brief detail page is an authenticated page. The data is already fetched server-side and passed to the component. A client-side download is functionally equivalent to an API endpoint from the user's perspective — they get the same file — but requires zero backend work and zero new auth surface.

API-level export endpoints make sense later, for two specific use cases:

1. External integrations that need to pull export data programmatically without a browser session.
2. Webhook-style delivery where Beacon pushes the export to an external URL on run completion.

Until those use cases are validated by real user requests, the client-side path is the right default. Ship the buttons first. Add the API path only when someone asks for it.

## Trust Signal

Export is not just a utility feature. It is a trust signal.

When a user clicks "Download Full Run" and gets a 300KB JSON file containing the query plan, every source URL and snippet, the delta URL list, the memory facts, and the final report — that is evidence that Beacon did real work. Not a chat wrapper returning a summary. A research system that produced a durable, inspectable artifact.

This is worth calling out explicitly in the copy near the export buttons. Something like:

> "Download the full evidence package — query plan, sources, memory facts, and report — for offline review, archiving, or use in other tools."

That framing positions export as verification, not just portability. It tells the user: the work is real, and you can check it. That is a stronger trust signal than any badge or claims copy about AI quality.
