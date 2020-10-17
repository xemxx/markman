import { shell } from 'electron'

import path from 'path'
import About from 'electron-about'
import pkg from '../../../../package.json'
import { isOsx } from '../../config'

export default function () {
  const helpMenu = {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Report Issue or Feature request',
        click() {
          shell.openExternal('https://github.com/xemxx/markman-client/issues')
        },
      },
      {
        label: 'Watch on GitHub',
        click() {
          shell.openExternal('https://github.com/xemxx/markman-client')
        },
      },
      {
        label: 'Follow @Xem on Github',
        click() {
          shell.openExternal('https://github.com/xemxx')
        },
      },
    ],
  }

  if (!isOsx) {
    helpMenu.submenu.push(
      {
        type: 'separator',
      },
      About.makeMenuItem('Markman', {
        icon: `file://${path.join(__static, 'logo.png')}`,
        appName: 'Markman',
        version: `Version ${pkg.version}`,
        copyright: 'Copyright © 2020 Xem',
      }),
    )
  }
  return helpMenu
}
