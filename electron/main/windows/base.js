import EventEmitter from 'events'
import { isLinux } from '../config'
import { join } from 'path'
import { ROOT_PATH } from '../config'
import { Debug } from '../log'

import { app } from 'electron'

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

const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
const indexHtml = join(ROOT_PATH.dist, 'index.html')

class BaseWindow extends EventEmitter {
  /**
   * @param {Accessor} accessor The application accessor for application instances.
   */
  constructor(accessor) {
    super()

    this._accessor = accessor
    this.id = null
    this.browserWindow = null
    this.type = WindowType.BASE
  }

  bringToFront() {
    const { browserWindow: win } = this

    if (win.isMinimized()) win.restore()
    if (!win.isVisible()) win.show()
    if (isLinux) {
      win.focus()
    } else {
      win.moveTop()
    }
  }

  reload() {
    this.browserWindow.reload()
  }

  destroy() {
    this.removeAllListeners()
    if (this.browserWindow) {
      this.browserWindow.destroy()
      this.browserWindow = null
    }
    this.id = null
  }

  _buildUrlString() {
    if (app.isPackaged) {
      return 'file://' + indexHtml
    }
    return url
  }
}

export default BaseWindow
