import request from '../utils/request';
import type { QueryHistoryResponse, QueryParams } from '../types/query-history';

/**
 * 查询历史记录相关接口
 */

/**
 * 获取用户的查询历史记录
 * @param username - 用户名
 * @param params - 查询参数
 * @returns 查询历史记录列表
 */
export function getUserQueryHistories(username: string, params: QueryParams) {
  return request.get<QueryHistoryResponse>(`query-histories/user/${username}`, params);
}

/**
 * 获取查询历史详情
 * @param id - 查询历史ID
 * @returns 查询历史详情
 */
export function getQueryHistoryDetail(id: string) {
  return request.get<QueryHistoryResponse>(`query-histories/${id}`);
}

/**
 * 删除查询历史记录
 * @param id - 查询历史ID
 */
export function deleteQueryHistory(id: string) {
  return request.delete<void>(`query-histories/${id}`);
}

/**
 * 批量删除查询历史记录
 * @param ids - 查询历史ID列表
 */
export function batchDeleteQueryHistories(ids: string[]) {
  return request.delete<void>('query-histories', { ids });
}