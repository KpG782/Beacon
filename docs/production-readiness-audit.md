# Beacon — Production Readiness Audit
**Date:** 2026-05-04  
**Auditor:** Ken Garcia (via Claude Code)  
**Purpose:** What needs to be fixed, hardened, or built before real users can safely use Beacon in production.

---

## TL;DR

Beacon is a real, working application — not a prototype. The core loop (brief → workflow → delta report → memory) is fully implemented. But it has several gaps that would cause real problems the moment a second person uses it. Fix the P0s before sharing the URL with anyone.

**Current state:** Works for one operator. Not safe for multiple users yet.

---

## CRITICAL — Fix Before Sharing the URL

### C1. Rotate All API Keys Immediately

**Severity: BLOCKER**

A `.env` file containing live API keys appears to exist in the project. If this file has ever been committed to git, every key must be rotated now — git history is permanent.

**Keys at risk:**
- `GROQ_API_KEY` — anyone with this can rack up your Groq bill
- `SERPAPI_API_KEY` — same, SerpAPI charges per search
- `SLACK_BOT_TOKEN` + `SLACK_SIGNING_SECRET` — full bot access to your workspace
- `GITHUB_APP_ID` + `GITHUB_PRIVATE_KEY` — full GitHub App access
- `DISCORD_TOKEN` — full bot control
- `UPSTASH_REDIS_REST_TOKEN` — full read/write access to all user data
- `VERCEL_API_TOKEN` — can deploy, delete, or modify your Vercel projects

**What to do right now:**
1. Check `git log --all --full-history -- .env` — if it shows commits, the keys are already in history
2. Rotate every key above in its respective dashboard
3. Add `.env` and `.env.local` to `.gitignore` if not already there
4. Set keys in Vercel dashboard environment variables only — never in code

### C2. Auth is Disabled by Default

**Severity: BLOCKER**

`BEACON_PASSWORD` and `BEACON_SESSION_TOKEN` are not set in `.env.local`. This means `proxy.ts` skips auth entirely and the app is open to anyone who knows the URL — including the `/api/briefs` POST endpoint that triggers paid API calls.

**What to do:**
1. Set `BEACON_PASSWORD` in Vercel environment variables (a strong password)
2. Set `BEACON_SESSION_TOKEN` to a long random string (`openssl rand -hex 32`)
3. Verify `proxy.ts` enforces auth on every non-public route before deploying

---

## P0 — Must Fix Before Real Users

### P0-1. Per-User API Key Isolation (BYOK Finish)

**Current state:** The Settings page (`/app/settings/page.tsx`) lets users enter their own Groq and SerpAPI keys, and stores them in `localStorage`. The workflow (`workflows/research.ts`) accepts `userKeys` in the brief payload. The plumbing is there.

**The gap:** The Settings UI saves keys to `localStorage` but the brief submission form (`/app/briefs/new/page.tsx`) needs to actually read those keys from `localStorage` and include them in the POST body. If this wire isn't connected, every user's research runs on your keys regardless of what they entered in Settings.

**Verify:** Open DevTools → Network → POST `/api/briefs`. Check if the request body includes `userKeys`. If not, the wire is missing.

**Fix:** In the new brief form's submit handler, read `beacon:user:keys` from localStorage and include in the request body.

**Impact:** Without this, you pay for every user's SerpAPI and Groq usage. With it, users who enter their own keys are fully isolated.

### P0-2. The "Test Connection" Buttons Don't Actually Test Anything

**Current state:** The Settings page has "Test Connection" buttons for Groq and SerpAPI keys. They call `/api/status`, which checks whether the *server-side* env vars are set — not whether the user's entered keys are valid.

**The problem:** A user enters a wrong Groq key, clicks Test, sees "Connected ✓", submits a brief, and it fails silently mid-workflow.

**Fix:** Create `/api/test-keys` that accepts `{ groqApiKey?, serpApiKey? }` in the request body, makes a minimal test call to each service, and returns pass/fail per key.

### P0-3. No Rate Limiting Visible to Users

**Current state:** Rate limiting exists (`lib/ratelimit.ts`) — 5 research runs per hour per IP. But when a user hits the limit, the API returns a 429 with a JSON error. The dashboard and brief submission form don't handle this response — the user just sees a failed request with no explanation.

**Fix:** Handle 429 responses in the brief submission form and show a human-readable message ("You've used 5 research runs this hour. Try again in X minutes.").

---

## P1 — Fix Before Public Launch

### P1-1. No Tests at All

**Current state:** Zero test files. No Jest, no Vitest, no Playwright.

**Why this matters for production:** Any change to `workflows/research.ts`, `lib/memory.ts`, or `lib/serpapi.ts` can silently break the core loop. There's no safety net.

**Minimum viable test suite:**

| Test | What it covers | Tool |
|---|---|---|
| `memory.test.ts` | `filterSeenUrls`, `mergeUrls`, `buildMemoryContext` | Vitest |
| `serpapi.test.ts` | `compressSerpResults`, `extractKeyFacts` | Vitest (mock fetch) |
| `brief-store.test.ts` | Brief CRUD and status transitions | Vitest (mock Redis) |
| `e2e/brief-flow.test.ts` | Submit brief → see report appear | Playwright |

You don't need 100% coverage. You need tests on the three functions that, if broken, kill the entire product.

### P1-2. Logs Are Lost on Restart

**Current state:** `lib/logs.ts` (or equivalent) keeps logs in a 500-entry in-memory array. Every Vercel function cold start starts with a blank log. Every deploy wipes them.

**Why this matters:** When a workflow fails at step 3 for a user, you have no way to see what happened unless you were watching in that exact function instance.

**Fix options (pick one):**
- Push log entries to Upstash Redis (append to a list, cap at 1000)
- Wire up Vercel Log Drains to ship to Datadog, Axiom, or Logtail (one click in Vercel dashboard)
- Add `console.log` statements in the workflow steps — Vercel captures these in Function Logs (good enough for now)

**Recommended right now:** Enable a Vercel Log Drain to Axiom (free tier, one marketplace click). This gives you persistent searchable logs with zero code changes.

### P1-3. No Error Tracking

**Current state:** When a workflow step throws, the error is caught and logged locally. No alert is sent. You won't know a user's research failed unless they tell you.

**Fix:** Add Sentry (or equivalent). One integration in `next.config.ts`:
```bash
npx @sentry/wizard@latest -i nextjs
```
This adds error capture to all API routes and client-side. Free tier covers ~5k errors/month.

### P1-4. Auth Has No Account System

**Current state:** Auth is a single shared password. Everyone who knows the password gets full access to all briefs, all memory, all logs. There's no concept of "user A's briefs" vs "user B's briefs."

**Current acceptable use:** Single operator (you) or small trusted team with a shared password.

**Not acceptable for:** Public sign-up, multiple unrelated users, or anyone you'd want to isolate from each other's data.

**For now:** Keep the single-password model but document it clearly in the app — "Beacon is currently single-user. All data is shared." Don't let users think their data is private if it isn't.

**Path to multi-user:** Add Clerk or Auth.js with user ID scoping in `brief-store.ts` and `memory.ts` (key by `userId:topic` instead of just `topic`). This is a medium-effort migration.

### P1-5. No Health Check Endpoint

**Current state:** `/api/status` exists but it only checks whether env vars are *set*, not whether the downstream services are actually *working*.

**Fix:** Add real health checks:
```typescript
// /api/health
GET /api/health
→ { 
    redis: "ok" | "error",
    groq: "ok" | "error", 
    serpapi: "ok" | "error",
    latency: { redis: 12, groq: 340 }
  }
```
This lets you monitor uptime externally (UptimeRobot, Better Uptime, etc.) and gives you a real signal when a service degrades.

---

## P2 — UX Gaps That Will Confuse Real Users

### P2-1. Brief Submission Gives No Confirmation

**Expected behavior:** User submits a brief → sees "Research started" with a link to track progress.  
**Current behavior:** Depends on the form — may just redirect or show nothing.

**Fix:** After POST `/api/briefs` returns, redirect to `/briefs/[id]` with a status indicator showing the workflow is starting.

### P2-2. Graph Page: Query Plan Nodes Missing

The graph shows Topic → Sources but doesn't show the 5–10 search queries generated by `planQueries()`. This means the graph is a list of URLs, not a research provenance trail.

**Fix:** When synthesizing the report, store the query plan in the brief record. The graph reads it and adds Query nodes between Topic and Sources.

### P2-3. Memory Bank: No Per-Run Diff

**Current state:** Memory bank shows accumulated facts across all runs. You can't see what run 3 added vs what run 2 already knew.

**Fix:** Store a `runHistory: RunRecord[]` on each memory entry. Each `RunRecord` contains the delta facts, delta URLs, and timestamp for that run.

### P2-4. Brief Detail: No "New vs Already Known" Split

Delta is the core differentiator but the report page doesn't visually show it. All sources look the same. All facts look the same.

**Fix:** In the brief detail page, add a "New This Run" section above "Previously Known". Color new sources with the orange accent. This makes the value proposition visible.

### P2-5. "Home" in Sidebar Goes to Marketing Page

From the app, clicking "Home" navigates to the public landing page (`/`). Users in the middle of a research session get kicked to the marketing page.

**Fix (trivial):** Change the "Home" sidebar link to `/dashboard`.

### P2-6. No "All Briefs" Page

Dashboard shows the last 5 briefs. After 6 runs, older ones are inaccessible from the UI (though still in Redis).

**Fix:** `/app/briefs/page.tsx` already exists. Add it to the sidebar nav as "All Briefs" with pagination.

### P2-7. Settings Not in Sidebar

Settings is a topbar flyout, but it contains the API keys feature that users need to configure before using the app. Users starting fresh won't find it.

**Fix:** Add Settings to the sidebar nav. The page (`/app/settings/page.tsx`) already exists.

---

## P3 — Quality of Life (Post-Launch)

### P3-1. Report Rendering Is Unstyled

The synthesized markdown report is rendered as plain text. Headers, code blocks, and emphasis are not styled.

**Fix:** Wrap the report content in a markdown renderer. `react-markdown` + `tailwind-prose` takes 30 minutes to wire up.

### P3-2. Sources List Has No Titles or Snippets

The sources section shows raw URLs. No page title, no snippet, no domain favicon.

**Fix:** Store `title` and `snippet` from SerpAPI results alongside the URL in memory. Display them in the sources section.

### P3-3. No Export

No way to export a report or memory bank entry to markdown, JSON, or clipboard.

**Fix:** Add an "Export" button to brief detail and memory detail pages. `window.navigator.clipboard.writeText()` for copy-to-clipboard, `<a download>` for file download.

### P3-4. Memory Export

Power users will want to take their accumulated research out of Beacon. No export exists today.

**Fix:** Add `GET /api/memory/[slug]/export?format=json|md` that returns the full memory entry.

### P3-5. Slack/Discord/GitHub Integrations Need Verification

The chat adapters are installed and tokens are in env. Whether the webhook routing and event handling actually work end-to-end has not been verified in this audit.

**Fix:** Set up a test Slack workspace, configure the webhook URL, and send a mention. Verify a brief is created and a response is posted in the thread.

---

## Infrastructure Checklist

| Item | Status | Action |
|---|---|---|
| `.env` file out of git | ⚠️ Verify | Check `git log --all -- .env`; rotate if committed |
| `BEACON_PASSWORD` set | ❌ Missing | Set in Vercel env vars before sharing URL |
| `BEACON_SESSION_TOKEN` set | ❌ Missing | `openssl rand -hex 32`, set in Vercel env vars |
| Upstash Redis connected | ✅ Real | Verify TTL and key count in Upstash dashboard |
| Vercel deployment active | ✅ Real | Verify at Vercel dashboard |
| Log drain enabled | ❌ Missing | Add Axiom integration in Vercel marketplace |
| Error tracking | ❌ Missing | Add Sentry via `npx @sentry/wizard` |
| Health check endpoint | ❌ Missing | Build `/api/health` with real service pings |
| Uptime monitoring | ❌ Missing | Point UptimeRobot at `/api/health` |
| Rate limits tested | ⚠️ Untested | Manually hit limit and verify 429 + user message |
| BYOK wire connected | ⚠️ Verify | Check POST `/api/briefs` body includes `userKeys` |
| Test suite | ❌ Missing | Add Vitest for core lib functions |
| GitHub Actions CI | ❌ Missing | Add `.github/workflows/ci.yml` to run type-check + tests on PR |

---

## Priority Order for This Week

| Day | Work |
|---|---|
| **Today** | Rotate all API keys. Set `BEACON_PASSWORD` and `BEACON_SESSION_TOKEN`. Verify `.env` is gitignored. |
| **Tomorrow** | Verify BYOK wire is connected (check POST body). Fix test buttons to actually validate keys (`/api/test-keys`). |
| **Day 3** | Add log drain (Axiom, Vercel marketplace, 10 min). Add Sentry (`npx @sentry/wizard`). |
| **Day 4** | Add `/api/health`. Point UptimeRobot at it. Fix "Home" sidebar link. Add Settings + All Briefs to sidebar. |
| **Day 5** | Write Vitest tests for `memory.ts` core functions. Add "New vs Known" split to brief detail page. |
| **Next week** | Per-run diff in memory bank. Graph query plan nodes. Markdown styling for reports. |

---

## What's Actually Solid and Shouldn't Be Touched

- `workflows/research.ts` — durable, idempotent, real. Don't refactor this.
- `lib/memory.ts` — delta dedup logic is correct. Don't change the key structure.
- `lib/ratelimit.ts` — sliding window is the right algorithm. Keep it.
- `proxy.ts` — auth gate pattern is correct. Just make sure the env vars are set.
- The 50+ research frameworks in `lib/frameworks.ts` — these are a genuine differentiator.

---

*Update this file as items are resolved. Strike through completed items rather than deleting them so the audit trail is preserved.*
