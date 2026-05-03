import OpenAI from 'openai'

const BASE_URL = 'https://openrouter.ai/api/v1'

export const MODEL_MAP: Record<string, string> = {
  sonnet: process.env.OPENROUTER_SONNET_MODEL || 'anthropic/claude-sonnet-4-6',
  haiku: process.env.OPENROUTER_HAIKU_MODEL || 'anthropic/claude-haiku-4-5',
}

export interface CallResult {
  content: string
  tokensIn: number
  tokensOut: number
  model: string
}

function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Please add it to your .env.local file.'
    )
  }
  return new OpenAI({
    apiKey,
    baseURL: BASE_URL,
    defaultHeaders: {
      'X-Title': 'OpenClaw',
    },
  })
}

export async function callAgent(
  agentId: string,
  model: 'sonnet' | 'haiku',
  systemPrompt: string,
  userMessage: string,
  maxTokens = 800
): Promise<CallResult> {
  const client = getClient()
  const modelId = MODEL_MAP[model]

  const response = await client.chat.completions.create({
    model: modelId,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''
  const tokensIn = response.usage?.prompt_tokens ?? 0
  const tokensOut = response.usage?.completion_tokens ?? 0

  return { content, tokensIn, tokensOut, model: modelId }
}
