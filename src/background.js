'use strict'

import App from './main/app'

import { app, protocol } from 'electron'
import Accessor from './main/app/accessor'
import { isDevelopment, isWindows, userDataPath } from './main/config'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
// import "./main/globalSetting"
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true
    }
  }
])
createProtocol('app')

if (isDevelopment && !process.env.IS_TEST) {
  app.on('ready', () => {
    installExtension(VUEJS_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))
  })
}

// Make  a single instance application.
if (!process.mas && !isDevelopment) {
  const gotSingleInstanceLock = app.requestSingleInstanceLock()
  if (!gotSingleInstanceLock) {
    process.stdout.write('Other instance detected: exiting...\n')
    app.exit()
  }
}

let accessor = new Accessor({
  userDataPath: userDataPath
})
const markman = new App(accessor)
markman.init()

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
