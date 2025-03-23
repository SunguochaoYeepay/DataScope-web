import request from '@/utils/request';
import type { QueryHistory, QueryHistoryQuery, QueryHistoryResponse, QueryStats } from '@/types/query-history';

export const listQueryHistories = async (params: QueryHistoryQuery) => {
  // 转换参数
  const { userId, ...restParams } = params;
  const convertedParams: Record<string, any> = {
    ...restParams,
    pageNum: params.page,
    pageSize: params.size
  };
  delete convertedParams.page;
  delete convertedParams.size;

  const response = await request.get<QueryHistoryResponse>(`/api/v1/query-histories/user/${userId || 'test-user'}`, {
    params: convertedParams
  });

  // 转换响应
  const { records, total, pageNum, pageSize } = response.data.data;
  return {
    histories: records,
    total,
    page: pageNum,
    size: pageSize
  };
};

export function getQueryHistory(id: string) {
  return request.get<QueryHistory>(`/api/v1/query-histories/${id}`);
}

export function getQueryStats(dataSourceId?: string, startTime?: string, endTime?: string) {
  return request.get<QueryStats>('/api/v1/query-histories/stats', {
    params: { dataSourceId, startTime, endTime }
  });
}

export function getSlowQueries(threshold: number, limit: number = 10) {
  return request.get<QueryHistory[]>('/api/v1/query-histories/slow-queries', {
    params: { threshold, limit }
  });
}