import { app } from 'electron'
import { release } from 'os'
import App from './app'
import Accessor from './app/accessor'
import { isDevelopment, isWindows, userDataPath } from './config'
import installExtension from 'electron-devtools-installer'

// if (isDevelopment && !process.env.IS_TEST) {
//   app.whenReady().then(async () => {
//     await installExtension({
//       id: 'ljjemllljcmogpfapbkkighbhhppjdbg',
//       electron: '>=1.0.0',
//     })
//   })
// }

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

// if (!app.requestSingleInstanceLock()) {
//   app.quit()
//   process.exit(0)
// }

if (!process.mas && !isDevelopment) {
  const gotSingleInstanceLock = app.requestSingleInstanceLock()
  if (!gotSingleInstanceLock) {
    process.stdout.write('Other instance detected: exiting...\n')
    app.exit()
    process.exit(0)
  }
}

if (isDevelopment) {
  if (isWindows) {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

const accessor = new Accessor({
  userDataPath: userDataPath,
})

const markman = new App(accessor)
markman.init()

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// let win: BrowserWindow | null = null
// // Here, you can also use other preload
// const preload = join(__dirname, '../preload/index.js')
// // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
// const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
// const indexHtml = join(ROOT_PATH.dist, 'index.html')

// async function createWindow() {
//   win = new BrowserWindow({
//     title: 'Main window',
//     icon: join(ROOT_PATH.public, 'favicon.ico'),
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   })

//   if (app.isPackaged) {
//     win.loadFile(indexHtml)
//   } else {
//     win.loadURL(url)
//     // win.webContents.openDevTools()
//   }

//   // Test actively push message to the Electron-Renderer
//   win.webContents.on('did-finish-load', () => {
//     win?.webContents.send('main-process-message', new Date().toLocaleString())
//   })

//   // Make all links open with the browser, not with the application
//   win.webContents.setWindowOpenHandler(({ url }) => {
//     if (url.startsWith('https:')) shell.openExternal(url)
//     return { action: 'deny' }
//   })
// }

// app.whenReady().then(createWindow)

// app.on('window-all-closed', () => {
//   win = null
//   if (process.platform !== 'darwin') app.quit()
// })

// app.on('second-instance', () => {
//   if (win) {
//     // Focus on the main window if the user tried to open another
//     if (win.isMinimized()) win.restore()
//     win.focus()
//   }
// })

// app.on('activate', () => {
//   const allWindows = BrowserWindow.getAllWindows()
//   if (allWindows.length) {
//     allWindows[0].focus()
//   } else {
//     createWindow()
//   }
// })

// // new window example arg: new windows url
// ipcMain.handle('open-win', (event, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//     },
//   })

//   if (app.isPackaged) {
//     childWindow.loadFile(indexHtml, { hash: arg })
//   } else {
//     childWindow.loadURL(`${url}/#${arg}`)
//     // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
//   }
// })
