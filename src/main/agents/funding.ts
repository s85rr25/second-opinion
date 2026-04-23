import type { FundingOutput } from '@shared/types'
import { callClaude } from './claude'
import { FUNDING_PROMPT } from './prompts'

export async function runFundingAgent(articleText: string): Promise<FundingOutput> {
  const result = await callClaude<Omit<FundingOutput, 'agent'>>({
    systemPrompt: FUNDING_PROMPT,
    userMessage: `Article:\n<<<\n${articleText}\n>>>`,
    temperature: 0.3,
    maxTokens: 1000,
    enableWebSearch: true,
    webSearchMaxUses: 5
  })

  return {
    agent: 'funding',
    ...result
  }
}
