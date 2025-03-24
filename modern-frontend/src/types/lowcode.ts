/**
 * 低代码平台相关类型定义
 */

// 查询条件组件类型
export type QueryConditionComponentType =
  | 'Input'
  | 'TextArea'
  | 'InputNumber'
  | 'Select'
  | 'DatePicker'
  | 'DateRangePicker'
  | 'TimePicker'
  | 'TimeRangePicker'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'Radio'
  | 'RadioGroup'
  | 'Switch'
  | 'Slider'
  | 'Cascader'
  | 'Transfer'
  | 'ColorPicker'
  | 'Upload'

// 查询条件操作符类型
export type QueryConditionOperatorType =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'lessThan'
  | 'lessOrEqual'
  | 'greaterThan'
  | 'greaterOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'before'
  | 'after'

// 查询条件验证规则
export interface ValidationRule {
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'url' | 'email'
  required?: boolean
  message: string
  trigger: 'blur' | 'change' | 'input'
  min?: number
  max?: number
  pattern?: string
  validator?: (rule: any, value: any, callback: (error?: Error) => void) => void
}

// 查询条件
export interface QueryCondition {
  id: string
  field: string
  label: string
  component: QueryConditionComponentType
  operator: QueryConditionOperatorType
  required: boolean
  defaultValue: any
  order: number
  props: Record<string, any>
  validation: ValidationRule[]
}

// 结果列
export interface ResultColumn {
  id: string
  field: string
  label: string
  show: boolean
  sortable: boolean
  width?: string
  fixed?: 'left' | 'right'
  order: number
}

// 分页设置
export interface PaginationSettings {
  pageSize: number
  pageSizes: number[]
  layout: string
}

// 排序设置
export interface SortSettings {
  prop: string
  order: 'ascending' | 'descending'
}

// 查询设计
export interface QueryDesign {
  id: string
  name: string
  description: string
  dataSourceId: string
  tableName: string
  conditions: QueryCondition[]
  resultColumns: ResultColumn[]
  pagination: PaginationSettings
  defaultSort?: SortSettings
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// 表字段定义
export interface TableField {
  name: string
  displayName: string
  dataType: string
  length?: number
  precision?: number
  scale?: number
  isPrimaryKey?: boolean
  isAutoIncrement?: boolean
  isNullable: boolean
  description?: string
}

// 表元数据
export interface TableMetadata {
  name: string
  displayName: string
  description?: string
  fields: TableField[]
}

// 表基本信息
export interface TableInfo {
  name: string
  displayName: string
  description?: string
}

// 查询结果
export interface QueryResult<T = any> {
  total: number
  data: T[]
}