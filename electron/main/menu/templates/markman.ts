import { app, MenuItemConstructorOptions } from 'electron'
import { checkUpdates, userSetting } from '../actions/markman'

import path from 'path'
import About from 'electron-about'
import pkg from '../../../../package.json'
import { ROOT_PATH } from '../../config'
import Keybindings from '../../keyboard/shortcutHandler'

export default function (keybindings: Keybindings) {
  return <MenuItemConstructorOptions>{
    label: 'Markman',
    submenu: [
      About.makeMenuItem('Markman', {
        icon: `file://` + path.join(ROOT_PATH.public, 'logo.png'),
        appName: 'Markman',
        version: `Version ${pkg.version}`,
        copyright: 'Copyright © 2020 Xem',
      }),
      {
        label: 'Check for updates...',
        click() {
          checkUpdates()
        },
      },
      {
        id: 'preferences',
        label: 'Preferences',
        enabled: false,
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
