import axios from 'axios'
import { message } from 'ant-design-vue'

import { useUserStore } from '@/store/user'
import { useSysStore } from '@/store/sys'
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
    const user = useUserStore()
    const token = user.token
    if (config.headers) {
      config.headers['Authorization'] = token ? token : ''
    }
    return config
  },
  error => {
    console.error('请求拦截器错误：', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
axios.interceptors.response.use(
  // 请求成功
  async res => {
    const user = useUserStore()
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
          user.update_token('')
          router.push('/sign/in').catch(err => err)
          return Promise.reject(res)
        default:
          message.error('ERROR：' + msg)
          return Promise.reject(res)
      }
    } else {
      message.error('服务器出错了:(，ERROR：' + res)
      return Promise.reject(res)
    }
  },
  // 请求失败
  err => {
    console.error('响应拦截器错误：', err)
    if (err.response) {
      //接收到响应，认为服务器错误，或者用户输入服务器地址错误导致请求成功，但是接口失败
      message.error('服务器错误,' + err)
      return Promise.reject('服务器错误,' + err)
    } else if (err.code == 'ERR_NETWORK') {
      //发送请求失败，可能是用户url地址错误或者代码错误
      //or
      //成功发送请求，但是未接收到响应
      if (!window.navigator.onLine) {
        const store = useSysStore()
        store.update_online(false)
      } else {
        message.error('网络错误,请检查,' + err)
        return Promise.reject('网络错误,请检查,' + err)
      }
    } else {
      return Promise.reject(err)
    }
  },
)

export default axios
