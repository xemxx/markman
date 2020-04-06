import path from 'path'
import { BrowserWindow } from 'electron'
import BaseWindow, { WindowLifecycle, WindowType } from './base'
import {
  TITLE_BAR_HEIGHT,
  preferencesWinOptions,
  isLinux,
  isWindows
} from '../config'

class SettingWindow extends BaseWindow {
  /**
   * @param {Accessor} accessor The application accessor for application instances.
   */
  constructor(accessor) {
    super(accessor)
    this.type = WindowType.SETTINGS
  }

  /**
   * Creates a new setting window.
   *
   * @param {*} [options] BrowserWindow options.
   */
  createWindow(options = {}) {
    const { menu: appMenu } = this._accessor
    const winOptions = Object.assign({}, preferencesWinOptions, options)

    if (isLinux) {
      winOptions.icon = path.join(__static, 'logo-96px.png')
    }

    // WORKAROUND: Electron has issues with different DPI per monitor when
    // setting a fixed window size.
    if (isWindows) {
      winOptions.resizable = true
    }

    let win = (this.browserWindow = new BrowserWindow(winOptions))
    this.id = win.id

    // Create a menu for the current window
    appMenu.addSettingMenu(win)

    win.once('ready-to-show', () => {
      this.lifecycle = WindowLifecycle.READY
      this.emit('window-ready')
    })

    // The window is now destroyed.
    win.on('closed', () => {
      this.emit('window-closed')

      // Free window reference
      win = null
    })

    this.lifecycle = WindowLifecycle.LOADING
    win.loadURL(this._buildUrlString() + '#/preference')
    win.setSheetOffset(TITLE_BAR_HEIGHT)

    return win
  }
}

export default SettingWindow
