import { isDevelopment } from '../../config'

export default function(keybindings) {
  let viewMenu = {
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: keybindings.getAccelerator('edit.cut'),
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: keybindings.getAccelerator('edit.copy'),
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: keybindings.getAccelerator('edit.paste'),
        role: 'paste'
      },
      {
        type: 'separator'
      },
      {
        label: 'Select All',
        accelerator: keybindings.getAccelerator('edit.select-all'),
        role: 'selectAll'
      }
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
      role: 'reload'
    })
  }
  return viewMenu
}
