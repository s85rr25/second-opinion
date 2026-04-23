import { execFile } from 'child_process'
import { clipboard } from 'electron'

const SELECT_ALL_COPY_SCRIPT = `
tell application "System Events"
  keystroke "a" using command down
  delay 0.1
  keystroke "c" using command down
end tell`

export async function captureFullText(): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    execFile('osascript', ['-e', SELECT_ALL_COPY_SCRIPT], (error) => {
      if (error) {
        reject(
          new Error(
            'Text capture failed. Grant Accessibility permission in System Settings > Privacy & Security.'
          )
        )
      } else {
        resolve()
      }
    })
  })

  // Wait for clipboard to populate
  await new Promise((r) => setTimeout(r, 200))

  const text = clipboard.readText()
  if (!text || text.length < 50) {
    throw new Error(
      'Not enough text captured from the frontmost app. Try Cmd+Shift+V with text copied to clipboard instead.'
    )
  }

  return text
}
