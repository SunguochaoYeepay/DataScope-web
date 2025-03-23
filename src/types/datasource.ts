/**
 * 数据源类型
 */
export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建数据源参数
 */
export interface CreateDataSourceParams {
  name: string;
  type: string;
  config: Record<string, any>;
}

/**
 * 数据源查询参数
 */
export interface DataSourceQueryParams {
  current?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  keyword?: string;
  type?: string;
  status?: string;
}

/**
 * 数据源类型
 */
export type DatasourceType = 'mysql' | 'postgresql' | 'clickhouse';

/**
 * 数据源状态
 */
export type DatasourceStatus = 'connected' | 'error' | 'unknown';

/**
 * 数据源
 */
export interface Datasource {
  id: string;
  name: string;
  type: DatasourceType;
  description?: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  parameters?: string;
  maxConnections?: number;
  timeout?: number;
  status: DatasourceStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 数据源元数据
 */
export interface DatasourceMetadata {
  tables: Record<string, TableMetadata>;
}

/**
 * 表元数据
 */
export interface TableMetadata {
  name: string;
  comment?: string;
  engine?: string;
  charset?: string;
  columns: ColumnMetadata[];
  indexes: IndexMetadata[];
}

/**
 * 字段元数据
 */
export interface ColumnMetadata {
  name: string;
  type: string;
  isPk: boolean;
  isNullable: boolean;
  defaultValue?: string;
  comment?: string;
}

/**
 * 索引元数据
 */
export interface IndexMetadata {
  name: string;
  type: string;
  columns: string[];
}