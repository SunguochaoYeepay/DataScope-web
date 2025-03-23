import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

export const baseURL = 'http://localhost:8080/api'

export const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    // 网络错误或后端服务未启动
    if (!error.response) {
      return Promise.reject({
        message: '无法连接到服务器，请确认后端服务是否已启动'
      })
    }

    // 服务器响应错误
    const { status, data } = error.response
    switch (status) {
      case 401:
        localStorage.removeItem('token')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        break
      case 403:
      case 404:
      case 500:
        break
      default:
        break
    }
    return Promise.reject(data || { message: '请求失败，请稍后重试' })
  }
) 