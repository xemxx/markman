import { isDevelopment } from '../../config'
import * as action from '../actions/view'

export default function (keybindings, preference) {
  const { toggleSidebar } = preference.getAll()
  const viewMenu = {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Sidebar',
        id: 'sideBarMenuItem',
        accelerator: keybindings.getAccelerator('view.toggle-sidebar'),
        type: 'checkbox',
        checked: toggleSidebar,
        click(item) {
          action.toggleSidebar(item)
        },
      },
      {
        type: 'separator',
      },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
    ],
  }
  viewMenu.submenu.push({
    label: 'Toggle Developer Tools',
    accelerator: keybindings.getAccelerator('view.toggle-dev-tools'),
    role: 'toggledevtools',
  })
  if (isDevelopment) {
    viewMenu.submenu.push({
      type: 'separator',
    })
    viewMenu.submenu.push({
      label: 'Reload',
      accelerator: keybindings.getAccelerator('view.dev-reload'),
      role: 'reload',
    })
  }
  return viewMenu
}
