'use strict'

import { isOsx, isLinux } from '../config.js'

import { app, ipcMain } from 'electron'

import EditorWindow from '../windows/editor'
import SettingWindow from '../windows/setting'

export default class App {
  constructor(Accessor) {
    this._accessor = Accessor
    this._windowManager = Accessor.windowManager
    this.ready = () => {
      this._createEditorWindow()
    }
    this._listenForIpcMain()
  }

  init() {
    app.on('second-instance', () => {
      const { _windowManager } = this
      // 当运行第二个实例时,activeWindow
      const activeWindow = _windowManager.editor
      if (activeWindow) {
        activeWindow.bringToFront()
      }
    })
    app.on('ready', this.ready)

    app.on('activate', () => {
      // macOS only
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this._windowManager.editor === null) {
        this.ready()
      } else {
        const { _windowManager } = this
        const activeWindow = _windowManager.editor
        if (activeWindow) {
          activeWindow.bringToFront()
        }
      }
    })

    app.on('window-all-closed', () => {
      if (!isOsx) {
        app.quit()
      }
    })
  }

  /**
   * Creates a new editor window.
   */
  _createEditorWindow(options = {}) {
    const editor = new EditorWindow(this._accessor)
    editor.createWindow(options)
    this._windowManager.addEditor(editor)
    return editor
  }

  /**
   * Create a new setting window.
   */
  _createSettingWindow() {
    const setting = new SettingWindow(this._accessor)
    setting.createWindow()
    this._windowManager.addSetting(setting)
  }

  _openSettingsWindow() {
    const settingWins = this._windowManager.setting
    if (settingWins !== null) {
      // A setting window is already created
      const browserSettingWindow = settingWins.browserWindow
      if (isLinux) {
        browserSettingWindow.focus()
      } else {
        browserSettingWindow.moveTop()
      }
    } else this._createSettingWindow()
  }

  _listenForIpcMain() {
    ipcMain.on('app-create-settings-window', () => {
      this._openSettingsWindow()
    })
  }
}
