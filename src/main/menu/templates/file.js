import { app } from 'electron'
import * as actions from '../actions/file'
import { userSetting } from '../actions/markman'
import { isOsx } from '../../config'

export default function(keybindings) {
  const fileMenu = {
    label: 'File',
    submenu: []
  }

  fileMenu.submenu.push(
    {
      label: 'Save',
      accelerator: keybindings.getAccelerator('file.save'),
      click(menuItem, browserWindow) {
        actions.save(browserWindow)
      }
    },
    {
      label: 'Auto Save',
      type: 'checkbox',
      id: 'autoSaveMenuItem',
      click(menuItem) {
        actions.autoSave(menuItem)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Export',
      submenu: [
        {
          label: 'HTML',
          click(menuItem, browserWindow) {
            actions.exportFile(browserWindow, 'styledHtml')
          }
        },
        {
          label: 'PDF',
          click(menuItem, browserWindow) {
            actions.exportFile(browserWindow, 'pdf')
          }
        }
      ]
    },
    {
      type: 'separator',
      visible: !isOsx
    },
    {
      label: 'Preferences',
      accelerator: keybindings.getAccelerator('file.preferences'),
      visible: !isOsx,
      click() {
        userSetting()
      }
    },
    {
      label: 'Close Window',
      accelerator: keybindings.getAccelerator('file.close-window'),
      role: 'close'
    },
    {
      label: 'Quit',
      accelerator: keybindings.getAccelerator('file.quit'),
      visible: !isOsx,
      click: app.quit
    }
  )
  return fileMenu
}
