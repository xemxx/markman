const typewriterModeMenuItemId = 'typewriterModeMenuItem'
const focusModeMenuItemId = 'focusModeMenuItem'

export const layout = (item, win, type) => {
  if (win && win.webContents) {
    win.webContents.send('mt::set-view-layout', { [type]: item.checked })
  }
}

// --- IPC events -------------------------------------------------------------

// NOTE: Don't use static `getMenuItemById` here, instead request the menu by
//       window id from `AppMenu` manager.

/**
 *
 * @param {*} applicationMenu The application menu instance.
 * @param {*} changes Array of changed view settings (e.g. [ {showSideBar: true} ]).
 */
export const viewLayoutChanged = (applicationMenu, changes) => {
  const changeMenuByName = (id, value) => {
    const menuItem = applicationMenu.getMenuItemById(id)
    menuItem.checked = value
  }

  for (const key in changes) {
    const value = changes[key]
    switch (key) {
      case 'showSideBar':
        changeMenuByName('sideBarMenuItem', value)
        break
      case 'showTabBar':
        changeMenuByName('tabBarMenuItem', value)
        break
      case 'sourceCode':
        changeMenuByName('sourceCodeModeMenuItem', value)
        break
      case 'typewriter':
        changeMenuByName(typewriterModeMenuItemId, value)
        break
      case 'focus':
        changeMenuByName(focusModeMenuItemId, value)
        break
    }
  }
}
