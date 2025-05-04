import { isDevelopment } from '../../config'
import * as action from '../actions/view'
import Keybindings from '../../keyboard/shortcutHandler'

export default function (keybindings: Keybindings, preference: any) {
  const { toggleSidebar } = preference.getAll()
  const viewMenu = <Electron.MenuItemConstructorOptions>{
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
      {
        label: 'Toggle Developer Tools',
        accelerator: keybindings.getAccelerator('view.toggle-dev-tools'),
        role: 'toggledevtools',
      },
      ...(isDevelopment
        ? [
            { type: 'separator' },
            {
              label: 'Reload',
              accelerator: keybindings.getAccelerator('view.dev-reload'),
              role: 'reload',
            },
          ]
        : []),
    ],
  }
  return viewMenu
}
