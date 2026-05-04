# Beacon vs HireProof — Competitive Audit
**Date:** 2026-05-04  
**Scope:** Feature parity, platform surface, developer experience, agent integration

---

## TL;DR Verdict

Beacon wins on **depth**: persistent memory, delta reports, 47 frameworks, durable workflows, and a richer dashboard. HireProof wins on **surface area and reach**: public demo API key, published npm packages, Chrome Extension, SKILL.md, OCR/voice input, Telegram, email forwarding, and n8n.

The plan below closes every HireProof advantage and keeps Beacon's differentiated core intact.

---

## Feature-by-Feature Matrix

| Feature | HireProof | Beacon | Gap |
|---|---|---|---|
| **Core intelligence** | One-shot fraud scoring (0–100) | Multi-run research agent with delta | Beacon deeper |
| **Persistent memory** | None — each audit is fresh | Redis-backed cross-session memory, 30-day TTL | Beacon only |
| **Delta / change detection** | None | Full delta report (what changed since last run) | Beacon only |
| **Durable workflows** | Not shown | Workflow SDK — survives restarts, zero-compute sleep | Beacon only |
| **Recurring runs** | None | 7-day sleep-and-rerun with tail recursion | Beacon only |
| **Research frameworks** | None | 47 (Porter's, RICE, JTBD, Ansoff, etc.) | Beacon only |
| **Public demo API key** | ✅ `hireproof_agent_demo_key` — curl works with no signup | ❌ Trial is browser-only; private API also requires auth + keys | **HireProof wins** |
| **Published npm SDK** | ✅ `hireproof-sdk` | ❌ `"private": true` in package.json | **HireProof wins** |
| **Published CLI** | ✅ `@hireproof/cli` | ❌ None | **HireProof wins** |
| **LangChain tool** | ✅ `@hireproof/langchain` | ❌ None | **HireProof wins** |
| **n8n node** | ✅ Custom n8n node | ❌ None | **HireProof wins** |
| **Chrome Extension** | ✅ Downloadable ZIP | ❌ None | **HireProof wins** |
| **SKILL.md (AI CLI skill)** | ✅ Drop-in `.agents/skills/` | ❌ None | **HireProof wins** |
| **Webhook delivery** | ✅ Async callbacks | ✅ Completion callbacks via `webhookUrl` on `/api/briefs` | Roughly tied |
| **OCR input (screenshot)** | ✅ Google Vision + Tesseract | ❌ None | **HireProof wins** |
| **Voice dictation** | ✅ | ❌ None | **HireProof wins** |
| **URL resolution** | ✅ Fetches & compares live URL | ❌ None | **HireProof wins** |
| **Telegram bot** | ✅ | ❌ None | **HireProof wins** |
| **Email forwarding** | ✅ | ❌ None | **HireProof wins** |
| **Slack bot** | ✅ | ✅ | Tied |
| **Discord bot** | ✅ | ⚠️ Route exists but intake is temporarily disabled pending dependency hardening | Beacon behind |
| **GitHub bot** | ✅ | ✅ Route + adapter path exist | Tied |
| **MCP server** | ✅ `/api/mcp` | ✅ 10 tools, 3 resources, 3 prompts | Beacon richer |
| **REST API** | ✅ `/api/v1/audit` | ✅ `/api/briefs` (authenticated private API) | Roughly tied, HireProof easier to try |
| **Real-time streaming** | ✅ Browser streaming | ⚠️ UI polling against JSON status routes, not true streaming | HireProof clearer |
| **Authentication** | API key + demo key | Clerk + session + BYOK | Beacon stronger |
| **Rate limiting** | ✅ | ✅ Sliding window, per-surface | Beacon more granular |
| **Trial / no-signup mode** | ✅ Public API key | ✅ Browser session (3 runs) | HireProof more API-friendly |
| **Dashboard** | Basic audit UI | Full dashboard: briefs, logs, memory, graph | Beacon richer |
| **Memory browser** | None | ✅ `/memory` with JSON export | Beacon only |
| **3D graph visualization** | None | ✅ React Three Fiber | Beacon only |
| **Memory export** | None | ✅ JSON in UI, markdown via MCP `export_topic` | Beacon only |
| **Multi-topic comparison** | None | ✅ MCP `compare_topics` tool | Beacon only |
| **Verified badge / trust signal** | ✅ Verified-only alternatives | ❌ None | HireProof only |
| **Security whitepaper** | ✅ Dedicated page | ⚠️ `/docs/security` page, no formal audit | HireProof clearer |
| **Documentation** | 20+ doc sections | 10 public docs/legal pages, lighter operator depth | HireProof more |
| **Self-hosting guide** | ✅ | ✅ `/docs/deployment` | Tied |
| **Competitive roadmap** | ✅ Public page | ✅ `/docs/roadmap` | Tied |

---

## Where Beacon Is Clearly Better

1. **Memory compounds across runs** — HireProof starts from zero every audit. Beacon gets smarter with every run on a topic.
2. **Delta reports** — Beacon surfaces only what changed. Nobody else does this.
3. **Durable, recurring workflows** — Workflow SDK guarantees a run finishes even if the browser closes or the server restarts. HireProof is single-shot.
4. **47 research frameworks** — HireProof has no structured lens system. Beacon can run RICE, Porter's Five Forces, Jobs-to-be-Done, etc.
5. **Richer MCP server** — 10 tools, 3 resources, 3 prompts. HireProof's MCP has basic investigation tools.
6. **Full observability** — Live logs, memory bank, run history, and a 3D graph visualization. HireProof has no equivalent.

---

## Where HireProof Beats Beacon — and the Fix Plan

### Priority 1 — Zero-friction API access (HIGH IMPACT, LOW EFFORT)
**Gap:** HireProof's homepage curl example with a public demo key is the single best developer conversion trick. Beacon's trial is browser-only, and the main `/api/briefs` surface is authenticated and expects valid provider keys before it will run.

**Fix:** Add a public demo API key (`beacon_demo_key`) that works against `POST /api/briefs` with 3 uses/IP/day. No signup. Land it on the homepage with a `curl` example.

**Files to touch:** `app/api/briefs/route.ts`, `proxy.ts`, landing page hero.

---

### Priority 2 — SKILL.md (HIGH IMPACT, 30 MINUTES)
**Gap:** HireProof has a drop-in SKILL.md for Claude Code, Cursor, and any AI CLI. Judges at the hackathon will try this. Beacon has nothing.

**Fix:** Write a `SKILL.md` at `public/skills/beacon-skill.md` (downloadable) and also at `.agents/skills/beacon/SKILL.md`. The skill should teach any AI CLI how to call `POST /api/briefs`, poll `GET /api/briefs/:id`, read reports, and use the MCP server.

**Files to create:** `public/skills/beacon-skill.md`, `.agents/skills/beacon/SKILL.md`

---

### Priority 3 — Webhook delivery (IMPLEMENTED)
**Current state:** Beacon now accepts a `webhookUrl` field on `POST /api/briefs`. When a run completes, the brief sync layer POSTs the completed report payload to that URL and stores delivery state on the brief record.

**What shipped:**
- `webhookUrl` added to the brief payload
- outbound completion callback delivery
- persisted delivery state on the brief record (`pending`, `delivered`, `failed`)
- basic retry path for failed deliveries during later brief syncs

**What still needs hardening:**
- signed webhook requests
- explicit retry backoff policy
- dedicated webhook docs and example payload reference

**Files touched:** `lib/types.ts`, `lib/brief-store.ts`, `app/api/briefs/route.ts`

---

### Priority 4 — Finish non-Slack intake hardening (LOW EFFORT)
**Gap:** GitHub and Discord webhook routes now exist, but they are not equally production-ready. GitHub is wired. Discord is intentionally disabled in the route today because its adapter chain currently breaks production builds without extra dependency work.

**Fix:** Keep the GitHub route. For Discord, either add the missing dependency/runtime support cleanly or replace the adapter strategy so the route can be enabled without destabilizing builds.

**Files to touch:** `app/api/webhooks/github/route.ts`, `app/api/webhooks/discord/route.ts`, `lib/discord-bot.ts`

---

### Priority 5 — n8n integration (MEDIUM EFFORT)
**Gap:** HireProof publishes an n8n community node. n8n has a huge automation user base.

**Fix:** Create a custom n8n community node package (`packages/n8n-nodes-beacon/`) that wraps `POST /api/briefs` and `GET /api/briefs/:id`. Publish to npm. Add `/docs/n8n` documentation page.

**Files to create:** `packages/n8n-nodes-beacon/` (new mono-repo workspace), `/docs/n8n`

---

### Priority 6 — Telegram bot (MEDIUM EFFORT)
**Gap:** HireProof has Telegram. It's a big channel for international users.

**Fix:** Add Telegram via `@chat-adapter/telegram` if available, or wire the Telegraf library directly. Add `app/api/webhooks/telegram/route.ts` and `TELEGRAM_BOT_TOKEN` to env.

---

### Priority 7 — TypeScript SDK + CLI (MEDIUM EFFORT)
**Gap:** HireProof publishes `hireproof-sdk` and `@hireproof/cli`. Beacon has no npm presence.

**Fix:** Extract a typed SDK into `packages/beacon-sdk/` that wraps the REST API. Build a CLI wrapper in `packages/beacon-cli/`. Publish as `beacon-sdk` and `@beacon/cli`.

---

### Priority 8 — Security whitepaper (LOW EFFORT)
**Gap:** HireProof has a dedicated security whitepaper. Beacon's `/docs/security` page mentions there isn't one.

**Fix:** Continue promoting `/docs/security` from a posture page into a real whitepaper: AES-256-GCM key-storage spec, Clerk auth flow, Redis TTL policy, rate-limiting tables, vendor/subprocessor list, and incident response contacts. Add a downloadable PDF or markdown link.

---

### Priority 9 — Email forwarding (MEDIUM EFFORT)
**Gap:** HireProof accepts job posts via forwarded emails.

**Fix:** Set up an inbound email parser (Postmark or SendGrid inbound) that POSTs to `POST /api/briefs` with the email body as the `topic` and `objective`. Add `app/api/webhooks/email/route.ts`.

---

### Priority 10 — OCR / screenshot input (HIGH EFFORT)
**Gap:** HireProof accepts screenshot uploads and extracts text via Google Vision + Tesseract.

**Fix:** Add a `POST /api/ocr` endpoint backed by Vercel's image pipeline or a Cloudflare Worker that runs Tesseract. Feed extracted text into the brief creation flow as the topic/objective.

---

### Priority 11 — URL resolution input (MEDIUM EFFORT)
**Gap:** HireProof fetches a live URL and compares against pasted text. Beacon's SerpAPI queries are separate from direct URL fetch.

**Fix:** Add URL input to the brief form. In `workflows/research.ts`, add an optional step that fetches and parses the URL before planning queries.

---

### Priority 12 — Chrome Extension (HIGH EFFORT)
**Gap:** HireProof has a Chrome Extension (downloadable ZIP while awaiting Web Store approval).

**Fix:** Build a Chrome Extension in `extensions/chrome/` that adds a sidebar to any page and can send the current page URL or selected text to `POST /api/briefs`.

---

## Differentiation Points Beacon Should Amplify

These are advantages HireProof cannot match. Make them louder.

| Beacon Strength | How to Amplify |
|---|---|
| Cross-session memory | Lead with this in docs: "Run 1 builds the map. Run 2 shows you only what changed." |
| Delta reports | Add a demo that shows Run 1 vs Run 2 side-by-side with diff highlighting |
| Durable workflows | Add a progress tracker that shows the workflow surviving a page close |
| 47 frameworks | Surface the framework picker prominently in the landing page |
| Recurring intelligence | Market this as "a research agent that works while you sleep" |
| MCP richness | Document all 10 tools and 3 prompts prominently, add a Claude Desktop quickstart |

---

## Recommended Execution Order

```
Week 1 (before May 4 deadline):
  [x] Done — Auth + session security audit
  [ ] Priority 2 — SKILL.md (30 min)
  [ ] Priority 1 — Public demo API key + curl homepage example
  [ ] Priority 4 — Re-enable Discord intake cleanly and harden GitHub/Discord parity
  [x] Done — Priority 3 webhook delivery on workflow completion

Week 2 (post-launch hardening):
  [ ] Priority 6 — Telegram bot
  [ ] Priority 7 — TypeScript SDK
  [ ] Priority 8 — Security whitepaper
  [ ] Priority 5 — n8n node
  [ ] Priority 11 — URL resolution input

Later:
  [ ] Priority 9 — Email forwarding
  [ ] Priority 10 — OCR / screenshot input
  [ ] Priority 12 — Chrome Extension
  [ ] Priority 7b — CLI package
```

---

## Beacon's Core Differentiator Statement

> "HireProof audits a moment. Beacon learns a domain."
> 
> Every research run makes Beacon smarter about that topic — filtering URLs it's already read, surfacing only new developments, and compounding intelligence across weeks of runs. HireProof does one great thing once. Beacon gets better every time.
