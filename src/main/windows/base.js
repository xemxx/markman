import EventEmitter from 'events'
import { isLinux } from '../config'

/**
 * @typedef {BaseWindow} IApplicationWindow
 * @property {number | null} id Identifier (= browserWindow.id) or null during initialization.
 * @property {Electron.BrowserWindow} browserWindow The browse window.
 * @property {WindowLifecycle} lifecycle The window lifecycle state.
 * @property {WindowType} type The window type.
 */

export const WindowType = {
  BASE: 'base', // You shold never create a `BASE` window.
  EDITOR: 'editor',
  SETTINGS: 'settings'
}

export const WindowLifecycle = {
  NONE: 0,
  LOADING: 1,
  READY: 2,
  QUITTED: 3
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
    this.lifecycle = WindowLifecycle.NONE
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
    this.lifecycle = WindowLifecycle.QUITTED
    this.emit('window-closed')

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
      : `app://./index.html/`
    return baseUrl
  }
}

export default BaseWindow
