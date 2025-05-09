import { BrowserWindow, dialog, shell } from 'electron'
import { BaseWindow, WindowType } from './base'
import {
  TITLE_BAR_HEIGHT,
  editorWinOptions,
  isWindows,
  //  isLinux
} from '../config'
import Accessor from '../app/accessor'
import { format } from 'url'

export class EditorWindow extends BaseWindow {
  /**
   * @param {Accessor} accessor The application accessor for application instances.
   */
  constructor(accessor: Accessor) {
    super(accessor)
    this.type = WindowType.EDITOR
    this.url = this._buildUrlString() + '#/editorBase'
  }

  /**
   * Creates a new editor window.
   * @param {*} [options] The BrowserWindow options.
   */
  createWindow(options: any = {}) {
    const { menu: appMenu } = this._accessor

    const winOptions = Object.assign(
      { width: 1200, height: 800 },
      editorWinOptions,

      options,
    )

    let win = (this.browserWindow = new BrowserWindow(winOptions))
    this.id = win.id

    // Create a menu for the current window
    appMenu.addEditorMenu(win)

    win.on('ready-to-show', () => {
      win.show()
    })

    // 当页面加载完成时
    win.webContents.once('did-finish-load', () => {
      // Restore and focus window
      super.bringToFront()
    })

    // 页面崩溃提示框
    win.webContents.once('render-process-gone', async (event, details) => {
      if (details.reason !== 'crashed' && details.reason !== 'killed') return
      const msg = `The renderer process has crashed unexpected or is killed (${details.reason}).`
      const { response } = await dialog.showMessageBox(win, {
        type: 'warning',
        buttons: ['Close', 'Reload', 'Keep It Open'],
        message: 'Mark Text has crashed',
        detail: msg,
      })

      if (win.id) {
        switch (response) {
          case 0:
            return this.emit('window-closed')
          case 1:
            return super.reload()
        }
      }
    })

    win.on('focus', () => {
      this.emit('window-focus')
    })

    // The window is now destroyed.
    win.on('closed', () => {
      this.emit('window-closed')
    })

    win.on('resize', () => {
      win.webContents.send('m::resize-editor')
    })

    win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    win.loadURL(format(this.url))
    win.setSheetOffset(TITLE_BAR_HEIGHT)

    return win
  }
}
