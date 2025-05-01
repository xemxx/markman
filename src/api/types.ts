/**
 * API 类型定义
 */

import { NodeItem } from '@/model/node'

/**
 * 同步响应接口
 */
export interface SyncResponse {
  isErr: boolean
  SC: number
  isRepeat: boolean
}

/**
 * 服务器节点数据接口
 */
export interface ServerNodeData {
  guid: string
  title: string
  content: string
  SC: number
  addDate: string
  modifyDate: string
  parentId: string
  type: 'note' | 'folder'
  sort: number
  sortType: number
  isDel: number
}

/**
 * 同步节点响应接口
 */
export interface SyncNodeResponse {
  nodes: ServerNodeData[]
}

/**
 * 服务器状态响应接口
 */
export interface ServerStatusResponse {
  message: string
  ok?: boolean
}

/**
 * 服务器版本响应接口
 */
export interface ServerVersionResponse {
  version: string
  minClientVersion?: string
}

/**
 * 服务器同步计数响应接口
 */
export interface SyncCountResponse {
  SC: number
}

/**
 * 同步参数接口
 */
export interface SyncParams {
  localSC: number
  serverSC: number
}

/**
 * 更新节点到服务器的参数接口
 */
export interface UpdateNodeToServerParams {
  data: NodeItem[]
  index: number
}
