export interface QueryHistory {
  id: string;
  sql: string;
  dataSourceId: string;
  dataSourceName: string;
  executionTime: number;
  affectedRows: number;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  parameters?: string;
  executionIp: string;
  createdBy: string;
  createdAt: string;
}

export interface QueryHistoryQuery {
  page: number;
  size: number;
  userId?: string;
  dataSourceId?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

export interface QueryHistoryResponse {
  code: number;
  message: string;
  data: {
    records: QueryHistory[];
    total: number;
    pageNum: number;
    pageSize: number;
  };
}

export interface QueryStats {
  totalQueries: number;
  successQueries: number;
  failedQueries: number;
  averageExecutionTime: number;
  maxExecutionTime: number;
  minExecutionTime: number;
  totalAffectedRows: number;
}