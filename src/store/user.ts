import User from '@/model/user.js'
import { getCookie, setCookie } from '../tools'
import { defineStore } from 'pinia'

const model = new User()

interface UserD {
  id: any
  token: any
  server: any
  username: any
  lastSC: any
  uuid: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    id: getCookie('uid') ? getCookie('uid') : '',
    token: getCookie('token') ? getCookie('token') : '',
    username: getCookie('username') ? getCookie('username') : '',
    server: getCookie('server') ? getCookie('server') : '',
    lastSC: getCookie('lastSC') ? getCookie('lastSC') : '',
    uuid: getCookie('uuid') ? getCookie('uuid') : '',
  }),
  actions: {
    async loadActiver() {
      let user: UserD | undefined = await model.getActiver()
      if (user != undefined) {
        // v0.3.0 适配新增uuid的逻辑，后续迭代版本可以考虑删除，因为现在不一定有用户。。。
        if (user.uuid == '' || user.uuid == undefined) {
          throw new Error('need relogin with uuid')
        }
        this.update_id(user.id)
        this.update_lastSC(user.lastSC)
        this.update_server(user.server)
        this.update_token(user.token)
        this.update_username(user.username)
        this.update_uuid(user.uuid)
      } else {
        throw new Error('not login')
      }
    },

    flashToken(token: string) {
      model.update(this.id!, { token })
      this.token = token
    },

    unSetActiver() {
      let id = this.id
      this.update_id(0)
      this.update_lastSC(0)
      this.update_server('')
      this.update_token('')
      this.update_username('')
      this.update_uuid('')
      return model.update(id!, { state: 0 })
    },

    async setActiver({ username, token, uuid, server }) {
      let id = await model.existUser(username, uuid)
      if (id != '') {
        await model.update(id, { state: 1, token, server })
      } else {
        // v0.3.0 适配新增uuid的逻辑，后续迭代版本可以考虑删除，因为现在不一定有用户。。。
        let data = await model.getByUserName(username)
        if (data != undefined && (data.uuid == undefined || data.uuid == '')) {
          await model.update(data.id, { state: 1, token, uuid, server })
        } else {
          await model.add({
            username,
            server,
            token,
            state: 1,
            lastSC: 0,
            uuid: uuid,
          })
        }
      }
      await this.loadActiver()
    },

    update_id(value: any) {
      setCookie('uid', value)
      this.id = value
    },
    update_token(value: any) {
      setCookie('token', value)
      this.token = value
    },
    update_username(value: any) {
      setCookie('username', value)
      this.username = value
    },
    update_server(value: any) {
      setCookie('server', value)
      this.server = value
    },
    update_lastSC(value: any) {
      setCookie('lastSC', value)
      this.lastSC = value
    },
    update_uuid(value: string) {
      setCookie('uuid', value)
      this.uuid = value
    },
  },
})
