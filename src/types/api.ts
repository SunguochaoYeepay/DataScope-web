/**
 * 基础查询参数
 */
export interface QueryParams {
  // 分页参数
  current?: number;    // 当前页码，从1开始
  size?: number;       // 每页大小
  
  // 排序参数
  sort?: string;       // 排序字段
  order?: 'asc' | 'desc';  // 排序方向
  
  // 过滤参数
  keyword?: string;    // 搜索关键词
  [key: string]: any;  // 其他自定义参数
}

/**
 * API 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId: string;
  timestamp: string;
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  total: number;      // 总记录数
  current: number;    // 当前页码
  size: number;        // 每页大小
  pages: number;       // 总页数
  items: T[];          // 数据列表
}

/**
 * 下载响应格式
 */
export interface DownloadResponse {
  filename: string;
  data: Blob;
}