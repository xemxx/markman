import { ipcMain } from 'electron'
import { layout } from '../actions/view'
import { isDevelopment } from '../../config'

export default function(keybindings) {
  const viewMenu = {
    label: '&View',
    submenu: [
      {
        label: 'Toggle Sidebar',
        id: 'sideBarMenuItem',
        accelerator: keybindings.getAccelerator('view.toggle-sidebar'),
        type: 'checkbox',
        checked: false,
        click(item, browserWindow, event) {
          // if we call this function, the checked state is not set
          if (!event) {
            item.checked = !item.checked
          }
          layout(item, browserWindow, 'showSideBar')
        }
      },
      {
        type: 'separator'
      }
    ]
  }

  if (isDevelopment) {
    viewMenu.submenu.push({
      label: 'Toggle Developer Tools',
      accelerator: keybindings.getAccelerator('view.toggle-dev-tools'),
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.webContents.toggleDevTools()
        }
      }
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
