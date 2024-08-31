import fse from 'fs-extra'
import fs from 'fs'
import path from 'path'
import EventEmitter from 'events'
import Store from 'electron-store'
import { BrowserWindow, ipcMain } from 'electron'
import { hasSameKeys } from '../utils'
import { Debug } from '../log'
import { ROOT_PATH } from '../config'

import { schema } from './schema'

const PREFERENCES_FILE_NAME = 'preferences'

class Preference extends EventEmitter {
  preferencesPath: string
  hasPreferencesFile: boolean
  store: Store<{
    autoSave: unknown
    autoSaveDelay: unknown
    toggleSidebar: unknown
  }>
  staticPath: string
  constructor(preferencesPath: string) {
    super()

    this.preferencesPath = preferencesPath
    this.hasPreferencesFile = fs.existsSync(
      path.join(this.preferencesPath, `./${PREFERENCES_FILE_NAME}.json`),
    )
    this.store = new Store({
      schema: schema,
      name: PREFERENCES_FILE_NAME,
    })

    this.staticPath = path.join(ROOT_PATH.public, 'preference.json')
    this.init()
  }

  init() {
    let defaultSettings: any = null
    try {
      defaultSettings = fse.readJsonSync(this.staticPath)
    } catch (err) {
      console.error(err)
    }

    if (!defaultSettings) {
      throw new Error('Can not load static preference.json file')
    }

    if (!this.hasPreferencesFile) {
      this.store.set(defaultSettings)
    } else {
      const userSetting = this.getAll()
      // Update outdated settings
      const requiresUpdate = !hasSameKeys(defaultSettings, userSetting)
      const userSettingKeys = Object.keys(userSetting)
      const defaultSettingKeys = Object.keys(defaultSettings)

      if (requiresUpdate) {
        // remove outdated settings
        for (const key of userSettingKeys) {
          if (!defaultSettingKeys.includes(key)) {
            delete userSetting[key]
          }
        }
        // add new setting options
        for (const key in defaultSettings) {
          if (!userSettingKeys.includes(key)) {
            userSetting[key] = defaultSettings[key]
          }
        }
        // 旧的数据会被覆盖
        this.store.set(userSetting)
      }
    }
    this._listenForIpcMain()
  }

  getAll() {
    return this.store.store
  }

  setItem(key: string, value: string | boolean) {
    Debug('Event: broadcast-pref-changed' + ' key: ' + key + ' value: ' + value)
    ipcMain.emit('broadcast-pref-changed', { [key]: value })
    return this.store.set(key, value)
  }

  getItem(key: string) {
    return this.store.get(key)
  }

  /**
   * Change multiple setting entries.
   *
   * @param {Object.<string, *>} settings A settings object or subset object with key/value entries.
   */
  setItems(settings: Electron.IpcMainEvent) {
    if (!settings) {
      console.error(
        'Cannot change settings without entires: object is undefined or null.',
      )
      return
    }

    Object.keys(settings).map(key => {
      this.setItem(key, settings[key])
    })
  }

  _listenForIpcMain() {
    ipcMain.on('m::get-user-pref', e => {
      const win = BrowserWindow.fromWebContents(e.sender)
      win?.webContents.send('m::user-pref', this.getAll())
    })
    ipcMain.on('m::set-user-pref', (e, settings) => {
      Debug(settings)
      this.setItems(settings)
    })
    ipcMain.on('set-user-pref', settings => {
      this.setItems(settings)
    })
    ipcMain.on('m::cmd-toggle-autosave', () => {
      this.setItem('autoSave', !this.getItem('autoSave'))
    })
  }
}

export default Preference
