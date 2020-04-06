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

    window.on('window-focus', () => {
      this.setActiveWindow(window.id)
    })
    window.on('window-closed', () => {
      this.remove(window.id)
    })

    //fix: mocano-editor大小不自动变化问题
    browserWindow.on('resize', () => {
      browserWindow.webContents.send('m::resize-editor')
    })
  }

  addSetting(window) {
    this._setting = window

    window.on('window-focus', () => {
      this.setActiveWindow(window.id)
    })
    window.on('window-closed', () => {
      this.remove(window.id)
    })
  }

  get editor() {
    return this._editor
  }
  get setting() {
    return this._setting
  }

  _listenForIpcMain() {
    ipcMain.on('window-toggle-always-on-top', win => {
      const flag = !win.isAlwaysOnTop()
      win.setAlwaysOnTop(flag)
      this._appMenu.updateAlwaysOnTopMenu(win.id, flag)
    })
  }
}

export default WindowManager
