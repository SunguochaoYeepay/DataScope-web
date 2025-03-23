/**
 * 数据源状态定义
 */
export const DATA_SOURCE_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  CONNECTION_FAILED: 'connection_failed'
} as const;

/**
 * 数据源状态显示文本
 */
export const DATA_SOURCE_STATUS_TEXT = {
  [DATA_SOURCE_STATUS.ENABLED]: '正常',
  [DATA_SOURCE_STATUS.DISABLED]: '未启用',
  [DATA_SOURCE_STATUS.CONNECTION_FAILED]: '连接失败'
} as const;

/**
 * 数据源状态样式
 */
export const DATA_SOURCE_STATUS_STYLE = {
  [DATA_SOURCE_STATUS.ENABLED]: 'success',
  [DATA_SOURCE_STATUS.DISABLED]: 'default',
  [DATA_SOURCE_STATUS.CONNECTION_FAILED]: 'error'
} as const;

export type DataSourceStatus = typeof DATA_SOURCE_STATUS[keyof typeof DATA_SOURCE_STATUS];