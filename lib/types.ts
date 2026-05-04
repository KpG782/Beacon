export interface UserKeys {
  groqApiKey?: string
  serpApiKey?: string
}

export interface TokenBudget {
  trackSynthTokens: number  // max output tokens per track agent (deep mode)
  finalSynthTokens: number  // max output tokens for validateAndMerge / synthesizeReport
}

export interface ResearchBrief {
  id?: string
  userId?: string
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
  frameworkIds?: string[]   // consensus mode: 2-3 frameworks evaluated in parallel
  tokenBudget?: TokenBudget
  userKeys?: UserKeys
  webhookUrl?: string
}

// Per-framework structured evaluation — produced by consensus mode
export interface FrameworkScorecard {
  frameworkId: string
  frameworkName: string
  score: number              // 0-100
  confidence: number         // 0.0-1.0
  verdict: 'strong' | 'promising' | 'conditional' | 'caution' | 'weak'
  strengths: string[]
  risks: string[]
  evidence: string[]         // source index refs like "[1]", "[3]"
  notes: string
}

export interface ComparativeResearchReport {
  frameworkIds: string[]
  frameworkScorecards: FrameworkScorecard[]
  finalScore: number
  confidenceScore: number
  disagreementScore: number
  finalVerdict: string
  consensusSummary: string
  disagreementSummary: string
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
  comparative?: ComparativeResearchReport
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
  userId?: string
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
    track?: 'exploration' | 'competitive' | 'signals'
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

export interface WebhookDeliveryState {
  status: 'pending' | 'delivered' | 'failed'
  attempts: number
  lastAttemptAt?: string
  deliveredAt?: string
  responseStatus?: number
  error?: string
}
