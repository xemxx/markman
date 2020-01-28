import { ipcMain, Menu } from 'electron'
import log from 'electron-log'
import { isLinux, isOsx, isWindows } from '../config'
import { parseMenu } from '../keyboard/shortcutHandler'
import { updateSidebarMenu } from '../menu/actions/edit'
import { updateFormatMenu } from '../menu/actions/format'
import { updateSelectionMenus } from '../menu/actions/paragraph'
import { viewLayoutChanged } from '../menu/actions/view'
import configureMenu, { configSettingMenu } from '../menu/templates'

export const MenuType = {
  DEFAULT: 0,
  EDITOR: 1,
  SETTINGS: 2
}

class AppMenu {
  /**
   * @param {Keybindings} keybindings The keybindings instances.
   * @param {string} userDataPath The user data path.
   */
  constructor(keybindings, userDataPath) {
    this._keybindings = keybindings
    this._userDataPath = userDataPath

    this.isOsxOrWindows = isOsx || isWindows
    this.activeWindowId = -1
    this.windowMenus = new Map()

    this._listenForIpcMain()
  }

  /**
   * Add the editor menu to the given window.
   *
   * @param {BrowserWindow} window The editor browser window.
   * @param {[*]} options The menu options.
   */
  addEditorMenu(window) {
    const { windowMenus } = this
    windowMenus.set(window.id, this._buildEditorMenu(true))

    const { shortcutMap } = windowMenus.get(window.id)

    this._keybindings.registerKeyHandlers(window, shortcutMap)
  }

  /**
   * Remove menu from the given window.
   *
   * @param {number} windowId The window id.
   */
  removeWindowMenu(windowId) {
    // NOTE: Shortcut handler is automatically unregistered when window is closed.
    const { activeWindowId } = this
    this.windowMenus.delete(windowId)
    if (activeWindowId === windowId) {
      this.activeWindowId = -1
    }
  }

  /**
   * Returns the window menu.
   *
   * @param {number} windowId The window id.
   * @returns {Electron.Menu} The menu.
   */
  getWindowMenuById(windowId) {
    const menu = this.windowMenus.get(windowId)
    if (!menu) {
      log.error(
        `getWindowMenuById: Cannot find window menu for window id ${windowId}.`
      )
      throw new Error(`Cannot find window menu for id ${windowId}.`)
    }
    return menu.menu
  }

  /**
   * Check whether the given window has a menu.
   *
   * @param {number} windowId The window id.
   */
  has(windowId) {
    return this.windowMenus.has(windowId)
  }

  /**
   * Set the given window as last active.
   *
   * @param {number} windowId The window id.
   */
  setActiveWindow(windowId) {
    if (this.activeWindowId !== windowId) {
      // Change application menu to the current window menu.
      this._setApplicationMenu(this.getWindowMenuById(windowId))
      this.activeWindowId = windowId
    }
  }

  /**
   * Updates all window menus.
   *
   * NOTE: We need this method to add or remove menu items at runtime.
   *
   * @param {[string[]]} recentUsedDocuments
   */
  updateAppMenu(recentUsedDocuments) {
    if (!recentUsedDocuments) {
      recentUsedDocuments = this.getRecentlyUsedDocuments()
    }

    // "we don't support changing menu object after calling setMenu, the behavior
    // is undefined if user does that." That mean we have to recreate the editor
    // application menu each time.

    // rebuild all window menus
    this.windowMenus.forEach((value, key) => {
      const { menu: oldMenu, type } = value
      if (type !== MenuType.EDITOR) return

      const { menu: newMenu } = this._buildEditorMenu(
        false,
        recentUsedDocuments
      )

      // all other menu items are set automatically
      updateMenuItem(oldMenu, newMenu, 'sourceCodeModeMenuItem')
      updateMenuItem(oldMenu, newMenu, 'typewriterModeMenuItem')
      updateMenuItem(oldMenu, newMenu, 'focusModeMenuItem')
      updateMenuItem(oldMenu, newMenu, 'sideBarMenuItem')
      updateMenuItem(oldMenu, newMenu, 'tabBarMenuItem')

      // update window menu
      value.menu = newMenu

      // update application menu if necessary
      const { activeWindowId } = this
      if (activeWindowId === key) {
        this._setApplicationMenu(newMenu)
      }
    })
  }

  /**
   * Update line ending menu items.
   *
   * @param {number} windowId The window id.
   * @param {string} lineEnding Either >lf< or >crlf<.
   */
  updateLineEndingMenu(windowId, lineEnding) {
    const menus = this.getWindowMenuById(windowId)
    const crlfMenu = menus.getMenuItemById('crlfLineEndingMenuEntry')
    const lfMenu = menus.getMenuItemById('lfLineEndingMenuEntry')
    if (lineEnding === 'crlf') {
      crlfMenu.checked = true
    } else {
      lfMenu.checked = true
    }
  }

  /**
   * Update always on top menu item.
   *
   * @param {number} windowId The window id.
   * @param {boolean} lineEnding Always on top.
   */
  updateAlwaysOnTopMenu(windowId, flag) {
    const menus = this.getWindowMenuById(windowId)
    const menu = menus.getMenuItemById('alwaysOnTopMenuItem')
    menu.checked = flag
  }

  /**
   * Update all theme entries from editor menus to the selected one.
   */
  updateThemeMenu = theme => {
    this.windowMenus.forEach(value => {
      const { menu, type } = value
      if (type !== MenuType.EDITOR) {
        return
      }

      const themeMenus = menu.getMenuItemById('themeMenu')
      if (!themeMenus) {
        return
      }

      themeMenus.submenu.items.forEach(item => (item.checked = false))
      themeMenus.submenu.items.forEach(item => {
        if (item.id && item.id === theme) {
          item.checked = true
        }
      })
    })
  }

  /**
   * Update all auto save entries from editor menus to the given state.
   */
  updateAutoSaveMenu = autoSave => {
    this.windowMenus.forEach(value => {
      const { menu, type } = value
      if (type !== MenuType.EDITOR) {
        return
      }

      const autoSaveMenu = menu.getMenuItemById('autoSaveMenuItem')
      if (!autoSaveMenu) {
        return
      }
      autoSaveMenu.checked = autoSave
    })
  }

  /**
   * Update all aidou entries from editor menus to the given state.
   */
  updateAidouMenu = bool => {
    this.windowMenus.forEach(value => {
      const { menu, type } = value
      if (type !== MenuType.EDITOR) {
        return
      }

      const aidouMenu = menu.getMenuItemById('aidou')
      if (!aidouMenu) {
        return
      }
      aidouMenu.visible = bool
    })
  }

  /**
   * Append misc shortcuts the the given shortcut map.
   *
   * @param {*} lineEnding The shortcut map.
   */
  _appendMiscShortcuts = shortcutMap => {
    shortcutMap.push({
      accelerator: this._keybindings.getAccelerator('tabs.cycle-forward'),
      click: (menuItem, win) => {
        win.webContents.send('mt::tabs-cycle-right')
      },
      id: null
    })
    shortcutMap.push({
      accelerator: this._keybindings.getAccelerator('tabs.cycle-backward'),
      click: (menuItem, win) => {
        win.webContents.send('mt::tabs-cycle-left')
      },
      id: null
    })
    shortcutMap.push({
      accelerator: this._keybindings.getAccelerator('tabs.switch-to-left'),
      click: (menuItem, win) => {
        win.webContents.send('mt::tabs-cycle-left')
      },
      id: null
    })
    shortcutMap.push({
      accelerator: this._keybindings.getAccelerator('tabs.switch-to-right'),
      click: (menuItem, win) => {
        win.webContents.send('mt::tabs-cycle-right')
      },
      id: null
    })
    shortcutMap.push({
      accelerator: this._keybindings.getAccelerator('file.quick-open'),
      click: (menuItem, win) => {
        win.webContents.send('mt::execute-command-by-id', 'file.quick-open')
      },
      id: null
    })
  }

  _buildEditorMenu(createShortcutMap) {
    const menuTemplate = configureMenu(this._keybindings)
    const menu = Menu.buildFromTemplate(menuTemplate)

    let shortcutMap = null
    if (createShortcutMap) {
      shortcutMap = parseMenu(menuTemplate)
      this._appendMiscShortcuts(shortcutMap)
    }

    return {
      shortcutMap,
      menu,
      type: MenuType.EDITOR
    }
  }

  _buildSettingMenu() {
    if (isOsx) {
      const menuTemplate = configSettingMenu(this._keybindings)
      const menu = Menu.buildFromTemplate(menuTemplate)
      return { menu, type: MenuType.SETTINGS }
    }
    return { menu: null, type: MenuType.SETTINGS }
  }

  _setApplicationMenu(menu) {
    if (isLinux && !menu) {
      // WORKAROUND for Electron#16521: We cannot hide the (application) menu on Linux.
      const dummyMenu = Menu.buildFromTemplate([])
      Menu.setApplicationMenu(dummyMenu)
    } else {
      Menu.setApplicationMenu(menu)
    }
  }

  _listenForIpcMain() {
    ipcMain.on('mt::add-recently-used-document', (e, pathname) => {
      this.addRecentlyUsedDocument(pathname)
    })
    ipcMain.on('mt::update-line-ending-menu', (e, windowId, lineEnding) => {
      this.updateLineEndingMenu(windowId, lineEnding)
    })
    ipcMain.on('mt::update-format-menu', (e, windowId, formats) => {
      updateFormatMenu(this.getWindowMenuById(windowId), formats)
    })
    ipcMain.on('mt::update-sidebar-menu', (e, windowId, value) => {
      updateSidebarMenu(this.getWindowMenuById(windowId), value)
    })
    ipcMain.on('mt::view-layout-changed', (e, windowId, viewSettings) => {
      viewLayoutChanged(this.getWindowMenuById(windowId), viewSettings)
    })
    ipcMain.on('mt::editor-selection-changed', (e, windowId, changes) => {
      updateSelectionMenus(this.getWindowMenuById(windowId), changes)
    })

    ipcMain.on('menu-add-recently-used', pathname => {
      this.addRecentlyUsedDocument(pathname)
    })
    ipcMain.on('menu-clear-recently-used', () => {
      this.clearRecentlyUsedDocuments()
    })

    ipcMain.on('broadcast-preferences-changed', prefs => {
      if (prefs.theme !== undefined) {
        this.updateThemeMenu(prefs.theme)
      }
      if (prefs.autoSave !== undefined) {
        this.updateAutoSaveMenu(prefs.autoSave)
      }
      if (prefs.aidou !== undefined) {
        this.updateAidouMenu(prefs.aidou)
      }
    })
  }
}

const updateMenuItem = (oldMenus, newMenus, id) => {
  const oldItem = oldMenus.getMenuItemById(id)
  const newItem = newMenus.getMenuItemById(id)
  newItem.checked = oldItem.checked
}

// ----------------------------------------------

// HACKY: We have one application menu per window and switch the menu when
// switching windows, so we can access and change the menu items via Electron.

/**
 * Return the menu from the application menu.
 *
 * @param {string} menuId Menu ID
 * @returns {Electron.Menu} Returns the menu or null.
 */
export const getMenuItemById = menuId => {
  const menus = Menu.getApplicationMenu()
  return menus.getMenuItemById(menuId)
}

export default AppMenu
