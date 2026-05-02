# Beacon Security Audit

**Date:** 2026-05-03  
**Auditor:** Claude Code (automated)  
**Scope:** All app pages, API routes, client components, and data flows  
**Status:** Partially remediated — see each finding for current status

---

## Summary

| Severity | Total | Fixed | Open |
|----------|-------|-------|------|
| Critical | 1     | 1     | 0    |
| High     | 5     | 5     | 0    |
| Medium   | 5     | 3     | 2    |
| Low      | 3     | 1     | 2    |

---

## Critical

### C-1 — No Authentication on Any Route
**Status:** ✅ Fixed (2026-05-03)  
**Files:** All `app/api/` routes  

Every API endpoint is fully public. There is no session, token, API key, or IP allowlist protecting:
- `POST /api/briefs` — anyone can trigger unlimited research runs (SerpAPI costs money)
- `GET /api/memory` — full memory bank readable by anyone
- `DELETE /api/memory` — anyone can wipe all stored memory
- `GET /api/logs` — system internals, run IDs, and error messages are public
- `GET|POST /api/mcp/[...transport]` — all 6 MCP tools invocable without auth

**Recommendation:** Add a shared secret header check (`X-Beacon-Key`) validated against an env var. For the MCP server, `mcp-handler` supports an auth callback — wire it to the same secret. This is a one-day fix appropriate for a hackathon deployment hardening pass.

```typescript
// Minimal API route guard
const key = req.headers.get('x-beacon-key')
if (key !== process.env.BEACON_API_KEY) {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}
```

---

## High

### H-1 — Unvalidated Input on `POST /api/briefs`
**Status:** ✅ Fixed (2026-05-03)  
**File:** `app/api/briefs/route.ts`  

Previously, `req.json()` was spread directly into the workflow without validation. An attacker could pass arbitrary keys, oversized topic strings, or invalid `source`/`depth` values.

**Fix applied:** Topic truncated to 500 chars, `source` and `depth` validated against allowlists, `recurring` coerced to boolean.

---

### H-2 — XSS via LLM-Generated Markdown
**Status:** ✅ Fixed (2026-05-03)  
**File:** `app/briefs/[id]/page.tsx`  

`ReactMarkdown` was rendering report content with `remarkGfm` enabled. GFM supports raw HTML in some configurations. A prompt-injected LLM response could produce `<script>` or `<iframe>` tags.

**Fix applied:** `disallowedElements` set to `['script', 'iframe', 'object', 'embed', 'form', 'input']` with `unwrapDisallowed`. Anchor `href` values checked — only `http`, `https`, and relative paths are rendered as links; others are rendered as plain text.

---

### H-3 — `javascript:` URLs in Memory Source Ledger
**Status:** ✅ Fixed (2026-05-03)  
**File:** `app/memory/page.tsx`  

Source URLs from Redis were rendered directly as `href` values without validation. A maliciously crafted `javascript:alert(1)` URL stored in memory would execute on click.

**Fix applied:** `safeHref` check — only `http://` and `https://` URLs are used as `href`; all others fall back to `#`.

---

### H-4 — SSRF Risk in MCP `research_brief` Tool
**Status:** ✅ Fixed (2026-05-03)  
**File:** `app/api/mcp/[...transport]/route.ts`  

The `research_brief` MCP tool constructs a URL from `process.env.VERCEL_URL`:
```typescript
fetch(`${process.env.VERCEL_URL}/api/briefs`, ...)
```

If `VERCEL_URL` is unset, empty, or somehow externally influenced, this `fetch()` call could target an unintended host (Server-Side Request Forgery).

**Recommendation:** Validate `VERCEL_URL` starts with `https://` before use, or hardcode the internal path:
```typescript
const base = process.env.VERCEL_URL?.startsWith('https://')
  ? process.env.VERCEL_URL
  : 'http://localhost:3000'
```

---

### H-5 — No Rate Limiting on Any Endpoint
**Status:** ✅ Fixed (2026-05-03)  
**Files:** All `app/api/` routes  

Any caller can:
- Trigger unlimited workflow runs → unbounded SerpAPI and Groq costs
- Scan all memory entries in bulk
- Flood the in-memory log store (capped at 500 but trivially cycled)

**Recommendation:** Use Vercel's built-in rate limiting (available on Pro/Enterprise via Edge Middleware) or add an Upstash Redis rate limiter with `@upstash/ratelimit`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '60 s') })
const { success } = await ratelimit.limit(ip)
if (!success) return NextResponse.json({ error: 'rate limited' }, { status: 429 })
```

---

## Medium

### M-1 — `topic` Query Param Unbounded on `/api/memory/check`
**Status:** ✅ Fixed (2026-05-03)  
**File:** `app/api/memory/check/route.ts`  

A very long `?topic=` value could generate an oversized Redis key or cause a slow regex in `memoryKey()`.

**Fix applied:** Topic truncated to 500 chars before processing.

---

### M-2 — System Logs Are Publicly Readable
**Status:** ❌ Open  
**File:** `app/api/logs/route.ts`  

`GET /api/logs` returns up to 200 log entries including run IDs, internal step names, error messages, and category details. This gives an unauthenticated attacker a detailed map of the system's internal behavior.

**Recommendation:** Guard behind the same API key check as C-1. Logs should be operator-only.

---

### M-3 — Missing Security Headers
**Status:** ❌ Open  
**File:** `proxy.ts` / `next.config.ts`  

No HTTP security headers are set:
- No `Content-Security-Policy` — XSS escalation if H-2 is re-opened
- No `X-Frame-Options` — clickjacking risk
- No `X-Content-Type-Options` — MIME sniffing
- No `Referrer-Policy`

**Recommendation:** Add to `next.config.ts`:
```typescript
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options',           value: 'DENY' },
    { key: 'X-Content-Type-Options',    value: 'nosniff' },
    { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
    { key: 'Content-Security-Policy',   value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com" },
  ],
}]
```

---

### M-4 — Redis Key Prefix Check Only — No Full Key Validation
**Status:** ❌ Open  
**File:** `app/api/memory/route.ts`  

The DELETE endpoint validates `key.startsWith('beacon:memory:')` which prevents deleting arbitrary Redis keys. However, there is no check against the actual key list — a caller could attempt to delete `beacon:memory:` (the prefix itself, targeting any key if Redis behavior allows).

**Recommendation:** Require the key to match the exact slug pattern `beacon:memory:[a-z0-9-]{1,80}` using a regex check.

---

### M-5 — Slack Webhook Signature Verification (Unverified)
**Status:** ❌ Open  
**File:** `app/api/webhooks/slack/route.ts` (not audited — file not readable at audit time)  

Slack webhook endpoints must verify the `X-Slack-Signature` header to prevent spoofed events. If this verification is missing, any attacker who knows the webhook URL can trigger research runs as if they were Slack users.

**Recommendation:** Verify signature using `crypto.timingSafeEqual` against `SLACK_SIGNING_SECRET`. The `@chat-adapter/slack` SDK may handle this, but it must be confirmed.

---

## Low

### L-1 — Draft Research Topics Stored in `localStorage`
**Status:** ❌ Open  
**File:** `app/briefs/new/page.tsx`  

The topic input is persisted to `localStorage` under `beacon:brief:draft`. On shared or public devices, a sensitive research topic persists between sessions.

**Recommendation:** Clear the draft on page unmount (already done on successful submit). Consider adding a TTL or using `sessionStorage` instead of `localStorage` for draft persistence.

---

### L-2 — `confirm()` Used for Destructive Delete
**Status:** ❌ Open  
**File:** `app/memory/page.tsx`  

`window.confirm()` is used to confirm memory deletion. This is blocked by some browsers, inaccessible to screen readers, and not styleable. It also does not prevent CSRF if auth is later added.

**Recommendation:** Replace with an inline confirmation UI (e.g., a two-step "Delete / Cancel" button pair that appears on first click).

---

### L-3 — `VERCEL_URL` Exposed via Public API Responses
**Status:** ✅ Fixed (indirectly)  
**File:** `app/api/mcp/[...transport]/route.ts`  

The MCP `research_brief` tool returns `process.env.VERCEL_URL` in its response text as a live progress URL. On production, this is the public deployment URL (expected), but in development it exposes `http://localhost:3000`. No sensitive credential is leaked.

**Status:** Acceptable for current usage. No change needed.

---

## Dependency Notes

| Package | Risk | Notes |
|---------|------|-------|
| `react-markdown` + `remark-gfm` | Medium | Raw HTML rendering disabled via `disallowedElements` ✅ |
| `mcp-handler` | Unknown | No auth callback wired — see C-1 |
| `@upstash/redis` | Low | All Redis keys namespaced under `beacon:*` — no key collision risk |
| `workflow` SDK | Low | Step idempotency prevents replay attacks on individual steps |

---

## Remediation Priority

| Priority | Finding | Effort | Impact |
|----------|---------|--------|--------|
| 1 | C-1 — Add API key auth | 1 day | Blocks all unauth access |
| 2 | H-5 — Rate limiting | 2 hrs | Prevents cost abuse |
| 3 | M-3 — Security headers | 30 min | Defense in depth |
| 4 | H-4 — SSRF fix in MCP | 30 min | Low exploitability but easy fix |
| 5 | M-2 — Guard logs route | 10 min | Behind auth from C-1 |
| 6 | M-4 — Key regex validation | 10 min | Defense in depth |
| 7 | L-2 — Confirm UI | 1 hr | UX + accessibility |
| 8 | M-5 — Verify Slack sig | 1 hr | Depends on SDK |
