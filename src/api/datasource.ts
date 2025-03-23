import request from '@/utils/request';
import type { DataSource, CreateDataSourceParams, DataSourceQueryParams } from '@/types/datasource'
import type { PaginationResponse } from '@/types/api';

const API_BASE = '/api/v1/datasources'

// 获取数据源列表
export async function getDatasources(params: DataSourceQueryParams): Promise<PaginationResponse<DataSource>> {
  const searchParams = new URLSearchParams()
  if (params.current) searchParams.append('current', params.current.toString())
  if (params.size) searchParams.append('size', params.size.toString())
  if (params.keyword) searchParams.append('keyword', params.keyword)
  if (params.type) searchParams.append('type', params.type)
  if (params.sort) searchParams.append('sort', params.sort)
  if (params.order) searchParams.append('order', params.order)

  return request.get(`${API_BASE}?${searchParams.toString()}`);
}

// 创建数据源
export async function createDatasource(data: CreateDataSourceParams): Promise<DataSource> {
  return request.post(API_BASE, data);
}

// 获取单个数据源
export async function getDatasource(id: string): Promise<DataSource> {
  return request.get(`${API_BASE}/${id}`);
}

// 更新数据源（部分更新）
export async function updateDatasource(id: string, data: Partial<DataSource>): Promise<DataSource> {
  return request.patch(`${API_BASE}/${id}`, data);
}

// 更新数据源（全量更新）
export async function replaceDatasource(id: string, data: DataSource): Promise<DataSource> {
  return request.put(`${API_BASE}/${id}`, data);
}

// 删除数据源
export async function deleteDatasource(id: string): Promise<void> {
  return request.delete(`${API_BASE}/${id}`);
}

// 测试数据源连接
export async function testDatasourceConnection(id: string): Promise<boolean> {
  return request.post(`${API_BASE}/${id}/test`);
}

// 获取数据源详情
export async function getDatasourceById(id: string): Promise<DataSource> {
  return request.get(`${API_BASE}/${id}`);
}