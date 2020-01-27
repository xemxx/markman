import { ipcMain, BrowserWindow } from "electron";
import EventEmitter from "events";

class WindowManager extends EventEmitter {
  /**
   *
   * @param {AppMenu} appMenu The application menu instance.
   */
  constructor(appMenu) {
    super();

    this._appMenu = appMenu;

    this._editor = null;
    this._setting = null;
    this._listenForIpcMain();
  }

  /**
   * Add the given window to the window list.
   *
   * @param {IApplicationWindow} window The application window. We take ownership!
   */
  addEditor(window) {
    this._editor = window;
    window.on("window-closed", () => {
      this._editor = null;
    });
  }

  getEditor (){
    return this._editor;
  }

  /**
   * Closes the browser window and associated application window without asking to save documents.
   *
   * @param {Electron.BrowserWindow} browserWindow The browser window.
   */
  forceClose(browserWindow) {
    if (!browserWindow) {
      return false;
    }

    const { id: windowId } = browserWindow;
    const { _appMenu } = this;

    _appMenu.removeWindowMenu(windowId);

    browserWindow.destroy();
    return true;
  }

  _listenForIpcMain() {
    // Force close a BrowserWindow
    ipcMain.on("mt::close-window", e => {
      const win = BrowserWindow.fromWebContents(e.sender);
      this.forceClose(win);
    });
  }
}

export default WindowManager;
