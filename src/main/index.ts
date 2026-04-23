import { app, BrowserWindow, globalShortcut, Tray, clipboard, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { registerIPC } from './ipc'
import { captureFullText } from './capture-text'

let tray: Tray | null = null
let panelWindow: BrowserWindow | null = null

function createPanel(): BrowserWindow {
  const win = new BrowserWindow({
    width: 420,
    height: 600,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function positionPanelUnderTray(panel: BrowserWindow, trayBounds: Electron.Rectangle): void {
  const { x, y, width, height } = trayBounds
  const panelBounds = panel.getBounds()
  const panelX = Math.round(x + width / 2 - panelBounds.width / 2)
  const panelY = y + height + 4
  panel.setPosition(panelX, panelY)
}

function togglePanel(): void {
  if (!panelWindow) return
  if (panelWindow.isVisible()) {
    panelWindow.hide()
  } else {
    if (tray) {
      positionPanelUnderTray(panelWindow, tray.getBounds())
    }
    panelWindow.show()
  }
}

async function triggerAnalysis(): Promise<void> {
  if (!panelWindow) return
  try {
    const text = await captureFullText()
    if (tray) {
      positionPanelUnderTray(panelWindow, tray.getBounds())
    }
    panelWindow.show()
    panelWindow.webContents.send('analysis:trigger-clipboard', text)
  } catch (error) {
    if (tray) {
      positionPanelUnderTray(panelWindow, tray.getBounds())
    }
    panelWindow.show()
    panelWindow.webContents.send('analysis:error', String(error))
  }
}

function triggerClipboardAnalysis(): void {
  if (!panelWindow) return
  const text = clipboard.readText()
  if (text && text.length >= 50) {
    if (tray) {
      positionPanelUnderTray(panelWindow, tray.getBounds())
    }
    panelWindow.show()
    panelWindow.webContents.send('analysis:trigger-clipboard', text)
  }
}

app.dock?.hide()

app.whenReady().then(() => {
  // Create tray
  const trayIcon = nativeImage.createFromPath(
    join(__dirname, '../../resources/trayTemplate.png')
  )
  trayIcon.setTemplateImage(true)
  tray = new Tray(trayIcon)
  tray.setToolTip('Second Opinion')
  tray.on('click', (_event, bounds) => {
    if (panelWindow) {
      positionPanelUnderTray(panelWindow, bounds)
    }
    togglePanel()
  })

  // Create panel
  panelWindow = createPanel()

  // Register IPC handlers
  registerIPC(panelWindow)

  // Global hotkeys
  globalShortcut.register('CommandOrControl+Shift+S', triggerAnalysis)
  globalShortcut.register('CommandOrControl+Shift+V', triggerClipboardAnalysis)

  // Hide panel when it loses focus
  panelWindow.on('blur', () => {
    // Small delay to prevent hiding during click interactions
    setTimeout(() => {
      if (panelWindow && !panelWindow.webContents.isDevToolsOpened()) {
        panelWindow.hide()
      }
    }, 200)
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  // Keep running in tray on macOS
})
