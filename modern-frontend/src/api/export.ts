import { get, post, put, del } from './http'

// 导出配置类型定义
export interface ColumnConfig {
  field: string
  label: string
  width?: number
  format?: string
  maskConfig?: {
    type: 'NONE' | 'FIXED' | 'REGEX' | 'EMAIL' | 'PHONE' | 'ID_CARD' | 'BANK_CARD' | 'ADDRESS' | 'NAME'
    start?: number
    end?: number
    maskChar?: string
  }
  export: boolean
  order?: number
}

export interface FilterCondition {
  field: string
  operator: string
  value: any
  valueType: string
}

export interface FilterConfig {
  conditions: FilterCondition[]
  operator: string
}

export interface ExportConfig {
  id?: string
  name: string
  queryConfigId?: string
  dataSourceId: string
  tableName: string
  exportType: 'CSV' | 'EXCEL' | 'JSON'
  columnConfig: ColumnConfig[]
  filterConfig?: FilterConfig
}

// 导出历史记录类型定义
export interface ExportHistory {
  id?: string
  exportConfigId: string
  configName?: string
  fileName?: string
  fileSize?: number
  rowCount?: number
  startTime?: string
  endTime?: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  errorMessage?: string
  createdBy?: string
}

// API响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  requestId?: string
  timestamp: number
}

// 分页请求参数
export interface PageRequest {
  page: number
  size: number
  sort?: string[]
}

// 分页响应格式
export interface PageResponse<T> {
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
  size: number
  content: T[]
  number: number
  numberOfElements: number
  empty: boolean
}

// 获取所有导出配置
export async function getExportConfigs() {
  return get<ApiResponse<ExportConfig[]>>('/v1/exports/configs')
}

// 搜索导出配置
export async function searchExportConfigs(params: {
  name?: string
  dataSourceId?: string
  tableName?: string
  pageable: PageRequest
}) {
  return get<ApiResponse<PageResponse<ExportConfig>>>('/v1/exports/configs/search', params)
}

// 获取导出配置详情
export async function getExportConfig(id: string) {
  return get<ApiResponse<ExportConfig>>(`/v1/exports/configs/${id}`)
}

// 创建导出配置
export async function createExportConfig(config: ExportConfig) {
  return post<ApiResponse<ExportConfig>>('/v1/exports/configs', config)
}

// 更新导出配置
export async function updateExportConfig(config: ExportConfig) {
  return put<ApiResponse<ExportConfig>>(`/v1/exports/configs/${config.id}`, config)
}

// 删除导出配置
export async function deleteExportConfig(id: string) {
  return del<ApiResponse<void>>(`/v1/exports/configs/${id}`)
}

// 执行导出操作
export async function executeExport(configId: string) {
  return post<ApiResponse<ExportHistory>>(`/v1/exports/execute/${configId}`)
}

// 获取导出历史记录
export async function getExportHistory(params: {
  configId?: string
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  createdBy?: string
  pageable: PageRequest
}) {
  return get<ApiResponse<PageResponse<ExportHistory>>>('/v1/exports/history', params)
}

// 获取导出历史详情
export async function getExportHistoryDetail(id: string) {
  return get<ApiResponse<ExportHistory>>(`/v1/exports/history/${id}`)
}

// 取消导出任务
export async function cancelExport(id: string) {
  return post<ApiResponse<ExportHistory>>(`/v1/exports/history/${id}/cancel`)
}

// 删除导出历史记录
export async function deleteExportHistory(id: string) {
  return del<ApiResponse<void>>(`/v1/exports/history/${id}`)
}

// 批量删除导出历史记录
export async function batchDeleteExportHistory(ids: string[]) {
  return post<ApiResponse<void>>('/v1/exports/history/batch', ids)
}

// 下载导出文件
export function getExportFileUrl(id: string) {
  return `${import.meta.env.VITE_API_BASE_URL}/v1/exports/download/${id}`
} 