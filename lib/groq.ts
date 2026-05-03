import { createGroq } from '@ai-sdk/groq'

const groqClient = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

// [Context] Fast, good at tool use and function calling — use for planning + search
export const scoutModel = groqClient('meta-llama/llama-4-scout-17b-16e-instruct')

// [Context] Better long-form writing quality — use for synthesis only
export const synthModel = groqClient('llama-3.3-70b-versatile')

// Factory functions — used when a user supplies their own Groq API key (BYOK)
export function createScoutModel(apiKey?: string) {
  if (!apiKey) return scoutModel
  return createGroq({ apiKey })('meta-llama/llama-4-scout-17b-16e-instruct')
}

export function createSynthModel(apiKey?: string) {
  if (!apiKey) return synthModel
  return createGroq({ apiKey })('llama-3.3-70b-versatile')
}
