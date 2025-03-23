<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useDataSourceStore } from '@/stores/datasource';
import { useQueryStore } from '@/stores/query';
import QueryConditions from './components/QueryConditions.vue';
import ResultColumns from './components/ResultColumns.vue';
import SortingConfig from './components/SortingConfig.vue';
import PaginationConfig from './components/PaginationConfig.vue';
import type { QueryTemplate } from '@/stores/query';

const datasourceStore = useDataSourceStore();
const queryStore = useQueryStore();

// 表单状态
const formState = ref<QueryTemplate>({
  name: '',
  description: '',
  datasourceId: '',
  sql: '',
  conditions: [],
  columns: [],
  sorting: [],
  pagination: {
    pageSize: 10,
    current: 1
  }
});

// 加载数据源列表
onMounted(async () => {
  await datasourceStore.loadDataSources({
    pageSize: 100,
    current: 1
  });
});

// 保存查询
const handleSave = async () => {
  try {
    await queryStore.saveQuery(formState.value);
  } catch (error) {
    console.error('保存查询失败:', error);
  }
};

// 执行查询
const handleExecute = async () => {
  try {
    await queryStore.executeQuery(formState.value);
  } catch (error) {
    console.error('执行查询失败:', error);
  }
};
</script>

<template>
  <div class="query-form">
    <!-- 基本信息 -->
    <div class="basic-info">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="查询名称" required>
              <a-input v-model:value="formState.name" placeholder="请输入查询名称" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="数据源" required>
              <a-select
                v-model:value="formState.datasourceId"
                placeholder="请选择数据源"
              >
                <a-select-option
                  v-for="ds in datasourceStore.dataSourceList"
                  :key="ds.id"
                  :value="ds.id"
                >
                  {{ ds.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="描述">
              <a-input
                v-model:value="formState.description"
                placeholder="请输入查询描述"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 配置选项卡 -->
    <a-tabs class="config-tabs">
      <a-tab-pane key="sql" tab="SQL 编辑器">
        <a-form-item>
          <a-textarea
            v-model:value="formState.sql"
            :rows="8"
            placeholder="请输入 SQL 语句"
          />
        </a-form-item>
      </a-tab-pane>

      <a-tab-pane key="conditions" tab="查询条件">
        <QueryConditions
          v-model:value="formState.conditions"
          :datasource-id="formState.datasourceId"
        />
      </a-tab-pane>

      <a-tab-pane key="columns" tab="结果列">
        <ResultColumns
          v-model:value="formState.columns"
          :datasource-id="formState.datasourceId"
        />
      </a-tab-pane>

      <a-tab-pane key="sorting" tab="排序">
        <SortingConfig
          v-model:value="formState.sorting"
          :datasource-id="formState.datasourceId"
        />
      </a-tab-pane>

      <a-tab-pane key="pagination" tab="分页">
        <PaginationConfig
          v-model:value="formState.pagination"
        />
      </a-tab-pane>
    </a-tabs>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <a-space>
        <a-button type="primary" @click="handleSave">保存</a-button>
        <a-button type="primary" @click="handleExecute">执行</a-button>
      </a-space>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.query-form {
  padding: 24px;

  .basic-info {
    margin-bottom: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 4px;
  }

  .config-tabs {
    background: #fff;
    border-radius: 4px;
    padding: 24px;
  }

  .form-actions {
    margin-top: 24px;
    text-align: right;
  }
}
</style>