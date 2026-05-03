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
import type { ResearchBrief, ResearchReport, QueryPlan, AgentMemory } from '@/lib/types'

export async function researchAgent(brief: ResearchBrief): Promise<ResearchReport> {
  'use workflow'

  // [Memory] Step 1: Load memory — what do we already know?
  const memory = await loadMemoryStep(brief.topic)

  // [Context + Memory] Step 2: Plan — expand topic into targeted queries
  const plan = await planQueries(brief, memory)

  // [Context] Step 3: Search — fan out SerpAPI queries in parallel
  const rawResults = await Promise.all(
    plan.queries.map((q) => runSerpQuery(q.q, q.engine, brief.userKeys?.serpApiKey))
  )

  // [Memory] Identify which URLs are new (delta) vs already known
  const seenSet = new Set(memory?.seenUrls ?? [])
  const allNewUrls = extractAllUrls(rawResults).filter((u) => !seenSet.has(u))

  // [Memory] Filter out URLs we've already seen (produces delta content)
  const freshResults = memory
    ? filterSeenUrls(rawResults, memory.seenUrls)
    : rawResults

  // [Context + Memory] Step 4: Synthesize — write the report from fresh context
  const report = await synthesizeReport(freshResults, brief, memory, plan, allNewUrls)

  // [Memory] Step 5: Save memory — update what we know for next run
  const { facts, factSources } = extractKeyFactsWithSources(report.content, report.sources)
  const runNow = new Date().toISOString()
  const prevRuns = memory?.runs ?? []
  await saveMemoryStep({
    topic: brief.topic,
    seenUrls: mergeUrls(memory?.seenUrls ?? [], extractAllUrls(rawResults)),
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
        urlsAdded: allNewUrls.length,
        factsAdded: facts.length,
        summary: report.summary.slice(0, 160),
      },
    ],
  })

  // [Harness] Step 6: Recurring — sleep then rerun (zero compute during sleep)
  if (brief.recurring && brief.recurringInterval) {
    // Cast required: sleep() expects StringValue (ms literal union); recurringInterval is string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sleep(brief.recurringInterval as any)
    return researchAgent({ ...brief, mode: 'delta' })
  }

  return report
}

// ─── Step Functions ──────────────────────────────────────────────────────────

async function loadMemoryStep(topic: string): Promise<AgentMemory | null> {
  'use step'
  // [Memory] [Harness] — idempotent Redis read; null on first run or error
  const start = Date.now()
  const result = await loadMemory(topic)
  console.log(
    `[beacon:step] loadMemory topic="${topic}" result=${result ? 'hit' : 'miss'} runCount=${result?.runCount ?? 0} ms=${Date.now() - start}`
  )
  return result
}

async function planQueries(
  brief: ResearchBrief,
  memory: AgentMemory | null
): Promise<QueryPlan> {
  'use step'
  // [Context] [Memory] — scoutModel generates targeted queries, skipping known ground

  const start = Date.now()
  const topic = brief.topic
  const memoryContext = buildMemoryContext(memory)
  const isRerun = memory && memory.runCount > 0
  const framework = brief.frameworkId ? FRAMEWORKS_BY_ID.get(brief.frameworkId) : null
  const scout = createScoutModel(brief.userKeys?.groqApiKey)
  const timeframeGuidance = {
    '7d': 'prioritize only the last 7 days unless foundational context is required',
    '30d': 'prioritize the last 30 days while retaining enough baseline context to explain changes',
    '90d': 'prioritize the last 90 days and major shifts within the quarter',
    all: 'cover the broader landscape, history, current state, and recent changes',
  }[brief.timeframe ?? '30d']

  const { text } = await generateText({
    model: scout,
    system: `You are a research planning agent.
${memoryContext}

Generate ${isRerun ? '5-7' : '8-10'} search queries for the topic.
${
  isRerun
    ? `Since this is a rerun, focus on: recent news, new releases, price changes, announcements since ${new Date(memory!.lastRunAt).toLocaleDateString()}`
    : 'Since this is a fresh run, cover: overview, comparisons, recent news, use cases, pricing, community sentiment.'
}
Time window guidance: ${timeframeGuidance}.
${brief.objective ? `Primary objective: ${brief.objective}` : ''}
${brief.focus ? `Priority focus areas: ${brief.focus}` : ''}
${framework ? `\n\n## Research Framework: ${framework.name}\n${framework.queryHint}` : ''}

Return ONLY valid JSON, no markdown, no explanation:
{
  "queries": [
    { "q": "exact search query", "engine": "google", "intent": "brief description" }
  ]
}

Available engines: google, google_news, google_scholar, google_jobs, bing`,
    prompt: `Research topic: ${topic}`,
  })

  let plan: QueryPlan
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    plan = JSON.parse(clean)
  } catch {
    // [Harness] Safe fallback — never let a JSON parse error stop the workflow
    console.error('[beacon:planQueries] JSON parse failed, raw output:', text.slice(0, 200))
    plan = {
      queries: [
        { q: topic, engine: 'google', intent: 'overview' },
        { q: `${topic} ${new Date().getFullYear()}`, engine: 'google_news', intent: 'recent' },
        { q: `${topic} comparison`, engine: 'google', intent: 'comparison' },
      ],
    }
  }

  console.log(
    `[beacon:step] planQueries topic="${topic}" queries=${plan.queries.length} ms=${Date.now() - start}`
  )
  return plan
}

async function runSerpQuery(
  q: string,
  engine: 'google' | 'google_news' | 'google_scholar' | 'google_jobs' | 'bing',
  serpApiKey?: string
) {
  'use step'
  // [Context] [Harness] — one SerpAPI call, forced tool use, idempotent step

  const start = Date.now()
  const scout = createScoutModel()
  const { toolResults } = await generateText({
    model: scout,
    tools: { serpapi_search: createSerpApiTool(serpApiKey) },
    toolChoice: 'required',
    prompt: `Search: "${q}" using ${engine} engine. Return 8 results.`,
    maxSteps: 1,
  })

  const result = toolResults[0]?.result ?? { engine, query: q, results: [] }
  console.log(
    `[beacon:step] runSerpQuery q="${q}" engine=${engine} results=${(result as { results?: unknown[] }).results?.length ?? 0} ms=${Date.now() - start}`
  )
  return result
}

async function synthesizeReport(
  serpResults: Array<{ results?: Array<{ title?: string; url?: string; snippet?: string; engine?: string }> }>,
  brief: ResearchBrief,
  memory: AgentMemory | null,
  queryPlan: QueryPlan,
  deltaUrls: string[]
): Promise<ResearchReport> {
  'use step'
  // [Context] [Memory] — synthModel writes cited report from compressed fresh context

  const start = Date.now()
  const context = compressSerpResults(serpResults)
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

${
  isDelta
    ? `This is research run #${runCount}. Write a DELTA report — focus on what CHANGED since last time.
Start with "## What Changed Since Last Week" before the full report.`
    : `This is the first research run. Write a comprehensive overview report.`
}

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

Rules: Always cite sources inline. Be specific. No fluff. Max 600 words.${framework ? `\n\n## Output Framework: ${framework.name}\n${framework.synthesisHint}` : ''}`,
    prompt: `Topic: ${brief.topic}
Run #${runCount}
${memory ? `Previous summary: ${memory.reportSummary}` : ''}

Fresh research data:
${context}`,
    maxTokens: 1500,
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
    .slice(0, 20)

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
