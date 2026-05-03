import { describe, it, expect } from 'vitest'
import { compressSerpResults, extractAllUrls, extractKeyFacts, extractKeyFactsWithSources } from '@/lib/serpapi'

const sampleResults = [
  {
    results: [
      { title: 'Page A', url: 'https://a.com', snippet: 'Snippet for A' },
      { title: 'Page B', url: 'https://b.com', snippet: 'Snippet for B' },
    ],
  },
  {
    results: [
      { title: 'Page C', url: 'https://c.com', snippet: 'Snippet for C' },
      { title: 'No snippet', url: 'https://d.com' },
    ],
  },
]

describe('compressSerpResults', () => {
  it('formats results as numbered entries', () => {
    const out = compressSerpResults(sampleResults)
    expect(out).toContain('[1]')
    expect(out).toContain('Page A')
    expect(out).toContain('Snippet for A')
    expect(out).toContain('URL: https://a.com')
  })

  it('filters out entries missing url or snippet', () => {
    const out = compressSerpResults(sampleResults)
    expect(out).not.toContain('No snippet')
  })

  it('returns empty string for empty input', () => {
    expect(compressSerpResults([])).toBe('')
  })
})

describe('extractAllUrls', () => {
  it('extracts all URLs from nested results', () => {
    const urls = extractAllUrls(sampleResults)
    expect(urls).toContain('https://a.com')
    expect(urls).toContain('https://b.com')
    expect(urls).toContain('https://c.com')
  })

  it('excludes entries with no URL', () => {
    const urls = extractAllUrls(sampleResults)
    expect(urls.every(u => Boolean(u))).toBe(true)
  })

  it('returns empty array for empty input', () => {
    expect(extractAllUrls([])).toEqual([])
  })
})

describe('extractKeyFacts', () => {
  const report = `
## Summary

This is a paragraph that should be ignored.

- First key finding is very important and has enough words
- Second finding with relevant content and detail here
- Short

* Another bullet point with detailed information included
1. Numbered finding with detailed content shown here

Normal paragraph again.
`

  it('extracts bullet and numbered lines', () => {
    const facts = extractKeyFacts(report)
    expect(facts.length).toBeGreaterThan(0)
    expect(facts.some(f => f.includes('First key finding'))).toBe(true)
  })

  it('filters out lines shorter than 20 chars', () => {
    const facts = extractKeyFacts(report)
    expect(facts.every(f => f.length > 20)).toBe(true)
  })

  it('caps at 10 facts', () => {
    const manyBullets = Array.from({ length: 20 }, (_, i) => `- Fact number ${i + 1} with enough detail here`).join('\n')
    expect(extractKeyFacts(manyBullets)).toHaveLength(10)
  })

  it('returns empty array for plain prose', () => {
    expect(extractKeyFacts('No bullets here at all.')).toEqual([])
  })
})

describe('extractKeyFactsWithSources', () => {
  it('strips citation markers from fact text', () => {
    const report = '- Key finding about something important [1]'
    const sources = [{ index: 1, url: 'https://source.com' }]
    const { facts } = extractKeyFactsWithSources(report, sources)
    expect(facts[0]).not.toContain('[1]')
    expect(facts[0]).toContain('Key finding')
  })

  it('maps citations to source URLs', () => {
    const report = '- Key finding about something important [2]'
    const sources = [
      { index: 1, url: 'https://first.com' },
      { index: 2, url: 'https://second.com' },
    ]
    const { factSources } = extractKeyFactsWithSources(report, sources)
    expect(factSources[0]).toBe('https://second.com')
  })

  it('uses empty string for uncited facts', () => {
    const report = '- Key finding about something important and notable'
    const { factSources } = extractKeyFactsWithSources(report, [])
    expect(factSources[0]).toBe('')
  })
})
