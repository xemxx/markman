import { app } from 'electron'
import * as actions from '../actions/file'
import { userSetting } from '../actions/markman'
import { isOsx } from '../../config'
import Keybindings from '../../keyboard/shortcutHandler'

export default function (keybindings: Keybindings, preference: any) {
  const { autoSave } = preference.getAll()
  const fileMenu = <Electron.MenuItemConstructorOptions>{
    label: 'File',
    submenu: <Electron.MenuItemConstructorOptions[]>[
      {
        label: 'Save',
        accelerator: keybindings.getAccelerator('file.save'),
        click(menuItem, browserWindow) {
          actions.save(browserWindow as Electron.BrowserWindow)
        },
      },
      {
        label: 'Auto Save',
        type: 'checkbox',
        checked: autoSave,
        id: 'autoSaveMenuItem',
        click(menuItem) {
          actions.autoSave(menuItem)
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Export',
        submenu: [
          {
            label: 'HTML',
            click(menuItem, browserWindow) {
              actions.exportFile(browserWindow, 'styledHtml')
            },
          },
          {
            label: 'PDF',
            click(menuItem, browserWindow) {
              actions.exportFile(browserWindow, 'pdf')
            },
          },
        ],
      },

      ...(!isOsx
        ? [
            {
              type: 'separator',
            },
            {
              id: 'preferences',
              label: 'Preferences',
              accelerator: keybindings.getAccelerator('file.preferences'),
              click() {
                userSetting()
              },
            },
            {
              label: 'Quit',
              accelerator: keybindings.getAccelerator('file.quit'),
              click: app.quit,
            },
          ]
        : [
            {
              label: 'Close Window',
              accelerator: keybindings.getAccelerator('file.close-window'),
              role: 'hide',
            },
          ]),
    ],
  }
  return fileMenu
}
