import { ipcMain } from 'electron'

export const toggleSidebar = item => {
  ipcMain.emit('set-user-pref', { toggleSidebar: item.checked })
}
