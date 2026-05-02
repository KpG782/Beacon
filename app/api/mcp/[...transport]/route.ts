import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { loadMemory } from '@/lib/memory'
import { hydrateBriefRecord, hydrateBriefIndex } from '@/lib/brief-store'
import { rateLimit, LIMITS } from '@/lib/ratelimit'
import { FRAMEWORKS, FRAMEWORK_IDS } from '@/lib/frameworks'
import { NextRequest } from 'next/server'

// [Harness] Validate VERCEL_URL to prevent SSRF — must start with https:// or be localhost
function getBaseUrl(): string {
  const raw = process.env.VERCEL_URL ?? ''
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('http://localhost')) return raw
  return 'http://localhost:3000'
}

// [Context] Beacon MCP server — full agent-facing read/write surface
const handler = createMcpHandler((server) => {
  // ── Write path ─────────────────────────────────────────────────────────────

  server.tool(
    'research_brief',
    'Start a durable web research job. Beacon remembers previous runs and returns delta reports showing only what changed. Optionally apply a research framework to shape query strategy and output format — call list_frameworks to see available options.',
    {
      topic: z.string().describe('Research topic or question'),
      recurring: z.boolean().default(false).describe('Auto-rerun every 7 days'),
      frameworkId: z.string().optional().describe('Optional research framework ID. Call list_frameworks to see all options.'),
    },
    async ({ topic, recurring, frameworkId }) => {
      const validatedFrameworkId = frameworkId && FRAMEWORK_IDS.has(frameworkId) ? frameworkId : undefined
      const memory = await loadMemory(topic)
      const res = await fetch(`${getBaseUrl()}/api/briefs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, recurring, source: 'mcp', frameworkId: validatedFrameworkId }),
      })
      const { runId, runCount } = await res.json()
      return {
        content: [
          {
            type: 'text' as const,
            text: [
              `Research run #${runCount} started for: "${topic}"`,
              memory
                ? `Using memory from ${memory.runCount} previous runs (${memory.seenUrls.length} sources indexed)`
                : `Fresh run — no prior memory`,
              `Run ID: ${runId}`,
              `Live progress: ${getBaseUrl()}/briefs/${runId}`,
            ].join('\n'),
          },
        ],
      }
    }
  )

  // ── Read paths ──────────────────────────────────────────────────────────────

  server.tool(
    'get_topic_memory',
    'Get the durable memory state Beacon has for a topic — key facts, summary, run metadata. Use this to preload prior knowledge before your own reasoning.',
    {
      topic: z.string().describe('Research topic to look up'),
    },
    async ({ topic }) => {
      const memory = await loadMemory(topic)
      if (!memory) {
        return {
          content: [{
            type: 'text' as const,
            text: `No memory found for topic: "${topic}". Call research_brief first to build a knowledge base.`,
          }],
        }
      }
      const view = {
        topic: memory.topic,
        keyFacts: memory.keyFacts,
        reportSummary: memory.reportSummary,
        lastRunAt: memory.lastRunAt,
        runCount: memory.runCount,
        urlsIndexed: memory.seenUrls.length,
      }
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(view, null, 2),
        }],
      }
    }
  )

  server.tool(
    'get_topic_sources',
    'Get all source URLs Beacon has indexed for a topic across all runs. Use for auditability and source reuse.',
    {
      topic: z.string().describe('Research topic to get sources for'),
    },
    async ({ topic }) => {
      const memory = await loadMemory(topic)
      if (!memory) {
        return {
          content: [{
            type: 'text' as const,
            text: `No sources found for topic: "${topic}". Call research_brief first.`,
          }],
        }
      }
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            topic: memory.topic,
            totalSources: memory.seenUrls.length,
            lastUpdated: memory.lastRunAt,
            sources: memory.seenUrls,
          }, null, 2),
        }],
      }
    }
  )

  server.tool(
    'get_run_report',
    'Get the full research report for a completed run by run ID. Returns summary, full content, sources, and metadata.',
    {
      runId: z.string().describe('Run ID returned by research_brief or list_runs'),
    },
    async ({ runId }) => {
      const record = await hydrateBriefRecord(runId)
      if (!record) {
        return {
          content: [{
            type: 'text' as const,
            text: `No run found with ID: ${runId}`,
          }],
        }
      }
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            runId: record.runId,
            topic: record.topic,
            status: record.status,
            mode: record.hasMemory ? 'delta' : 'full',
            runCount: record.runCount,
            sourceCount: record.sources?.length ?? 0,
            startedAt: record.createdAt,
            completedAt: record.updatedAt,
            report: record.report ?? null,
            sources: record.sources ?? [],
          }, null, 2),
        }],
      }
    }
  )

  server.tool(
    'get_topic_delta',
    'Get what changed since the last research run for a topic. Returns delta summary and new sources. Ideal for "what changed since last week?" workflows.',
    {
      topic: z.string().describe('Research topic to get delta for'),
    },
    async ({ topic }) => {
      const allRuns = await hydrateBriefIndex()
      const topicRuns = allRuns
        .filter(r => r.topic === topic && r.status === 'complete')
        .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())

      if (topicRuns.length === 0) {
        return {
          content: [{
            type: 'text' as const,
            text: `No completed runs found for topic: "${topic}". Call research_brief first.`,
          }],
        }
      }

      const latest = topicRuns[0]
      const previous = topicRuns[1]

      // Extract the "What Changed" section from the delta report
      const report = latest.report ?? ''
      const deltaMatch = report.match(/##\s+What Changed[^\n]*\n([\s\S]*?)(?=\n##|$)/i)
      const summary = deltaMatch
        ? deltaMatch[1].trim()
        : latest.hasMemory
          ? 'Delta detected — see full report for details.'
          : 'First baseline run — no prior state to compare.'

      // Find sources added since previous run
      let changedSources: string[] = []
      if (previous?.sources) {
        const prevUrls = new Set(previous.sources.map((s) => s.url))
        changedSources = (latest.sources ?? [])
          .filter((s) => !prevUrls.has(s.url))
          .map((s) => s.url)
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            topic,
            currentRunId: latest.runId,
            previousRunId: previous?.runId,
            isDelta: latest.hasMemory,
            summary,
            newSourceCount: changedSources.length,
            changedSources,
            generatedAt: latest.updatedAt ?? latest.createdAt,
          }, null, 2),
        }],
      }
    }
  )

  server.tool(
    'list_frameworks',
    'List all available research frameworks with IDs, categories, and descriptions. Use a framework ID with research_brief to shape query strategy and report structure.',
    {},
    async () => {
      const summary = FRAMEWORKS.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
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

  server.tool(
    'list_runs',
    'List recent research runs. Optionally filter by topic. Returns run metadata for discovery, debugging, and audit.',
    {
      topic: z.string().optional().describe('Filter by topic — omit to list all recent runs'),
    },
    async ({ topic }) => {
      const allRuns = await hydrateBriefIndex()
      const filtered = topic
        ? allRuns.filter(r => r.topic === topic)
        : allRuns

      const records = filtered.slice(0, 20).map(r => ({
        runId: r.runId,
        topic: r.topic,
        status: r.status,
        mode: r.hasMemory ? 'delta' : 'full',
        runCount: r.runCount,
        source: r.source,
        recurring: r.recurring,
        startedAt: r.createdAt,
        completedAt: r.updatedAt,
      }))

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ total: records.length, runs: records }, null, 2),
        }],
      }
    }
  )
})

// Wrap handler with rate limiting — MCP can trigger research runs which cost money
async function rateLimitedHandler(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl  = await rateLimit(ip, 'mcp', LIMITS.mcp.limit, LIMITS.mcp.windowSecs)
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Max 15 MCP calls per hour.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) } }
    )
  }
  return handler(req)
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST }
