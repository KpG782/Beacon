import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Beacon — Autonomous research agent with persistent memory'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#131314',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px 80px 72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,219,233,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Grid lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,219,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,219,233,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Beacon icon — concentric arcs */}
        <div style={{ display: 'flex', marginBottom: 36 }}>
          <svg width="80" height="80" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#131314"/>
            <path d="M 4 20 A 13 13 0 0 1 28 20" stroke="#00dbe9" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
            <path d="M 8 20 A 9 9 0 0 1 24 20" stroke="#00dbe9" strokeWidth="2" strokeLinecap="round" opacity="0.65"/>
            <path d="M 11.5 20 A 5.5 5.5 0 0 1 20.5 20" stroke="#00dbe9" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
            <circle cx="16" cy="22" r="2.5" fill="#00dbe9"/>
            <circle cx="16" cy="22" r="4" fill="#00dbe9" opacity="0.12"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#00dbe9',
            letterSpacing: '-3px',
            lineHeight: 1,
            fontFamily: 'monospace',
          }}
        >
          BEACON
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: '#849495',
            marginTop: 20,
            lineHeight: 1.4,
            fontFamily: 'monospace',
            maxWidth: 700,
          }}
        >
          Autonomous research agent with persistent cross-session memory
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 48, flexWrap: 'wrap' }}>
          {[
            'Delta Reports',
            'Persistent Memory',
            'Slack + GitHub',
            'Durable Workflows',
            'MCP Server',
          ].map(f => (
            <div
              key={f}
              style={{
                background: 'rgba(0,219,233,0.08)',
                border: '1px solid rgba(0,219,233,0.25)',
                borderRadius: 6,
                padding: '10px 20px',
                color: '#00dbe9',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #00dbe9 0%, rgba(0,219,233,0.1) 100%)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
