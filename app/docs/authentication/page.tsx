import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsAuthenticationPage() {
  return (
    <DocsShell
      eyebrow="Authentication"
      title="Beacon authentication and account privacy."
      description="Beacon now scopes research data per account so one user cannot read another user's briefs, memory, or logs from the app."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="User Auth" title="Web app authentication">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Clerk-backed accounts" body="Sign-in and sign-up are handled through Clerk routes and themed Beacon auth pages." />
          <DocsCard title="Public routes" body="Landing, docs, support, trial, and legal pages are public; private data routes stay protected." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Privacy" title="How Beacon isolates user data">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Brief records, run logs, and memory are scoped by Clerk user ID for authenticated users. Trial runs are scoped
          separately by a browser session cookie and IP allowance. This prevents a new signed-in user from seeing prior
          users&apos; research data through the web app.
        </p>
        <CodeBlock>{`Account-scoped surfaces:
  /api/briefs
  /api/briefs/[id]
  /api/logs
  /api/memory
  /api/memory/[slug]
  /api/memory/check

Trial-scoped surfaces:
  /api/trial
  /api/trial/[id]`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Current Boundary" title="Important current caveat">
        <DocsCard
          title="Non-web agent channels"
          body="Slack or other chat-bot style flows still need a dedicated identity mapping pass if you want the same strict per-user privacy outside the signed-in web app."
        />
      </DocsSection>
    </DocsShell>
  )
}
