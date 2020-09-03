import axios from 'axios'
import store from '@/store'
import { message } from 'ant-design-vue'

import router from '@/router'

const errCode = {
  SUCCESS: 200, //请求成功
  ErrorAuthCheckTokenFail: 20001, //"Token无效"
  ErrorAuthCheckTokenTimeout: 20002, //""Token已超时""
  ErrorAuthToken: 20003, //"Token参数错误"
}

axios.defaults.withCredentials = false

// 请求拦截器
axios.interceptors.request.use(
  config => {
    //自动加token
    const token = store.state.user.token
    config.headers.Authorization = token ? token : ''
    return config
  },
  error => {
    return Promise.error(error)
  },
)

// 响应拦截器
axios.interceptors.response.use(
  // 请求成功
  async res => {
    if (res.status === 200) {
      const code = res.data.code
      const msg = res.data.msg
      switch (code) {
        case errCode.SUCCESS:
          return Promise.resolve(res.data.data)
        case errCode.ErrorAuthToken:
        case errCode.ErrorAuthCheckTokenFail:
        case errCode.ErrorAuthCheckTokenTimeout:
          message.error('登录失效，请重新登录,ERROR：' + msg)
          store.commit('user/update_token', '')
          router.push('/sign/in').catch(err => err)
          return Promise.reject(res)
        default:
          message.error('ERROR：' + msg)
          return Promise.reject(res)
      }
    } else {
      message.error('服务器出错了:(，ERROR：' + res.data)
      return Promise.reject(res)
    }
  },
  // 请求失败
  err => {
    //TODO 日志记录
    if (err.response) {
      //接收到响应，认为服务器错误，或者用户输入服务器地址错误导致请求成功，但是接口失败
      message.eerror('服务器错误，ERROR：' + err)
    } else if (!err.request) {
      //发送请求失败，可能是用户url地址错误或者代码错误
      //or
      //成功发送请求，但是未接收到响应
      if (!window.navigator.onLine) {
        store.commit('update_online', false)
      } else {
        message.error('网络错误，请检查，ERROR：' + err)
      }
    }
    return Promise.reject(err)
  },
)

export default axios
