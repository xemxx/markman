import { isOsx, isLinux } from '../config'
import { app, ipcMain } from 'electron'

import { EditorWindow, SettingWindow } from '../windows'
import Accessor from './accessor'

export default class App {
  private _accessor: Accessor

  constructor(accessor: Accessor) {
    this._accessor = accessor
    this._listenForIpcMain()
  }
  ready = () => {
    this._createEditorWindow()
  }
  init() {
    app.on('second-instance', () => {
      const { windowManager } = this._accessor
      // 当运行第二个实例时,activeWindow
      const activeWindow = windowManager.editor
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
      if (this._accessor.windowManager.editor === null) {
        this.ready()
      } else {
        const { windowManager } = this._accessor
        const activeWindow = windowManager.editor
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
    this._accessor.windowManager.addEditor(editor)
    return editor
  }

  // 创建偏好设置窗口
  _createSettingWindow() {
    if (
      this._accessor.windowManager.editor?.browserWindow === null ||
      this._accessor.windowManager.editor === undefined
    ) {
      return
    }
    // 通过定义的窗口类创建
    const setting = new SettingWindow(this._accessor)
    setting.createWindow({
      parent: this._accessor.windowManager.editor?.browserWindow,
    })
    // 添加到窗口管理模块中
    this._accessor.windowManager.addSetting(setting)
  }

  // 打开偏好设置窗口
  _openSettingsWindow() {
    const settingWins = this._accessor.windowManager.setting
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
      if (this._accessor.preference.isLogging == true) {
        this._openSettingsWindow()
      }
    })

    ipcMain.on('m::set-logging-state', (e, state: boolean) => {
      console.log('m::set-logging-state', state)
      this._accessor.preference.isLogging = state
      if (state == false) {
        const settingWins = this._accessor.windowManager.setting
        if (settingWins !== null) {
          settingWins.browserWindow?.close()
          settingWins.destroy()
        }
      }
      this._accessor.menu.updatePreferenceEnabled(state)
    })

    ipcMain.handle(
      'm::app-get-path',
      (
        e,
        name:
          | 'home'
          | 'appData'
          | 'userData'
          | 'sessionData'
          | 'temp'
          | 'exe'
          | 'module'
          | 'desktop'
          | 'documents'
          | 'downloads'
          | 'music'
          | 'pictures'
          | 'videos'
          | 'recent'
          | 'logs'
          | 'crashDumps',
      ): string => {
        return app.getPath(name)
      },
    )
  }
}
