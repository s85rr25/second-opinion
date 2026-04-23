import type { TrackRecordOutput } from '@shared/types'
import { trackRecordStub } from '@shared/demo-stubs'

export async function runTrackRecordAgent(_articleText: string): Promise<TrackRecordOutput> {
  // Stub: return demo data after realistic delay
  const delay = 5000 + Math.random() * 10000
  await new Promise((resolve) => setTimeout(resolve, delay))
  return trackRecordStub
}
