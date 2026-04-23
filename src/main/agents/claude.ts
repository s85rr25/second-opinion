import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'
import { join } from 'path'

// Load .env from project root
config({ path: join(__dirname, '../../.env') })

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set. Create a .env file with your key.')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

interface CallClaudeOptions {
  systemPrompt: string
  userMessage: string
  temperature?: number
  maxTokens?: number
  enableWebSearch?: boolean
  webSearchMaxUses?: number
}

export async function callClaude<T>(options: CallClaudeOptions): Promise<T> {
  const {
    systemPrompt,
    userMessage,
    temperature = 0.3,
    maxTokens = 2000,
    enableWebSearch = false,
    webSearchMaxUses = 5
  } = options

  const anthropic = getClient()

  const tools: Anthropic.Messages.Tool[] = enableWebSearch
    ? [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: webSearchMaxUses
        } as unknown as Anthropic.Messages.Tool
      ]
    : []

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    tools: tools.length > 0 ? tools : undefined,
    messages: [{ role: 'user', content: userMessage }]
  })

  // Extract the last text block from the response
  const textBlocks = response.content.filter(
    (block): block is Anthropic.Messages.TextBlock => block.type === 'text'
  )

  if (textBlocks.length === 0) {
    throw new Error('No text block in Claude response')
  }

  const rawText = textBlocks[textBlocks.length - 1].text
  return parseJSON<T>(rawText)
}

function parseJSON<T>(raw: string): T {
  // Stage 1: Strip markdown code fences
  let cleaned = raw.trim()
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim()
  }

  // Stage 2: Try direct parse
  try {
    return JSON.parse(cleaned)
  } catch {
    // Stage 3: Regex extraction of JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        // Fall through
      }
    }

    // Stage 4: Try array extraction
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0])
      } catch {
        // Fall through
      }
    }

    throw new Error(`Failed to parse JSON from Claude response: ${raw.substring(0, 200)}...`)
  }
}
