import { app } from 'electron'
import { checkUpdates, userSetting } from '../actions/markman'

import * as path from 'path'
import About from 'electron-about'
import pkg from '../../../../package.json'

export default function (keybindings) {
  return {
    label: 'Markman',
    submenu: [
      About.makeMenuItem('Markman', {
        icon: `file://${path.join(__static, 'logo.png')}`,
        appName: 'Markman',
        version: `Version ${pkg.version}`,
        copyright: 'Copyright © 2020 Xem',
      }),
      {
        label: 'Check for updates...',
        click(menuItem, browserWindow) {
          checkUpdates(browserWindow)
        },
      },
      {
        label: 'Preferences',
        accelerator: keybindings.getAccelerator('file.preferences'),
        click() {
          userSetting()
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Services',
        role: 'services',
        submenu: [],
      },
      {
        type: 'separator',
      },
      {
        label: 'Hide Markman',
        accelerator: keybindings.getAccelerator('mt.hide'),
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: keybindings.getAccelerator('mt.hide-others'),
        role: 'hideothers',
      },
      {
        label: 'Show All',
        role: 'unhide',
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: keybindings.getAccelerator('file.quit'),
        click: app.quit,
      },
    ],
  }
}
