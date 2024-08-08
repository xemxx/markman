import { isDevelopment } from '../../config'
import Keybindings from '../../keyboard/shortcutHandler'

export default function (keybindings: Keybindings) {
  let viewMenu = <Electron.MenuItemConstructorOptions>{
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: keybindings.getAccelerator('edit.cut'),
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: keybindings.getAccelerator('edit.copy'),
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: keybindings.getAccelerator('edit.paste'),
        role: 'paste',
      },
      {
        type: 'separator',
      },
      {
        label: 'Select All',
        accelerator: keybindings.getAccelerator('edit.select-all'),
        role: 'selectAll',
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: keybindings.getAccelerator('view.toggle-dev-tools'),
        role: 'toggledevtools',
      },
      ...(isDevelopment
        ? [
            {
              type: 'separator',
            },
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
