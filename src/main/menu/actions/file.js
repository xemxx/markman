import fs from 'fs-extra'
import path from 'path'
import { BrowserWindow, dialog, ipcMain, shell } from 'electron'
import log from 'electron-log'
import { isDirectory, isFile } from 'common/filesystem'
import { MARKDOWN_EXTENSIONS, isMarkdownFile, isMarkdownFileOrLink } from 'common/filesystem/paths'
import { EXTENSION_HASN, PANDOC_EXTENSIONS, URL_REG } from '../../config'
import { normalizeAndResolvePath, writeFile } from '../../filesystem'
import { writeMarkdownFile } from '../../filesystem/markdown'
import { getPath, getRecommendTitleFromMarkdownString } from '../../utils'
import pandoc from '../../utils/pandoc'

// TODO(refactor): "save" and "save as" should be moved to the editor window (editor.js) and
// the renderer should communicate only with the editor window for file relevant stuff.
// E.g. "mt::save-tabs" --> "mt::window-save-tabs$wid:<windowId>"

const getPdfPageOptions = options => {
  if (!options) {
    return {}
  }

  const { pageSize, pageSizeWidth, pageSizeHeight, isLandscape } = options
  if (pageSize === 'custom' && pageSizeWidth && pageSizeHeight) {
    return {
      // Note: mm to microns
      pageSize: { height: pageSizeHeight * 1000, width: pageSizeWidth * 1000 },
      landscape: !!isLandscape
    }
  } else {
    return { pageSize, landscape: !!isLandscape }
  }
}

// Handle the export response from renderer process.
const handleResponseForExport = async (e, { type, content, pathname, title, pageOptions }) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  const extension = EXTENSION_HASN[type]
  const dirname = pathname ? path.dirname(pathname) : getPath('documents')
  let nakedFilename = title
  if (!nakedFilename) {
    nakedFilename = pathname ? path.basename(pathname, '.md') : 'Untitled'
  }

  const defaultPath = path.join(dirname, `${nakedFilename}${extension}`)
  const { filePath, canceled } = await dialog.showSaveDialog(win, {
    defaultPath
  })

  if (filePath && !canceled) {
    try {
      if (type === 'pdf') {
        const options = { printBackground: true }
        Object.assign(options, getPdfPageOptions(pageOptions))
        const data = await win.webContents.printToPDF(options)
        removePrintServiceFromWindow(win)
        await writeFile(filePath, data, extension, {})
      } else {
        if (!content) {
          throw new Error('No HTML content found.')
        }
        await writeFile(filePath, content, extension, 'utf8')
      }
      win.webContents.send('mt::export-success', { type, filePath })
    } catch (err) {
      log.error('Error while exporting:', err)
      const ERROR_MSG = err.message || `Error happened when export ${filePath}`
      win.webContents.send('mt::show-notification', {
        title: 'Export failure',
        type: 'error',
        message: ERROR_MSG
      })
    }
  } else {
    // User canceled save dialog
    if (type === 'pdf') {
      removePrintServiceFromWindow(win)
    }
  }
}

const handleResponseForPrint = e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  win.webContents.print({ printBackground: true }, () => {
    removePrintServiceFromWindow(win)
  })
}

const handleResponseForSave = async (e, { id, filename, markdown, pathname, options, defaultPath }) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  let recommendFilename = getRecommendTitleFromMarkdownString(markdown)
  if (!recommendFilename) {
    recommendFilename = filename || 'Untitled'
  }

  // If the file doesn't exist on disk add it to the recently used documents later
  // and execute file from filesystem watcher for a short time. The file may exists
  // on disk nevertheless but is already tracked by Mark Text.
  const alreadyExistOnDisk = !!pathname

  let filePath = pathname

  if (!filePath) {
    const { filePath: dialogPath, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: path.join(defaultPath || getPath('documents'), `${recommendFilename}.md`)
    })

    if (dialogPath && !canceled) {
      filePath = dialogPath
    }
  }

  // Save dialog canceled by user - no error.
  if (!filePath) {
    return Promise.resolve()
  }

  filePath = path.resolve(filePath)
  return writeMarkdownFile(filePath, markdown, options, win)
    .then(() => {
      if (!alreadyExistOnDisk) {
        ipcMain.emit('window-add-file-path', win.id, filePath)
        ipcMain.emit('menu-add-recently-used', filePath)

        const filename = path.basename(filePath)
        win.webContents.send('mt::set-pathname', { id, pathname: filePath, filename })
      } else {
        ipcMain.emit('window-file-saved', win.id, filePath)
        win.webContents.send('mt::tab-saved', id)
      }
      return id
    })
    .catch(err => {
      log.error('Error while saving:', err)
      win.webContents.send('mt::tab-save-failure', id, err.message)
    })
}

const showUnsavedFilesMessage = async (win, files) => {
  const { response } = await dialog.showMessageBox(win, {
    type: 'warning',
    buttons: ['Save', 'Cancel', 'Don\'t save'],
    defaultId: 0,
    message: `Do you want to save the changes you made to ${files.length} ${files.length === 1 ? 'file' : 'files'}?\n\n${files.map(f => f.filename).join('\n')}`,
    detail: 'Your changes will be lost if you don\'t save them.',
    cancelId: 1,
    noLink: true
  })

  switch (response) {
    case 2:
      return { needSave: false }
    case 0:
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ needSave: true })
        })
      })
    default:
      return null
  }
}

const noticePandocNotFound = win => {
  return win.webContents.send('mt::pandoc-not-exists', {
    title: 'Import Warning',
    type: 'warning',
    message: 'Install pandoc before you want to import files.',
    time: 10000
  })
}

const openPandocFile = async (windowId, pathname) => {
  try {
    const converter = pandoc(pathname, 'markdown')
    const data = await converter()
    ipcMain.emit('app-open-markdown-by-id', windowId, data)
  } catch (err) {
    log.error('Error while converting file:', err)
  }
}

const removePrintServiceFromWindow = win => {
  // remove print service content and restore GUI
  win.webContents.send('mt::print-service-clearup')
}

// --- events -----------------------------------

ipcMain.on('mt::save-tabs', (e, unsavedFiles) => {
  Promise.all(unsavedFiles.map(file => handleResponseForSave(e, file)))
    .catch(log.error)
})

ipcMain.on('mt::save-and-close-tabs', async (e, unsavedFiles) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  const userResult = await showUnsavedFilesMessage(win, unsavedFiles)
  if (!userResult) {
    return
  }

  const { needSave } = userResult
  if (needSave) {
    Promise.all(unsavedFiles.map(file => handleResponseForSave(e, file)))
      .then(arr => {
        const tabIds = arr.filter(id => id != null)
        win.send('mt::force-close-tabs-by-id', tabIds)
      })
      .catch(err => {
        log.error('Error while save all:', err.error)
      })
  } else {
    const tabIds = unsavedFiles.map(f => f.id)
    win.send('mt::force-close-tabs-by-id', tabIds)
  }
})

ipcMain.on('mt::response-file-save-as', async (e, { id, filename, markdown, pathname, options, defaultPath }) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  let recommendFilename = getRecommendTitleFromMarkdownString(markdown)
  if (!recommendFilename) {
    recommendFilename = filename || 'Untitled'
  }

  // If the file doesn't exist on disk add it to the recently used documents later
  // and execute file from filesystem watcher for a short time. The file may exists
  // on disk nevertheless but is already tracked by Mark Text.
  const alreadyExistOnDisk = !!pathname

  let { filePath, canceled } = await dialog.showSaveDialog(win, {
    defaultPath: pathname || path.join(defaultPath || getPath('documents'), `${recommendFilename}.md`)
  })

  if (filePath && !canceled) {
    filePath = path.resolve(filePath)
    writeMarkdownFile(filePath, markdown, options, win)
      .then(() => {
        if (!alreadyExistOnDisk) {
          ipcMain.emit('window-add-file-path', win.id, filePath)
          ipcMain.emit('menu-add-recently-used', filePath)

          const filename = path.basename(filePath)
          win.webContents.send('mt::set-pathname', { id, pathname: filePath, filename })
        } else if (pathname !== filePath) {
          // Update window file list and watcher.
          ipcMain.emit('window-change-file-path', win.id, filePath, pathname)

          const filename = path.basename(filePath)
          win.webContents.send('mt::set-pathname', { id, pathname: filePath, filename })
        } else {
          ipcMain.emit('window-file-saved', win.id, filePath)
          win.webContents.send('mt::tab-saved', id)
        }
      })
      .catch(err => {
        log.error('Error while save as:', err)
        win.webContents.send('mt::tab-save-failure', id, err.message)
      })
  }
})

ipcMain.on('mt::close-window-confirm', async (e, unsavedFiles) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  const userResult = await showUnsavedFilesMessage(win, unsavedFiles)
  if (!userResult) {
    return
  }

  const { needSave } = userResult
  if (needSave) {
    Promise.all(unsavedFiles.map(file => handleResponseForSave(e, file)))
      .then(() => {
        ipcMain.emit('window-close-by-id', win.id)
      })
      .catch(err => {
        log.error('Error while saving before quit:', err)

        // Notify user about the problem.
        dialog.showMessageBox(win, {
          type: 'error',
          buttons: ['Close', 'Keep It Open'],
          message: 'Failure while saving files',
          detail: err.message
        })
          .then(({ response }) => {
            if (win.id && response === 0) {
              ipcMain.emit('window-close-by-id', win.id)
            }
          })
      })
  } else {
    ipcMain.emit('window-close-by-id', win.id)
  }
})

ipcMain.on('mt::response-file-save', handleResponseForSave)

ipcMain.on('mt::response-export', handleResponseForExport)

ipcMain.on('mt::response-print', handleResponseForPrint)

ipcMain.on('mt::window::drop', async (e, fileList) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  for (const file of fileList) {
    if (isMarkdownFileOrLink(file)) {
      openFileOrFolder(win, file)
      continue
    }

    // Try to import the file
    if (PANDOC_EXTENSIONS.some(ext => file.endsWith(ext))) {
      const existsPandoc = pandoc.exists()
      if (!existsPandoc) {
        noticePandocNotFound(win)
      } else {
        openPandocFile(win.id, file)
      }
      break
    }
  }
})

ipcMain.on('mt::rename', async (e, { id, pathname, newPathname }) => {
  if (pathname === newPathname) return
  const win = BrowserWindow.fromWebContents(e.sender)

  const doRename = () => {
    fs.rename(pathname, newPathname, err => {
      if (err) {
        log.error(`mt::rename: Cannot rename "${pathname}" to "${newPathname}".\n${err.stack}`)
        return
      }

      ipcMain.emit('window-change-file-path', win.id, newPathname, pathname)
      e.sender.send('mt::set-pathname', {
        id,
        pathname: newPathname,
        filename: path.basename(newPathname)
      })
    })
  }

  if (!isFile(newPathname)) {
    doRename()
  } else {
    const { response } = await dialog.showMessageBox(win, {
      type: 'warning',
      buttons: ['Replace', 'Cancel'],
      defaultId: 1,
      message: `The file "${path.basename(newPathname)}" already exists. Do you want to replace it?`,
      cancelId: 1,
      noLink: true
    })

    if (response === 0) {
      doRename()
    }
  }
})

ipcMain.on('mt::response-file-move-to', async (e, { id, pathname }) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  const { filePath, canceled } = await dialog.showSaveDialog(win, {
    buttonLabel: 'Move to',
    nameFieldLabel: 'Filename:',
    defaultPath: pathname
  })

  if (filePath && !canceled) {
    fs.rename(pathname, filePath, err => {
      if (err) {
        log.error(`mt::rename: Cannot rename "${pathname}" to "${filePath}".\n${err.stack}`)
        return
      }

      ipcMain.emit('window-change-file-path', win.id, filePath, pathname)
      e.sender.send('mt::set-pathname', { id, pathname: filePath, filename: path.basename(filePath) })
    })
  }
})

ipcMain.on('mt::ask-for-open-project-in-sidebar', async e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  const { filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory']
  })

  if (filePaths && filePaths[0]) {
    ipcMain.emit('app-open-directory-by-id', win.id, filePaths[0], true)
  }
})

ipcMain.on('mt::format-link-click', (e, { data, dirname }) => {
  if (URL_REG.test(data.href)) {
    return shell.openExternal(data.href)
  }
  let pathname = null
  if (path.isAbsolute(data.href) && isMarkdownFile(data.href)) {
    pathname = data.href
  }
  if (!path.isAbsolute(data.href) && isMarkdownFile(path.join(dirname, data.href))) {
    pathname = path.join(dirname, data.href)
  }
  if (pathname) {
    const win = BrowserWindow.fromWebContents(e.sender)
    return openFileOrFolder(win, pathname)
  }
})

// --- commands -------------------------------------

ipcMain.on('mt::cmd-open-file', e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  openFile(win)
})

ipcMain.on('mt::cmd-new-editor-window', () => {
  newEditorWindow()
})

ipcMain.on('mt::cmd-open-folder', e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  openFolder(win)
})

ipcMain.on('mt::cmd-close-window', e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  win.close()
})

ipcMain.on('mt::cmd-import-file', e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  importFile(win)
})

// --- menu -------------------------------------

export const exportFile = (win, type) => {
  if (win && win.webContents) {
    win.webContents.send('mt::show-export-dialog', type)
  }
}

export const importFile = async win => {
  const existsPandoc = pandoc.exists()

  if (!existsPandoc) {
    return noticePandocNotFound(win)
  }

  const { filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{
      name: 'All Files',
      extensions: PANDOC_EXTENSIONS
    }]
  })

  if (filePaths && filePaths[0]) {
    openPandocFile(win.id, filePaths[0])
  }
}

export const print = win => {
  if (win) {
    win.webContents.send('mt::show-export-dialog', 'print')
  }
}

export const openFile = async win => {
  const { filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{
      name: 'text',
      extensions: MARKDOWN_EXTENSIONS
    }]
  })

  if (filePaths && Array.isArray(filePaths)) {
    ipcMain.emit('app-open-files-by-id', win.id, filePaths)
  }
}

export const openFolder = async win => {
  const { filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory']
  })

  if (filePaths && filePaths[0]) {
    openFileOrFolder(win, filePaths[0])
  }
}

export const openFileOrFolder = (win, pathname) => {
  const resolvedPath = normalizeAndResolvePath(pathname)
  if (isFile(resolvedPath)) {
    ipcMain.emit('app-open-file-by-id', win.id, resolvedPath)
  } else if (isDirectory(resolvedPath)) {
    ipcMain.emit('app-open-directory-by-id', win.id, resolvedPath)
  } else {
    console.error(`[ERROR] Cannot open unknown file: "${resolvedPath}"`)
  }
}

export const newBlankTab = win => {
  if (win && win.webContents) {
    win.webContents.send('mt::new-untitled-tab')
  }
}

export const newEditorWindow = () => {
  ipcMain.emit('app-create-editor-window')
}

export const closeTab = win => {
  if (win && win.webContents) {
    win.webContents.send('mt::editor-close-tab')
  }
}

export const save = win => {
  if (win && win.webContents) {
    win.webContents.send('mt::editor-ask-file-save')
  }
}

export const saveAs = win => {
  if (win && win.webContents) {
    win.webContents.send('mt::editor-ask-file-save-as')
  }
}

export const autoSave = (menuItem, browserWindow) => {
  const { checked } = menuItem
  ipcMain.emit('set-user-preference', { autoSave: checked })
}

export const moveTo = win => {
  if (win && win.webContents) {
    win.webContents.send('mt::editor-move-file')
  }
}

export const rename = win => {
  if (win && win.webContents) {
    win.webContents.send('mt::editor-rename-file')
  }
}

export const clearRecentlyUsed = () => {
  ipcMain.emit('menu-clear-recently-used')
}
