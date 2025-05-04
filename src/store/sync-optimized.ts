/**
 * 同步状态管理
 */
import { v1 as uuid } from 'uuid'
import { defineStore } from 'pinia'

import { NodeModel, NodeItem } from '@/model/node'
import {
  useUserStore,
  useEditorStore,
  usePreferenceStore,
  useSidebarStore,
} from './index'
import {
  syncApi,
  ServerNodeData,
  SyncParams,
  SyncResponse,
  UpdateNodeToServerParams,
} from '@/api'

// 模型实例
const nodeModel = new NodeModel()

// 同步配置
const DEFAULT_SYNC_INTERVAL = 60000 // 默认同步间隔：1分钟
const MIN_SYNC_INTERVAL = 30000 // 最小同步间隔：30秒
const OFFLINE_CHECK_INTERVAL = 5000 // 离线检查间隔：30秒

// 初始状态
interface SyncState {
  isSyncing: boolean
  online: boolean
  platform: string | undefined
  syncTimer: number | null
  checkOnlineTimer: number | null
  lastSyncTime: number
  syncInterval: number
  isLogin: boolean
}

const state: SyncState = {
  isSyncing: false,
  online: false,
  platform: process.env.platform,
  syncTimer: null,
  checkOnlineTimer: null,
  lastSyncTime: 0,
  syncInterval: DEFAULT_SYNC_INTERVAL,
  isLogin: false,
}

/**
 * 同步状态管理
 */
export const useSyncStore = defineStore('sync', {
  state: () => state,
  actions: {
    /**
     * 初始化定时同步
     */
    initAutoSync(): void {
      // 清除现有定时器
      this.stopAutoSync()

      // 从用户偏好设置中获取同步间隔
      const preference = usePreferenceStore()
      this.syncInterval = preference.syncInterval || DEFAULT_SYNC_INTERVAL

      // 确保同步间隔不小于最小值
      if (this.syncInterval < MIN_SYNC_INTERVAL) {
        this.syncInterval = MIN_SYNC_INTERVAL
      }

      // 启动定时同步
      this.startAutoSync()

      // 首次连接检查
      this.checkServerOnline()
    },

    /**
     * 启动定时同步
     */
    startAutoSync(): void {
      if (this.syncTimer !== null) {
        return
      }

      // 创建定时器
      this.syncTimer = window.setInterval(() => {
        // 如果在线且不在同步中，执行同步
        if (this.online && !this.isSyncing) {
          this.sync(false, true) // 静默同步
        } else if (!this.online) {
          // 如果离线，尝试检查服务器
          this.checkServerOnline()
        }
      }, this.syncInterval)
    },

    /**
     * 停止定时同步
     */
    stopAutoSync(): void {
      if (this.syncTimer !== null) {
        window.clearInterval(this.syncTimer)
        this.syncTimer = null
      }
    },

    /**
     * 更新同步间隔
     * @param interval 新的同步间隔（毫秒）
     */
    updateSyncInterval(interval: number): void {
      // 确保间隔不小于最小值
      this.syncInterval = Math.max(interval, MIN_SYNC_INTERVAL)

      // 重启定时同步
      if (this.syncTimer !== null) {
        this.stopAutoSync()
        this.startAutoSync()
      }
    },

    /**
     * 更新在线状态
     * @param value 是否在线
     */
    update_online(value: boolean, sync: boolean = false): void {
      this.online = value
      if (!value) {
        // 如果离线，定时检查连接
        if (this.checkOnlineTimer !== null) {
          window.clearTimeout(this.checkOnlineTimer)
        }
        this.checkOnlineTimer = window.setInterval(
          () => this.checkServerOnline(),
          OFFLINE_CHECK_INTERVAL,
        )
      } else {
        if (this.checkOnlineTimer !== null) {
          window.clearTimeout(this.checkOnlineTimer)
        }
        if (sync) {
          this.sync(false, true)
        }
      }
    },

    /**
     * 更新同步状态
     * @param value 是否同步中
     */
    update_isSyncing(value: boolean): void {
      this.isSyncing = value
    },

    /**
     * 检查服务器是否在线
     * @returns 是否在线
     */
    async checkServerOnline(): Promise<boolean> {
      const user = useUserStore()
      const server = user.server
      if (server == '') {
        return false
      }
      if (!navigator.onLine) {
        this.update_online(false)
        return false
      }

      try {
        await syncApi.checkServerStatus(server)
        this.update_online(true)
        return true
      } catch (err) {
        this.update_online(false)
        return false
      }
    },

    /**
     * 同步数据
     * @param force 是否强制同步
     * @param silent 是否静默同步（不显示状态变化）
     */
    async sync(force = false, silent = false): Promise<void> {
      // 记录同步时间
      this.lastSyncTime = Date.now()

      if (!force) {
        if (!this.online) {
          return
        }
        // 防止重复同步
        if (this.isSyncing) return

        // 非静默模式才更新状态
        if (!silent) {
          this.isSyncing = true
        }
      }

      const user = useUserStore()
      if (!user.isLogin) {
        this.update_isSyncing(false)
        return
      }
      const server = user.server

      try {
        // 获取本地上次更新版本号
        if (user.dbUser == undefined) {
          // 当前用户不存在，可能是数据bug，需要重新登录
          throw new Error('用户不存在')
        }
        const localSC = user.dbUser?.lastSC

        // 获取服务端版本号
        const { SC: serverSC = 0 } = await syncApi.getLastSyncCount(server)

        // 如果需要更新则拉取
        if (serverSC > localSC) {
          await this.pull({ localSC, serverSC })
        }

        await this.push(user.dbUser?.id!)
        const sidebarS = useSidebarStore()
        await sidebarS.loadNodeTree()
        this.update_online(true)
        // 非静默模式才更新状态
        if (!silent) {
          setTimeout(() => this.update_isSyncing(false), 1000)
        }
      } catch (err) {
        console.error('同步失败:', err)

        // 非静默模式才更新状态
        if (!silent) {
          setTimeout(() => this.update_isSyncing(false), 1000)
        }
      }
    },

    /**
     * 拉取数据
     * @param params 同步参数
     */
    async pull(params: SyncParams): Promise<void> {
      const user = useUserStore()

      await this._pullNodes(params.localSC)
      user.update_lastSC(params.serverSC)
    },

    /**
     * 推送数据
     */
    async push(uid: number) {
      if (uid === null) {
        console.error('用户ID为空')
        return
      }
      await this._pushNodes(uid)
    },

    /**
     * 拉取节点数据
     * @param afterSC 同步计数
     */
    async _pullNodes(afterSC: string | number): Promise<void> {
      const user = useUserStore()
      const server = user.server

      try {
        const data = await syncApi.getSyncNodes(server, afterSC)
        const nodes = data.nodes

        if (nodes.length > 0) {
          await this._updateNodesToLocal(nodes)
        }

        if (nodes.length === 20) {
          // 如果返回的数据量等于请求的最大数量，说明可能还有更多数据
          return this._pullNodes(nodes[nodes.length - 1].SC)
        }
      } catch (error) {
        console.error('拉取节点数据失败:', error)
        throw error
      }
    },

    /**
     * 更新节点到本地
     * @param serverData 服务器节点数据
     */
    async _updateNodesToLocal(serverData: ServerNodeData[]): Promise<void> {
      const user = useUserStore()
      const editor = useEditorStore()
      const uid = user.dbUser?.id!

      if (uid === null) {
        console.error('用户ID为空')
        return
      }

      try {
        const localNodes = await nodeModel.getLocalByServer(uid, serverData)
        const localDataMap = new Map<string, NodeItem>()

        // 构建本地数据映射
        for (const node of localNodes) {
          localDataMap.set(node.guid, node)
        }

        // 处理每个服务器节点
        for (const serverNode of serverData) {
          const localNode = localDataMap.get(serverNode.guid)

          // 解析服务器数据
          const {
            guid,
            title,
            content,
            SC,
            parentId,
            type,
            sort,
            sortType,
            isDel,
          } = serverNode

          // 转换日期格式
          const parsedAddDate = Date.parse(serverNode.addDate) / 1000
          const parsedModifyDate = Date.parse(serverNode.modifyDate) / 1000

          // 如果本地存在该节点
          if (localNode) {
            if (isDel === 1) {
              // 服务器已删除，本地也删除
              await nodeModel.delete(localNode.id)
            } else {
              // 根据本地修改状态处理
              switch (localNode.modifyState) {
                case 0: // 本地无冲突，直接覆盖
                  await nodeModel.update(localNode.id, {
                    SC: serverNode.SC,
                    title,
                    content,
                    parentId: serverNode.parentId,
                    type,
                    sort,
                    sortType,
                    modifyDate: parsedModifyDate,
                    modifyState: 0,
                  })

                  // 如果是笔记且本地编辑器已经打开了需要同步
                  if (type === 'note' && localNode.id === editor.dbNote.id) {
                    editor.flashNote(true)
                  }
                  break

                case 1: // 本地新建说明UUID冲突,更新本地UUID
                  await nodeModel.update(localNode.id, {
                    guid: uuid(),
                  })
                  // 如果有冲突且当前正在编辑，更新编辑器
                  if (localNode.id === editor.dbNote.id) {
                    editor.flashNote(false)
                  }
                  break

                case 2: // 本地已修改且服务端SC更高，需要处理冲突
                  if (type === 'folder') {
                    // 文件夹冲突处理：比较修改时间，新的覆盖旧的
                    if (
                      Date.parse(String(localNode.modifyDate)) <
                      Date.parse(serverNode.modifyDate)
                    ) {
                      await nodeModel.update(localNode.id, {
                        title,
                        parentId: serverNode.parentId,
                        SC: serverNode.SC, // 更新SC，表示包含服务端版本
                        modifyDate: parsedModifyDate,
                        modifyState: 0,
                      })
                    }
                  } else {
                    // 笔记冲突处理：保留两端数据，让用户自行处理
                    let newTitle = `local: ${localNode.title} [---] server: ${title}`
                    let newContent = `local>>>>>>>>>>>>>>\n${localNode.content}\n [---------------------------------]\n server:>>>>>>>>>>>>>>>>\n${content}`
                    const newModifyDate =
                      Date.parse(String(localNode.modifyDate)) <
                      Date.parse(serverNode.modifyDate)
                        ? parsedModifyDate
                        : localNode.modifyDate

                    // 如果有冲突且当前正在编辑，更新编辑器
                    if (localNode.id === editor.dbNote.id) {
                      newContent = `local>>>>>>>>>>>>>>\n${editor.editContent}\n [---------------------------------]\n\n\n server:>>>>>>>>>>>>>>>>\n${content}`
                    }
                    await nodeModel.update(localNode.id, {
                      title: newTitle,
                      content: newContent,
                      parentId: serverNode.parentId,
                      modifyDate: newModifyDate,
                      SC: serverNode.SC, // 更新SC，表示包含服务端版本
                    })
                    if (localNode.id === editor.dbNote.id) {
                      editor.flashNote(true)
                    }
                  }
                  break

                case 3: // 拉取阶段，本地已删除但服务端更新，说明有另一个客户端推送了更新
                  // 选择覆盖本地，基本原则：根据SC大的来操作
                  await nodeModel.update(localNode.id, {
                    title,
                    content,
                    parentId: serverNode.parentId,
                    modifyDate: parsedModifyDate,
                    SC: serverNode.SC,
                    modifyState: 0,
                  })
                  break
              }
            }
          } else if (serverNode.isDel === 0) {
            // 本地不存在且服务器未删除，添加到本地
            await nodeModel.add({
              guid,
              SC,
              title,
              content,
              parentId: serverNode.parentId,
              type,
              sort,
              sortType,
              addDate: parsedAddDate,
              modifyDate: parsedModifyDate,
              uid,
              modifyState: 0, // 不需要同步
            })
          }
        }
      } catch (error) {
        console.error('更新本地节点失败:', error)
        throw error
      }
    },

    /**
     * 推送节点数据
     */
    async _pushNodes(uid: number) {
      try {
        const nodesToSync = await nodeModel.getModify(uid)

        if (nodesToSync.length > 0) {
          await this._updateNodesToServer({ data: nodesToSync, index: 0 })
        }
      } catch (error) {
        console.error('推送节点数据失败:', error)
        throw error
      }
    },

    /**
     * 更新节点到服务器
     * @param params 更新参数
     */
    async _updateNodesToServer(
      params: UpdateNodeToServerParams,
    ): Promise<void> {
      const { data, index } = params

      // 如果已处理完所有节点，返回
      if (index >= data.length) {
        return Promise.resolve()
      }

      const user = useUserStore()
      const editor = useEditorStore()
      const server = user.server
      const localNode = data[index]

      let result: SyncResponse

      try {
        // 根据修改状态选择操作
        switch (localNode.modifyState) {
          case 1: // 新建
            result = await syncApi.createNode(server, localNode)
            break

          case 2: // 修改
            result = await syncApi.updateNode(server, localNode)
            break

          case 3: // 删除
            result = await syncApi.deleteNode(server, localNode)
            break

          default:
            console.error('错误: modifyState 不是 1, 2 或 3')
            return
        }

        const { isErr, SC, isRepeat } = result

        if (isErr) {
          // 服务端冲突，需要重新拉取
          console.error(
            '未更新，SC不匹配，或者服务端错误，将在下一次同步更新: ',
            localNode.id,
            localNode.title,
            localNode.modifyState,
            SC,
            localNode.SC,
          )
          return this._updateNodesToServer({ data, index: index + 1 })
        } else if (isRepeat) {
          // UUID冲突，更新本地UUID并重试
          const newGuid = uuid()
          data[index].guid = newGuid

          await nodeModel.update(localNode.id, {
            guid: newGuid,
          })
          // 如果当前正在编辑的笔记被更新，更新编辑器
          if (localNode.id === editor.dbNote.id) {
            editor.dbNote.guid = newGuid
          }
          return this._updateNodesToServer({
            data,
            index,
          })
        } else if (SC == user.dbUser?.lastSC! + 1) {
          // 同步成功，更新本地状态
          if (localNode.modifyState === 3) {
            // 删除操作，删除本地数据
            await nodeModel.delete(localNode.id)
          } else {
            // 更新本地SC和修改状态
            await nodeModel.update(localNode.id, {
              SC: SC,
              modifyState: 0,
            })
            if (localNode.id === editor.dbNote.id) {
              editor.flashNote(false)
            }
          }

          // 更新用户的lastSC
          await user.update_lastSC(SC)

          // 处理下一个节点
          return this._updateNodesToServer({ data, index: index + 1 })
        } else {
          console.error(
            '未更新，SC不匹配，将在下一次同步更新: ',
            localNode.id,
            localNode.title,
            localNode.modifyState,
            SC,
            localNode.SC,
          )
          return this._updateNodesToServer({ data, index: index + 1 })
        }
      } catch (error) {
        console.error(
          '更新服务器节点失败，将在下一次同步更新:',
          error,
          localNode.id,
        )
        return this._updateNodesToServer({ data, index: index + 1 })
      }
    },
  },
})

// 监听网络状态变化
window.addEventListener('online', () =>
  useSyncStore().update_online(true, true),
)
window.addEventListener('offline', () => useSyncStore().update_online(false))

// 在应用启动时初始化定时同步
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化，确保其他组件已加载
  setTimeout(() => {
    const store = useSyncStore()
    const preference = usePreferenceStore()

    // 如果用户开启了自动同步，初始化定时同步
    if (preference.autoSync) {
      store.initAutoSync()
    }
  }, 1000)
})

// 在应用关闭时清理定时器
window.addEventListener('beforeunload', () => {
  const store = useSyncStore()
  store.stopAutoSync()
})
