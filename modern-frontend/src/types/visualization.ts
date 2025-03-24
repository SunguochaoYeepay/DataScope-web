/**
 * 可视化相关类型定义
 */

// 可视化图表类型
export type VisualizationType =
  | 'bar'      // 柱状图
  | 'line'     // 折线图
  | 'pie'      // 饼图
  | 'scatter'  // 散点图
  | 'radar'    // 雷达图
  | 'funnel'   // 漏斗图
  | 'heatmap'  // 热力图
  | 'treemap'  // 矩形树图
  | 'table'    // 表格
  | 'pivot'    // 透视表

// 图表样式配置
export interface StyleConfig {
  theme?: 'light' | 'dark' | 'custom'         // 主题
  backgroundColor?: string                    // 背景颜色
  textColor?: string                          // 文本颜色
  animation?: boolean                         // 是否启用动画
  legendPosition?: 'top' | 'right' | 'bottom' | 'left'  // 图例位置
  colorScheme?: string                        // 颜色方案
  [key: string]: any                          // 其他样式属性
}

// 数据映射配置
export interface DataMapping {
  xField?: string                             // X轴字段
  yFields?: string[]                          // Y轴字段
  nameField?: string                          // 名称字段
  valueField?: string                         // 值字段
  seriesField?: string                        // 系列字段
  dimensionFields?: string[]                  // 维度字段
  seriesNames?: string[]                      // 系列名称
  [key: string]: any                          // 其他映射属性
}

// 可视化实体
export interface Visualization {
  id: string                                  // 可视化ID
  name: string                                // 可视化名称
  description: string                         // 描述
  queryId: string                             // 关联的查询ID
  type: VisualizationType                     // 可视化类型
  config: any                                 // 图表配置
  styleConfig: StyleConfig                    // 样式配置
  dataMapping: DataMapping                    // 数据映射
  createdAt: string                           // 创建时间
  updatedAt: string                           // 更新时间
  createdBy: string                           // 创建人
  updatedBy: string                           // 更新人
}

// 创建可视化参数
export interface CreateVisualizationParams {
  name: string
  description: string
  queryId: string
  type: VisualizationType
  config: any
  styleConfig: StyleConfig
  dataMapping: DataMapping
}

// 更新可视化参数
export interface UpdateVisualizationParams {
  name?: string
  description?: string
  queryId?: string
  type?: VisualizationType
  config?: any
  styleConfig?: StyleConfig
  dataMapping?: DataMapping
}

// 图表预览数据
export interface PreviewData {
  xAxis?: any[]
  series?: any[]
  [key: string]: any
}

// 图表数据类型定义
export interface ChartData {
  columns: {
    name: string
    type: string
    label?: string
  }[]
  rows: Record<string, any>[]
}

// 可视化配置类型定义
export interface VisualizationConfig {
  id?: string | number
  name: string
  description?: string
  type: VisualizationType // 图表类型：bar, line, pie, scatter
  queryId: string | number
  dimension: string // 维度字段
  metrics: string[] // 指标字段
  title?: string // 图表标题
  options?: Record<string, any> // 图表配置选项
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}