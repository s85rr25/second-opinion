import type { SteelmanOutput } from '@shared/types'
import { callClaude } from './claude'
import { STEELMAN_PROMPT } from './prompts'

export async function runSteelmanAgent(articleText: string): Promise<SteelmanOutput> {
  const result = await callClaude<Omit<SteelmanOutput, 'agent'>>({
    systemPrompt: STEELMAN_PROMPT,
    userMessage: `Article:\n<<<\n${articleText}\n>>>`,
    temperature: 0.3,
    maxTokens: 1000,
    enableWebSearch: true,
    webSearchMaxUses: 8
  })

  return {
    agent: 'steelman',
    ...result
  }
}
