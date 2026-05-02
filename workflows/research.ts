import { sleep } from 'workflow'
import { generateText } from 'ai'
import { scoutModel, synthModel } from '@/lib/groq'
import {
  serpApiTool,
  compressSerpResults,
  extractAllUrls,
  extractKeyFacts,
} from '@/lib/serpapi'
import {
  loadMemory,
  saveMemory,
  mergeUrls,
  filterSeenUrls,
  buildMemoryContext,
} from '@/lib/memory'
import type { ResearchBrief, ResearchReport, QueryPlan, AgentMemory } from '@/lib/types'

export async function researchAgent(brief: ResearchBrief): Promise<ResearchReport> {
  'use workflow'

  // [Memory] Step 1: Load memory — what do we already know?
  const memory = await loadMemoryStep(brief.topic)

  // [Context + Memory] Step 2: Plan — expand topic into targeted queries
  const plan = await planQueries(brief.topic, memory)

  // [Context] Step 3: Search — fan out SerpAPI queries in parallel
  const rawResults = await Promise.all(
    plan.queries.map((q) => runSerpQuery(q.q, q.engine))
  )

  // [Memory] Filter out URLs we've already seen (produces delta content)
  const freshResults = memory
    ? filterSeenUrls(rawResults, memory.seenUrls)
    : rawResults

  // [Context + Memory] Step 4: Synthesize — write the report from fresh context
  const report = await synthesizeReport(freshResults, brief, memory)

  // [Memory] Step 5: Save memory — update what we know for next run
  await saveMemoryStep({
    topic: brief.topic,
    seenUrls: mergeUrls(memory?.seenUrls ?? [], extractAllUrls(rawResults)),
    keyFacts: extractKeyFacts(report.content),
    lastRunAt: new Date().toISOString(),
    runCount: (memory?.runCount ?? 0) + 1,
    reportSummary: report.summary,
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
  topic: string,
  memory: AgentMemory | null
): Promise<QueryPlan> {
  'use step'
  // [Context] [Memory] — scoutModel generates targeted queries, skipping known ground

  const start = Date.now()
  const memoryContext = buildMemoryContext(memory)
  const isRerun = memory && memory.runCount > 0

  const { text } = await generateText({
    model: scoutModel,
    system: `You are a research planning agent.
${memoryContext}

Generate ${isRerun ? '5-7' : '8-10'} search queries for the topic.
${
  isRerun
    ? `Since this is a rerun, focus on: recent news, new releases, price changes, announcements since ${new Date(memory!.lastRunAt).toLocaleDateString()}`
    : 'Since this is a fresh run, cover: overview, comparisons, recent news, use cases, pricing, community sentiment.'
}

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
  engine: 'google' | 'google_news' | 'google_scholar' | 'google_jobs' | 'bing'
) {
  'use step'
  // [Context] [Harness] — one SerpAPI call, forced tool use, idempotent step

  const start = Date.now()
  const { toolResults } = await generateText({
    model: scoutModel,
    tools: { serpapi_search: serpApiTool },
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
  memory: AgentMemory | null
): Promise<ResearchReport> {
  'use step'
  // [Context] [Memory] — synthModel writes cited report from compressed fresh context

  const start = Date.now()
  const context = compressSerpResults(serpResults)
  const runCount = (memory?.runCount ?? 0) + 1
  const isDelta = runCount > 1

  const { text, usage } = await generateText({
    model: synthModel,
    system: `You are a research analyst. Write a clear, cited research report.

${
  isDelta
    ? `This is research run #${runCount}. Write a DELTA report — focus on what CHANGED since last time.
Start with "## What Changed Since Last Week" before the full report.`
    : `This is the first research run. Write a comprehensive overview report.`
}

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

Rules: Always cite sources inline. Be specific. No fluff. Max 600 words.`,
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
  }
}

async function saveMemoryStep(memory: AgentMemory): Promise<void> {
  'use step'
  // [Memory] [Harness] — idempotent Redis write; never throws
  const start = Date.now()
  await saveMemory(memory)
  console.log(
    `[beacon:step] saveMemory topic="${memory.topic}" urls=${memory.seenUrls.length} facts=${memory.keyFacts.length} ms=${Date.now() - start}`
  )
}
