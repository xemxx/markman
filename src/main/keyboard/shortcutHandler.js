import { Menu } from 'electron'
import path from 'path'
import electronLocalshortcut from '@hfelix/electron-localshortcut'
import { isOsx } from '../config'

class Keybindings {
  /**
   * @param {string} userDataPath The user data path.
   */
  constructor(userDataPath) {
    this.configPath = path.join(userDataPath, 'keybindings.json')

    this.keys = new Map([
      // Mark Text - macOS only
      ['mt.hide', 'Command+H'],
      ['mt.hide-others', 'Command+Alt+H'],

      // File menu
      ['file.save', 'CmdOrCtrl+S'],
      ['file.preferences', 'CmdOrCtrl+,'], // marktext menu in macOS
      ['file.close-window', 'CmdOrCtrl+Shift+W'],
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
      ['view.toggle-sidebar', 'CmdOrCtrl+Shift+E'],
      // ["view.toggle-tabbar", "CmdOrCtrl+Alt+B"],
      ['view.toggle-dev-tools', 'CmdOrCtrl+Alt+I'],
      ['view.dev-reload', 'CmdOrCtrl+R']
    ])
  }

  getAccelerator(id) {
    const name = this.keys.get(id)
    if (!name) {
      return ''
    }
    return name
  }

  registerKeyHandlers(win, acceleratorMap) {
    for (const item of acceleratorMap) {
      let { accelerator } = item

      // Regisiter shortcuts on the BrowserWindow instead of using Chromium's native menu.
      // This makes it possible to receive key down events before Chromium/Electron and we
      // can handle reserved Chromium shortcuts. Afterwards prevent the default action of
      // the event so the native menu is not triggered.
      electronLocalshortcut.register(win, accelerator, () => {
        if (global.MARKTEXT_DEBUG && process.env.MARKTEXT_DEBUG_KEYBOARD) {
          console.log(`You pressed ${accelerator}`)
        }
        callMenuCallback(item, win)
        return true // prevent default action
      })
    }
  }
}

export const parseMenu = menuTemplate => {
  const { submenu, accelerator, click, id, visible } = menuTemplate
  const items = []
  if (Array.isArray(menuTemplate)) {
    for (const item of menuTemplate) {
      const subitems = parseMenu(item)
      if (subitems) items.push(...subitems)
    }
  } else if (submenu) {
    const subitems = parseMenu(submenu)
    if (subitems) items.push(...subitems)
  } else if ((visible === undefined || visible) && accelerator && click) {
    items.push({
      accelerator,
      click,
      id // may be null
    })
  }
  return items.length === 0 ? null : items
}

const callMenuCallback = (menuInfo, win) => {
  const { click, id } = menuInfo
  if (click) {
    let menuItem = null
    if (id) {
      const menus = Menu.getApplicationMenu()
      menuItem = menus.getMenuItemById(id)
    }

    // Allow all shortcuts/menus without id and only enabled menus with id (GH#980).
    if (!menuItem || menuItem.enabled !== false) {
      click(menuItem, win)
    }
  } else {
    console.error('ERROR: callback function is not defined.')
  }
}

export default Keybindings
