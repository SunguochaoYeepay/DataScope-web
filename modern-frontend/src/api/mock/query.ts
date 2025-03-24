import { Query } from '../query'

// 模拟查询列表
let queryList: Query[] = [
  {
    id: 1,
    name: '用户增长趋势查询',
    datasourceId: 1,
    datasourceName: '示例数据源',
    sql: 'SELECT date, type, COUNT(*) as total FROM user_growth GROUP BY date, type',
    parameters: [
      {
        name: 'startDate',
        type: 'date',
        required: true,
        description: '开始日期'
      },
      {
        name: 'endDate',
        type: 'date',
        required: true,
        description: '结束日期'
      }
    ],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '订单金额分布查询',
    datasourceId: 1,
    datasourceName: '示例数据源',
    sql: 'SELECT order_amount_range as type, COUNT(*) as value FROM orders GROUP BY order_amount_range',
    createTime: '2024-01-02 14:30:00',
    updateTime: '2024-01-02 14:30:00'
  }
]

// 获取查询列表
export function mockGetQueryList() {
  return Promise.resolve({
    code: 200,
    data: { list: queryList },
    message: 'success'
  })
}

// 获取查询详情
export function mockGetQueryDetail(id: string | number) {
  const query = queryList.find(item => item.id === id)
  if (!query) {
    return Promise.reject({
      code: 404,
      message: '查询不存在'
    })
  }
  return Promise.resolve({
    code: 200,
    data: { data: query },
    message: 'success'
  })
}

// 创建查询
export function mockCreateQuery(data: Query) {
  const newQuery = {
    ...data,
    id: Date.now(),
    createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
    updateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
  }
  queryList.push(newQuery)
  return Promise.resolve({
    code: 200,
    data: { success: true },
    message: 'success'
  })
}

// 更新查询
export function mockUpdateQuery(data: Query) {
  const index = queryList.findIndex(item => item.id === data.id)
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '查询不存在'
    })
  }
  queryList[index] = {
    ...data,
    updateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
  }
  return Promise.resolve({
    code: 200,
    data: { success: true },
    message: 'success'
  })
}

// 删除查询
export function mockDeleteQuery(id: string | number) {
  const index = queryList.findIndex(item => item.id === id)
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '查询不存在'
    })
  }
  queryList.splice(index, 1)
  return Promise.resolve({
    code: 200,
    data: { success: true },
    message: 'success'
  })
}

// 执行查询
export function mockExecuteQuery(id: string | number, parameters?: Record<string, any>) {
  const query = queryList.find(item => item.id === id)
  if (!query) {
    return Promise.reject({
      code: 404,
      message: '查询不存在'
    })
  }
  
  // 模拟查询执行，返回随机数据
  if (query.id === 1) {
    return Promise.resolve({
      code: 200,
      data: {
        columns: [
          { name: 'date', type: 'string', label: '日期' },
          { name: 'type', type: 'string', label: '类型' },
          { name: 'total', type: 'number', label: '总数' }
        ],
        rows: [
          { date: '2024-01', type: '新增用户', total: Math.round(Math.random() * 1000) },
          { date: '2024-02', type: '新增用户', total: Math.round(Math.random() * 1000) },
          { date: '2024-03', type: '新增用户', total: Math.round(Math.random() * 1000) },
          { date: '2024-01', type: '活跃用户', total: Math.round(Math.random() * 2000) },
          { date: '2024-02', type: '活跃用户', total: Math.round(Math.random() * 2000) },
          { date: '2024-03', type: '活跃用户', total: Math.round(Math.random() * 2000) }
        ]
      },
      message: 'success'
    })
  } else if (query.id === 2) {
    return Promise.resolve({
      code: 200,
      data: {
        columns: [
          { name: 'type', type: 'string', label: '金额范围' },
          { name: 'value', type: 'number', label: '订单数量' }
        ],
        rows: [
          { type: '0-100', value: Math.round(Math.random() * 1000) },
          { type: '100-500', value: Math.round(Math.random() * 800) },
          { type: '500-1000', value: Math.round(Math.random() * 500) },
          { type: '1000-5000', value: Math.round(Math.random() * 200) },
          { type: '5000+', value: Math.round(Math.random() * 50) }
        ]
      },
      message: 'success'
    })
  }
  
  return Promise.reject({
    code: 500,
    message: '暂不支持该查询'
  })
}