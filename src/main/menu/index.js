import { remote, ipcMain, BrowerWindow, app } from "electron";
const { Menu } = remote;

function createMenu() {
  if (process.platform === "darwin") {
    const template = [
      {
        id: "main",
        label: "App",
        submenu: [
          {
            id: "save",
            label: "save",
            accelerator: "CmdOrCtrl+S",
            enabled: true,
            click: saveNote()
          },
          { role: "about" },
          {
            label: "Quit",
            accelerator: "CmdOrCtrl+Q",
            click() {
              app.quit();
            }
          }
        ]
      },
      {
        id: "edit",
        label: "edit",
        submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            selector: "redo:"
          },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            selector: "selectAll:"
          }
        ]
      }
    ];
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    // windows及linux系统
    Menu.setApplicationMenu(null);
  }
}
function saveNote() {
  ipcMain.on("send");
  BrowerWindow.webContents.send();
}

createMenu();
