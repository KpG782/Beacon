// Pure serialization helpers — no async, no side effects, safe to use in browser

export interface ExportSource {
  url: string
  title?: string
  snippet?: string
  engine?: string
  index?: number
}

export interface ExportQueryEntry {
  q: string
  engine: string
  intent: string
  track?: string
}

export interface ExportBrief {
  runId: string
  topic?: string
  frameworkId?: string
  runCount?: number
  hasMemory?: boolean
  recurring?: boolean
  report?: string
  sources?: ExportSource[]
  queryPlan?: { queries: ExportQueryEntry[] }
  deltaUrls?: string[]
  createdAt?: string
  updatedAt?: string
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function briefToMarkdown(brief: ExportBrief): string {
  const lines: string[] = []

  lines.push(`# ${brief.topic ?? 'Research Report'}`)
  lines.push('')

  const meta: string[] = []
  if (brief.frameworkId) meta.push(`Framework: ${brief.frameworkId}`)
  if (brief.runCount) meta.push(`Run: #${brief.runCount}`)
  if (brief.hasMemory !== undefined) meta.push(`Mode: ${brief.hasMemory ? 'Delta (memory loaded)' : 'Baseline (first run)'}`)
  if (brief.createdAt) meta.push(`Date: ${new Date(brief.createdAt).toISOString().split('T')[0]}`)

  if (meta.length > 0) {
    meta.forEach(m => lines.push(`> ${m}`))
    lines.push('')
  }

  if (brief.report) {
    lines.push(brief.report)
    lines.push('')
  }

  if (brief.sources && brief.sources.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Sources')
    lines.push('')
    brief.sources.forEach((src, i) => {
      const isNew = brief.deltaUrls?.includes(src.url)
      const newLabel = isNew ? ' *(new this run)*' : ''
      lines.push(`${i + 1}. [${src.title || src.url}](${src.url})${newLabel}`)
      if (src.snippet) {
        lines.push(`   > ${src.snippet.replace(/\n/g, ' ').slice(0, 200)}`)
      }
    })
  }

  return lines.join('\n')
}

export function sourcesToCsv(sources: ExportSource[], deltaUrls?: string[]): string {
  const deltaSet = new Set(deltaUrls ?? [])
  const header = ['url', 'title', 'snippet', 'engine', 'isDelta', 'index']
  const rows = sources.map(src => [
    src.url,
    src.title ?? '',
    src.snippet ?? '',
    src.engine ?? '',
    deltaSet.has(src.url) ? 'true' : 'false',
    String(src.index ?? ''),
  ].map(v => csvEscape(v)))

  return [header.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function briefToJson(brief: ExportBrief): string {
  const pkg = {
    runId: brief.runId,
    topic: brief.topic ?? null,
    frameworkId: brief.frameworkId ?? null,
    runCount: brief.runCount ?? 1,
    hasMemory: brief.hasMemory ?? false,
    recurring: brief.recurring ?? false,
    createdAt: brief.createdAt ?? null,
    updatedAt: brief.updatedAt ?? null,
    queryPlan: brief.queryPlan ?? null,
    sources: (brief.sources ?? []).map((src, i) => ({
      index: src.index ?? i,
      url: src.url,
      title: src.title ?? '',
      snippet: src.snippet ?? '',
      engine: src.engine ?? '',
      isDelta: brief.deltaUrls?.includes(src.url) ?? false,
    })),
    report: {
      content: brief.report ?? null,
      deltaUrls: brief.deltaUrls ?? [],
    },
  }
  return JSON.stringify(pkg, null, 2)
}

export function triggerDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
