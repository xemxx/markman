import path from 'path'
import { isOsx } from '../config'

class Keybindings {
  /**
   * @param {string} userDataPath The user data path.
   */
  constructor(userDataPath) {
    this.configPath = path.join(userDataPath, 'keybindings.json')

    this.keys = new Map([
      // macOS only
      ['mm.hide', 'Command+H'],
      ['mm.hide-others', 'Command+Alt+H'],

      // File menu
      ['file.save', 'CmdOrCtrl+S'],
      ['file.preferences', 'CmdOrCtrl+,'],
      ['file.close-window', 'CmdOrCtrl+W'],
      ['file.quit', 'CmdOrCtrl+Q'],

      // Edit menu
      ['edit.undo', 'CmdOrCtrl+Z'],
      ['edit.redo', 'CmdOrCtrl+Shift+Z'],
      ['edit.cut', 'CmdOrCtrl+X'],
      ['edit.copy', 'CmdOrCtrl+C'],
      ['edit.paste', 'CmdOrCtrl+V'],
      // ["edit.copy-as-markdown", "CmdOrCtrl+Shift+C"],
      // ["edit.copy-as-plaintext", "CmdOrCtrl+Shift+V"],
      ['edit.select-all', 'CmdOrCtrl+A'],
      // ["edit.duplicate", "CmdOrCtrl+Alt+D"],
      // ["edit.find", "CmdOrCtrl+F"],
      // ["edit.replace", "CmdOrCtrl+Alt+F"],
      // ["edit.find-in-folder", "Shift+CmdOrCtrl+F"],

      // Window menu
      ['window.minimize', 'CmdOrCtrl+M'],
      ['window.toggle-full-screen', isOsx ? 'Ctrl+Command+F' : 'F11'],

      // View menu
      // ["view.command-palette", "CmdOrCtrl+Shift+P"],
      // ["view.source-code-mode", "CmdOrCtrl+Alt+S"],
      // ["view.typewriter-mode", "CmdOrCtrl+Alt+T"],
      // ["view.focus-mode", "CmdOrCtrl+Shift+F"],
      ['view.toggle-sidebar', 'Ctrl+1'],
      // ["view.toggle-tabbar", "CmdOrCtrl+Alt+B"],
      ['view.toggle-dev-tools', 'CmdOrCtrl+Alt+I'],
      ['view.dev-reload', 'CmdOrCtrl+R'],
    ])
  }

  getAccelerator(id) {
    const name = this.keys.get(id)
    if (!name) {
      return ''
    }
    return name
  }
}

export default Keybindings
