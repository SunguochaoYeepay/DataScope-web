import { get, post, put, del } from './http'
import type { ApiErrorResponse } from './query'
import { isDevelopment } from '../utils/env'
import type { 
  VisualizationType,
  VisualizationConfig,
  ChartData,
  Visualization
} from '../types/visualization'

// 导入模拟数据
import { visualizations } from './mock/visualization'

/**
 * 可视化接口
 * 使用模拟数据进行前端功能开发，待后端API实现后进行替换
 */

// 模拟数据
const mockVisualizations: VisualizationConfig[] = [
  {
    id: '1',
    name: '月度订单趋势',
    description: '用户订单数量月度趋势图',
    type: 'line',
    queryId: '1',
    dimension: 'month',
    metrics: ['count', 'total'],
    title: '月度订单趋势分析',
    options: {
      xAxis: {
        type: 'category',
        nameLocation: 'end'
      },
      yAxis: {
        type: 'value'
      },
      legend: {
        data: ['订单数', '订单金额']
      }
    },
    createdAt: '2025-03-23T11:20:15',
    updatedAt: '2025-03-24T09:45:30'
  },
  {
    id: '2',
    name: '产品销售分布',
    description: '不同地区产品销售分布图',
    type: 'bar',
    queryId: '2',
    dimension: 'region',
    metrics: ['total_quantity', 'total_amount'],
    title: '产品销售区域分布',
    options: {
      xAxis: {
        type: 'category'
      },
      yAxis: {
        type: 'value'
      },
      series: [
        { name: '销售数量', type: 'bar' },
        { name: '销售金额', type: 'bar' }
      ]
    },
    createdAt: '2025-03-21T15:30:45',
    updatedAt: '2025-03-23T14:20:10'
  },
  {
    id: '3',
    name: '库存预警饼图',
    description: '低库存产品分布情况',
    type: 'pie',
    queryId: '3',
    dimension: 'product_name',
    metrics: ['current_stock'],
    title: '低库存预警',
    options: {
      series: [
        {
          type: 'pie',
          radius: '60%',
          label: {
            formatter: '{b}: {c} ({d}%)'
          }
        }
      ]
    },
    createdAt: '2025-03-22T12:10:25',
    updatedAt: '2025-03-22T12:10:25'
  }
];

// 模拟图表数据
const mockChartData: Record<string, ChartData> = {
  '1': {
    columns: [
      { name: 'month', type: 'STRING', label: '月份' },
      { name: 'count', type: 'NUMBER', label: '订单数' },
      { name: 'total', type: 'NUMBER', label: '订单金额' }
    ],
    rows: [
      { month: '2025-01', count: 12, total: 3540.5 },
      { month: '2025-02', count: 15, total: 4250.75 },
      { month: '2025-03', count: 18, total: 5120.3 },
      { month: '2025-04', count: 10, total: 2980.9 },
      { month: '2025-05', count: 14, total: 4150.25 }
    ]
  },
  '2': {
    columns: [
      { name: 'region', type: 'STRING', label: '地区' },
      { name: 'product_name', type: 'STRING', label: '产品名称' },
      { name: 'total_quantity', type: 'NUMBER', label: '销售数量' },
      { name: 'total_amount', type: 'NUMBER', label: '销售金额' }
    ],
    rows: [
      { region: '北京', product_name: '笔记本电脑', total_quantity: 120, total_amount: 600000 },
      { region: '上海', product_name: '笔记本电脑', total_quantity: 150, total_amount: 750000 },
      { region: '广州', product_name: '笔记本电脑', total_quantity: 100, total_amount: 500000 },
      { region: '北京', product_name: '智能手机', total_quantity: 200, total_amount: 800000 },
      { region: '上海', product_name: '智能手机', total_quantity: 250, total_amount: 1000000 },
      { region: '广州', product_name: '智能手机', total_quantity: 180, total_amount: 720000 }
    ]
  },
  '3': {
    columns: [
      { name: 'product_id', type: 'STRING', label: '产品ID' },
      { name: 'product_name', type: 'STRING', label: '产品名称' },
      { name: 'current_stock', type: 'NUMBER', label: '当前库存' },
      { name: 'min_stock', type: 'NUMBER', label: '最低库存' }
    ],
    rows: [
      { product_id: 'P001', product_name: '笔记本电脑', current_stock: 5, min_stock: 10 },
      { product_id: 'P005', product_name: '耳机', current_stock: 3, min_stock: 15 },
      { product_id: 'P008', product_name: '平板电脑', current_stock: 8, min_stock: 10 }
    ]
  }
};

/**
 * 获取可视化列表
 * 使用模拟数据
 */
export async function getVisualizationList() {
  // 检查是否启用mock
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if (useMock || isDevelopment()) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    // 返回模拟数据
    return Promise.resolve(mockVisualizations);
  } else {
    // 真实环境API调用
    try {
      // 此处替换为真实API调用
      // const response = await get('/api/visualization/list')
      // return response;
      
      // 当前返回模拟响应
      return Promise.reject({
        code: 501,
        message: '可视化管理API尚未实现，请设置VITE_USE_MOCK=true以使用模拟数据'
      } as ApiErrorResponse);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

/**
 * 获取可视化详情
 * 使用模拟数据
 */
export async function getVisualizationDetail(id: string | number) {
  // 检查是否启用mock
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if (useMock || isDevelopment()) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    // 查找对应ID的可视化
    const visualization = mockVisualizations.find(v => v.id === id.toString());
    if (visualization) {
      return Promise.resolve(visualization);
    } else {
      return Promise.reject({
        code: 404,
        message: '可视化不存在'
      } as ApiErrorResponse);
    }
  } else {
    // 真实环境API调用
    try {
      // 此处替换为真实API调用
      // const response = await get(`/api/visualization/detail?id=${id}`)
      // return response;
      
      // 当前返回模拟响应
      return Promise.reject({
        code: 501,
        message: '可视化管理API尚未实现，请设置VITE_USE_MOCK=true以使用模拟数据'
      } as ApiErrorResponse);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

/**
 * 创建可视化
 * 使用模拟数据
 */
export async function createVisualization(data: VisualizationConfig) {
  // 检查是否启用mock
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if (useMock || isDevelopment()) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 创建新可视化
    const newVisualization: VisualizationConfig = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 在真实环境中，这里会调用API保存数据
    // mockVisualizations.push(newVisualization);
    
    return Promise.resolve(newVisualization);
  } else {
    // 真实环境API调用
    try {
      // 此处替换为真实API调用
      // const response = await post('/api/visualization/create', data)
      // return response;
      
      // 当前返回模拟响应
      return Promise.reject({
        code: 501,
        message: '可视化管理API尚未实现，请设置VITE_USE_MOCK=true以使用模拟数据'
      } as ApiErrorResponse);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

/**
 * 更新可视化
 * 使用模拟数据
 */
export async function updateVisualization(data: VisualizationConfig) {
  // 检查是否启用mock
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if (useMock || isDevelopment()) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 400));
    // 查找对应ID的可视化
    const existingIndex = mockVisualizations.findIndex(v => v.id === data.id);
    if (existingIndex === -1) {
      return Promise.reject({
        code: 404,
        message: '可视化不存在'
      } as ApiErrorResponse);
    }
    
    // 更新可视化
    const updatedVisualization: VisualizationConfig = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // 在真实环境中，这里会调用API更新数据
    // mockVisualizations[existingIndex] = updatedVisualization;
    
    return Promise.resolve(updatedVisualization);
  } else {
    // 真实环境API调用
    try {
      // 此处替换为真实API调用
      // const response = await put('/api/visualization/update', data)
      // return response;
      
      // 当前返回模拟响应
      return Promise.reject({
        code: 501,
        message: '可视化管理API尚未实现，请设置VITE_USE_MOCK=true以使用模拟数据'
      } as ApiErrorResponse);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

/**
 * 删除可视化
 * 使用模拟数据
 */
export async function deleteVisualizationById(id: string | number) {
  // 检查是否启用mock
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if (useMock || isDevelopment()) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    // 查找对应ID的可视化
    const existingIndex = mockVisualizations.findIndex(v => v.id === id.toString());
    if (existingIndex === -1) {
      return Promise.reject({
        code: 404,
        message: '可视化不存在'
      } as ApiErrorResponse);
    }
    
    // 在真实环境中，这里会调用API删除数据
    // mockVisualizations.splice(existingIndex, 1);
    
    return Promise.resolve({ success: true });
  } else {
    // 真实环境API调用
    try {
      // 此处替换为真实API调用
      // const response = await del(`/api/visualization/delete?id=${id}`)
      // return response;
      
      // 当前返回模拟响应
      return Promise.reject({
        code: 501,
        message: '可视化管理API尚未实现，请设置VITE_USE_MOCK=true以使用模拟数据'
      } as ApiErrorResponse);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

/**
 * 获取可视化数据
 * 使用模拟数据
 */
export async function getVisualizationData(id: string | number) {
  // 检查是否启用mock
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if (useMock || isDevelopment()) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 400));
    // 查找对应ID的可视化数据
    const chartData = mockChartData[id.toString()];
    if (chartData) {
      return Promise.resolve(chartData);
    } else {
      return Promise.reject({
        code: 404,
        message: '可视化数据不存在'
      } as ApiErrorResponse);
    }
  } else {
    // 真实环境API调用
    try {
      // 此处替换为真实API调用
      // const response = await get(`/api/visualization/data?id=${id}`)
      // return response;
      
      // 当前返回模拟响应
      return Promise.reject({
        code: 501,
        message: '可视化管理API尚未实现，请设置VITE_USE_MOCK=true以使用模拟数据'
      } as ApiErrorResponse);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

/**
 * 获取新格式可视化列表
 */
export async function getVisualizations() {
  if (isDevelopment()) {
    // 开发环境使用模拟数据
    return Promise.resolve({
      code: 0,
      data: visualizations,
      message: 'success'
    })
  }
  
  return get('/api/v1/visualizations')
}

/**
 * 预览可视化
 * @param queryId 查询ID
 * @param type 可视化类型
 * @param config 配置
 */
export async function previewVisualization(queryId: string, type: VisualizationType, config: any) {
  if (isDevelopment()) {
    // 开发环境使用模拟数据，根据type返回对应的模拟数据
    const mockData: Record<string, any> = {
      bar: {
        xAxis: {
          data: ['类别1', '类别2', '类别3', '类别4', '类别5']
        },
        series: [
          {
            name: '系列1',
            type: 'bar',
            data: [120, 200, 150, 80, 70]
          }
        ]
      },
      line: {
        xAxis: {
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [120, 132, 101, 134, 90, 230]
          }
        ]
      },
      pie: {
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: '55%',
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' },
              { value: 135, name: '视频广告' },
              { value: 1548, name: '搜索引擎' }
            ]
          }
        ]
      },
      scatter: {
        xAxis: {},
        yAxis: {},
        series: [
          {
            name: '系列1',
            type: 'scatter',
            data: [
              [10, 8.04],
              [8, 6.95],
              [13, 7.58],
              [9, 8.81],
              [11, 8.33],
              [14, 9.96],
              [6, 7.24],
              [4, 4.26],
              [12, 10.84],
              [7, 4.82]
            ]
          }
        ]
      },
      radar: {
        radar: {
          indicator: [
            { name: '销售', max: 6500 },
            { name: '管理', max: 16000 },
            { name: '信息技术', max: 30000 },
            { name: '客服', max: 38000 },
            { name: '研发', max: 52000 },
            { name: '市场', max: 25000 }
          ]
        },
        series: [
          {
            name: '预算 vs 开销',
            type: 'radar',
            data: [
              {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
                name: '预算'
              },
              {
                value: [5000, 14000, 28000, 26000, 42000, 21000],
                name: '开销'
              }
            ]
          }
        ]
      }
    }
    
    // 默认返回模拟的柱状图数据
    const previewData = mockData[type] || mockData.bar
    
    return Promise.resolve({
      code: 0,
      data: previewData,
      message: 'success'
    })
  }
  
  return post('/api/v1/visualizations/preview', {
    queryId,
    type,
    config
  })
}