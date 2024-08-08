'use strict'

import { isOsx, isLinux } from '../config'

import { app, ipcMain } from 'electron'

import EditorWindow from '../windows/editor'
import SettingWindow from '../windows/setting'
import Accessor from './accessor'
import WindowManager from './windowManager'

export default class App {
  private _accessor: Accessor
  private _windowManager: WindowManager

  constructor(accessor: Accessor) {
    this._accessor = accessor
    this._windowManager = accessor.windowManager
    this._listenForIpcMain()
  }
  ready = () => {
    this._createEditorWindow()
  }
  init() {
    app.on('second-instance', () => {
      const { _windowManager } = this
      // 当运行第二个实例时,activeWindow
      const activeWindow = _windowManager.editor
      if (activeWindow != null && activeWindow != undefined) {
        activeWindow.bringToFront()
      }
    })
    // app.on('ready', this.ready)
    app.whenReady().then(this.ready)

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

  // 创建主窗口.
  _createEditorWindow(options = {}) {
    // 通过定义的窗口类创建
    const editor = new EditorWindow(this._accessor)
    editor.createWindow(options)
    // 添加到窗口管理模块中
    this._windowManager.addEditor(editor)
    return editor
  }

  // 创建偏好设置窗口
  _createSettingWindow() {
    // 通过定义的窗口类创建
    const setting = new SettingWindow(this._accessor)
    setting.createWindow()
    // 添加到窗口管理模块中
    this._windowManager.addSetting(setting)
  }

  // 打开偏好设置窗口
  _openSettingsWindow() {
    const settingWins = this._windowManager.setting
    if (settingWins !== null) {
      // 如果已经存在
      const browserSettingWindow = settingWins.browserWindow
      if (isLinux) {
        browserSettingWindow?.focus()
      } else {
        browserSettingWindow?.moveTop()
      }
    } else this._createSettingWindow() // 不存在则需要创建
  }

  _listenForIpcMain() {
    ipcMain.on('app-create-settings-window', () => {
      this._openSettingsWindow()
    })
  }
}
