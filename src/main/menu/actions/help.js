import { dialog } from 'electron'

export const showAboutDialog = win => {
  if (win && win.webContents) {
    //TODO: about window
    dialog.showMessageBoxSync({
      title: '关于markman'
    })
    //win.webContents.send('mt::about-dialog')
  }
}
