import path from 'path'
import { BrowserWindow } from 'electron'
import BaseWindow, { WindowType } from './base'
import {
  TITLE_BAR_HEIGHT,
  preferencesWinOptions,
  isLinux,
  isWindows,
  ROOT_PATH,
} from '../config'
import Accessor from '../app/accessor'
import { enable } from '@electron/remote/main'

class SettingWindow extends BaseWindow {
  /**
   * @param {Accessor} accessor The application accessor for application instances.
   */
  constructor(accessor: Accessor) {
    super(accessor)
    this.type = WindowType.SETTINGS
    this.url = this._buildUrlString() + '#/preference'
  }

  /**
   * Creates a new setting window.
   *
   * @param {*} [options] BrowserWindow options.
   */
  createWindow(options: any = {}) {
    const { menu: appMenu } = this._accessor
    const winOptions = Object.assign({}, preferencesWinOptions, options)

    if (isLinux) {
      winOptions.icon = path.join(ROOT_PATH.public, 'icons/png/128x128.png')
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
      win.show()
    })

    // 当页面加载完成时
    win.webContents.once('did-finish-load', () => {
      // Restore and focus window
      this.bringToFront()
    })

    win.on('focus', () => {
      this.emit('window-focus')
    })

    // The window is now destroyed.
    win.on('closed', () => {
      this.emit('window-closed')
    })
    enable(win.webContents)
    win.loadURL(this.url)
    win.setSheetOffset(TITLE_BAR_HEIGHT)

    return win
  }
}

export default SettingWindow
