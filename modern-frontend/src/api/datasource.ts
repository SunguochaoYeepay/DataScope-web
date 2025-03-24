import { get, post, put, del } from './http'

// 数据源类型定义
export interface Datasource {
  id?: string | number
  name: string
  type: string
  host: string
  port: string | number
  databaseName: string
  username: string
  password?: string
  status?: string
  properties?: Record<string, string>
  description?: string
  createdAt?: string
  updatedAt?: string
}

// 获取数据源列表
export async function getDatasourceList() {
  // 模拟数据库连接（开发环境使用）
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('使用模拟数据: 获取数据源列表')
    // 返回模拟数据
    return [
      {
        id: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
        name: '测试数据库',
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        databaseName: 'test_db',
        username: 'test_user',
        status: 'connected',
        description: '本地测试数据库',
        createdAt: '2023-05-15T08:30:00Z',
        updatedAt: '2023-05-15T08:30:00Z'
      }
    ]
  }
  
  try {
    const response = await get<Datasource[]>('/v1/datasources')
    
    if (response && typeof response === 'object' && 'data' in response) {
      // 标准API响应格式，有data属性
      return response.data
    }
    
    // 响应本身就是数据
    return response
  } catch (error) {
    console.error('获取数据源列表失败:', error)
    return [] // 发生错误时返回空数组
  }
}

// 获取数据源详情
export function getDatasourceDetail(id: string | number) {
  return get<Datasource>(`/v1/datasources/${id}`)
}

// 获取数据源详情（别名函数，供其他模块使用）
export function getDatasourceById(id: string | number) {
  return getDatasourceDetail(id)
}

// 创建数据源
export function createDatasource(data: Datasource) {
  return post<Datasource>('/v1/datasources', data)
}

// 更新数据源
export function updateDatasource(data: Datasource) {
  return put<Datasource>(`/v1/datasources/${data.id}`, data)
}

// 删除数据源
export function deleteDatasource(id: string | number) {
  return del<void>(`/v1/datasources/${id}`)
}

// 测试数据源连接
export interface TestConnectionRequest {
  id?: string | number
  name?: string
  type: string
  host: string
  port: string | number
  databaseName: string
  username: string
  password?: string
}

// 测试数据源连接
export function testDatasourceConnection(data: TestConnectionRequest) {
  // 调试日志
  console.log('测试数据源连接请求:', data);
  
  // 如果有ID，则使用已保存的数据源测试
  if (data.id) {
    // 使用POST方法测试已有数据源
    return post<boolean>(`/v1/datasources/${data.id}/test`, {});
  }
  
  // 如果是未保存的数据源，我们需要添加一个临时名称以满足API要求
  const testData = { 
    ...data, 
    name: data.name || `测试连接_${new Date().getTime()}`
  };
  
  // 使用标准创建数据源API但添加测试参数
  return post<boolean>('/v1/datasources?action=test-connection', testData);
}