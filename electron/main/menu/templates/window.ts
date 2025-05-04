import { toggleAlwaysOnTop } from '../actions/window'
import { isOsx } from '../../config'
import Keybindings from '../../keyboard/shortcutHandler'

export default function (keybindings: Keybindings) {
  const menu = <Electron.MenuItemConstructorOptions>{
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
      ...(isOsx
        ? [
            {
              label: 'Bring All to Front',
              role: 'front',
            },
          ]
        : []),
    ],
  }
  return menu
}
