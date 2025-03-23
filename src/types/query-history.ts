import type { QueryParams as BaseQueryParams } from './api';

/**
 * 查询历史记录状态
 */
export enum QueryHistoryStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  CANCELLED = 'CANCELLED'
}

/**
 * 查询历史记录
 */
export interface QueryHistory {
  id: string;
  userId: string;
  dataSourceId: string;
  sql: string;
  status: QueryHistoryStatus;
  duration: number;
  rowsAffected: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 查询历史记录查询参数
 */
export interface QueryParams extends BaseQueryParams {
  status?: QueryHistoryStatus;
  dataSourceId?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * 查询历史记录响应
 */
export interface QueryHistoryResponse {
  records: QueryHistory[];
  total: number;
  size: number;
  current: number;
}

export interface QueryHistoryQuery {
  page: number;
  size: number;
  userId?: string;
  dataSourceId?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

export interface QueryStats {
  totalQueries: number;
  successQueries: number;
  failedQueries: number;
  averageExecutionTime: number;
  maxExecutionTime: number;
  minExecutionTime: number;
  totalAffectedRows: number;
}