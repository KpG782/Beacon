import { sleep } from 'workflow'
import { generateText } from 'ai'
import { createScoutModel, createSynthModel } from '@/lib/groq'
import {
  createSerpApiTool,
  compressSerpResults,
  extractAllUrls,
  extractKeyFactsWithSources,
} from '@/lib/serpapi'
import {
  loadMemory,
  saveMemory,
  mergeUrls,
  filterSeenUrls,
  buildMemoryContext,
} from '@/lib/memory'
import { FRAMEWORKS_BY_ID } from '@/lib/frameworks'
import type { ResearchBrief, ResearchReport, QueryPlan, AgentMemory, TokenBudget } from '@/lib/types'

// ─── Depth-driven config ──────────────────────────────────────────────────────
// All tunable parameters flow from a single `depth` value so there is one
// place to adjust. `multiTrack` activates the 3-agent parallel path.

interface ResearchConfig {
  multiTrack: boolean
  queryCountFresh: string
  queryCountRerun: string
  resultsPerQuery: number
  trackSynthTokens: number   // tokens per track synthesis (deep only)
  finalSynthTokens: number   // tokens for the final merge / quick report
  sourceLimit: number
  wordBudget: string
}

// Maps finalSynthTokens to a matching word-count instruction for the model
function tokensToWordBudget(tokens: number): string {
  if (tokens <= 1000) return '400-500'
  if (tokens <= 1400) return '550-700'
  if (tokens <= 1800) return '700-900'
  if (tokens <= 2400) return '900-1100'
  if (tokens <= 3200) return '1100-1400'
  return '1400-1800'
}

function researchConfig(depth: 'quick' | 'deep' = 'deep', budget?: TokenBudget): ResearchConfig {
  if (depth === 'quick') {
    const fin = budget?.finalSynthTokens ?? 1800
    return {
      multiTrack: false,
      queryCountFresh: '5-7',
      queryCountRerun: '4-5',
      resultsPerQuery: 6,
      trackSynthTokens: budget?.trackSynthTokens ?? 1800,
      finalSynthTokens: fin,
      sourceLimit: 15,
      wordBudget: tokensToWordBudget(fin),
    }
  }
  // Default token budget is tuned for Groq free tier (12,000 TPM).
  // Users on Dev Tier (25K) or paid tiers can raise these via brief.tokenBudget.
  const track = budget?.trackSynthTokens ?? 1000
  const fin   = budget?.finalSynthTokens ?? 1800
  return {
    multiTrack: true,
    queryCountFresh: '12-15',
    queryCountRerun: '8-10',
    resultsPerQuery: 10,
    trackSynthTokens: track,
    finalSynthTokens: fin,
    sourceLimit: 30,
    wordBudget: tokensToWordBudget(fin),
  }
}

// Distribute queries across 3 tracks. Planning assigns track labels; fall back
// to even thirds if the model returns no labels.
function groupByTrack(queries: QueryPlan['queries']) {
  const labeled = {
    exploration: queries.filter((q) => q.track === 'exploration'),
    competitive: queries.filter((q) => q.track === 'competitive'),
    signals: queries.filter((q) => q.track === 'signals'),
  }
  if (labeled.exploration.length || labeled.competitive.length || labeled.signals.length) {
    return labeled
  }
  const third = Math.ceil(queries.length / 3)
  return {
    exploration: queries.slice(0, third),
    competitive: queries.slice(third, third * 2),
    signals: queries.slice(third * 2),
  }
}

// Narrow type for raw SerpAPI blocks — compatible with extractAllUrls / filterSeenUrls
type SerpBlock = {
  engine?: string
  query?: string
  results?: Array<{ title?: string; url?: string; snippet?: string; engine?: string; date?: string | null }>
}

// ─── Main durable workflow ────────────────────────────────────────────────────

export async function researchAgent(brief: ResearchBrief): Promise<ResearchReport> {
  'use workflow'

  // [Memory] Step 1: What do we already know?
  const memory = await loadMemoryStep(brief.userId, brief.topic)

  // [Context + Memory] Step 2: Generate targeted queries
  const plan = await planQueries(brief, memory)

  const cfg = researchConfig(brief.depth, brief.tokenBudget)
  const seenSet = new Set(memory?.seenUrls ?? [])
  let allRaw: SerpBlock[]
  let report: ResearchReport

  if (cfg.multiTrack) {
    // ── Deep mode: 3 parallel specialized agents + validation ─────────────────
    const tracks = groupByTrack(plan.queries)
    const serpKey = brief.userKeys?.serpApiKey

    // [Context] Phase A: fan out all searches across all tracks simultaneously
    const [exploRaw, compRaw, sigRaw] = await Promise.all([
      Promise.all(tracks.exploration.map((q) => runSerpQuery(q.q, q.engine, serpKey, cfg.resultsPerQuery))),
      Promise.all(tracks.competitive.map((q) => runSerpQuery(q.q, q.engine, serpKey, cfg.resultsPerQuery))),
      Promise.all(tracks.signals.map((q) => runSerpQuery(q.q, q.engine, serpKey, cfg.resultsPerQuery))),
    ]) as [SerpBlock[], SerpBlock[], SerpBlock[]]

    allRaw = [...exploRaw, ...compRaw, ...sigRaw]
    const allNewUrls = extractAllUrls(allRaw).filter((u) => !seenSet.has(u))

    // Only pass fresh (unseen) content to each track agent
    const [freshExploRaw, freshCompRaw, freshSigRaw] = memory
      ? [
          filterSeenUrls(exploRaw, memory.seenUrls),
          filterSeenUrls(compRaw, memory.seenUrls),
          filterSeenUrls(sigRaw, memory.seenUrls),
        ]
      : [exploRaw, compRaw, sigRaw]

    // [Context] Phase B: each track agent synthesizes its angle independently
    const [exploText, compText, sigText] = await Promise.all([
      synthesizeTrack('exploration', freshExploRaw, brief, memory),
      synthesizeTrack('competitive', freshCompRaw, brief, memory),
      synthesizeTrack('signals', freshSigRaw, brief, memory),
    ])

    // [Context + Harness] Phase C: validator cross-checks and produces the final report
    report = await validateAndMerge(
      { exploration: exploText, competitive: compText, signals: sigText },
      brief, memory, plan, allRaw, allNewUrls
    )
  } else {
    // ── Quick mode: single agent (original path) ──────────────────────────────
    const rawResults = await Promise.all(
      plan.queries.map((q) => runSerpQuery(q.q, q.engine, brief.userKeys?.serpApiKey, cfg.resultsPerQuery))
    ) as SerpBlock[]

    allRaw = rawResults
    const allNewUrls = extractAllUrls(rawResults).filter((u) => !seenSet.has(u))
    const freshResults = memory ? filterSeenUrls(rawResults, memory.seenUrls) : rawResults
    report = await synthesizeReport(freshResults, brief, memory, plan, allNewUrls)
  }

  // [Memory] Step 5: Persist everything we learned
  const { facts, factSources } = extractKeyFactsWithSources(report.content, report.sources)
  const runNow = new Date().toISOString()
  const prevRuns = memory?.runs ?? []
  await saveMemoryStep({
    userId: brief.userId,
    topic: brief.topic,
    seenUrls: mergeUrls(memory?.seenUrls ?? [], extractAllUrls(allRaw)),
    keyFacts: facts,
    factSources,
    lastRunAt: runNow,
    runCount: (memory?.runCount ?? 0) + 1,
    reportSummary: report.summary,
    runs: [
      ...prevRuns.slice(-9),
      {
        runAt: runNow,
        runCount: (memory?.runCount ?? 0) + 1,
        urlsAdded: report.deltaUrls?.length ?? 0,
        factsAdded: facts.length,
        summary: report.summary.slice(0, 160),
      },
    ],
  })

  // [Harness] Step 6: sleep then rerun (zero compute during sleep)
  if (brief.recurring && brief.recurringInterval) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sleep(brief.recurringInterval as any)
    return researchAgent({ ...brief, mode: 'delta' })
  }

  return report
}

// ─── Step Functions ───────────────────────────────────────────────────────────

async function loadMemoryStep(userId: string | undefined, topic: string): Promise<AgentMemory | null> {
  'use step'
  // [Memory] [Harness] — idempotent Redis read; null on first run
  const start = Date.now()
  const result = userId ? await loadMemory(userId, topic) : await loadMemory(topic)
  console.log(
    `[beacon:step] loadMemory topic="${topic}" result=${result ? 'hit' : 'miss'} runCount=${result?.runCount ?? 0} ms=${Date.now() - start}`
  )
  return result
}

async function planQueries(brief: ResearchBrief, memory: AgentMemory | null): Promise<QueryPlan> {
  'use step'
  // [Context] [Memory] — scoutModel expands topic into targeted, engine-specific queries

  const start = Date.now()
  const cfg = researchConfig(brief.depth, brief.tokenBudget)
  const memoryContext = buildMemoryContext(memory)
  const isRerun = !!(memory && memory.runCount > 0)
  const framework = brief.frameworkId ? FRAMEWORKS_BY_ID.get(brief.frameworkId) : null
  const scout = createScoutModel(brief.userKeys?.groqApiKey)
  const queryCount = isRerun ? cfg.queryCountRerun : cfg.queryCountFresh
  const timeframeGuidance = {
    '7d': 'prioritize only the last 7 days unless foundational context is required',
    '30d': 'prioritize the last 30 days while retaining enough baseline context to explain changes',
    '90d': 'prioritize the last 90 days and major shifts within the quarter',
    all: 'cover the broader landscape, history, current state, and recent changes',
  }[brief.timeframe ?? '30d']

  const trackInstructions = cfg.multiTrack
    ? `Divide queries across 3 research tracks:
- "exploration" (4-5 queries): landscape overview, history, current state, recent announcements
- "competitive" (4-5 queries): key players, pricing, product comparisons, market positioning, recent launches
- "signals" (4-5 queries): developer/community sentiment, Reddit/HN/Twitter discussions, technical tradeoffs, expert opinions`
    : ''

  const { text } = await generateText({
    model: scout,
    system: `You are a research planning agent.
${memoryContext}

Generate ${queryCount} search queries for the topic.
${isRerun
  ? `Since this is a rerun, focus on: recent news, new releases, price changes, announcements since ${new Date(memory!.lastRunAt).toLocaleDateString()}`
  : 'Since this is a fresh run, cover: overview, comparisons, recent news, use cases, pricing, community sentiment.'}
Time window guidance: ${timeframeGuidance}.
${brief.objective ? `Primary objective: ${brief.objective}` : ''}
${brief.focus ? `Priority focus areas: ${brief.focus}` : ''}
${trackInstructions}
${framework ? `\n\n## Research Framework: ${framework.name}\n${framework.queryHint}` : ''}

Return ONLY valid JSON, no markdown, no explanation:
{
  "queries": [
    { "q": "exact search query", "engine": "google", "intent": "brief description"${cfg.multiTrack ? ', "track": "exploration|competitive|signals"' : ''} }
  ]
}

Available engines: google, google_news, google_scholar, google_jobs, bing`,
    prompt: `Research topic: ${brief.topic}`,
  })

  let plan: QueryPlan
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    plan = JSON.parse(clean)
  } catch {
    // [Harness] Safe fallback — never let a JSON parse error stop the workflow
    console.error('[beacon:planQueries] JSON parse failed, raw output:', text.slice(0, 200))
    plan = {
      queries: cfg.multiTrack
        ? [
            { q: brief.topic, engine: 'google', intent: 'overview', track: 'exploration' },
            { q: `${brief.topic} ${new Date().getFullYear()}`, engine: 'google_news', intent: 'recent', track: 'exploration' },
            { q: `${brief.topic} latest news`, engine: 'google_news', intent: 'news', track: 'exploration' },
            { q: `${brief.topic} competitors`, engine: 'google', intent: 'competition', track: 'competitive' },
            { q: `${brief.topic} pricing`, engine: 'google', intent: 'pricing', track: 'competitive' },
            { q: `${brief.topic} vs alternatives`, engine: 'google', intent: 'comparison', track: 'competitive' },
            { q: `${brief.topic} reddit review`, engine: 'google', intent: 'sentiment', track: 'signals' },
            { q: `${brief.topic} developer opinion`, engine: 'google', intent: 'community', track: 'signals' },
          ]
        : [
            { q: brief.topic, engine: 'google', intent: 'overview' },
            { q: `${brief.topic} ${new Date().getFullYear()}`, engine: 'google_news', intent: 'recent' },
            { q: `${brief.topic} comparison`, engine: 'google', intent: 'comparison' },
          ],
    }
  }

  console.log(
    `[beacon:step] planQueries topic="${brief.topic}" queries=${plan.queries.length} multiTrack=${cfg.multiTrack} ms=${Date.now() - start}`
  )
  return plan
}

async function runSerpQuery(
  q: string,
  engine: 'google' | 'google_news' | 'google_scholar' | 'google_jobs' | 'bing',
  serpApiKey?: string,
  numResults = 8
) {
  'use step'
  // [Context] [Harness] — up to 3 attempts per query; empty results trigger a retry
  // so one bad SerpAPI response never kills the downstream agents

  const start = Date.now()
  const scout = createScoutModel()
  let result: SerpBlock = { engine, query: q, results: [] }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { toolResults } = await generateText({
        model: scout,
        tools: { serpapi_search: createSerpApiTool(serpApiKey) },
        toolChoice: 'required',
        prompt: `Search: "${q}" using ${engine} engine. Return ${numResults} results.`,
        maxSteps: 1,
      })
      const r = (toolResults[0]?.result ?? { engine, query: q, results: [] }) as SerpBlock
      if ((r.results?.length ?? 0) > 0) { result = r; break }
      if (attempt < 2) console.warn(`[beacon:self-heal] runSerpQuery empty results attempt ${attempt + 1} q="${q}"`)
    } catch (err) {
      console.warn(`[beacon:self-heal] runSerpQuery threw attempt ${attempt + 1} q="${q}":`, String(err))
      if (attempt === 2) break
    }
  }

  console.log(
    `[beacon:step] runSerpQuery q="${q}" engine=${engine} results=${result.results?.length ?? 0} ms=${Date.now() - start}`
  )
  return result
}

// ─── Deep mode: track-level synthesis ────────────────────────────────────────

const TRACK_META = {
  exploration: {
    label: 'Landscape & Recent Developments',
    instruction:
      'Cover: overview, history, current state, major recent announcements, and emerging trends. Be comprehensive.',
  },
  competitive: {
    label: 'Competitive Intelligence & Market Position',
    instruction:
      'Cover: key players, pricing tiers, product differentiators, recent launches, partnerships, market share signals.',
  },
  signals: {
    label: 'Community Signals & Technical Depth',
    instruction:
      'Cover: developer/practitioner sentiment, Reddit/HN/Twitter/forum discussions, technical tradeoffs, expert opinions, emerging risks or opportunities.',
  },
} as const

async function synthesizeTrack(
  trackName: 'exploration' | 'competitive' | 'signals',
  trackResults: SerpBlock[],
  brief: ResearchBrief,
  memory: AgentMemory | null
): Promise<string> {
  'use step'
  // [Context] — intermediate synthesis for one research angle; feeds validateAndMerge

  const start = Date.now()
  const cfg = researchConfig(brief.depth, brief.tokenBudget)
  const meta = TRACK_META[trackName]
  const runCount = (memory?.runCount ?? 0) + 1
  const isDelta = runCount > 1
  const synth = createSynthModel(brief.userKeys?.groqApiKey)
  const context = compressSerpResults(trackResults, { maxResults: cfg.resultsPerQuery * (trackResults.length || 5) })

  const systemPrompt = `You are a research analyst writing one section of a multi-agent report.

Track: ${meta.label}
Scope: ${meta.instruction}
${isDelta
  ? `Run #${runCount} — focus on what CHANGED since last run (${new Date(memory!.lastRunAt).toLocaleDateString()}).`
  : 'First run — write a comprehensive baseline section.'}
Objective: ${brief.objective || 'Surface the most important findings.'}
${brief.focus ? `Priority focus: ${brief.focus}` : ''}

Write 4-6 dense, specific findings with inline citations [N].

Format:
## ${meta.label}
1. [Specific finding] [1]
2. [Specific finding] [2]
...

## Sources
[1] Title — URL`

  const userPrompt = `Topic: ${brief.topic}

Evidence:
${context}`

  // [Harness] Retry once if the model returns a suspiciously short response
  let text = ''
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await generateText({
      model: synth,
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: cfg.trackSynthTokens,
    })
    text = response.text
    if (text.trim().length >= 120) break
    console.warn(
      `[beacon:self-heal] synthesizeTrack track="${trackName}" short output (${text.length} chars) attempt ${attempt + 1}, retrying`
    )
  }

  // [Harness] Fallback: guarantees validateAndMerge always receives content from all 3 tracks
  if (text.trim().length < 50) {
    text = `## ${meta.label}\n\nInsufficient evidence returned for this track. The validator will note the coverage gap.\n`
    console.error(`[beacon:self-heal] synthesizeTrack track="${trackName}" using fallback placeholder`)
  }

  console.log(
    `[beacon:step] synthesizeTrack track="${trackName}" topic="${brief.topic}" ms=${Date.now() - start}`
  )
  return text
}

// ─── Deep mode: cross-validation + final merge ───────────────────────────────

async function validateAndMerge(
  tracks: { exploration: string; competitive: string; signals: string },
  brief: ResearchBrief,
  memory: AgentMemory | null,
  queryPlan: QueryPlan,
  allRaw: SerpBlock[],
  deltaUrls: string[]
): Promise<ResearchReport> {
  'use step'
  // [Context + Harness] — receives 3 independent track reports, cross-validates,
  // then writes one authoritative unified report

  const start = Date.now()
  const cfg = researchConfig(brief.depth, brief.tokenBudget)
  const runCount = (memory?.runCount ?? 0) + 1
  const isDelta = runCount > 1
  const framework = brief.frameworkId ? FRAMEWORKS_BY_ID.get(brief.frameworkId) : null
  const synth = createSynthModel(brief.userKeys?.groqApiKey)
  const reportStyleGuidance = {
    executive: 'Write for a busy operator. Decision-oriented, scannable, no fluff.',
    bullet: 'Bullets and terse findings over narrative prose.',
    memo: 'Analyst memo with context, nuance, and interpretation.',
    framework: 'Structured tightly around the selected framework.',
  }[brief.reportStyle ?? 'executive']

  // Truncate each track to ~2400 chars (~600 tokens) to cap prompt input tokens
  // and keep the total request well under the Groq TPM limit
  const truncate = (s: string, max = 2400) =>
    s.length > max ? s.slice(0, max) + '\n[truncated]' : s

  const systemPrompt = `You are a senior research analyst completing a multi-agent investigation.

Three specialized agents independently researched the same topic from different angles.
Your job: cross-validate their findings, flag contradictions or cross-agent confirmations, then produce one authoritative report.

${isDelta
  ? `Run #${runCount} — focus on what CHANGED since last run.\nPrevious summary: ${memory!.reportSummary}`
  : 'First run — write a comprehensive baseline report.'}
Writing style: ${reportStyleGuidance}
Word budget: ${cfg.wordBudget} words total
${framework ? `\nOutput framework: ${framework.name}\n${framework.synthesisHint}` : ''}

Format:
${isDelta ? '## What Changed Since Last Run\n[3-4 specific bullets on key changes]\n\n' : ''}## Cross-Agent Validation
[1-2 bullets only: facts confirmed by multiple agents, or contradictions between agents. Skip if nothing notable.]

## Executive Summary
[3-4 sentences integrating all three angles]

## Key Findings
1. [Specific finding with citation] [1]
2. [Specific finding] [2]
3. [Specific finding] [3]
4. [Specific finding] [4]
5. [Specific finding] [5]

## Competitive Landscape
[From competitive track — be specific about players, pricing, positioning]

## Community & Technical Signals
[From signals track — practitioner sentiment, technical tradeoffs, risks]

## Sources
[1] Title — URL
[2] Title — URL

Rules: Cite every factual claim with [N]. ${cfg.wordBudget} words. No vague generalities.`

  const userPrompt = `Topic: ${brief.topic}
Run #${runCount}
Objective: ${brief.objective || 'Surface the most important findings.'}
${brief.focus ? `Focus areas: ${brief.focus}` : ''}

--- AGENT 1: Landscape & Recent Developments ---
${truncate(tracks.exploration)}

--- AGENT 2: Competitive Intelligence ---
${truncate(tracks.competitive)}

--- AGENT 3: Community & Technical Signals ---
${truncate(tracks.signals)}`

  // [Harness] Rate-limit-aware retry: Groq returns a "retry after Xs" message on TPM errors.
  // Sleep that duration + 1s buffer, then retry with a smaller output budget as a fallback.
  let text = ''
  let totalTokens = 0
  let mergeTokens = cfg.finalSynthTokens
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { text: t, usage } = await generateText({
        model: synth,
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: mergeTokens,
      })
      text = t
      totalTokens = usage.totalTokens
      break
    } catch (err) {
      const msg = String(err)
      const isRateLimit = msg.includes('Rate limit') || msg.includes('rate_limit') || msg.includes('TPM')
      if (isRateLimit && attempt < 2) {
        // Parse "Please try again in Xs" from the Groq error message
        const retryMatch = msg.match(/try again in ([\d.]+)s/)
        const waitMs = retryMatch ? Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1200 : 8000
        console.warn(
          `[beacon:self-heal] validateAndMerge rate limit hit attempt ${attempt + 1}, sleeping ${waitMs}ms then retrying`
        )
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        mergeTokens = Math.max(1000, mergeTokens - 300)
      } else {
        throw err
      }
    }
  }

  console.log(
    `[beacon:step] validateAndMerge topic="${brief.topic}" run=${runCount} tokens=${totalTokens} ms=${Date.now() - start}`
  )

  const sources = allRaw
    .flatMap((r) => r.results ?? [])
    .map((r, i) => ({
      index: i + 1,
      title: r.title ?? '',
      url: r.url ?? '',
      snippet: r.snippet ?? '',
      engine: r.engine ?? 'google',
    }))
    .slice(0, cfg.sourceLimit)

  return {
    topic: brief.topic,
    summary: text.split('\n').find((l) => l.trim().length > 30) ?? text.slice(0, 200),
    content: text,
    sources,
    generatedAt: new Date().toISOString(),
    runCount,
    isDelta,
    queryPlan,
    deltaUrls,
  }
}

// ─── Quick mode: single-agent synthesis (original path) ──────────────────────

async function synthesizeReport(
  serpResults: SerpBlock[],
  brief: ResearchBrief,
  memory: AgentMemory | null,
  queryPlan: QueryPlan,
  deltaUrls: string[]
): Promise<ResearchReport> {
  'use step'
  // [Context] [Memory]

  const start = Date.now()
  const cfg = researchConfig(brief.depth, brief.tokenBudget)
  const context = compressSerpResults(serpResults, { maxResults: cfg.sourceLimit })
  const runCount = (memory?.runCount ?? 0) + 1
  const isDelta = runCount > 1
  const framework = brief.frameworkId ? FRAMEWORKS_BY_ID.get(brief.frameworkId) : null
  const synth = createSynthModel(brief.userKeys?.groqApiKey)
  const reportStyleGuidance = {
    executive: 'Write for a busy operator. Be concise, scannable, and decision-oriented.',
    bullet: 'Favor compact bullets, short sections, and terse findings over narrative prose.',
    memo: 'Write as an analyst memo with slightly more context, nuance, and interpretation.',
    framework: 'Structure the output tightly around the selected framework when one is present; otherwise use a structured analytical report.',
  }[brief.reportStyle ?? 'executive']
  const timeframeLabel = {
    '7d': 'last 7 days',
    '30d': 'last 30 days',
    '90d': 'last 90 days',
    all: 'broader historical and current landscape',
  }[brief.timeframe ?? '30d']

  const { text, usage } = await generateText({
    model: synth,
    system: `You are a research analyst. Write a clear, cited research report.

${isDelta
  ? `Run #${runCount}. Write a DELTA report — focus on what CHANGED since last run.
Start with "## What Changed Since Last Week" before the full report.`
  : 'First research run. Write a comprehensive overview report.'}

Research objective: ${brief.objective || 'Identify the most important findings for this topic.'}
Priority focus areas: ${brief.focus || 'Overview, current developments, and notable changes.'}
Time scope: ${timeframeLabel}
Writing style: ${reportStyleGuidance}

Format:
${isDelta ? '## What Changed Since Last Week\n[2-3 sentences on key changes]\n\n' : ''}## Executive Summary
[2-3 sentence overview]

## Key Findings
1. [Finding with inline citation like [1]]
2. [Finding with citation [2]]
3. [Finding with citation [3]]

## Sources
[1] Title — URL
[2] Title — URL

Rules: Always cite sources inline. Be specific. No fluff. ${cfg.wordBudget} words.${framework ? `\n\n## Output Framework: ${framework.name}\n${framework.synthesisHint}` : ''}`,
    prompt: `Topic: ${brief.topic}
Run #${runCount}
${memory ? `Previous summary: ${memory.reportSummary}` : ''}

Fresh research data:
${context}`,
    maxTokens: cfg.finalSynthTokens,
  })

  console.log(
    `[beacon:step] synthesize topic="${brief.topic}" run=${runCount} tokens=${usage.totalTokens} ms=${Date.now() - start}`
  )

  const sources = serpResults
    .flatMap((r) => r.results ?? [])
    .map((r, i) => ({
      index: i + 1,
      title: r.title ?? '',
      url: r.url ?? '',
      snippet: r.snippet ?? '',
      engine: r.engine ?? 'google',
    }))
    .slice(0, cfg.sourceLimit)

  return {
    topic: brief.topic,
    summary: text.split('\n').find((l) => l.trim().length > 30) ?? text.slice(0, 200),
    content: text,
    sources,
    generatedAt: new Date().toISOString(),
    runCount,
    isDelta,
    queryPlan,
    deltaUrls,
  }
}

async function saveMemoryStep(memory: AgentMemory): Promise<void> {
  'use step'
  // [Memory] [Harness] — idempotent Redis write; never throws
  const start = Date.now()
  await saveMemory(memory)
  console.log(
    `[beacon:step] saveMemory topic="${memory.topic}" urls=${memory.seenUrls.length} facts=${memory.keyFacts.length} runs=${memory.runs?.length ?? 0} ms=${Date.now() - start}`
  )
}
