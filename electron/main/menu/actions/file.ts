// --- menu -------------------------------------
import { ipcMain } from 'electron'
export const exportFile = (win, type) => {
  // TODO: 导出为文件
  if (win && win.webContents) {
    console.log('export-file', type)
    //win.webContents.send('mt::show-export-dialog', type)
  }
}

export const save = (win: Electron.BrowserWindow | undefined) => {
  if (win && win.webContents) {
    win.webContents.send('m::file-save')
  }
}

export const autoSave = menuItem => {
  const { checked } = menuItem
  ipcMain.emit('set-user-pref', { autoSave: checked })
}
