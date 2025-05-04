/**
 * 同步相关 API 服务
 */

import http from '@/plugins/axios'
import { NodeItem } from '@/model/node'
import {
  ServerStatusResponse,
  ServerVersionResponse,
  SyncCountResponse,
  SyncNodeResponse,
  SyncResponse,
} from './types'

/**
 * 同步 API 服务
 */
export const syncApi = {
  /**
   * 检查服务器是否在线
   * @param server 服务器地址
   * @returns 服务器状态
   */
  checkServerStatus: (server: string) => {
    return http.get<ServerStatusResponse, ServerStatusResponse>(
      server + '/ping',
      {
        fetchOptions: { disableToast: true },
      },
    )
  },

  /**
   * 获取服务器版本信息
   * @param server 服务器地址
   * @returns 服务器版本信息
   */
  getServerVersion: (server: string) => {
    return http.get<ServerVersionResponse, ServerVersionResponse>(
      server + '/version',
      {
        fetchOptions: { disableToast: true },
      },
    )
  },

  /**
   * 获取服务器最新同步计数
   * @param server 服务器地址
   * @returns 同步计数
   */
  getLastSyncCount: (server: string) => {
    return http.get<SyncCountResponse, SyncCountResponse>(
      `${server}/user/getLastSyncCount`,
    )
  },

  /**
   * 获取同步节点数据
   * @param server 服务器地址
   * @param afterSC 同步计数
   * @param maxCount 最大数量
   * @returns 同步节点数据
   */
  getSyncNodes: (
    server: string,
    afterSC: string | number,
    maxCount: number = 20,
  ) => {
    return http.get<SyncNodeResponse, SyncNodeResponse>(
      `${server}/node/getSync?afterSC=${afterSC}&maxCount=${maxCount}`,
    )
  },

  /**
   * 创建节点
   * @param server 服务器地址
   * @param node 节点数据
   * @returns 同步响应
   */
  createNode: (server: string, node: NodeItem) => {
    return http.post<SyncResponse, SyncResponse>(`${server}/node/create`, node)
  },

  /**
   * 更新节点
   * @param server 服务器地址
   * @param node 节点数据
   * @returns 同步响应
   */
  updateNode: (server: string, node: NodeItem) => {
    return http.post<SyncResponse, SyncResponse>(`${server}/node/update`, node)
  },

  /**
   * 删除节点
   * @param server 服务器地址
   * @param node 节点数据
   * @returns 同步响应
   */
  deleteNode: (server: string, node: NodeItem) => {
    return http.post<SyncResponse, SyncResponse>(`${server}/node/delete`, node)
  },
}
