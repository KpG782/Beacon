import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { loadMemory } from '@/lib/memory'

// [Context] Beacon exposed as an MCP server — Claude Desktop / Cursor can call research_brief
const handler = createMcpHandler((server) => {
  server.tool(
    'research_brief',
    'Run a deep web research job. Beacon remembers previous runs and returns delta reports.',
    {
      topic: z.string().describe('Research topic or question'),
      recurring: z.boolean().default(false),
    },
    async ({ topic, recurring }) => {
      const memory = await loadMemory(topic)
      const res = await fetch(`${process.env.VERCEL_URL}/api/briefs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, recurring, source: 'mcp' }),
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
              `Live progress: ${process.env.VERCEL_URL}/briefs/${runId}`,
            ].join('\n'),
          },
        ],
      }
    }
  )
})

// mcp-handler returns (req) => Response — export as both GET and POST
export { handler as GET, handler as POST }
