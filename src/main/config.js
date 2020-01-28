export const isOsx = process.platform === 'darwin'
export const isWindows = process.platform === 'win32'
export const isLinux = process.platform === 'linux'
export const isDevelopment = process.env.NODE_ENV !== 'production'

import { app } from 'electron'

export const userDataPath = app.getPath('userData')

export const editorWinOptions = {
  minWidth: 550,
  minHeight: 350,
  center: true,
  webPreferences: {
    nodeIntegration: true
  },
  useContentSize: true,
  show: false, // Show the window after the app is ready.
  frame: true,
  titleBarStyle: 'hidden'
}

export const preferencesWinOptions = {
  width: 950,
  height: 650,
  webPreferences: {
    nodeIntegration: true
  },
  fullscreenable: false,
  fullscreen: false,
  resizable: false,
  minimizable: false,
  maximizable: false,
  useContentSize: true,
  show: true,
  frame: true,
  thickFrame: !isOsx,
  titleBarStyle: 'hidden'
}

export const EXTENSION_HASN = {
  styledHtml: '.html',
  pdf: '.pdf'
}

export const TITLE_BAR_HEIGHT = isOsx ? 21 : 32

export const URL_REG = /^http(s)?:\/\/([a-z0-9\-._~]+\.[a-z]{2,}|[0-9.]+|localhost|\[[a-f0-9.:]+\])(:[0-9]{1,5})?(\/[\S]+)?/i
