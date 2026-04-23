import type { FundingOutput } from '@shared/types'
import { fundingStub } from '@shared/demo-stubs'

export async function runFundingAgent(_articleText: string): Promise<FundingOutput> {
  // Stub: return demo data after realistic delay
  const delay = 5000 + Math.random() * 10000
  await new Promise((resolve) => setTimeout(resolve, delay))
  return fundingStub
}
