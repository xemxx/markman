import { WindowManager } from '../windows'

import Keybindings from '../keyboard/shortcutHandler'
import AppMenu from '../menu'
import Preference from '../preferences'

class Accessor {
  preference: Preference
  keybindings: any
  menu: AppMenu
  windowManager: WindowManager
  constructor(args: { userDataPath: any }) {
    let userDataPath = args.userDataPath
    this.preference = new Preference(userDataPath)
    this.keybindings = new Keybindings(userDataPath)
    this.menu = new AppMenu(this.keybindings, userDataPath, this.preference)
    this.windowManager = new WindowManager(this.menu)
  }
}

export default Accessor
