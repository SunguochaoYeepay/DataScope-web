import { defineStore } from 'pinia';
import { http } from '@/utils/http';
import type {
  ApiResponse,
  DataSourceListResponse,
  DataSourceCreateRequest,
  DataSourceUpdateRequest,
  DataSourceResponse,
  MetadataResponse,
  TableListResponse,
  ColumnListResponse,
  PaginationParams
} from '@/types/api';

export const useDataSourceStore = defineStore('datasource', {
  state: () => ({
    loading: false,
    dataSourceList: [] as DataSourceResponse[],
    total: 0,
    currentDataSource: null as DataSourceResponse | null,
    metadata: [] as MetadataResponse[],
    tables: [] as TableListResponse[],
    columns: [] as ColumnListResponse[],
  }),

  actions: {
    async loadDataSources(params: PaginationParams) {
      this.loading = true;
      try {
        const response = await http.get<DataSourceListResponse>('/v1/datasource/list', { params });
        const { data } = response.data;
        this.dataSourceList = data.records;
        this.total = data.total;
      } catch (error) {
        console.error('Failed to load data sources:', error);
      } finally {
        this.loading = false;
      }
    },

    async createDataSource(data: DataSourceCreateRequest) {
      try {
        const response = await http.post<DataSourceResponse>('/v1/datasource/create', data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to create data source:', error);
        throw error;
      }
    },

    async updateDataSource(id: number, data: DataSourceUpdateRequest) {
      try {
        const response = await http.put<DataSourceResponse>(`/v1/datasource/${id}/update`, data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to update data source:', error);
        throw error;
      }
    },

    async deleteDataSource(id: number) {
      try {
        await http.delete<void>(`/v1/datasource/${id}/delete`);
      } catch (error) {
        console.error('Failed to delete data source:', error);
        throw error;
      }
    },

    async testConnection(data: DataSourceCreateRequest) {
      try {
        await http.post<void>('/v1/datasource/test', data);
        return true;
      } catch (error) {
        console.error('Failed to test connection:', error);
        throw error;
      }
    },

    async syncMetadata(id: number) {
      try {
        await http.post<void>(`/v1/datasource/${id}/sync`);
      } catch (error) {
        console.error('Failed to sync metadata:', error);
        throw error;
      }
    },

    async loadMetadata(id: number) {
      try {
        const response = await http.get<MetadataResponse[]>(`/v1/datasource/${id}/metadata`);
        const { data } = response.data;
        this.metadata = data;
        return data;
      } catch (error) {
        console.error('Failed to load metadata:', error);
        throw error;
      }
    },

    async loadTables(id: number, database: string) {
      try {
        const response = await http.get<TableListResponse[]>(`/v1/datasource/${id}/metadata/${database}/tables`);
        const { data } = response.data;
        this.tables = data;
        return data;
      } catch (error) {
        console.error('Failed to load tables:', error);
        throw error;
      }
    },

    async loadColumns(id: number, database: string, table: string) {
      try {
        const response = await http.get<ColumnListResponse[]>(`/v1/datasource/${id}/metadata/${database}/tables/${table}/columns`);
        const { data } = response.data;
        this.columns = data;
        return data;
      } catch (error) {
        console.error('Failed to load columns:', error);
        throw error;
      }
    }
  }
});