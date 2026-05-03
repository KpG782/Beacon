# User Auth & Profile Management — Design Document

**Status:** Proposal — not yet implemented  
**Author:** Claude (design), Ken Garcia (decision)  
**Date:** 2026-05-04  
**Priority:** High — single shared password is a blocker for real users

---

## The Problem

Right now Beacon has one shared password for everyone.  
That means:

- No way to know **who** ran a research brief
- Keys stored in **localStorage** — gone when browser clears, not portable across devices
- Someone shares the URL → everyone is inside
- No way to give one person access without giving all access
- No audit trail (who triggered what)

The current model works for a solo operator. It breaks at person #2.

---

## Proposed Architecture

```
/login          → Sign in with email + password (or Google/GitHub OAuth)
/register       → Create account
/profile        → Manage BYOK keys, see usage, get personal MCP token
/dashboard      → All briefs (scoped to user or org depending on role)
/briefs/[id]    → Research run detail (already built)
```

### Auth Flow

```
User arrives at any protected page
        ↓
Redirected to /login
        ↓
Signs in (email+password or OAuth)
        ↓
If first login → /profile/setup (enter Groq + SerpAPI keys)
If returning   → /dashboard (keys already on file)
        ↓
Runs research → keys pulled from secure Redis store (never re-exposed to browser)
        ↓
MCP token available at /profile (personal, not shared)
```

---

## Three Real Options

### Option A — Clerk ⭐ Recommended

**What it is:** Drop-in auth-as-a-service for Next.js. Handles everything: sign up, sign in, OAuth, MFA, user management UI, webhooks.

**Why it fits Beacon:**
- Zero schema setup — no SQL database needed (we already have Redis)
- `@clerk/nextjs` integrates directly with App Router via `ClerkProvider`
- `auth()` helper replaces the current `isValidSession()` everywhere
- User metadata field can store encrypted API keys per-user
- Free tier: 10,000 MAU — more than enough

**Implementation path:**
1. `npm install @clerk/nextjs`
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` to `.env`
3. Wrap `layout.tsx` in `<ClerkProvider>`
4. Replace `proxy.ts` auth check with `clerkMiddleware()`
5. Move BYOK keys from localStorage → Clerk user metadata (encrypted)
6. `/profile` page reads `currentUser()` and renders key management UI

**Tradeoff:** External dependency, Clerk controls auth UI (customizable but not self-hosted). On their free plan you don't control data residency.

---

### Option B — Auth.js v5 (NextAuth)

**What it is:** Open-source, self-hosted auth. The standard for Next.js. Supports email/password, GitHub, Google, magic links.

**Why it fits Beacon:**
- 100% self-hosted, no external vendor for auth
- Upstash Redis adapter exists (`@auth/upstash-redis-adapter`) — plugs into what we already have
- Session stored in Redis alongside memory and briefs
- More work but more control

**Implementation path:**
1. `npm install next-auth@beta @auth/upstash-redis-adapter`
2. Create `auth.ts` config (providers, adapter pointing to Upstash)
3. Add `AUTH_SECRET` to `.env`
4. Replace `proxy.ts` with Auth.js middleware
5. Build `/login` and `/register` pages with Auth.js `signIn()`
6. Store per-user keys in Redis: `beacon:user:{userId}:keys` (encrypted with AES-256-GCM)

**Tradeoff:** More setup (~2-3 hours), you manage sessions and user data in Redis. Email provider requires SMTP setup (or use Resend).

---

### Option C — Supabase Auth

**What it is:** Full backend platform with built-in user management, OAuth, row-level security.

**Why it partially fits:**
- Most complete feature set (email verify, password reset, OAuth, MFA all built-in)
- Could replace Redis for key storage with encrypted columns

**Why it doesn't fit perfectly:**
- Introduces SQL (Postgres) dependency on a Redis-native project
- More infra surface than needed
- Biggest lift to implement

**Best if:** You want to expand Beacon significantly (team workspaces, billing, etc.) in the future.

---

## Recommendation: Start with Clerk, migrate to Auth.js later

**For the hackathon / near-term production:** Clerk.

- 30 minutes to fully working auth
- No new infra, no schema migrations
- Free tier covers you until real scale
- If you outgrow it, Auth.js migration is straightforward (same middleware interface)

**For self-hosted / privacy-first production:** Auth.js + Upstash Redis adapter.

---

## Key Storage — How Keys Stay Secure

The BYOK keys (Groq, SerpAPI) must never live in localStorage again in production. Here's the secure pattern:

```
User enters key in /profile form
        ↓
POST /api/profile/keys  (authenticated route)
        ↓
Server encrypts key:
  AES-256-GCM
  key = scrypt(userId + BEACON_KEY_SECRET, salt)
        ↓
Stored in Redis: beacon:user:{userId}:keys
        ↓
Key NEVER returned to browser after save
(UI shows "••••••••••" + last 4 chars)
        ↓
Research workflow reads keys server-side:
  const keys = await getUserKeys(userId)
  runResearch({ ...brief, groqApiKey: keys.groq })
```

The browser never sees the full key again after the initial save. Even if someone steals a session cookie, they can't extract keys.

---

## Profile Page — What Users Need

```
/profile
├── Account section
│   ├── Name, email
│   ├── Change password
│   └── Delete account
│
├── API Keys section
│   ├── Groq API Key  [••••••••••••abc3]  [Update] [Test]
│   ├── SerpAPI Key   [••••••••••••f9d2]  [Update] [Test]
│   └── "Keys are encrypted at rest. We never expose your full key."
│
├── MCP section
│   ├── Personal MCP token  [••••••••••] [Regenerate] [Copy]
│   └── Setup instructions for Claude Desktop / Cursor
│
└── Usage section
    ├── Research runs this month: 14
    ├── Sources indexed: 312
    └── Last active: 2 hours ago
```

---

## What Changes in the Codebase

| File | Change |
|------|--------|
| `proxy.ts` | Replace `isValidSession()` with Clerk/Auth.js middleware |
| `lib/auth.ts` | Thin wrapper — `getCurrentUserId()`, `requireAuth()` |
| `lib/user-keys.ts` | NEW — `getUserKeys(userId)`, `saveUserKeys(userId, keys)` (encrypted) |
| `app/login/page.tsx` | Replace simple password form with proper sign-in flow |
| `app/register/page.tsx` | NEW — account creation |
| `app/profile/page.tsx` | NEW — key management, MCP token, usage |
| `app/api/briefs/route.ts` | Attach `userId` to every brief on creation |
| `workflows/research.ts` | Pull keys from `getUserKeys(userId)` instead of env vars |
| `app/api/mcp/[...transport]/route.ts` | MCP token becomes per-user (stored in Redis) |

---

## Migration Path for Existing Single-Password Setup

The current `.env` `BEACON_PASSWORD` becomes an **admin fallback** that still works.  
Existing runs (no userId) remain accessible to the admin account.  
No data migration needed — just add auth on top.

---

## Timeline Estimate

| Approach | Time to working auth | Time to full profile |
|----------|---------------------|----------------------|
| Clerk | ~30 min | ~2 hours |
| Auth.js | ~2 hours | ~4 hours |
| Supabase | ~4 hours | ~6 hours |

---

## Decision

- [ ] Use **Clerk** (fast, production-ready, hackathon timeline)
- [ ] Use **Auth.js** (self-hosted, open-source, more control)
- [ ] Use **Supabase** (if expanding to full platform)
- [ ] Keep current single-password (acceptable for solo use only)

Once you decide, implementation can start immediately. The Clerk path can be fully working in under an hour.
