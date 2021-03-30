'use strict'

import App from './app'

import { app } from 'electron'
import Accessor from './app/accessor'
import { isDevelopment, isWindows, userDataPath } from './config'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

if (isDevelopment && !process.env.IS_TEST) {
  app.whenReady().then(async () => {
    await installExtension({
      id: 'ljjemllljcmogpfapbkkighbhhppjdbg',
      electron: '>=1.2.1',
    })
  })
}

// Make a single instance application.
if (!process.mas && !isDevelopment) {
  const gotSingleInstanceLock = app.requestSingleInstanceLock()
  if (!gotSingleInstanceLock) {
    process.stdout.write('Other instance detected: exiting...\n')
    app.exit()
  }
}

// Exit cleanly on request from parent process in development mode.
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
