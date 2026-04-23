import { contextBridge, ipcRenderer } from 'electron'

const api = {
  onAgentProgress: (callback: (event: unknown) => void): void => {
    ipcRenderer.on('agent:progress', (_event, data) => callback(data))
  },
  onAnalysisComplete: (callback: (result: unknown) => void): void => {
    ipcRenderer.on('analysis:complete', (_event, data) => callback(data))
  },
  onAnalysisError: (callback: (error: string) => void): void => {
    ipcRenderer.on('analysis:error', (_event, error) => callback(error))
  },
  onTriggerFromHotkey: (callback: () => void): void => {
    ipcRenderer.on('analysis:trigger-from-hotkey', () => callback())
  },
  onTriggerClipboard: (callback: (text: string) => void): void => {
    ipcRenderer.on('analysis:trigger-clipboard', (_event, text) => callback(text))
  },
  triggerAnalysis: (): Promise<void> => {
    return ipcRenderer.invoke('analysis:trigger')
  },
  triggerClipboardAnalysis: (text: string): Promise<void> => {
    return ipcRenderer.invoke('analysis:trigger-clipboard', text)
  },
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.api = api
}
