import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QueryResult, QueryError, QueryRequest } from '@/api/query';
import { executeQuery, cancelQuery, getQueryHistory, saveAsTemplate, getQueryTemplates } from '@/api/query';
import { message } from 'ant-design-vue';
import { http } from '@/utils/http';
import type { QueryTemplate } from '@/types/query';
import request from '@/utils/request';
import type { ApiResponse, PaginationResponse } from '@/types/api';

const API_BASE = 'query/templates';

export const useQueryStore = defineStore('query', () => {
  // 状态
  const currentQuery = ref<string>('');
  const queryResult = ref<QueryResult | null>(null);
  const loading = ref(false);
  const error = ref<QueryError | null>(null);
  const selectedDatasource = ref<string>('');
  const queryHistory = ref<any[]>([]);
  const currentQueryId = ref<string>('');
  const templates = ref<QueryTemplate[]>([]);
  const currentTemplate = ref<QueryTemplate | null>(null);
  const fields = ref<Array<{ name: string; label: string }>>([]);

  // 计算属性
  const hasResult = computed(() => queryResult.value !== null);
  const hasError = computed(() => error.value !== null);
  const canExecute = computed(() => 
    currentQuery.value.trim() !== '' && 
    selectedDatasource.value !== ''
  );

  // 方法
  const setQuery = (sql: string) => {
    currentQuery.value = sql;
  };

  const setSelectedDatasource = (id: string) => {
    selectedDatasource.value = id;
  };

  const clearResult = () => {
    queryResult.value = null;
    error.value = null;
  };

  const execute = async (sql?: string) => {
    if (!selectedDatasource.value) {
      message.error('请选择数据源');
      return;
    }

    const querySQL = sql || currentQuery.value;
    if (!querySQL.trim()) {
      message.error('请输入 SQL 语句');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const request: QueryRequest = {
        sql: querySQL,
        datasourceId: selectedDatasource.value,
      };

      const result = await executeQuery(request);
      queryResult.value = result;
      
      // 更新查询历史
      await refreshQueryHistory();
      
      message.success('查询执行成功');
    } catch (err: any) {
      error.value = err;
      message.error(err.message || '查询执行失败');
    } finally {
      loading.value = false;
    }
  };

  const cancelCurrentQuery = async () => {
    if (currentQueryId.value) {
      try {
        await cancelQuery(currentQueryId.value);
        message.success('查询已取消');
      } catch (err: any) {
        message.error('取消查询失败: ' + err.message);
      }
    }
  };

  const refreshQueryHistory = async () => {
    try {
      const result = await getQueryHistory();
      queryHistory.value = result.items;
    } catch (err: any) {
      message.error('获取查询历史失败: ' + err.message);
    }
  };

  const loadQueryTemplates = async () => {
    try {
      const result = await getQueryTemplates();
      templates.value = result;
    } catch (err: any) {
      message.error('获取查询模板失败: ' + err.message);
    }
  };

  const saveTemplate = async (
    name: string,
    sql: string = currentQuery.value,
    description?: string,
    tags?: string[]
  ) => {
    if (!sql.trim()) {
      message.error('SQL 语句不能为空');
      return;
    }

    try {
      await saveAsTemplate(name, sql, description, tags);
      await loadQueryTemplates();
      message.success('模板保存成功');
    } catch (err: any) {
      message.error('保存模板失败: ' + err.message);
      throw err;
    }
  };

  const getTemplates = async () => {
    const { data } = await request.get<PaginationResponse<QueryTemplate>>(API_BASE);
    templates.value = data.items;
    return data.items;
  };

  const createTemplate = async (template: Omit<QueryTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    const { data } = await request.post<QueryTemplate>(API_BASE, template);
    templates.value.push(data);
    return data;
  };

  const updateTemplate = async (id: string, template: Partial<QueryTemplate>) => {
    const { data } = await request.put<QueryTemplate>(`${API_BASE}/${id}`, template);
    const index = templates.value.findIndex((t: QueryTemplate) => t.id === id);
    if (index !== -1) {
      templates.value[index] = data;
    }
    return data;
  };

  const deleteTemplate = async (id: string) => {
    await request.delete<void>(`${API_BASE}/${id}`);
    const index = templates.value.findIndex((t: QueryTemplate) => t.id === id);
    if (index !== -1) {
      templates.value.splice(index, 1);
    }
  };

  const setCurrentTemplate = (template: QueryTemplate | null) => {
    currentTemplate.value = template;
  };

  // 获取数据源字段列表
  const getFields = async (datasourceId: string) => {
    try {
      const { data } = await request.get<Array<{ name: string; label: string }>>(`/v1/datasource/${datasourceId}/fields`);
      fields.value = data;
      return data;
    } catch (err: any) {
      message.error('获取字段列表失败: ' + err.message);
      return [];
    }
  };

  return {
    // 状态
    currentQuery,
    queryResult,
    loading,
    error,
    selectedDatasource,
    queryHistory,
    templates,
    currentTemplate,
    fields,
    
    // 计算属性
    hasResult,
    hasError,
    canExecute,
    
    // 方法
    setQuery,
    setSelectedDatasource,
    clearResult,
    execute,
    cancelCurrentQuery,
    refreshQueryHistory,
    loadQueryTemplates,
    saveTemplate,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setCurrentTemplate,
    getFields,
  };
});