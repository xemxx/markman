import { Menu } from 'electron'
import { isOsx, isWindows, isLinux } from '../config'
import { configEditorMenu, configSettingMenu } from '../menu/templates'
import { ipcMain } from 'electron'
import { Debug } from '../log'

export const MenuType = {
  DEFAULT: 0,
  EDITOR: 1,
  SETTINGS: 2,
}

class AppMenu {
  /**
   * @param {Keybindings} keybindings The keybindings instances.
   * @param {string} userDataPath The user data path.
   */
  constructor(keybindings, userDataPath, userPreference) {
    this._keybindings = keybindings
    this._userDataPath = userDataPath
    this._userPreference = userPreference

    this.isOsxOrWindows = isOsx || isWindows
    this.activeWindowId = -1
    this.windowMenus = new Map()

    this._listenForIpcMain()
  }

  /**
   * Add the editor menu to the given window.
   *
   * @param {BrowserWindow} window The editor browser window.
   */
  addEditorMenu(window) {
    const { windowMenus } = this
    windowMenus.set(window.id, this._buildEditorMenu())
  }

  /**
   * Add the settings menu to the given window.
   *
   * @param {BrowserWindow} window The settings browser window.
   */
  addSettingMenu(window) {
    const { windowMenus } = this
    windowMenus.set(window.id, this._buildSettingMenu())
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
   * Returns the window menu.
   *
   * @param {number} windowId The window id.
   * @returns {Electron.Menu} The menu.
   */
  getWindowMenuById(windowId) {
    const menu = this.windowMenus.get(windowId)
    if (!menu) {
      throw new Error(`Cannot find window menu for id ${windowId}.`)
    }
    return menu.menu
  }

  updateAutoSaveMenu(autoSave) {
    this.windowMenus.forEach(value => {
      const { menu, type } = value
      if (type !== MenuType.EDITOR) {
        return
      }

      const menuItem = menu.getMenuItemById('autoSaveMenuItem')
      if (!menuItem) {
        return
      }
      menuItem.checked = autoSave
    })
  }

  updateToggleSidebar(toggleSidebar) {
    this.windowMenus.forEach(value => {
      const { menu, type } = value
      if (type !== MenuType.EDITOR) {
        return
      }

      const menuItem = menu.getMenuItemById('sideBarMenuItem')
      if (!menuItem) {
        return
      }
      menuItem.checked = toggleSidebar
    })
  }

  updateTogglePreview(togglePreview) {
    this.windowMenus.forEach(value => {
      const { menu, type } = value
      if (type !== MenuType.EDITOR) {
        return
      }

      const menuItem = menu.getMenuItemById('previewMenuItem')
      if (!menuItem) {
        return
      }
      menuItem.checked = togglePreview
    })
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

  _setApplicationMenu(menu) {
    if (isLinux && !menu) {
      // WORKAROUND for Electron#16521: We cannot hide the (application) menu on Linux.
      const dummyMenu = Menu.buildFromTemplate([])
      Menu.setApplicationMenu(dummyMenu)
    } else {
      Menu.setApplicationMenu(menu)
    }
  }

  _buildEditorMenu() {
    const menuTemplate = configEditorMenu(
      this._keybindings,
      this._userPreference,
    )
    const menu = Menu.buildFromTemplate(menuTemplate)

    return {
      menu,
      type: MenuType.EDITOR,
    }
  }

  _buildSettingMenu() {
    if (isOsx || isLinux) {
      const menuTemplate = configSettingMenu(this._keybindings)
      const menu = Menu.buildFromTemplate(menuTemplate)
      return { menu, type: MenuType.SETTINGS }
    }
    return { menu: null, type: MenuType.SETTINGS }
  }

  _listenForIpcMain() {
    ipcMain.on('broadcast-pref-changed', prefs => {
      Debug('Menu: broadcast-pref-changed')
      Debug(prefs)
      if (prefs.autoSave !== undefined) this.updateAutoSaveMenu(prefs.autoSave)
      else if (prefs.toggleSidebar !== undefined)
        this.updateToggleSidebar(prefs.toggleSidebar)
      else if (prefs.togglePreview !== undefined)
        this.updateTogglePreview(prefs.togglePreview)
    })
  }
}

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
