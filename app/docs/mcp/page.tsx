import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsMcpPage() {
  return (
    <DocsShell
      eyebrow="MCP Guide"
      title="Connect Beacon to external AI clients over MCP."
      description="Beacon exposes an MCP transport route so external agents can delegate the research task into Beacon's workflow and memory system."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Transport" title="Current MCP surface">
        <CodeBlock>{`Transport route:
  /api/mcp/[...transport]

Current intent:
  let external agents trigger Beacon research
  keep retrieval and memory inside Beacon
  return run metadata instead of forcing all work into the client`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Authentication" title="How clients authenticate">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          MCP requests can authenticate with a Bearer token. Beacon validates the token against
          <code> BEACON_MCP_TOKEN</code>, or falls back to <code>BEACON_SESSION_TOKEN</code> if no dedicated MCP token
          is configured.
        </p>
      </DocsSection>

      <DocsSection eyebrow="Operational Notes" title="What to expect today">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Best for agent workflows" body="Use MCP when Claude Desktop, Cursor, or another client should ask Beacon to own the research loop." />
          <DocsCard title="Not a full public platform yet" body="Beacon's MCP surface is usable, but the broader packaging and reference docs are still being hardened." />
        </div>
      </DocsSection>
    </DocsShell>
  )
}
