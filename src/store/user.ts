import { User, userItem } from '@/model/user'
import { getCookie, setCookie } from '../tools'
import { defineStore } from 'pinia'
import { useSidebarStore, useEditorStore } from './index'
import { ipcRenderer } from 'electron'
import { User2Icon } from 'lucide-vue-next'

const model = new User()

type localUser = {
  server: string
  isLogin: boolean
  dbUser: userItem | undefined
}

const state = <localUser>{
  server: '',
  isLogin: false,
  dbUser: undefined,
}

export const useUserStore = defineStore('user', {
  state: () => state,
  actions: {
    loadActiveUserFromDB() {
      return model.getCurrentUser()
    },

    flashToken(token: string) {
      if (this.dbUser != undefined) {
        model.update(this.dbUser?.id!, { token })
        this.dbUser.token = token
      }
    },

    unSetCurrentUser() {
      this.isLogin = false
      if (this.dbUser == undefined) {
        return Promise.resolve()
      }
      const sidebar = useSidebarStore()
      sidebar.$reset()
      const editor = useEditorStore()
      editor.$reset()
      ipcRenderer.send('m::set-logging-state', false)
      return model.update(this.dbUser.id, { state: 0 }).then(() => {
        this.dbUser = undefined
        console.log('unset state')
      })
    },

    unsetDBActive(id: number) {
      return model.update(id, { state: 0 })
    },

    async setCurrentUser({ username, token, uuid }) {
      let id = await model.existUser(username, uuid)
      if (id != 0) {
        await model.update(id, { state: 1, token, server: this.server })
      } else {
        // v0.3.0 适配新增uuid的逻辑，后续迭代版本可以考虑删除，因为现在不一定有用户。。。
        let data = await model.getByUserName(username)
        if (data != undefined && (data.uuid == undefined || data.uuid == '')) {
          await model.update(data.id, {
            state: 1,
            token,
            uuid,
            server: this.server,
          })
        } else {
          await model.add({
            username,
            server: this.server,
            token,
            state: 1,
            lastSC: 0,
            uuid: uuid,
          })
        }
      }
      let user: userItem = await model.getCurrentUser()
      this.update_user(user)
      this.setLogin()
    },

    update_user(value: userItem) {
      this.dbUser = value
    },

    update_lastSC(serverSC: any) {
      if (this.dbUser != undefined) {
        model.update(this.dbUser?.id!, { lastSC: serverSC })
        this.dbUser.lastSC! = serverSC
      }
    },

    updateServerAddr(value: string) {
      this.server = value
    },
    setLogin() {
      this.isLogin = true
      ipcRenderer.send('m::set-logging-state', true)
    },
  },
})
