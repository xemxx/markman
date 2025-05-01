import { dialog, shell, ipcMain } from 'electron'
import axios from 'axios'
import pkg from '../../../../package.json'
const version = pkg.version
const release =
  'https://api.github.com/repos/xemxx/markman-client/releases/latest'
const downloadUrl = 'https://github.com/xemxx/markman-client/releases/latest'

let runningUpdate = false
let retryCount = 0
const MAX_RETRIES = 3
const RETRY_DELAY = 3000 // 3秒后重试

export const userSetting = () => {
  ipcMain.emit('app-create-settings-window')
}

export const checkUpdates = async () => {
  if (!runningUpdate) {
    runningUpdate = true
    try {
      await checkVersion()
    } finally {
      runningUpdate = false
    }
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
      retryCount = 0 // 重置重试计数
    }
  } catch (err) {
    console.error('检查更新失败:', err)
    retryCount++

    if (retryCount < MAX_RETRIES) {
      // 如果还有重试次数，延迟后重试
      setTimeout(async () => {
        runningUpdate = false // 重置状态以允许重试
        await checkUpdates()
      }, RETRY_DELAY)
      return
    }

    // 超过最大重试次数，显示错误消息
    dialog.showMessageBoxSync({
      type: 'info',
      title: '升级提示',
      buttons: ['确定'],
      message: `检查更新失败，请自行前往github下载更新：${downloadUrl}`,
      cancelId: 0,
    })
    retryCount = 0 // 重置重试计数
  }
}

// 比较版本号，如果需要更新返回true
const compareVersion2Update = (current: string, latest: string): boolean => {
  const currentVersion = current.split('.').map(item => parseInt(item))
  const latestVersion = latest.split('.').map(item => parseInt(item))

  // 确保两个版本号都是三位数
  if (currentVersion.length !== 3 || latestVersion.length !== 3) {
    console.error('版本号格式错误')
    return false
  }

  // 从高位到低位依次比较
  for (let i = 0; i < 3; i++) {
    if (currentVersion[i] < latestVersion[i]) {
      return true
    }
    if (currentVersion[i] > latestVersion[i]) {
      return false
    }
    // 如果相等，继续比较下一位
  }

  // 所有位都相等
  return false
}
