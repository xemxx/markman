import { BrowserWindow, dialog } from 'electron'
import BaseWindow, { WindowType } from './base'
import {
  TITLE_BAR_HEIGHT,
  editorWinOptions,
  isWindows,
  isLinux
} from '../config'
import path from 'path'
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
    if (isLinux) {
      winOptions.icon = path.join(__static, 'logo-96px.png')
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
      // Restore and focus window
      super.bringToFront()
    })

    //防止页面崩溃
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

    win.on('focus', () => {
      this.emit('window-focus')
    })

    // The window is now destroyed.
    win.on('closed', () => {
      this.emit('window-closed')
      // Free window reference
      win = null
    })

    //fix: mocano-editor大小不自动变化问题
    win.on('resize', () => {
      win.webContents.send('m::resize-editor')
    })

    win.loadURL(this._buildUrlString() + '#/')
    win.setSheetOffset(TITLE_BAR_HEIGHT)

    return win
  }

  reload() {
    const { browserWindow } = this

    browserWindow.webContents.once('did-finish-load', () => {
      super.reload()
    })
  }

  destroy() {
    super.destroy()
  }
}

export default EditorWindow
