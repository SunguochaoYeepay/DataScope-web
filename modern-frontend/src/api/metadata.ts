import { get, post } from './http'

// API路径
const API_PATH = '/v1/metadata'

// 错误响应接口
export interface ApiErrorResponse {
  code: number
  message: string
}

// 表元数据接口
export interface TableMetadata {
  dataSourceId: string
  schema: string
  name: string
  comment?: string
  rowCount?: number
  dataSize?: number
  indexSize?: number
  indices?: IndexMetadata[]
  columnMap?: Record<string, ColumnMetadata>
  columns?: ColumnMetadata[]
}

// 列元数据接口
export interface ColumnMetadata {
  name: string
  type: string
  length?: number
  precision?: number
  nullable: boolean
  primaryKey: boolean
  ordinalPosition?: number
  defaultValue?: string
  comment?: string
  autoIncrement?: boolean
  table?: TableMetadata
}

// 索引元数据接口
export interface IndexMetadata {
  name: string
  unique: boolean
  cardinality?: number
  indexSize?: number
  columns: string[]
}

// 模拟数据: 数据表列表
const mockTables: TableMetadata[] = [
  {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'orders',
    comment: '订单信息表',
    rowCount: 128450,
    dataSize: 24560000,
    indexSize: 4120000
  },
  {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'customers',
    comment: '客户信息表',
    rowCount: 12500,
    dataSize: 3450000,
    indexSize: 850000
  },
  {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'products',
    comment: '产品信息表',
    rowCount: 5600,
    dataSize: 1250000,
    indexSize: 420000
  },
  {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'order_items',
    comment: '订单详情表',
    rowCount: 256000,
    dataSize: 42000000,
    indexSize: 7800000
  },
  {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'inventory',
    comment: '库存信息表',
    rowCount: 8900,
    dataSize: 2120000,
    indexSize: 560000
  }
]

// 模拟数据: 表详情信息
const mockDetailedTables: Record<string, TableMetadata> = {
  'test.orders': {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'orders',
    comment: '订单信息表',
    rowCount: 128450,
    dataSize: 24560000,
    indexSize: 4120000,
    indices: [
      {
        name: 'PRIMARY',
        unique: true,
        cardinality: 128450,
        indexSize: 1240000,
        columns: ['id']
      },
      {
        name: 'idx_customer_id',
        unique: false,
        cardinality: 12500,
        indexSize: 980000,
        columns: ['customer_id']
      },
      {
        name: 'idx_order_date',
        unique: false,
        cardinality: 1200,
        indexSize: 850000,
        columns: ['order_date']
      },
      {
        name: 'idx_status',
        unique: false,
        cardinality: 5,
        indexSize: 750000,
        columns: ['status']
      }
    ],
    columnMap: {
      'id': {
        name: 'id',
        type: 'bigint',
        nullable: false,
        primaryKey: true,
        ordinalPosition: 1,
        autoIncrement: true,
        comment: '订单ID'
      },
      'customer_id': {
        name: 'customer_id',
        type: 'bigint',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 2,
        comment: '客户ID'
      },
      'order_date': {
        name: 'order_date',
        type: 'datetime',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 3,
        comment: '订单日期'
      },
      'status': {
        name: 'status',
        type: 'varchar',
        length: 20,
        nullable: false,
        primaryKey: false,
        ordinalPosition: 4,
        defaultValue: 'pending',
        comment: '订单状态'
      },
      'total_amount': {
        name: 'total_amount',
        type: 'decimal',
        precision: 10,
        nullable: false,
        primaryKey: false,
        ordinalPosition: 5,
        defaultValue: '0.00',
        comment: '订单总金额'
      },
      'payment_method': {
        name: 'payment_method',
        type: 'varchar',
        length: 50,
        nullable: true,
        primaryKey: false,
        ordinalPosition: 6,
        comment: '付款方式'
      },
      'shipping_address': {
        name: 'shipping_address',
        type: 'text',
        nullable: true,
        primaryKey: false,
        ordinalPosition: 7,
        comment: '送货地址'
      },
      'notes': {
        name: 'notes',
        type: 'text',
        nullable: true,
        primaryKey: false,
        ordinalPosition: 8,
        comment: '订单备注'
      },
      'created_at': {
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 9,
        defaultValue: 'CURRENT_TIMESTAMP',
        comment: '创建时间'
      },
      'updated_at': {
        name: 'updated_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 10,
        defaultValue: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        comment: '更新时间'
      }
    }
  },
  'test.customers': {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'customers',
    comment: '客户信息表',
    rowCount: 12500,
    dataSize: 3450000,
    indexSize: 850000,
    indices: [
      {
        name: 'PRIMARY',
        unique: true,
        cardinality: 12500,
        indexSize: 450000,
        columns: ['id']
      },
      {
        name: 'idx_email',
        unique: true,
        cardinality: 12500,
        indexSize: 400000,
        columns: ['email']
      }
    ],
    columnMap: {
      'id': {
        name: 'id',
        type: 'bigint',
        nullable: false,
        primaryKey: true,
        ordinalPosition: 1,
        autoIncrement: true,
        comment: '客户ID'
      },
      'name': {
        name: 'name',
        type: 'varchar',
        length: 100,
        nullable: false,
        primaryKey: false,
        ordinalPosition: 2,
        comment: '客户姓名'
      },
      'email': {
        name: 'email',
        type: 'varchar',
        length: 100,
        nullable: false,
        primaryKey: false,
        ordinalPosition: 3,
        comment: '电子邮箱'
      },
      'phone': {
        name: 'phone',
        type: 'varchar',
        length: 20,
        nullable: true,
        primaryKey: false,
        ordinalPosition: 4,
        comment: '联系电话'
      },
      'address': {
        name: 'address',
        type: 'text',
        nullable: true,
        primaryKey: false,
        ordinalPosition: 5,
        comment: '联系地址'
      },
      'created_at': {
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 6,
        defaultValue: 'CURRENT_TIMESTAMP',
        comment: '创建时间'
      },
      'updated_at': {
        name: 'updated_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 7,
        defaultValue: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        comment: '更新时间'
      }
    }
  },
  'test.products': {
    dataSourceId: '8c676e82-0862-11f0-9cb5-3887fc5cd825',
    schema: 'test',
    name: 'products',
    comment: '产品信息表',
    rowCount: 5600,
    dataSize: 1250000,
    indexSize: 420000,
    indices: [
      {
        name: 'PRIMARY',
        unique: true,
        cardinality: 5600,
        indexSize: 250000,
        columns: ['id']
      },
      {
        name: 'idx_sku',
        unique: true,
        cardinality: 5600,
        indexSize: 170000,
        columns: ['sku']
      }
    ],
    columnMap: {
      'id': {
        name: 'id',
        type: 'bigint',
        nullable: false,
        primaryKey: true,
        ordinalPosition: 1,
        autoIncrement: true,
        comment: '产品ID'
      },
      'name': {
        name: 'name',
        type: 'varchar',
        length: 200,
        nullable: false,
        primaryKey: false,
        ordinalPosition: 2,
        comment: '产品名称'
      },
      'sku': {
        name: 'sku',
        type: 'varchar',
        length: 50,
        nullable: false,
        primaryKey: false,
        ordinalPosition: 3,
        comment: '产品编码'
      },
      'price': {
        name: 'price',
        type: 'decimal',
        precision: 10,
        nullable: false,
        primaryKey: false,
        ordinalPosition: 4,
        defaultValue: '0.00',
        comment: '产品价格'
      },
      'description': {
        name: 'description',
        type: 'text',
        nullable: true,
        primaryKey: false,
        ordinalPosition: 5,
        comment: '产品描述'
      },
      'category': {
        name: 'category',
        type: 'varchar',
        length: 50,
        nullable: true,
        primaryKey: false,
        ordinalPosition: 6,
        comment: '产品类别'
      },
      'created_at': {
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 7,
        defaultValue: 'CURRENT_TIMESTAMP',
        comment: '创建时间'
      },
      'updated_at': {
        name: 'updated_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        ordinalPosition: 8,
        defaultValue: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        comment: '更新时间'
      }
    }
  }
}

// API响应接口
interface ApiResponse<T> {
  code: number
  message: string
  data: T
  requestId?: string
  timestamp: number
}

/**
 * 获取数据源的表列表
 * @param datasourceId 数据源ID
 * @returns 表元数据列表
 */
export async function getTableList(datasourceId: string): Promise<TableMetadata[]> {
  if (!datasourceId) {
    console.error('获取表列表失败: 数据源ID不能为空')
    return []
  }

  try {
    console.log('开始获取表列表, 数据源ID:', datasourceId, '时间:', new Date().toISOString())
    
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      console.log('使用模拟数据')
      return mockTables.filter(table => table.dataSourceId === datasourceId)
    }

    // 显式指定完整路径，避免路径处理问题
    const apiPath = `v1/metadata/datasources/${datasourceId}/tables`
    console.log('请求表列表API路径:', apiPath)
    
    const response = await get<ApiResponse<TableMetadata[]>>(apiPath)
    console.log('表列表API原始响应:', response)

    if (!response) {
      console.warn('API响应为空')
      return []
    }

    if (response.code !== 200) {
      console.error('API响应错误:', response.message)
      throw new Error(response.message)
    }

    if (!response.data) {
      console.warn('API响应数据为空')
      return []
    }

    if (!Array.isArray(response.data)) {
      console.error('API响应数据格式错误，期望数组，实际:', typeof response.data)
      return []
    }

    // 移除循环引用，处理返回的数据
    const processedData = response.data.map(table => {
      // 创建表的副本
      const processedTable: TableMetadata = { ...table }
      
      // 如果存在列数组，处理每个列对象以移除循环引用
      if (Array.isArray(processedTable.columns)) {
        processedTable.columns = processedTable.columns.map(column => {
          // 创建列的副本，但不包含对表的引用
          const { table, ...columnWithoutTable } = column;
          return columnWithoutTable;
        });
      }
      
      return processedTable;
    });

    console.log('表列表数据处理完成, 共', processedData.length, '个表')
    return processedData;
  } catch (error: any) {
    console.error('获取表列表失败:', error)
    // 记录更详细的错误信息
    if (error.response) {
      console.error('API错误响应:', {
        状态码: error.response.status,
        数据: error.response.data,
        头信息: error.response.headers
      })
    } else if (error.request) {
      console.error('未收到响应:', error.request)
    } else {
      console.error('请求配置错误:', error.message)
    }
    throw new Error(`获取表列表失败: ${error.message || '未知错误'}`)
  }
}

/**
 * 获取表的元数据信息
 * @param datasourceId 数据源ID
 * @param schema 模式
 * @param tableName 表名
 * @returns 表的完整元数据信息
 */
export async function getTableMetadata(
  datasourceId: string,
  schema: string,
  tableName: string
): Promise<TableMetadata | null> {
  if (!datasourceId || !schema || !tableName) {
    console.error('获取表元数据失败: 参数不完整')
    return null
  }
  
  try {
    // 使用真实API
    if (import.meta.env.VITE_USE_MOCK !== 'true') {
      console.log('调用真实API: 获取表元数据')
      // 注意这里更新了API路径
      const response = await get<ApiResponse<TableMetadata>>(`${API_PATH}/datasources/${datasourceId}/tables/${schema}.${tableName}`)
      
      if (response && 'data' in response) {
        return response.data || null
      } else {
        return response as unknown as TableMetadata || null
      }
    }
    
    // 使用模拟数据
    console.log('使用模拟数据: 获取表元数据')
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 查找模拟数据中的表详情
    const detailedTable = mockDetailedTables[`${schema}.${tableName}`]
    if (detailedTable) {
      return {
        ...detailedTable,
        dataSourceId: datasourceId
      }
    }
    
    // 如果没有找到详情，则返回基本信息
    const table = mockTables.find(
      t => t.dataSourceId === datasourceId && t.schema === schema && t.name === tableName
    )
    
    return table || null
  } catch (error) {
    console.error('获取表元数据失败:', error)
    return null
  }
}

/**
 * 刷新数据源的元数据
 * @param datasourceId 数据源ID
 */
export async function refreshDatasourceMetadata(datasourceId: string): Promise<void> {
  try {
    // 尝试调用真实API
    if (import.meta.env.VITE_USE_MOCK !== 'true') {
      console.log('调用真实API: 刷新数据源元数据')
      // 注意这里更新了API路径
      await post<any>(`${API_PATH}/datasources/${datasourceId}/refresh`, {})
      return
    }
    
    // 使用模拟数据
    console.log('使用模拟数据: 刷新数据源元数据')
    
    // 模拟操作延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 确保数据源ID不为空
    if (!datasourceId) {
      throw new Error('数据源ID不能为空')
    }
  } catch (error) {
    console.error('刷新数据源元数据失败:', error)
    throw error
  }
}

/**
 * 刷新表的元数据
 * @param datasourceId 数据源ID
 * @param schema 模式
 * @param tableName 表名
 */
export async function refreshTableMetadata(
  datasourceId: string,
  schema: string,
  tableName: string
): Promise<void> {
  try {
    // 尝试调用真实API
    if (import.meta.env.VITE_USE_MOCK !== 'true') {
      console.log('调用真实API: 刷新表元数据')
      // 注意这里更新了API路径
      await post<any>(
        `${API_PATH}/datasources/${datasourceId}/tables/${schema}.${tableName}/refresh`,
        {}
      )
      return
    }
    
    // 使用模拟数据
    console.log('使用模拟数据: 刷新表元数据')
    
    // 模拟操作延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 确保参数合法
    if (!datasourceId || !schema || !tableName) {
      throw new Error('参数不完整: datasourceId, schema, tableName 都不能为空')
    }
    
    // 确保表存在
    const table = mockTables.find(
      t => t.dataSourceId === datasourceId && t.schema === schema && t.name === tableName
    )
    
    if (!table) {
      throw new Error(`表不存在: ${schema}.${tableName}`)
    }
  } catch (error) {
    console.error('刷新表元数据失败:', error)
    throw error
  }
}