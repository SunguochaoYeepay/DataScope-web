import { Datasource } from '../../api/datasource'

// 模拟数据源列表
let datasourceList: Datasource[] = [
  {
    id: 1,
    name: 'MySQL开发环境',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'dev_db',
    username: 'root',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'PostgreSQL测试库',
    type: 'postgresql',
    host: '192.168.1.100',
    port: 5432,
    database: 'test_db',
    username: 'postgres',
    createTime: '2024-01-02 14:30:00',
    updateTime: '2024-01-02 14:30:00'
  }
]

// 获取数据源列表
export function getDatasourceList() {
  return Promise.resolve({
    code: 200,
    data: { list: datasourceList },
    message: 'success'
  })
}

// 获取数据源详情
export function getDatasourceDetail(id: string | number) {
  const datasource = datasourceList.find(item => item.id === id)
  if (!datasource) {
    return Promise.reject({
      code: 404,
      message: '数据源不存在'
    })
  }
  return Promise.resolve({
    code: 200,
    data: { data: datasource },
    message: 'success'
  })
}

// 创建数据源
export function createDatasource(data: Datasource) {
  const newDatasource = {
    ...data,
    id: Date.now(),
    createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
    updateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
  }
  datasourceList.push(newDatasource)
  return Promise.resolve({
    code: 200,
    data: { success: true },
    message: 'success'
  })
}

// 更新数据源
export function updateDatasource(data: Datasource) {
  const index = datasourceList.findIndex(item => item.id === data.id)
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '数据源不存在'
    })
  }
  datasourceList[index] = {
    ...data,
    updateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
  }
  return Promise.resolve({
    code: 200,
    data: { success: true },
    message: 'success'
  })
}

// 删除数据源
export function deleteDatasource(id: string | number) {
  const index = datasourceList.findIndex(item => item.id === id)
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '数据源不存在'
    })
  }
  datasourceList.splice(index, 1)
  return Promise.resolve({
    code: 200,
    data: { success: true },
    message: 'success'
  })
}

// 测试数据源连接
export function testDatasourceConnection(data: Datasource) {
  // 模拟连接测试，随机返回成功或失败
  const isSuccess = Math.random() > 0.3
  if (isSuccess) {
    return Promise.resolve({
      code: 200,
      data: {
        success: true,
        message: '连接成功'
      },
      message: 'success'
    })
  } else {
    return Promise.reject({
      code: 500,
      message: '连接失败：网络超时'
    })
  }
}