import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsApiPage() {
  return (
    <DocsShell
      eyebrow="API Reference"
      title="Use Beacon from your own app, scripts, or internal tooling."
      description="Beacon's current authenticated HTTP API is centered on creating research briefs and reading run state."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Endpoints" title="Current practical endpoints">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="POST /api/briefs" body="Create a private research run for the signed-in user account." />
          <DocsCard title="GET /api/briefs" body="List the current account's research runs with synced workflow status." />
          <DocsCard title="GET /api/briefs/[id]" body="Read one run if and only if it belongs to the current account." />
          <DocsCard title="GET /api/logs" body="Read account-scoped workflow and memory log entries." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Create A Brief" title="POST /api/briefs">
        <CodeBlock>{`Request body:
{
  "topic": "string, required",
  "objective": "string, optional",
  "focus": "string, optional",
  "source": "dashboard | slack | github | discord | mcp",
  "depth": "quick | deep",
  "timeframe": "7d | 30d | 90d | all",
  "reportStyle": "executive | bullet | memo | framework",
  "recurring": false,
  "frameworkId": "optional framework id",
  "userKeys": {
    "groqApiKey": "optional",
    "serpApiKey": "optional"
  }
}`}</CodeBlock>
        <CodeBlock>{`Response shape:
{
  "userId": "clerk user id",
  "runId": "workflow run id",
  "topic": "normalized topic",
  "status": "running",
  "source": "dashboard",
  "recurring": false,
  "runCount": 1,
  "hasMemory": false,
  "memoryFacts": 0,
  "createdAt": "ISO timestamp",
  "currentStep": "loadMemory",
  "frameworkId": "market-map"
}`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Constraints" title="Authentication and limits">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Auth required" body="The private briefs API is protected by Clerk auth and returns 401 when no user session exists." />
          <DocsCard title="Rate limited" body="Research creation is capped per IP because each run burns SerpAPI and model budget." />
        </div>
      </DocsSection>
    </DocsShell>
  )
}
