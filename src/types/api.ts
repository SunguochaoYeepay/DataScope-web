/**
 * API 响应接口
 */
export interface ApiResponse<T> {
  code: number;        // 状态码
  message: string;     // 响应消息
  data?: T;           // 响应数据，可选
  requestId: string;   // 请求ID
  timestamp: string;   // 响应时间
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  current?: number;    // 当前页码，从1开始
  size?: number;       // 每页大小
  sort?: string;       // 排序字段
  order?: 'asc' | 'desc';  // 排序方向
  keyword?: string;    // 搜索关键词
}

/**
 * 分页响应接口
 */
export interface PaginationResponse<T> {
  records: T[];       // 数据列表
  total: number;      // 总记录数
  size: number;       // 每页大小
  current: number;    // 当前页码
}

/**
 * 文件下载响应
 */
export interface DownloadResponse {
  filename: string;    // 文件名
  blob: Blob;         // 文件内容
}

/**
 * 查询参数接口
 * @description 定义了标准的查询参数格式
 */
export interface QueryParams {
  // 分页参数
  current?: number;    // 当前页码，从1开始
  size?: number;       // 每页大小
  
  // 排序参数
  sort?: string;       // 排序字段
  order?: 'asc' | 'desc';  // 排序方向，改为标准的asc/desc
  
  // 过滤参数
  keyword?: string;    // 搜索关键词
  type?: string;       // 类型过滤
  status?: string;     // 状态过滤
  
  // 时间范围
  startTime?: string;  // 开始时间
  endTime?: string;    // 结束时间
  
  // 其他自定义参数
  [key: string]: unknown;
}