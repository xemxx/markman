import { ipcMain } from 'electron'
import { layout } from '../actions/view'
import { isDevelopment } from '../../config'

export default function(keybindings) {
  const viewMenu = {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Sidebar',
        id: 'sideBarMenuItem',
        accelerator: keybindings.getAccelerator('view.toggle-sidebar'),
        type: 'checkbox',
        checked: false,
        click(item, browserWindow, event) {
          if (!event) {
            item.checked = !item.checked
          }
          layout(item, browserWindow, 'showSideBar')
        }
      },
      {
        type: 'separator'
      },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' }
    ]
  }

  if (isDevelopment) {
    viewMenu.submenu.push({
      type: 'separator'
    })
    viewMenu.submenu.push({
      label: 'Toggle Developer Tools',
      accelerator: keybindings.getAccelerator('view.toggle-dev-tools'),
      role: 'toggledevtools'
    })
    viewMenu.submenu.push({
      label: 'Reload',
      accelerator: keybindings.getAccelerator('view.dev-reload'),
      click(item, focusedWindow) {
        if (focusedWindow) {
          ipcMain.emit('window-reload-by-id', focusedWindow.id)
        }
      }
    })
  }
  return viewMenu
}
