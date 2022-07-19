export const isOsx = process.platform === 'darwin'
export const isWindows = process.platform === 'win32'
export const isLinux = process.platform === 'linux'
export const isDevelopment = process.env.NODE_ENV !== 'production'

import { app } from 'electron'
import { join } from 'path'

export const userDataPath = app.getPath('userData')
const preload = join(__dirname, '../preload/index.ts')
export const editorWinOptions = {
  title: 'markman',
  minWidth: 500,
  minHeight: 350,
  center: true,
  webPreferences: {
    preload,
    nodeIntegration: true,
    contextIsolation: false,
    // enableRemoteModule: true,
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
    nodeIntegration: true,
    contextIsolation: false,
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

export const URL_REG =
  /^http(s)?:\/\/([a-z0-9\-._~]+\.[a-z]{2,}|[0-9.]+|localhost|\[[a-f0-9.:]+\])(:[0-9]{1,5})?(\/[\S]+)?/i

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}
