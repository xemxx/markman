import axios, { AxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'

import { useUserStore, useSyncStore } from '@/store'
import router from '@/router'

const errCode = {
  SUCCESS: 200, //请求成功
  ErrorAuthCheckTokenFail: 20001, //"Token无效"
  ErrorAuthCheckTokenTimeout: 20002, //""Token已超时""
  ErrorAuthToken: 20003, //"Token参数错误"
}

const http = axios.create({
  // timeout: 1000 * 4,
  withCredentials: false,
})

// 请求拦截器
http.interceptors.request.use(
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
http.interceptors.response.use(
  // 请求成功
  async res => {
    const config = res.config
    const showToast = config.fetchOptions?.showToast
    const user = useUserStore()
    const code = res.data.code
    const msg = res.data.msg
    if (res.data.message == 'pong') {
      return Promise.resolve(res.data)
    }
    switch (code) {
      case errCode.SUCCESS:
        return Promise.resolve(res.data.data)
      case errCode.ErrorAuthToken:
      case errCode.ErrorAuthCheckTokenFail:
      case errCode.ErrorAuthCheckTokenTimeout:
        if (showToast) {
          message.error('登录失效，请重新登录,ERROR：' + msg)
        }
        user.update_token('')
        router.push('/login').catch(err => err)
        return Promise.resolve(res)
      default:
        if (showToast) {
          message.error('ERROR：' + msg)
        }
        return Promise.reject(res)
    }
  },
  // 请求失败，非200自动进入
  err => {
    const config = err.config
    const showToast = config.fetchOptions?.showToast
    if (err.response) {
      //接收到响应，认为服务器错误，或者用户输入服务器地址错误导致请求成功，但是接口失败
      message.error('服务器错误,' + err)
      return Promise.reject('服务器错误,' + err)
    } else if (err.code == 'ERR_NETWORK') {
      //发送请求失败，可能是用户url地址错误或者代码错误
      //or
      //成功发送请求，但是未接收到响应
      if (!navigator.onLine) {
        const store = useSyncStore()
        store.update_online(false)
        if (showToast) {
          message.error('检测到网络离线，请检查网络状况')
        }
        return Promise.reject('检测到网络离线，请检查网络状况')
      } else {
        if (showToast) {
          message.error('网络错误,请检查服务器地址配置或者网络状况')
        }
        return Promise.reject('网络错误,请检查服务器地址配置或者网络状况')
      }
    } else {
      return Promise.reject(err)
    }
  },
)

export default http
