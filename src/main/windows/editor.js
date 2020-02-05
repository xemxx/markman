import { BrowserWindow, dialog } from 'electron'
import BaseWindow, { WindowLifecycle, WindowType } from './base'
import { TITLE_BAR_HEIGHT, editorWinOptions, isWindows } from '../config'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

class EditorWindow extends BaseWindow {
  /**
   * @param {Accessor} accessor The application accessor for application instances.
   */
  constructor(accessor) {
    super(accessor)
    this.type = WindowType.EDITOR
  }

  /**
   * Creates a new editor window.
   * @param {*} [options] The BrowserWindow options.
   */
  createWindow(options = {}) {
    const { menu: appMenu } = this._accessor

    const winOptions = Object.assign(
      { width: 1200, height: 800 },
      editorWinOptions,
      options
    )

    if (isWindows) {
      options.frame = false // 创建一个frameless窗口，详情：https://electronjs.org/docs/api/frameless-window
    }

    let win = (this.browserWindow = new BrowserWindow(winOptions))
    this.id = win.id

    // Create a menu for the current window
    appMenu.addEditorMenu(win)
    appMenu.setActiveWindow(win.id)

    win.once('ready-to-show', () => {
      win.show()
    })

    // 当页面加载完成时
    win.webContents.once('did-finish-load', () => {
      this.lifecycle = WindowLifecycle.READY
      this.emit('window-ready')

      // Restore and focus window
      this.bringToFront()
    })

    win.webContents.once('did-fail-load', () => {})

    //防止意外关闭
    win.webContents.once('crashed', async (event, killed) => {
      const msg = `The renderer process has crashed unexpected or is killed (${killed}).`

      const { response } = await dialog.showMessageBox(win, {
        type: 'warning',
        buttons: ['Close', 'Reload', 'Keep It Open'],
        message: 'Mark Text has crashed',
        detail: msg
      })

      if (win.id) {
        switch (response) {
          case 0:
            return this.destroy()
          case 1:
            return this.reload()
        }
      }
    })

    // The window is now destroyed.
    win.on('closed', () => {
      this.lifecycle = WindowLifecycle.QUITTED
      this.emit('window-closed')

      // Free window reference
      win = null
    })

    this.lifecycle = WindowLifecycle.LOADING
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html')
    }
    win.setSheetOffset(TITLE_BAR_HEIGHT)

    return win
  }

  reload() {
    const { browserWindow } = this

    browserWindow.webContents.once('did-finish-load', () => {
      this.lifecycle = WindowLifecycle.LOADING
      super.reload()
    })
  }

  destroy() {
    super.destroy()
  }
}

export default EditorWindow
