export interface UserKeys {
  groqApiKey?: string
  serpApiKey?: string
}

export interface ResearchBrief {
  id?: string
  topic: string
  objective?: string
  focus?: string
  depth?: 'quick' | 'deep'
  timeframe?: '7d' | '30d' | '90d' | 'all'
  reportStyle?: 'executive' | 'bullet' | 'memo' | 'framework'
  recurring?: boolean
  recurringInterval?: string
  mode?: 'full' | 'delta'
  source?: 'slack' | 'github' | 'discord' | 'dashboard' | 'mcp'
  frameworkId?: string
  userKeys?: UserKeys
}

export interface ResearchReport {
  topic: string
  summary: string
  content: string
  sources: Source[]
  generatedAt: string
  runCount: number
  isDelta: boolean
  queryPlan?: QueryPlan
  deltaUrls?: string[]
}

export interface Source {
  index: number
  title: string
  url: string
  snippet: string
  engine: string
}

export interface RunSummary {
  runAt: string
  runCount: number
  urlsAdded: number
  factsAdded: number
  summary: string
}

// [Memory] Core cross-session state persisted in Upstash Redis
export interface AgentMemory {
  topic: string
  seenUrls: string[]
  keyFacts: string[]
  factSources?: string[]
  lastRunAt: string
  runCount: number
  reportSummary: string
  runs?: RunSummary[]
}

export interface QueryPlan {
  queries: {
    q: string
    engine: 'google' | 'google_news' | 'google_scholar' | 'google_jobs' | 'bing'
    intent: string
  }[]
}

// v2 external read models — stable shapes for MCP and CLI consumers
export interface TopicMemoryView {
  topic: string
  keyFacts: string[]
  reportSummary: string
  lastRunAt: string
  runCount: number
}

export interface TopicDeltaView {
  topic: string
  currentRunId: string
  previousRunId?: string
  summary: string
  changedSources: string[]
  isDelta: boolean
  generatedAt: string
}

export interface RunRecord {
  runId: string
  topic: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  mode: 'full' | 'delta'
  runCount: number
  source: string
  recurring: boolean
  startedAt: string
  completedAt?: string
}
