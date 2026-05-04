import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsArchitecturePage() {
  return (
    <DocsShell
      eyebrow="Architecture"
      title="How Beacon's research system is structured."
      description="Beacon's core differentiator is the workflow composition across three engineering layers — context, memory, and harness — running real parallel agents, not one sequential chain."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Layers" title="Three engineering layers">
        <div className="grid gap-3 md:grid-cols-3">
          <DocsCard
            title="Context"
            body="Plans queries, assigns tracks to parallel agents, compresses search results, and guides per-track synthesis. Every decision about what the model sees is made here."
          />
          <DocsCard
            title="Memory"
            body="Loads what a topic already knows first, filters seen URLs, and saves updated state last — across sessions. Run #2 never repeats what run #1 already indexed."
          />
          <DocsCard
            title="Harness"
            body="Step idempotency, self-healing retries on empty results, graceful fallbacks on all failure modes, and structured logging at every checkpoint."
          />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Deep Mode" title="Multi-agent run flow">
        <CodeBlock>{`Phase A — Fan out (parallel)
  planQueries()  →  12-15 queries split across 3 tracks
  ├─ track: exploration  (landscape, recent news, history)
  ├─ track: competitive  (players, pricing, launches)
  └─ track: signals      (Reddit, HN, expert opinions)

  All SerpAPI queries across all tracks run simultaneously
  via Promise.all — no sequential bottleneck.

Phase B — Parallel synthesis
  synthesizeTrack("exploration")  ←── [Context]
  synthesizeTrack("competitive")  ←── [Context]  all 3 simultaneously
  synthesizeTrack("signals")      ←── [Context]

  Each track agent writes findings independently.
  Only fresh (unseen) URLs are passed to each agent.

Phase C — Cross-validation
  validateAndMerge()  ←── [Context + Harness]
  Receives all 3 track reports. Cross-checks findings,
  flags contradictions or multi-agent confirmation,
  produces one authoritative delta report.

Phase D — Persist
  saveMemory()  ←── [Memory]
  sleep(7 days)  →  tail-recurse as delta run`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Quick Mode" title="Single-agent run flow">
        <CodeBlock>{`1. loadMemory
2. planQueries  →  5-7 queries, no track split
3. runSerpQuery × N  (all parallel via Promise.all)
4. synthesizeReport  (single synthesis pass)
5. saveMemory
6. optional recurring sleep + rerun`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Self-Healing" title="Harness reliability patterns">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="runSerpQuery — 3 retries"
            body="Each search query retries up to 3 times on empty results or thrown errors. Returns an empty block instead of throwing — one bad query never kills the workflow."
          />
          <DocsCard
            title="synthesizeTrack — retry + fallback"
            body="If the LLM returns less than 120 chars, retries once. Falls back to a placeholder section so validateAndMerge always has content from all 3 tracks."
          />
          <DocsCard
            title="planQueries — safe fallback"
            body="If JSON parse fails, emits a hardcoded 8-query fallback covering all 3 tracks. The workflow never stops due to a malformed model response."
          />
          <DocsCard
            title="saveMemory — never throws"
            body="Memory failure is caught, logged, and silently dropped. The final report is always returned even if the persistence layer is unavailable."
          />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Research Frameworks" title="Structured output overlays">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Beacon ships with 20+ research frameworks — JTBD, SWOT, Problem-Solution Fit, RICE, and more.
          When a framework is selected, <code>planQueries</code> receives a{' '}
          <code>queryHint</code> that shapes what the scout model searches for, and{' '}
          <code>validateAndMerge</code> / <code>synthesizeReport</code> receive a{' '}
          <code>synthesisHint</code> that structures the final report output. The framework layer
          sits on top of the agent architecture — it does not replace it.
        </p>
      </DocsSection>

      <DocsSection eyebrow="Model Rules" title="Approved model layer">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Beacon uses <code>scoutModel</code> (Groq <code>llama-4-scout</code>) for tool use and
          planning, and <code>synthModel</code> (<code>llama-3.3-70b-versatile</code>) for writing
          — both sourced from <code>@/lib/groq</code>. Direct provider imports outside that
          abstraction are intentionally not part of the repo contract.
        </p>
      </DocsSection>
    </DocsShell>
  )
}
