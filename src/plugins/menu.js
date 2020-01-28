import { remote, ipcMain, BrowerWindow } from 'electron'
const { Menu } = remote

function createMenu() {
  if (process.platform === 'darwin') {
    const template = [
      {
        id: 'main',
        label: 'App',
        submenu: [
          {
            id: 'save',
            label: 'save',
            accelerator: 'CmdOrCtrl+S',
            enabled: true,
            click: saveNote()
          },
          { role: 'about' },
          { role: 'quit' }
        ]
      },
      {
        id: 'edit',
        label: 'edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      }
    ]
    let menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  } else {
    // windows及linux系统
    Menu.setApplicationMenu(null)
  }
}
function saveNote() {
  ipcMain.on('send')
  BrowerWindow.webContents.send()
}

createMenu()
