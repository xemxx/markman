export const showAboutDialog = win => {
  if (win && win.webContents) {
    console.log('about-dialog')
    //win.webContents.send('mt::about-dialog')
  }
}
