'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SetupPage() {
  const router = useRouter()
  const [groq, setGroq] = useState('')
  const [serp, setSerp] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!groq.trim() || !serp.trim()) { setError('Both keys are required to run research.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqApiKey: groq.trim() || undefined, serpApiKey: serp.trim() || undefined }),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.replace('/dashboard')
    } catch {
      setError('Could not save keys. Try again.')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <span className="material-symbols-outlined text-orange-400 text-[28px]">key</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tighter text-[#e5e5e5]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Connect Your Keys
            </h1>
            <p className="text-xs text-[#737373] mt-1">
              Beacon runs research using your API keys. They&apos;re encrypted and stored securely.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-[#262626] rounded-xl p-6 flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#737373]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Groq API Key
              <span className="ml-1 text-orange-400">*</span>
            </label>
            <input
              type="password"
              value={groq}
              onChange={e => setGroq(e.target.value)}
              placeholder="gsk_..."
              autoFocus
              className="w-full bg-black/40 border border-[#262626] text-[#e5e5e5] text-sm font-mono px-3 py-2.5 rounded outline-none focus:border-orange-500/40 placeholder:text-[#404040]"
            />
            <p className="text-[10px] text-[#404040]">
              Get free at <span className="text-[#737373]">console.groq.com/keys</span>
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#737373]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              SerpAPI Key
              <span className="ml-1 text-orange-400">*</span>
            </label>
            <input
              type="password"
              value={serp}
              onChange={e => setSerp(e.target.value)}
              placeholder="a91f..."
              className="w-full bg-black/40 border border-[#262626] text-[#e5e5e5] text-sm font-mono px-3 py-2.5 rounded outline-none focus:border-orange-500/40 placeholder:text-[#404040]"
            />
            <p className="text-[10px] text-[#404040]">
              Get free at <span className="text-[#737373]">serpapi.com</span>
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !groq.trim() || !serp.trim()}
            className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-bold tracking-widest uppercase disabled:opacity-40 transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {saving ? 'Saving…' : 'Save & Open Dashboard →'}
          </button>
        </form>
      </div>
    </div>
  )
}
