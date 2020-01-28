import WindowManager from '../app/windowManager'

import Keybindings from '../keyboard/shortcutHandler'
import AppMenu from '../menu'

class Accessor {
  constructor(args) {
    let userDataPath = args.userDataPath
    this.keybindings = new Keybindings(userDataPath)
    this.menu = new AppMenu(this.keybindings, userDataPath)
    this.windowManager = new WindowManager(this.menu)
  }
}

export default Accessor
