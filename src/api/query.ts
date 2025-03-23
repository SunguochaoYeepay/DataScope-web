import { http } from '@/utils/http';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/api';

export interface QueryResult {
  columns: string[];
  rows: any[];
  total: number;
  executionTime: number;
  affectedRows?: number;
}

export interface QueryError {
  message: string;
  code: string;
  details?: string;
}

export interface QueryRequest {
  sql: string;
  datasourceId: string;
  params?: Record<string, any>;
  timeout?: number;
  maxRows?: number;
}

/**
 * 执行 SQL 查询
 * @param request 查询请求参数
 * @returns 查询结果
 */
export const executeQuery = async (request: QueryRequest): Promise<QueryResult> => {
  try {
    const response: AxiosResponse<ApiResponse<QueryResult>> = await http.post('query/execute', request);
    if (!response.data.data) {
      throw new Error('查询结果为空');
    }
    return response.data.data;
  } catch (error: any) {
    const queryError: QueryError = {
      message: error.response?.data?.message || error.message || '查询执行失败',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details,
    };
    throw queryError;
  }
};

/**
 * 取消正在执行的查询
 * @param queryId 查询ID
 */
export const cancelQuery = async (queryId: string): Promise<void> => {
  await http.post(`query/${queryId}/cancel`);
};

/**
 * 获取查询历史
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 查询历史列表
 */
export const getQueryHistory = async (page: number = 1, pageSize: number = 10) => {
  const response = await http.get('query/history', {
    params: { page, pageSize },
  });
  return response.data;
};

/**
 * 保存查询为模板
 * @param name 模板名称
 * @param sql SQL语句
 * @param description 描述
 * @param tags 标签
 */
export const saveAsTemplate = async (
  name: string,
  sql: string,
  description?: string,
  tags?: string[]
) => {
  const response = await http.post('query/templates', {
    name,
    sql,
    description,
    tags,
  });
  return response.data;
};

/**
 * 获取查询模板列表
 */
export const getQueryTemplates = async () => {
  const response = await http.get('query/templates');
  return response.data;
};