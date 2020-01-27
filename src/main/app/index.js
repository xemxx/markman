"use strict";

import { isOsx } from "../config.js";

import { app } from "electron";

import EditorWindow from "../windows/editor";

export default class App {
  constructor(Accessor) {
    this._env = Accessor.env;
    this._windowManager = Accessor.windowManager;
  }

  init() {
    app.on("second-instance", () => {
      const { _windowManager } = this;
      // 当运行第二个实例时,activeWindow
      const activeWindow = _windowManager.getEditor();
      if (activeWindow) {
        activeWindow.bringToFront();
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
  }

  async ready() {
    this._createEditorWindow();
  }
  /**
   * Creates a new editor window.
   *
   * @param {*} [options] The BrowserWindow options.
   * @returns {EditorWindow} The created editor window.
   */
  _createEditorWindow(options = {}) {
    const editor = new EditorWindow(this._accessor);
    editor.createWindow(options);
    this._windowManager.addEditor(editor);
    return editor;
  }
}
