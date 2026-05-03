# Beacon Landing + Documentation Gap Analysis

## Goal
Compare Beacon's current landing/docs/support structure against the HireProof documentation example and identify the highest-leverage improvements.

## What HireProof does well
- Clear navbar segmentation: product, docs, API, SDK, security, integrations, legal.
- Fast demo path at the top of the page.
- Strong documentation hierarchy with obvious "where to start" links.
- Explicit access-surface explanation: web app, API, MCP, extension, SDK, skills.
- Strong footer structure with product, resources, legal, and author/company information.
- Clear distinction between shipped functionality and surrounding ecosystem assets.
- Good developer trust signals: API example, auth mention, security pages, rate limiting, whitepaper.

## Where Beacon was weaker before this update
- The landing page had strong visual identity but weaker information architecture.
- Navbar focus was not explicit enough for first-time users deciding where to go next.
- Footer structure was missing, so docs/support/author context was under-explained.
- Access surfaces existed in the product, but the landing page did not explain them clearly enough.
- Documentation lived in-app but was not surfaced as a primary landing-page destination.
- Support and docs were separated correctly in code, but that distinction was not obvious from the homepage.
- The author/maintainer signal was present in metadata but not made visible in the landing experience.

## Improvements now added
- Proper navbar with direct paths to demo, docs, support, and dashboard.
- Hero section now explains what Beacon is, why it matters, and what to do first.
- Dedicated "access surfaces" section to explain trial, dashboard, docs, support, graph, and memory bank.
- Footer now includes product links, resource links, and author details.
- Landing page now explicitly explains what docs, support, and author sections should contain.

## Remaining gaps compared with HireProof
- Beacon still lacks a fully segmented developer portal structure such as:
  - API reference
  - MCP reference
  - Security page
  - Authentication page
  - Rate limiting page
  - Self-hosting or deployment guide
  - Legal pages such as privacy policy and terms
- Beacon docs are useful but still read more like internal product notes than polished external-facing documentation.
- There is no quick public API example on the landing page today.
- There is no explicit "architecture" or "how it works" docs page separate from the marketing landing page.
- There is no dedicated "competitive roadmap" or "what is shipped vs planned" page beyond the docs copy.

## Recommended next steps
1. Create dedicated docs subpages for:
   - Quickstart
   - API Reference
   - MCP Guide
   - Authentication
   - Rate Limiting
   - Security
   - Deployment / Self-Hosting
2. Add a small "try Beacon via API" example to the landing page or docs hero.
3. Add legal pages:
   - Privacy Policy
   - Terms of Service
   - Disclaimer
4. Create a clearer "Architecture" page describing:
   - context layer
   - memory layer
   - harness layer
   - workflow runtime
5. Add a stronger author/project trust section:
   - builder identity
   - repo link
   - hackathon context
   - current maturity and roadmap

## Priority order
- Highest priority:
  - Quickstart
  - API Reference
  - Authentication / Rate Limiting
  - Security page
- Medium priority:
  - Architecture page
  - Legal pages
  - Public API example
- Lower priority:
  - Competitive roadmap
  - Extra ecosystem packaging pages

## Practical takeaway
Beacon already has differentiated product behavior through memory, workflows, and framework-guided research. The biggest remaining opportunity is not the core system itself. It is packaging the system with clearer developer-facing docs, trust signals, and navigation so first-time users understand the product faster.
