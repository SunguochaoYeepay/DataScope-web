/**
 * 环境工具函数
 */

/**
 * 判断当前是否为开发环境
 * @returns 是否为开发环境
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
}

/**
 * 判断当前是否为生产环境
 * @returns 是否为生产环境
 */
export function isProduction(): boolean {
  return import.meta.env.PROD || import.meta.env.MODE === 'production'
}

/**
 * 获取当前的API基础URL
 * @returns API基础URL
 */
export function getBaseUrl(): string {
  if (isDevelopment()) {
    return import.meta.env.VITE_API_BASE_URL || ''
  }
  return import.meta.env.VITE_API_BASE_URL || window.location.origin
}

/**
 * 获取当前环境名称
 * @returns 环境名称
 */
export function getEnvironment(): string {
  return import.meta.env.MODE
}