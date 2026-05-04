import Link from 'next/link'
import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

const TOC = [
  { id: 'limits', label: 'Output Limits' },
  { id: 'sources', label: 'Source Reliability' },
  { id: 'high-stakes', label: 'High-Stakes Use' },
  { id: 'human-review', label: 'Human Review' },
]

export default function DisclaimerPage() {
  return (
    <DocsShell
      eyebrow="Disclaimer"
      title="Important limits on Beacon research output and AI-assisted reasoning."
      description="Effective May 4, 2026. Beacon is a research agent, not an authority system. This page states the core output, governance, and reliance limits that users should understand before treating any generated report as decision support."
      navItems={DOCS_NAV}
      tocItems={TOC}
      actions={
        <Link
          href="/terms"
          className="border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200 transition-colors hover:bg-cyan-400/[0.1]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Review terms
        </Link>
      }
    >
      <DocsSection id="limits" eyebrow="Output Limits" title="Research output can be incomplete, stale, or wrong">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Evidence-driven, not certainty-driven"
            body="Beacon synthesizes from retrieved search results, source snippets, stored memory, and model reasoning. That means its outputs depend on source quality, retrieval coverage, and model behavior rather than ground-truth certainty."
          />
          <DocsCard
            title="Model error remains possible"
            body="Beacon can misread, over-compress, or overstate source material. It can miss nuance, fail to surface contradictory evidence, or produce a confident summary that does not fully match the cited material."
          />
          <DocsCard
            title="Memory can preserve old framing"
            body="Because Beacon stores prior run context and reuses it in later runs, an early misunderstanding or skewed source mix can influence future research unless a user actively checks and corrects it."
          />
        </div>
      </DocsSection>

      <DocsSection id="sources" eyebrow="Sources" title="Source links help audit the output, but they do not eliminate risk">
        <DocsCard
          title="Source ledger is a review aid"
          body="Beacon is designed to show URLs, snippets, and report citations so a user can audit where claims came from. Those citations improve traceability, but they do not guarantee that the synthesis is complete or that the source itself is reliable."
        />
        <DocsCard
          title="Primary material should win"
          body="If the synthesized output conflicts with the linked source, the source should be treated as the stronger authority. Users should read original materials directly before relying on an important conclusion."
        />
      </DocsSection>

      <DocsSection id="high-stakes" eyebrow="High Stakes" title="Do not use Beacon as a sole basis for consequential decisions">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="No legal, medical, or financial reliance"
            body="Beacon output should not be treated as legal advice, medical advice, financial advice, compliance advice, or any other regulated professional determination."
          />
          <DocsCard
            title="No automated rights-impacting decisions"
            body="Beacon is not intended to make or recommend final decisions about employment, credit, insurance, housing, education, benefits, law enforcement, safety controls, or a person's legal rights without meaningful human review."
          />
          <DocsCard
            title="Sensitive-data caution"
            body="Users should avoid placing sensitive personal, regulated, or confidential information into Beacon unless they have confirmed that the specific deployment and governance posture is appropriate for that risk level."
          />
        </div>
      </DocsSection>

      <DocsSection id="human-review" eyebrow="Review" title="Human review is mandatory">
        <DocsCard
          title="Independent verification required"
          body="Users must independently verify material facts, check source quality, and apply domain judgment before using Beacon output in any business, legal, operational, or public-facing context."
        />
        <DocsCard
          title="Decision responsibility stays with the user"
          body="Beacon may help frame a question, reduce search time, or summarize source material, but it does not assume responsibility for downstream choices. Accountability for decisions remains with the person or organization using the output."
        />
      </DocsSection>
    </DocsShell>
  )
}
