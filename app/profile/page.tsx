'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface KeyStatus {
  configured: boolean
  groq?: { masked: string; set: boolean }
  serp?: { masked: string; set: boolean }
  updatedAt?: string
}

interface TestResult {
  ok: boolean
  latencyMs?: number
  error?: string
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KeyRow({
  label,
  field,
  placeholder,
  masked,
  isSet,
  onSave,
}: {
  label: string
  field: 'groqApiKey' | 'serpApiKey'
  placeholder: string
  masked?: string
  isSet: boolean
  onSave: (field: string, value: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  async function handleSave() {
    if (!value.trim()) return
    setSaving(true)
    await onSave(field, value.trim())
    setValue('')
    setEditing(false)
    setSaving(false)
    setTestResult(null)
  }

  async function handleTest() {
    if (!value.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      const body = field === 'groqApiKey' ? { groqApiKey: value.trim() } : { serpApiKey: value.trim() }
      const res = await fetch('/api/test-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json() as { groq?: TestResult; serpapi?: TestResult }
      setTestResult(field === 'groqApiKey' ? (data.groq ?? null) : (data.serpapi ?? null))
    } catch {
      setTestResult({ ok: false, error: 'Network error' })
    }
    setTesting(false)
  }

  return (
    <div className="border border-[#262626] rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#737373]"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>{label}</p>
          {isSet && masked && !editing && (
            <p className="text-sm font-mono text-[#e5e5e5] mt-1">{masked}</p>
          )}
          {!isSet && !editing && (
            <p className="text-xs text-[#737373] mt-1">Not configured</p>
          )}
        </div>
        <div className="flex gap-2">
          {isSet && !editing && (
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
              SET
            </span>
          )}
          <button
            onClick={() => { setEditing(!editing); setTestResult(null) }}
            className="text-[11px] font-bold tracking-wide px-3 py-1.5 rounded border border-[#262626] hover:border-orange-500/40 hover:text-orange-400 text-[#737373] transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {editing ? 'Cancel' : isSet ? 'Update' : 'Add Key'}
          </button>
        </div>
      </div>

      {editing && (
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full bg-black/40 border border-[#262626] text-[#e5e5e5] text-sm font-mono px-3 py-2.5 rounded outline-none focus:border-orange-500/40 placeholder:text-[#404040]"
          />

          {testResult && (
            <p className={`text-xs font-mono px-3 py-2 rounded ${testResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {testResult.ok ? `✓ Valid — ${testResult.latencyMs}ms` : `✗ ${testResult.error ?? 'Invalid key'}`}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={!value.trim() || testing}
              className="text-[11px] font-bold tracking-wide px-3 py-1.5 rounded border border-[#262626] hover:border-[#404040] text-[#737373] disabled:opacity-40 transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {testing ? 'Testing…' : 'Test Key'}
            </button>
            <button
              onClick={handleSave}
              disabled={!value.trim() || saving}
              className="text-[11px] font-bold tracking-wide px-4 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {saving ? 'Saving…' : 'Save Key'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [keys, setKeys] = useState<KeyStatus | null>(null)
  const [mcpToken] = useState(() => process.env.NEXT_PUBLIC_MCP_TOKEN_HINT ?? '')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/profile/keys')
      .then(r => r.json())
      .then(setKeys)
      .catch(() => setKeys({ configured: false }))
  }, [])

  async function handleSaveKey(field: string, value: string) {
    await fetch('/api/profile/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    // Refresh masked display
    const res = await fetch('/api/profile/keys')
    const data = await res.json() as KeyStatus
    setKeys(data)
  }

  function copyMcpInstructions() {
    const text = `{
  "mcpServers": {
    "beacon": {
      "command": "npx",
      "args": ["mcp-remote", "${typeof window !== 'undefined' ? window.location.origin : 'https://your-beacon-url.vercel.app'}/api/mcp/sse"],
      "env": {
        "Authorization": "Bearer ${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? 'YOUR_MCP_TOKEN'}"
      }
    }
  }
}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-[#737373] text-sm font-mono animate-pulse">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-2xl mx-auto" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-[11px] text-[#737373] hover:text-[#e5e5e5] transition-colors flex items-center gap-1 mb-3">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Dashboard
          </Link>
          <h1 className="text-xl font-bold text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Profile
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
          <p className="text-xs text-[#737373] mt-2 max-w-lg leading-relaxed">
            This page exists for practical operator setup: save the provider keys Beacon needs to run private research,
            connect external AI clients over MCP, and manage the account identity that scopes your briefs, memory, and logs.
          </p>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          className="text-[11px] font-bold tracking-wide px-3 py-1.5 rounded border border-[#262626] hover:border-red-500/40 hover:text-red-400 text-[#737373] transition-colors"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Sign out
        </button>
      </div>

      {/* Account section */}
      <section className="mb-8">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Account
        </h2>
        <div className="border border-[#262626] rounded-lg p-4 flex items-center gap-4">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400 font-bold text-sm">
                {user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[#e5e5e5]">
              {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
            </p>
            <p className="text-xs text-[#737373] mt-0.5">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Why this page matters
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-[#262626] rounded-lg p-4">
            <p className="text-[11px] font-bold tracking-wide uppercase text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Private research runs
            </p>
            <p className="text-xs text-[#737373] mt-2 leading-relaxed">
              Signed-in research uses your account scope so briefs, memory, and logs stay separated from other users.
            </p>
          </div>
          <div className="border border-[#262626] rounded-lg p-4">
            <p className="text-[11px] font-bold tracking-wide uppercase text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Bring your own keys
            </p>
            <p className="text-xs text-[#737373] mt-2 leading-relaxed">
              Groq and SerpAPI keys let Beacon run private research using your own model and search quotas instead of shared defaults.
            </p>
          </div>
          <div className="border border-[#262626] rounded-lg p-4">
            <p className="text-[11px] font-bold tracking-wide uppercase text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              MCP client setup
            </p>
            <p className="text-xs text-[#737373] mt-2 leading-relaxed">
              This page also gives you the handoff point for connecting Claude Desktop, Cursor, or another MCP-capable client to Beacon.
            </p>
          </div>
        </div>
      </section>

      {/* API Keys section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#737373]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            API Keys
          </h2>
          {keys?.updatedAt && (
            <span className="text-[10px] text-[#404040] font-mono">
              Updated {new Date(keys.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <p className="text-xs text-[#737373] mb-4 leading-relaxed">
          Keys are encrypted with AES-256-GCM and stored server-side. We never expose your full key after saving.
        </p>

        <div className="flex flex-col gap-3">
          {keys !== null ? (
            <>
              <KeyRow
                label="Groq API Key"
                field="groqApiKey"
                placeholder="gsk_..."
                masked={keys.groq?.masked}
                isSet={keys.groq?.set ?? false}
                onSave={handleSaveKey}
              />
              <KeyRow
                label="SerpAPI Key"
                field="serpApiKey"
                placeholder="a91f..."
                masked={keys.serp?.masked}
                isSet={keys.serp?.set ?? false}
                onSave={handleSaveKey}
              />
            </>
          ) : (
            <div className="border border-[#262626] rounded-lg p-4 text-[#737373] text-xs font-mono animate-pulse">
              Loading keys…
            </div>
          )}
        </div>

        <div className="mt-3 px-4 py-3 rounded-lg bg-[#111111] border border-[#262626]">
          <p className="text-[10px] text-[#737373] leading-relaxed">
            <span className="text-orange-400 font-bold">No keys set?</span> Get them free at{' '}
            <span className="font-mono text-[#e5e5e5]">console.groq.com/keys</span> and{' '}
            <span className="font-mono text-[#e5e5e5]">serpapi.com</span>
          </p>
        </div>
      </section>

      {/* MCP section */}
      <section className="mb-8">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          MCP — AI Agent Access
        </h2>
        <div className="border border-[#262626] rounded-lg p-4 flex flex-col gap-3">
          <p className="text-xs text-[#737373] leading-relaxed">
            Connect Claude Desktop or Cursor to Beacon as an MCP server. Add this to your{' '}
            <span className="font-mono text-[#e5e5e5]">claude_desktop_config.json</span>:
          </p>
          <div className="bg-black/60 rounded-lg p-3 font-mono text-[11px] text-[#e5e5e5] leading-relaxed whitespace-pre overflow-x-auto">
{`{
  "mcpServers": {
    "beacon": {
      "command": "npx",
      "args": ["mcp-remote",
        "${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app'}/api/mcp/sse"
      ]
    }
  }
}`}
          </div>
          <button
            onClick={copyMcpInstructions}
            className="self-start text-[11px] font-bold tracking-wide px-3 py-1.5 rounded border border-[#262626] hover:border-orange-500/40 hover:text-orange-400 text-[#737373] transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {copied ? '✓ Copied' : 'Copy config'}
          </button>
        </div>
      </section>
    </div>
  )
}
