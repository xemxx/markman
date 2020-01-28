import edit from './edit'
import prefEdit from './prefEdit'
import file from './file'
import help from './help'
import view from './view'
import window from './window'
import markman from './markman'
import { isOsx } from '../../config'

// export dockMenu from './dock'

/**
 * Create the setting window menu.
 *
 * @param {Keybindings} keybindings The keybindings instance
 */
export const configSettingMenu = keybindings => {
  return [
    ...(process.platform === 'darwin' ? [markman(keybindings)] : []),
    prefEdit(keybindings),
    help()
  ]
}

/**
 * Create  the editor window.
 *
 * @param {Keybindings} keybindings The keybindings instance.
 */
export const configEditorMenu = keybindings => {
  return [
    ...(isOsx ? [markman(keybindings)] : []),
    file(keybindings),
    edit(keybindings),
    window(keybindings),
    view(keybindings),
    help()
  ]
}
