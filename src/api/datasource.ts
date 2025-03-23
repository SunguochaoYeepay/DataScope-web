import request from '@/utils/request';
import type { DataSourceResponse, DataSourceCreateRequest, DataSourceUpdateRequest } from '@/types/datasource';

const API_BASE = 'datasources';

/**
 * 获取数据源列表
 */
export function getDataSourceList() {
  return request.get<DataSourceResponse[]>(API_BASE);
}

/**
 * 获取数据源详情
 * @param id 数据源ID
 */
export function getDataSourceDetail(id: string) {
  return request.get<DataSourceResponse>(`${API_BASE}/${id}`);
}

/**
 * 创建数据源
 * @param data 数据源信息
 */
export function createDataSource(data: DataSourceCreateRequest) {
  return request.post<DataSourceResponse>(API_BASE, data);
}

/**
 * 更新数据源
 * @param id 数据源ID
 * @param data 数据源信息
 */
export function updateDataSource(id: string, data: DataSourceUpdateRequest) {
  return request.put<DataSourceResponse>(`${API_BASE}/${id}`, data);
}

/**
 * 删除数据源
 * @param id 数据源ID
 */
export function deleteDataSource(id: string) {
  return request.delete<void>(`${API_BASE}/${id}`);
}

/**
 * 测试数据源连接
 * @param data 数据源信息
 */
export function testDataSourceConnection(data: DataSourceCreateRequest) {
  return request.post<void>(`${API_BASE}/test`, data);
}

/**
 * 同步数据源元数据
 * @param id 数据源ID
 */
export function syncDataSourceMetadata(id: string) {
  return request.post<void>(`${API_BASE}/${id}/sync`);
}