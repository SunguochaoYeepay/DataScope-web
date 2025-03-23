import request from '@/utils/request'
import type { LoginRequest, LoginResponse, UserInfo } from '@/types/auth'

/**
 * 用户登录
 * @param data 登录参数
 * @returns 登录响应
 */
export function login(data: LoginRequest) {
  return request.post<LoginResponse>('auth/login', data)
}

/**
 * 用户登出
 */
export function logout() {
  return request.post<void>('auth/logout')
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.get<UserInfo>('auth/users/info')
} 