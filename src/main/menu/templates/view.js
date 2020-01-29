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
        checked: true,
        click(item, browserWindow) {
          browserWindow.webContents.send('m::view-sidebar', item.checked)
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
      role: 'reload'
    })
  }
  return viewMenu
}
