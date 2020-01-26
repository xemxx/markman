import WindowManager from "../app/windowManager";

import Keybindings from "../keyboard/shortcutHandler";
import AppMenu from "../menu";

class Accessor {
  /**
   * @param {AppEnvironment} appEnvironment The application environment instance.
   */
  constructor(appEnvironment) {
    this.env = appEnvironment;
    this.keybindings = new Keybindings();
    this.menu = new AppMenu(this.keybindings);
    this.windowManager = new WindowManager(this.menu);
  }
}

export default Accessor;
