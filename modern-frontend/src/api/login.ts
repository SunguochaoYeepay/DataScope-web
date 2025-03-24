import { post } from './http'
import axios from 'axios'

// 登录请求接口
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应接口
export interface LoginResponse {
  token: string
  user: {
    id: string | number
    username: string
    name: string
    role: string
  }
}

// 登录API
export function login(data: LoginRequest) {
  return post<{ data: LoginResponse }>('/api/v1/auth/login', data)
}

// 设置登录凭据
export function setAuthCredentials(username: string, password: string) {
  const credentials = 'Basic ' + btoa(`${username}:${password}`)
  axios.defaults.headers.common['Authorization'] = credentials
  return credentials
}

// 使用默认登录凭据（仅用于开发调试）
export function useDefaultCredentials() {
  axios.defaults.headers.common['Authorization'] = 'Basic YWRtaW46YWRtaW4xMjM='
  return 'Basic YWRtaW46YWRtaW4xMjM='
}

// 清除登录凭据
export function clearAuthCredentials() {
  delete axios.defaults.headers.common['Authorization']
} 