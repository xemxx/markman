export const isOsx = process.platform === 'darwin'
export const isWindows = process.platform === 'win32'
export const isLinux = process.platform === 'linux'
export const isDevelopment = process.env.NODE_ENV !== 'production'

import { app } from 'electron'

export const userDataPath = app.getPath('userData')

export const editorWinOptions = {
  minWidth: 500,
  minHeight: 350,
  center: true,
  webPreferences: {
    nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION, //提供完整的node环境支持
    enableRemoteModule: true,
  },
  useContentSize: true,
  show: false,
  frame: true,
  titleBarStyle: 'hidden',
}

export const preferencesWinOptions = {
  width: 950,
  height: 650,
  webPreferences: {
    nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    enableRemoteModule: true,
  },
  fullscreenable: false,
  fullscreen: false,
  resizable: false,
  minimizable: false,
  maximizable: false,
  useContentSize: true,
  show: false,
  frame: true,
  thickFrame: !isOsx,
  titleBarStyle: 'hidden',
}

export const EXTENSION_HASN = {
  styledHtml: '.html',
  pdf: '.pdf',
}

export const TITLE_BAR_HEIGHT = 22

export const URL_REG = /^http(s)?:\/\/([a-z0-9\-._~]+\.[a-z]{2,}|[0-9.]+|localhost|\[[a-f0-9.:]+\])(:[0-9]{1,5})?(\/[\S]+)?/i
