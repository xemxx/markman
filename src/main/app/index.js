"use strict";

import { isOsx, isWindows } from "../config.js";

import { app, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

import EditorWindow from "../windows/editor";

export default class App {
  constructor(Accessor) {
    this._env = Accessor.env;
    this._windowManager = Accessor.windowManager;
  }
  init() {
    app.on("activate", () => {
      // macOS only
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this._windowManager.windowCount === 0) {
        this.ready();
      }
    });

    // Quit when all windows are closed.
    app.on("window-all-closed", () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (!isOsx) {
        app.quit();
      }
    });

    app.on("ready", this.ready);

    app.on("window-all-closed", () => {
      this._windowManager.closeWatcher();
      if (!isOsx) {
        app.quit();
      }
    });

    app.on("activate", () => {
      // macOS only
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this._windowManager.windowCount === 0) {
        this.ready();
      }
    });

    // Prevent to load webview and opening links or new windows via HTML/JS.
    app.on("web-contents-created", (event, contents) => {
      contents.on("will-attach-webview", event => {
        event.preventDefault();
      });
      contents.on("will-navigate", event => {
        event.preventDefault();
      });
      contents.on("new-window", event => {
        event.preventDefault();
      });
    });
  }

  async ready() {
    //this._createEditorWindow();
    // Create the browser window.
    let win;
    const options = {
      width: 1080,
      height: 720,
      center: true,
      title: "MarkMan",
      backgroundColor: "#fff",
      webPreferences: {
        nodeIntegration: true
      },
      show: false,
      titleBarStyle: "hidden"
    };
    if (isWindows) {
      options.show = true; // 当window创建的时候打开
      options.frame = false; // 创建一个frameless窗口，详情：https://electronjs.org/docs/api/frameless-window
    }
    win = new BrowserWindow(options);
    win.once("ready-to-show", () => {
      win.show();
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
      if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
      createProtocol("app");
      // Load the index.html when not in development
      win.loadURL("app://./index.html");
    }

    win.on("closed", () => {
      win = null;
    });
  }
  /**
   * Creates a new editor window.
   *
   * @param {*} [options] The BrowserWindow options.
   * @returns {EditorWindow} The created editor window.
   */
  _createEditorWindow(
    options = {}
  ) {
    const editor = new EditorWindow(this._accessor);
    editor.createWindow(options);
    this._windowManager.add(editor);
    if (this._windowManager.windowCount === 1) {
      this._accessor.menu.setActiveWindow(editor.id);
    }
    return editor;
  }
}
