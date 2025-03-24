import { get, post, put, del } from './http'

/**
 * 查询接口
 * 使用模拟数据进行前端功能开发，待后端API实现后进行替换
 */

// 查询配置类型定义
export interface Query {
  id?: string | number
  name: string
  description?: string
  datasourceId: string | number
  sqlTemplate: string
  version?: number
  status?: string
  timeout?: number
  parameters?: QueryParameter[]
  createdAt?: string
  updatedAt?: string
}

// 查询参数类型定义
export interface QueryParameter {
  name: string
  type: string // STRING, NUMBER, DATE, BOOLEAN
  defaultValue?: any
  required: boolean
  description?: string
}

// 查询结果类型定义
export interface QueryResult {
  columns: {
    name: string
    type: string
    label?: string
  }[]
  rows: Record<string, any>[]
  total: number
  executionTime?: number
}

export interface QueryParam {
  name: string
  type: string
  value?: any
  required: boolean
}

export interface QueryCreateRequest {
  name: string
  description?: string
  datasourceId: string
  sqlTemplate: string
  timeout?: number
  parameters?: QueryParam[]
}

export interface QueryUpdateRequest {
  name?: string
  description?: string
  datasourceId?: string
  sqlTemplate?: string
  timeout?: number
  parameters?: QueryParam[]
}

export interface QueryExecuteRequest {
  parameters?: Record<string, any>
  pagination?: {
    page: number
    size: number
  }
}

export interface QueryExecuteResponse {
  total: number
  columns: {
    name: string
    type: string
  }[]
  rows: any[][]
}

// API错误响应结构
export interface ApiErrorResponse {
  code: number
  message: string
}

// 模拟数据
const mockQueries: Query[] = [
  {
    id: '1',
    name: '用户订单统计',
    description: '按月统计用户订单数和金额',
    datasourceId: '97c0927a-0faa-4259-9a78-bf5a67cc7cd5',
    sqlTemplate: 'SELECT month, COUNT(*) as count, SUM(amount) as total FROM orders WHERE user_id = :userId GROUP BY month',
    version: 1,
    status: 'ACTIVE',
    timeout: 30000,
    parameters: [
      {
        name: 'userId',
        type: 'STRING',
        required: true,
        description: '用户ID'
      }
    ],
    createdAt: '2025-03-23T10:15:30',
    updatedAt: '2025-03-24T08:30:15'
  },
  {
    id: '2',
    name: '产品销售分析',
    description: '分析产品在不同地区的销售情况',
    datasourceId: '97c0927a-0faa-4259-9a78-bf5a67cc7cd5',
    sqlTemplate: 'SELECT region, product_name, SUM(quantity) as total_quantity, SUM(amount) as total_amount FROM sales WHERE date BETWEEN :startDate AND :endDate GROUP BY region, product_name',
    version: 2,
    status: 'ACTIVE',
    timeout: 60000,
    parameters: [
      {
        name: 'startDate',
        type: 'DATE',
        required: true,
        description: '开始日期'
      },
      {
        name: 'endDate',
        type: 'DATE',
        required: true,
        description: '结束日期'
      }
    ],
    createdAt: '2025-03-20T14:25:10',
    updatedAt: '2025-03-24T09:15:45'
  },
  {
    id: '3',
    name: '库存预警查询',
    description: '查询库存低于阈值的产品',
    datasourceId: 'b1c3e5d7-9a8b-7c6d-5e4f-3a2b1c0d9e8f',
    sqlTemplate: 'SELECT product_id, product_name, current_stock, min_stock FROM inventory WHERE current_stock < :threshold',
    version: 1,
    status: 'ACTIVE',
    timeout: 15000,
    parameters: [
      {
        name: 'threshold',
        type: 'NUMBER',
        defaultValue: 10,
        required: true,
        description: '库存阈值'
      }
    ],
    createdAt: '2025-03-22T11:35:00',
    updatedAt: '2025-03-22T11:35:00'
  }
];

// 模拟查询执行结果
const mockQueryResults: Record<string, QueryExecuteResponse> = {
  '1': {
    total: 5,
    columns: [
      { name: 'month', type: 'STRING' },
      { name: 'count', type: 'NUMBER' },
      { name: 'total', type: 'NUMBER' }
    ],
    rows: [
      ['2025-01', 12, 3540.50],
      ['2025-02', 15, 4250.75],
      ['2025-03', 18, 5120.30],
      ['2025-04', 10, 2980.90],
      ['2025-05', 14, 4150.25]
    ]
  },
  '2': {
    total: 6,
    columns: [
      { name: 'region', type: 'STRING' },
      { name: 'product_name', type: 'STRING' },
      { name: 'total_quantity', type: 'NUMBER' },
      { name: 'total_amount', type: 'NUMBER' }
    ],
    rows: [
      ['北京', '笔记本电脑', 120, 600000],
      ['上海', '笔记本电脑', 150, 750000],
      ['广州', '笔记本电脑', 100, 500000],
      ['北京', '智能手机', 200, 800000],
      ['上海', '智能手机', 250, 1000000],
      ['广州', '智能手机', 180, 720000]
    ]
  },
  '3': {
    total: 3,
    columns: [
      { name: 'product_id', type: 'STRING' },
      { name: 'product_name', type: 'STRING' },
      { name: 'current_stock', type: 'NUMBER' },
      { name: 'min_stock', type: 'NUMBER' }
    ],
    rows: [
      ['P001', '笔记本电脑', 5, 10],
      ['P005', '耳机', 3, 15],
      ['P008', '平板电脑', 8, 10]
    ]
  }
};

/**
 * 获取查询列表
 * 使用模拟数据
 */
export async function getQueryList() {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  // 返回模拟数据
  return Promise.resolve(mockQueries);
}

/**
 * 获取查询详情
 * 使用模拟数据
 */
export async function getQueryDetail(id: string) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  // 查找对应ID的查询
  const query = mockQueries.find(q => q.id === id);
  if (query) {
    return Promise.resolve(query);
  } else {
    return Promise.reject({
      code: 404,
      message: '查询不存在'
    } as ApiErrorResponse);
  }
}

/**
 * 创建查询
 * 使用模拟数据
 */
export async function createQuery(query: QueryCreateRequest) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  // 创建新查询
  const newQuery: Query = {
    ...query,
    id: Date.now().toString(),
    version: 1,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 在真实环境中，这里会调用API保存数据
  // mockQueries.push(newQuery);
  
  return Promise.resolve(newQuery);
}

/**
 * 更新查询
 * 使用模拟数据
 */
export async function updateQuery(id: string, query: QueryUpdateRequest) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 400));
  // 查找并更新查询
  const queryIndex = mockQueries.findIndex(q => q.id === id);
  if (queryIndex !== -1) {
    const updatedQuery: Query = {
      ...mockQueries[queryIndex],
      ...query,
      version: (mockQueries[queryIndex].version || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    
    // 在真实环境中，这里会调用API更新数据
    // mockQueries[queryIndex] = updatedQuery;
    
    return Promise.resolve(updatedQuery);
  } else {
    return Promise.reject({
      code: 404,
      message: '查询不存在'
    } as ApiErrorResponse);
  }
}

/**
 * 删除查询
 * 使用模拟数据
 */
export async function deleteQuery(id: string) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  // 查找查询
  const queryIndex = mockQueries.findIndex(q => q.id === id);
  if (queryIndex !== -1) {
    // 在真实环境中，这里会调用API删除数据
    // mockQueries.splice(queryIndex, 1);
    return Promise.resolve();
  } else {
    return Promise.reject({
      code: 404,
      message: '查询不存在'
    } as ApiErrorResponse);
  }
}

/**
 * 执行查询
 * 使用模拟数据
 */
export async function executeQuery(id: string, request: QueryExecuteRequest) {
  // 模拟API延迟和查询执行时间
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 获取模拟结果
  const result = mockQueryResults[id];
  if (result) {
    // 模拟分页
    if (request.pagination) {
      const { page, size } = request.pagination;
      const startIdx = (page - 1) * size;
      const endIdx = startIdx + size;
      return Promise.resolve({
        ...result,
        rows: result.rows.slice(startIdx, endIdx)
      });
    }
    return Promise.resolve(result);
  } else {
    return Promise.reject({
      code: 404,
      message: '查询结果不存在'
    } as ApiErrorResponse);
  }
}

// 获取查询字段信息
export async function getQueryFields(id: string | number) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 获取模拟结果
  const result = mockQueryResults[id.toString()];
  if (result) {
    return Promise.resolve({
      columns: result.columns
    });
  } else {
    return Promise.reject({
      code: 404,
      message: '查询字段不存在'
    } as ApiErrorResponse);
  }
}