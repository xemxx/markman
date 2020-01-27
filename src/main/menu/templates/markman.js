import { app } from "electron";
import { showAboutDialog } from "../actions/help";
import * as actions from "../actions/marktext";

export default function(keybindings) {
  return {
    label: "Markman",
    submenu: [
      {
        label: "About Markman",
        click(menuItem, browserWindow) {
          showAboutDialog(browserWindow);
        }
      },
      {
        label: "Check for updates...",
        click(menuItem, browserWindow) {
          actions.checkUpdates(browserWindow);
        }
      },
      {
        label: "Preferences",
        accelerator: keybindings.getAccelerator("file.preferences"),
        click() {
          actions.userSetting();
        }
      },
      {
        type: "separator"
      },
      {
        label: "Services",
        role: "services",
        submenu: []
      },
      {
        type: "separator"
      },
      {
        label: "Hide Markman",
        accelerator: keybindings.getAccelerator("mt.hide"),
        role: "hide"
      },
      {
        label: "Hide Others",
        accelerator: keybindings.getAccelerator("mt.hide-others"),
        role: "hideothers"
      },
      {
        label: "Show All",
        role: "unhide"
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        accelerator: keybindings.getAccelerator("file.quit"),
        click: app.quit
      }
    ]
  };
}
