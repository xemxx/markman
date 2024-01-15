/// <reference types="vite-plugin-electron/electron-env" />
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    VSCODE_DEBUG?: 'true'
    DIST: string
    /** /dist/ or /public/ */
    PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
}
