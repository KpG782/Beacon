import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt =
  'Beacon — Research that compounds over time. 3 parallel agents, persistent memory, delta reports. Vote for Beacon at the Vercel Zero to Agent Hackathon 2026.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 68px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Orange radial glow — top right (brand accent, not cyan) */}
        <div
          style={{
            position: 'absolute',
            top: -140,
            right: -140,
            width: 720,
            height: 720,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 65%)',
          }}
        />
        {/* Secondary warm glow — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* ── Top row: logo + hackathon badge ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          {/* Logo + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <svg width="42" height="42" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="5" fill="#1a0e05" />
              <path d="M 4 20 A 13 13 0 0 1 28 20" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <path d="M 8 20 A 9 9 0 0 1 24 20" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M 11.5 20 A 5.5 5.5 0 0 1 20.5 20" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="22" r="2.5" fill="#f97316" />
              <circle cx="16" cy="22" r="4.5" fill="#f97316" opacity="0.15" />
            </svg>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#e5e5e5',
                letterSpacing: '-0.5px',
                fontFamily: 'monospace',
              }}
            >
              BEACON
            </span>
          </div>

          {/* Hackathon badge — signals credibility and voting context */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: 6,
              padding: '9px 18px',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#f97316',
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: '#f97316',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
              }}
            >
              VERCEL ZERO TO AGENT HACKATHON 2026
            </span>
          </div>
        </div>

        {/* ── Main content ── */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            gap: 52,
            zIndex: 1,
            marginTop: 12,
          }}
        >
          {/* Left: headline + tagline + agent pills */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 22 }}>
            {/* Headline — large, scannable at thumbnail size */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-3px',
                  lineHeight: 1.0,
                  fontFamily: 'monospace',
                }}
              >
                Research that
              </div>
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 900,
                  color: '#f97316',
                  letterSpacing: '-3px',
                  lineHeight: 1.0,
                  fontFamily: 'monospace',
                }}
              >
                compounds.
              </div>
            </div>

            {/* Tagline — specific claims, not vague marketing */}
            <div
              style={{
                fontSize: 21,
                color: '#9ca3af',
                lineHeight: 1.5,
                fontFamily: 'monospace',
                maxWidth: 500,
              }}
            >
              3 parallel agents fan out, synthesize, and remember what they found — across every run.
            </div>

            {/* Agent track pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: '◐  Exploration', color: '#f97316' },
                { label: '⊞  Competitive', color: '#f97316' },
                { label: '◉  Signals', color: '#f97316' },
                { label: '▲  Delta Memory', color: '#22c55e' },
                { label: '⟳  Self-Healing', color: '#737373' },
              ].map(({ label, color }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 5,
                    padding: '8px 14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: terminal-style agent diagram */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: '26px 30px',
              minWidth: 292,
              fontFamily: 'monospace',
            }}
          >
            {[
              { text: 'loadMemory("topic")', color: '#4a4a4a' },
              { text: '  ↓', color: '#2e2e2e' },
              { text: 'planQueries()  →  12-15 q', color: '#737373' },
              { text: '  ↓  split across 3 tracks', color: '#2e2e2e' },
              { text: '┌──────────────────────┐', color: '#f97316' },
              { text: '│ ◐ explore            │', color: '#f97316' },
              { text: '│ ⊞ competitive        │', color: '#f97316' },
              { text: '│ ◉ signals            │', color: '#f97316' },
              { text: '└──────────────────────┘', color: '#f97316' },
              { text: '  ↓  parallel synthesis', color: '#2e2e2e' },
              { text: 'validateAndMerge() ✓', color: '#22c55e' },
              { text: '  ↓', color: '#2e2e2e' },
              { text: 'saveMemory()  sleep(7d)', color: '#4a4a4a' },
            ].map(({ text, color }, i) => (
              <div key={i} style={{ color, fontSize: 15, lineHeight: 1.25 }}>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom row: features + vote CTA ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', gap: 28 }}>
            {['MCP Server', 'Durable Workflows', 'Slack + GitHub', 'Upstash Redis'].map((f) => (
              <span
                key={f}
                style={{ fontSize: 12, color: '#3b3b3b', fontFamily: 'monospace' }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Vote CTA — explicit, orange, action-oriented */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#f97316',
              borderRadius: 6,
              padding: '12px 24px',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: '#0a0a0a',
                fontFamily: 'monospace',
                letterSpacing: '0.07em',
              }}
            >
              CAST YOUR VOTE
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#0a0a0a' }}>→</span>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #f97316 0%, rgba(249,115,22,0.08) 100%)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
