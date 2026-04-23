import Tesseract from 'tesseract.js'

let worker: Tesseract.Worker | null = null
let initPromise: Promise<void> | null = null

export function initOCR(): void {
  if (initPromise) return
  initPromise = (async () => {
    worker = await Tesseract.createWorker('eng')
    console.log('OCR worker pre-warmed')
  })()
}

export async function recognizeText(imageBuffer: Buffer): Promise<string> {
  if (!initPromise) initOCR()
  await initPromise

  if (!worker) throw new Error('OCR worker not initialized')

  const { data } = await worker.recognize(imageBuffer)
  return data.text.trim()
}
