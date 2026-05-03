import { describe, it, expect } from 'vitest'
import { mergeUrls, filterSeenUrls, buildMemoryContext, memoryKey } from '@/lib/memory'
import type { AgentMemory } from '@/lib/types'

describe('memoryKey', () => {
  it('slugifies a plain topic', () => {
    expect(memoryKey('AI coding agents')).toBe('beacon:memory:ai-coding-agents')
  })

  it('strips special characters', () => {
    expect(memoryKey('GPT-4o & Claude 3.5!')).toBe('beacon:memory:gpt4o-claude-35')
  })

  it('truncates at 80 chars', () => {
    const long = 'a '.repeat(60).trim()
    const key = memoryKey(long)
    expect(key.length).toBeLessThanOrEqual('beacon:memory:'.length + 80)
  })
})

describe('mergeUrls', () => {
  it('deduplicates URLs', () => {
    const result = mergeUrls(['a.com', 'b.com'], ['b.com', 'c.com'])
    expect(result).toEqual(['a.com', 'b.com', 'c.com'])
  })

  it('caps at 500 URLs', () => {
    const existing = Array.from({ length: 400 }, (_, i) => `url${i}.com`)
    const newUrls  = Array.from({ length: 200 }, (_, i) => `new${i}.com`)
    expect(mergeUrls(existing, newUrls)).toHaveLength(500)
  })

  it('handles empty arrays', () => {
    expect(mergeUrls([], ['a.com'])).toEqual(['a.com'])
    expect(mergeUrls(['a.com'], [])).toEqual(['a.com'])
  })
})

describe('filterSeenUrls', () => {
  const results = [
    { results: [{ url: 'a.com' }, { url: 'b.com' }] },
    { results: [{ url: 'b.com' }, { url: 'c.com' }] },
  ]

  it('removes already-seen URLs', () => {
    const filtered = filterSeenUrls(results, ['b.com'])
    expect(filtered[0].results).toHaveLength(1)
    expect(filtered[0].results![0].url).toBe('a.com')
    expect(filtered[1].results).toHaveLength(1)
    expect(filtered[1].results![0].url).toBe('c.com')
  })

  it('returns all results when seenUrls is empty', () => {
    const filtered = filterSeenUrls(results, [])
    expect(filtered[0].results).toHaveLength(2)
    expect(filtered[1].results).toHaveLength(2)
  })

  it('returns empty results when all are seen', () => {
    const filtered = filterSeenUrls(results, ['a.com', 'b.com', 'c.com'])
    expect(filtered[0].results).toHaveLength(0)
    expect(filtered[1].results).toHaveLength(0)
  })

  it('handles missing results arrays gracefully', () => {
    const edge = [{ results: undefined }]
    expect(() => filterSeenUrls(edge as never, ['a.com'])).not.toThrow()
  })
})

describe('buildMemoryContext', () => {
  it('returns empty string for null memory', () => {
    expect(buildMemoryContext(null)).toBe('')
  })

  it('includes run count and key facts', () => {
    const memory: AgentMemory = {
      topic: 'test',
      runCount: 3,
      lastRunAt: new Date('2026-01-01').toISOString(),
      seenUrls: ['a.com', 'b.com'],
      keyFacts: ['Fact one', 'Fact two'],
      factSources: [],
      reportSummary: 'Summary text',
    }
    const ctx = buildMemoryContext(memory)
    expect(ctx).toContain('3 previous research run')
    expect(ctx).toContain('2 sources')
    expect(ctx).toContain('Fact one')
    expect(ctx).toContain('Fact two')
    expect(ctx).toContain('Summary text')
  })

  it('pluralises "run" correctly', () => {
    const memory: AgentMemory = {
      topic: 'x',
      runCount: 1,
      lastRunAt: new Date().toISOString(),
      seenUrls: [],
      keyFacts: [],
      factSources: [],
      reportSummary: '',
    }
    const ctx = buildMemoryContext(memory)
    expect(ctx).toContain('1 previous research run)')
    expect(ctx).not.toContain('1 previous research runs')
  })
})
