import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QueryResult, QueryError, QueryRequest } from '@/api/query';
import { executeQuery, cancelQuery, getQueryHistory, saveAsTemplate, getQueryTemplates } from '@/api/query';
import { message } from 'ant-design-vue';
import { http } from '@/utils/http';

export const useQueryStore = defineStore('query', () => {
  // 状态
  const currentQuery = ref<string>('');
  const queryResult = ref<QueryResult | null>(null);
  const loading = ref(false);
  const error = ref<QueryError | null>(null);
  const selectedDatasource = ref<string>('');
  const queryHistory = ref<any[]>([]);
  const currentQueryId = ref<string>('');
  const queryTemplates = ref<any[]>([]);

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
      queryTemplates.value = result;
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

  const updateTemplate = async (
    id: string,
    name: string,
    sql: string,
    description?: string,
    tags?: string[]
  ) => {
    try {
      await http.put(`/api/v1/query/templates/${id}`, {
        name,
        sql,
        description,
        tags,
      });
      await loadQueryTemplates();
      message.success('模板更新成功');
    } catch (err: any) {
      message.error('更新模板失败: ' + err.message);
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await http.delete(`/api/v1/query/templates/${id}`);
      await loadQueryTemplates();
      message.success('模板删除成功');
    } catch (err: any) {
      message.error('删除模板失败: ' + err.message);
      throw err;
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
    queryTemplates,
    
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
    updateTemplate,
    deleteTemplate,
  };
});