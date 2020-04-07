import EventEmitter from 'events'
import { isLinux } from '../config'

/**
 * @typedef {BaseWindow} IApplicationWindow
 * @property {number | null} id Identifier (= browserWindow.id) or null during initialization.
 * @property {Electron.BrowserWindow} browserWindow The browse window.
 * @property {WindowType} type The window type.
 */

export const WindowType = {
  BASE: 'base', // You shold never create a `BASE` window.
  EDITOR: 'editor',
  SETTINGS: 'settings'
}

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
    let baseUrl = process.env.WEBPACK_DEV_SERVER_URL
      ? process.env.WEBPACK_DEV_SERVER_URL
      : `file://./index.html/`
    return baseUrl
  }
}

export default BaseWindow
