import axios from 'axios'
import http from './http'
import type { QueryDesign, QueryCondition, ResultColumn, PaginationSettings, SortSettings, TableMetadata } from '../types/lowcode'
import { isDevelopment } from '../utils/env'

// 导入模拟数据
import { queryDesigns } from './mock/lowcode/queryDesigns'
import { tableMetadata } from './mock/lowcode/tableMetadata'
import { ordersQueryResult, inventoryQueryResult, employeesQueryResult } from './mock/lowcode/queryResults'

/**
 * 获取低代码查询设计列表
 */
export async function getQueryDesigns() {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    return Promise.resolve({
      code: 0,
      data: queryDesigns,
      message: 'success'
    })
  }
  
  return http.get('/api/v1/lowcode/query-designs')
}

/**
 * 获取低代码查询设计详情
 * @param id 查询设计ID
 */
export async function getQueryDesignDetail(id: string) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    const design = queryDesigns.find(item => item.id === id)
    return Promise.resolve({
      code: 0,
      data: design,
      message: design ? 'success' : 'not found'
    })
  }
  
  return http.get(`/api/v1/lowcode/query-designs/${id}`)
}

/**
 * 创建低代码查询设计
 * @param data 查询设计数据
 */
export async function createQueryDesign(data: Partial<QueryDesign>) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    const newDesign: QueryDesign = {
      id: (queryDesigns.length + 1).toString(),
      name: data.name || '新建查询',
      description: data.description || '',
      dataSourceId: data.dataSourceId || '1',
      tableName: data.tableName || '',
      conditions: data.conditions || [],
      resultColumns: data.resultColumns || [],
      pagination: data.pagination || { pageSize: 10, pageSizes: [10, 20, 50, 100], layout: 'total, sizes, prev, pager, next, jumper' },
      defaultSort: data.defaultSort || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
    
    return Promise.resolve({
      code: 0,
      data: newDesign,
      message: 'success'
    })
  }
  
  return http.post('/api/v1/lowcode/query-designs', data)
}

/**
 * 更新低代码查询设计
 * @param id 查询设计ID
 * @param data 查询设计数据
 */
export async function updateQueryDesign(id: string, data: Partial<QueryDesign>) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    return Promise.resolve({
      code: 0,
      data: {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      message: 'success'
    })
  }
  
  return http.put(`/api/v1/lowcode/query-designs/${id}`, data)
}

/**
 * 删除低代码查询设计
 * @param id 查询设计ID
 */
export async function deleteQueryDesign(id: string) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    return Promise.resolve({
      code: 0,
      message: 'success'
    })
  }
  
  return http.delete(`/api/v1/lowcode/query-designs/${id}`)
}

/**
 * 获取数据表元数据
 * @param dataSourceId 数据源ID
 * @param tableName 表名
 */
export async function getTableMetadata(dataSourceId: string, tableName: string) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    if (tableMetadata[tableName]) {
      return Promise.resolve({
        code: 0,
        data: tableMetadata[tableName],
        message: 'success'
      })
    } else {
      return Promise.resolve({
        code: 404,
        data: null,
        message: '表不存在'
      })
    }
  }
  
  return http.get(`/api/v1/lowcode/metadata/${dataSourceId}/tables/${tableName}`)
}

/**
 * 获取数据源的所有表
 * @param dataSourceId 数据源ID
 */
export async function getAllTables(dataSourceId: string) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    const tables = Object.keys(tableMetadata).map(key => ({
      name: key,
      displayName: tableMetadata[key].displayName,
      description: tableMetadata[key].description
    }))
    
    return Promise.resolve({
      code: 0,
      data: tables,
      message: 'success'
    })
  }
  
  return http.get(`/api/v1/lowcode/metadata/${dataSourceId}/tables`)
}

/**
 * 执行查询
 * @param dataSourceId 数据源ID
 * @param tableName 表名
 * @param conditions 查询条件
 * @param resultColumns 结果列
 * @param pagination 分页信息
 * @param sort 排序信息
 */
export async function executeQuery({
  dataSourceId,
  tableName,
  conditions,
  resultColumns,
  pagination,
  sort
}: {
  dataSourceId: string
  tableName: string
  conditions: any[]
  resultColumns: any[]
  pagination: { current: number, size: number }
  sort?: { prop: string, order: 'ascending' | 'descending' }
}) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据，根据表名返回对应的模拟数据
    let result
    
    switch (tableName) {
      case 'orders':
        result = ordersQueryResult
        break
      case 'inventory':
        result = inventoryQueryResult
        break
      case 'employees':
        result = employeesQueryResult
        break
      default:
        result = { total: 0, data: [] }
    }
    
    return Promise.resolve({
      code: 0,
      data: result,
      message: 'success'
    })
  }
  
  return http.post(`/api/v1/lowcode/query/${dataSourceId}/${tableName}`, {
    conditions,
    resultColumns,
    pagination,
    sort
  })
}