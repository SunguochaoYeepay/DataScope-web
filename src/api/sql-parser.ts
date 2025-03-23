import request from '@/utils/request';
import type { SQLParseRequest, SQLParseResult, TableInfo } from '@/types/sql-parser';

export function parseSql(data: SQLParseRequest) {
  return request.post<SQLParseResult>('/api/v1/sql-parsers/parse', data);
}

export function getTables(dataSourceId: string) {
  return request.get<TableInfo[]>(`/api/v1/sql-parsers/tables/${dataSourceId}`);
}

export function getTableInfo(dataSourceId: string, tableName: string) {
  return request.get<TableInfo>(`/api/v1/sql-parsers/tables/${dataSourceId}/${tableName}`);
}