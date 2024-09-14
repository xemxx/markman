import { app } from 'electron'
import { release } from 'os'
import App from './app'
import Accessor from './app/accessor'
import { isDevelopment, isWindows, userDataPath } from './config'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

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
