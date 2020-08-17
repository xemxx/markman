import { toggleAlwaysOnTop } from '../actions/window'
import { isOsx } from '../../config'

export default function (keybindings) {
  const menu = {
    label: 'Window',
    role: 'window',
    submenu: [
      { role: 'zoom' },
      {
        label: 'Minimize',
        accelerator: keybindings.getAccelerator('window.minimize'),
        role: 'minimize',
      },
      {
        id: 'alwaysOnTopMenuItem',
        label: 'Always on Top',
        type: 'checkbox',
        click(menuItem, browserWindow) {
          toggleAlwaysOnTop(browserWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Toggle Full Screen',
        accelerator: keybindings.getAccelerator('window.toggle-full-screen'),
        role: 'togglefullscreen',
      },
    ],
  }

  if (isOsx) {
    menu.submenu.push({
      label: 'Bring All to Front',
      role: 'front',
    })
  }
  return menu
}
