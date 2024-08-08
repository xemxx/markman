import { dialog, shell, ipcMain } from 'electron'
import axios from 'axios'
import pkg from '../../../../package.json'
const version = pkg.version
const release =
  'https://api.github.com/repos/xemxx/markman-client/releases/latest'
const downloadUrl = 'https://github.com/xemxx/markman-client/releases/latest'

let runningUpdate = false

export const userSetting = () => {
  ipcMain.emit('app-create-settings-window')
}

export const checkUpdates = async () => {
  if (!runningUpdate) {
    runningUpdate = true
    checkVersion()
  }
}

const checkVersion = async () => {
  try {
    const res = await axios.get(release)
    if (res.status === 200) {
      const latest = res.data.name // 获取版本号
      const result = compareVersion2Update(version, latest) // 比对版本号，如果本地版本低于远端则更新
      if (result) {
        const clickResult = dialog.showMessageBoxSync({
          type: 'info',
          title: '升级提示',
          buttons: ['Yes', 'No'],
          message: '发现新版本，更新了很多功能，是否去下载最新的版本？',
          cancelId: 1,
        })
        if (clickResult === 0) {
          shell.openExternal(downloadUrl)
        }
      } else {
        dialog.showMessageBoxSync({
          type: 'info',
          title: '升级提示',
          buttons: ['确定'],
          message: '已是最新版本，无需升级',
          cancelId: 0,
        })
      }
    }
  } catch (err) {
    err
    dialog.showMessageBoxSync({
      type: 'info',
      title: '升级提示',
      buttons: ['确定'],
      message: `网络错误，请自行前往github下载更新：${downloadUrl}`,
      cancelId: 0,
    })
  }
  runningUpdate = false
}

// if true -> update else return false
const compareVersion2Update = (current, latest) => {
  const currentVersion = current.split('.').map(item => parseInt(item))
  const latestVersion = latest.split('.').map(item => parseInt(item))
  let flag = false

  for (let i = 0; i < 3; i++) {
    if (currentVersion[i] < latestVersion[i]) {
      flag = true
    }
  }

  return flag
}
