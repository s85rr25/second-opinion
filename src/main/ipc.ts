import { BrowserWindow, ipcMain } from 'electron'
import { runAnalysis } from './agents/orchestrator'
import { captureScreen } from './capture'
import { recognizeText, initOCR } from './ocr'

export function registerIPC(panelWindow: BrowserWindow): void {
  // Pre-warm OCR engine
  initOCR()

  // Screenshot + OCR + analysis pipeline
  ipcMain.handle('analysis:trigger', async () => {
    try {
      panelWindow.webContents.send('agent:progress', {
        agent: 'lineage',
        status: 'pending',
        message: 'Capturing screen...'
      })

      const screenshotBuffer = await captureScreen()
      const articleText = await recognizeText(screenshotBuffer)

      if (articleText.length < 50) {
        panelWindow.webContents.send('analysis:error', 'Not enough text captured. Try Cmd+Shift+V with text copied to clipboard.')
        return
      }

      await runAnalysis(panelWindow, articleText)
    } catch (error) {
      console.error('Analysis pipeline error:', error)
      panelWindow.webContents.send('analysis:error', String(error))
    }
  })

  // Clipboard-based analysis (demo fallback)
  ipcMain.handle('analysis:trigger-clipboard', async (_event, text: string) => {
    try {
      await runAnalysis(panelWindow, text)
    } catch (error) {
      console.error('Clipboard analysis error:', error)
      panelWindow.webContents.send('analysis:error', String(error))
    }
  })
}
