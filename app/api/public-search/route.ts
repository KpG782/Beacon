import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { FRAMEWORKS } from '@/lib/frameworks'

export const runtime = 'nodejs'

interface SearchSource {
  file: string
  href: string
  title: string
}

interface IndexedEntry {
  href: string
  title: string
  searchContent: string
  snippetContent: string
}

const SEARCH_SOURCES: SearchSource[] = [
  { file: 'app/docs/page.tsx', href: '/docs', title: 'Docs Overview' },
  { file: 'app/docs/quickstart/page.tsx', href: '/docs/quickstart', title: 'Quickstart' },
  { file: 'app/docs/frameworks/page.tsx', href: '/docs/frameworks', title: 'Framework Guide' },
  { file: 'app/docs/api/page.tsx', href: '/docs/api', title: 'API Reference' },
  { file: 'app/docs/mcp/page.tsx', href: '/docs/mcp', title: 'MCP Guide' },
  { file: 'app/docs/authentication/page.tsx', href: '/docs/authentication', title: 'Authentication' },
  { file: 'app/docs/rate-limits/page.tsx', href: '/docs/rate-limits', title: 'Rate Limits' },
  { file: 'app/docs/security/page.tsx', href: '/docs/security', title: 'Security' },
  { file: 'app/docs/deployment/page.tsx', href: '/docs/deployment', title: 'Deployment' },
  { file: 'app/docs/architecture/page.tsx', href: '/docs/architecture', title: 'Architecture' },
  { file: 'app/docs/roadmap/page.tsx', href: '/docs/roadmap', title: 'Roadmap' },
  { file: 'app/support/page.tsx', href: '/support', title: 'Support' },
  { file: 'app/privacy/page.tsx', href: '/privacy', title: 'Privacy Policy' },
  { file: 'app/terms/page.tsx', href: '/terms', title: 'Terms of Service' },
  { file: 'app/disclaimer/page.tsx', href: '/disclaimer', title: 'Disclaimer' },
  { file: 'app/trial/page.tsx', href: '/trial', title: 'Trial' },
  { file: 'app/page.tsx', href: '/', title: 'Landing' },
]

let cache: IndexedEntry[] | null = null

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeSource(raw: string): string {
  return raw
    .replace(/import[\s\S]*?from\s+['"][^'"]+['"];?/g, ' ')
    .replace(/className=\{?["'`][\s\S]*?["'`]\}?/g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`"'{}()[\],]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSections(raw: string, source: SearchSource): IndexedEntry[] {
  const entries: IndexedEntry[] = []
  const sectionRegex = /<DocsSection([^>]*)>([\s\S]*?)<\/DocsSection>/g

  let match: RegExpExecArray | null
  while ((match = sectionRegex.exec(raw)) !== null) {
    const attrs = match[1] ?? ''
    const sectionRaw = match[2] ?? ''

    const idMatch = attrs.match(/id="([^"]+)"/)
    const titleMatch = attrs.match(/title="([^"]+)"/) ?? attrs.match(/title=\{`([^`]+)`\}/)

    const sectionTitle = titleMatch?.[1]?.replace(/\$\{[^}]+\}/g, '').trim() || source.title
    const sectionId = idMatch?.[1] || slugify(sectionTitle)
    if (!sectionId) continue

    const snippetContent = sanitizeSource(sectionRaw)
    if (!snippetContent) continue

    entries.push({
      href: `${source.href}#${sectionId}`,
      title: sectionTitle === source.title ? `${source.title} section` : `${source.title} — ${sectionTitle}`,
      searchContent: `${sectionTitle} ${snippetContent}`.toLowerCase(),
      snippetContent,
    })
  }

  return entries
}

function frameworkEntries(): IndexedEntry[] {
  return FRAMEWORKS.map((framework) => {
    const categoryAnchor = slugify(framework.category)
    const snippetContent = `${framework.name}. ${framework.description} ${framework.queryHint} ${framework.synthesisHint}`
    return {
      href: `/docs/frameworks#${categoryAnchor}`,
      title: `Framework — ${framework.name}`,
      searchContent: `${framework.id} ${framework.name} ${framework.category} ${framework.description} ${framework.queryHint} ${framework.synthesisHint}`.toLowerCase(),
      snippetContent,
    }
  })
}

async function loadIndex(): Promise<IndexedEntry[]> {
  if (cache) return cache

  const cwd = process.cwd()
  const fileEntries = await Promise.all(
    SEARCH_SOURCES.map(async (source) => {
      const abs = path.join(/* turbopackIgnore: true */ cwd, source.file)
      const raw = await readFile(abs, 'utf8')
      const pageContent = sanitizeSource(raw)
      const sections = extractSections(raw, source)

      const pageEntry: IndexedEntry = {
        href: source.href,
        title: source.title,
        searchContent: `${source.title} ${pageContent}`.toLowerCase(),
        snippetContent: pageContent,
      }

      return [pageEntry, ...sections]
    })
  )

  cache = [...fileEntries.flat(), ...frameworkEntries()]
  return cache
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0
  return haystack.split(needle).length - 1
}

function buildSnippet(snippetSource: string, query: string): string {
  if (!snippetSource) return ''
  const lower = snippetSource.toLowerCase()
  const idx = lower.indexOf(query)
  if (idx === -1) return snippetSource.slice(0, 180).trim()

  const start = Math.max(0, idx - 70)
  const end = Math.min(snippetSource.length, idx + query.length + 90)
  return snippetSource.slice(start, end).trim()
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().toLowerCase()
  if (q.length < 2) return NextResponse.json({ results: [] })

  const index = await loadIndex()
  const terms = q.split(/\s+/).filter(Boolean)

  const scored = index
    .map((entry) => {
      const score = terms.reduce((sum, term) => {
        const contentHits = countOccurrences(entry.searchContent, term)
        const titleHits = countOccurrences(entry.title.toLowerCase(), term) * 4
        const hrefHits = entry.href.toLowerCase().includes(term) ? 2 : 0
        return sum + contentHits + titleHits + hrefHits
      }, 0)
      if (score === 0) return null

      return {
        href: entry.href,
        title: entry.title,
        snippet: buildSnippet(entry.snippetContent, terms[0]),
        score,
      }
    })
    .filter((item): item is { href: string; title: string; snippet: string; score: number } => !!item)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  return NextResponse.json({
    results: scored.map(({ score, ...rest }) => rest),
  })
}
