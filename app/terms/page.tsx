import Link from 'next/link'
import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

const TOC = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'use', label: 'Permitted Use' },
  { id: 'user-duties', label: 'User Duties' },
  { id: 'ai-output', label: 'AI Output Limits' },
  { id: 'service', label: 'Availability' },
  { id: 'liability', label: 'Liability' },
]

export default function TermsPage() {
  return (
    <DocsShell
      eyebrow="Terms of Service"
      title="Operating terms for Beacon's current product surface."
      description="Effective May 4, 2026. These terms are written to match the current Beacon implementation and its real operational limits. They are stronger than the prior placeholder, but they should still be reviewed by counsel before broader production or enterprise use."
      navItems={DOCS_NAV}
      tocItems={TOC}
      actions={
        <Link
          href="/privacy"
          className="border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200 transition-colors hover:bg-cyan-400/[0.1]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Review privacy policy
        </Link>
      }
    >
      <DocsSection id="acceptance" eyebrow="Acceptance" title="Using Beacon means you accept these terms">
        <DocsCard
          title="Agreement to terms"
          body="By accessing or using Beacon, you agree to these Terms of Service and the related Privacy Policy and Disclaimer. If you use Beacon on behalf of a company or team, you represent that you have authority to bind that organization to these terms."
        />
        <DocsCard
          title="Current maturity"
          body="Beacon is an evolving AI research product. Features, limits, integrations, retention behavior, and security controls may change as the product matures. Continued use after changes means you accept the updated terms unless a different notice requirement applies by law."
        />
      </DocsSection>

      <DocsSection id="use" eyebrow="Use" title="Permitted and prohibited use">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Permitted use"
            body="Beacon may be used for research, synthesis, monitoring, analyst workflows, and internal decision support, provided the user has the right to submit the input data and independently reviews the resulting output."
          />
          <DocsCard
            title="No unlawful or abusive use"
            body="You may not use Beacon to violate law, infringe rights, evade safeguards, disrupt the service, scrape or probe the infrastructure without authorization, or submit material that you do not have the right to process."
          />
          <DocsCard
            title="No regulated-decision outsourcing"
            body="You may not use Beacon as the sole basis for automated or quasi-automated decisions involving employment, credit, insurance, housing, education, medical treatment, legal rights, safety outcomes, or other similarly high-risk determinations."
          />
          <DocsCard
            title="No unsupported sensitive data use"
            body="Do not submit special-category personal data, health records, government IDs, biometric data, highly confidential material, or regulated client matter data unless you have explicit approval and a deployment posture that is actually designed for that use."
          />
        </div>
      </DocsSection>

      <DocsSection id="user-duties" eyebrow="Responsibility" title="What users are responsible for">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Input responsibility"
            body="You are responsible for the topics, prompts, source material references, and credentials you submit. That includes making sure you have a lawful basis and any needed permissions to process personal or confidential data through Beacon."
          />
          <DocsCard
            title="Account and key security"
            body="You are responsible for protecting your account access, saved provider keys, and connected integrations. Notify the operator if you believe your account, session, or API credentials have been exposed."
          />
          <DocsCard
            title="Verification duty"
            body="You are responsible for reviewing reports, checking source quality, and validating conclusions before using them in any consequential workflow. Beacon reduces research effort; it does not transfer judgment or accountability away from the user."
          />
          <DocsCard
            title="Third-party terms"
            body="Use of Beacon may also depend on third-party services such as Clerk, Upstash, Groq, SerpAPI, Vercel, Slack, GitHub, or Discord. You are responsible for complying with any third-party terms that apply to your use of those connected services."
          />
        </div>
      </DocsSection>

      <DocsSection id="ai-output" eyebrow="AI Limits" title="Beacon output is assistive, not guaranteed">
        <DocsCard
          title="No warranty of correctness"
          body="Beacon output may be incomplete, outdated, biased, misleading, or wrong. Search results can omit relevant sources, retrieved snippets can lack context, and model-generated summaries can reflect reasoning errors or source inaccuracies."
        />
        <DocsCard
          title="No professional advice"
          body="Beacon does not provide legal, medical, financial, accounting, employment, compliance, or other regulated professional advice. Any content that touches those subjects is informational only and must be independently reviewed by a qualified person."
        />
        <DocsCard
          title="Source-first interpretation"
          body="Where Beacon provides URLs, snippets, or source ledgers, those materials should be treated as the primary audit trail. If the synthesized narrative and the cited source conflict, the user should trust the source and not the model summary."
        />
      </DocsSection>

      <DocsSection id="service" eyebrow="Availability" title="Service availability and operator controls">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="No uptime guarantee"
            body="Beacon is provided on an as-available basis. The operator does not guarantee uninterrupted operation, permanent feature stability, or that workflow runs, memory retention, chat integrations, or API surfaces will always remain available."
          />
          <DocsCard
            title="Suspension and limits"
            body="The operator may suspend, rate-limit, disable, or remove access where reasonably necessary for security, legal compliance, abuse prevention, infrastructure protection, or product maintenance."
          />
          <DocsCard
            title="Changes to the service"
            body="The operator may add, remove, or modify features, model providers, retention behavior, authentication rules, or integrations at any time, especially where required for security, cost control, or legal compliance."
          />
        </div>
      </DocsSection>

      <DocsSection id="liability" eyebrow="Risk Allocation" title="Warranty disclaimer and liability limits">
        <DocsCard
          title="Warranty disclaimer"
          body="To the maximum extent permitted by law, Beacon is provided on an 'as is' and 'as available' basis, without warranties of accuracy, merchantability, fitness for a particular purpose, non-infringement, or uninterrupted availability."
        />
        <DocsCard
          title="Limitation of liability"
          body="To the maximum extent permitted by law, the operator will not be liable for indirect, incidental, special, consequential, exemplary, or similar damages, or for loss of profits, business, goodwill, data, or decision quality arising from use of Beacon or reliance on its outputs."
        />
        <DocsCard
          title="Practical reading of these terms"
          body="These terms are intended to make the product's legal posture materially more credible for review today, not to replace a full enterprise contracting package. If Beacon is going to be sold, deployed in regulated settings, or used on sensitive workloads, further contractual and governance work is still required."
        />
      </DocsSection>
    </DocsShell>
  )
}
