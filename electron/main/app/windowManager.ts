import { BrowserWindow, ipcMain } from 'electron'
import EventEmitter from 'events'
import { isWindows } from '../config'
import AppMenu from '../menu'
import BaseWindow from '../windows/base'

class WindowManager extends EventEmitter {
  private _activeWindowId: any
  private _appMenu: AppMenu
  private _editor: BaseWindow
  private _setting: BaseWindow
  /**
   *
   * @param {AppMenu} appMenu The application menu instance.
   */
  constructor(appMenu: AppMenu) {
    super()

    this._appMenu = appMenu

    this._activeWindowId = null
    this._editor = null
    this._setting = null

    this._listenForIpcMain()
  }

  /**
   * 添加主窗口用于管理
   * @param {BaseWindow} window The application window. We take ownership!
   */
  addEditor(window: BaseWindow) {
    this._editor = window

    window.on('window-closed', () => {
      this._appMenu.removeWindowMenu(window.id)
      this._editor.destroy()
      this._editor = null
      if (this._setting !== null) {
        this._setting.emit('window-closed')
      }
    })

    window.on('window-focus', () => {
      this.setActiveWindow(window.id)
    })
  }

  addSetting(window: BaseWindow) {
    this._setting = window

    window.on('window-closed', () => {
      this._appMenu.removeWindowMenu(window.id)
      this._setting.destroy()
      this._setting = null
    })

    window.on('window-focus', () => {
      this.setActiveWindow(window.id)
    })
  }

  get editor(): BaseWindow {
    return this._editor
  }
  get setting(): BaseWindow {
    return this._setting
  }

  setActiveWindow(windowId) {
    if (this._activeWindowId !== windowId) {
      this._activeWindowId = windowId
      if (windowId != null) {
        // 修复windows上的菜单切换问题
        if (
          isWindows &&
          this._setting != null &&
          this._setting.id == windowId
        ) {
          this._setting.browserWindow.setMenu(
            this._appMenu.getWindowMenuById(windowId),
          )
        } else {
          this._appMenu.setActiveWindow(windowId)
        }
      }
    }
  }

  _listenForIpcMain() {
    ipcMain.on('window-toggle-always-on-top', (win: any) => {
      const flag = !win.isAlwaysOnTop()
      win.setAlwaysOnTop(flag)
      this._appMenu.updateAlwaysOnTopMenu(win.id, flag)
    })
    ipcMain.on('broadcast-pref-changed', prefs => {
      if (this._editor !== null)
        this._editor.browserWindow.webContents.send('m::user-pref', prefs)
      if (this._setting !== null)
        this._setting.browserWindow.webContents.send('m::user-pref', prefs)
    })

    // ipcMain.on('m::show-activeBar-context-menu', ({ menus }) => {})
  }
}

export default WindowManager
