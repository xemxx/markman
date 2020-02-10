import { ipcMain, BrowserWindow } from 'electron'
import EventEmitter from 'events'

class WindowManager extends EventEmitter {
  /**
   *
   * @param {AppMenu} appMenu The application menu instance.
   */
  constructor(appMenu) {
    super()

    this._appMenu = appMenu

    this._editor = null
    this._setting = null

    this._listenForIpcMain()
  }

  /**
   * Add the given window to the window list.
   *
   * @param {IApplicationWindow} window The application window. We take ownership!
   */
  addEditor(window) {
    this._editor = window
    const { browserWindow } = window
    browserWindow.on('window-closed', () => {
      this._editor = null
    })

    //fix: mocano-editor大小不自动变化问题
    browserWindow.on('resize', () => {
      browserWindow.webContents.send('m::resize-editor')
    })
  }

  get editor() {
    return this._editor
  }
  get setting() {
    return this._setting
  }

  /**
   * Closes the browser window and associated application window without asking to save documents.
   *
   * @param {Electron.BrowserWindow} browserWindow The browser window.
   */
  forceClose(browserWindow) {
    if (!browserWindow) {
      return false
    }

    const { id: windowId } = browserWindow
    const { _appMenu } = this

    _appMenu.removeWindowMenu(windowId)

    browserWindow.destroy()
    return true
  }

  _listenForIpcMain() {
    // Force close a BrowserWindow
    ipcMain.on('mt::close-window', e => {
      const win = BrowserWindow.fromWebContents(e.sender)
      this.forceClose(win)
    })

    ipcMain.on('window-toggle-always-on-top', win => {
      const flag = !win.isAlwaysOnTop()
      win.setAlwaysOnTop(flag)
      this._appMenu.updateAlwaysOnTopMenu(win.id, flag)
    })
  }
}

export default WindowManager
