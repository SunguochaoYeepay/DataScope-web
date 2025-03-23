<template>
  <div class="datasource-list">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索数据源"
          style="width: 240px"
          @search="handleSearch"
        />
      </div>
      <div class="toolbar-right">
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><plus-outlined /></template>
            新建数据源
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><reload-outlined /></template>
            刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 数据源列表 -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="datasourceList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
        row-key="id"
      >
        <!-- 数据源类型 -->
        <template #type="{ text }">
          <a-tag :color="getDatasourceTypeColor(text)">
            {{ text.toUpperCase() }}
          </a-tag>
        </template>

        <!-- 连接状态 -->
        <template #status="{ text }">
          <a-badge
            :status="text === 'connected' ? 'success' : text === 'error' ? 'error' : 'default'"
            :text="getStatusText(text)"
          />
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a-tooltip title="编辑">
              <a-button type="link" @click="handleEdit(record)">
                <template #icon><edit-outlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="测试连接">
              <a-button
                type="link"
                :loading="record.id === testingId"
                @click="handleTest(record)"
              >
                <template #icon><api-outlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="同步元数据">
              <a-button
                type="link"
                :loading="record.id === syncingId"
                @click="handleSync(record)"
              >
                <template #icon><sync-outlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button type="link" danger @click="handleDelete(record)">
                <template #icon><delete-outlined /></template>
              </a-button>
            </a-tooltip>
          </a-space>
        </template>

        <!-- 空状态 -->
        <template #empty>
          <div class="empty-container">
            <a-empty description="暂无数据源">
              <template #extra>
                <a-button type="primary" @click="handleAdd">
                  <template #icon><plus-outlined /></template>
                  新建数据源
                </a-button>
              </template>
            </a-empty>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 数据源表单 -->
    <data-source-form
      :visible="formVisible"
      :editing-datasource="editingDatasource"
      @update:visible="formVisible = $event"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  ApiOutlined,
  SyncOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import { useDataSourceStore } from '@/stores/datasource';
import DataSourceForm from './DataSourceForm.vue';

// Props & Emits
const emit = defineEmits<{
  (e: 'select', datasource: any): void;
  (e: 'edit', datasource: any): void;
}>();

// Store
const datasourceStore = useDataSourceStore();

// 状态
const loading = ref(false);
const searchText = ref('');
const formVisible = ref(false);
const editingDatasource = ref<any>(null);
const testingId = ref<string | null>(null);
const syncingId = ref<string | null>(null);
const selectedRowKeys = ref<string[]>([]);

// 分页配置
const pagination = ref<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 表格列定义
const columns = [
  {
    title: '数据源名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    slots: { customRender: 'type' },
  },
  {
    title: '主机',
    dataIndex: 'host',
    key: 'host',
    width: 180,
  },
  {
    title: '数据库',
    dataIndex: 'database',
    key: 'database',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    slots: { customRender: 'status' },
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
];

// 行选择配置
const rowSelection = {
  type: 'radio' as const,
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
    const selectedDatasource = datasourceStore.datasources.find(
      (item) => item.id === keys[0]
    );
    if (selectedDatasource) {
      emit('select', selectedDatasource);
    }
  },
};

// 计算属性：数据源列表
const datasourceList = computed(() => datasourceStore.datasources);

// 生命周期钩子
onMounted(() => {
  loadDatasources();
});

// 加载数据源列表
const loadDatasources = async () => {
  try {
    loading.value = true;
    await datasourceStore.loadDatasources({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      search: searchText.value,
    });
    pagination.value.total = datasourceStore.total;
  } catch (err: any) {
    message.error('加载数据源列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadDatasources();
};

// 处理搜索
const handleSearch = () => {
  pagination.value.current = 1;
  loadDatasources();
};

// 处理刷新
const handleRefresh = () => {
  loadDatasources();
};

// 处理新增
const handleAdd = () => {
  editingDatasource.value = null;
  formVisible.value = true;
};

// 处理编辑
const handleEdit = (record: any) => {
  editingDatasource.value = record;
  formVisible.value = true;
  emit('edit', record);
};

// 处理测试连接
const handleTest = async (record: any) => {
  try {
    testingId.value = record.id;
    await datasourceStore.testConnection(record);
    message.success('连接测试成功');
  } catch (err: any) {
    message.error(err.message || '连接测试失败');
  } finally {
    testingId.value = null;
  }
};

// 处理同步元数据
const handleSync = async (record: any) => {
  try {
    syncingId.value = record.id;
    await datasourceStore.syncMetadata(record.id);
    message.success('元数据同步成功');
  } catch (err: any) {
    message.error(err.message || '元数据同步失败');
  } finally {
    syncingId.value = null;
  }
};

// 处理删除
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除数据源 "${record.name}" 吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await datasourceStore.deleteDatasource(record.id);
        message.success('数据源删除成功');
        // 如果删除的是当前选中的数据源，清空选择
        if (selectedRowKeys.value.includes(record.id)) {
          selectedRowKeys.value = [];
          emit('select', null);
        }
        loadDatasources();
      } catch (err: any) {
        message.error(err.message || '删除失败');
      }
    },
  });
};

// 处理表单提交成功
const handleSuccess = () => {
  loadDatasources();
};

// 获取数据源类型颜色
const getDatasourceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    mysql: 'blue',
    postgresql: 'green',
    clickhouse: 'orange',
  };
  return colorMap[type] || 'default';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    connected: '已连接',
    error: '连接失败',
    unknown: '未知',
  };
  return textMap[status] || status;
};
</script>

<style lang="scss" scoped>
.datasource-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
  }

  .table-container {
    flex: 1;
    overflow: hidden;
    padding: 0 24px;
  }

  :deep(.ant-table-wrapper) {
    height: 100%;
  }

  :deep(.ant-spin-nested-loading) {
    height: 100%;
  }

  :deep(.ant-spin-container) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.ant-table) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.ant-table-container) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.ant-table-body) {
    flex: 1;
    overflow: auto !important;
  }

  :deep(.ant-table-empty) {
    .ant-table-body {
      height: calc(100vh - 250px) !important;
    }
  }

  :deep(.empty-container) {
    padding: 32px 0;
  }

  :deep(.ant-table-pagination) {
    position: sticky;
    bottom: 0;
    background: #fff;
    margin: 0 !important;
    padding: 16px 0;
    border-top: 1px solid #f0f0f0;
  }
}
</style>