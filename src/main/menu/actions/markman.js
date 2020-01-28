import { ipcMain } from 'electron'

let runningUpdate = false

export const userSetting = () => {
  ipcMain.emit('app-create-settings-window')
}

export const checkUpdates = () => {
  if (!runningUpdate) {
    runningUpdate = true
    console.log('update')
  }
}
