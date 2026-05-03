# Beacon — Pre-Update Audit
**Date:** 2026-05-03  
**Auditor:** Ken Garcia (via Claude Code)  
**Purpose:** Capture current state, gaps, and decisions needed before next update cycle begins.

---

## 1. What Beacon Actually Does

Beacon is a **durable, recurring web research agent**. You give it a topic, it searches the web via SerpAPI, synthesizes a report via Groq LLMs, and stores what it found in Redis. The next time you run the same topic, it skips URLs it already knows and only surfaces *new* findings (delta mode). Workflows survive server restarts and can sleep for days between runs without burning compute.

**Core loop:**
1. Load prior memory → 2. Plan targeted queries → 3. Run SerpAPI searches → 4. Filter seen URLs → 5. Synthesize report → 6. Save memory → 7. Sleep 7 days → repeat

---

## 2. Beacon vs. the Big LLMs — Honest Comparison

### Advantages Beacon Has Over ChatGPT / Claude / Perplexity

| Advantage | Why It Matters |
|---|---|
| **Persistent memory across sessions** | ChatGPT, Claude, and Perplexity reset every conversation. Beacon remembers every URL it indexed, every key fact, and the last summary — forever (30-day TTL). You compound knowledge over time. |
| **Delta-only reports** | Perplexity re-searches everything from scratch every time. Beacon skips what it already knows and tells you only what changed. This is the core differentiator. |
| **Recurring autonomous runs** | No other consumer LLM runs on a 7-day sleep-and-recurse loop automatically. Beacon is a background agent, not a prompt-response tool. |
| **Durable, restartable workflows** | If the server crashes mid-research, Beacon resumes from the last completed step. ChatGPT loses all progress if a request fails. |
| **Pluggable research frameworks** | 18 frameworks (RICE, Jobs-to-be-Done, Porter's Five Forces, etc.) inject structured methodology into both query planning and report synthesis. No generic "search the web" behavior. |
| **Multiple intake channels** | Slack, GitHub, Discord, dashboard, MCP — all route into the same workflow. No other tool has this unified intake. |
| **MCP server** | Beacon can be used as a tool *by other AI agents* (Claude, cursor, etc.). It exposes itself as an MCP endpoint. |
| **Source ledger** | Every URL indexed is stored and auditable. You can see exactly where the knowledge came from. |

### Disadvantages / Where Big LLMs Win

| Disadvantage | Detail |
|---|---|
| **No conversational depth** | Beacon writes reports; it doesn't have a dialogue. ChatGPT and Claude are interactive. Beacon has no follow-up question capability. |
| **No real-time awareness** | SerpAPI results have latency; Perplexity pulls live snippets. Beacon is better for ongoing research over time, not breaking news. |
| **No multimodal input** | Can't attach PDFs, images, or documents to a brief. ChatGPT and Claude can reason over uploaded files. |
| **LLM quality ceiling** | Groq models (llama-4-scout, llama-3.3-70b) are fast but not at GPT-4o or Claude Sonnet quality for nuanced synthesis. The reports are good but not SOTA. |
| **No citation verification** | Beacon surfaces URLs and writes a report, but doesn't deeply read each page — only SerpAPI snippets. Perplexity actually loads and parses pages. |
| **Single-operator API keys** | Currently all users share the developer's SerpAPI and Groq keys. There is no per-user key isolation. This is a cost, rate-limit, and privacy problem. |
| **No streaming output** | Reports only appear when fully synthesized. No token-by-token streaming like ChatGPT. |
| **No offline/local mode** | Requires Redis, SerpAPI, Groq all to be alive simultaneously. |

---

## 3. Critical Gap: Per-User API Keys (Bring Your Own Keys)

**Current state:** The app uses a single set of API keys (`GROQ_API_KEY`, `SERPAPI_API_KEY`) stored in `.env.local` at the server level. All users share the same keys. This means:

- All SerpAPI usage counts against one account's quota and billing
- All Groq requests are rate-limited as a single user
- If one user hammers research, everyone else gets 429 errors
- The operator (you) pays for all usage

**What needs to change:**

Each user should be able to provide their own API keys via the Settings panel, stored either:
- In their browser session/localStorage (simplest — keys never leave the client, but lost on browser clear)
- Server-side per-user account (requires auth + encrypted storage in Redis)

**Recommended architecture:**

```
User submits brief → frontend reads keys from localStorage →
sends { topic, ..., userKeys: { groqApiKey, serpApiKey } } in request body →
API route uses userKeys if present, falls back to server env keys →
never logs or persists userKeys server-side
```

**Settings panel additions needed:**
- "Your API Keys" section with fields for:
  - Groq API Key (`gsk_...`)
  - SerpAPI API Key
  - (Optional) Upstash Redis URL + Token (for personal memory isolation)
- "Using developer keys" badge when no personal keys are set (so user knows)
- "Keys stored in browser only" disclaimer

**Why this matters for your pitch:**
- Removes your cost exposure entirely once users bring their own keys
- Scales to unlimited users (no shared rate limits)
- Makes Beacon a platform, not just your personal research tool

---

## 4. Graph Page — What's Missing

**Current state:** The graph page shows a 3D interactive node-link diagram (THREE.js) with Topic → Report → Memory → Source URL nodes. There's a left panel for run selection and a right panel for selected node detail.

**Problems:**

### 4a. Node detail is too shallow
When you click a source node, you see the URL and maybe a label. You don't see:
- The actual snippet/excerpt that was indexed from that source
- Which key facts were extracted from it
- Whether it was a delta (new) or already known URL
- The search query that found it

### 4b. Memory node tells you nothing useful
The Memory node exists but clicking it doesn't show you what the agent actually *knows* — the accumulated key facts over all runs. It should surface:
- Full key facts list (all N facts)
- Run-by-run breakdown of what was added when
- Which facts came from which URLs

### 4c. No research provenance trail
The graph doesn't show the query plan: which search queries were generated, which queries produced which sources. You can't trace "why did the agent look at this URL?" back to the original query.

### 4d. No delta highlight
Sources that are newly indexed (delta) vs. already known should be visually distinct. Currently all source nodes look identical.

**What the graph should show that it doesn't:**
- Query plan nodes (the 5–10 search queries generated)
- Query → Sources edges (which queries produced which URLs)
- Delta indicator (new vs. known, colored differently)
- Clicking Memory node shows full extracted knowledge
- Clicking Source node shows the SerpAPI snippet that was indexed

---

## 5. Memory Bank — What's Missing

**Current state:** The memory page shows topic cards with: run count, last run date, URLs indexed, key facts count, report summary (first paragraph), first 3 facts, and a source ledger.

**Problems:**

### 5a. Key facts are too thin
Key facts are extracted bullet points from the synthesized report — they're summaries of summaries. The real knowledge is in the full set of SerpAPI snippets that were indexed. You need:
- The actual extracted snippets (what was read from each URL)
- Grouped by run (so you can see what each run added)
- Searchable (can you find "what did Beacon find about X subtopic?")

### 5b. No knowledge graph of facts
Facts are displayed as a flat list. There's no structure showing how facts relate to each other, which are contradicted by later runs, or which are high-confidence vs. single-source.

### 5c. No fact provenance
Each fact should link back to the source URL it came from. Right now facts are detached from their sources.

### 5d. Report summary loses context
The `reportSummary` stored in memory is just the first paragraph of the last report. If you ran 10 times over 3 months, you can't see how the research evolved — only the latest snapshot.

### 5e. No export
No way to export memory to markdown, JSON, or clipboard for use in other tools.

**What the memory bank should show:**
- Per-run timeline with diff view (what was new in run 3 vs. run 2)
- Full fact list with source attribution per fact
- Search/filter within a topic's memory
- Export button (JSON, markdown)
- Delta score history (a numeric "how much new was found" per run)

---

## 6. Sidebar Page Flow — Gaps and Observations

**Current sidebar nav:**
```
New Brief (CTA)
---
Home (landing page)
Dashboard
New Research
Research Graph
Memory Bank
System Logs
---
Docs
Support
```

**Problems:**

### 6a. No "Brief History" or "All Briefs" page
The dashboard shows recent 5 briefs. There's no paginated view of all past briefs. If you ran 50 researches, you can only see the last 5.

### 6b. No "Settings" page in sidebar
Settings is tucked into the topbar icon. Given that per-user API keys is a needed feature, Settings should be a first-class sidebar item with its own page, not a flyout panel.

### 6c. Graph and Memory Bank are disconnected
The intended flow is: run research → view results in brief detail → explore sources in graph → review accumulated knowledge in memory bank. But nothing links these together contextually. The brief detail page has no "View in Graph" or "View Memory" button.

### 6d. "Home" leads to the marketing landing page
From inside the app, clicking "Home" in the sidebar takes you to the public landing page (`/`). This should probably be the dashboard, or "Home" and "Dashboard" should be merged.

### 6e. No "Settings" route
There's a `Settings` panel in the topbar but no `/settings` route. The API keys feature needs a dedicated settings page.

**Recommended sidebar structure:**
```
New Brief (CTA)
---
Dashboard
All Briefs          ← add
Research Graph
Memory Bank
---
Settings            ← promote from topbar to sidebar
System Logs
---
Docs
Support
```

---

## 7. Research Output Quality — Structural Gaps

### 7a. Brief detail page is a wall of text
The report is rendered as unstyled paragraphs. There's no:
- Section headings
- Key findings callout
- "What changed since last run" section
- Confidence indicators
- Sources linked inline to the report text

### 7b. No "what did we already know" vs. "what's new" split
The delta model is Beacon's core differentiator but the output doesn't make this visible. A user reading a report has no idea what was known before vs. discovered this run.

### 7c. Sources list has no metadata
The sources section is a list of URLs. No titles, no snippets, no domain, no "found by query: X" label.

---

## 8. Summary of Things to Fix (Prioritized)

| Priority | Item | Effort |
|---|---|---|
| **P0** | Per-user API keys (BYOK) — prevents cost exposure at scale | Medium |
| **P0** | Memory bank: fact provenance (each fact → source URL) | Medium |
| **P1** | Graph page: show query plan nodes and query→source edges | High |
| **P1** | Graph page: delta highlighting (new vs known sources) | Low |
| **P1** | Brief detail: "New this run" vs "Already known" sections | Medium |
| **P1** | Memory bank: per-run diff view | Medium |
| **P2** | Sidebar: add "All Briefs" page | Low |
| **P2** | Sidebar: promote Settings to sidebar item with own page | Low |
| **P2** | Graph: clicking Memory node shows full extracted knowledge | Medium |
| **P2** | Graph: clicking Source node shows indexed snippet | Low |
| **P3** | Memory bank: search/filter within topic | Medium |
| **P3** | Memory bank: export (JSON, markdown) | Low |
| **P3** | Brief detail: sources with titles + snippets, not just URLs | Low |
| **P3** | Fix "Home" → should go to Dashboard, not landing page | Trivial |

---

## 9. Before Any Updates Begin — Decisions Needed

1. **BYOK approach:** Client-side localStorage (simpler, no server changes) vs. server-side per-user encrypted storage (requires auth)? Recommendation: localStorage first, migrate to server-side when auth is solid.

2. **Graph page scope:** Is the graph meant to be an analytics tool (understand research provenance) or a visual exploration tool (discover connections)? Affects what metadata to surface.

3. **Memory depth:** Do you want the memory bank to surface raw SerpAPI snippets (high fidelity, high noise) or only extracted key facts (cleaner, but lossy)? Both have tradeoffs.

4. **Report format:** Should the synthesized report be structured (headings, sections, delta callout) or narrative prose? Structured is more scannable; prose is more readable. Pick one and lock it in the synthesis prompt.

5. **Sidebar nav:** Merge "Home" + "Dashboard" into one, or keep separate landing page?

---

*This audit should be read and decisions made before any code changes begin. Update this file as decisions are locked in.*
