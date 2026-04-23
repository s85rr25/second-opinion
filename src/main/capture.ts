import { execFile } from 'child_process'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function captureScreen(): Promise<Buffer> {
  const tmpFile = join(tmpdir(), `second-opinion-${Date.now()}.png`)

  await new Promise<void>((resolve, reject) => {
    execFile('screencapture', ['-x', tmpFile], (error) => {
      if (error) {
        reject(
          new Error(
            'Screen capture failed. Grant Screen Recording permission in System Settings > Privacy & Security.'
          )
        )
      } else {
        resolve()
      }
    })
  })

  const buffer = await readFile(tmpFile)
  await unlink(tmpFile).catch(() => {})

  if (buffer.length === 0) {
    throw new Error(
      'Captured empty screenshot. Grant Screen Recording permission in System Settings > Privacy & Security.'
    )
  }

  return buffer
}
