# Beacon — AI Research Agent Skill

Beacon is a durable web research agent with persistent cross-session memory. It fans out SerpAPI queries, synthesizes delta reports (only what changed since last run), and compounds intelligence across weekly runs.

## Surfaces

| Surface | Where |
|---|---|
| REST API | `POST /api/briefs` |
| MCP Server | `/api/mcp` (SSE or HTTP transport) |
| Dashboard | `/dashboard` |
| Trial (no login) | `/trial` |

## Core Actions

### Start a research run
```bash
curl -X POST $BEACON_URL/api/briefs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BEACON_DEMO_KEY" \
  -d '{
    "topic": "AI browser agents",
    "objective": "Track new players and pricing changes",
    "depth": "deep",
    "timeframe": "30d",
    "reportStyle": "executive"
  }'
# Returns: { runId, status, hasMemory, runCount }
```

### Poll run status
```bash
curl $BEACON_URL/api/briefs/$RUN_ID \
  -H "Authorization: Bearer $BEACON_DEMO_KEY"
# Returns: { status: "running"|"complete"|"failed", currentStep, report? }
```

### Read the report (when status = "complete")
```bash
curl $BEACON_URL/api/briefs/$RUN_ID \
  -H "Authorization: Bearer $BEACON_DEMO_KEY"
# report.summary, report.delta, report.sources[]
```

### Check topic memory
```bash
curl "$BEACON_URL/api/memory/check?topic=AI+browser+agents" \
  -H "Authorization: Bearer $BEACON_DEMO_KEY"
# Returns: { runCount, urlsIndexed, factsStored, lastRunAt } or null (first run)
```

## Key Parameters

| Field | Type | Default | Notes |
|---|---|---|---|
| `topic` | string | required | Research topic, max 500 chars |
| `objective` | string | optional | What to learn / what angle to take |
| `focus` | string | optional | Comma-separated priority areas |
| `depth` | `"quick"\|"deep"` | `"deep"` | Quick ≈45s, Deep ≈90s |
| `timeframe` | `"7d"\|"30d"\|"90d"\|"all"` | `"30d"` | Restricts search date range |
| `reportStyle` | `"executive"\|"bullet"\|"memo"\|"framework"` | `"executive"` | Output format |
| `recurring` | boolean | `false` | Sleeps 7 days then reruns automatically |

## MCP Usage (Claude Desktop / Cursor)

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "beacon": {
      "command": "npx",
      "args": ["mcp-remote", "https://your-beacon-url.vercel.app/api/mcp/sse"]
    }
  }
}
```

### Available MCP Tools

- `research_brief` — Start a research run
- `get_run_status` — Poll run progress
- `get_run_report` — Fetch completed report
- `get_topic_memory` — Load all accumulated knowledge on a topic
- `get_topic_delta` — What changed since last run
- `compare_topics` — Side-by-side analysis of two topics
- `search_memory` — Cross-topic keyword search
- `list_frameworks` — Show all 50+ research frameworks
- `export_topic` — Download topic knowledge as markdown

## How Memory Works

- **Run 1:** Beacon builds a baseline — sources, facts, URL ledger
- **Run 2+:** Beacon skips already-read URLs, surfaces only new developments
- Memory persists 30 days per topic in encrypted Redis
- Delta reports show only what changed since last run

## Research Frameworks (50+)

Pass `frameworkId` to apply a structured lens:
- `porter-five-forces`, `rice`, `jobs-to-be-done`, `ansoff-matrix`
- `kano-model`, `value-chain`, `blue-ocean`, `pestle`
- Full list via MCP tool: `list_frameworks`

## Environment Variables Needed

```
BEACON_DEMO_KEY=beacon_demo_...   # Public demo key (limited uses)
BEACON_URL=https://your-url.vercel.app
```

## Rate Limits

| Action | Limit |
|---|---|
| Research runs | 5 per hour per IP |
| MCP calls | 120 per hour |
| Demo key | 3 per IP per day |
