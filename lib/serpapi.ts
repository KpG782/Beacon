import { tool } from 'ai'
import { z } from 'zod'

// [Context] AI SDK tool — scoutModel calls this with toolChoice: 'required'
export const serpApiTool = createSerpApiTool()

// Factory — used when a user supplies their own SerpAPI key (BYOK)
export function createSerpApiTool(apiKey?: string) {
  const key = apiKey || process.env.SERPAPI_API_KEY!
  return tool({
    description: 'Search the web using SerpAPI across multiple engines.',
    parameters: z.object({
      q: z.string().describe('Search query'),
      engine: z
        .enum(['google', 'google_news', 'google_scholar', 'google_jobs', 'bing'])
        .default('google'),
      num: z.number().default(8),
    }),
    execute: async ({ q, engine, num }) => {
      const params = new URLSearchParams({
        q,
        engine,
        num: num.toString(),
        api_key: key,
      })

      const res = await fetch(`https://serpapi.com/search?${params}`)
      if (!res.ok) throw new Error(`SerpAPI ${res.status}: ${await res.text()}`)
      const data = await res.json()

      const raw =
        data.organic_results ??
        data.news_results ??
        data.jobs_results ??
        []

      return {
        engine,
        query: q,
        results: raw.slice(0, num).map((r: Record<string, unknown>) => ({
          title: r.title ?? '',
          url: r.link ?? r.url ?? '',
          snippet: r.snippet ?? r.description ?? '',
          date: r.date ?? null,
        })),
      }
    },
  })
}

// [Context] Compress SERP results into lean context — critical for token budget
export function compressSerpResults(
  results: Array<{ results?: Array<{ url?: string; snippet?: string; title?: string }> }>,
  options: { maxResults?: number } = {}
): string {
  const maxResults = options.maxResults ?? 40
  return results
    .flatMap((r) => r.results ?? [])
    .filter((r) => r.url && r.snippet)
    .slice(0, maxResults)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
    .join('\n\n')
}

// [Memory] Extract all URLs from SERP results — stored in seenUrls
export function extractAllUrls(results: Array<{ results?: Array<{ url?: string }> }>): string[] {
  return results
    .flatMap((r) => r.results ?? [])
    .map((r) => r.url)
    .filter((url): url is string => Boolean(url))
}

// [Context] Pull bullet findings from a report — stored in keyFacts
export function extractKeyFacts(reportContent: string): string[] {
  return reportContent
    .split('\n')
    .filter((line) => /^[-•*\d]/.test(line.trim()))
    .map((line) => line.replace(/^[-•*\d.]\s*/, '').trim())
    .filter((line) => line.length > 20)
    .slice(0, 10)
}

// [Memory] Extract facts with source attribution by parsing inline citations [N]
export function extractKeyFactsWithSources(
  reportContent: string,
  sources: Array<{ index: number; url: string }>
): { facts: string[]; factSources: string[] } {
  const sourceByIndex = new Map(sources.map((s) => [s.index, s.url]))
  const facts: string[] = []
  const factSources: string[] = []

  const lines = reportContent
    .split('\n')
    .filter((line) => /^[-•*\d]/.test(line.trim()))
    .map((line) => line.replace(/^[-•*\d.]\s*/, '').trim())
    .filter((line) => line.length > 20)
    .slice(0, 10)

  for (const line of lines) {
    facts.push(line.replace(/\[\d+\]/g, '').trim())
    const match = line.match(/\[(\d+)\]/)
    const citNum = match ? parseInt(match[1]) : null
    factSources.push(citNum ? (sourceByIndex.get(citNum) ?? '') : '')
  }

  return { facts, factSources }
}
