<![CDATA[import { Pagination, PaginationResult } from './common';

// 查询条件配置
export interface QueryCondition {
  field: string;
  label?: string;
  type: 'input' | 'select' | 'date' | 'datetime' | 'number';
  required?: boolean;
  defaultValue?: any;
  hidden?: boolean;
  order?: number;
  options?: Array<{
    label: string;
    value: any;
  }>;
}

// 查询结果列配置
export interface QueryColumn {
  field: string;
  label?: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean';
  width?: number;
  fixed?: 'left' | 'right';
  sortable?: boolean;
  hidden?: boolean;
  format?: string;
  mask?: boolean;
}

// 查询排序配置
export interface QuerySort {
  field: string;
  order: 'ascend' | 'descend';
}

// 查询分页配置
export interface QueryPagination {
  enabled?: boolean;
  pageSize: number;
  defaultPageSize: number;
  pageSizeOptions: string[];
}

// 查询配置
export interface QueryConfig {
  conditions: QueryCondition[];
  columns: QueryColumn[];
  sorts: QuerySort[];
  pagination: QueryPagination;
}

// 查询详情
export interface QueryDetail {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  dataSourceName?: string;
  sql: string;
  config: QueryConfig;
  status: 'draft' | 'published' | 'archived';
  creator: string;
  createdAt: string;
  updatedAt: string;
}

// 查询列表项
export interface QueryListItem {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  dataSourceName?: string;
  status: 'draft' | 'published' | 'archived';
  creator: string;
  createdAt: string;
  updatedAt: string;
}

// 创建查询参数
export interface CreateQueryParams {
  name: string;
  description?: string;
  dataSourceId: string;
  sql: string;
  config: QueryConfig;
}

// 更新查询参数
export interface UpdateQueryParams extends CreateQueryParams {
  id: string;
}

// 查询列表请求参数
export interface QueryListParams extends Pagination {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
  status?: string;
}

// 查询列表响应
export interface QueryListResponse extends PaginationResult {
  list: QueryHistory[];
  total: number;
}

// 查询执行参数
export interface QueryExecuteParams {
  id: string;
  conditions?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

// 查询执行结果
export interface QueryExecutionResult {
  executionTime: number;
  affectedRows: number;
  total?: number;
  data: any[];
}

// 查询历史记录
export interface QueryHistory {
  id: string;
  queryId: string;
  userId: string;
  executionTime: number;
  startTime: string;
  endTime: string;
  status: string;
  errorMessage?: string;
  resultCount?: number;
}

// 查询历史列表参数
export interface QueryHistoryParams extends Pagination {
  queryId?: string;
  status?: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: string;
  endTime?: string;
}

// 查询历史列表响应
export interface QueryHistoryResponse extends PaginationResult {
  list: QueryHistory[];
}

/**
 * 查询模板
 */
export interface QueryTemplate {
  id: string;
  name: string;
  description?: string;
  sql: string;
  datasourceId: string;
  conditions?: Array<{
    field: string;
    label: string;
    type: string;
    required: boolean;
    defaultValue?: string;
    hidden: boolean;
    order: number;
  }>;
  resultColumns?: Array<{
    field: string;
    label: string;
    hidden: boolean;
    order: number;
  }>;
  sorting?: Array<{
    field: string;
    direction: 'asc' | 'desc';
    order: number;
  }>;
  pagination?: {
    pageSize: number;
    defaultPageSize: number;
    pageSizeOptions: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isPublic?: boolean;
  tags?: string[];
}

/**
 * 查询结果
 */
export interface QueryResult {
  columns: string[];
  rows: any[][];
  total: number;
  executionTime: number;
  affectedRows?: number;
  warnings?: string[];
  errors?: string[];
}]]>