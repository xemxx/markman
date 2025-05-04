import Keybindings from '../../keyboard/shortcutHandler'

export default function (keybindings: Keybindings) {
  return <Electron.MenuItemConstructorOptions>{
    label: 'Edit',
    role: 'editMenu',
    submenu: [
      {
        label: 'Undo',
        accelerator: keybindings.getAccelerator('edit.undo'),
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: keybindings.getAccelerator('edit.redo'),
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: keybindings.getAccelerator('edit.cut'),
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: keybindings.getAccelerator('edit.copy'),
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: keybindings.getAccelerator('edit.paste'),
        role: 'paste',
      },
      {
        type: 'separator',
      },
      {
        label: 'Select All',
        accelerator: keybindings.getAccelerator('edit.select-all'),
        role: 'selectAll',
      },
    ],
  }
}
