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
}

export const useUserStore = defineStore('user', {
  state: () => ({
    id: getCookie('uid') ? getCookie('uid') : '',
    token: getCookie('token') ? getCookie('token') : '',
    username: getCookie('username') ? getCookie('username') : '',
    server: getCookie('server') ? getCookie('server') : '',
    lastSC: getCookie('lastSC') ? getCookie('lastSC') : '',
  }),
  actions: {
    loadActiver() {
      return model.getActiver().then((user: UserD | undefined) => {
        if (user != undefined) {
          this.update_id(user.id)
          this.update_lastSC(user.lastSC)
          this.update_server(user.server)
          this.update_token(user.token)
          this.update_username(user.username)
          return Promise.resolve()
        } else {
          return Promise.reject('not login')
        }
      })
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
      return model.update(id!, { state: 0 })
    },

    setActiver({ username, token, server }) {
      return model.existUser(username, server).then((id: string) => {
        if (id !== '') {
          return model
            .update(id, { state: 1, token })
            .then(() => {
              return this.loadActiver()
            })
            .catch((err: any) => {
              console.log(err)
            })
        }
        return model
          .add({ username, server, token, state: 1, lastSC: 0 })
          .then(() => {
            return this.loadActiver()
          })
          .catch((err: any) => {
            console.log(err)
          })
      })
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
  },
})
