import EventEmitter from 'events'
import { isLinux } from '../config'
import { join } from 'path'
import { ROOT_PATH } from '../config'
import { Debug } from '../log'

import { app, BrowserWindow } from 'electron'
import Accessor from '../app/accessor'

/**
 * @typedef {BaseWindow} IApplicationWindow
 * @property {number | null} id Identifier (= browserWindow.id) or null during initialization.
 * @property {Electron.BrowserWindow} browserWindow The browse window.
 * @property {WindowType} type The window type.
 */

export const WindowType = {
  BASE: 'base', // You shold never create a `BASE` window.
  EDITOR: 'editor',
  SETTINGS: 'settings',
}

const url = process.env.VITE_DEV_SERVER_URL + '#/editorBase'
const indexHtml = join(ROOT_PATH.dist, 'index.html/#/editorBase')

class BaseWindow extends EventEmitter {
  protected _accessor: Accessor
  id: number
  browserWindow: BrowserWindow | null
  type: string
  url: string

  /**
   * @param {Accessor} accessor The application accessor for application instances.
   */
  public constructor(accessor: Accessor) {
    super()

    this._accessor = accessor
    this.id = 0
    this.browserWindow = null
    this.type = WindowType.BASE
    this.url = ''
  }

  bringToFront() {
    const { browserWindow: win } = this
    if (!win) {
      Debug('Window not found.')
      return
    }

    if (win.isMinimized()) win.restore()
    if (!win.isVisible()) win.show()
    if (isLinux) {
      win?.focus()
    } else {
      win?.moveTop()
    }
  }

  reload() {
    this.browserWindow?.reload()
  }

  destroy() {
    this.removeAllListeners()
    if (this.browserWindow) {
      this.browserWindow.destroy()
      this.browserWindow = null
    }
    this.id = 0
  }

  _buildUrlString() {
    if (app.isPackaged) {
      return 'file://' + indexHtml
    }
    return url
  }
}

export default BaseWindow
