import { desktopCapturer } from 'electron'

export async function captureScreen(): Promise<Buffer> {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920 * 2, height: 1080 * 2 } // 2x for Retina
  })

  const primarySource = sources[0]
  if (!primarySource) {
    throw new Error('No screen source available. Check Screen Recording permission.')
  }

  const image = primarySource.thumbnail
  if (image.isEmpty()) {
    throw new Error('Captured empty screenshot. Grant Screen Recording permission in System Settings > Privacy & Security.')
  }

  return image.toPNG()
}
