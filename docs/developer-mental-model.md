# Beacon Developer Mental Model

This file is a fast mental model for Beacon as it exists in the codebase today.
Each item explains the surface in plain language first, then in technical terms.

## System In One Pass

Beacon is a durable research agent. A user submits a topic, Beacon plans searches, pulls web results, writes a report, and saves memory so the next run can focus on what changed instead of starting over.

Technically, the system has three layers:
- `Context`: query planning, search retrieval, synthesis, graph shaping.
- `Memory`: topic-scoped seen URLs, key facts, summaries, and run history in Upstash Redis.
- `Harness`: durable workflow execution, idempotent steps, rate limits, retries, and recurring sleep/resume behavior.

## Main Pages

### `/` Landing Page

Layman: this is the sales page. It explains what Beacon is, what problems it solves, and where a new user should click first.

Technical: [app/page.tsx](/Users/kuya/Documents/Beacon/app/page.tsx:1) is a static marketing shell that points users into `/trial`, `/docs`, `/dashboard`, and the architecture visual. It does not run research itself; it frames the product model.

### `/trial`

Layman: this is the no-setup sandbox. A visitor can try Beacon with a preset topic and see whether the product is useful before creating an account.

Technical: [app/trial/page.tsx](/Users/kuya/Documents/Beacon/app/trial/page.tsx:1) builds a lightweight intake form and posts to `/api/trial`, using a capped anonymous trial session instead of a Clerk-authenticated user. It is the public entry point into the same core research engine.

### `/trial/[id]`

Layman: this is the live demo result page. While the run is executing it behaves like a progress monitor, and when complete it becomes a report and graph viewer.

Technical: [app/trial/[id]/page.tsx](/Users/kuya/Documents/Beacon/app/trial/[id]/page.tsx:1) polls trial run state, swaps between loading and completed UI, and reuses the same graph scene patterns as the main product. It is effectively a read-only operator console for anonymous runs.

### `/dashboard`

Layman: this is the operator home screen. It shows what is running, what finished, and whether Beacon is building reusable memory over time.

Technical: [app/dashboard/page.tsx](/Users/kuya/Documents/Beacon/app/dashboard/page.tsx:1) polls `/api/briefs`, computes aggregate counters, and renders a queue plus activity feed. It is the main authenticated control surface, not the place where orchestration logic lives.

### `/briefs/new`

Layman: this is the mission planning form. The user decides what to research, how deep to go, what timeframe matters, and which framework should shape the investigation.

Technical: [app/briefs/new/page.tsx](/Users/kuya/Documents/Beacon/app/briefs/new/page.tsx:1) collects the full `ResearchBrief` input, checks whether API keys exist, previews matching memory, stores draft state locally, and posts to `/api/briefs`. This page is the highest-signal write surface for the private app.

### `/briefs`

Layman: this is the run ledger. It is the place to browse every research job Beacon has attempted.

Technical: [app/briefs/page.tsx](/Users/kuya/Documents/Beacon/app/briefs/page.tsx:1) fetches `/api/briefs`, applies local search and status filtering, and links each item to its detail page. Think of it as the index over persisted brief records.

### `/briefs/[id]`

Layman: this is the single-run control room. It shows the report, sources, and plan for one research job, and shows a progress experience while the run is still executing.

Technical: [app/briefs/[id]/page.tsx](/Users/kuya/Documents/Beacon/app/briefs/[id]/page.tsx:1) reads one brief record and associated logs, then pivots between loading-state visualization and completed report tabs. It is the main authenticated run-inspection page.

### `/memory`

Layman: this is Beacon’s long-term memory bank. It lets you see which topics the agent remembers and how much evidence it has already stored for each one.

Technical: [app/memory/page.tsx](/Users/kuya/Documents/Beacon/app/memory/page.tsx:1) lists memory entries from `/api/memory`, computes topic-level stats, and links into per-topic detail views. This page is the best window into the project’s core differentiator.

### `/memory/[slug]`

Layman: this is the dossier for one remembered topic. It shows what Beacon learned before, what URLs it has already seen, and the latest stored summary.

Technical: [app/memory/[slug]/page.tsx](/Users/kuya/Documents/Beacon/app/memory/[slug]/page.tsx:1) resolves a single persisted memory entry and renders fact and source detail. It is the read path over Redis-backed topic memory.

### `/graph`

Layman: this is the visual explanation of how a run becomes memory. It turns topics, queries, reports, sources, and saved facts into nodes so you can inspect relationships instead of reading raw JSON.

Technical: [app/graph/page.tsx](/Users/kuya/Documents/Beacon/app/graph/page.tsx:1) fetches briefs and memory, transforms them into `GraphSceneNode` and `GraphSceneLink`, and renders them through [research-graph-scene.tsx](/Users/kuya/Documents/Beacon/components/graph/research-graph-scene.tsx:1). It is a visualization layer over existing data, not a separate data system.

### `/logs`

Layman: this is the live terminal. It shows what the agent is doing right now and where problems are happening.

Technical: [app/logs/page.tsx](/Users/kuya/Documents/Beacon/app/logs/page.tsx:1) polls `/api/logs`, filters by level and category, and renders the event stream backed by `logStore` and Redis. It is operational observability for the workflow and memory layers.

### `/docs`

Layman: this is the public product manual. It teaches users and developers how to use Beacon without reading the code.

Technical: [app/docs/page.tsx](/Users/kuya/Documents/Beacon/app/docs/page.tsx:1) is a docs hub built on the reusable docs shell and linked pages like quickstart, API, MCP, architecture, and security. It translates internal architecture into public-facing guidance.

### `/profile` and `/settings`

Layman: these are the account setup pages. They are where a user wires in the API keys and personal config Beacon needs to run on their behalf.

Technical: the profile and settings pages sit around BYOK, auth-scoped behavior, and account operations rather than the research workflow itself. They matter because `/api/briefs` refuses to start research unless Groq and SerpAPI credentials are available.

## Graph Components

### `GraphProvider`

Layman: this is the engine switchboard. It decides which graph renderer should draw the same data.

Technical: [components/graph/graph-provider.tsx](/Users/kuya/Documents/Beacon/components/graph/graph-provider.tsx:1) routes one `GraphData` shape into Sigma, Three.js, or Cytoscape adapters and now also passes controlled selection state across engines.

### `ResearchGraphScene`

Layman: this is the translator between product data and graph visuals. It takes Beacon concepts and turns them into a node-link scene.

Technical: [components/graph/research-graph-scene.tsx](/Users/kuya/Documents/Beacon/components/graph/research-graph-scene.tsx:1) maps app-specific node kinds like topic, report, memory, and source into shared graph types. It is the adapter between domain data and renderer-agnostic graph data.

### Sigma / Three.js / Cytoscape adapters

Layman: these are three ways to look at the same graph. Sigma is the default network view, Three.js is the cinematic 3D scene, and Cytoscape is the more structured diagram view.

Technical: the adapter files under [components/graph/engines](/Users/kuya/Documents/Beacon/components/graph/engines) each own engine-specific layout, event wiring, and selection behavior while sharing the same `GraphData` input. They are UI-only renderers; no business logic should live there.

## API Surfaces

### `POST /api/briefs`

Layman: this starts real research for a signed-in user.

Technical: [app/api/briefs/route.ts](/Users/kuya/Documents/Beacon/app/api/briefs/route.ts:1) authenticates with Clerk, enforces rate limits, validates input, checks BYOK key availability, starts `researchAgent`, and seeds the brief record plus logs. This is the main private write endpoint.

### `GET /api/briefs`

Layman: this returns the user’s run history.

Technical: the same route hydrates the persisted brief index, syncs workflow state, and returns sorted run records. The pages use it as the source of truth for queue and dashboard views.

### `GET /api/briefs/[id]`

Layman: this returns the latest known state of one run.

Technical: [app/api/briefs/[id]/route.ts](/Users/kuya/Documents/Beacon/app/api/briefs/[id]/route.ts:1) syncs workflow state, falls back to persisted or in-memory brief records, and returns a safe running placeholder when the record has not been fully hydrated yet.

### `GET /api/memory`

Layman: this lists saved topic memories for the current account.

Technical: [app/api/memory/route.ts](/Users/kuya/Documents/Beacon/app/api/memory/route.ts:1) scans Upstash by user-scoped prefix, fetches all matching keys, decorates each item with `_key`, and sorts by recency. This is the read index over persistent memory.

### `POST /api/workflows/research`

Layman: this is not a user-facing feature; it is the plumbing endpoint the workflow runtime needs.

Technical: [app/api/workflows/research/route.ts](/Users/kuya/Documents/Beacon/app/api/workflows/research/route.ts:1) exists as the HTTP callback surface for the Workflow SDK so durable step execution can checkpoint and resume. It is infrastructure, not product logic.

## Core Libraries

### `lib/groq.ts`

Layman: this file tells Beacon which brains to use.

Technical: [lib/groq.ts](/Users/kuya/Documents/Beacon/lib/groq.ts:1) defines the approved model split: `scoutModel` for planning/tool use and `synthModel` for long-form writing, with BYOK factories for user-supplied API keys. This file enforces one of the project’s key architecture rules.

### `lib/serpapi.ts`

Layman: this file is Beacon’s search hand. It knows how to ask the web for results and shrink them into something the models can actually digest.

Technical: [lib/serpapi.ts](/Users/kuya/Documents/Beacon/lib/serpapi.ts:1) exports the search tool factory, result compression, URL extraction, and fact extraction helpers. It is the bridge between raw retrieval and LLM-friendly context.

### `lib/memory.ts`

Layman: this file is Beacon’s long-term memory module. It remembers what the agent has already seen so reruns can act smarter than first runs.

Technical: [lib/memory.ts](/Users/kuya/Documents/Beacon/lib/memory.ts:1) handles key construction, Upstash REST reads/writes, topic-memory formatting, URL merging, and seen-URL filtering. It is the persistence layer that turns research history into delta behavior.

### `lib/brief-store.ts`

Layman: this file is the run registry. It tracks what jobs exist, what state they are in, and what logs were emitted along the way.

Technical: [lib/brief-store.ts](/Users/kuya/Documents/Beacon/lib/brief-store.ts:1) manages in-memory and Redis-backed `BriefRecord` and `LogEntry` persistence, hydration, webhook delivery state, and run synchronization. It is the operational ledger around the workflow, not the workflow itself.

### `lib/trial.ts`

Layman: this file makes the public demo safe.

Technical: [lib/trial.ts](/Users/kuya/Documents/Beacon/lib/trial.ts:1) manages trial session IDs, IP/session rate limiting, and the conversion from a cookie-scoped visitor into a synthetic `trial:<session>` user identity. It is a quota and identity shim around the main app behavior.

### `lib/chat-bot.ts`

Layman: this file lets Slack act like another front door into Beacon.

Technical: [lib/chat-bot.ts](/Users/kuya/Documents/Beacon/lib/chat-bot.ts:1) builds a singleton Slack chat bot, checks topic memory before starting work, and triggers `/api/briefs` from incoming mentions. It is an integration surface on top of the same backend flow.

## Durable Workflow Mental Model

### `researchAgent`

Layman: this is the whole mission. It loads memory, decides what to search, gathers evidence, writes the report, saves what it learned, and optionally sleeps until the next recurring run.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:81) is the `use workflow` root that orchestrates context, memory, and harness behavior. It selects quick vs deep mode, branches into single-path or multi-track synthesis, persists memory last, and uses durable `sleep()` for recurring reruns.

### `researchConfig`

Layman: this is the knob that changes how ambitious Beacon is.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:35) derives query counts, token budgets, source limits, and whether multi-track fanout is enabled from `depth`. It is the main tuning table for cost and quality.

### `groupByTrack`

Layman: this splits a big research job into lanes.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:66) partitions planned queries into `exploration`, `competitive`, and `signals` tracks, with a fallback split if the planner did not assign labels. It is only used in deep mode.

### `loadMemoryStep`

Layman: this asks, “what do we already know about this topic?”

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:191) is an idempotent `use step` wrapper around `loadMemory` plus timing logs. It is intentionally first because the rest of the workflow depends on prior memory state.

### `planQueries`

Layman: this turns a vague topic into a search strategy.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:202) prompts the scout model with memory, timeframe, objective, focus, and optional framework instructions, then parses JSON into a `QueryPlan`. It also contains the fallback path when model output is malformed.

### `runSerpQuery`

Layman: this performs one web search.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:286) executes a single SerpAPI call through the approved tool layer, scopes by engine and result limit, and returns raw search blocks for later compression and filtering.

### `synthesizeTrack`

Layman: this is one specialist analyst working on one angle of the topic.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:344) takes one track’s filtered search output and uses the synthesis model to produce a partial interpretation. In deep mode you get one of these per lane, in parallel.

### `validateAndMerge`

Layman: this is the editor-in-chief. It reads the specialist drafts, resolves contradictions, and writes the final answer.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:417) merges track outputs with the full evidence base, cross-checks against raw results, and produces the final `ResearchReport`. This is the core quality gate in deep mode.

### `synthesizeReport`

Layman: this is the simpler one-pass writer.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:563) is the quick-mode synthesis path that compresses fresh results and writes the final report directly without multi-track fanout. It is the lower-cost, lower-complexity path.

### `saveMemoryStep`

Layman: this stores the new lessons so Beacon can remember them next time.

Technical: [workflows/research.ts](/Users/kuya/Documents/Beacon/workflows/research.ts:658) is the last workflow step and writes the merged memory payload only after report generation has finished. This placement matters because the project rule is “memory loaded first, saved last.”

## How Data Actually Moves

1. A user submits a brief from `/briefs/new` or `/trial`.
2. The API route validates auth, keys, and limits, then starts `researchAgent`.
3. The workflow loads topic memory, plans queries, runs retrieval, synthesizes a report, and saves updated memory.
4. `brief-store` keeps the run record and log stream queryable by the UI.
5. Pages like `/dashboard`, `/briefs/[id]`, `/memory`, and `/graph` are mostly different lenses over that same stored state.

## The Simplest Correct Mental Model

If you need one sentence: Beacon is “ChatGPT for repeatable research runs, but with topic memory and durable reruns.”

If you need one technical sentence: Beacon is a Next.js app whose primary value comes from a durable workflow that combines Groq-based planning/synthesis, SerpAPI retrieval, Upstash-backed topic memory, and UI/operator surfaces built around persisted brief records.
