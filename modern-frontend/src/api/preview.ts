import { post } from './http'
import type { ColumnMetadata } from './metadata'

// 数据预览请求
export interface DataPreviewRequest {
  dataSourceId: string
  schema: string
  tableName: string
  sampleSize?: number
  includeSystemColumns?: boolean
  orderBy?: string
  desc?: boolean
  whereClause?: string
}

// 数据预览响应
export interface DataPreviewResponse {
  columns: ColumnMetadata[]
  rows: Record<string, any>[]
  totalRows: number
  sampleSize: number
  executionTime: number
}

// API响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  requestId?: string
  timestamp: number
}

// 预览数据
export function previewTableData(request: DataPreviewRequest) {
  return post<ApiResponse<DataPreviewResponse>>('/v1/preview', request)
} 