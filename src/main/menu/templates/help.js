import { shell } from 'electron'

import * as actions from '../actions/help'
import { isOsx } from '../../config'

export default function() {
  const helpMenu = {
    label: '&Help',
    role: 'help',
    submenu: [
      {
        label: 'Report Issue or Feature request',
        click() {
          shell.openExternal('https://github.com/xemxx/markman-client/issues')
        }
      },
      {
        label: 'Watch on GitHub',
        click() {
          shell.openExternal('https://github.com/xemxx/markman-client')
        }
      },
      {
        label: 'Follow @Xem on Github',
        click() {
          shell.openExternal('https://github.com/xemxx')
        }
      }
    ]
  }

  if (!isOsx) {
    helpMenu.submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'About Markman',
        click(menuItem, browserWindow) {
          actions.showAboutDialog(browserWindow)
        }
      }
    )
  }
  return helpMenu
}
