import { createMcpHandler } from 'mcp-handler'
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { loadMemory, listAllMemories, memoryKey } from '@/lib/memory'
import { hydrateBriefRecord, hydrateBriefIndex } from '@/lib/brief-store'
import { rateLimit, LIMITS } from '@/lib/ratelimit'
import { FRAMEWORKS, FRAMEWORK_IDS } from '@/lib/frameworks'
import { NextRequest } from 'next/server'

function getBaseUrl(): string {
  const raw = process.env.VERCEL_URL ?? ''
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('http://localhost')) return raw
  return 'http://localhost:3000'
}

// Rate limit keys: expensive ops share the research quota, reads are more generous
const READ_LIMIT  = { limit: 60,  windowSecs: 3600 }
const WRITE_LIMIT = { limit: 10,  windowSecs: 3600 }

async function rl(ip: string, action: string, expensive = false) {
  const cfg = expensive ? LIMITS.research : READ_LIMIT
  return rateLimit(ip, `mcp:${action}`, cfg.limit, cfg.windowSecs)
}

function rateLimitError(action: string, retryAfter: number) {
  return {
    content: [{
      type: 'text' as const,
      text: `Rate limit reached for ${action}. Retry in ${Math.ceil(retryAfter / 60)} minutes.`,
    }],
    isError: true,
  }
}

// ── MCP Server definition ───────────────────────────────────────────────────

const handler = createMcpHandler(
  (server) => {

    // ═══════════════════════════════════════════════════════════════════════
    // TOOLS — write path
    // ═══════════════════════════════════════════════════════════════════════

    server.tool(
      'research_brief',
      'Start a durable web research job on any topic. Beacon remembers all previous runs and returns delta reports showing only what changed since last time. Set recurring=true for autonomous weekly tracking.',
      {
        topic:        z.string().min(3).max(500).describe('Research topic or question'),
        objective:    z.string().max(300).optional().describe('What you want to learn — shapes query planning and synthesis angle'),
        focus:        z.string().max(300).optional().describe('Priority areas e.g. "pricing, launches, enterprise traction"'),
        depth:        z.enum(['quick', 'deep']).default('deep').describe('quick = 5-7 queries ~45s; deep = 8-10 queries ~90s'),
        timeframe:    z.enum(['7d', '30d', '90d', 'all']).default('30d').describe('Search recency filter'),
        reportStyle:  z.enum(['executive', 'bullet', 'memo', 'framework']).default('executive').describe('Output format'),
        recurring:    z.boolean().default(false).describe('Auto-rerun every 7 days — zero compute cost while sleeping'),
        frameworkId:  z.string().optional().describe('Research framework ID — call list_frameworks to see all options'),
      },
      async ({ topic, objective, focus, depth, timeframe, reportStyle, recurring, frameworkId }, extra) => {
        const ip = (extra as { _ip?: string })._ip ?? 'mcp'
        const check = await rl(ip, 'research_brief', true)
        if (!check.allowed) return rateLimitError('research_brief', check.retryAfter)

        const validFrameworkId = frameworkId && FRAMEWORK_IDS.has(frameworkId) ? frameworkId : undefined
        const memory = await loadMemory(topic)

        const res = await fetch(`${getBaseUrl()}/api/briefs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic, objective, focus, depth, timeframe, reportStyle,
            recurring, frameworkId: validFrameworkId, source: 'mcp',
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
          return {
            content: [{ type: 'text' as const, text: `Failed to start research: ${err.error ?? res.status}` }],
            isError: true,
          }
        }

        const { runId, runCount } = await res.json()
        const isDelta = !!memory
        const lines = [
          `✓ Research run #${runCount} started — "${topic}"`,
          isDelta
            ? `  Mode: DELTA — ${memory!.runCount} prior runs, ${memory!.seenUrls.length} URLs already indexed`
            : `  Mode: BASELINE — first run, building initial knowledge base`,
          `  Depth: ${depth} · Timeframe: ${timeframe} · Style: ${reportStyle}`,
          objective ? `  Objective: ${objective}` : '',
          focus     ? `  Focus: ${focus}` : '',
          validFrameworkId ? `  Framework: ${validFrameworkId}` : '',
          ``,
          `  Run ID: ${runId}`,
          `  Live progress: ${getBaseUrl()}/briefs/${runId}`,
          ``,
          `  Call get_run_status with runId="${runId}" to poll for completion.`,
        ].filter(l => l !== null).join('\n')

        return { content: [{ type: 'text' as const, text: lines }] }
      }
    )

    server.tool(
      'delete_topic_memory',
      'Delete all accumulated memory for a topic. The next research run will start fresh as if it were the first run. Use when a topic has changed significantly and prior knowledge is outdated.',
      {
        topic: z.string().describe('Research topic to reset'),
      },
      async ({ topic }, extra) => {
        const ip = (extra as { _ip?: string })._ip ?? 'mcp'
        const check = await rateLimit(ip, 'mcp:delete', WRITE_LIMIT.limit, WRITE_LIMIT.windowSecs)
        if (!check.allowed) return rateLimitError('delete_topic_memory', check.retryAfter)

        const url   = process.env.UPSTASH_REDIS_REST_URL
        const token = process.env.UPSTASH_REDIS_REST_TOKEN
        if (!url || !token) {
          return { content: [{ type: 'text' as const, text: 'Redis not configured' }], isError: true }
        }
        const key = memoryKey(topic)
        const res = await fetch(`${url}/del/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          return { content: [{ type: 'text' as const, text: `Failed to delete memory: HTTP ${res.status}` }], isError: true }
        }
        return {
          content: [{ type: 'text' as const, text: `Memory deleted for topic: "${topic}". Next research run will be a fresh baseline.` }],
        }
      }
    )

    // ═══════════════════════════════════════════════════════════════════════
    // TOOLS — read path
    // ═══════════════════════════════════════════════════════════════════════

    server.tool(
      'get_run_status',
      'Poll the status of a research run. Returns status (running/complete/failed), current step, and report when ready. Call every 10-15 seconds until status is "complete".',
      {
        runId: z.string().describe('Run ID returned by research_brief'),
      },
      async ({ runId }) => {
        const record = await hydrateBriefRecord(runId)
        if (!record) {
          return { content: [{ type: 'text' as const, text: `No run found with ID: ${runId}` }], isError: true }
        }
        const lines = [
          `Status: ${record.status.toUpperCase()}`,
          record.currentStep ? `Current step: ${record.currentStep}` : '',
          `Topic: ${record.topic}`,
          `Run #${record.runCount} · Mode: ${record.hasMemory ? 'delta' : 'baseline'}`,
          record.status === 'complete' ? `Sources: ${record.sources?.length ?? 0} · New: ${record.deltaUrls?.length ?? 0}` : '',
          record.status === 'complete' ? `\nReport ready — call get_run_report with runId="${runId}"` : '',
          record.status === 'failed'   ? `Error: ${record.error}` : '',
          record.status === 'running'  ? `Still executing — poll again in 10-15 seconds` : '',
        ].filter(Boolean).join('\n')
        return { content: [{ type: 'text' as const, text: lines }] }
      }
    )

    server.tool(
      'get_run_report',
      'Get the full research report for a completed run. Returns the synthesized report, all sources with new/known distinction, and query plan.',
      {
        runId: z.string().describe('Run ID returned by research_brief or list_runs'),
      },
      async ({ runId }) => {
        const record = await hydrateBriefRecord(runId)
        if (!record) {
          return { content: [{ type: 'text' as const, text: `No run found with ID: ${runId}` }], isError: true }
        }
        if (record.status !== 'complete') {
          return { content: [{ type: 'text' as const, text: `Run is not yet complete (status: ${record.status}). Call get_run_status to poll.` }] }
        }
        const deltaSet = new Set(record.deltaUrls ?? [])
        const newSources   = (record.sources ?? []).filter(s => deltaSet.has(s.url))
        const knownSources = (record.sources ?? []).filter(s => !deltaSet.has(s.url))
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              runId:       record.runId,
              topic:       record.topic,
              mode:        record.hasMemory ? 'delta' : 'baseline',
              runCount:    record.runCount,
              completedAt: record.updatedAt,
              queryPlan:   record.queryPlan ?? null,
              report:      record.report ?? null,
              newSources,
              knownSources,
            }, null, 2),
          }],
        }
      }
    )

    server.tool(
      'get_topic_memory',
      'Get the full durable memory state for a topic — key facts with sources, run history, and summary. Use to preload prior Beacon knowledge before your own reasoning.',
      {
        topic: z.string().describe('Research topic to look up'),
      },
      async ({ topic }) => {
        const memory = await loadMemory(topic)
        if (!memory) {
          return {
            content: [{
              type: 'text' as const,
              text: `No memory for "${topic}". Call research_brief first to build a knowledge base.`,
            }],
          }
        }
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              topic:         memory.topic,
              runCount:      memory.runCount,
              lastRunAt:     memory.lastRunAt,
              urlsIndexed:   memory.seenUrls.length,
              reportSummary: memory.reportSummary,
              keyFacts:      memory.keyFacts,
              factSources:   memory.factSources ?? [],
              runHistory:    memory.runs ?? [],
            }, null, 2),
          }],
        }
      }
    )

    server.tool(
      'get_topic_sources',
      'Get all source URLs Beacon has indexed for a topic across all runs. Useful for audit, deduplication, and understanding research breadth.',
      {
        topic: z.string().describe('Research topic to get sources for'),
      },
      async ({ topic }) => {
        const memory = await loadMemory(topic)
        if (!memory) {
          return { content: [{ type: 'text' as const, text: `No sources for "${topic}". Call research_brief first.` }] }
        }
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              topic:       memory.topic,
              totalSources: memory.seenUrls.length,
              lastUpdated: memory.lastRunAt,
              sources:     memory.seenUrls,
            }, null, 2),
          }],
        }
      }
    )

    server.tool(
      'get_topic_delta',
      'Get what changed since the last research run for a topic — delta summary, new source count, and changed sources. Ideal for "what changed since last week?" workflows.',
      {
        topic: z.string().describe('Research topic to get delta for'),
      },
      async ({ topic }) => {
        const allRuns = await hydrateBriefIndex()
        const topicRuns = allRuns
          .filter(r => r.topic === topic && r.status === 'complete')
          .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())

        if (topicRuns.length === 0) {
          return { content: [{ type: 'text' as const, text: `No completed runs for "${topic}". Call research_brief first.` }] }
        }

        const latest   = topicRuns[0]
        const previous = topicRuns[1]
        const deltaUrls = latest.deltaUrls ?? []
        const report = latest.report ?? ''
        const deltaMatch = report.match(/##\s+What Changed[^\n]*\n([\s\S]*?)(?=\n##|$)/i)
        const summary = deltaMatch
          ? deltaMatch[1].trim()
          : latest.hasMemory ? 'Delta detected — see full report for details.' : 'First baseline run.'

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              topic,
              currentRunId:   latest.runId,
              previousRunId:  previous?.runId,
              isDelta:        latest.hasMemory,
              summary,
              newSourceCount: deltaUrls.length,
              newSources:     deltaUrls,
              generatedAt:    latest.updatedAt ?? latest.createdAt,
            }, null, 2),
          }],
        }
      }
    )

    server.tool(
      'search_memory',
      'Search across all of Beacon\'s stored topic memories for a keyword or concept. Returns matching topics with relevant facts. Useful for "what does Beacon know about X?" across all research.',
      {
        query: z.string().min(2).describe('Keyword or phrase to search for across all stored memories'),
        limit: z.number().min(1).max(20).default(10).describe('Max number of matching topics to return'),
      },
      async ({ query, limit }) => {
        const memories = await listAllMemories()
        const q = query.toLowerCase()
        const matches = memories
          .map((m) => {
            const matchingFacts = m.keyFacts.filter(f => f.toLowerCase().includes(q))
            const topicMatch    = m.topic.toLowerCase().includes(q)
            const summaryMatch  = m.reportSummary.toLowerCase().includes(q)
            if (!topicMatch && !summaryMatch && matchingFacts.length === 0) return null
            return {
              topic:         m.topic,
              runCount:      m.runCount,
              lastRunAt:     m.lastRunAt,
              urlsIndexed:   m.seenUrls.length,
              matchingFacts,
              relevance: topicMatch ? 2 : matchingFacts.length,
            }
          })
          .filter((m): m is NonNullable<typeof m> => m !== null)
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, limit)

        if (matches.length === 0) {
          return { content: [{ type: 'text' as const, text: `No memories found matching "${query}". Try research_brief to build a knowledge base on this topic.` }] }
        }

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ query, totalMatches: matches.length, matches }, null, 2),
          }],
        }
      }
    )

    server.tool(
      'compare_topics',
      'Compare two topics side-by-side using Beacon\'s accumulated memory. Returns key facts from both, source count comparison, and recency. Useful for competitive analysis and market comparison.',
      {
        topicA: z.string().describe('First topic to compare'),
        topicB: z.string().describe('Second topic to compare'),
      },
      async ({ topicA, topicB }) => {
        const [memA, memB] = await Promise.all([loadMemory(topicA), loadMemory(topicB)])

        if (!memA && !memB) {
          return { content: [{ type: 'text' as const, text: `No memory found for either topic. Call research_brief for both first.` }] }
        }

        const formatSide = (topic: string, mem: typeof memA) =>
          mem
            ? { topic, runCount: mem.runCount, lastRunAt: mem.lastRunAt, urlsIndexed: mem.seenUrls.length, keyFacts: mem.keyFacts, summary: mem.reportSummary }
            : { topic, runCount: 0, lastRunAt: null, urlsIndexed: 0, keyFacts: [], summary: 'No data — run research_brief to populate.' }

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              comparison: [formatSide(topicA, memA), formatSide(topicB, memB)],
              note: 'Key facts are extracted from Beacon\'s synthesized reports. For source-level comparison use get_topic_sources.',
            }, null, 2),
          }],
        }
      }
    )

    server.tool(
      'export_topic',
      'Export the full knowledge base for a topic as structured markdown — summary, key facts with sources, run history, and source ledger. Ready to paste into a doc or another AI context.',
      {
        topic: z.string().describe('Research topic to export'),
      },
      async ({ topic }) => {
        const memory = await loadMemory(topic)
        if (!memory) {
          return { content: [{ type: 'text' as const, text: `No memory for "${topic}". Call research_brief first.` }] }
        }

        const factLines = memory.keyFacts.map((f, i) => {
          const src = memory.factSources?.[i]
          return src ? `- ${f}\n  Source: ${src}` : `- ${f}`
        }).join('\n')

        const runLines = (memory.runs ?? [])
          .slice(-5)
          .map(r => `- Run ${r.runCount}: ${new Date(r.runAt).toLocaleDateString()} — +${r.urlsAdded} URLs, +${r.factsAdded} facts`)
          .join('\n')

        const md = [
          `# Beacon Research Export: ${memory.topic}`,
          ``,
          `**Last updated:** ${new Date(memory.lastRunAt).toLocaleDateString()}`,
          `**Total runs:** ${memory.runCount}`,
          `**Sources indexed:** ${memory.seenUrls.length}`,
          ``,
          `## Summary`,
          memory.reportSummary,
          ``,
          `## Key Facts`,
          factLines || '_No facts extracted yet._',
          ``,
          runLines ? `## Run History (last 5)\n${runLines}` : '',
          ``,
          `## Source Ledger`,
          memory.seenUrls.slice(0, 50).map(u => `- ${u}`).join('\n'),
          memory.seenUrls.length > 50 ? `\n_...and ${memory.seenUrls.length - 50} more_` : '',
        ].filter(l => l !== null).join('\n').trim()

        return { content: [{ type: 'text' as const, text: md }] }
      }
    )

    server.tool(
      'list_runs',
      'List recent research runs. Filter by topic to see all runs for a specific subject. Returns metadata for discovery, debugging, and audit.',
      {
        topic: z.string().optional().describe('Filter by topic — omit to list all recent runs'),
        limit: z.number().min(1).max(50).default(20).describe('Max runs to return'),
      },
      async ({ topic, limit }) => {
        const allRuns = await hydrateBriefIndex()
        const filtered = topic
          ? allRuns.filter(r => r.topic.toLowerCase().includes(topic.toLowerCase()))
          : allRuns

        const records = filtered.slice(0, limit).map(r => ({
          runId:       r.runId,
          topic:       r.topic,
          status:      r.status,
          mode:        r.hasMemory ? 'delta' : 'baseline',
          runCount:    r.runCount,
          source:      r.source,
          recurring:   r.recurring,
          framework:   r.frameworkId ?? null,
          startedAt:   r.createdAt,
          completedAt: r.updatedAt ?? null,
        }))

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ total: records.length, runs: records }, null, 2),
          }],
        }
      }
    )

    server.tool(
      'list_frameworks',
      'List all research frameworks Beacon can apply — RICE, Jobs-to-be-Done, Porter\'s Five Forces, and 50+ more. Use a framework ID with research_brief to structure query strategy and report format.',
      {},
      async () => {
        const summary = FRAMEWORKS.map(f => ({
          id:          f.id,
          name:        f.name,
          category:    f.category,
          description: f.description,
        }))
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ total: summary.length, frameworks: summary }, null, 2),
          }],
        }
      }
    )

    // ═══════════════════════════════════════════════════════════════════════
    // RESOURCES — structured data clients can browse
    // ═══════════════════════════════════════════════════════════════════════

    // All topics list (static URI)
    server.resource(
      'topics',
      'beacon://topics',
      { description: 'All research topics with stored memory in Beacon', mimeType: 'application/json' },
      async () => {
        const memories = await listAllMemories()
        const topics = memories.map(m => ({
          topic:       m.topic,
          runCount:    m.runCount,
          lastRunAt:   m.lastRunAt,
          urlsIndexed: m.seenUrls.length,
          factsStored: m.keyFacts.length,
          uri:         `beacon://topics/${encodeURIComponent(m.topic)}/memory`,
        }))
        return {
          contents: [{
            uri:      'beacon://topics',
            text:     JSON.stringify({ total: topics.length, topics }, null, 2),
            mimeType: 'application/json',
          }],
        }
      }
    )

    // Per-topic memory resource (URI template)
    server.resource(
      'topic-memory',
      new ResourceTemplate('beacon://topics/{topic}/memory', {
        list: async () => {
          const memories = await listAllMemories()
          return {
            resources: memories.map(m => ({
              uri:         `beacon://topics/${encodeURIComponent(m.topic)}/memory`,
              name:        m.topic,
              description: `${m.runCount} runs · ${m.seenUrls.length} sources · ${m.keyFacts.length} facts`,
              mimeType:    'application/json',
            })),
          }
        },
      }),
      { description: 'Full memory state for a research topic' },
      async (uri, vars) => {
        const decoded = decodeURIComponent(Array.isArray(vars.topic) ? vars.topic[0] : vars.topic)
        const memory  = await loadMemory(decoded)
        if (!memory) {
          return {
            contents: [{
              uri:  uri.href,
              text: JSON.stringify({ error: `No memory found for topic: "${decoded}"` }),
              mimeType: 'application/json',
            }],
          }
        }
        return {
          contents: [{
            uri:      uri.href,
            text:     JSON.stringify(memory, null, 2),
            mimeType: 'application/json',
          }],
        }
      }
    )

    // Per-run report resource (URI template)
    server.resource(
      'run-report',
      new ResourceTemplate('beacon://runs/{runId}/report', { list: undefined }),
      { description: 'Full synthesized report for a completed research run' },
      async (uri, vars) => {
        const runId  = Array.isArray(vars.runId) ? vars.runId[0] : vars.runId
        const record = await hydrateBriefRecord(runId)
        if (!record) {
          return {
            contents: [{
              uri:  uri.href,
              text: JSON.stringify({ error: `No run found: ${runId}` }),
              mimeType: 'application/json',
            }],
          }
        }
        return {
          contents: [{
            uri:      uri.href,
            text:     JSON.stringify({
              runId:    record.runId,
              topic:    record.topic,
              status:   record.status,
              report:   record.report ?? null,
              sources:  record.sources ?? [],
              queryPlan: record.queryPlan ?? null,
            }, null, 2),
            mimeType: 'application/json',
          }],
        }
      }
    )

    // ═══════════════════════════════════════════════════════════════════════
    // PROMPTS — reusable prompt templates for common Beacon workflows
    // ═══════════════════════════════════════════════════════════════════════

    server.prompt(
      'research_briefing',
      'Generate a structured research prompt for a topic, injecting everything Beacon already knows so the AI can reason from existing context before starting new research.',
      {
        topic:     z.string().describe('Topic to generate a briefing for'),
        question:  z.string().optional().describe('Specific question to focus the briefing on'),
      },
      async ({ topic, question }) => {
        const memory = await loadMemory(topic)
        const priorContext = memory
          ? [
              `Beacon has researched this topic ${memory.runCount} times.`,
              `Last updated: ${new Date(memory.lastRunAt).toLocaleDateString()}.`,
              `${memory.seenUrls.length} sources indexed. ${memory.keyFacts.length} key facts stored.`,
              ``,
              `Key facts Beacon has established:`,
              ...memory.keyFacts.map((f, i) => `${i + 1}. ${f}`),
              ``,
              `Prior summary:`,
              memory.reportSummary,
            ].join('\n')
          : `Beacon has no prior memory for "${topic}". This will be a baseline research run.`

        const prompt = [
          `You are a research analyst. Here is everything known about the topic:`,
          ``,
          `TOPIC: ${topic}`,
          question ? `FOCUS QUESTION: ${question}` : '',
          ``,
          `=== BEACON PRIOR KNOWLEDGE ===`,
          priorContext,
          `=== END PRIOR KNOWLEDGE ===`,
          ``,
          `Based on this context, ${question ? `answer: "${question}"` : 'provide a synthesis of current understanding and identify what is still uncertain or worth investigating next.'}`,
          ``,
          `If you need fresher information, call research_brief with topic="${topic}" to trigger a new delta research run.`,
        ].filter(Boolean).join('\n')

        return {
          messages: [{
            role: 'user' as const,
            content: { type: 'text' as const, text: prompt },
          }],
        }
      }
    )

    server.prompt(
      'competitive_analysis',
      'Generate a competitive analysis prompt comparing two or more topics using Beacon\'s accumulated research memory.',
      {
        topics:    z.string().describe('Comma-separated list of topics/companies to compare'),
        dimension: z.string().optional().describe('Specific dimension to compare e.g. "pricing", "product strategy", "market position"'),
      },
      async ({ topics, dimension }) => {
        const topicList = topics.split(',').map(t => t.trim()).filter(Boolean)
        const memories  = await Promise.all(topicList.map(t => loadMemory(t)))

        const sides = topicList.map((topic, i) => {
          const mem = memories[i]
          if (!mem) return `### ${topic}\nNo Beacon memory yet. Run research_brief("${topic}") to populate.`
          return [
            `### ${topic}`,
            `Researched ${mem.runCount}× · ${mem.seenUrls.length} sources · Last: ${new Date(mem.lastRunAt).toLocaleDateString()}`,
            ``,
            `Key facts:`,
            mem.keyFacts.map((f, j) => `${j + 1}. ${f}`).join('\n'),
          ].join('\n')
        }).join('\n\n')

        const prompt = [
          `You are a senior analyst producing a competitive analysis.`,
          ``,
          `TOPICS UNDER COMPARISON: ${topicList.join(' vs ')}`,
          dimension ? `ANALYSIS DIMENSION: ${dimension}` : 'ANALYSIS DIMENSION: Overall competitive landscape',
          ``,
          `=== BEACON RESEARCH CONTEXT ===`,
          sides,
          `=== END CONTEXT ===`,
          ``,
          `Produce a structured competitive analysis covering:`,
          `1. Key differentiators`,
          `2. Relative strengths and weaknesses`,
          `3. Market positioning`,
          dimension ? `4. Specific comparison on: ${dimension}` : `4. Which topic is currently strongest and why`,
          ``,
          `Base your analysis only on the Beacon facts above. Flag where data gaps exist.`,
        ].filter(Boolean).join('\n')

        return {
          messages: [{
            role: 'user' as const,
            content: { type: 'text' as const, text: prompt },
          }],
        }
      }
    )

    server.prompt(
      'weekly_intelligence',
      'Generate a weekly intelligence briefing prompt from all of Beacon\'s stored memories — surfaces what changed across all tracked topics.',
      {},
      async () => {
        const memories = await listAllMemories()
        const recentMemories = memories
          .filter(m => {
            const age = Date.now() - new Date(m.lastRunAt).getTime()
            return age < 14 * 24 * 60 * 60 * 1000 // updated in last 14 days
          })
          .sort((a, b) => new Date(b.lastRunAt).getTime() - new Date(a.lastRunAt).getTime())
          .slice(0, 10)

        if (recentMemories.length === 0) {
          return {
            messages: [{
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: `No Beacon memories have been updated in the last 14 days. Start tracking topics with research_brief to generate weekly intelligence.`,
              },
            }],
          }
        }

        const context = recentMemories.map(m => [
          `### ${m.topic}`,
          `Last run: ${new Date(m.lastRunAt).toLocaleDateString()} · Run #${m.runCount} · ${m.seenUrls.length} sources`,
          m.keyFacts.slice(0, 5).map((f, i) => `${i + 1}. ${f}`).join('\n'),
        ].join('\n')).join('\n\n')

        const prompt = [
          `You are an intelligence analyst writing a weekly briefing.`,
          ``,
          `The following topics have been automatically researched by Beacon in the last 14 days:`,
          ``,
          context,
          ``,
          `Write a structured weekly intelligence briefing that:`,
          `1. Opens with a 2-sentence executive summary of the week's most important developments`,
          `2. Covers each topic with: what changed, why it matters, and what to watch`,
          `3. Closes with cross-topic patterns and strategic implications`,
          ``,
          `Use crisp, analyst-style prose. Each topic section should be 3-5 sentences.`,
        ].join('\n')

        return {
          messages: [{
            role: 'user' as const,
            content: { type: 'text' as const, text: prompt },
          }],
        }
      }
    )
  },
  {
    serverInfo: { name: 'Beacon Research Agent', version: '2.0.0' },
  }
)

// ── Rate-limited handler wrapper ─────────────────────────────────────────────

async function rateLimitedHandler(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl  = await rateLimit(ip, 'mcp', LIMITS.mcp.limit, LIMITS.mcp.windowSecs)
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: `MCP rate limit exceeded. Max ${LIMITS.mcp.limit} calls per hour.` }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) } }
    )
  }
  return handler(req)
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST }
