<template>
  <div class="query-page">
    <!-- 页面头部 -->
    <div class="query-page-header">
      <a-space>
        <a-select
          v-model:value="selectedDatasource"
          placeholder="选择数据源"
          style="width: 200px"
          :loading="loadingDatasources"
          @change="handleDatasourceChange"
        >
          <a-select-option
            v-for="ds in datasources"
            :key="ds.id"
            :value="ds.id"
          >
            {{ ds.name }}
          </a-select-option>
        </a-select>
        
        <a-button type="primary" @click="showCreateDatasource">
          <template #icon><PlusOutlined /></template>
          新建数据源
        </a-button>
      </a-space>
      
      <a-space>
        <a-button
          type="primary"
          :disabled="!queryStore.canExecute"
          :loading="queryStore.loading"
          @click="executeQuery"
        >
          <template #icon><PlayCircleOutlined /></template>
          执行查询
        </a-button>
        
        <a-button
          danger
          :disabled="!queryStore.loading"
          @click="cancelQuery"
        >
          <template #icon><StopOutlined /></template>
          取消执行
        </a-button>
      </a-space>
    </div>

    <!-- 主体内容 -->
    <div class="query-page-content">
      <a-layout>
        <!-- 左侧边栏：查询编辑器 -->
        <a-layout-sider
          width="50%"
          class="query-editor-sider"
          :style="{ height: 'calc(100vh - 180px)' }"
        >
          <SqlEditor
            ref="sqlEditorRef"
            v-model="queryStore.currentQuery"
            :datasource-id="selectedDatasource"
            :height="editorHeight"
            :auto-complete="true"
            @execute="executeQuery"
          />
        </a-layout-sider>

        <!-- 右侧边栏：查询结果 -->
        <a-layout-content class="query-result-content">
          <a-tabs v-model:activeKey="activeTab">
            <!-- 查询结果标签页 -->
            <a-tab-pane key="result" tab="查询结果">
              <QueryResult
                :result="queryStore.queryResult"
                :loading="queryStore.loading"
                :height="resultHeight"
              />
            </a-tab-pane>

            <!-- 查询历史标签页 -->
            <a-tab-pane key="history" tab="查询历史">
              <QueryHistory />
            </a-tab-pane>

            <!-- 查询模板标签页 -->
            <a-tab-pane key="template" tab="查询模板">
              <QueryTemplate />
            </a-tab-pane>
          </a-tabs>
        </a-layout-content>
      </a-layout>
    </div>

    <!-- 新建数据源对话框 -->
    <DataSourceForm
      v-model:visible="datasourceFormVisible"
      :editing-datasource="null"
      @success="loadDatasources"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQueryStore } from '@/stores/query';
import { useDatasourceStore } from '@/stores/datasource';
import SqlEditor from '@/components/query/SqlEditor.vue';
import QueryResult from '@/components/query/QueryResult.vue';
import QueryHistory from '@/components/query/QueryHistory.vue';
import QueryTemplate from '@/components/query/QueryTemplate.vue';
import DataSourceForm from '@/components/datasource/DataSourceForm.vue';
import { PlayCircleOutlined, StopOutlined, PlusOutlined } from '@ant-design/icons-vue';

// Store
const queryStore = useQueryStore();
const datasourceStore = useDatasourceStore();

// 组件引用
const sqlEditorRef = ref();

// 状态
const selectedDatasource = ref('');
const activeTab = ref('result');
const datasourceFormVisible = ref(false);
const loadingDatasources = ref(false);

// 计算属性
const datasources = computed(() => datasourceStore.datasources);
const editorHeight = computed(() => 'calc(100vh - 180px)');
const resultHeight = computed(() => 'calc(100vh - 240px)');

// 方法
const executeQuery = () => {
  queryStore.execute();
  activeTab.value = 'result';
};

const cancelQuery = () => {
  queryStore.cancelCurrentQuery();
};

const handleDatasourceChange = (value: string) => {
  queryStore.setSelectedDatasource(value);
};

const showCreateDatasource = () => {
  datasourceFormVisible.value = true;
};

const loadDatasources = async () => {
  loadingDatasources.value = true;
  try {
    await datasourceStore.loadDatasources();
  } finally {
    loadingDatasources.value = false;
  }
};

// 生命周期钩子
onMounted(async () => {
  await loadDatasources();
});
</script>

<style lang="scss" scoped>
.query-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  gap: 16px;
  
  .query-page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  
  .query-page-content {
    flex: 1;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    
    .query-editor-sider {
      background-color: #fff;
      border-right: 1px solid #f0f0f0;
      padding: 16px;
    }
    
    .query-result-content {
      padding: 16px;
      
      :deep(.ant-tabs-content) {
        height: 100%;
        
        .ant-tabs-tabpane {
          height: 100%;
        }
      }
    }
  }
}
</style>