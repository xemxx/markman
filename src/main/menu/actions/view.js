import { ipcMain } from 'electron'

export const toggleSidebar = item => {
  ipcMain.emit('set-user-pref', { toggleSidebar: item.checked })
}

export const togglePreview = item => {
  ipcMain.emit('set-user-pref', { togglePreview: item.checked })
}
