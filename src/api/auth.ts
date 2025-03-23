import request from '@/utils/request'
import type { UserInfo } from '@/types/user'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  user: UserInfo
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/api/v1/auth/login', data)
}

export async function logout(): Promise<void> {
  return request.post('/api/v1/auth/logout')
}

export async function getUserInfo(): Promise<UserInfo> {
  return request.get('/api/v1/auth/users/info')
} 