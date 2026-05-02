export interface ResearchBrief {
  id?: string
  topic: string
  depth?: 'quick' | 'deep'
  recurring?: boolean
  recurringInterval?: string
  mode?: 'full' | 'delta'
  source?: 'slack' | 'github' | 'discord' | 'dashboard' | 'mcp'
}

export interface ResearchReport {
  topic: string
  summary: string
  content: string
  sources: Source[]
  generatedAt: string
  runCount: number
  isDelta: boolean
}

export interface Source {
  index: number
  title: string
  url: string
  snippet: string
  engine: string
}

// [Memory] Core cross-session state persisted in Upstash Redis
export interface AgentMemory {
  topic: string
  seenUrls: string[]
  keyFacts: string[]
  lastRunAt: string
  runCount: number
  reportSummary: string
}

export interface QueryPlan {
  queries: {
    q: string
    engine: 'google' | 'google_news' | 'google_scholar' | 'google_jobs' | 'bing'
    intent: string
  }[]
}
