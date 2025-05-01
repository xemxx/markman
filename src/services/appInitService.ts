/**
 * 应用初始化服务 - 处理应用启动时的初始化逻辑
 */

import { useUserStore, useSyncStore } from '@/store'
import http from '@/plugins/axios'
import { message } from 'ant-design-vue'
import { getCookie } from '@/tools'
import { initDB } from '@/plugins/sqlite3/index'

/**
 * 初始化应用
 * 在应用启动时调用，只获取一次用户信息
 */
export async function initializeApp(): Promise<void> {
  // 初始化数据库
  initDB()
  const user = useUserStore()
  const sync = useSyncStore()

  const activeUser = await user.loadActiveUserFromDB()
  if (activeUser != undefined) {
    user.update_user(activeUser)
    // v0.3.0 适配新增uuid的逻辑
    if (activeUser.uuid == '' || activeUser.uuid == undefined) {
      await user.unSetCurrentUser()
      await user.unsetDBActive(activeUser.id)
      return
    }
    user.updateServerAddr(activeUser.server)
  }
  if (user.server === '') {
    const server = getCookie('server')
    if (server != '') {
      user.updateServerAddr(server)
    } else {
      user.unSetCurrentUser()
      return
    }
  }
  const online = await sync.checkServerOnline()
  if (activeUser == undefined) {
    return
  }
  if (activeUser.token === '') {
    await user.unSetCurrentUser()
    return
  }
  // 加载用户信息,检查token是否有效
  try {
    const data = JSON.parse(window.atob(activeUser.token!.split('.')[1]))

    if (data.exp > Date.parse(Date()) / 1000) {
      user.setLogin()
      // token未过期
      if (data.exp - Date.parse(Date()) / 1000 < 60 * 60 * 24 * 30) {
        // 代表在60天的后30天，需要刷新token
        if (online) {
          // 先判断网络状态，如果断网，则可使用最多30天，在30天内必须刷新token，否则将失效
          try {
            const response = await http.post(user.server + '/user/flashToken')
            // 刷新成功，直接进入
            user.flashToken(response.data.token)
          } catch (res: any) {
            // 刷新token失败，正常不可能失败，除非被用户修改了并且过期，如果是过期需要根据服务端判断的来，强制退出
            if (res.status == 200 && res.data.code != 200) {
              console.error(res.data.msg)
              user.unSetCurrentUser()
              return
            }
            console.error(res)
          }
        }
      }
    } else {
      // token已过期
      message.warning('token expired', 3)
      user.unSetCurrentUser()
    }
  } catch (err) {
    // 解析token失败
    user.unSetCurrentUser()
  }
}
