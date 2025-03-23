import request from '@/utils/request';
import type { SqlParseResult, TableInfo } from '@/types/sql-parser';

const API_BASE = 'sql-parsers';

/**
 * 解析 SQL 语句
 * @param sql SQL 语句
 */
export function parseSql(sql: string) {
  return request.post<SqlParseResult>(`${API_BASE}/parse`, { sql });
}

/**
 * 获取表信息
 * @param datasourceId 数据源ID
 * @param schema 数据库名
 * @param table 表名
 */
export function getTableInfo(datasourceId: string, schema: string, table: string) {
  return request.get<TableInfo>(`${API_BASE}/tables/${datasourceId}/${schema}/${table}`);
}