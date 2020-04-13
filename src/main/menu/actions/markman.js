import { ipcMain } from 'electron'

let runningUpdate = false

export const userSetting = () => {
  ipcMain.emit('app-create-settings-window')
}

export const checkUpdates = () => {
  // TODO: 版本更新
  if (!runningUpdate) {
    runningUpdate = true
    console.log('update')
  }
}
